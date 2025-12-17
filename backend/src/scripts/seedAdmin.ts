import 'dotenv/config';
import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@arittro.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const name = 'Admin';

    const hashedPassword = await bcrypt.hash(password, 10);

    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    if ((rows as any[]).length === 0) {
      await pool.query(
        'INSERT INTO admins (email, password, name) VALUES (?, ?, ?)',
        [email, hashedPassword, name]
      );
      console.log('✅ Default admin seeded successfully!');
    } else {
      console.log('ℹ️  Admin already exists.');
    }
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
