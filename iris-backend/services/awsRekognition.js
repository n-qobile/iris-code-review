const {
  RekognitionClient,
  DetectLabelsCommand,
  DetectFacesCommand,
  DetectTextCommand
} = require("@aws-sdk/client-rekognition");

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Rekognition uses a supported region (eu-west-2)
const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REKOGNITION_REGION || "eu-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function getImageBytesFromS3(bucket, key) {
  const resp = await s3Client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  );

  // resp.Body is a stream in Node
  return streamToBuffer(resp.Body);
}

class AWSRekognitionService {
  async detectLabels(s3Key, bucketName) {
    const bucket = bucketName || process.env.S3_BUCKET_NAME;
    const bytes = await getImageBytesFromS3(bucket, s3Key);

    const command = new DetectLabelsCommand({
      Image: { Bytes: bytes },
      MaxLabels: 10,
      MinConfidence: 75,
    });

    const response = await rekognitionClient.send(command);
    return response.Labels || [];
  }

  async detectFaces(s3Key, bucketName) {
    const bucket = bucketName || process.env.S3_BUCKET_NAME;
    const bytes = await getImageBytesFromS3(bucket, s3Key);

    const command = new DetectFacesCommand({
      Image: { Bytes: bytes },
      Attributes: ["ALL"],
    });

    const response = await rekognitionClient.send(command);
    return response.FaceDetails || [];
  }

  async detectText(s3Key, bucketName) {
    const bucket = bucketName || process.env.S3_BUCKET_NAME;
    const bytes = await getImageBytesFromS3(bucket, s3Key);

    const command = new DetectTextCommand({
      Image: { Bytes: bytes },
    });

    const response = await rekognitionClient.send(command);
    return response.TextDetections || [];
  }
}

module.exports = new AWSRekognitionService();
