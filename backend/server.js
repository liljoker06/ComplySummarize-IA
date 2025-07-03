import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/index.js';
import { skeletonRoutes, authRoutes, fileRoutes, chatRoutes, modelRoutes, apiKeyRoutes } from './routes/index.js';
import modelSyncService from './services/modelSyncService.js';

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
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/api-keys', apiKeyRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');
    
    console.log('🔄 Synchronisation des modèles IA...');
    await modelSyncService.syncModelsToDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    process.exit(1);
  }
};

startServer();