import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/index.js';
import { skeletonRoutes } from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors(
  {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }
));
app.use(express.json());

app.use('/api/skeletons', skeletonRoutes);

// Database connection and sync
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    process.exit(1);
  }
};

startServer();