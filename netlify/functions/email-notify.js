// Simple email notification service
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

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

    // Log the email (visible in Netlify function logs)
    console.log('📧 NEW EMAIL SUBMISSION:');
    console.log('Email:', email);
    console.log('Timestamp:', timestamp || new Date().toISOString());
    console.log('User Agent:', userAgent || 'Unknown');
    console.log('IP Address:', event.headers['x-forwarded-for'] || 'Unknown');
    console.log('----------------------------');

    // For production, you could integrate with:
    // - Emailjs (send yourself an email)
    // - Zapier webhook
    // - Google Sheets API
    // - Airtable API
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Email logged successfully',
        email: email,
        timestamp: timestamp || new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error processing email:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: 'Failed to process email. Please try again later.',
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
