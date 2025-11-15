#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const sourceDir = path.join(import.meta.dirname, '..', 'backend', 'App_Data.seed');
const targetDir = path.join(import.meta.dirname, '..', 'backend', 'App_Data');

console.log('♻️  Restoring App_Data from seed...');

if (!fs.existsSync(sourceDir)) {
  console.error('❌ Error: App_Data.seed folder does not exist!');
  console.error('💡 Tip: Run "npm run save" first to create a seed.');
  process.exit(1);
}

// Remove old App_Data if exists
if (fs.existsSync(targetDir)) {
  console.log('🗑️  Removing existing App_Data...');
  fs.rmSync(targetDir, { recursive: true, force: true });
}

// Copy App_Data.seed to App_Data
console.log('📋 Copying App_Data.seed to App_Data...');
fs.cpSync(sourceDir, targetDir, { recursive: true });

console.log('✅ App_Data restored successfully!');
console.log('🎯 Ready to run backend');
