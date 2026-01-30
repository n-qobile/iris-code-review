const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const REGION_DATA = process.env.AWS_REGION || "eu-north-1";
const BUCKET = process.env.S3_BUCKET_NAME || "iris-images-nqobile";
const TABLE_IMAGES = process.env.IMAGES_TABLE || "iris-images";
const TABLE_ANALYSIS = process.env.ANALYSIS_TABLE || "iris-analysis";

const s3 = new S3Client({ region: REGION_DATA });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION_DATA }));

exports.handler = async (event) => {
  try {
    // Handle CORS preflight
    if (event.requestContext?.http?.method === "OPTIONS") {
      return {
        statusCode: 200,
        headers: cors(),
        body: ""
      };
    }

    const id = event.pathParameters?.id;
    if (!id) return bad("Missing image id");

    // 1. Get image metadata from DynamoDB
    const imgRes = await ddb.send(new GetCommand({ 
      TableName: TABLE_IMAGES, 
      Key: { id } 
    }));
    
    const image = imgRes.Item;
    if (!image) return notFound("Image not found");

    // 2. Delete from S3
    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: image.s3Key
      }));
    } catch (s3Error) {
      console.error("S3 delete error:", s3Error);
      // Continue even if S3 delete fails - maybe file doesn't exist
    }

    // 3. Delete from DynamoDB images table
    await ddb.send(new DeleteCommand({
      TableName: TABLE_IMAGES,
      Key: { id }
    }));

    // 4. Delete from analysis table (if exists)
    try {
      await ddb.send(new DeleteCommand({
        TableName: TABLE_ANALYSIS,
        Key: { id }
      }));
    } catch (analysisError) {
      console.error("Analysis delete error:", analysisError);
      // Continue - analysis might not exist
    }

    return {
      statusCode: 200,
      headers: cors(),
      body: JSON.stringify({
        success: true,
        message: "Image deleted successfully",
        id
      })
    };
  } catch (e) {
    console.error("ERROR:", e);
    return err(e);
  }
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS"
  };
}

function bad(msg) {
  return { 
    statusCode: 400, 
    headers: cors(), 
    body: JSON.stringify({ success: false, error: msg }) 
  };
}

function notFound(msg) {
  return { 
    statusCode: 404, 
    headers: cors(), 
    body: JSON.stringify({ success: false, error: msg }) 
  };
}

function err(e) {
  return { 
    statusCode: 500, 
    headers: cors(), 
    body: JSON.stringify({ success: false, error: e.message }) 
  };
}