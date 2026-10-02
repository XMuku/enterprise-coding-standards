import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const kitRoot = fileURLToPath(new URL('../', import.meta.url));
const excluded = new Set(['node_modules', 'target', 'dist', '.git', '.tmp', 'unpackage', '.hvigor', 'oh_modules', 'build']);

export function sourceFiles(root) {
  if (fs.lstatSync(root).isSymbolicLink()) throw new Error('Source symlinks are not supported');
  const result = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (excluded.has(entry.name)) continue;
      const full = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Source symlinks are not supported');
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile()) result.push(path.relative(root, full).split(path.sep).join('/'));
    }
  }
  visit(root);
  return result.sort();
}

export function copySources(source, destination) {
  if (fs.existsSync(destination)) throw new Error('Destination already exists');
  const files = sourceFiles(source);
  fs.mkdirSync(destination, { recursive: true });
  for (const relative of files) {
    const target = path.join(destination, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(source, relative), target, fs.constants.COPYFILE_EXCL);
  }
}

export function digest(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

export function newRun(kind, label) {
  const base = path.join(kitRoot, '.tmp', kind);
  fs.mkdirSync(base, { recursive: true });
  return fs.mkdtempSync(path.join(base, `${label}-`));
}

export function runTool(command, args, cwd, logFile, timeout = 600_000) {
  const env = { ...process.env, npm_config_cache: path.join(kitRoot, '.tmp', 'npm-cache'),
    NODE_COMPILE_CACHE: path.join(kitRoot, '.tmp', 'node-compile-cache') };
  let executable = command;
  let parameters = args;
  if (process.platform === 'win32' && ['npm', 'mvn'].includes(command)) {
    const quote = value => `'${value.replaceAll("'", "''")}'`;
    executable = 'powershell.exe';
    parameters = ['-NoProfile', '-NonInteractive', '-Command',
      `& ${[command === 'npm' || command === 'mvn' ? `${command}.cmd` : command, ...args].map(quote).join(' ')}; exit $LASTEXITCODE`];
  }
  const result = spawnSync(executable, parameters, {
    cwd, env, encoding: 'utf8', timeout, maxBuffer: 12 * 1024 * 1024, windowsHide: true,
  });
  const output = `${result.stdout || ''}\n${result.stderr || ''}\n${result.error?.message || ''}`;
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  fs.writeFileSync(logFile, output);
  return { status: result.status, infrastructureError: Boolean(result.error || result.signal), output };
}

export function mavenArgs(...goals) {
  return ['-B', '-ntp', `-Dmaven.repo.local=${path.join(kitRoot, '.tmp', 'm2')}`, ...goals];
}

export function expectedFailure(result, marker) {
  return !result.infrastructureError && Number.isInteger(result.status) && result.status !== 0
    && result.output.includes(marker);
}

export function requirePass(result, label) {
  if (result.infrastructureError || result.status !== 0) {
    throw new Error(`${label} failed; inspect the run log.\n${result.output.slice(-1800)}`);
  }
}
