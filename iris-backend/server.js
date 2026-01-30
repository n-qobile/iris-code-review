const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const imageRoutes = require('./routes/images');
const analysisRoutes = require('./routes/analysis');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/images', imageRoutes);
app.use('/api/analysis', analysisRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'IRIS Backend is running with AWS!',
    timestamp: new Date().toISOString(),
    aws: {
      region: process.env.AWS_REGION,
      s3Bucket: process.env.S3_BUCKET_NAME
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 IRIS Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`☁️  AWS Region: ${process.env.AWS_REGION}`);
  console.log(`🪣 S3 Bucket: ${process.env.S3_BUCKET_NAME}`);
});