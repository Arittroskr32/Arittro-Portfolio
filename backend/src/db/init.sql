-- Portfolio Database Schema
-- This will be executed when MySQL container starts

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  technologies TEXT NOT NULL,
  github_url VARCHAR(255),
  live_url VARCHAR(255),
  image_url VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  featured TINYINT(1) DEFAULT 0,
  authors VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags TEXT,
  content LONGTEXT NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  proficiency INT NOT NULL,
  level VARCHAR(50),
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ctf_entries table
CREATE TABLE IF NOT EXISTS ctf_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  competition_name VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  `rank` INT NOT NULL,
  team_name VARCHAR(255),
  challenges_solved INT NOT NULL,
  total_challenges INT NOT NULL,
  points_earned INT NOT NULL,
  writeup_url VARCHAR(255),
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bug_bounty_entries table
CREATE TABLE IF NOT EXISTS bug_bounty_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  program_name VARCHAR(255) NOT NULL,
  vulnerability_type VARCHAR(255) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  bounty_amount DECIMAL(10, 2) DEFAULT NULL,
  report_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  description TEXT,
  report_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) DEFAULT '',
  message TEXT NOT NULL,
  read_status TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create highlights table
CREATE TABLE IF NOT EXISTS highlights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  value VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create profile_content table
CREATE TABLE IF NOT EXISTS profile_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section VARCHAR(100) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create journey_highlights table
CREATE TABLE IF NOT EXISTS journey_highlights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_featured TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `rank` INT DEFAULT 0,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT NOT NULL,
  image_url VARCHAR(255),
  issuing_organization VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  skill_tags TEXT,
  verification_link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_certificates_rank (`rank`),
  INDEX idx_certificates_issue_date (issue_date)
);

-- Insert default admin user (password: admin123)
INSERT INTO admins (email, password, name) VALUES 
('admin@arittro.com', '$2a$10$YourHashedPasswordHere', 'Admin')
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample profile content
INSERT INTO profile_content (section, content) VALUES 
('hero_title', 'Hi, I''m Arittro Sarkar'),
('hero_subtitle', 'Cybersecurity Specialist & Full-Stack Developer'),
('hero_description', 'Passionate about offensive security, bug bounty hunting, and building secure applications.'),
('about', '# About Me\n\nI''m a cybersecurity professional specializing in penetration testing and secure application development.')
ON DUPLICATE KEY UPDATE section=section;

-- Insert sample highlights
INSERT INTO highlights (title, value, icon) VALUES 
('Bug Bounties', '50+', '🐛'),
('CTF Wins', '20+', '🏆'),
('Projects', '30+', '💻'),
('Years Experience', '5+', '⚡')
ON DUPLICATE KEY UPDATE title=title;

-- Insert sample journey highlights
INSERT INTO journey_highlights (year, title, description, display_order, is_featured) VALUES 
('2023', 'RUET Cyber Fest CTF', 'Authored web challenges and helped organize the event.', 1, 1),
('2022', 'First Bug Bounty', 'Reported a valid IDOR vulnerability in a public program.', 2, 0),
('2021', 'Started Programming', 'Began journey with Python and Web Development.', 3, 0)
ON DUPLICATE KEY UPDATE year=year;

-- Insert sample skills
INSERT INTO skills (name, category, proficiency, icon) VALUES 
('Burp Suite', 'Offensive Security', 95, '🔍'),
('OWASP Top 10', 'Offensive Security', 90, '🔒'),
('Web Application Testing', 'Offensive Security', 92, '🌐'),
('Network Penetration', 'Offensive Security', 85, '🛡️'),
('React', 'Development', 90, '⚛️'),
('Node.js', 'Development', 88, '💚'),
('TypeScript', 'Development', 85, '📘'),
('Python', 'Development', 92, '🐍'),
('Docker', 'Tools & Frameworks', 87, '🐳'),
('Git', 'Tools & Frameworks', 90, '📦'),
('Linux', 'Tools & Frameworks', 93, '🐧'),
('Metasploit', 'Tools & Frameworks', 80, '💥'),
('AWS', 'Cloud & DevOps', 75, '☁️'),
('Azure', 'Cloud & DevOps', 70, '🔷'),
('CI/CD', 'Cloud & DevOps', 78, '🔄'),
('MySQL', 'Databases', 88, '🗄️'),
('MongoDB', 'Databases', 82, '🍃'),
('PostgreSQL', 'Databases', 85, '🐘')
ON DUPLICATE KEY UPDATE name=name;
