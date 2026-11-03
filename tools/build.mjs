#!/usr/bin/env node
/* tools/build.mjs
   1. tsc: compiles everything under src/ into js/ (repo root = the extension dir)
   2. obfuscate every .js file in js/ in place (config: .obfuscator.json)
   3. re-add the copyright header tsc put on every file, since the
      obfuscator strips leading comments
   4. remove the stale .js.map files (source maps are useless - and would
      leak - once the code has been obfuscated)
   Run with: npm run build   (or build.bat on Windows)           */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JavaScriptObfuscator from 'javascript-obfuscator';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsDir = path.join(root, 'js');
const obfConfig = path.join(root, '.obfuscator.json');

const HEADER =
`/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */
`;

function run(cmd, args) {
  console.log('[build] ' + cmd + ' ' + args.join(' '));
  execFileSync(cmd, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
}

/* recursively collect all .js files (skipping the .js.map files tsc emits) */
function collectJs(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) collectJs(p, out);
    else if (e.isFile() && p.endsWith('.js') && !p.endsWith('.js.map')) out.push(p);
  }
  return out;
}

console.log('[build] src/ -> js/');
fs.rmSync(jsDir, { recursive: true, force: true });
run('npx', ['tsc', '-p', 'tsconfig.json']);

const jsFiles = collectJs(jsDir);
if (!jsFiles.length) {
  console.error('[build] tsc produced no .js files in ' + jsDir);
  process.exit(1);
}

const options = JSON.parse(fs.readFileSync(obfConfig, 'utf8'));
for (const file of jsFiles.sort()) {
  const rel = path.relative(root, file);
  console.log('[build] obfuscating ' + rel);
  const src = fs.readFileSync(file, 'utf8');
  const result = JavaScriptObfuscator.obfuscate(src, options);
  let out = result.getObfuscatedCode();

  // the obfuscator strips the leading comment block; put the copyright back
  out = out.replace(/^(['"]use strict['"];)?\s*/, (m, useStrict) => (useStrict ? useStrict + '\n' : '') + HEADER);
  fs.writeFileSync(file, out);
}

/* source maps are stale and would reveal pre-obfuscation code */
for (const e of fs.readdirSync(jsDir, { recursive: true })) {
  if (String(e).endsWith('.js.map')) fs.rmSync(path.join(jsDir, e), { force: true });
}

console.log('[build] done (' + jsFiles.length + ' files obfuscated)');