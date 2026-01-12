// Vercel serverless function for reseller bot
const { createReseller } = require('../bot');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Starting reseller creation bot...');
    
    // Run the bot
    await createReseller();
    
    res.status(200).json({
      success: true,
      message: 'Reseller created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating reseller:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
};
