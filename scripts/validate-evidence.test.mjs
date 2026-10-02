import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { createRunRoot, sourceRoot } from './test-support.mjs';
import { evidenceExitCode, validateEvidence } from './validate-evidence.mjs';

const runRoot = createRunRoot('evidence-');
const script = path.join(sourceRoot, 'scripts', 'validate-evidence.mjs');
function fixture() {
  const root = fs.mkdtempSync(path.join(runRoot, 'case-'));
  const log = 'Synthetic validator fixture: two checks, zero failures. Not an application test result.\n';
  fs.writeFileSync(path.join(root, 'check.log'), log);
  const artifact = { path: 'check.log', sha256: createHash('sha256').update(log).digest('hex') };
  const plan = { schemaVersion: 1, subject: 'snapshot-1', risk: 'standard', drivers: ['Contract change'], checks: [
    { id: 'api', kind: 'command', scope: 'Changed API', applicable: true },
    { id: 'review', kind: 'review', scope: 'Changed architecture', applicable: true },
    { id: 'device', kind: 'review', scope: 'Device interaction', applicable: false, reason: 'Server-only change' },
  ] };
  const report = { schemaVersion: 1, subject: 'snapshot-1', results: [
    { id: 'api', status: 'pass', summary: 'Synthetic command result', execution: {
      command: 'node never-execute-this.mjs', cwd: '.', tool: 'fixture', version: '1', exitCode: 0, checked: 2, failed: 0, skipped: 0,
    }, artifacts: [artifact] },
    { id: 'review', status: 'pass', summary: 'Synthetic self-review', review: { mode: 'self', checked: 1, failed: 0 }, artifacts: [artifact] },
    { id: 'device', status: 'not-applicable', summary: 'Server-only change', artifacts: [] },
  ] };
  const options = { root, planFile: 'plan.json', reportFile: 'report.json', subject: 'snapshot-1' };
  const save = () => {
    fs.writeFileSync(path.join(root, options.planFile), JSON.stringify(plan));
    fs.writeFileSync(path.join(root, options.reportFile), JSON.stringify(report));
  };
  const run = () => { save(); return validateEvidence(options); };
  return { root, plan, report, options, save, run };
}

test('complete command and review records pass; self-review remains explicit', () => {
  const f = fixture();
  const result = f.run();
  assert.equal(result.verdict, 'passed');
  assert.equal(result.totals.pass, 2);
  assert.equal(evidenceExitCode(result), 0);
  assert.equal(result.assurance, 'record-consistency-and-artifact-integrity-only');
});

test('command nonzero and semantic failures both fail, not invalid', () => {
  for (const detail of [{ exitCode: 1 }, { failed: 1 }]) {
    const f = fixture();
    Object.assign(f.report.results[0].execution, detail);
    f.report.results[0].status = 'fail';
    const result = f.run();
    assert.equal(result.verdict, 'failed');
    assert.equal(evidenceExitCode(result), 1);
  }
  const f = fixture();
  f.report.results[1].review.failed = 1;
  f.report.results[1].status = 'fail';
  assert.equal(f.run().verdict, 'failed');
});

test('blocked and unrun checks cannot become success', () => {
  for (const status of ['blocked', 'not-run']) {
    const f = fixture();
    f.report.results[0] = { id: 'api', status, summary: 'Required environment unavailable', artifacts: [] };
    const result = f.run();
    assert.equal(result.verdict, 'incomplete');
    assert.equal(evidenceExitCode(result), 1);
  }
});

