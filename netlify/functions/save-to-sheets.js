// Google Sheets integration for email storage
// Requires GOOGLE_SHEETS_URL environment variable

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
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { email, timestamp, userAgent } = JSON.parse(event.body);

    // Validate email
    if (!email || !isValidEmail(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // Google Sheets Web App URL (you create this)
    const sheetsUrl = process.env.GOOGLE_SHEETS_URL;
    
    if (sheetsUrl) {
      // Send to Google Sheets
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('timestamp', timestamp || new Date().toISOString());
      formData.append('userAgent', userAgent || 'Unknown');
      formData.append('source', 'spin-wheel');

      await fetch(sheetsUrl, {
        method: 'POST',
        body: formData
      });
    }

    // Log to console as backup
    console.log('📧 Email saved:', email, 'at', new Date().toISOString());

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Email saved successfully',
        email: email
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to save email' })
    };
  }
};

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
