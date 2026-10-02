import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stacks = new Set(['java-spring', 'java-ee', 'uni-app', 'miniprogram', 'harmonyos-arkui']);
const version = JSON.parse(fs.readFileSync(path.join(kitRoot, 'package.json'), 'utf8')).version;

function parseArgs(args) {
  const options = { project: null, stacks: [], apply: false, help: false, version: false };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--apply') options.apply = true;
    else if (arg === '--help') options.help = true;
    else if (arg === '--version') options.version = true;
    else if (arg === '--project' || arg === '--stack') {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
      if (arg === '--project') {
        if (options.project) throw new Error('Specify --project only once');
        options.project = value;
      } else {
        if (!stacks.has(value)) throw new Error(`Unsupported stack: ${value}`);
        if (!options.stacks.includes(value)) options.stacks.push(value);
      }
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function isWithin(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function inspectExisting(target) {
  try {
    return fs.lstatSync(target);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function validateProject(input) {
  if (!input || !path.isAbsolute(input)) throw new Error('--project must be an absolute, existing project directory');
  const requested = path.resolve(input);
  const info = inspectExisting(requested);
  if (!info?.isDirectory() || info.isSymbolicLink()) throw new Error('Project must be an existing directory, not a symlink');
  const project = fs.realpathSync(requested);
  if (project === path.parse(project).root) throw new Error('A filesystem root is not a project');
  if (isWithin(fs.realpathSync(kitRoot), project)) throw new Error('Do not export into the standards kit');
  for (let directory = project; ; directory = path.dirname(directory)) {
    if (inspectExisting(path.join(directory, '.obsidian'))) throw new Error('Do not export project rules into an Obsidian vault');
    if (directory === path.dirname(directory)) break;
  }
  return project;
}

function inspectDestination(project, relative) {
  const target = path.resolve(project, relative);
  if (!isWithin(project, target)) throw new Error(`Destination escapes project: ${relative}`);
  const segments = path.relative(project, target).split(path.sep);
  let cursor = project;
  for (let i = 0; i < segments.length; i += 1) {
    cursor = path.join(cursor, segments[i]);
    const info = inspectExisting(cursor);
    if (!info) continue;
    if (info.isSymbolicLink()) throw new Error(`Destination includes a symlink: ${cursor}`);
    if (i === segments.length - 1) throw new Error(`Refusing to overwrite existing destination: ${cursor}`);
    if (!info.isDirectory()) throw new Error(`Destination parent is not a directory: ${cursor}`);
  }
  return target;
}

function makePlan(selectedStacks) {
  const plan = [{ relative: 'AGENTS.md.candidate', source: 'assets/agents-template.md' }];
  const references = [
    'common', 'repository-structure', 'modular-architecture', 'naming-design', 'testing', 'configuration-logging',
    'change-management', 'contracts-security', 'checks', 'quality-gates', 'sources', ...selectedStacks,
  ];
  if (selectedStacks.some((stack) => stack === 'java-spring' || stack === 'java-ee')) references.push('data-access');
  for (const name of references) {
    plan.push({ relative: `docs/coding-standards/${name}.md`, source: `references/${name}.md` });
  }
  plan.push({ relative: 'docs/coding-standards/project-profile.md', source: 'assets/project-profile-template.md' });
  plan.push({ relative: 'docs/coding-standards/checks-plan.md', source: 'assets/checks-plan-template.md' });
  return plan.map((item) => {
    let content = fs.readFileSync(path.join(kitRoot, item.source), 'utf8');
    if (item.source === 'assets/project-profile-template.md') {
      const marker = '<!-- selected-stack-map -->';
      if (content.split(marker).length !== 2) throw new Error('Project profile must have exactly one stack-map marker');
      const mapping = ['| 源码目录（相对项目） | 适用规范 |', '| --- | --- |',
        ...selectedStacks.map((stack) => `| 待确认源码目录 | [${stack}](${stack}.md) |`)];
      content = content.replace(marker, mapping.join('\n'));
    }
    return { ...item, content };
  });
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.version) {
    console.log(version);
    return;
  }
  if (options.help) {
    console.log('Usage: node prepare-project.mjs --project <absolute-directory> --stack <java-spring|java-ee|uni-app|miniprogram|harmonyos-arkui> [--stack <stack>] [--apply]');
    console.log('Default: dry run. --apply exports draft documents only; existing files are never overwritten.');
    return;
  }
  if (!options.stacks.length) throw new Error('Specify at least one --stack');
  const project = validateProject(options.project);
  // Preflight the whole plan before making directories or writing any draft.
  const plan = makePlan(options.stacks).map((item) => ({ ...item, target: inspectDestination(project, item.relative) }));
  const written = [];
  if (options.apply) {
    try {
      for (const item of plan) {
        inspectDestination(project, item.relative);
        fs.mkdirSync(path.dirname(item.target), { recursive: true });
        inspectDestination(project, item.relative);
        fs.writeFileSync(item.target, item.content, { flag: 'wx', encoding: 'utf8' });
        written.push(item.target);
      }
    } catch (error) {
      throw new Error(`${error.message}\nExport interrupted; existing files were not overwritten. Draft files already created: ${JSON.stringify(written)}`);
    }
  }
  console.log(JSON.stringify({
    version,
    mode: options.apply ? 'draft-export' : 'dry-run',
    project,
    stacks: options.stacks,
    destinations: plan.map((item) => item.target),
    written,
    status: 'Not adopted. Confirm the project profile and merge the candidate into existing rules manually.',
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