const invalidCases = [
  ['empty plan', (f) => { f.plan.checks = []; }],
  ['empty results', (f) => { f.report.results = []; }],
  ['missing result', (f) => { f.report.results.pop(); }],
  ['unknown result', (f) => { f.report.results[0].id = 'unknown'; }],
  ['duplicate result', (f) => { f.report.results[1].id = 'api'; }],
  ['duplicate check', (f) => { f.plan.checks[1].id = 'api'; }],
  ['unknown field', (f) => { f.report.results[0].approved = true; }],
  ['null report result', (f) => { f.report.results[0] = null; }],
  ['missing risk drivers', (f) => { f.plan.drivers = []; }],
  ['schema version', (f) => { f.plan.schemaVersion = 2; }],
  ['stale subject', (f) => { f.report.subject = 'snapshot-0'; }],
  ['untrusted expected subject', (f) => { f.options.subject = 'snapshot-2'; }],
  ['zero coverage', (f) => { f.report.results[0].execution.checked = 0; }],
  ['only skipped tests', (f) => { f.report.results[0].execution.checked = 0; f.report.results[0].execution.skipped = 5; }],
  ['hidden failure', (f) => { f.report.results[0].execution.failed = 1; }],
  ['hidden nonzero exit', (f) => { f.report.results[0].execution.exitCode = 1; }],
  ['failed without failure', (f) => { f.report.results[0].status = 'fail'; }],
  ['noninteger count', (f) => { f.report.results[0].execution.checked = 1.5; }],
  ['count overflow', (f) => { f.report.results[0].execution.checked = Number.MAX_SAFE_INTEGER + 1; }],
  ['count inconsistency', (f) => { f.report.results[0].execution.failed = 9; }],
  ['missing version', (f) => { delete f.report.results[0].execution.version; }],
  ['unknown status', (f) => { f.report.results[0].status = 'green'; }],
  ['wrong evidence kind', (f) => { f.plan.checks[0].kind = 'review'; }],
  ['unrun with completed execution', (f) => { f.report.results[0].status = 'not-run'; }],
  ['unauthorized applicability change', (f) => { f.report.results[0] = { id: 'api', status: 'not-applicable', summary: 'Skip it', artifacts: [] }; }],
  ['missing planned reason', (f) => { delete f.plan.checks[2].reason; }],
  ['empty summary', (f) => { f.report.results[0].summary = ' '; }],
  ['missing artifacts', (f) => { f.report.results[0].artifacts = []; }],
  ['duplicate artifact', (f) => { f.report.results[0].artifacts.push(f.report.results[0].artifacts[0]); }],
  ['invalid digest', (f) => { f.report.results[0].artifacts[0].sha256 = 'not-a-digest'; }],
  ['empty artifact', (f) => { fs.writeFileSync(path.join(f.root, 'check.log'), ''); }],
  ['oversized artifact', (f) => { fs.writeFileSync(path.join(f.root, 'check.log'), Buffer.alloc(16 * 1024 * 1024 + 1)); }],
  ['missing file', (f) => { fs.unlinkSync(path.join(f.root, 'check.log')); }],
  ['changed file', (f) => { fs.appendFileSync(path.join(f.root, 'check.log'), 'changed'); }],
  ['case mismatch', (f) => { f.report.results[0].artifacts[0].path = 'Check.log'; }],
  ['path traversal', (f) => { f.report.results[0].artifacts[0].path = '../check.log'; }],
  ['absolute artifact', (f) => { f.report.results[0].artifacts[0].path = f.root; }],
  ['escaping working directory', (f) => { f.report.results[0].execution.cwd = '../outside'; }],
];
for (const [name, mutate] of invalidCases) {
  test(`rejects ${name}`, () => {
    const f = fixture();
    mutate(f);
    f.save();
    const result = validateEvidence(f.options);
    assert.equal(result.verdict, 'invalid');
    assert.equal(evidenceExitCode(result), 2);
    assert.ok(!JSON.stringify(result).includes(f.root));
  });
}

test('input paths must stay inside the root and use exact case', () => {
  const f = fixture();
  f.save();
  for (const planFile of ['../outside.json', path.join(f.root, 'plan.json'), 'Plan.json']) {
    assert.equal(validateEvidence({ ...f.options, planFile }).verdict, 'invalid');
  }
});

test('failed result does not hide another blocked check', () => {
  const f = fixture();
  f.report.results[0].execution.exitCode = 1;
  f.report.results[0].status = 'fail';
  f.report.results[1] = { id: 'review', status: 'blocked', summary: 'Review environment unavailable', artifacts: [] };
  const result = f.run();
  assert.equal(result.verdict, 'failed');
  assert.equal(result.totals.blocked, 1);
  assert.equal(result.totals.fail, 1);
});

test('portable artifact paths can contain spaces and non-ASCII names', () => {
  const f = fixture();
  const relative = 'reports with spaces/\u68c0\u67e5.log';
  fs.mkdirSync(path.join(f.root, 'reports with spaces'));
  fs.renameSync(path.join(f.root, 'check.log'), path.join(f.root, relative));
  f.report.results[0].artifacts[0].path = relative;
  assert.equal(f.run().verdict, 'passed');
});

test('all-inapplicable plan is not a successful validation', () => {
  const f = fixture();
  f.plan.checks = [f.plan.checks[2]];
  f.report.results = [f.report.results[2]];
  assert.equal(f.run().verdict, 'invalid');
});

