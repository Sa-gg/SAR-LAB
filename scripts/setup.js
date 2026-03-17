#!/usr/bin/env node
// Cross-platform setup script for Lab 1 (works on Windows, Mac, Linux)
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
  console.log(`\n[lab1] Setting up ${serviceRelPath}...`);
  if (!fs.existsSync(path.join(dir, 'vendor'))) {
    console.log('[lab1] Installing PHP dependencies (this may take a minute)...');
    run('composer install --no-interaction --prefer-dist', dir);
  } else {
    console.log('[lab1] PHP dependencies already installed, skipping.');
  }
  const envFile = path.join(dir, '.env');
  const envExample = path.join(dir, '.env.example');
  if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
  }
  run('php artisan key:generate --force', dir);
  ensureFile(path.join(dir, dbFile));
  console.log('[lab1] Resetting database with fresh migrations...');
  run(migrateCmd, dir);
}

setupService(
  'lab1/microservices/student-service',
  'database/students.sqlite',
  'php artisan migrate:fresh --seed --force'
);
setupService(
  'lab1/microservices/course-service',
  'database/courses.sqlite',
  'php artisan migrate:fresh --seed --force'
);
setupService(
  'lab1/microservices/enrollment-service',
  'database/enrollments.sqlite',
  'php artisan migrate:fresh --force'
);

// Setup academe frontend
const academe = path.join(root, 'lab1/academe');
console.log('\n[lab1] Setting up academe frontend...');
if (!fs.existsSync(path.join(academe, 'vendor'))) {
  console.log('[lab1] Installing PHP dependencies...');
  run('composer install --no-interaction --prefer-dist', academe);
} else {
  console.log('[lab1] PHP dependencies already installed, skipping.');
}
if (!fs.existsSync(path.join(academe, 'node_modules'))) {
  console.log('[lab1] Installing frontend dependencies...');
  run('npm install', academe);
} else {
  console.log('[lab1] Frontend dependencies already installed, skipping.');
}
const academeEnv = path.join(academe, '.env');
const academeEnvEx = path.join(academe, '.env.example');
if (!fs.existsSync(academeEnv) && fs.existsSync(academeEnvEx)) {
  fs.copyFileSync(academeEnvEx, academeEnv);
}
run('php artisan key:generate --force', academe);
ensureFile(path.join(academe, 'database/database.sqlite'));
if (!fs.existsSync(path.join(academe, 'public/build/manifest.json'))) {
  console.log('[lab1] Building frontend assets...');
  run('npm run build', academe);
} else {
  console.log('[lab1] Frontend assets already built, skipping.');
}
console.log('[lab1] Resetting academe database...');
run('php artisan migrate:fresh --seed --force', academe);
run('php artisan config:clear', academe);

console.log('\n[lab1] Setup complete!');
console.log('[lab1] Run: npm run serve:lab1  (opens all 4 services)');
