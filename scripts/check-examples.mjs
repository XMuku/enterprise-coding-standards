import fs from 'node:fs';
import path from 'node:path';
import { kitRoot, newRun, copySources, runTool, mavenArgs, requirePass, expectedFailure } from './example-support.mjs';

const negative = process.argv.slice(2);
if (negative.some(arg => arg !== '--negative') || negative.length > 1) {
  console.error('Usage: node scripts/check-examples.mjs [--negative]');
  process.exit(2);
}
const run = newRun('example-checks', negative.length ? 'negative' : 'baseline');
const reports = [];
try {
  for (const example of ['spring-order', 'uni-order']) {
    const cwd = path.join(kitRoot, 'examples', example);
    const result = example === 'spring-order'
      ? runTool('mvn', mavenArgs('clean', 'verify'), cwd, path.join(run, `${example}.log`))
      : runTool('npm', ['run', 'check'], cwd, path.join(run, `${example}.log`));
    requirePass(result, `${example} baseline`);
    reports.push({ id: `${example}-baseline`, passed: true });
    console.log(`PASS ${example} baseline`);
  }
  if (negative.length) {
    const cases = [
      { id: 'java-member-name', example: 'spring-order', fixture: 'BadName.java.txt',
        target: 'src/main/java/com/example/order/model/BadName.java',
        command: 'mvn', args: mavenArgs('validate'), marker: '[MemberName]' },
      { id: 'java-layer-boundary', example: 'spring-order', fixture: 'LeakyController.java.txt',
        target: 'src/main/java/com/example/order/web/LeakyController.java',
        command: 'mvn', args: mavenArgs('-Dtest=ArchitectureTest', 'test'), marker: 'WEB_NO_PERSISTENCE' },
      { id: 'typescript-no-any', example: 'uni-order', fixture: 'unsafe-order.ts.txt',
        target: 'src/domain/unsafe-order.ts', command: 'npm', args: ['run', 'lint'],
        marker: '@typescript-eslint/no-explicit-any' },
      { id: 'typescript-contract', example: 'uni-order', fixture: 'invalid-order.ts.txt',
        target: 'src/domain/invalid-order.ts', command: 'npm', args: ['run', 'typecheck'],
        marker: "Type 'string' is not assignable to type 'number'" },
    ];
    for (const scenario of cases) {
      const cwd = path.join(run, scenario.id);
      copySources(path.join(kitRoot, 'examples', scenario.example), cwd);
      if (scenario.example === 'uni-order') {
        requirePass(runTool('npm', ['ci', '--no-fund', '--no-audit'], cwd,
          path.join(run, `${scenario.id}-install.log`)), 'Isolated dependency install');
      }
      fs.copyFileSync(path.join(kitRoot, 'examples', 'negative', scenario.fixture), path.join(cwd, scenario.target));
      const result = runTool(scenario.command, scenario.args, cwd, path.join(run, `${scenario.id}.log`));
      const passed = expectedFailure(result, scenario.marker);
      reports.push({ id: scenario.id, passed, expectedMarker: scenario.marker, exitCode: result.status });
      console.log(`${passed ? 'PASS' : 'FAIL'} ${scenario.id}: violation must be rejected`);
    }
  }
} catch (error) {
  reports.push({ id: 'infrastructure-or-baseline', passed: false });
  console.error(error.message);
}
fs.writeFileSync(path.join(run, 'results.json'), `${JSON.stringify(reports, null, 2)}\n`);
console.log(`Evidence: ${run}`);
if (reports.some(report => !report.passed)) process.exitCode = 1;
