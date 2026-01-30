const awsRekognition = require('../services/awsRekognition');
const awsDynamoDB = require('../services/awsDynamoDB');

// Analyze image with AI
exports.analyzeImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log('🤖 Starting AWS Rekognition analysis for:', id);

    // Get image from database
    const image = await awsDynamoDB.getItem('images', id);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    console.log(`🔍 Analyzing: ${image.name}`);
    console.log(`📍 S3 Key: ${image.s3Key}`);
    console.log(`🪣 Bucket: ${image.bucket}`);

    // Run AWS Rekognition analysis in parallel
    const [labels, faces, text] = await Promise.all([
      awsRekognition.detectLabels(image.s3Key, image.bucket),
      awsRekognition.detectFaces(image.s3Key, image.bucket),
      awsRekognition.detectText(image.s3Key, image.bucket)
    ]);

    console.log(`✅ Rekognition Results:`);
    console.log(`   - Labels: ${labels.length}`);
    console.log(`   - Faces: ${faces.length}`);
    console.log(`   - Text detections: ${text.length}`);

    // Create analysis record
    const analysis = {
      id,
      imageId: id,
      labels: labels.map(l => ({
        name: l.Name,
        confidence: l.Confidence
      })),
      faces: faces.map(f => ({
        confidence: f.Confidence,
        ageRange: f.AgeRange,
        emotions: f.Emotions
      })),
      textDetections: text.map(t => ({
        text: t.DetectedText,
        confidence: t.Confidence,
        type: t.Type
      })),
      analyzedAt: new Date().toISOString()
    };

    // Save analysis to DynamoDB
    await awsDynamoDB.putItem('analysis', analysis);

    // Update image record
    await awsDynamoDB.updateItem('images', id, {
      analyzed: true,
      aiTags: labels.slice(0, 5).map(l => l.Name)
    });

    console.log(`✅ Analysis complete and saved for: ${image.name}`);

    res.json({
      success: true,
      message: 'Image analysed with AWS Rekognition',
      analysis
    });

  } catch (error) {
    console.error('❌ Analysis error:', error);
    next(error);
  }
};

// Get analysis results
exports.getAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const analysis = await awsDynamoDB.getItem('analysis', id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('❌ Get analysis error:', error);
    next(error);
  }
};