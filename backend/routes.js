const express = require('express');
const { getDb } = require('./db');

const router = express.Router();

// Submit test results
router.post('/submit-results', async (req, res) => {
    try {
        const { score, selections, timestamp } = req.body;
        
        // Input validation
        if (typeof score !== 'number' || !Array.isArray(selections) || !timestamp) {
            return res.status(400).json({ error: 'Invalid input data' });
        }
        
        // Add client IP (anonymized for privacy)
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const anonymizedIp = clientIp.split('.').slice(0, 3).join('.') + '.0';
        
        const result = {
            score,
            selections,
            timestamp,
            anonymizedIp,
            userAgent: req.headers['user-agent']
        };
        
        const db = getDb();
        await db.collection('results').insertOne(result);
        
        res.status(200).json({ message: 'Results saved successfully' });
    } catch (error) {
        console.error('Error saving results:', error);
        res.status(500).json({ error: 'Failed to save results' });
    }
});

// Get statistics
router.get('/statistics', async (req, res) => {
    try {
        const db = getDb();
        
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
        
        res.status(200).json({
            averageScore,
            totalSubmissions,
            topSelections: selectionsFrequency
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router; 