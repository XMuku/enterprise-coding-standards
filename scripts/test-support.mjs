import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
const excluded = new Set(['.git', '.tmp', 'node_modules', 'coverage', 'target', 'dist', 'unpackage', '.hvigor', 'oh_modules', 'build']);

export function createRunRoot(prefix) {
  const base = process.env.ENTERPRISE_KIT_TEST_ROOT || path.join(sourceRoot, '.tmp', 'tests');
  assert.ok(path.isAbsolute(base), 'ENTERPRISE_KIT_TEST_ROOT must be an absolute directory');
  fs.mkdirSync(base, { recursive: true });
  return fs.mkdtempSync(path.join(base, prefix));
}

export function copyKitFixture(destination) {
  fs.mkdirSync(destination, { recursive: true });
  // Copy individual entries so the fixture can live under the ignored .tmp directory.
  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const source = path.join(sourceRoot, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Unexpected symlink in kit fixture: ${entry.name}`);
    fs.cpSync(source, path.join(destination, entry.name), {
      recursive: true, errorOnExist: true, force: false,
      filter: (candidate) => !excluded.has(path.basename(candidate)),
    });
  }
  return destination;
}
