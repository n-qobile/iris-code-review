const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(client);

class AWSDynamoDBService {
  async putItem(tableName, item) {
    const id = item.id || uuidv4();
    const record = {
      ...item,
      id,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const command = new PutCommand({
      TableName: `iris-${tableName}`,
      Item: record
    });

    await docClient.send(command);
    console.log(`✅ DynamoDB: Put item in iris-${tableName}`);
    return record;
  }

  async getItem(tableName, id) {
    const command = new GetCommand({
      TableName: `iris-${tableName}`,
      Key: { id }
    });

    const response = await docClient.send(command);
    console.log(`✅ DynamoDB: Get item from iris-${tableName}`);
    return response.Item || null;
  }

  async scan(tableName) {
    const command = new ScanCommand({
      TableName: `iris-${tableName}`
    });

    const response = await docClient.send(command);
    console.log(`✅ DynamoDB: Scan iris-${tableName} - ${response.Items?.length || 0} items`);
    return response.Items || [];
  }

  async query(tableName, filter = {}) {
    return this.scan(tableName);
  }

  async deleteItem(tableName, id) {
    const command = new DeleteCommand({
      TableName: `iris-${tableName}`,
      Key: { id }
    });

    await docClient.send(command);
    console.log(`✅ DynamoDB: Delete from iris-${tableName}`);
    return true;
  }

  async updateItem(tableName, id, updates) {
    const item = await this.getItem(tableName, id);
    if (!item) throw new Error(`Item ${id} not found`);
    
    const updated = {
      ...item,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.putItem(tableName, updated);
    console.log(`✅ DynamoDB: Update item in iris-${tableName}`);
    return updated;
  }
}

module.exports = new AWSDynamoDBService();