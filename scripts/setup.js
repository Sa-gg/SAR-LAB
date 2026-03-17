#!/usr/bin/env node
// Cross-platform setup script for Lab 2 (works on Windows, Mac, Linux)
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..', '..');

function run(cmd, cwd) {
  console.log(`  > ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', shell: true });
}

function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '');
  }
}

function setupService(serviceRelPath, dbFile, migrateCmd) {
  const dir = path.join(root, serviceRelPath);
  console.log(`\n[lab2] Setting up ${serviceRelPath}...`);
  if (!fs.existsSync(path.join(dir, 'vendor'))) {
    console.log('[lab2] Installing PHP dependencies (this may take a minute)...');
    run('composer install --no-interaction --prefer-dist', dir);
  } else {
    console.log('[lab2] PHP dependencies already installed, skipping.');
  }
  const envFile = path.join(dir, '.env');
  const envExample = path.join(dir, '.env.example');
  if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
  }
  run('php artisan key:generate --force', dir);
  ensureFile(path.join(dir, dbFile));
  console.log('[lab2] Resetting database with fresh migrations...');
  run(migrateCmd, dir);
}

setupService(
  'lab2/services/student-service',
  'database/students.sqlite',
  'php artisan migrate:fresh --seed --force'
);
setupService(
  'lab2/services/course-service',
  'database/courses.sqlite',
  'php artisan migrate:fresh --seed --force'
);
setupService(
  'lab2/services/enrollment-service',
  'database/enrollments.sqlite',
  'php artisan migrate:fresh --force'
);

console.log('\n[lab2] Setup complete!');
console.log('[lab2] Run: npm run serve:lab2  (starts all 3 services)');
