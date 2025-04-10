const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'rutgersPurityTest';

const connectToDatabase = async () => {
  const client = new MongoClient(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  });
  await client.connect();
  return { client, db: client.db(dbName) };
};

exports.handler = async (event, context) => {
  // For faster function cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  let client;
  
  try {
    const body = JSON.parse(event.body);
    const { score, selections, timestamp } = body;
    
    // Input validation
    if (typeof score !== 'number' || !Array.isArray(selections) || !timestamp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid input data' })
      };
    }
    
    // Add client IP (anonymized for privacy)
    const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'];
    const anonymizedIp = clientIp ? clientIp.split('.').slice(0, 3).join('.') + '.0' : 'unknown';
    
    const result = {
      score,
      selections,
      timestamp,
      anonymizedIp,
      userAgent: event.headers['user-agent']
    };
    
    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;
    
    await db.collection('results').insertOne(result);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Results saved successfully' })
    };
  } catch (error) {
    console.error('Error saving results:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save results' })
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
}; 