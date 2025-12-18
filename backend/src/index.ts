import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import ctfRoutes from './routes/ctfRoutes.js';
import bugBountyRoutes from './routes/bugBountyRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import generalRoutes from './routes/generalRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// If running behind a reverse proxy (nginx, Cloudflare), enable trust proxy
// Use the environment variable TRUST_PROXY to configure (default '1')
app.set('trust proxy', process.env.TRUST_PROXY ?? '1');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins: string[] = [
  process.env.FRONTEND_URL || 'http://localhost',
  'http://localhost',
  'http://localhost:80',
  'http://localhost:5173'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Increase body parser limits to accommodate larger multipart/form-data and JSON payloads
app.use(express.json({ limit: process.env.BODY_PARSER_LIMIT || '20mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.BODY_PARSER_LIMIT || '20mb' }));
app.use(morgan('dev'));

// Serve static files from uploads directory (configurable)
const staticUploadDir = process.env.UPLOAD_DIR || '/app/uploads';
app.use('/uploads', express.static(staticUploadDir));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/blog-posts', blogRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/ctf', ctfRoutes);
app.use('/api/bug-bounty', bugBountyRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', generalRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('⚠️  Failed to connect to database. Please check your .env configuration.');
      console.log('\n📝 Make sure to:');
      console.log('1. Copy .env.example to .env');
      console.log('2. Update database credentials in .env');
      console.log('3. Create the database: CREATE DATABASE portfolio_db;');
      console.log('4. Run: npm run db:init\n');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
