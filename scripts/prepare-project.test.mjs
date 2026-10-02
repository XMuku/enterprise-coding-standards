import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { copyKitFixture, createRunRoot } from './test-support.mjs';
import { validateMarkdownLinks } from './validate-kit.mjs';

const runRoot = createRunRoot('prepare-project-');
const kit = copyKitFixture(path.join(runRoot, 'kit'));
const script = path.join(kit, 'scripts', 'prepare-project.mjs');

function fixture(name) {
  const directory = path.join(runRoot, name);
  fs.mkdirSync(directory);
  return directory;
}

function run(project, extra = []) {
  return spawnSync(process.execPath, [script, '--project', project, '--stack', 'java-spring', ...extra], {
    encoding: 'utf8', windowsHide: true, timeout: 10000,
  });
}

test('dry run creates nothing, including with existing AGENTS', () => {
  const project = fixture('dry-run');
  fs.writeFileSync(path.join(project, 'AGENTS.md'), 'existing rules');
  const result = run(project);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).mode, 'dry-run');
  assert.deepEqual(fs.readdirSync(project), ['AGENTS.md']);
});

test('exports only chosen stacks and preserves approved rules', () => {
  const project = fixture('export');
  fs.writeFileSync(path.join(project, 'AGENTS.md'), 'existing rules');
  const result = run(project, ['--stack', 'uni-app', '--stack', 'uni-app', '--apply']);
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.written.length, 16);
  assert.deepEqual(output.stacks, ['java-spring', 'uni-app']);
  assert.equal(output.version, JSON.parse(fs.readFileSync(path.join(kit, 'package.json'), 'utf8')).version);
  assert.equal(fs.readFileSync(path.join(project, 'AGENTS.md'), 'utf8'), 'existing rules');
  const docs = path.join(project, 'docs', 'coding-standards');
  assert.equal(fs.existsSync(path.join(docs, 'java-ee.md')), false);
  assert.equal(fs.existsSync(path.join(docs, 'miniprogram.md')), false);
  assert.equal(fs.existsSync(path.join(docs, 'harmonyos-arkui.md')), false);
  for (const name of ['java-spring', 'uni-app', 'common', 'contracts-security', 'checks', 'sources',
    'repository-structure', 'modular-architecture', 'naming-design', 'testing', 'configuration-logging', 'change-management', 'data-access']) {
    const source = new URL(`../references/${name}.md`, import.meta.url);
    assert.equal(fs.readFileSync(path.join(docs, `${name}.md`), 'utf8'), fs.readFileSync(source, 'utf8'));
  }
  assert.equal(run(project, ['--apply']).status, 1);
  assert.equal(fs.readFileSync(path.join(project, 'AGENTS.md'), 'utf8'), 'existing rules');
});

test('each stack exports a self-contained profile with only selected links', () => {
  for (const stack of ['java-spring', 'java-ee', 'uni-app', 'miniprogram', 'harmonyos-arkui']) {
    const project = fixture(`single-${stack}`);
    const result = spawnSync(process.execPath, [script, '--project', project, '--stack', stack, '--apply'], {
      encoding: 'utf8', windowsHide: true, timeout: 10000,
    });
    assert.equal(result.status, 0, result.stderr);
    const docs = path.join(project, 'docs', 'coding-standards');
    const profile = fs.readFileSync(path.join(docs, 'project-profile.md'), 'utf8');
    assert.ok(profile.includes(`[${stack}](${stack}.md)`));
    assert.ok(!profile.includes('<!-- selected-stack-map -->'));
    for (const other of ['java-spring', 'java-ee', 'uni-app', 'miniprogram', 'harmonyos-arkui'].filter((value) => value !== stack)) {
      assert.ok(!profile.includes(`${other}.md`));
    }
    for (const name of fs.readdirSync(docs)) {
      assert.deepEqual(validateMarkdownLinks(project, path.join(docs, name), fs.readFileSync(path.join(docs, name), 'utf8')), []);
    }
  }
});

