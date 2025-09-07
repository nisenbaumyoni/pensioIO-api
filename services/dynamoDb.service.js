import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
    DynamoDBDocumentClient, 
    PutCommand, 
    GetCommand, 
    UpdateCommand, 
    DeleteCommand, 
    ScanCommand, 
    QueryCommand 
} from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Create document client for easier handling of JavaScript objects
const docClient = DynamoDBDocumentClient.from(client);

export const dynamoDbService = {
    // Create a new item
    async create(tableName, item) {
        const command = new PutCommand({
            TableName: tableName,
            Item: item
        });

        try {
            return await docClient.send(command);
        } catch (error) {
            console.error('Error creating item:', error);
            throw error;
        }
    },

    // Get an item by its primary key
    async getByKey(tableName, key) {
        const command = new GetCommand({
            TableName: tableName,
            Key: key
        });

        try {
            const response = await docClient.send(command);
            return response.Item;
        } catch (error) {
            console.error('Error getting item:', error);
            throw error;
        }
    },

    // Scan table (get all items, with optional filter)
    async scan(tableName, filterExpression = null, expressionAttributes = null) {
        const params = {
            TableName: tableName
        };

        if (filterExpression) {
            params.FilterExpression = filterExpression;
            params.ExpressionAttributeValues = expressionAttributes;
        }

        const command = new ScanCommand(params);

        try {
            const response = await docClient.send(command);
            return response.Items;
        } catch (error) {
            console.error('Error scanning table:', error);
            throw error;
        }
    },

    // Query items (more efficient than scan for large datasets)
    async query(tableName, keyConditionExpression, expressionAttributes) {
        const command = new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributes
        });

        try {
            const response = await docClient.send(command);
            return response.Items;
        } catch (error) {
            console.error('Error querying items:', error);
            throw error;
        }
    },

    // Update an item
    async update(tableName, key, updateExpression, expressionAttributes) {
        const command = new UpdateCommand({
            TableName: tableName,
            Key: key,
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributes,
            ReturnValues: 'ALL_NEW'
        });

        try {
            const response = await docClient.send(command);
            return response.Attributes;
        } catch (error) {
            console.error('Error updating item:', error);
            throw error;
        }
    },

    // Delete an item
    async delete(tableName, key) {
        const command = new DeleteCommand({
            TableName: tableName,
            Key: key
        });

        try {
            return await docClient.send(command);
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error;
        }
    }
}
