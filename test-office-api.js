/**
 * Test Office API email endpoint
 * Usage: node test-office-api.js
 * 
 * Set environment variables:
 *   OFFICE_API_URL=https://your-api-endpoint.com/send-email
 *   OFFICE_API_KEY=your-api-key
 */

const https = require('https');
const http = require('http');

// Configuration - Update these with your Office API details
const API_CONFIG = {
  url: process.env.OFFICE_API_URL || 'https://your-api-endpoint.com/send-email',
  method: 'POST', // Change to 'GET' if needed
  headers: {
    'Content-Type': 'application/json',
    // Add your API key header here - adjust based on your API requirements
    'Authorization': `Bearer ${process.env.OFFICE_API_KEY || 'your-api-key'}`,
    // Alternative: 'X-API-Key': process.env.OFFICE_API_KEY,
    // Alternative: 'API-Key': process.env.OFFICE_API_KEY,
  }
};

// Email data
const emailData = {
  to: 'mohd.kashif@singleinterface.com',
  subject: '🧪 Test Email from Office API',
  body: `
    <h2>✅ Office API Test Successful!</h2>
    <p>This is a test email sent via Office API.</p>
    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
    <p>If you received this email, the Office API is working correctly!</p>
  `,
  // Add any other fields your API requires
};

console.log('🧪 Testing Office API Email...\n');
console.log('📧 Configuration:');
console.log(`   API URL: ${API_CONFIG.url}`);
console.log(`   Method: ${API_CONFIG.method}`);
console.log(`   To: ${emailData.to}`);
console.log(`   Subject: ${emailData.subject}\n`);

// Determine if URL is HTTP or HTTPS
const url = new URL(API_CONFIG.url);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

// Prepare request options
const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname + url.search,
  method: API_CONFIG.method,
  headers: API_CONFIG.headers
};

// Prepare request body
const requestBody = JSON.stringify(emailData);
options.headers['Content-Length'] = Buffer.byteLength(requestBody);

console.log('📤 Sending request...\n');

// Make the request
const req = client.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`📥 Response Status: ${res.statusCode} ${res.statusMessage}`);
    console.log(`📥 Response Headers:`, res.headers);
    console.log(`📥 Response Body:`, responseData);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('\n✅ Email sent successfully via Office API!');
      console.log('📬 Check your inbox: mohd.kashif@singleinterface.com');
    } else {
      console.error('\n❌ Failed to send email');
      console.error(`   Status: ${res.statusCode}`);
      console.error(`   Response: ${responseData}`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
  console.error('\n💡 Check:');
  console.error('   1. API URL is correct');
  console.error('   2. API key is valid');
  console.error('   3. Network connectivity');
  console.error('   4. API endpoint is accessible');
  process.exit(1);
});

// Send request body
req.write(requestBody);
req.end();
