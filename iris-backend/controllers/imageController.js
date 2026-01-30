const awsS3 = require('../services/awsS3');
const awsDynamoDB = require('../services/awsDynamoDB');
const { v4: uuidv4 } = require('uuid');

// Upload image
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log('📤 Uploading to AWS S3:', req.file.originalname);

    // Upload to AWS S3
    const s3Result = await awsS3.upload(req.file);

    console.log('✅ S3 Upload successful:', s3Result.s3Key);

    // Save metadata to AWS DynamoDB
    const imageRecord = await awsDynamoDB.putItem('images', {
      id: uuidv4(),
      userId: 'demo-user',
      name: req.file.originalname,
      s3Key: s3Result.s3Key,
      s3Url: s3Result.url,
      bucket: s3Result.bucket,
      size: req.file.size,
      mimeType: req.file.mimetype,
      analyzed: false
    });

    console.log('✅ DynamoDB record created:', imageRecord.id);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully to AWS',
      image: imageRecord
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    next(error);
  }
};

// Get all images
exports.getAllImages = async (req, res, next) => {
  try {
    console.log('📥 Fetching images from DynamoDB...');
    const images = await awsDynamoDB.scan('images');
    
    // Sort by newest first
    images.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    console.log(`✅ Retrieved ${images.length} images from DynamoDB`);

    res.json({
      success: true,
      count: images.length,
      images
    });

  } catch (error) {
    console.error('❌ Get images error:', error);
    next(error);
  }
};

// Get single image
exports.getImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('🔍 Getting image:', id);
    
    const image = await awsDynamoDB.getItem('images', id);

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    res.json({
      success: true,
      image
    });

  } catch (error) {
    console.error('❌ Get image error:', error);
    next(error);
  }
};

// Delete image
exports.deleteImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting image:', id);
    
    const image = await awsDynamoDB.getItem('images', id);

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Delete from S3
    await awsS3.deleteFile(image.s3Key);

    // Delete from DynamoDB
    await awsDynamoDB.deleteItem('images', id);

    // Delete analysis if exists
    try {
      await awsDynamoDB.deleteItem('analysis', id);
    } catch (e) {
      // Analysis might not exist
    }

    console.log('✅ Image deleted successfully');

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete error:', error);
    next(error);
  }
};

// Get stats
exports.getStats = async (req, res, next) => {
  try {
    console.log('📊 Calculating stats...');
    
    const images = await awsDynamoDB.scan('images');
    const analyses = await awsDynamoDB.scan('analysis');

    const stats = {
      totalImages: images.length,
      analyzed: images.filter(img => img.analyzed).length,
      objectsDetected: analyses.reduce((sum, a) => 
        sum + (a.labels?.length || 0), 0),
      facesFound: analyses.reduce((sum, a) => 
        sum + (a.faces?.length || 0), 0)
    };

    console.log('✅ Stats calculated:', stats);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Stats error:', error);
    next(error);
  }
};