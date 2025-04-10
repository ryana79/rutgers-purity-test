const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'rutgersPurityTest';

let client;
let db;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Only use in development!

async function connectToDatabase() {
    try {
        client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
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