import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyKitFixture, createRunRoot, sourceRoot } from './test-support.mjs';
import { validateMarkdownLinks, validateRepository } from './validate-kit.mjs';

const runRoot = createRunRoot('validate-kit-');
let sequence = 0;
function fixture() {
  sequence += 1;
  return copyKitFixture(path.join(runRoot, `kit-${sequence}`));
}

test('repository passes validation independently of tests', () => {
  const result = validateRepository(sourceRoot);
  assert.ok(result.files >= 28);
  assert.ok(result.markdownFiles >= 18);
  assert.deepEqual(result.errors, []);
});

test('missing required file is detected', () => {
  const root = fixture();
  fs.renameSync(path.join(root, 'SKILL.md'), path.join(root, 'not-the-entry.md'));
  assert.ok(validateRepository(root).errors.some((error) => error === 'SKILL.md: required file missing'));
});

test('workflow, task prompts and optional templates cannot be omitted from distribution', () => {
  const root = fixture();
  const missing = [
    'docs/agent-workflow.md',
    'prompts/01-feature-delivery.md',
    'assets/handoff-template.md',
    'references/modular-architecture.md',
    'references/harmonyos-arkui.md',
    'prompts/12-harmonyos-arkui-feature.md',
  ];
  for (const relative of missing) {
    const file = path.join(root, relative);
    fs.renameSync(file, `${file}.omitted`);
  }
  const errors = validateRepository(root).errors;
  for (const relative of missing) {
    assert.ok(errors.includes(`${relative}: required file missing`));
  }
});

test('version mismatch is detected', () => {
  const root = fixture();
  const file = path.join(root, 'package.json');
  const metadata = JSON.parse(fs.readFileSync(file, 'utf8'));
  metadata.version = '9.9.9';
  fs.writeFileSync(file, JSON.stringify(metadata));
  const errors = validateRepository(root).errors;
  assert.ok(errors.some((error) => error.startsWith('SKILL.md: version differs')));
  assert.ok(errors.some((error) => error.startsWith('assets/project-profile-template.md: version differs')));
});

test('broken and wrong-case links fail even on case-insensitive filesystems', () => {
  const root = fixture();
  const file = path.join(root, 'README.md');
  const errors = validateMarkdownLinks(root, file, '[missing](missing.md) [case](skill.md)');
  assert.equal(errors.length, 2);
  assert.ok(errors.every((error) => error.includes('missing or case-mismatched')));
});

test('links resolve from their document and permit spaces, queries and anchors', () => {
  const root = fixture();
  fs.writeFileSync(path.join(root, 'docs', 'space name.md'), '# Test\n');
  const document = '[entry](../SKILL.md#test) [source](../references/common.md?view=1) [space](<space name.md>) [encoded](space%20name.md)';
  assert.deepEqual(validateMarkdownLinks(root, path.join(root, 'docs', 'example-adoption.md'), document), []);
});

test('external links, anchors and code samples are not treated as local files', () => {
  const root = fixture();
  const markdown = '[web](https://example.com) [anchor](#test) ` [code](missing.md) `\n```md\n[code](missing.md)\n```\n';
  assert.deepEqual(validateMarkdownLinks(root, path.join(root, 'README.md'), markdown), []);
});

test('links cannot escape repository and malformed encoding is reported', () => {
  const root = fixture();
  const absolute = ['', 'etc', 'passwd'].join('/');
  const errors = validateMarkdownLinks(root, path.join(root, 'README.md'), `[outside](../outside.md) [encoded](bad%GG.md) [absolute](${absolute})`);
  assert.equal(errors.length, 3);
});

test('personal paths and likely credentials are detected without printing secrets', () => {
  const root = fixture();
  const secret = ['sk', '-'].join('') + 'a'.repeat(40);
  const personalPath = ['C:', 'Users', 'fixture', 'private.md'].join('\\');
  fs.writeFileSync(path.join(root, 'docs', 'leak.md'), `${personalPath}\n${secret}\n`);
  const errors = validateRepository(root).errors;
  assert.ok(errors.includes('docs/leak.md: personal absolute path'));
  assert.ok(errors.includes('docs/leak.md: possible credential or private key'));
  assert.ok(!errors.join('\n').includes(secret));
});

test('ignored local artifacts do not affect validation but environment files do', () => {
  const root = fixture();
  fs.mkdirSync(path.join(root, '.tmp'));
  fs.writeFileSync(path.join(root, '.tmp', 'draft.md'), '[broken](nowhere.md)');
  assert.deepEqual(validateRepository(root).errors, []);
  fs.writeFileSync(path.join(root, '.env'), 'EXAMPLE=local');
  assert.ok(validateRepository(root).errors.includes('.env: local environment file must not be distributed'));
});

test('privacy checks cover source and configuration files without leaking matches', () => {
  const root = fixture();
  const cases = [
    ['machine.ets', ['E:', 'workspace', 'private.ets'].join('\\')],
    ['account.java', ['', 'home', 'fixture', 'source.java'].join('/')],
    ['share.xml', ['\\\\server', 'private', 'config'].join('\\')],
    ['local.properties', ['file:', '', '', 'private', 'config'].join('/')],
  ];
  for (const [name, value] of cases) fs.writeFileSync(path.join(root, name), value);
  const secret = ['github', '_pat_'].join('') + 'b'.repeat(40);
  fs.writeFileSync(path.join(root, 'credential.ets'), secret);
  const errors = validateRepository(root).errors;
  for (const [name, value] of cases) {
    assert.ok(errors.includes(`${name}: personal absolute path`));
    assert.ok(!errors.join('\n').includes(value));
  }
  assert.ok(errors.includes('credential.ets: possible credential or private key'));
  assert.ok(!errors.join('\n').includes(secret));
});

test('duplicate profile marker is detected', () => {
  const root = fixture();
  fs.appendFileSync(path.join(root, 'assets', 'project-profile-template.md'), '\n<!-- selected-stack-map -->\n');
  assert.ok(validateRepository(root).errors.some((error) => error.includes('expected exactly one stack-map marker')));
});

test('validator exits nonzero on a broken kit and zero on a valid kit', () => {
  const root = fixture();
  const script = path.join(root, 'scripts', 'validate-kit.mjs');
  const run = () => spawnSync(process.execPath, [script], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  assert.equal(run().status, 0);
  fs.appendFileSync(path.join(root, 'README.md'), '\n[broken](missing.md)\n');
  const result = run();
  assert.equal(result.status, 1);
  assert.ok(JSON.parse(result.stdout).errors.some((error) => error.includes('missing.md')));
});
