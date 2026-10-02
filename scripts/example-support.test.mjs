import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { newRun, copySources, expectedFailure, digest, runTool } from './example-support.mjs';
import { protectedChanges, prepare, grade } from './evaluate-agent.mjs';

test('negative gate requires an actual failing process and its rule marker', () => {
  assert.equal(expectedFailure({ status: 1, output: 'MemberName', infrastructureError: false }, 'MemberName'), true);
  for (const result of [
    { status: 0, output: 'MemberName' }, { status: 1, output: 'network failed' },
    { status: null, output: 'MemberName' }, { status: 1, output: 'MemberName', infrastructureError: true },
  ]) assert.equal(expectedFailure(result, 'MemberName'), false);
});

test('source copies omit dependencies and build artifacts and never overwrite', () => {
  const run = newRun('tests', 'source-copy');
  const source = path.join(run, 'source');
  fs.mkdirSync(path.join(source, 'target'), { recursive: true });
  fs.writeFileSync(path.join(source, 'target', 'generated.txt'), 'build');
  fs.writeFileSync(path.join(source, 'source.txt'), 'source');
  const destination = path.join(run, 'copy');
  copySources(source, destination);
  assert.deepEqual(fs.readdirSync(destination), ['source.txt']);
  assert.throws(() => copySources(source, destination), /already exists/);
});

test('protected file hashes detect both changed and deleted user/config files', () => {
  const run = newRun('tests', 'protected');
  const file = path.join(run, 'note.txt');
  fs.writeFileSync(file, 'keep');
  const baseline = { 'note.txt': digest(file) };
  assert.deepEqual(protectedChanges(run, baseline), []);
  fs.writeFileSync(file, 'changed');
  assert.deepEqual(protectedChanges(run, baseline), ['note.txt']);
  fs.unlinkSync(file);
  assert.deepEqual(protectedChanges(run, baseline), ['note.txt']);
});

test('tool runner preserves whitespace/apostrophes and nonzero exit status', () => {
  const run = newRun('tests', 'process');
  const result = runTool(process.execPath, ['-e', "console.log(\"space and 'quote'\"); process.exit(7)"], run, path.join(run, 'process.log'));
  assert.equal(result.status, 7);
  assert.match(result.output, /space and 'quote'/);
});

test('evaluation protects baseline tests and user notes and rejects changed gates before builds', () => {
  const run = prepare('java-summary');
  const manifest = JSON.parse(fs.readFileSync(path.join(run, 'manifest.json')));
  assert.ok(manifest.protectedFiles['pom.xml']);
  assert.ok(manifest.protectedFiles['local-notes.txt']);
  assert.ok(manifest.protectedFiles['src/test/java/com/example/order/ArchitectureTest.java']);
  assert.equal(manifest.protectedFiles['src/main/java/com/example/order/application/OrderService.java'], undefined);
  fs.appendFileSync(path.join(run, 'project', 'pom.xml'), '\n<!-- changed -->');
  const result = grade(run);
  assert.deepEqual(result.protectedViolations, ['pom.xml']);
  assert.equal(result.checksPassed, false);
  assert.equal(result.evidenceDirectory, undefined);
});

test('evaluation rejects unknown cases and paths outside the prepared run directory', () => {
  assert.throws(() => prepare('not-a-case'), /Unknown evaluation case/);
  assert.throws(() => grade(newRun('tests', 'outside-evals')), /direct run directory/);
});

test('evaluation rejects added configuration files without executing them', () => {
  const run = prepare('uni-search');
  fs.writeFileSync(path.join(run, 'project', 'override.config.mjs'), 'throw new Error("must not execute");');
  const result = grade(run);
  assert.deepEqual(result.unauthorizedAdditions, ['override.config.mjs']);
  assert.equal(result.evidenceDirectory, undefined);
});
