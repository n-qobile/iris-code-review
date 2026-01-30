const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { RekognitionClient, DetectLabelsCommand, DetectFacesCommand, DetectTextCommand } = require("@aws-sdk/client-rekognition");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const REGION_DATA = process.env.AWS_REGION || "eu-north-1";      // S3 + DynamoDB
const REGION_REK = process.env.REKOGNITION_REGION || "eu-west-1"; // Rekognition

const BUCKET = process.env.S3_BUCKET_NAME || "iris-images-nqobile";
const TABLE_IMAGES = process.env.IMAGES_TABLE || "iris-images";
const TABLE_ANALYSIS = process.env.ANALYSIS_TABLE || "iris-analysis";

const s3 = new S3Client({ region: REGION_DATA });
const rek = new RekognitionClient({ region: REGION_REK });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION_DATA }));

exports.handler = async (event) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return bad("Missing id");

    const imgRes = await ddb.send(new GetCommand({ TableName: TABLE_IMAGES, Key: { id } }));
    const image = imgRes.Item;
    if (!image) return notFound("Image not found");

    // Download from S3 (eu-north-1)
    const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: image.s3Key }));
    const bytes = await streamToBuffer(obj.Body);

    // Rekognition using BYTES (eu-west-1)
    const [labelsRes, facesRes, textRes] = await Promise.all([
      rek.send(new DetectLabelsCommand({ Image: { Bytes: bytes }, MaxLabels: 10, MinConfidence: 75 })),
      rek.send(new DetectFacesCommand({ Image: { Bytes: bytes }, Attributes: ["ALL"] })),
      rek.send(new DetectTextCommand({ Image: { Bytes: bytes } }))
    ]);

    const analysis = {
      id,
      imageId: id,
      labels: (labelsRes.Labels || []).map(l => ({ name: l.Name, confidence: l.Confidence })),
      faces: (facesRes.FaceDetails || []).map(f => ({ confidence: f.Confidence, ageRange: f.AgeRange, emotions: f.Emotions })),
      textDetections: (textRes.TextDetections || []).map(t => ({ text: t.DetectedText, confidence: t.Confidence, type: t.Type })),
      analyzedAt: new Date().toISOString()
    };

    await ddb.send(new PutCommand({ TableName: TABLE_ANALYSIS, Item: analysis }));
    await ddb.send(new UpdateCommand({
      TableName: TABLE_IMAGES,
      Key: { id },
      UpdateExpression: "SET analyzed = :a, aiTags = :t, updatedAt = :u",
      ExpressionAttributeValues: {
        ":a": true,
        ":t": analysis.labels.slice(0, 5).map(x => x.name),
        ":u": new Date().toISOString()
      }
    }));

    return { statusCode: 200, headers: cors(), body: JSON.stringify({ success: true, analysis }) };
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
function bad(msg) { return { statusCode: 400, headers: cors(), body: JSON.stringify({ success: false, error: msg }) }; }
function notFound(msg) { return { statusCode: 404, headers: cors(), body: JSON.stringify({ success: false, error: msg }) }; }
function err(e) { return { statusCode: 500, headers: cors(), body: JSON.stringify({ success: false, error: e.message }) }; }

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (c) => chunks.push(c));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
