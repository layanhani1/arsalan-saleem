import 'dotenv/config';
import bcrypt from 'bcrypt';
import pg from 'pg';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

const username = 'arsalan';

const password = await rl.question('Create a password for Arsalan: ');

rl.close();

if (password.length < 12) {
  console.log('Please use a password with at least 12 characters.');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'reviews',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

try {
  await db.connect();

  await db.query(
    `INSERT INTO admins (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username)
     DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [username, passwordHash]
  );

  console.log('Admin account created successfully!');
} catch (error) {
  console.error('Could not create admin:', error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}