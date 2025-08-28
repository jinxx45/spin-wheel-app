const { MongoClient } = require('mongodb');

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'spin_wheel_app';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'emails';

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// MongoDB client (reuse connection)
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

exports.handler = async (event, context) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method Not Allowed',
        message: 'Only POST requests are allowed'
      })
    };
  }

  try {
    // Parse request body
    const requestBody = JSON.parse(event.body);
    const { email, timestamp, userAgent } = requestBody;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid Email',
          message: 'Please provide a valid email address'
        })
      };
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Check if email already exists
    const existingEmail = await collection.findOne({ email: email.toLowerCase() });
    
    if (existingEmail) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: 'Email already registered',
          duplicate: true,
          id: existingEmail._id
        })
      };
    }

    // Create email document
    const emailDocument = {
      email: email.toLowerCase(),
      originalEmail: email,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || 'Unknown',
      ipAddress: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'Unknown',
      source: 'spin-wheel-promotion',
      createdAt: new Date()
    };

    // Insert email into database
    const result = await collection.insertOne(emailDocument);

    // Create indexes for better performance (only on first insert)
    try {
      await collection.createIndex({ email: 1 }, { unique: true });
      await collection.createIndex({ timestamp: 1 });
      await collection.createIndex({ createdAt: 1 });
    } catch (indexError) {
      // Indexes might already exist, ignore error
      console.log('Index creation note:', indexError.message);
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Email saved successfully',
        id: result.insertedId,
        duplicate: false
      })
    };

  } catch (error) {
    console.error('Error processing request:', error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: 'Email already registered',
          duplicate: true
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: 'Failed to save email. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
