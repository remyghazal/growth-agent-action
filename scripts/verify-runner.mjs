import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve('runner');
const release = JSON.parse(readFileSync(path.join(root, 'release.json'), 'utf8'));
function hashes(dir, prefix = '') {
  return Object.fromEntries(readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const relative = prefix + entry.name;
    assert(!entry.isSymbolicLink(), 'Symlinks are forbidden');
    if (relative === 'release.json') return [];
    return entry.isDirectory() ? Object.entries(hashes(path.join(dir, entry.name), relative + '/')) : [[relative, createHash('sha256').update(readFileSync(path.join(dir, entry.name))).digest('hex')]];
  }));
}
assert.deepEqual(hashes(root), release.files, 'Staged distribution checksum mismatch');
assert.match(release.sourceCommit, /^[a-f0-9]{40}$/);
assert.deepEqual(Object.keys(release.files).sort(), ['README.md', 'dist/assets/skills/implement-experiment/SKILL.md', 'dist/cli.js', 'package.json']);
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.equal(pkg.name, '@growthagent/ci');
assert.equal(pkg.version, release.version);
assert.equal(pkg.repository.url, 'git+https://github.com/remyghazal/growth-agent-action.git');
assert.equal(pkg.repository.directory, 'runner');
assert.equal(pkg.scripts, undefined);
assert.equal(pkg.dependencies, undefined);
assert.equal(pkg.devDependencies, undefined);
assert.deepEqual(pkg.files, ['dist']);
for (const action of ['implement', 'apply', 'verify']) {
  const pins = [...readFileSync(`${action}/action.yml`, 'utf8').matchAll(/@growthagent\/ci@([\d.]+)/g)];
  assert(pins.length > 0 && pins.every((pin) => pin[1] === pkg.version), `${action} pin mismatch`);
}
const syntax = spawnSync(process.execPath, ['--check', path.join(root, 'dist/cli.js')], { encoding: 'utf8' });
assert.equal(syntax.status, 0, syntax.stderr);
// Exercise the installed entry point without permitting any customer action.
const smoke = spawnSync(process.execPath, [path.join(root, 'dist/cli.js'), 'verify'], { env: { PATH: process.env.PATH }, encoding: 'utf8' });
assert.notEqual(smoke.status, 0);
assert.match(smoke.stderr, /Missing required environment variable/);
console.log(`Verified distribution ${pkg.version} from ${release.sourceCommit}`);
