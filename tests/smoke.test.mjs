import assert from 'node:assert/strict';
import { test } from 'node:test';
import { healthUrlFor, isMcpAliveStatus, rawManifestTarget } from './smoke.mjs';

test('directory and full MCP routes map to the actual sibling health endpoint', () => {
  assert.equal(healthUrlFor('https://memory.studiomeyer.io/mcp-directory'), 'https://memory.studiomeyer.io/health');
  assert.equal(healthUrlFor('https://memory.studiomeyer.io/mcp'), 'https://memory.studiomeyer.io/health');
  assert.equal(healthUrlFor('https://example.invalid/base/mcp-directory/?x=1#test'), 'https://example.invalid/base/health');
  assert.throws(() => healthUrlFor('https://example.invalid/missing'), /No known health route/);
});

test('missing routes and outages cannot count as a live MCP endpoint', () => {
  for (const code of [301, 302, 404, 405, 410, 429, 500, 503]) assert.equal(isMcpAliveStatus(code), false, String(code));
  for (const code of [200, 202, 400, 401, 403, 406, 415]) assert.equal(isMcpAliveStatus(code), true, String(code));
});

test('PR raw manifest checks the immutable PR head instead of public main or merge SHA', () => {
  const head = 'a'.repeat(40), merge = 'b'.repeat(40), local = 'c'.repeat(40);
  assert.ok(rawManifestTarget({ GITHUB_SHA: merge }, { pull_request: { head: { sha: head } } }, local).includes(`/${head}/`));
  assert.ok(rawManifestTarget({ GITHUB_SHA: merge }, null, local).includes(`/${merge}/`));
  assert.ok(rawManifestTarget({}, null, local).includes(`/${local}/`));
  assert.throws(() => rawManifestTarget({}, null, 'main'), /immutable/);
});
