const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'rutgersPurityTest';

let client;
let db;

async function connectToDatabase() {
    try {
        // Simplified connection options
        client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB');
        
        db = client.db(dbName);
        
        // Create indexes if needed
        await db.collection('results').createIndex({ timestamp: -1 });
        
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return db;
}

function closeConnection() {
    if (client) {
        client.close();
        console.log('MongoDB connection closed');
    }
}

process.on('SIGINT', () => {
    closeConnection();
    process.exit(0);
});

module.exports = {
    connectToDatabase,
    getDb,
    closeConnection
}; 