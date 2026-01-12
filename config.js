// Configuration file for reseller creation bot
require('dotenv').config();

module.exports = {
  // Base URL - Update this with your actual application URL
  // Default to provided admin URL; override via BASE_URL
  baseUrl: process.env.BASE_URL || 'https://test-reseller.singleinterface.com/admin',
  
  // Admin credentials - Update these with actual credentials
  adminCredentials: {
    email: process.env.ADMIN_EMAIL || 'admin@reseller.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@2025'
  },
  
  // Reseller test data
  resellerData: {
    // Basic Info
    resellerName: `Test Reseller ${Date.now()}`,
    phoneNumber: '9891915456',
    location: 'India', // Location to select in the dropdown
    geoCovered: ['China'], // Regions to select if applicable
    onboardingFee: '100.00',
    monthlyShare: '20',
    description: 'Test reseller created by automation bot',
    
            // Users - Email with random number to avoid duplicates
            generateUserEmail: () => {
              const randomNumber = Math.floor(Math.random() * 1000000); // Random number between 0 and 999999
              return `mohd.kashif+${randomNumber}@singleinterface.com`;
            },
    
    // Domain
    businessName: 'Business Name Kashif',
    brandDomain: `testbrand${Date.now()}.com`,
    businessUrlDomain: `app.testbrand${Date.now()}.com`,
    
    // Branding
    language: 'English', // Always select English
    makeDefaultLanguage: true, // Always check default language checkbox
    logoPath: './logo.png' // Path to logo file to upload
  },
  
  // Playwright settings
  playwright: {
    // Auto-detect CI environment (GitHub Actions, etc.) and run headless
    // Set HEADLESS=true to force headless, HEADLESS=false to force visible
    headless: process.env.HEADLESS !== undefined 
      ? process.env.HEADLESS === 'true' 
      : process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true',
    slowMo: 25, // Slow down actions by 25ms for visibility (optimized for speed)
    timeout: 60000 // 60 seconds timeout (increased for slow connections)
  }
};
