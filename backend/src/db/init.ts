import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createTables = async () => {
  const connection = await pool.getConnection();
  
  try {
    // Create Admin table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Projects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category ENUM('Security Tools', 'Full-Stack Dev', 'CTF Utilities', 'Open Source') NOT NULL,
        tech_stack JSON NOT NULL,
        github_url VARCHAR(500),
        demo_url VARCHAR(500),
        featured BOOLEAN DEFAULT FALSE,
        image VARCHAR(500),
        authors VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Blog Posts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT NOT NULL,
        content LONGTEXT NOT NULL,
        date DATE NOT NULL,
        category ENUM('Web Security', 'Pwn', 'Bug Bounty', 'Tooling', 'CTF Writeup', 'Reverse Engineering', 'Crypto') NOT NULL,
        read_time VARCHAR(50),
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Skills table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        category ENUM('Offensive Security', 'Bug Bounty', 'CTF Domains', 'Development', 'Tools') NOT NULL,
        level INT NOT NULL CHECK (level >= 0 AND level <= 100),
        icon VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create CTF Entries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ctf_entries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        event VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        rank VARCHAR(100),
        date VARCHAR(50) NOT NULL,
        writeup_url VARCHAR(500),
        type ENUM('Played', 'Authored', 'Organized') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Bug Bounty Entries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bug_bounty_entries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        program VARCHAR(255) NOT NULL,
        platform VARCHAR(100) NOT NULL,
        type VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        bounty VARCHAR(100),
        report_url VARCHAR(500),
        severity ENUM('Low', 'Medium', 'High', 'Critical'),
        status ENUM('Reported', 'Accepted', 'Fixed', 'Rewarded', 'Duplicate') DEFAULT 'Reported',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Highlights/Stats table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS highlights (
        id INT PRIMARY KEY AUTO_INCREMENT,
        label VARCHAR(255) NOT NULL,
        value VARCHAR(100) NOT NULL,
        icon VARCHAR(100),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Contact Messages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create About/Profile Content table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS profile_content (
        id INT PRIMARY KEY AUTO_INCREMENT,
        section VARCHAR(100) NOT NULL UNIQUE,
        content TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ All tables created successfully');

    // Insert default admin if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@arittro.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const [existingAdmin] = await connection.query(
      'SELECT id FROM admins WHERE email = ?',
      [adminEmail]
    );

    if ((existingAdmin as any[]).length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await connection.query(
        'INSERT INTO admins (email, password, name) VALUES (?, ?, ?)',
        [adminEmail, hashedPassword, 'Arittro Sarkar']
      );
      console.log(`✅ Default admin created: ${adminEmail}`);
      console.log(`⚠️  Default password: ${adminPassword} (Please change after first login!)`);
    }

    // Insert default highlights if not exists
    const [existingHighlights] = await connection.query('SELECT COUNT(*) as count FROM highlights');
    if ((existingHighlights as any[])[0].count === 0) {
      await connection.query(`
        INSERT INTO highlights (label, value, icon, display_order) VALUES
        ('CTFs Played', '25+', 'trophy', 1),
        ('Security Tools Built', '10+', 'tool', 2),
        ('Writeups Published', '40+', 'file-text', 3),
        ('Bug Bounty Programs', '5+', 'bug', 4)
      `);
      console.log('✅ Default highlights created');
    }

    // Insert default profile sections if not exists
    const [existingProfile] = await connection.query('SELECT COUNT(*) as count FROM profile_content');
    if ((existingProfile as any[])[0].count === 0) {
      await connection.query(`
        INSERT INTO profile_content (section, content) VALUES
        ('hero_title', 'Arittro Sarkar'),
        ('hero_subtitle', 'Security Researcher & CTF Player'),
        ('hero_tagline', 'Breaking → Learning → Securing'),
        ('hero_description', 'Cybersecurity enthusiast specializing in CTF challenges, web exploitation, and secure application development. Building tools, breaking systems, and learning every step of the way.'),
        ('about_intro', 'Cybersecurity enthusiast specializing in CTF challenges, web exploitation, and secure application development. Security researcher in the making — exploring attack surfaces, building defensive tools, and constantly learning new techniques.'),
        ('about_journey', 'Started with web development and gradually moved into cybersecurity through CTF competitions. The thrill of finding vulnerabilities and understanding how systems work at a deeper level drove me to pursue security research full-time.'),
        ('about_current', 'Currently participating in CTF competitions focusing on web exploitation, pwn, and crypto challenges. Also learning bug bounty hunting through platforms like HackerOne and Bugcrowd, building security tools, and writing technical writeups to share knowledge with the community.'),
        ('about_philosophy', 'Breaking things to learn how to secure them. Every vulnerability discovered is a lesson in building better, more secure systems.'),
        ('stats_ctfs_played', '50+'),
        ('stats_security_projects', '12'),
        ('stats_writeups', '25'),
        ('stats_bounties', 'Active')
      `);
      console.log('✅ Default profile content created');
    }

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    connection.release();
  }
};

const seedMockData = async () => {
  const connection = await pool.getConnection();
  
  try {
    // Check if data already exists
    const [existingProjects] = await connection.query('SELECT COUNT(*) as count FROM projects');
    if ((existingProjects as any[])[0].count > 0) {
      console.log('✅ Database already has data, skipping seed');
      return;
    }

    // Seed Projects
    await connection.query(`
      INSERT INTO projects (title, description, category, tech_stack, github_url, featured) VALUES
      ('Recon Automation Toolkit', 'Multi-step subdomain enumeration + HTTP probing + screenshots. A Python-based CLI tool designed to streamline the reconnaissance phase of bug bounty hunting.', 'Security Tools', '["Python", "Bash", "Docker"]', 'https://github.com/arittro/recon-tool', TRUE),
      ('JWT Analyzer', 'Decodes, modifies, and signs JWTs to test for common vulnerabilities like "none" algorithm and weak secrets.', 'Security Tools', '["Go", "JavaScript"]', 'https://github.com/arittro/jwt-analyzer', TRUE),
      ('CTF Exploit Boilerplate', 'Generates Python templates for remote exploits using pwntools. Useful for pwn challenges to save setup time.', 'CTF Utilities', '["Python", "Pwntools"]', 'https://github.com/arittro/ctf-boilerplate', FALSE),
      ('Bug Bounty Dashboard', 'Web UI to track recon results with cron jobs running automation scripts in the background.', 'Full-Stack Dev', '["Next.js", "PostgreSQL", "Node.js"]', 'https://github.com/arittro/bb-dashboard', FALSE),
      ('XSS Payload Generator', 'Tool for creating obfuscated XSS payloads with various encoding techniques to bypass WAFs.', 'Security Tools', '["Python", "JavaScript"]', 'https://github.com/arittro/xss-gen', FALSE)
    `);

    // Seed Blog Posts
    await connection.query(`
      INSERT INTO blog_posts (title, slug, excerpt, content, date, category, read_time, featured) VALUES
      ('Breaking IDORs: A Deep Dive', 'breaking-idors-deep-dive', 'Understanding Insecure Direct Object References and how to automate their detection in modern web applications.', 'Full content would go here...', '2023-10-15', 'Web Security', '5 min read', TRUE),
      ('Pwning the Stack: Buffer Overflow Basics', 'buffer-overflow-basics', 'A beginner-friendly guide to binary exploitation, focusing on stack-based buffer overflows and return-oriented programming.', 'Full content would go here...', '2023-09-22', 'Pwn', '8 min read', TRUE),
      ('My First Bug Bounty Find', 'my-first-bug-bounty', 'The story of how I found my first valid vulnerability in a public bug bounty program and the lessons learned.', 'Full content would go here...', '2023-08-10', 'Bug Bounty', '6 min read', TRUE)
    `);

    // Seed Skills
    await connection.query(`
      INSERT INTO skills (name, category, level) VALUES
      ('Web Exploitation', 'Offensive Security', 90),
      ('Network Recon', 'Offensive Security', 85),
      ('Binary Exploitation', 'Offensive Security', 60),
      ('Reverse Engineering', 'Offensive Security', 55),
      ('Python', 'Development', 95),
      ('React/TypeScript', 'Development', 85),
      ('Node.js', 'Development', 80),
      ('Go', 'Development', 70),
      ('Burp Suite', 'Tools', 90),
      ('Docker', 'Tools', 80),
      ('Linux/Bash', 'Tools', 90),
      ('Git', 'Tools', 85)
    `);

    // Seed CTF Entries
    await connection.query(`
      INSERT INTO ctf_entries (name, event, category, rank, date, type, writeup_url) VALUES
      ('Web 500', 'RUET Cyber Fest', 'Web', '1st Place', '2023', 'Played', '#'),
      ('Kernel Panic', 'HackTheBox CTF', 'Pwn', 'Top 10', '2023', 'Played', '#'),
      ('Custom SQLi Challenge', 'Internal CTF', 'Web', NULL, '2023', 'Authored', '#'),
      ('Crypto Master', 'CyberSec CTF 2023', 'Crypto', 'Top 20', '2023', 'Played', '#')
    `);

    // Seed Bug Bounty Entries
    await connection.query(`
      INSERT INTO bug_bounty_entries (program, platform, type, date, bounty, severity, status) VALUES
      ('Private Program', 'HackerOne', 'IDOR', '2023-11-01', '$500', 'High', 'Rewarded'),
      ('Public Program', 'Bugcrowd', 'XSS', '2023-09-15', '$150', 'Medium', 'Rewarded'),
      ('Tech Company', 'HackerOne', 'Authentication Bypass', '2023-12-05', 'Pending', 'Critical', 'Accepted')
    `);

    console.log('✅ Mock data seeded successfully');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// Main initialization
const initializeDatabase = async () => {
  try {
    await createTables();
    await seedMockData();
    console.log('\n✅ Database initialization complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
