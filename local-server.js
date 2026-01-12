// Simple local HTTP server to trigger the reseller creation bot
// Usage:
//   node local-server.js
// Then hit: http://localhost:4000/api/reseller-bot

const http = require('http');
const url = require('url');
const { createReseller } = require('./bot');

const PORT = process.env.PORT || 4000;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Basic CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (parsedUrl.pathname === '/api/reseller-bot') {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
    }

    try {
      console.log('Starting reseller creation bot (local server)...');
      await createReseller();

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          success: true,
          message: 'Reseller created successfully',
          timestamp: new Date().toISOString()
        })
      );
    } catch (error) {
      console.error('Error creating reseller (local server):', error);

      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        })
      );
    }
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Local reseller bot server running at http://localhost:${PORT}/api/reseller-bot`);
});

