import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const statuses = new Set(['pass', 'fail', 'blocked', 'not-run', 'not-applicable']);
const token = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/;
const requireValue = (condition, message) => { if (!condition) throw new Error(message); };
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const count = (value) => Number.isSafeInteger(value) && value >= 0;

function object(value, fields, label) {
  requireValue(value !== null && typeof value === 'object' && !Array.isArray(value), `${label}: expected object`);
  requireValue(Object.keys(value).every((key) => fields.includes(key)), `${label}: unknown field`);
}

function relativePath(value, allowRoot = false) {
  if (allowRoot && value === '.') return;
  requireValue(text(value) && !/[\\:\x00-\x1f\x7f]/.test(value)
    && value.split('/').every((part) => part && part !== '.' && part !== '..'), 'Expected a portable project-relative path');
}

function readFile(root, relative, maxBytes) {
  relativePath(relative);
  let cursor = root;
  // Reject symlinks and case mismatches on every segment, including Windows junctions.
  for (const segment of relative.split('/')) {
    requireValue(fs.readdirSync(cursor).includes(segment), 'Input or artifact is missing or case-mismatched');
    cursor = path.join(cursor, segment);
    requireValue(!fs.lstatSync(cursor).isSymbolicLink(), 'Symlink inputs and artifacts are not supported');
  }
  const stat = fs.statSync(cursor);
  requireValue(stat.isFile() && stat.size > 0 && stat.size <= maxBytes, 'Input or artifact is empty, oversized, or not a file');
  return fs.readFileSync(cursor);
}

function entries(value, label) {
  requireValue(Array.isArray(value) && value.length > 0 && value.length <= 1000, `${label}: expected 1-1000 entries`);
  const ids = new Set();
  for (const entry of value) {
    requireValue(entry && typeof entry.id === 'string' && token.test(entry.id), `${label}: invalid id`);
    requireValue(!ids.has(entry.id), `${label}: duplicate id`);
    ids.add(entry.id);
  }
  return ids;
}

function validateArtifacts(root, artifacts, required) {
  requireValue(Array.isArray(artifacts) && (!required || artifacts.length > 0), 'Completed checks need artifacts');
  requireValue(artifacts.length <= 100, 'Too many artifacts');
  const seen = new Set();
  for (const artifact of artifacts) {
    object(artifact, ['path', 'sha256'], 'artifact');
    requireValue(typeof artifact.sha256 === 'string' && /^[a-f0-9]{64}$/.test(artifact.sha256), 'Invalid artifact SHA-256');
    requireValue(!seen.has(artifact.path), 'Duplicate artifact');
    seen.add(artifact.path);
    const content = readFile(root, artifact.path, 16 * 1024 * 1024);
    requireValue(createHash('sha256').update(content).digest('hex') === artifact.sha256, 'Artifact digest mismatch');
  }
}

