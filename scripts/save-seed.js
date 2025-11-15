#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const sourceDir = path.join(import.meta.dirname, '..', 'backend', 'App_Data');
const targetDir = path.join(import.meta.dirname, '..', 'backend', 'App_Data.seed');

console.log('💾 Saving current App_Data state to seed...');

if (!fs.existsSync(sourceDir)) {
  console.error('❌ Error: App_Data folder does not exist!');
  process.exit(1);
}

// Remove old seed if exists
if (fs.existsSync(targetDir)) {
  console.log('🗑️  Removing old seed...');
  fs.rmSync(targetDir, { recursive: true, force: true });
}

// Copy App_Data to App_Data.seed (excluding logs)
console.log('📋 Copying App_Data to App_Data.seed (excluding logs)...');
fs.cpSync(sourceDir, targetDir, {
  recursive: true,
  filter: (source) => !source.includes('/logs/')
});

console.log('✅ Seed saved successfully!');
console.log(`📁 Location: ${targetDir}`);
