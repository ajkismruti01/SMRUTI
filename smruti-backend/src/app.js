import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import passport from './config/passport.js';
import routes from './routes/index.js';
import { config } from './config/environment.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { generalLimiter } from './middleware/rateLimitMiddleware.js';

export const createApp = () => {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  // CORS Configuration
  const allowedOrigins = [
    config.frontendUrl,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Allow dev variations
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Logging
  if (config.env !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate Limiting
  app.use(generalLimiter);

  // Session
  app.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: config.env === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: config.env === 'production' ? 'none' : 'lax',
      },
    })
  );

  // Passport OAuth
  app.use(passport.initialize());
  app.use(passport.session());

  // Static files for local uploads fallback
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  // API Routes
  app.use('/api', routes);

  // Root Welcome & Health
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'SMRUTI Backend API Server is running.',
      version: '1.0.0',
      apiDocs: '/api/health',
    });
  });

  // 404 & Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
