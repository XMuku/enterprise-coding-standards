import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const kitRoot = fileURLToPath(new URL('../', import.meta.url));
const ignored = new Set(['.git', '.tmp', 'node_modules', 'coverage', 'target', 'dist', 'unpackage', '.hvigor', 'oh_modules', 'build']);
const required = [
  'README.md', 'SKILL.md', 'package.json', 'CHANGELOG.md', 'CONTRIBUTING.md', 'AGENTS.md',
  'agents/openai.yaml', 'assets/agents-template.md', 'assets/project-profile-template.md',
  'assets/checks-plan-template.md', 'references/common.md', 'references/contracts-security.md',
  'references/java-spring.md', 'references/java-ee.md', 'references/uni-app.md',
  'references/miniprogram.md', 'references/checks.md', 'references/adoption.md', 'references/sources.md',
  'references/repository-structure.md', 'references/naming-design.md', 'references/testing.md',
  'references/configuration-logging.md', 'references/data-access.md', 'references/change-management.md',
  'scripts/prepare-project.mjs', 'scripts/prepare-project.test.mjs', 'scripts/validate-kit.mjs',
  'scripts/validate-kit.test.mjs', 'scripts/test-support.mjs', '.github/workflows/validate.yml',
  'docs/example-adoption.md', 'docs/rules-and-checks.md', 'docs/releasing.md',
  'examples/README.md', 'examples/spring-order/README.md', 'examples/spring-order/pom.xml',
  'examples/spring-order/AGENTS.md', 'examples/uni-order/README.md', 'examples/uni-order/AGENTS.md',
  'examples/uni-order/package.json', 'examples/uni-order/package-lock.json', 'docs/rule-examples.md',
  'evals/README.md', 'evals/tasks/java-summary.md', 'evals/tasks/uni-search.md',
  'evals/holdout/SummaryAcceptanceTest.java.txt', 'evals/holdout/search-acceptance.test.ts.txt',
  'scripts/example-support.mjs', 'scripts/check-examples.mjs', 'scripts/evaluate-agent.mjs',
  'scripts/example-support.test.mjs',
  'scripts/check-eval-harness.mjs', 'evals/controls/order-search.ts.txt', 'docs/verification-beta3.md',
  'docs/agent-workflow.md', 'docs/verification-beta4.md',
  'assets/task-record-template.md', 'assets/handoff-template.md',
  'prompts/README.md', 'prompts/00-adopt-project.md', 'prompts/01-feature-delivery.md',
  'prompts/02-java-spring-api.md', 'prompts/03-java-ee-change.md', 'prompts/04-uni-app-feature.md',
  'prompts/05-miniprogram-feature.md', 'prompts/06-bugfix.md', 'prompts/07-review-only.md',
  'prompts/08-checks-integration.md', 'prompts/09-refactor-migration.md',
  'prompts/10-resume-handoff.md', 'prompts/11-release-preparation.md',
  'references/modular-architecture.md', 'references/harmonyos-arkui.md',
  'docs/framework-integration.md', 'docs/verification-beta5.md', 'prompts/12-harmonyos-arkui-feature.md',
  'docs/verification-beta6.md',
];

