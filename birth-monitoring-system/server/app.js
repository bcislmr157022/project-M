require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/database');
const { errorHandler } = require('./middleware/errorMiddleware');
const { authenticateJWT } = require('./middleware/authMiddleware'); // New auth middleware

const app = express();

// Enhanced Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting - Stricter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts, please try again later'
});

// Apply to auth routes only
app.use('/api/auth', authLimiter);

// Standard rate limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Body Parsing with size limit
app.use(express.json({ limit: '10kb' }));

// Database Initialization
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected ✔');

    // Development-only sync options
    const syncOptions = process.env.NODE_ENV === 'development' ? { 
      alter: true,
      logging: console.log 
    } : {};

    await sequelize.sync(syncOptions);
    console.log('Models synchronized with database');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// JWT Authentication Middleware
app.use((req, res, next) => {
  // Skip auth for these routes
  if (
    req.path === '/api/auth/login' || 
    req.path === '/api/auth/signup' ||
    req.path === '/health'
  ) {
    return next();
  }
  return authenticateJWT(req, res, next);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/births', require('./routes/births'));
app.use('/api/admin', require('./routes/admin'));

// Enhanced Health Check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// API Info Endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Birth Monitoring System API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      births: '/api/births',
      admin: '/api/admin'
    }
  });
});

// Error Handling (must be last)
app.use(errorHandler);

// Server Startup
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await initializeDatabase();
  
  const server = app.listen(PORT, () => {
    console.log(`
    Server running in ${process.env.NODE_ENV || 'development'} mode
    Listening on port ${PORT}
    Database: ${sequelize.config.database}@${sequelize.config.host}
    `);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      sequelize.close();
      console.log('Server closed');
      process.exit(0);
    });
  });
};

startServer();