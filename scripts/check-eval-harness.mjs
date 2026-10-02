import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { prepare, grade } from './evaluate-agent.mjs';
import { kitRoot } from './example-support.mjs';

// A known control tests the grader, not an agent's behavior or the requested UI.
const run = prepare('uni-search');
try {
  const negative = grade(run);
  assert.equal(negative.checksPassed, false);
  const log = fs.readFileSync(path.join(run, negative.evidenceDirectory, 'checks.log'), 'utf8');
  assert.match(log, /Cannot find module.*order-search/);
  fs.copyFileSync(path.join(run, 'grade.json'), path.join(run, 'negative-grade.json'));
  fs.copyFileSync(path.join(kitRoot, 'evals', 'controls', 'order-search.ts.txt'),
    path.join(run, 'project', 'src', 'domain', 'order-search.ts'));
  const positive = grade(run);
  assert.equal(positive.checksPassed, true, 'Known-correct domain control must pass independent checks');
  assert.deepEqual(positive.protectedViolations, []);
  assert.match(positive.manualReview, /^pending/);
  console.log('PASS grader negative and positive controls; this is NOT an agent/UI evaluation pass.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
console.log(`Control evidence: ${run}`);
