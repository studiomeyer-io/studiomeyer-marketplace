#!/usr/bin/env python3
"""Build secret-free directory ZIPs from explicit allowlists and verify them."""
import argparse
import hashlib
import io
import json
import re
import stat
import struct
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'plugins' / 'studiomeyer-memory-chat'
COMMON = [
    'LICENSE', 'README.md', 'assets/icon.png',
    'skills/use-memory/SKILL.md',
    'skills/memory-context-start/SKILL.md',
    'skills/memory-lagestand/SKILL.md',
    'skills/memory-hygiene/SKILL.md',
]
FILES = {
    'claude': ['.claude-plugin/plugin.json', '.mcp.json', *COMMON],
    'openai': ['plugin.json', 'mcp.json', *COMMON],
}
SECRET = re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[A-Z0-9]{16}|eyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,})\b')
FORBIDDEN_KEYS = {'clientSecret', 'client_secret', 'access_token', 'refresh_token', 'test_credentials', 'reviewer_instructions'}


def inspect_json(value):
    if isinstance(value, dict):
        for key, item in value.items():
            if key in FORBIDDEN_KEYS:
                raise ValueError('Credential or private review field in package: ' + key)
            if key == 'headers' and item:
                raise ValueError('Nonempty MCP headers are forbidden in public packages')
            inspect_json(item)
    elif isinstance(value, list):
        for item in value:
            inspect_json(item)
    elif isinstance(value, str) and value.startswith(('https://', 'http://')):
        from urllib.parse import urlsplit
        url = urlsplit(value)
        if url.username or url.password:
            raise ValueError('URL contains embedded credentials')


def verify_archive(blob, kind):
    with zipfile.ZipFile(io.BytesIO(blob)) as archive:
        names = archive.namelist()
        if len(names) != len(set(names)) or set(names) != set(FILES[kind]):
            raise ValueError('ZIP entry allowlist mismatch')
        for entry in archive.infolist():
            if stat.S_ISLNK(entry.external_attr >> 16):
                raise ValueError('ZIP symlink is forbidden')
            raw = archive.read(entry)
            if not entry.filename.endswith('.png'):
                text = raw.decode('utf-8')
                if SECRET.search(text):
                    raise ValueError('Suspected secret in ' + entry.filename)
                if '\u2014' in text:
                    raise ValueError('Em dash in shipped text')
                if entry.filename.endswith('.json'):
                    inspect_json(json.loads(text))
        icon = archive.read('assets/icon.png')
        if icon[:8] != b'\x89PNG\r\n\x1a\n':
            raise ValueError('Expected PNG icon')
        width, height = struct.unpack('>II', icon[16:24])
        if not 48 <= width == height <= 4096 or len(icon) > 5 * 1024 * 1024:
            raise ValueError('Icon dimensions or file size invalid')
        manifest_name = 'plugin.json' if kind == 'openai' else '.claude-plugin/plugin.json'
        manifest = json.loads(archive.read(manifest_name))
        if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]{0,63}', manifest['name']):
            raise ValueError('Invalid plugin name')
        if not re.fullmatch(r'\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?', manifest['version']):
            raise ValueError('Invalid plugin version')
        mcp_name = 'mcp.json' if kind == 'openai' else '.mcp.json'
        servers = json.loads(archive.read(mcp_name))['mcpServers']
        if len(servers) != 1:
            raise ValueError('Expected one directory MCP server')
        server = next(iter(servers.values()))
        if server['url'] != 'https://memory.studiomeyer.io/mcp':
            raise ValueError('Wrong MCP endpoint')
        if kind == 'openai':
            if server['type'] != 'streamable-http':
                raise ValueError('Portable MCP transport must be streamable-http')
            auth = server['extensions']['com.openai']['auth']
            if auth['type'] != 'oauth' or auth['client'] != {'mode': 'dcr'}:
                raise ValueError('Expected OAuth DCR without client credentials')
            if auth.get('resource') != server['url']:
                raise ValueError('OAuth resource must match directory endpoint')
            extension = manifest['extensions']['com.openai']
            if 'hooks' in extension or 'onboardingSkill' in extension or 'apps' in extension:
                raise ValueError('Directory package must not add bootstrap surfaces')
            interface = extension['interface']
            for key, limit in [('displayName', 30), ('shortDescription', 30), ('developerName', 80), ('longDescription', 4000)]:
                text = interface[key]
                if not text.strip() or len(text) > limit or (key != 'longDescription' and '\n' in text):
                    raise ValueError('Invalid listing field: ' + key)
            for key in ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']:
                from urllib.parse import urlsplit
                value = interface[key]
                url = urlsplit(value)
                if url.scheme != 'https' or not url.hostname or len(value) > 1024:
                    raise ValueError('Invalid listing URL: ' + key)
            for key in ['logo', 'composerIcon']:
                if interface[key] != './assets/icon.png':
                    raise ValueError('Unexpected icon path')
            cases = extension['review']['test_cases']
            if len(cases['positive']) != 5 or len(cases['negative']) != 3:
                raise ValueError('Expected five positive and three negative test cases')
            for case in cases['positive']:
                for key in ['description', 'prompt', 'tools_triggered', 'expected_behavior']:
                    if not isinstance(case.get(key), str) or not case[key].strip():
                        raise ValueError('Incomplete positive test case')
            for case in cases['negative']:
                for key in ['description', 'prompt', 'expected_behavior']:
                    if not isinstance(case.get(key), str) or not case[key].strip():
                        raise ValueError('Incomplete negative test case')
        elif server['type'] != 'http':
            raise ValueError('Claude MCP transport must be http')
        return {'entries': names, 'icon': {'width': width, 'height': height}, 'manifestName': manifest['name'], 'version': manifest['version']}


def zip_files(content):
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, raw in sorted(content.items()):
            entry = zipfile.ZipInfo(name, (2026, 10, 11, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = (stat.S_IFREG | 0o644) << 16
            archive.writestr(entry, raw)
    return buffer.getvalue()


def selftest(content, kind):
    for label, mutation in [
        ('unexpected-file', lambda c: c.update({'unexpected.env': b'test'})),
        ('private-key', lambda c: c.update({'README.md': b'-----BEGIN PRIVATE KEY-----'})),
        ('duplicate-secret-field', lambda c: c.update({('mcp.json' if kind == 'openai' else '.mcp.json'): b'{"access_token":"synthetic-test-only"}'})),
    ]:
        changed = dict(content)
        mutation(changed)
        try:
            verify_archive(zip_files(changed), kind)
        except ValueError:
            print('Self-test rejected:', kind, label)
        else:
            raise ValueError('Guard failed to reject ' + label)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    results = []
    for kind, files in FILES.items():
        content = {}
        for name in files:
            source = ROOT / name
            if source.is_symlink() or not source.is_file():
                raise ValueError('Package source missing or symlink: ' + name)
            content[name] = source.read_bytes()
        blob = zip_files(content)
        result = verify_archive(blob, kind)
        if args.self_test:
            selftest(content, kind)
        path = args.output_dir / ('studiomeyer-memory-' + kind + '-' + result['version'] + '.zip')
        path.write_bytes(blob)
        result.update({'path': str(path), 'sha256': hashlib.sha256(blob).hexdigest(), 'bytes': len(blob), 'kind': kind})
        results.append(result)
        print('Built and checked:', path.name, result['sha256'])
    (args.output_dir / 'package-audit.json').write_text(json.dumps(results, indent=2) + '\n')


if __name__ == '__main__':
    main()
