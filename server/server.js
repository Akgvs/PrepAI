import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { initGemini } from './config/gemini.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Initialize Gemini AI
  initGemini();

  // Start Express server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
