/**
 * Test SMTP/Gmail connection
 * Usage: node test-smtp.js
 */

const https = require('https');

// SMTP credentials (from your GitHub secrets)
const SMTP_CONFIG = {
  server: 'smtp.gmail.com',
  port: 587,
  username: 'mohd.kashif@singleinterface.com',
  password: 'xgmy mahf uthw pnll', // New App Password
  from: 'mohd.kashif@singleinterface.com',
  to: 'mohd.kashif@singleinterface.com'
};

console.log('🧪 Testing SMTP/Gmail Connection...\n');
console.log('📧 Configuration:');
console.log(`   Server: ${SMTP_CONFIG.server}`);
console.log(`   Port: ${SMTP_CONFIG.port}`);
console.log(`   Username: ${SMTP_CONFIG.username}`);
console.log(`   To: ${SMTP_CONFIG.to}\n`);

// Test using nodemailer (if available) or simple SMTP test
try {
  // Try to use nodemailer if available
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    host: SMTP_CONFIG.server,
    port: SMTP_CONFIG.port,
    secure: false, // true for 465, false for other ports
    auth: {
      user: SMTP_CONFIG.username,
      pass: SMTP_CONFIG.password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  console.log('🔍 Verifying SMTP connection...');
  
  transporter.verify(function (error, success) {
    if (error) {
      console.error('❌ SMTP Verification Failed:');
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      
      if (error.code === 'EAUTH') {
        console.error('\n💡 Authentication failed. Possible issues:');
        console.error('   1. Wrong password (make sure you\'re using App Password, not regular password)');
        console.error('   2. 2-Step Verification not enabled');
        console.error('   3. App Password expired or revoked');
        console.error('\n   Get new App Password: https://myaccount.google.com/apppasswords');
      } else if (error.code === 'ECONNECTION') {
        console.error('\n💡 Connection failed. Possible issues:');
        console.error('   1. Wrong SMTP server address');
        console.error('   2. Firewall blocking port 587');
        console.error('   3. Network connectivity issue');
      }
      process.exit(1);
    } else {
      console.log('✅ SMTP Connection Verified!');
      console.log('\n📧 Sending test email...');
      
      const mailOptions = {
        from: SMTP_CONFIG.from,
        to: SMTP_CONFIG.to,
        subject: 'Test Email from Reseller Bot',
        html: `
          <h2>✅ SMTP Test Successful!</h2>
          <p>This is a test email to verify SMTP/Gmail configuration.</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p>If you received this, your SMTP settings are working correctly!</p>
        `
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error('❌ Failed to send test email:');
          console.error(`   Error: ${error.message}`);
          process.exit(1);
        } else {
          console.log('✅ Test email sent successfully!');
          console.log(`   Message ID: ${info.messageId}`);
          console.log(`   Response: ${info.response}`);
          console.log('\n📬 Check your inbox: mohd.kashif@singleinterface.com');
          console.log('   (Check spam folder if not in inbox)');
        }
      });
    }
  });
  
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('📦 Installing nodemailer...');
    console.log('   Run: npm install nodemailer');
    console.log('   Then run this script again');
  } else {
    console.error('❌ Error:', e.message);
  }
  process.exit(1);
}
