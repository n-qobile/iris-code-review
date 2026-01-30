// getStats.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

// IMPORTANT: don't rely on setting AWS_REGION as an env var yourself.
// Use REGION (custom) so you can control it in Lambda Env Vars.
const REGION_DDB = process.env.REGION || "eu-north-1";

const TABLE_IMAGES = process.env.IMAGES_TABLE || "iris-images";
const TABLE_ANALYSIS = process.env.ANALYSIS_TABLE || "iris-analysis";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: REGION_DDB })
);

exports.handler = async (event) => {
  try {
    // Handle CORS preflight
    const method =
      event?.requestContext?.http?.method ||
      event?.httpMethod ||
      "GET";

    if (method === "OPTIONS") {
      return { statusCode: 204, headers: cors(), body: "" };
    }

    // Get all images
    const imagesResult = await ddb.send(
      new ScanCommand({ TableName: TABLE_IMAGES })
    );
    const images = imagesResult.Items || [];

    // Get all analyses
    const analysisResult = await ddb.send(
      new ScanCommand({ TableName: TABLE_ANALYSIS })
    );
    const analyses = analysisResult.Items || [];

    // Calculate stats
    const totalImages = images.length;
    const analyzed = images.filter((img) => img?.analyzed).length;

    const objectsDetected = analyses.reduce((sum, a) => {
      return sum + (a?.labels?.length || 0);
    }, 0);

    const facesFound = analyses.reduce((sum, a) => {
      return sum + (a?.faces?.length || 0);
    }, 0);

    const stats = { totalImages, analyzed, objectsDetected, facesFound };

    return {
      statusCode: 200,
      headers: cors(),
      body: JSON.stringify({ success: true, stats }),
    };
  } catch (e) {
    console.error("Error getting stats:", e);
    return err(e);
  }
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };
}

function err(e) {
  return {
    statusCode: 500,
    headers: cors(),
    body: JSON.stringify({ success: false, error: e.message }),
  };
}