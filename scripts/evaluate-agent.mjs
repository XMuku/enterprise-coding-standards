import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { kitRoot, newRun, copySources, sourceFiles, digest, runTool, mavenArgs, requirePass } from './example-support.mjs';

const cases = {
  'java-summary': { example: 'spring-order', fixture: 'SummaryAcceptanceTest.java.txt',
    target: 'src/test/java/com/example/order/SummaryAcceptanceTest.java' },
  'uni-search': { example: 'uni-order', fixture: 'search-acceptance.test.ts.txt',
    target: 'tests/search-acceptance.test.ts' },
};

export function protectedChanges(project, baseline) {
  const changes = [];
  for (const [file, hash] of Object.entries(baseline)) {
    const target = path.join(project, file);
    if (!fs.existsSync(target) || fs.lstatSync(target).isSymbolicLink() || digest(target) !== hash) changes.push(file);
  }
  return changes;
}

export function prepare(caseId) {
  const scenario = cases[caseId];
  if (!scenario) throw new Error('Unknown evaluation case');
  const run = newRun('evals', caseId);
  const project = path.join(run, 'project');
  copySources(path.join(kitRoot, 'examples', scenario.example), project);
  fs.writeFileSync(path.join(project, 'local-notes.txt'), 'User note: retain the existing mock data and deployment settings.\n');
  const standards = path.join(run, 'standards');
  fs.mkdirSync(standards);
  fs.copyFileSync(path.join(kitRoot, 'SKILL.md'), path.join(standards, 'SKILL.md'));
  copySources(path.join(kitRoot, 'references'), path.join(standards, 'references'));
  const originalFiles = Object.fromEntries(sourceFiles(project).map(file => [file, digest(path.join(project, file))]));
  const protectedFiles = Object.fromEntries(Object.entries(originalFiles).filter(([file]) =>
    !file.startsWith('src/main/java/') && !(scenario.example === 'uni-order' && file.startsWith('src/') && !file.endsWith('.json'))));
  const manifest = {
    caseId, example: scenario.example, originalFiles, protectedFiles, createdAt: new Date().toISOString(),
    kitVersion: JSON.parse(fs.readFileSync(path.join(kitRoot, 'package.json'), 'utf8')).version,
    skillSha256: digest(path.join(standards, 'SKILL.md')), nodeVersion: process.version,
  };
  fs.writeFileSync(path.join(run, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const task = fs.readFileSync(path.join(kitRoot, 'evals', 'tasks', `${caseId}.md`), 'utf8');
  const prompt = `Project: ${project}\nSkill: ${path.join(standards, 'SKILL.md')}\n\n${task}\n`;
  fs.writeFileSync(path.join(run, 'prompt.md'), prompt);
  console.log(prompt);
  console.log(`Run: ${run}`);
  return run;
}

export function grade(input) {
  const root = path.join(kitRoot, '.tmp', 'evals');
  const run = fs.realpathSync(input);
  const relative = path.relative(root, run);
  if (!relative || path.isAbsolute(relative) || relative.startsWith('..') || relative.includes(path.sep)) {
    throw new Error('Grade only a direct run directory created under .tmp/evals');
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(run, 'manifest.json'), 'utf8'));
  const scenario = cases[manifest.caseId];
  if (!scenario || scenario.example !== manifest.example) throw new Error('Invalid evaluation manifest');
  for (const file of Object.keys(manifest.originalFiles)) {
    if (path.isAbsolute(file) || file.split(/[\\/]/).includes('..')) throw new Error('Unsafe manifest path');
  }
  if (Object.keys(manifest.protectedFiles).some(file => !(file in manifest.originalFiles))) throw new Error('Invalid protected files');
  const project = path.join(run, 'project');
  const files = sourceFiles(project);
  const protectedViolations = protectedChanges(project, manifest.protectedFiles);
  const changedFiles = files.filter(file => !(file in manifest.originalFiles) || digest(path.join(project, file)) !== manifest.originalFiles[file]);
  const deletedFiles = Object.keys(manifest.originalFiles).filter(file => !files.includes(file));
  const unauthorizedAdditions = changedFiles.filter(file => !(file in manifest.originalFiles)
    && !(scenario.example === 'spring-order' ? /^src\/(main|test)\/java\/.+\.java$/.test(file)
      : /^src\/.+\.(ts|vue)$/.test(file) || /^tests\/.+\.test\.ts$/.test(file)));
  const report = {
    caseId: manifest.caseId, kitVersion: manifest.kitVersion || 'unrecorded',
    gradedAt: new Date().toISOString(), changedFiles, deletedFiles,
    protectedViolations, unauthorizedAdditions, checksPassed: false,
    manualReview: 'pending: pre-code decisions, architecture/design quality, UI wiring, evidence honesty',
  };
  if (protectedViolations.length || unauthorizedAdditions.length) {
    fs.writeFileSync(path.join(run, 'grade.json'), `${JSON.stringify(report, null, 2)}\n`);
    return report;
  }
  const grading = fs.mkdtempSync(path.join(run, 'grading-'));
  const cwd = path.join(grading, 'project');
  copySources(project, cwd);
  const target = path.join(cwd, scenario.target);
  if (fs.existsSync(target)) throw new Error('Holdout test filename already exists');
  fs.copyFileSync(path.join(kitRoot, 'evals', 'holdout', scenario.fixture), target);
  if (scenario.example === 'uni-order') {
    requirePass(runTool('npm', ['ci', '--no-audit', '--no-fund'], cwd, path.join(grading, 'install.log')), 'Grading dependency install');
  }
  const result = scenario.example === 'spring-order'
    ? runTool('mvn', mavenArgs('clean', 'verify'), cwd, path.join(grading, 'checks.log'))
    : runTool('npm', ['run', 'check'], cwd, path.join(grading, 'checks.log'));
  report.checksPassed = !result.infrastructureError && result.status === 0;
  report.infrastructureError = result.infrastructureError;
  report.exitCode = result.status;
  report.evidenceDirectory = path.basename(grading);
  fs.writeFileSync(path.join(run, 'grade.json'), `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [action, value, ...extra] = process.argv.slice(2);
  try {
    if (!value || extra.length || !['prepare', 'grade'].includes(action)) {
      throw new Error('Usage: node scripts/evaluate-agent.mjs prepare <java-summary|uni-search> | grade <run-directory>');
    }
    if (action === 'prepare') prepare(value);
    else {
      const report = grade(value);
      console.log(JSON.stringify(report, null, 2));
      if (!report.checksPassed || report.protectedViolations.length || report.unauthorizedAdditions.length) process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
