#!/usr/bin/env node
/* tools/build.mjs
   1. tsc: compiles everything under src/ into js/ (repo root = the extension dir)
   2. remove the .js.map files tsc emits (they would only bloat the zip;
      `npm run pack` already ignores them)
   Run with: npm run build                                              */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsDir = path.join(root, 'js');

function run(cmd, args) {
  console.log('[build] ' + cmd + ' ' + args.join(' '));
  execFileSync(cmd, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
}

/* recursively collect all entries under dir */
function collect(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) collect(p, out);
    else out.push(p);
  }
  return out;
}

console.log('[build] src/ -> js/');
fs.rmSync(jsDir, { recursive: true, force: true });
run('npx', ['tsc', '-p', 'tsconfig.json']);

const jsFiles = collect(jsDir).filter(p => p.endsWith('.js') && !p.endsWith('.js.map'));
if (!jsFiles.length) {
  console.error('[build] tsc produced no .js files in ' + jsDir);
  process.exit(1);
}

/* source maps are not shipped with the extension */
for (const p of collect(jsDir)) {
  if (p.endsWith('.js.map')) fs.rmSync(p, { force: true });
}

console.log('[build] done (' + jsFiles.length + ' files compiled)');
