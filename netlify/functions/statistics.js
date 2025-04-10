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
  
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  let client;
  
  try {
    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;
    
    // Calculate average score
    const avgScoreResult = await db.collection('results').aggregate([
      { $group: { _id: null, averageScore: { $avg: "$score" } } }
    ]).toArray();
    
    const averageScore = avgScoreResult.length > 0 ? avgScoreResult[0].averageScore : 0;
    
    // Calculate most common selections
    const selectionsFrequency = await db.collection('results').aggregate([
      { $unwind: "$selections" },
      { $group: { _id: "$selections", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    // Count total submissions
    const totalSubmissions = await db.collection('results').countDocuments();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        averageScore,
        totalSubmissions,
        topSelections: selectionsFrequency
      })
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch statistics' })
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
}; 