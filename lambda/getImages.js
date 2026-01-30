const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const REGION_DDB = process.env.AWS_REGION || "eu-north-1";
const TABLE_IMAGES = process.env.IMAGES_TABLE || "iris-images";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION_DDB }));

exports.handler = async () => {
  try {
    const result = await ddb.send(new ScanCommand({ TableName: TABLE_IMAGES }));
    const images = result.Items || [];
    images.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers: cors(),
      body: JSON.stringify({ success: true, count: images.length, images })
    };
  } catch (e) {
    return err(e);
  }
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  };
}
function err(e) {
  return { statusCode: 500, headers: cors(), body: JSON.stringify({ success: false, error: e.message }) };
}
