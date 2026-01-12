// Helper script to create .env file if it doesn't exist
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from .env.example...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created! Please update it with your actual credentials.');
  } else {
    // Create default .env file
    const defaultEnv = `# Base URL of your application
BASE_URL=http://localhost:3000

# Admin credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Playwright settings
HEADLESS=true
`;
    fs.writeFileSync(envPath, defaultEnv);
    console.log('✅ Default .env file created! Please update it with your actual credentials.');
  }
} else {
  console.log('ℹ️  .env file already exists.');
}
