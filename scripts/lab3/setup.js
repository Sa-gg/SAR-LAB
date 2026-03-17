#!/usr/bin/env node
// Cross-platform setup script for Lab 3 (works on Windows, Mac, Linux)
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..', '..');
const serverDir = path.join(root, 'lab3/server');

function run(cmd, cwd) {
  console.log(`  > ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', shell: true });
}

console.log('\n[lab3] Setting up Lab 3 server...');
if (!fs.existsSync(path.join(serverDir, 'node_modules'))) {
  console.log('[lab3] Installing Node dependencies (this may take a minute)...');
  run('npm install', serverDir);
} else {
  console.log('[lab3] Node dependencies already installed, skipping.');
}
const envFile = path.join(serverDir, '.env');
const envExample = path.join(serverDir, '.env.example');
if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, envFile);
}
console.log('[lab3] Resetting products.json from seed baseline...');
fs.copyFileSync(
  path.join(serverDir, 'data/products.seed.json'),
  path.join(serverDir, 'data/products.json')
);

console.log('\n[lab3] Setup complete!');
console.log('[lab3] Run: npm run serve:lab3  (starts API on port 3000)');
