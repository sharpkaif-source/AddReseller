/**
 * Test SendGrid email API
 * Usage: node test-office-api.js
 * 
 * Set environment variable:
 *   SENDGRID_API_KEY=your-sendgrid-api-key
 */

const https = require('https');

// Configuration - SendGrid API
const API_KEY = process.env.SENDGRID_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: SENDGRID_API_KEY environment variable is required');
  console.error('   Set it with: export SENDGRID_API_KEY=your-api-key');
  process.exit(1);
}

// Email data - SendGrid format
const emailData = {
  personalizations: [
    {
      to: [
        { email: 'mohd.kashif@singleinterface.com' }
      ]
    }
  ],
  from: {
    email: 'mohd.kashif@singleinterface.com',
    name: 'SingleInterface'
  },
  reply_to: {
    email: 'mohd.kashif@singleinterface.com',
    name: 'SingleInterface'
  },
  subject: '🧪 Test Email from SendGrid',
  content: [
    {
      type: 'text/html',
      value: `
        <h2>✅ SendGrid Test Successful!</h2>
        <p>This is a test email sent via SendGrid API.</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p>If you received this email, SendGrid is working correctly!</p>
      `
    }
  ],
  tracking_settings: {
    click_tracking: {
      enable: true,
      enable_text: false
    },
    open_tracking: {
      enable: true,
      substitution_tag: '%open-track%'
    },
    subscription_tracking: {
      enable: true
    }
  },
  categories: ['reseller_bot', 'test']
};

console.log('🧪 Testing SendGrid Email...\n');
console.log('📧 Configuration:');
console.log(`   API: SendGrid (https://api.sendgrid.com/v3/mail/send)`);
console.log(`   To: ${emailData.personalizations[0].to[0].email}`);
console.log(`   Subject: ${emailData.subject}\n`);

// Prepare request options for SendGrid
const options = {
  hostname: 'api.sendgrid.com',
  port: 443,
  path: '/v3/mail/send',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
};

// Prepare request body
const requestBody = JSON.stringify(emailData);
options.headers['Content-Length'] = Buffer.byteLength(requestBody);

console.log('📤 Sending request to SendGrid...\n');

// Make the request
const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`📥 Response Status: ${res.statusCode} ${res.statusMessage}`);
    console.log(`📥 Response Headers:`, res.headers);
    console.log(`📥 Response Body:`, responseData);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('\n✅ Email sent successfully via SendGrid!');
      console.log('📬 Check your inbox: mohd.kashif@singleinterface.com');
    } else {
      console.error('\n❌ Failed to send email');
      console.error(`   Status: ${res.statusCode}`);
      console.error(`   Response: ${responseData}`);
      if (res.statusCode === 401) {
        console.error('\n💡 Authentication failed. Check:');
        console.error('   1. SendGrid API key is correct');
        console.error('   2. API key has "Mail Send" permissions');
      }
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
  console.error('\n💡 Check:');
  console.error('   1. SendGrid API key is correct');
  console.error('   2. Network connectivity');
  console.error('   3. SendGrid service status');
  process.exit(1);
});

// Send request body
req.write(requestBody);
req.end();
