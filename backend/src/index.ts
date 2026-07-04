import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import livekitRoutes from './routes/livekit.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production');
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'medivoice-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);
app.use('/api/livekit', livekitRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MediVoice backend running on port ${PORT}`);
});
