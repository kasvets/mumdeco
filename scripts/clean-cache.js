#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning cache and temporary files...');

// Directories to clean
const dirsToClean = [
  '.next',
  'node_modules/.cache',
  '.vercel',
  '.swc',
  'out',
  'dist',
];

// Files to remove
const filesToRemove = [
  'next-env.d.ts',
  '.env.local.example',
];

// Clean directories
dirsToClean.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`🗑️  Removing ${dir}`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

// Clean files
filesToRemove.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`🗑️  Removing ${file}`);
    fs.rmSync(fullPath, { force: true });
  }
});

console.log('✅ Cache cleaned successfully!');
console.log('💡 Run "npm run build" to rebuild the project'); 