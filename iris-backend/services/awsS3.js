const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'iris-images-nqobile';

class AWSS3Service {
  async upload(file) {
    const fileId = uuidv4();
    const s3Key = `images/${Date.now()}-${file.originalname}`;

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype
      }
    });

    await upload.done();
    console.log(`✅ AWS S3: Uploaded file ${s3Key}`);

    return {
      fileId,
      s3Key,
      url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`,
      bucket: BUCKET_NAME
    };
  }

  async deleteFile(s3Key) {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    });

    await s3Client.send(command);
    console.log(`✅ AWS S3: Deleted file ${s3Key}`);
    return true;
  }

  async listFiles() {
    return [];
  }

  async getFile(s3Key) {
    return { key: s3Key };
  }
}

module.exports = new AWSS3Service();