test('symlink or junction artifacts cannot reach outside the root', (t) => {
  const f = fixture();
  const outside = fs.mkdtempSync(path.join(runRoot, 'outside-'));
  fs.writeFileSync(path.join(outside, 'check.log'), 'outside');
  try { fs.symlinkSync(outside, path.join(f.root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) return t.skip('Link creation unavailable'); throw error; }
  f.report.results[0].artifacts[0].path = 'linked/check.log';
  assert.equal(f.run().verdict, 'invalid');
});

test('CLI is read-only, never executes a recorded command, and returns actual status', () => {
  const f = fixture();
  f.report.results[0].execution.command = `${process.execPath} -e "require('fs').writeFileSync('EXECUTED','bad')"`;
  f.save();
  const before = fs.readdirSync(f.root).map((name) => [name, fs.readFileSync(path.join(f.root, name), 'utf8')]);
  const result = spawnSync(process.execPath, [script, '--root', f.root, '--plan', 'plan.json', '--report', 'report.json', '--subject', 'snapshot-1'], {
    cwd: f.root, encoding: 'utf8', windowsHide: true, timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).verdict, 'passed');
  assert.deepEqual(fs.readdirSync(f.root).map((name) => [name, fs.readFileSync(path.join(f.root, name), 'utf8')]), before);
});

test('CLI rejects bad options and malformed JSON without echoing input', () => {
  const f = fixture();
  f.save();
  const base = ['--root', f.root, '--plan', 'plan.json', '--report', 'report.json', '--subject', 'snapshot-1'];
  for (const args of [[], [...base, '--unknown'], [...base, '--subject', 'other']]) {
    assert.equal(spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', windowsHide: true }).status, 2);
  }
  fs.writeFileSync(path.join(f.root, 'report.json'), '{PRIVATE_UNPARSED_CONTENT');
  const result = spawnSync(process.execPath, [script, ...base], { encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 2);
  assert.ok(!result.stdout.includes('PRIVATE_UNPARSED_CONTENT'));
  assert.ok(!result.stdout.includes(f.root));
});

test('invalid UTF-8 cannot silently become replacement characters in evidence', () => {
  const f = fixture();
  f.save();
  const json = JSON.stringify(f.report).replace('Synthetic command result', 'BYTE_PLACEHOLDER');
  const [before, after] = json.split('BYTE_PLACEHOLDER');
  fs.writeFileSync(path.join(f.root, 'report.json'), Buffer.concat([Buffer.from(before), Buffer.from([0xc3, 0x28]), Buffer.from(after)]));
  const result = validateEvidence(f.options);
  assert.equal(result.verdict, 'invalid');
  assert.deepEqual(result.errors, ['Invalid UTF-8 or JSON input']);
});

test('CLI reports failure and incomplete evidence with exit code one', () => {
  for (const status of ['fail', 'not-run', 'blocked']) {
    const f = fixture();
    if (status === 'fail') {
      f.report.results[0].status = 'fail';
      f.report.results[0].execution.exitCode = 1;
    } else f.report.results[0] = { id: 'api', status, summary: 'Required check unfinished', artifacts: [] };
    f.save();
    const result = spawnSync(process.execPath, [script, '--root', f.root, '--plan', 'plan.json', '--report', 'report.json', '--subject', 'snapshot-1'], {
      encoding: 'utf8', windowsHide: true, timeout: 10000,
    });
    assert.equal(result.status, 1, result.stderr);
    assert.equal(JSON.parse(result.stdout).verdict, status === 'fail' ? 'failed' : 'incomplete');
  }
});

test('CLI rejects inherited names and repeated known options', () => {
  const f = fixture();
  f.save();
  for (const option of ['toString', '__proto__', 'constructor', '--root']) {
    const result = spawnSync(process.execPath, [script, '--root', f.root, '--plan', 'plan.json', '--report', 'report.json', option, 'snapshot-1'], {
      encoding: 'utf8', windowsHide: true, timeout: 10000,
    });
    assert.equal(result.status, 2);
    assert.deepEqual(JSON.parse(result.stdout).errors, ['Expected each option exactly once; use --help']);
  }
});

test('distributed example is incomplete, not a fabricated passing report', () => {
  const result = validateEvidence({ root: sourceRoot, planFile: 'assets/evidence-plan.example.json',
    reportFile: 'assets/evidence-report.example.json', subject: 'replace-with-verified-snapshot-id' });
  assert.equal(result.verdict, 'incomplete');
  assert.equal(result.totals['not-run'], 2);
});
