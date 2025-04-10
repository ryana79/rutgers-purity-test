const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./db');
const routes = require('./routes');
const helmet = require('helmet');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(helmet());

// Routes
app.use('/api', routes);

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        await connectToDatabase();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app; 