export function validateEvidence({ root, planFile, reportFile, subject }) {
  try {
    requireValue(typeof root === 'string' && path.isAbsolute(root), 'Root must be an existing absolute directory');
    requireValue(fs.lstatSync(root).isDirectory() && !fs.lstatSync(root).isSymbolicLink(), 'Root must be a directory, not a symlink');
    requireValue(typeof subject === 'string' && token.test(subject), 'Expected subject is required');
    const canonicalRoot = fs.realpathSync(root);
    const readJson = (file) => {
      const buffer = readFile(canonicalRoot, file, 1024 * 1024);
      try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer)); }
      catch { throw new Error('Invalid UTF-8 or JSON input'); }
    };
    const plan = readJson(planFile);
    const report = readJson(reportFile);
    object(plan, ['schemaVersion', 'subject', 'risk', 'drivers', 'checks'], 'plan');
    object(report, ['schemaVersion', 'subject', 'results'], 'report');
    requireValue(plan.schemaVersion === 1 && report.schemaVersion === 1, 'Unsupported schema version');
    requireValue(plan.subject === subject && report.subject === subject, 'Subject mismatch; evidence may be stale');
    requireValue(['low', 'standard', 'high'].includes(plan.risk), 'Invalid risk level');
    requireValue(Array.isArray(plan.drivers) && plan.drivers.length > 0 && plan.drivers.every(text), 'Risk drivers are required');
    const ids = entries(plan.checks, 'checks');
    const resultIds = entries(report.results, 'results');
    requireValue(ids.size === resultIds.size && [...ids].every((id) => resultIds.has(id)), 'Results must cover exactly the planned checks');
    const results = new Map(report.results.map((result) => [result.id, result]));
    const totals = Object.fromEntries([...statuses].map((status) => [status, 0]));
    let applicable = 0;
    for (const check of plan.checks) {
      object(check, ['id', 'kind', 'scope', 'applicable', 'reason'], 'check');
      requireValue(['command', 'review'].includes(check.kind) && text(check.scope), 'Check kind and scope are required');
      requireValue(typeof check.applicable === 'boolean', 'Check applicability must be explicit');
      if (!check.applicable) requireValue(text(check.reason), 'Inapplicable check needs a planned reason');
      else applicable += 1;
      const result = results.get(check.id);
      object(result, ['id', 'status', 'summary', 'execution', 'review', 'artifacts'], 'result');
      requireValue(statuses.has(result.status) && text(result.summary), 'Result status and summary are required');
      requireValue(check.applicable === (result.status !== 'not-applicable'), 'Report cannot change planned applicability');
      const completed = ['pass', 'fail'].includes(result.status);
      validateArtifacts(canonicalRoot, result.artifacts, completed);
      if (completed) {
        const command = check.kind === 'command';
        requireValue(!(command ? 'review' in result : 'execution' in result), 'Wrong evidence kind');
        const detail = command ? result.execution : result.review;
        object(detail, command
          ? ['command', 'cwd', 'tool', 'version', 'exitCode', 'checked', 'failed', 'skipped']
          : ['mode', 'checked', 'failed'], 'completed result');
        requireValue(count(detail.checked) && detail.checked > 0 && count(detail.failed)
          && detail.failed <= detail.checked, 'Completed check needs nonempty coverage and valid failure counts');
        let failed = detail.failed > 0;
        if (command) {
          requireValue(text(detail.command) && text(detail.tool) && text(detail.version), 'Command, tool and version are required');
          relativePath(detail.cwd, true);
          requireValue(count(detail.exitCode) && count(detail.skipped), 'Exit code and skipped count are required');
          failed ||= detail.exitCode !== 0;
        } else {
          requireValue(['self', 'independent-agent', 'human'].includes(detail.mode), 'Review mode must be explicit');
        }
        requireValue((result.status === 'fail') === failed, 'Verdict contradicts exit code or failure count');
      } else {
        requireValue(!('execution' in result) && !('review' in result), 'Unfinished checks must not claim completed execution');
      }
      totals[result.status] += 1;
    }
    requireValue(applicable > 0, 'At least one applicable check is required');
    const verdict = totals.fail ? 'failed' : totals.blocked || totals['not-run'] ? 'incomplete' : 'passed';
    return { schemaVersion: 1, verdict, totals, errors: [], assurance: 'record-consistency-and-artifact-integrity-only' };
  } catch (error) {
    // Native errors may contain private paths; never echo their message or input JSON.
    const message = error.code ? 'Input or artifact could not be read' : error.message;
    return { schemaVersion: 1, verdict: 'invalid', errors: [message] };
  }
}

export const evidenceExitCode = (result) => result.verdict === 'passed' ? 0 : result.verdict === 'invalid' ? 2 : 1;

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: node validate-evidence.mjs --root <absolute-project-directory> --plan <relative-json> --report <relative-json> --subject <expected-snapshot-id>');
    console.log('Read-only. Checks declared records and artifact hashes; never executes recorded commands or authorizes release.');
  } else {
    const keys = new Map([['--root', 'root'], ['--plan', 'planFile'], ['--report', 'reportFile'], ['--subject', 'subject']]);
    const options = {};
    let valid = args.length === 8;
    for (let i = 0; i < args.length; i += 2) {
      const key = keys.get(args[i]);
      if (!key || Object.hasOwn(options, key) || !args[i + 1] || args[i + 1].startsWith('--')) valid = false;
      else options[key] = args[i + 1];
    }
    const result = valid ? validateEvidence(options) : { verdict: 'invalid', errors: ['Expected each option exactly once; use --help'] };
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = evidenceExitCode(result);
  }
}
