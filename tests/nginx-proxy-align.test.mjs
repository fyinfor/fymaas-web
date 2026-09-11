import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

function umiApiPrefixes() {
  const src = read('config/proxy.ts');
  const block = src.match(/const proxyTableList = \[([\s\S]*?)\];/);
  assert.ok(block, 'config/proxy.ts must export proxyTableList');
  return [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

function nginxApiLocation() {
  const src = read('docker/nginx.conf');
  const match = src.match(/location\s+~\s+(\^\S+)\s*\{/);
  assert.ok(match, 'docker/nginx.conf must have a regex location for API prefixes');
  return match[1];
}

test('production nginx forwards /proxy without a trailing slash', () => {
  const pattern = nginxApiLocation();
  const re = new RegExp(pattern);
  // Frontend search is PUT /proxy?url=... — URI path is /proxy, not /proxy/.
  // The old rule ended with proxy/ and dropped this onto try_files (405).
  assert.match('/proxy', re);
  assert.match('/proxy/', re);
  assert.match('/v1/models', re);
  assert.match('/auth/login', re);
  assert.doesNotMatch('/models/deployments', re);
});

test('nginx API prefixes stay aligned with the umi dev proxy', () => {
  const pattern = nginxApiLocation();
  const alts = pattern.match(/^\^\//);
  assert.ok(alts, `unexpected nginx location pattern: ${pattern}`);
  const group = pattern.match(/^\^\/\(([^)]+)\)/);
  assert.ok(group, `nginx location must list prefixes: ${pattern}`);
  const nginxPrefixes = group[1].split('|');
  const umiPrefixes = umiApiPrefixes().filter((name) => name !== 'static');

  assert.deepEqual(
    [...nginxPrefixes].sort(),
    [...umiPrefixes].sort(),
    'docker/nginx.conf API prefixes must match config/proxy.ts (static has its own location)'
  );
  assert.match(
    pattern,
    /\/\|\$\)$/,
    'nginx regex must accept both /<prefix> and /<prefix>/... or ModelScope search 405s'
  );
});

test('ModelScope search still calls /proxy?url= (no extra slash)', () => {
  const src = read('src/pages/llmodels/apis/index.ts');
  assert.match(
    src,
    /`\/proxy\?url=\$\{encodeURIComponent\(url\)\}`/,
    'setProxyUrl must keep /proxy?url= so it matches the backend prefix and nginx rule'
  );
});
