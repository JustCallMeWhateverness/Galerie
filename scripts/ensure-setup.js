#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const appDataDir = path.join(import.meta.dirname, '..', 'backend', 'App_Data');

// Check if App_Data exists
if (!fs.existsSync(appDataDir)) {
  console.log('🔧 First time setup detected - restoring seed data...');
  console.log('');

  // Run restore-seed.js
  try {
    execSync('node scripts/restore-seed.js', { stdio: 'inherit' });
    console.log('');
  } catch (error) {
    console.error('❌ Failed to restore seed data');
    process.exit(1);
  }
} else {
  console.log('✅ App_Data exists - ready to start');
}