test('every nonempty stack combination exports exactly its self-contained rule set', () => {
  const stacks = ['java-spring', 'java-ee', 'uni-app', 'miniprogram', 'harmonyos-arkui'];
  const common = [
    'common.md', 'contracts-security.md', 'checks.md', 'sources.md', 'project-profile.md', 'checks-plan.md',
    'repository-structure.md', 'modular-architecture.md', 'naming-design.md', 'testing.md', 'configuration-logging.md', 'change-management.md',
  ];
  for (let mask = 1; mask < (1 << stacks.length); mask += 1) {
    const selected = stacks.filter((_, index) => mask & (1 << index));
    const project = fixture(`combination-${mask}`);
    const result = spawnSync(process.execPath, [script, '--project', project,
      ...selected.flatMap((stack) => ['--stack', stack]), '--apply'], {
      encoding: 'utf8', windowsHide: true, timeout: 10000,
    });
    assert.equal(result.status, 0, `${selected}: ${result.stderr}`);
    const expected = [...common, ...selected.map((stack) => `${stack}.md`)];
    if (selected.includes('java-spring') || selected.includes('java-ee')) expected.push('data-access.md');
    const docs = path.join(project, 'docs', 'coding-standards');
    assert.deepEqual(fs.readdirSync(docs).sort(), expected.sort(), selected.join(','));
    assert.equal(JSON.parse(result.stdout).written.length, expected.length + 1);
    for (const name of expected) {
      const file = path.join(docs, name);
      const content = fs.readFileSync(file, 'utf8');
      assert.deepEqual(validateMarkdownLinks(project, file, content), [], `${selected}: ${name}`);
      if (name === 'project-profile.md') {
        const template = fs.readFileSync(path.join(kit, 'assets', 'project-profile-template.md'), 'utf8');
        const [before, after] = template.split('<!-- selected-stack-map -->');
        assert.ok(content.startsWith(before), `${selected}: profile preamble must be preserved`);
        assert.ok(content.endsWith(after), `${selected}: profile trailing rules must be preserved`);
      } else {
        const source = name === 'checks-plan.md'
          ? path.join(kit, 'assets', 'checks-plan-template.md')
          : path.join(kit, 'references', name);
        assert.equal(content, fs.readFileSync(source, 'utf8'), `${selected}: ${name} content must be preserved`);
      }
    }
  }
});

test('a conflict in a newly added rule stops export before any writes', () => {
  const project = fixture('new-rule-conflict');
  const docs = path.join(project, 'docs', 'coding-standards');
  fs.mkdirSync(docs, { recursive: true });
  fs.writeFileSync(path.join(docs, 'configuration-logging.md'), 'team-owned content');
  const result = run(project, ['--apply']);
  assert.equal(result.status, 1);
  assert.equal(fs.existsSync(path.join(project, 'AGENTS.md.candidate')), false);
  assert.deepEqual(fs.readdirSync(docs), ['configuration-logging.md']);
  assert.equal(fs.readFileSync(path.join(docs, 'configuration-logging.md'), 'utf8'), 'team-owned content');
});

test('missing applicable rule in a damaged kit fails before export writes', () => {
  const project = fixture('missing-rule-output');
  const damaged = copyKitFixture(path.join(runRoot, 'damaged-kit'));
  fs.renameSync(path.join(damaged, 'references', 'data-access.md'), path.join(damaged, 'references', 'data-access.backup'));
  const result = spawnSync(process.execPath, [path.join(damaged, 'scripts', 'prepare-project.mjs'),
    '--project', project, '--stack', 'java-ee', '--apply'], {
    encoding: 'utf8', windowsHide: true, timeout: 10000,
  });
  assert.equal(result.status, 1);
  assert.deepEqual(fs.readdirSync(project), []);
});

test('preflight conflict rejects whole export before writing any candidate', () => {
  const project = fixture('conflict');
  const docs = path.join(project, 'docs', 'coding-standards');
  fs.mkdirSync(docs, { recursive: true });
  fs.writeFileSync(path.join(docs, 'common.md'), 'keep me');
  const result = run(project, ['--apply']);
  assert.equal(result.status, 1);
  assert.equal(fs.existsSync(path.join(project, 'AGENTS.md.candidate')), false);
  assert.deepEqual(fs.readdirSync(docs), ['common.md']);
  assert.equal(fs.readFileSync(path.join(docs, 'common.md'), 'utf8'), 'keep me');
});

test('missing HarmonyOS rule fails before any draft is created', () => {
  const project = fixture('missing-harmony-output');
  const damaged = copyKitFixture(path.join(runRoot, 'damaged-harmony-kit'));
  const rule = path.join(damaged, 'references', 'harmonyos-arkui.md');
  fs.renameSync(rule, `${rule}.backup`);
  const result = spawnSync(process.execPath, [path.join(damaged, 'scripts', 'prepare-project.mjs'),
    '--project', project, '--stack', 'harmonyos-arkui', '--apply'], {
    encoding: 'utf8', windowsHide: true, timeout: 10000,
  });
  assert.equal(result.status, 1);
  assert.deepEqual(fs.readdirSync(project), []);
});