function within(root, target) {
  const relative = path.relative(root, target);
  return !path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`);
}

function exactPath(root, target) {
  let cursor = root;
  for (const segment of path.relative(root, target).split(path.sep).filter(Boolean)) {
    if (!fs.statSync(cursor).isDirectory()) return false;
    if (!fs.readdirSync(cursor).includes(segment)) return false;
    cursor = path.join(cursor, segment);
    if (fs.lstatSync(cursor).isSymbolicLink()) return false;
  }
  return fs.existsSync(cursor);
}

function proseOnly(markdown) {
  let fence = null;
  return markdown.split(/\r?\n/).map((line) => {
    const match = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (match) {
      if (!fence) fence = match[1];
      else if (match[1][0] === fence[0] && match[1].length >= fence.length) fence = null;
      return '';
    }
    return fence ? '' : line.replace(/(`+)[^`\n]*?\1/g, '');
  }).join('\n');
}

export function validateMarkdownLinks(root, file, markdown) {
  const errors = [];
  const label = path.relative(root, file).split(path.sep).join('/');
  const links = proseOnly(markdown).matchAll(/!?\[[^\]\n]*\]\(\s*(<[^>\n]+>|[^\s)]+)(?:[ \t]+["'][^)]*["'])?\s*\)/g);
  for (const match of links) {
    const href = match[1].replace(/^<|>$/g, '');
    if (href.startsWith('#') || /^(https?:|mailto:)/i.test(href)) continue;
    if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('/') || href.startsWith('\\')) {
      errors.push(`${label}: non-portable local link`);
      continue;
    }
    let relative;
    try {
      relative = decodeURIComponent(href.split(/[?#]/, 1)[0]);
    } catch {
      errors.push(`${label}: malformed encoded link`);
      continue;
    }
    if (!relative) continue;
    const target = path.resolve(path.dirname(file), relative);
    if (!within(root, target)) errors.push(`${label}: local link escapes the kit`);
    else if (!exactPath(root, target)) errors.push(`${label}: missing or case-mismatched link: ${relative}`);
  }
  return errors;
}

export function validateRepository(input = kitRoot) {
  const root = path.resolve(input);
  const errors = [];
  const files = [];
  const report = (relative, message) => errors.push(`${relative}: ${message}`);
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const full = path.join(directory, entry.name);
      const relative = path.relative(root, full).split(path.sep).join('/');
      if (entry.isSymbolicLink()) report(relative, 'symlinks are not part of the portable release');
      else if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push({ full, relative });
    }
  }
  walk(root);
  const names = new Set(files.map((file) => file.relative));
  for (const name of required) if (!names.has(name)) report(name, 'required file missing');
  const read = (name) => names.has(name) ? fs.readFileSync(path.join(root, name), 'utf8') : '';
  let metadata;
  try {
    metadata = JSON.parse(read('package.json'));
  } catch {
    report('package.json', 'invalid JSON');
  }
  if (metadata) {
    if (metadata.name !== 'enterprise-coding-standards') report('package.json', 'unexpected package name');
    const version = metadata.version;
    if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:-[a-z\d.-]+)?$/i.test(version)) {
      report('package.json', 'invalid version');
    } else {
      const skill = read('SKILL.md');
      const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] || '';
      if (!/^name: enterprise-coding-standards$/m.test(frontmatter)) report('SKILL.md', 'missing skill name');
      if (!/^description: .+$/m.test(frontmatter)) report('SKILL.md', 'missing skill description');
      if (!frontmatter.includes(`  version: "${version}"`)) report('SKILL.md', 'version differs from package.json');
      const versions = [
        ['assets/project-profile-template.md', `规范包版本：${version}。`],
        ['references/sources.md', `本地包版本 ${version}，`],
        ['README.md', `**${version}**`],
        ['docs/releasing.md', `\`${version}\``],
        ['CHANGELOG.md', `## ${version} - `],
      ];
      for (const [name, marker] of versions) if (!read(name).includes(marker)) report(name, 'version differs from package.json');
    }
  }
  const profile = read('assets/project-profile-template.md');
  if (profile.split('<!-- selected-stack-map -->').length !== 2) report('assets/project-profile-template.md', 'expected exactly one stack-map marker');
  const ui = read('agents/openai.yaml');
  if (!ui.includes('$enterprise-coding-standards')) report('agents/openai.yaml', 'default prompt must name the skill');
  const shortDescription = ui.match(/^\s+short_description: "([^"]+)"$/m)?.[1];
  if (!shortDescription || shortDescription.length < 25 || shortDescription.length > 64) report('agents/openai.yaml', 'short description must be 25-64 characters');

  let markdownFiles = 0;
  for (const { full, relative } of files) {
    if (/^\.env(?:\.|$)/i.test(path.basename(full)) && path.basename(full) !== '.env.example') report(relative, 'local environment file must not be distributed');
    const content = fs.readFileSync(full, 'utf8');
    if (!content.trim()) report(relative, 'empty content');
    // These heuristics deliberately report file names only, never matching secrets.
    if (/(?:\b[a-z]:[\\/]|\/(?:Users|home)\/[^/\s]+\/|file:\/\/\/|\\\\[a-z\d][a-z\d.-]*\\)/i.test(content)) {
      report(relative, 'personal absolute path');
    }
    if (/\b(?:sk-[a-z\d_-]{24,}|gh[pousr]_[a-z\d]{30,}|github_pat_[a-z\d_]{30,})\b/i.test(content) || /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)) {
      report(relative, 'possible credential or private key');
    }
    if (relative.endsWith('.md')) {
      markdownFiles += 1;
      errors.push(...validateMarkdownLinks(root, full, content));
    }
  }
  return { files: files.length, markdownFiles, errors };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = validateRepository();
    console.log(JSON.stringify(result, null, 2));
    if (result.errors.length) process.exitCode = 1;
  } catch (error) {
    console.error(`Validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
