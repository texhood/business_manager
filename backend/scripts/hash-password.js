#!/usr/bin/env node
/**
 * Password Hash Utility
 * Generates bcrypt password hashes compatible with Business Manager
 * 
 * Location: backend/scripts/hash-password.js
 * 
 * Usage:
 *   node scripts/hash-password.js                    # Prompts for password
 *   node scripts/hash-password.js "mypassword"      # Hash provided password
 *   node scripts/hash-password.js --generate        # Generate random password and hash
 * 
 * Then update the database:
 *   UPDATE accounts SET password_hash = '<hash>' WHERE email = 'user@example.com';
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const readline = require('readline');

// Must match the salt rounds used in your auth routes
const SALT_ROUNDS = 10;

async function hashPassword(password) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  return hash;
}

function generateRandomPassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  return password;
}

async function promptForPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter password to hash: ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  let password;
  let isGenerated = false;

  if (args.includes('--generate') || args.includes('-g')) {
    password = generateRandomPassword();
    isGenerated = true;
  } else if (args.length > 0 && !args[0].startsWith('-')) {
    password = args[0];
  } else {
    password = await promptForPassword();
  }

  if (!password) {
    console.error('Error: No password provided');
    process.exit(1);
  }

  try {
    const hash = await hashPassword(password);
    
    console.log('\n' + '='.repeat(70));
    if (isGenerated) {
      console.log('Generated Password:', password);
    }
    console.log('Password Hash:');
    console.log(hash);
    console.log('='.repeat(70));
    console.log('\nTo update a user\'s password, run this SQL:');
    console.log(`UPDATE accounts SET password_hash = '${hash}' WHERE email = 'USER_EMAIL_HERE';`);
    console.log('');
  } catch (error) {
    console.error('Error hashing password:', error.message);
    process.exit(1);
  }
}

main();