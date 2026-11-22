import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase } from './config/db';
import { initSocketServer } from './socket';
import { apiRateLimiter } from './middleware/rateLimit';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import uploadRoutes from './routes/upload';
import listingRoutes from './routes/listings';
import savedRoutes from './routes/saved';
import rentalRoutes from './routes/rentals';
import tradeRoutes from './routes/trades';
import purchaseRoutes from './routes/purchases';
import conversationRoutes from './routes/conversations';
import reviewRoutes from './routes/reviews';
import communityRequestRoutes from './routes/communityRequests';

dotenv.config();

export const createServerApp = () => {
  const app = express();

  const allowedOrigins = (
    process.env.FRONTEND_URL || 'http://localhost:5173,http://127.0.0.1:5173'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(new Error('Origin not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  // Support base64 image upload payloads up to 12 MB
  app.use(express.json({ limit: '12mb' }));
  app.use(express.urlencoded({ extended: true, limit: '12mb' }));

  app.use('/api', apiRateLimiter);

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'narmis-mongodb-backend',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/listings', listingRoutes);
  app.use('/api/saved', savedRoutes);
  app.use('/api/rentals', rentalRoutes);
  app.use('/api/trades', tradeRoutes);
  app.use('/api/purchases', purchaseRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/community-requests', communityRequestRoutes);

  const httpServer = http.createServer(app);
  initSocketServer(httpServer, allowedOrigins);

  return { app, httpServer };
};

if (require.main === module) {
  const PORT = Number(process.env.PORT) || 5000;
  const { httpServer } = createServerApp();

  connectDatabase()
    .then(() => {
      httpServer.listen(PORT, () => {
        console.log(`NARMIS Backend API & Socket.IO listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB Atlas:', err.message);
      process.exit(1);
    });
}
