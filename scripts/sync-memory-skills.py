#!/usr/bin/env python3
"""Copy the four reviewed Memory skills from the server release; check byte parity."""
import argparse
import hashlib
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'plugins/studiomeyer-memory-chat'
NAMES = ('use-studiomeyer-memory', 'memory-context-start', 'memory-lagestand', 'memory-hygiene')


def git(source, *args):
    return subprocess.check_output(['git', '-C', str(source), *args], text=True).strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-root', type=Path, required=True)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    source = args.source_root.resolve()
    content = {}
    for name in NAMES:
        path = source / 'skills' / name / 'SKILL.md'
        if path.is_symlink() or path.parent.is_symlink() or not path.is_file():
            raise ValueError('Missing or linked canonical skill: ' + name)
        raw = path.read_bytes()
        text = raw.decode('utf-8')
        if not re.search(r'^name: ' + re.escape(name) + r'\s*$', text, re.M):
            raise ValueError('Skill name does not match directory: ' + name)
        content['skills/' + name + '/SKILL.md'] = raw
    metadata = {
        'repository': 'https://github.com/madetocreate/mcp-nex',
        'revision': git(source, 'rev-parse', 'HEAD'),
        'version': json.loads((source / 'package.json').read_text())['version'],
        'sourceDirty': bool(git(source, 'status', '--porcelain', '--', 'skills', 'package.json')),
        'files': {name: {'sha256': hashlib.sha256(raw).hexdigest(), 'size': len(raw)} for name, raw in sorted(content.items())},
    }
    raw_metadata = (json.dumps(metadata, indent=2) + '\n').encode()
    expected = {**content, 'skills-source.json': raw_metadata}
    if args.check:
        for name, raw in expected.items():
            path = DEST / name
            if path.is_symlink() or not path.is_file() or path.read_bytes() != raw:
                raise ValueError('Skill source drift: ' + name)
        actual = {str(path.relative_to(DEST)) for path in (DEST / 'skills').rglob('*') if path.is_file()}
        if actual != set(content):
            raise ValueError('Unexpected or missing published skill files')
        print('Memory skill source and all packaged bytes match:', metadata['revision'])
        return
    # Only remove the superseded filename owned by this migration.
    legacy = DEST / 'skills/use-memory'
    if legacy.exists():
        if legacy.is_symlink() or sorted(p.name for p in legacy.iterdir()) != ['SKILL.md']:
            raise ValueError('Unexpected content in legacy skill directory')
        shutil.rmtree(legacy)
    for name, raw in expected.items():
        path = DEST / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(raw)
    print('Synchronized four Memory skills; sourceDirty=' + str(metadata['sourceDirty']))


if __name__ == '__main__':
    main()
