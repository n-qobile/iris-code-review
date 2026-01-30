const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const REGION = process.env.AWS_REGION || "eu-north-1";
const BUCKET = process.env.S3_BUCKET_NAME || "iris-images-nqobile";
const TABLE_IMAGES = process.env.IMAGES_TABLE || "iris-images";

const s3 = new S3Client({ region: REGION });
const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: REGION })
);

exports.handler = async (event) => {
  try {
    // ✅ Handle CORS preflight
    if (event.requestContext?.http?.method === "OPTIONS") {
      return {
        statusCode: 200,
        headers: cors(),
        body: ""
      };
    }

    // ✅ SAFE body parsing (THIS WAS THE BUG)
    let body = {};
    if (event.body) {
      if (typeof event.body === "string") {
        body = JSON.parse(event.body);
      } else {
        body = event.body;
      }
    }

    const filename = body.filename || "upload.jpg";
    const contentType = body.contentType || "image/jpeg";

    const id = crypto.randomUUID();
    const s3Key = `images/${Date.now()}-${filename}`;

    // ✅ Presigned URL
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
        ContentType: contentType
      }),
      { expiresIn: 300 }
    );

    const now = new Date().toISOString();

    const record = {
      id,
      userId: "demo-user",
      name: filename,
      s3Key,
      bucket: BUCKET,
      s3Url: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${s3Key}`,
      analyzed: false,
      createdAt: now,
      updatedAt: now
    };

    await ddb.send(
      new PutCommand({
        TableName: TABLE_IMAGES,
        Item: record
      })
    );

    return {
      statusCode: 200,
      headers: cors(),
      body: JSON.stringify({
        success: true,
        uploadUrl,
        image: record
      })
    };
  } catch (e) {
    console.error("ERROR:", e);
    return {
      statusCode: 500,
      headers: cors(),
      body: JSON.stringify({
        success: false,
        error: e.message
      })
    };
  }
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  };
}