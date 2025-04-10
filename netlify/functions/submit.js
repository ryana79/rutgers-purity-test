const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "rutgersPurityTest";

const connectToDatabase = async () => {
  console.log("Attempting to connect to MongoDB...");
  try {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    console.log("Connected to MongoDB successfully");
    return { client, db: client.db(dbName) };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

exports.handler = async (event, context) => {
  // For faster function cold starts
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let client;

  try {
    console.log("Parsing request body...");
    const body = JSON.parse(event.body);
    const { score, selections, timestamp } = body;

    console.log("Received data:", {
      score,
      selectionsCount: selections.length,
    });

    // Input validation
    if (typeof score !== "number" || !Array.isArray(selections) || !timestamp) {
      console.error("Invalid input data:", {
        score,
        selectionsType: typeof selections,
        timestamp,
      });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid input data" }),
      };
    }

    // Add client IP (anonymized for privacy)
    const clientIp =
      event.headers["x-forwarded-for"] || event.headers["client-ip"];
    const anonymizedIp = clientIp
      ? clientIp.split(".").slice(0, 3).join(".") + ".0"
      : "unknown";

    const result = {
      score,
      selections,
      timestamp,
      anonymizedIp,
      userAgent: event.headers["user-agent"],
    };

    console.log("Connecting to database...");
    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;

    console.log("Inserting document into results collection...");
    await db.collection("results").insertOne(result);
    console.log("Document inserted successfully");

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Enable CORS for your domain
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Results saved successfully" }),
    };
  } catch (error) {
    console.error("Error saving results:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // Enable CORS for your domain
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        error: "Failed to save results",
        details: error.message,
      }),
    };
  } finally {
    if (client) {
      console.log("Closing MongoDB connection");
      await client.close();
    }
  }
};