test('can export all five stack references without installing tools', () => {
  const project = fixture('all-stacks');
  const result = run(project, ['--stack', 'java-ee', '--stack', 'uni-app', '--stack', 'miniprogram', '--stack', 'harmonyos-arkui', '--apply']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).written.length, 19);
  for (const stack of ['java-spring', 'java-ee', 'uni-app', 'miniprogram', 'harmonyos-arkui']) {
    assert.equal(fs.existsSync(path.join(project, 'docs', 'coding-standards', `${stack}.md`)), true);
  }
  assert.equal(fs.existsSync(path.join(project, 'AGENTS.md')), false);
  assert.equal(fs.existsSync(path.join(project, 'package.json')), false);
  assert.equal(fs.existsSync(path.join(project, 'pom.xml')), false);
  assert.equal(fs.existsSync(path.join(project, '.github')), false);
});

test('invalid arguments and nonexistent project do not write', () => {
  const project = fixture('invalid');
  assert.equal(run(project, ['--stack', 'unknown', '--apply']).status, 1);
  assert.equal(run('relative-project', ['--apply']).status, 1);
  assert.equal(run(path.join(project, 'missing'), ['--apply']).status, 1);
  assert.equal(run(project, ['--unexpected']).status, 1);
  assert.equal(run(project, ['--stack']).status, 1);
  assert.equal(run(project, ['--project', project]).status, 1);
  assert.deepEqual(fs.readdirSync(project), []);
});

test('help and version require no project and write nothing', () => {
  const project = fixture('help');
  for (const option of ['--help', '--version']) {
    const result = spawnSync(process.execPath, [script, option], {
      encoding: 'utf8', windowsHide: true, timeout: 10000, cwd: project,
    });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.trim());
  }
  assert.deepEqual(fs.readdirSync(project), []);
});

test('rejects kit itself, nested kit directory, filesystem root and missing stack', () => {
  const nested = path.join(kit, 'nested');
  fs.mkdirSync(nested);
  assert.equal(run(kit, ['--apply']).status, 1);
  assert.equal(run(nested, ['--apply']).status, 1);
  assert.equal(run(path.parse(kit).root, ['--apply']).status, 1);
  const result = spawnSync(process.execPath, [script, '--project', nested], { encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 1);
  assert.deepEqual(fs.readdirSync(nested), []);
});

test('rejects a file in place of an output parent before writing', () => {
  const project = fixture('parent-file');
  fs.writeFileSync(path.join(project, 'docs'), 'keep');
  assert.equal(run(project, ['--apply']).status, 1);
  assert.deepEqual(fs.readdirSync(project), ['docs']);
  assert.equal(fs.readFileSync(path.join(project, 'docs'), 'utf8'), 'keep');
});

test('exports into paths containing spaces and non-ASCII characters', () => {
  const project = fixture('project \u9879\u76ee with spaces');
  const result = run(project, ['--apply']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).written.length, 15);
});

test('supports a kit installed inside the target project', () => {
  const project = fixture('installed-kit');
  const installed = copyKitFixture(path.join(project, '.agents', 'skills', 'enterprise-coding-standards'));
  const result = spawnSync(process.execPath, [path.join(installed, 'scripts', 'prepare-project.mjs'),
    '--project', project, '--stack', 'java-spring', '--apply'], {
    encoding: 'utf8', windowsHide: true, timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(project, 'AGENTS.md.candidate')), true);
});

test('refuses a vault or its child project', () => {
  const vault = fixture('vault');
  fs.mkdirSync(path.join(vault, '.obsidian'));
  const project = path.join(vault, 'nested-project');
  fs.mkdirSync(project);
  assert.equal(run(vault, ['--apply']).status, 1);
  assert.equal(run(project, ['--apply']).status, 1);
  assert.deepEqual(fs.readdirSync(project), []);
});

test('refuses symlinked output parents without writing outside project', () => {
  const project = fixture('junction');
  const external = fixture('external');
  fs.symlinkSync(external, path.join(project, 'docs'), process.platform === 'win32' ? 'junction' : 'dir');
  const result = run(project, ['--apply']);
  assert.equal(result.status, 1);
  assert.equal(fs.existsSync(path.join(project, 'AGENTS.md.candidate')), false);
  assert.deepEqual(fs.readdirSync(external), []);
});
