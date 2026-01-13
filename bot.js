const { chromium } = require('playwright');
const config = require('./config');

// Debug: Verify script is loading
console.log('📦 Bot script loaded successfully');
console.log('📦 Config loaded:', typeof config);

/**
 * Force zoom to 100% on the page
 */
async function forceZoom100(page) {
  await page.evaluate(() => {
    // Method 1: CSS zoom
    if (document.body) {
      document.body.style.zoom = '1';
      document.body.style.transform = 'scale(1)';
    }
    if (document.documentElement) {
      document.documentElement.style.zoom = '1';
      document.documentElement.style.transform = 'scale(1)';
    }
    
    // Method 2: Override devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', {
      get: () => 1,
      configurable: true
    });
    
    // Method 3: Remove any container constraints
    const containers = document.querySelectorAll('[style*="max-height"], [style*="overflow"]');
    containers.forEach(container => {
      const style = container.getAttribute('style') || '';
      if (style.includes('max-height') || style.includes('overflow: hidden')) {
        container.style.maxHeight = 'none';
        container.style.overflow = 'visible';
      }
    });
    
    // Method 4: Ensure viewport meta tag is correct
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  });
}

/**
 * Bot to test reseller creation through all 4 forms
 */
async function createReseller() {
  const startTime = Date.now();
  let browser;
  let page;
  
  try {
    console.log('🚀 Starting reseller creation bot...');
    console.log(`📍 Base URL: ${config.baseUrl}`);
    console.log(`🔍 Launching browser - headless: ${config.playwright.headless}, slowMo: ${config.playwright.slowMo}`);
    if (!config.playwright.headless) {
      console.log('⏳ Please wait - browser window should appear in a few seconds...');
    } else {
      console.log('🤖 Running in headless mode (CI environment detected)');
    }
    
    console.log('⏳ Attempting to launch Chromium browser...');
    try {
      browser = await chromium.launch({
        headless: config.playwright.headless,
        slowMo: config.playwright.slowMo || 100,
        args: [
          '--start-maximized',
          '--disable-dev-shm-usage',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--force-device-scale-factor=1',  // Force 100% zoom
          '--disable-blink-features=AutomationControlled',
          '--window-size=1920,1080'
        ]
      });
      
      console.log('✅ Browser launched successfully!');
      try {
        const process = browser.process();
        console.log('✅ Browser process ID:', process?.pid || 'unknown');
      } catch (e) {
        console.log('✅ Browser process ID: (not available)');
      }
      if (!config.playwright.headless) {
        console.log('👀 Look for a Chromium/Chrome browser window - it should be visible now!');
        console.log('📋 If you don\'t see it, check your taskbar or Alt+Tab to find it.');
        console.log('⏳ Waiting 3 seconds to ensure browser window appears...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('✅ Wait complete - browser should be visible now');
      }
    } catch (launchError) {
      console.error('❌ ERROR launching browser:', launchError);
      console.error('❌ Error message:', launchError.message);
      console.error('❌ Full error:', launchError);
      throw launchError;
    }
    
    // Create context with proper viewport - use larger size to see full form
    console.log('⏳ Creating browser context...');
    const browserContext = await browser.newContext({
      viewport: { width: 2560, height: 1440 },  // Larger viewport to see more content
      deviceScaleFactor: 1,  // 100% zoom - no scaling
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    page = await browserContext.newPage();
    page.setDefaultTimeout(config.playwright.timeout);
    
    // Set viewport size - use larger size
    await page.setViewportSize({ width: 2560, height: 1440 });
    
    // Set zoom to 100% using multiple methods
    await page.addInitScript(() => {
      // Method 1: Override devicePixelRatio
      Object.defineProperty(window, 'devicePixelRatio', {
        get: () => 1,
        configurable: true
      });
      
      // Method 2: Set CSS zoom on body
      if (document.body) {
        document.body.style.zoom = '1';
      }
      
      // Method 3: Set CSS zoom on html
      if (document.documentElement) {
        document.documentElement.style.zoom = '1';
      }
    });
    
    // After page loads, also set zoom via evaluate
    page.on('load', async () => {
      await page.evaluate(() => {
        if (document.body) {
          document.body.style.zoom = '1';
        }
        if (document.documentElement) {
          document.documentElement.style.zoom = '1';
        }
      });
    });
    
    // Step 1: Navigate to login page
    console.log('\n📝 Step 1: Navigating to login page...');
    console.log(`   🔗 URL: ${config.baseUrl}`);
    
    // Navigate with longer timeout and use domcontentloaded instead of load
    await page.goto(config.baseUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 // 60 seconds timeout
    });
    
    // Force zoom to 100% after page loads
    await forceZoom100(page);
    
    // Wait for network to be idle (but with timeout)
    try {
      await page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (e) {
      console.log('   ⚠️  Network not idle, but page loaded - continuing...');
    }
    
    await page.waitForTimeout(250); // Wait for page to fully load (optimized)
    
    // Set zoom again after page is fully loaded
    await forceZoom100(page);
    
    // Step 2: Login as Admin
    console.log('🔐 Step 2: Logging in as Admin...');
    await loginAsAdmin(page);
    
    // Step 3: Navigate to Reseller Dashboard
    console.log('📊 Step 3: Navigating to Reseller Dashboard...');
    await navigateToResellerDashboard(page);
    
    // Step 4: Click Add Reseller button
    console.log('➕ Step 4: Clicking Add Reseller button...');
    await clickAddReseller(page);
    
    // Step 5: Fill Basic Info form (Step 1) - TEMPORARY SAVE ONLY
    console.log('📋 Step 5: Filling Basic Info form (Step 1 of 4 - Temporary Save)...');
    await fillBasicInfoForm(page);
    
    // Step 6: After Basic Info, "Next Step" should take us to Users form
    // CORRECT FLOW: Basic Info → Users → Domain → Branding
    // But sometimes it takes us to Domain first - if so, use Back button to go to Users
    console.log('👥 Step 6: Filling Users form (Step 2 of 4 - Temporary Save)...');
    
    // Check which form "Next Step" took us to
    await page.waitForTimeout(250); // Reduced from 2s
    const formCheck = await page.evaluate(() => {
      const emailInputs = document.querySelectorAll('input[type="email"], input[placeholder*="email" i], input[placeholder*="@" i], input[placeholder*="example.com" i]');
      const domainInputs = document.querySelectorAll('input[placeholder*="Awesome Brand" i], input[placeholder*="mybrand.com" i]');
      return {
        hasEmailInputs: emailInputs.length > 0,
        hasDomainInputs: domainInputs.length > 0,
        emailInputCount: emailInputs.length,
        domainInputCount: domainInputs.length
      };
    });
    
    if (formCheck.hasDomainInputs && !formCheck.hasEmailInputs) {
      // "Next Step" took us to Domain form, but we need Users form first!
      console.log('   ⚠️  "Next Step" took us to Domain form, but we need Users form first!');
      console.log('   🔙 Clicking Back button (left bottom) to go back to Users form...');
      
      // Back button is on left bottom of the page - find it by position
      const backButtonInfo = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const backButtons = buttons.filter(btn => {
          const text = btn.textContent?.trim() || '';
          return text.includes('Back') && !text.includes('Dashboard');
        });
        
        // Find the button that's positioned on the left bottom
        let leftBottomButton = null;
        let minDistance = Infinity;
        
        backButtons.forEach(btn => {
          const rect = btn.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;
          
          // Calculate distance from left bottom corner
          const distanceFromLeft = rect.left;
          const distanceFromBottom = viewportHeight - rect.bottom;
          const totalDistance = distanceFromLeft + distanceFromBottom;
          
          // Prefer buttons that are closer to left bottom
          if (rect.bottom > viewportHeight * 0.7 && rect.left < viewportWidth * 0.3) {
            if (totalDistance < minDistance) {
              minDistance = totalDistance;
              leftBottomButton = btn;
            }
          }
        });
        
        return leftBottomButton ? {
          found: true,
          text: leftBottomButton.textContent?.trim() || '',
          tagName: leftBottomButton.tagName,
          className: leftBottomButton.className || ''
        } : { found: false };
      });
      
      if (backButtonInfo.found) {
        console.log(`   🔍 Found Back button on left bottom: "${backButtonInfo.text}"`);
        
        // Wait for overlay to disappear
        await page.waitForSelector('div.fixed.inset-0.z-0', { state: 'hidden', timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(250);
        
        // Click Back button - it should take us to Users form (one step back from Domain)
        const backButton = page.locator(`button:has-text("${backButtonInfo.text}"), a:has-text("${backButtonInfo.text}")`).first();
        await backButton.evaluate((el) => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.click();
        });
        console.log('   ✓ Clicked Back button - should be on Users form now');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(250); // Reduced from 2s
        
        // Verify we're on Users form now
        const verifyForm = await page.evaluate(() => {
          const emailInputs = document.querySelectorAll('input[type="email"], input[placeholder*="email" i], input[placeholder*="@" i], input[placeholder*="example.com" i]');
          return emailInputs.length > 0;
        });
        
        if (!verifyForm) {
          throw new Error('CRITICAL: After clicking Back, still not on Users form. Cannot proceed.');
        }
        console.log('   ✓ Verified: Now on Users form');
      } else {
        // Fallback: try standard selector
        const backButton = page.locator('button:has-text("Back"):not(:has-text("Dashboard")), a:has-text("Back"):not(:has-text("Dashboard"))').first();
        if (await backButton.count() > 0) {
          await page.waitForSelector('div.fixed.inset-0.z-0', { state: 'hidden', timeout: 5000 }).catch(() => {});
          await page.waitForTimeout(250);
          await backButton.evaluate((el) => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.click();
          });
          console.log('   ✓ Clicked Back button (fallback) - should be on Users form now');
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(250); // Reduced from 2s
        } else {
          throw new Error('CRITICAL: Back button not found on left bottom. Cannot navigate to Users form.');
        }
      }
    }
    
    // Now fill Users form (we should be on it now)
    await fillUsersForm(page);
    
    // Step 7: Fill Domain form (Step 3) - TEMPORARY SAVE ONLY
    // After Users, "Next Step" should take us to Domain form
    console.log('🌐 Step 7: Filling Domain form (Step 3 of 4 - Temporary Save)...');
    await fillDomainForm(page);
    
    // Step 8: Fill Branding form (Step 4) - FINAL STEP
    console.log('🎨 Step 8: Filling Branding form (Step 4 of 4 - Final Step)...');
    await fillBrandingForm(page);
    
    // Step 9: Submit and verify - RESELLER CREATED ONLY AFTER THIS STEP
    console.log('✅ Step 9: Submitting reseller (Final Commit - Reseller Created Here)...');
    const success = await submitReseller(page);
    
    if (success) {
      const endTime = Date.now();
      const totalTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);
      const totalTimeMinutes = (totalTimeSeconds / 60).toFixed(2);
      console.log('\n🎉 Reseller created successfully! (Only after Step 4 completion)');
      console.log(`⏱️  Total time taken: ${totalTimeSeconds} seconds (${totalTimeMinutes} minutes)`);
    } else {
      const endTime = Date.now();
      const totalTimeSeconds = ((endTime - startTime) / 1000).toFixed(2);
      console.log(`⏱️  Total time taken before failure: ${totalTimeSeconds} seconds`);
      throw new Error('Reseller creation failed - check logs for details');
    }
    
    // Wait a bit to see the result
    await page.waitForTimeout(2000);
    
  } catch (error) {
    const endTime = Date.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);
    console.error('\n❌ Error occurred:', error.message);
    console.error('Full error:', error);
    console.error('Stack:', error.stack);
    console.error(`⏱️  Total time taken before error: ${totalTime} seconds`);
    
    // Take screenshot on error
    if (page) {
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true }).catch(() => {});
      console.log('📸 Screenshot saved as error-screenshot.png');
    }
    
    // Keep browser open for 30 seconds so user can see what happened
    console.log('⚠️  Browser will stay open for 30 seconds so you can see what happened...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Login as Admin
 */
async function loginAsAdmin(page) {
  console.log(`   📧 Email: ${config.adminCredentials.email}`);
  
  // Wait for login form elements - try multiple selectors
  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[placeholder*="email" i]',
    'input[id*="email" i]',
    'input[type="text"]'
  ];
  
  const passwordSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input[id*="password" i]'
  ];
  
  let emailInput = null;
  let passwordInput = null;
  
  // Try to find email input
  for (const selector of emailSelectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        emailInput = element;
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  // Try to find password input
  for (const selector of passwordSelectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        passwordInput = element;
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  if (emailInput && passwordInput) {
    await emailInput.fill(config.adminCredentials.email);
    await page.waitForTimeout(250);
    await passwordInput.fill(config.adminCredentials.password);
    await page.waitForTimeout(250);
    
    // Find and click login button - try multiple selectors
    const loginButtonSelectors = [
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      'button[type="submit"]',
      'input[type="submit"]',
      'button.primary',
      'button[class*="login" i]'
    ];
    
    let loginButton = null;
    for (const selector of loginButtonSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          loginButton = element;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (loginButton) {
      await loginButton.click();
      console.log('   ✓ Login button clicked');
    } else {
      // Try pressing Enter as fallback
      await passwordInput.press('Enter');
      console.log('   ✓ Pressed Enter to submit');
    }
    
    // Wait for navigation after login
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(250); // Wait for redirect (optimized)
    
    // Check if login was successful by looking for dashboard elements
    const dashboardIndicator = page.locator('text=/dashboard|reseller/i');
    if (await dashboardIndicator.count() > 0) {
      console.log('   ✓ Login successful - Dashboard detected');
    } else {
      console.log('   ⚠️  Login completed, but dashboard not immediately visible');
    }
  } else {
    console.log('⚠️  Login form not found, checking if already logged in...');
    // Take screenshot for debugging
    try {
      await page.screenshot({ path: 'login-page.png', fullPage: true, timeout: 5000 });
    } catch (e) {
      console.warn('   ⚠️  Failed to capture login-page screenshot:', e.message);
    }
    console.log('   📸 Screenshot saved as login-page.png');
  }
}

/**
 * Navigate to Reseller Dashboard
 */
async function navigateToResellerDashboard(page) {
  // Check current URL - if already on dashboard, skip navigation
  const currentUrl = page.url();
  if (currentUrl.includes('dashboard') || currentUrl.includes('reseller')) {
    console.log('   ✓ Already on dashboard/reseller page');
    return;
  }
  
  // Look for dashboard link or "Back to Dashboard" link
  let dashboardLinkLocator = page.locator('a:has-text("Dashboard"), a:has-text("Reseller Dashboard"), a:has-text("Back to Dashboard")');
  if (await dashboardLinkLocator.count() > 0) {
    const dashboardLink = dashboardLinkLocator.first();
    await dashboardLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(250);
  } else {
    // Try direct navigation - remove /admin and add /dashboard or navigate to root
    const baseUrl = config.baseUrl.replace('/admin', '');
    try {
      await page.goto(`${baseUrl}/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    } catch (e) {
      // Try root URL
      await page.goto(baseUrl).catch(() => {});
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
  }
  
  // Verify we're on the dashboard by looking for "Reseller Dashboard" text or "Add Reseller" button
  const dashboardIndicator = page.locator('text=/reseller dashboard|add reseller/i');
  if (await dashboardIndicator.count() > 0) {
    console.log('   ✓ Reseller Dashboard loaded');
  }
}

/**
 * Click Add Reseller button
 */
async function clickAddReseller(page) {
  const addResellerButton = await page.waitForSelector('button:has-text("Add Reseller"), a:has-text("Add Reseller")', { timeout: 10000 });
  await addResellerButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(250);
}

/**
 * Fill Basic Info form (Step 1)
 */
async function fillBasicInfoForm(page) {
  // Wait for form to be visible
  await page.waitForSelector('text=Basic Info', { timeout: 10000 });
  await page.waitForTimeout(250);
  
  // Scroll to reveal all form fields
  console.log('   📜 Scrolling to reveal all Basic Info form fields...');
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
  
  // Scroll down to ensure all fields are visible (optimized - reduced iterations)
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, 400);
    });
    await page.waitForTimeout(100);
  }
  
  // Scroll back to top
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
  
  // Reseller Name - Look for label "Reseller Name *" and find input near it
  const resellerNameInput = await page.locator('input[placeholder*="TechSolutions" i], input[placeholder*="Reseller Name" i]').first();
  await resellerNameInput.fill(config.resellerData.resellerName);
  await page.waitForTimeout(300);
  
  // Phone Number - Look for placeholder with phone format or label containing "Phone"
  const phoneInputSelectors = [
    'input[placeholder*="Phone" i]',
    'input[type="tel"]',
    'input[name*="phone" i]',
    'input[id*="phone" i]',
    'input[placeholder*="555" i]'
  ];
  
  let phoneInput = null;
  for (const selector of phoneInputSelectors) {
    const locator = page.locator(selector);
    if (await locator.count() > 0) {
      phoneInput = locator.first();
      break;
    }
  }
  
  if (phoneInput) {
    await phoneInput.click(); // Click to focus
    await phoneInput.clear(); // Clear any existing value
    await phoneInput.fill(config.resellerData.phoneNumber);
    console.log(`   ✓ Phone number filled: ${config.resellerData.phoneNumber}`);
    await page.waitForTimeout(250);
  } else {
    console.log('   ⚠️  Phone input not found, trying alternative selectors...');
    // Try to find by label text
    let phoneLabel = null;
    try {
      const phoneLabelLocator = page.locator('label:has-text("Phone" i)').first();
      if (await phoneLabelLocator.count() > 0) {
        phoneLabel = phoneLabelLocator;
      }
    } catch (e) {
      // Phone label not found, continue
    }
    if (phoneLabel) {
      let phoneInputId = null;
      try {
        phoneInputId = await phoneLabel.getAttribute('for');
      } catch (e) {
        // Attribute not found
      }
      if (phoneInputId) {
        phoneInput = page.locator(`#${phoneInputId}`);
        await phoneInput.fill(config.resellerData.phoneNumber);
        console.log(`   ✓ Phone number filled via label: ${config.resellerData.phoneNumber}`);
        await page.waitForTimeout(250);
      }
    }
  }
  
  // Location dropdown - Look for "Select location" placeholder
  const locationSelect = await page.locator('input[placeholder*="Select location" i], select, [role="combobox"]').first();
  await locationSelect.click();
  await page.waitForTimeout(250);
  
  // Try to select the location from dropdown options
  let locationSelected = false;

  // 1) If it's a native <select>, try selectOption by label
  try {
    const nativeSelect = await page.locator('select').first();
    if (await nativeSelect.isVisible()) {
      await nativeSelect.selectOption({ label: config.resellerData.location });
      locationSelected = true;
    }
  } catch (e) {
    // ignore and fall back
  }

  // 2) Fallback: click option by visible text
  if (!locationSelected) {
    const locationOptionLocator = page.locator(`text=${config.resellerData.location}`);
    if (await locationOptionLocator.count() > 0) {
      const locationOption = locationOptionLocator.first();
      await locationOption.click();
      locationSelected = true;
    }
  }

  // 3) Final fallback: type and press Enter
  if (!locationSelected) {
    await locationSelect.fill(config.resellerData.location);
    await page.waitForTimeout(150);
    await page.keyboard.press('Enter');
  }
  await page.waitForTimeout(250);
  
  // Geo Covered - Click dropdown, select option, then click outside to close
  console.log(`   🌍 Filling Geo Covered: ${config.resellerData.geoCovered.join(', ')}`);
  if (config.resellerData.geoCovered && config.resellerData.geoCovered.length > 0) {
    for (let i = 0; i < config.resellerData.geoCovered.length; i++) {
      const region = config.resellerData.geoCovered[i];
      
      // Wait a bit and re-locate the input for each region (it might be cleared/re-rendered after each selection)
      await page.waitForTimeout(250);
      
      // Try multiple ways to find the Geo Covered input
      let geoInput = null;
      const geoInputSelectors = [
        'input[placeholder="Type to search regions..."]',
        'input[placeholder*="Type to search" i]',
        'input[placeholder*="regions" i]',
        'input[type="text"]' // Last resort
      ];
      
      for (const selector of geoInputSelectors) {
        const geoInputLocator = page.locator(selector).first();
        if (await geoInputLocator.count() > 0) {
          const isVisible = await geoInputLocator.isVisible().catch(() => false);
          if (isVisible) {
            geoInput = geoInputLocator;
            break;
          }
        }
      }
      
      if (geoInput) {
        await geoInput.scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
        
        // Step 1: Click the input to open the dropdown (DO NOT fill with text)
        await geoInput.click();
          await page.waitForTimeout(300); // Wait for dropdown to appear (optimized)
        
        // Step 2: Select the region from the dropdown options using XPath
        try {
          // Wait for dropdown options to appear
          await page.waitForTimeout(250);
          
          // Use XPath for China option: //*[@id="root"]/div/div[1]/div[2]/form/div[3]/div[1]/div/div[4]
          // For other regions, we'll use text-based search as fallback
          let regionOption = null;
          
          if (region === 'China') {
            // Use the provided XPath for China
            const chinaXPath = '//*[@id="root"]/div/div[1]/div[2]/form/div[3]/div[1]/div/div[4]';
            regionOption = page.locator(`xpath=${chinaXPath}`).first();
            console.log(`   🔍 Using XPath to find China option...`);
          } else {
            // For other regions, try text-based search
            regionOption = page.locator(`text=${region}`).first();
          }
          
          if (await regionOption.count() > 0) {
            // Don't wait for visible state if using XPath (element might be in dropdown container)
            if (region === 'China') {
              // For XPath, just click it directly (it's in the dropdown)
              await regionOption.evaluate((el) => {
                el.scrollIntoView({ behavior: 'auto', block: 'center' });
                el.click();
              });
              console.log(`   ✓ Selected region: ${region} (clicked via XPath)`);
            } else {
              // For text-based, wait for visible
              await regionOption.waitFor({ state: 'visible', timeout: 5000 });
              await regionOption.evaluate((el) => el.click());
              console.log(`   ✓ Selected region: ${region} (clicked option)`);
            }
          } else {
            // Fallback: Try case-insensitive text search
            const regionOptionCI = page.locator(`text=/^${region}$/i`).first();
            if (await regionOptionCI.count() > 0) {
              await regionOptionCI.waitFor({ state: 'visible', timeout: 5000 });
              await regionOptionCI.evaluate((el) => el.click());
              console.log(`   ✓ Selected region: ${region} (clicked option - case-insensitive)`);
            } else {
              throw new Error(`Region option "${region}" not found in dropdown`);
            }
          }
        } catch (e) {
          console.log(`   ⚠️  Error selecting region ${region}: ${e.message}`);
          throw new Error(`Failed to select region "${region}" from dropdown: ${e.message}`);
        }
        
        await page.waitForTimeout(250); // Wait for selection to be added
        
        // Step 3: Click outside the form to close the dropdown
        console.log(`   🔘 Clicking outside form to close dropdown...`);
        try {
          // Method 1: Click on a safe area outside the form using Playwright's click
          // Find a safe click target (e.g., the page header, title, or a non-interactive area)
          const safeClickTarget = page.locator('body').first();
          await safeClickTarget.click({ position: { x: 10, y: 10 } });
          await page.waitForTimeout(150);
          console.log(`   ✓ Clicked outside (top-left corner) to close dropdown`);
        } catch (e) {
          console.log(`   ⚠️  Method 1 failed: ${e.message}, trying method 2...`);
          try {
            // Method 2: Click on a specific element outside the form (e.g., page title or header)
            const pageTitle = page.locator('h1, h2, [class*="title"], [class*="header"]').first();
            if (await pageTitle.count() > 0) {
              await pageTitle.click();
              await page.waitForTimeout(150);
              console.log(`   ✓ Clicked on page title/header to close dropdown`);
            } else {
              // Method 3: Use JavaScript to click on body at a safe position
              await page.evaluate(() => {
                // Click at a safe position (top-left corner of viewport)
                const clickEvent = new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                  clientX: 10,
                  clientY: 10
                });
                document.body.dispatchEvent(clickEvent);
              });
              await page.waitForTimeout(150);
              console.log(`   ✓ Clicked outside via JavaScript to close dropdown`);
            }
          } catch (e2) {
            console.log(`   ⚠️  Method 2 failed: ${e2.message}, trying Escape key...`);
            // Method 4: Press Escape as fallback
            await page.keyboard.press('Escape');
            await page.waitForTimeout(150);
            console.log(`   ✓ Pressed Escape to close dropdown`);
          }
        }
        
        await page.waitForTimeout(250); // Wait for dropdown to close
        
        // CRITICAL: Check if we're still on Basic Info form (not navigated away)
        const currentUrl = page.url();
        if (!currentUrl.includes('add-reseller') && !currentUrl.includes('basic')) {
          console.log(`   ⚠️  WARNING: Page navigated away after selecting ${region}! Current URL: ${currentUrl}`);
          console.log(`   🔙 Navigating back to Basic Info form...`);
          // Try to go back
          await page.goBack().catch(() => {});
          await page.waitForTimeout(2000);
          // Re-verify we're on Basic Info form
          await page.waitForSelector('text=Basic Info', { timeout: 10000 });
        }
      } else {
        console.log(`   ⚠️  Geo Covered input not found for region: ${region} (attempt ${i + 1}/${config.resellerData.geoCovered.length})`);
        // If it's not the last region, continue - might be able to find it next time
        if (i < config.resellerData.geoCovered.length - 1) {
          await page.waitForTimeout(250);
        }
      }
    }
    console.log(`   ✓ Geo Covered filled: ${config.resellerData.geoCovered.join(', ')}`);
    
    // Ensure we're still on Basic Info form before continuing
    await page.waitForSelector('text=Basic Info', { timeout: 5000 }).catch(() => {
      console.log('   ⚠️  Basic Info form not found - might have navigated away');
    });
  }
  
  // Scroll down to reveal Onboarding Fee and Monthly Share fields (they might be below the fold)
  console.log('   📜 Scrolling to reveal Onboarding Fee and Monthly Share fields...');
  await page.evaluate(() => {
    window.scrollBy(0, 400);
  });
  await page.waitForTimeout(250);
  
  // Onboarding Fee - Use exact name attribute
  console.log(`   💰 Filling Onboarding Fee: ${config.resellerData.onboardingFee}`);
  const onboardingFeeInput = page.locator('input[name="onboarding_fee"]').first();
  if (await onboardingFeeInput.count() > 0) {
    await onboardingFeeInput.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await onboardingFeeInput.fill(config.resellerData.onboardingFee);
    await page.waitForTimeout(150);
    const verifyValue = await onboardingFeeInput.inputValue();
    if (verifyValue === config.resellerData.onboardingFee) {
      console.log(`   ✓ Onboarding Fee filled: ${config.resellerData.onboardingFee}`);
    } else {
      console.log(`   ⚠️  Onboarding Fee verification failed. Expected: ${config.resellerData.onboardingFee}, Got: ${verifyValue}`);
    }
  } else {
    console.log(`   ⚠️  Onboarding Fee input not found (name="onboarding_fee") - trying alternative selectors...`);
    // Try alternative selector
    const altOnboardingInput = page.locator('input[placeholder="0.00"], input[type="number"]').first();
    if (await altOnboardingInput.count() > 0) {
      await altOnboardingInput.scrollIntoViewIfNeeded();
      await altOnboardingInput.fill(config.resellerData.onboardingFee);
      console.log(`   ✓ Onboarding Fee filled using alternative selector: ${config.resellerData.onboardingFee}`);
    }
  }
  
  // Monthly Share of Revenue - Use exact name attribute
  console.log(`   📊 Filling Monthly Share: ${config.resellerData.monthlyShare}%`);
  const monthlyShareInput = page.locator('input[name="monthly_share"]').first();
  if (await monthlyShareInput.count() > 0) {
    await monthlyShareInput.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await monthlyShareInput.fill(config.resellerData.monthlyShare);
    await page.waitForTimeout(150);
    const verifyValue = await monthlyShareInput.inputValue();
    if (verifyValue === config.resellerData.monthlyShare) {
      console.log(`   ✓ Monthly Share filled: ${config.resellerData.monthlyShare}%`);
    } else {
      console.log(`   ⚠️  Monthly Share verification failed. Expected: ${config.resellerData.monthlyShare}, Got: ${verifyValue}`);
    }
  } else {
    console.log(`   ⚠️  Monthly Share input not found (name="monthly_share") - trying alternative selectors...`);
    // Try alternative selector - look for input with placeholder "20" or second number input
    const altShareInputs = page.locator('input[placeholder="20"], input[type="number"]');
    const altShareCount = await altShareInputs.count();
    if (altShareCount >= 2) {
      const altShareInput = altShareInputs.nth(1); // Second number input is usually monthly share
      await altShareInput.scrollIntoViewIfNeeded();
      await altShareInput.fill(config.resellerData.monthlyShare);
      console.log(`   ✓ Monthly Share filled using alternative selector: ${config.resellerData.monthlyShare}%`);
    }
  }
  
  // Scroll down to reveal Description field
  console.log('   📜 Scrolling to reveal Description field...');
  await page.evaluate(() => {
    window.scrollBy(0, 200);
  });
  await page.waitForTimeout(300);
  
  // Description - Look for textarea with description placeholder
  console.log(`   📝 Filling Description: ${config.resellerData.description}`);
  const descriptionTextareaLocator = page.locator('textarea[placeholder*="description" i], textarea[placeholder*="Brief description" i]');
  if (await descriptionTextareaLocator.count() > 0) {
    const descriptionTextarea = descriptionTextareaLocator.first();
    await descriptionTextarea.fill(config.resellerData.description);
    await page.waitForTimeout(150);
    console.log(`   ✓ Description filled`);
  } else {
    console.log(`   ⚠️  Description textarea not found`);
  }
  
  // CRITICAL: Verify ALL Basic Info form fields are filled BEFORE clicking Next Step
  console.log(`   🔍 Verifying all Basic Info form fields are filled...`);
  await page.waitForTimeout(250); // Small wait for any form updates
  
  // Verify Reseller Name - Re-locate the element
  const resellerNameInputVerify = page.locator('input[placeholder*="TechSolutions" i], input[placeholder*="Reseller Name" i]').first();
  if (await resellerNameInputVerify.count() > 0) {
    const resellerNameValue = await resellerNameInputVerify.inputValue().catch(() => '');
    if (resellerNameValue !== config.resellerData.resellerName) {
      throw new Error(`CRITICAL: Reseller Name not filled! Expected: "${config.resellerData.resellerName}", Got: "${resellerNameValue}"`);
    }
    console.log(`   ✓ Reseller Name verified: ${resellerNameValue}`);
  } else {
    console.log(`   ⚠️  Reseller Name input not found for verification`);
  }
  
  // Verify Phone Number - Re-locate the element
  const phoneInputVerify = page.locator('input[placeholder*="Phone" i], input[type="tel"], input[name*="phone" i]').first();
  if (await phoneInputVerify.count() > 0) {
    const phoneValue = await phoneInputVerify.inputValue().catch(() => '');
    if (phoneValue !== config.resellerData.phoneNumber) {
      throw new Error(`CRITICAL: Phone Number not filled! Expected: "${config.resellerData.phoneNumber}", Got: "${phoneValue}"`);
    }
    console.log(`   ✓ Phone Number verified: ${phoneValue}`);
  } else {
    console.log(`   ⚠️  Phone Number input not found for verification`);
  }
  
  // Verify Onboarding Fee - Re-locate the element
  const onboardingFeeInputVerify = page.locator('input[name="onboarding_fee"]').first();
  if (await onboardingFeeInputVerify.count() > 0) {
    const onboardingFeeValue = await onboardingFeeInputVerify.inputValue().catch(() => '');
    if (onboardingFeeValue !== config.resellerData.onboardingFee) {
      throw new Error(`CRITICAL: Onboarding Fee not filled! Expected: "${config.resellerData.onboardingFee}", Got: "${onboardingFeeValue}"`);
    }
    console.log(`   ✓ Onboarding Fee verified: ${onboardingFeeValue}`);
  } else {
    console.log(`   ⚠️  Onboarding Fee input not found for verification`);
  }
  
  // Verify Monthly Share - Re-locate the element
  const monthlyShareInputVerify = page.locator('input[name="monthly_share"]').first();
  if (await monthlyShareInputVerify.count() > 0) {
    const monthlyShareValue = await monthlyShareInputVerify.inputValue().catch(() => '');
    if (monthlyShareValue !== config.resellerData.monthlyShare) {
      throw new Error(`CRITICAL: Monthly Share not filled! Expected: "${config.resellerData.monthlyShare}", Got: "${monthlyShareValue}"`);
    }
    console.log(`   ✓ Monthly Share verified: ${monthlyShareValue}%`);
  } else {
    console.log(`   ⚠️  Monthly Share input not found for verification`);
  }
  
  // Summary: All Basic Info form fields from config.js (lines 18-25)
  console.log(`   ✅ ALL Basic Info form fields verified and filled:`);
  console.log(`      - Reseller Name: ${config.resellerData.resellerName}`);
  console.log(`      - Phone Number: ${config.resellerData.phoneNumber}`);
  console.log(`      - Location: ${config.resellerData.location}`);
  console.log(`      - Geo Covered: ${config.resellerData.geoCovered.join(', ')}`);
  console.log(`      - Onboarding Fee: ${config.resellerData.onboardingFee}`);
  console.log(`      - Monthly Share: ${config.resellerData.monthlyShare}%`);
  console.log(`      - Description: ${config.resellerData.description}`);
  
  // Click "Next Step" button to proceed to next form
  // NOTE: Steps are NOT clickable - must use "Next Step" button
  console.log('   🔄 Clicking "Next Step" button to proceed...');
  await page.waitForSelector('div.fixed.inset-0.z-0', { state: 'hidden', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(250);
  
  const nextButton = page.locator('button:has-text("Next Step"), button:has-text("Next")').first();
  try {
    await nextButton.click({ timeout: 5000 });
    console.log('   ✓ Clicked "Next Step" button');
  } catch (e) {
    // If overlay blocks click, use JavaScript click
    await nextButton.evaluate((el) => el.click());
    console.log('   ✓ Clicked "Next Step" button via JavaScript');
  }
  
  // Wait for navigation
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Ensure zoom is still 100% after navigation
  await forceZoom100(page);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  
  console.log(`   ✓ Basic Info filled: ${config.resellerData.resellerName}`);
}

/**
 * Fill Users form (Step 2) - SIMPLIFIED
 */
async function fillUsersForm(page) {
  console.log('   🔍 Waiting for Users form...');
  
  // Wait for form to be present
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);
  
  // CRITICAL: Force zoom to 100%
  await forceZoom100(page);
  
  // Scroll to top and ensure form container is fully visible
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    
    // Make sure form container is visible and not constrained
    const form = document.querySelector('form');
    if (form) {
      form.scrollIntoView({ behavior: 'auto', block: 'start' });
      
      // Remove any constraints on form or its parents
      let element = form;
      for (let i = 0; i < 5 && element; i++) {
        if (element.style) {
          const style = element.style;
          if (style.maxHeight && style.maxHeight !== 'none') {
            style.maxHeight = 'none';
          }
          if (style.overflow === 'hidden' || style.overflow === 'auto') {
            style.overflow = 'visible';
          }
          if (style.height && style.height.includes('px') && parseInt(style.height) < 2000) {
            style.height = 'auto';
          }
        }
        element = element.parentElement;
      }
    }
  });
  await page.waitForTimeout(250);
  
  // Scroll through the form slowly to reveal all fields
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
  
  // Scroll down in steps to make sure all fields are visible (optimized - reduced iterations)
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, 150);
    });
    await page.waitForTimeout(100);
  }
  
  // Scroll back to top
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
  
  // Final zoom check
  await forceZoom100(page);
  
  // Verify zoom level
  const zoomInfo = await page.evaluate(() => {
    return {
      bodyZoom: document.body.style.zoom || 'not set',
      htmlZoom: document.documentElement.style.zoom || 'not set',
      devicePixelRatio: window.devicePixelRatio,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight
    };
  });
  console.log(`   🔍 Zoom check - Body zoom: ${zoomInfo.bodyZoom}, HTML zoom: ${zoomInfo.htmlZoom}, DPR: ${zoomInfo.devicePixelRatio}`);
  console.log(`   🔍 Viewport - Width: ${zoomInfo.viewportWidth}, Height: ${zoomInfo.viewportHeight}, Scroll: ${zoomInfo.scrollHeight}, Client: ${zoomInfo.clientHeight}`);
  
  // CRITICAL: First check if we're actually on the Users form or Domain form
  // IMPORTANT: Check for email inputs more broadly - they might not have type="email"
  const formCheck = await page.evaluate(() => {
    const domainInputs = document.querySelectorAll('input[placeholder*="Awesome Brand" i], input[placeholder*="mybrand.com" i]');
    // Check for email inputs more broadly - including text inputs that might be email fields
    const emailInputsByType = document.querySelectorAll('input[type="email"]');
    const emailInputsByPlaceholder = document.querySelectorAll('input[placeholder*="email" i], input[placeholder*="@" i], input[placeholder*="example.com" i]');
    // Also check for any input that might be an email field (first input in form, or near "email" text)
    const allFormInputs = document.querySelectorAll('form input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
    const emailInputs = new Set([...emailInputsByType, ...emailInputsByPlaceholder]);
    
    const domainText = document.body.textContent.includes('Domain Configuration') || 
                      document.body.textContent.includes('BRAND & DOMAIN');
    const usersText = document.body.textContent.includes('Users') || 
                     document.body.textContent.includes('Manage Reseller Users') ||
                     document.body.textContent.includes('Add email addresses');
    
    return {
      isDomainForm: domainInputs.length > 0 || domainText,
      isUsersForm: emailInputs.size > 0 || usersText,
      domainInputCount: domainInputs.length,
      emailInputCount: emailInputs.size,
      totalFormInputs: allFormInputs.length
    };
  });
  
  console.log(`   🔍 Form check - Domain form: ${formCheck.isDomainForm}, Users form: ${formCheck.isUsersForm}`);
  console.log(`   🔍 Inputs found - Domain inputs: ${formCheck.domainInputCount}, Email inputs: ${formCheck.emailInputCount}, Total form inputs: ${formCheck.totalFormInputs}`);
  
  // CRITICAL: If we detect Domain form inputs, we should NOT be here
  // The form should be: Basic Info -> Users -> Domain -> Branding
  // If we're seeing Domain inputs, something went wrong with navigation
  if (formCheck.domainInputCount > 0 && formCheck.emailInputCount === 0) {
    console.log('   ❌ ERROR: We are on Domain form, not Users form!');
    throw new Error('CRITICAL: fillUsersForm called but we are on Domain form. Navigation failed.');
  }
  
  // Verify we're on Users form
  if (formCheck.emailInputCount === 0) {
    console.log('   ❌ ERROR: No email inputs found on Users form!');
    throw new Error('CRITICAL: fillUsersForm called but no email inputs found. Cannot proceed.');
  }
  
  console.log('   ✓ Confirmed on Users form - proceeding to fill email immediately');
  
  // REMOVED: All complex navigation/retry logic - we're on Users form, just fill email
  
  // Now fill the email field immediately
  const userEmail = config.resellerData.generateUserEmail();
  console.log(`   📧 Filling email: ${userEmail}`);
  
  // Wait for overlay to disappear
  await page.waitForSelector('div.fixed.inset-0.z-0', { state: 'hidden', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(250);
  
  // Use the exact selector
  const emailInput = page.locator('input[type="email"][placeholder="name@example.com"]').first();
  
  try {
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    
    // Fill email
    await emailInput.click();
    await page.waitForTimeout(150);
    await emailInput.fill(userEmail);
    await page.waitForTimeout(250);
    
    // Verify
    const verifyValue = await emailInput.inputValue();
    if (verifyValue === userEmail) {
      console.log(`   ✅ Email filled successfully: "${verifyValue}"`);
    } else {
      // Retry with JavaScript
      await emailInput.evaluate((el, email) => {
        el.focus();
        el.value = '';
        el.value = email;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, userEmail);
      await page.waitForTimeout(250);
      const verifyValue2 = await emailInput.inputValue();
      if (verifyValue2 === userEmail) {
        console.log(`   ✅ Email filled on retry: "${verifyValue2}"`);
      } else {
        throw new Error(`CRITICAL: Email not filled! Expected: "${userEmail}", Got: "${verifyValue2}"`);
      }
    }
  } catch (e) {
    // Fallback to any email input
    const emailInputFallback = page.locator('input[type="email"]').first();
    await emailInputFallback.waitFor({ state: 'visible', timeout: 5000 });
    await emailInputFallback.fill(userEmail);
    await page.waitForTimeout(250);
    const verifyValue = await emailInputFallback.inputValue();
    if (verifyValue !== userEmail) {
      throw new Error(`CRITICAL: Email not filled! Expected: "${userEmail}", Got: "${verifyValue}"`);
    }
    console.log(`   ✅ Email filled using fallback: "${verifyValue}"`);
  }
  
  // CRITICAL: Verify email is filled BEFORE clicking Next Step
  const finalEmailCheck = await emailInput.inputValue();
  if (finalEmailCheck !== userEmail) {
    throw new Error(`CRITICAL: Email not filled before clicking Next Step! Expected: "${userEmail}", Got: "${finalEmailCheck}"`);
  }
  
  console.log(`   ✅ Email verified: "${finalEmailCheck}" - Proceeding to next step...`);
  
  // Click Next Step
  await page.waitForTimeout(250);
  await page.waitForSelector('div.fixed.inset-0.z-0', { state: 'hidden', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(250);
  
  const nextButton = page.locator('button:has-text("Next Step"), button:has-text("Next")').first();
  try {
    await nextButton.click({ timeout: 5000 });
    console.log('   ✓ Next Step button clicked');
  } catch (e) {
    await nextButton.evaluate((el) => el.click());
    console.log('   ✓ Next Step button clicked via JavaScript');
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  console.log(`   ✓ Users form completed - email filled and moved to Domain form`);
}

/**
 * Fill Domain form (Step 3) - SIMPLIFIED
 */
async function fillDomainForm(page) {
  console.log('   🔍 Waiting for Domain form to load...');
  
  // Force zoom to 100% first
  await forceZoom100(page);
  
  // Wait for form to load
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);
  
  // CRITICAL: Scroll to ensure full form is visible
  console.log('   📜 Scrolling to reveal full Domain form...');
  
  // Scroll to top first
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
  
  // Find the form and scroll it into view
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) {
      form.scrollIntoView({ behavior: 'auto', block: 'start' });
      
      // Remove any constraints on form containers
      let element = form;
      for (let i = 0; i < 5 && element; i++) {
        if (element.style) {
          const style = element.style;
          if (style.maxHeight && style.maxHeight !== 'none') {
            style.maxHeight = 'none';
          }
          if (style.overflow === 'hidden' || style.overflow === 'auto') {
            style.overflow = 'visible';
          }
          if (style.height && style.height.includes('px') && parseInt(style.height) < 3000) {
            style.height = 'auto';
          }
        }
        element = element.parentElement;
      }
    }
  });
  await page.waitForTimeout(250);
  
  // Scroll down slowly to reveal all fields
  console.log('   📜 Scrolling down to reveal all form fields...');
  const scrollSteps = 12; // Optimized: reduced from 20
  for (let i = 0; i < scrollSteps; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, 200); // Increased scroll distance
    });
    await page.waitForTimeout(100);
  }
  
  // Scroll back to top
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
  
  // Scroll to middle to see all fields
  await page.evaluate(() => {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    window.scrollTo(0, (scrollHeight - clientHeight) / 2);
  });
  await page.waitForTimeout(250);
  
  // Scroll back to top for filling
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
  
  console.log('   ✓ Scrolling completed - form should be fully visible');
  
  // Wait for overlay to disappear
  await page.waitForSelector('div.fixed.inset-0.z-0', { state: 'hidden', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(250);
  
  console.log(`   📝 Filling Business Name: ${config.resellerData.businessName}`);
  
  // SIMPLIFIED: Use CSS selector to find business name field
  // Look for input with placeholder containing "Awesome Brand" or similar
  let businessNameFilled = false;
  // Define XPath at function scope for verification later
  const businessNameXpath = '/html/body/div/div/div/div[2]/form/div[2]/div/input';
  
  try {
    // Wait for overlay to disappear first
    await page.waitForSelector('div.fixed.inset-0.z-0', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(250);
    
    // Try exact placeholder first
    const businessNameInput = page.locator('input[placeholder*="Awesome Brand" i], input[placeholder*="Business Name" i]').first();
    await businessNameInput.waitFor({ state: 'visible', timeout: 10000 });
    console.log('   ✓ Business Name field found');
    
    // Scroll into view
    await businessNameInput.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    
    // Wait for overlay to disappear before clicking
    await page.waitForSelector('div.fixed.inset-0.z-0', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(250);
    
    // Fill using Playwright's fill method - use JavaScript click to bypass overlay
    try {
      await businessNameInput.click({ timeout: 5000 });
    } catch (e) {
      // If click is blocked by overlay, use JavaScript click
      await businessNameInput.evaluate((el) => el.click());
    }
    await page.waitForTimeout(150);
    await businessNameInput.fill(config.resellerData.businessName);
    await page.waitForTimeout(250);
    
    // Verify
    const verifyValue = await businessNameInput.inputValue();
    if (verifyValue === config.resellerData.businessName) {
      console.log(`   ✅ Business Name filled successfully: "${verifyValue}"`);
      businessNameFilled = true;
    } else {
      console.log(`   ⚠️  First attempt failed. Expected: "${config.resellerData.businessName}", Got: "${verifyValue}"`);
      // Try again with JavaScript
      await businessNameInput.evaluate((el, name) => {
        el.focus();
        el.value = '';
        el.value = name;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, config.resellerData.businessName);
      await page.waitForTimeout(250);
      const verifyValue2 = await businessNameInput.inputValue();
      if (verifyValue2 === config.resellerData.businessName) {
        console.log(`   ✅ Business Name filled successfully on retry: "${verifyValue2}"`);
        businessNameFilled = true;
      }
    }
  } catch (e) {
    console.log(`   ⚠️  Business Name field not found with CSS selector: ${e.message}`);
    // Fallback: Try XPath
    try {
      const businessNameInput2 = page.locator(`xpath=${businessNameXpath}`).first();
      await businessNameInput2.waitFor({ state: 'visible', timeout: 5000 });
      await businessNameInput2.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await businessNameInput2.fill(config.resellerData.businessName);
      await page.waitForTimeout(250);
      const verifyValue = await businessNameInput2.inputValue();
      if (verifyValue === config.resellerData.businessName) {
        console.log(`   ✅ Business Name filled using XPath: "${verifyValue}"`);
        businessNameFilled = true;
      }
    } catch (e2) {
      console.log(`   ⚠️  XPath fallback also failed: ${e2.message}`);
    }
  }

  // CRITICAL: Verify business name is filled BEFORE proceeding
  if (!businessNameFilled) {
    await page.screenshot({ path: 'business-name-not-filled.png', fullPage: true, timeout: 5000 }).catch(() => {});
    console.log(`   ❌ CRITICAL: Business Name not filled! Expected: "${config.resellerData.businessName}"`);
    console.log(`   ❌ STOPPING: Cannot proceed to next step without filling Business Name (mandatory field)!`);
    throw new Error(`CRITICAL: Business Name field could not be filled. Expected: "${config.resellerData.businessName}". Bot stopped to prevent invalid submission.`);
  }
  
  console.log(`   ✅ Business Name verified: "${config.resellerData.businessName}" - Proceeding...`);

  // Brand Domain
  console.log(`   📝 Filling Brand Domain: ${config.resellerData.brandDomain}`);
  const brandDomainInput = page.locator('input[placeholder*="mybrand.com" i], input[placeholder*="Brand Domain" i]').first();
  let brandDomainFilled = false;
  if (await brandDomainInput.count() > 0) {
    // Scroll to make sure the field is visible
    await brandDomainInput.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await brandDomainInput.waitFor({ state: 'visible', timeout: 10000 });
    await brandDomainInput.fill(config.resellerData.brandDomain);
    await page.waitForTimeout(150);
    
    // Verify Brand Domain was filled
    const brandDomainValue = await brandDomainInput.inputValue();
    if (brandDomainValue === config.resellerData.brandDomain) {
      console.log(`   ✓ Brand Domain filled: "${brandDomainValue}"`);
      brandDomainFilled = true;
    } else {
      console.log(`   ⚠️  Brand Domain mismatch - Expected: "${config.resellerData.brandDomain}", Got: "${brandDomainValue}"`);
    }
  } else {
    console.log('   ⚠️  Brand Domain input not found');
  }
  
  if (!brandDomainFilled) {
    throw new Error(`CRITICAL: Brand Domain not filled! Cannot proceed to next step.`);
  }

  // Business URL Domain
  console.log(`   📝 Filling Business URL Domain: ${config.resellerData.businessUrlDomain}`);
  const businessUrlDomainInput = page.locator('input[placeholder*="app.mybrand.com" i], input[placeholder*="Business URL Domain" i]').first();
  let businessUrlDomainFilled = false;
  if (await businessUrlDomainInput.count() > 0) {
    // Scroll to make sure the field is visible
    await businessUrlDomainInput.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await businessUrlDomainInput.waitFor({ state: 'visible', timeout: 10000 });
    await businessUrlDomainInput.fill(config.resellerData.businessUrlDomain);
    await page.waitForTimeout(150);
    
    // Verify Business URL Domain was filled
    const businessUrlDomainValue = await businessUrlDomainInput.inputValue();
    if (businessUrlDomainValue === config.resellerData.businessUrlDomain) {
      console.log(`   ✓ Business URL Domain filled: "${businessUrlDomainValue}"`);
      businessUrlDomainFilled = true;
    } else {
      console.log(`   ⚠️  Business URL Domain mismatch - Expected: "${config.resellerData.businessUrlDomain}", Got: "${businessUrlDomainValue}"`);
    }
  } else {
    console.log('   ⚠️  Business URL Domain input not found');
  }
  
  if (!businessUrlDomainFilled) {
    throw new Error(`CRITICAL: Business URL Domain not filled! Cannot proceed to next step.`);
  }

  // CRITICAL: Verify ALL Domain form fields are filled before proceeding
  console.log('   🔍 Verifying all Domain form fields are filled...');
  
  // Verify Business Name
  const businessNameValue = await page.evaluate((xpath) => {
    const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    return el ? el.value : '';
  }, businessNameXpath);
  
  if (businessNameValue !== config.resellerData.businessName) {
    await page.screenshot({ path: 'domain-form-business-name-not-filled.png', fullPage: true }).catch(() => {});
    throw new Error(`CRITICAL: Business Name not filled! Expected: "${config.resellerData.businessName}", Got: "${businessNameValue}". Cannot proceed to next step.`);
  }
  console.log(`   ✓ Business Name verified: "${businessNameValue}"`);
  
  // Verify Brand Domain
  const brandDomainValue = await brandDomainInput.inputValue();
  if (brandDomainValue !== config.resellerData.brandDomain) {
    await page.screenshot({ path: 'domain-form-brand-domain-not-filled.png', fullPage: true }).catch(() => {});
    throw new Error(`CRITICAL: Brand Domain not filled! Expected: "${config.resellerData.brandDomain}", Got: "${brandDomainValue}". Cannot proceed to next step.`);
  }
  console.log(`   ✓ Brand Domain verified: "${brandDomainValue}"`);
  
  // Verify Business URL Domain
  const businessUrlDomainValue = await businessUrlDomainInput.inputValue();
  if (businessUrlDomainValue !== config.resellerData.businessUrlDomain) {
    await page.screenshot({ path: 'domain-form-business-url-not-filled.png', fullPage: true }).catch(() => {});
    throw new Error(`CRITICAL: Business URL Domain not filled! Expected: "${config.resellerData.businessUrlDomain}", Got: "${businessUrlDomainValue}". Cannot proceed to next step.`);
  }
  console.log(`   ✓ Business URL Domain verified: "${businessUrlDomainValue}"`);
  
  console.log('   ✅ ALL Domain form fields verified and filled!');
  
  // Scroll to find and click Next Step button
  console.log('   📜 Scrolling to find Next Step button...');
  await page.evaluate(() => {
    // Scroll to bottom to find Next button
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.waitForTimeout(250);
  
  // Scroll back up a bit
  await page.evaluate(() => {
    window.scrollBy(0, -300);
  });
  await page.waitForTimeout(250);
  
  // CRITICAL: Verify business name is filled BEFORE clicking Next Step
  let finalBusinessNameCheck = '';
  try {
    const businessNameInputCheck = page.locator('input[placeholder*="Awesome Brand" i], input[placeholder*="Business Name" i]').first();
    if (await businessNameInputCheck.count() > 0) {
      finalBusinessNameCheck = await businessNameInputCheck.inputValue();
    }
  } catch (e) {
    console.log(`   ⚠️  Could not verify business name: ${e.message}`);
  }
  
  console.log(`   🔍 Final business name check - Expected: "${config.resellerData.businessName}", Got: "${finalBusinessNameCheck}"`);
  
  if (finalBusinessNameCheck !== config.resellerData.businessName) {
    await page.screenshot({ path: 'business-name-not-filled-before-next.png', fullPage: true, timeout: 5000 }).catch(() => {});
    console.log(`   ❌ CRITICAL: Business Name not filled! Expected: "${config.resellerData.businessName}", Got: "${finalBusinessNameCheck}"`);
    console.log(`   ❌ STOPPING: Cannot proceed to Branding form without filling Business Name (mandatory field)!`);
    throw new Error(`CRITICAL: Business Name not filled before clicking Next Step! Expected: "${config.resellerData.businessName}", Got: "${finalBusinessNameCheck}". Bot stopped to prevent invalid submission.`);
  }
  
  console.log(`   ✅ Business Name verified: "${finalBusinessNameCheck}" - Proceeding to next step...`);
  
  // Click Next Step button - but ONLY if business name is filled
  await page.waitForSelector('div.fixed.inset-0.z-0', { state: 'hidden', timeout: 5000 }).catch(() => {
    console.log('   ℹ️  No overlay found or already gone');
  });
  await page.waitForTimeout(250);

  const nextButton = page.locator('button:has-text("Next Step"), button:has-text("Next")').first();
  
  // Scroll the button into view
  try {
    await nextButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
  } catch (e) {
    // If scroll fails, try JavaScript scroll
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.includes('Next') || btn.textContent.includes('Next Step')) {
          btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }
      }
    });
    await page.waitForTimeout(250);
  }
  
  try {
    await nextButton.click({ timeout: 5000 });
    console.log('   ✓ Next Step button clicked');
  } catch (e) {
    console.log('   ⚠️  Normal click blocked, trying JavaScript click...');
    await nextButton.evaluate((el) => el.click());
    console.log('   ✓ Next Step button clicked via JavaScript');
  }

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  console.log(`   ✓ Domain form completed - all fields filled and verified`);
}

/**
 * Fill Branding form (Step 4)
 */
async function fillBrandingForm(page) {
  // Wait for Branding form
  await page.waitForSelector('text=Branding', { timeout: 10000 });
  await page.waitForTimeout(250);
  
  // Force zoom to 100%
  await forceZoom100(page);
  
  // CRITICAL: Scroll to ensure full Branding form is visible
  console.log('   📜 Scrolling to reveal full Branding form...');
  
  // Scroll to top first
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
  
  // Find the form and scroll it into view
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) {
      form.scrollIntoView({ behavior: 'auto', block: 'start' });
      
      // Remove any constraints on form containers
      let element = form;
      for (let i = 0; i < 5 && element; i++) {
        if (element.style) {
          const style = element.style;
          if (style.maxHeight && style.maxHeight !== 'none') {
            style.maxHeight = 'none';
          }
          if (style.overflow === 'hidden' || style.overflow === 'auto') {
            style.overflow = 'visible';
          }
        }
        element = element.parentElement;
      }
    }
  });
  await page.waitForTimeout(250);
  
  // Scroll down slowly to reveal all fields (optimized)
  const scrollSteps = 10; // Optimized: reduced from 15
  for (let i = 0; i < scrollSteps; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, 200); // Increased scroll distance
    });
    await page.waitForTimeout(100);
  }
  
  // Scroll back to top
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
  
  console.log('   ✓ Scrolling completed - Branding form should be fully visible');
  
  // Logo upload - Upload the logo file
  console.log('   📤 Uploading logo...');
  const path = require('path');
  const fs = require('fs');
  const logoPath = path.resolve(__dirname, config.resellerData.logoPath || './logo.png');
  
  // Check if logo file exists
  if (fs.existsSync(logoPath)) {
    try {
      // Wait for overlay to disappear
      await page.waitForSelector('div.fixed.inset-0.z-0', { state: 'hidden', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(250);
      
      // Find file input for logo upload - try multiple selectors
      // Note: File inputs are often hidden, so we don't need to wait for visibility
      const fileInputSelectors = [
        'input[type="file"]',
        'input[accept*="image"]',
        'input[accept*="png"]',
        'input[accept*="jpg"]',
        'input[accept*="jpeg"]',
        'input[name*="logo" i]',
        'input[id*="logo" i]'
      ];
      
      let logoUploaded = false;
      for (const selector of fileInputSelectors) {
        const fileInput = page.locator(selector).first();
        if (await fileInput.count() > 0) {
          try {
            // File inputs are often hidden - we can set files on hidden inputs
            // First, try to make it accessible if possible
            await fileInput.evaluate((el) => {
              // Make it accessible even if hidden
              if (el.style.display === 'none' || el.classList.contains('hidden')) {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
                el.style.position = 'absolute';
                el.style.left = '-9999px'; // Keep it off-screen but accessible
              }
            });
            await page.waitForTimeout(150);
            
            // Set the files - this works even on hidden inputs
            await fileInput.setInputFiles(logoPath);
            await page.waitForTimeout(250);
            
            // Verify file was set
            const files = await fileInput.evaluate((el) => {
              if (el.files && el.files.length > 0) {
                return el.files[0].name;
              }
              return null;
            }).catch(() => null);
            
            if (files) {
              console.log(`   ✓ Logo uploaded successfully from: ${logoPath} (file: ${files})`);
              logoUploaded = true;
              break;
            } else {
              console.log(`   ⚠️  File input found but file not set with selector "${selector}"`);
            }
          } catch (e) {
            console.log(`   ⚠️  File input selector "${selector}" failed: ${e.message}`);
            continue;
          }
        }
      }
      
      if (!logoUploaded) {
        console.log('   ⚠️  Logo file input not found - trying drag and drop area...');
        // Try to find drag-and-drop area and simulate file drop
        const dropArea = page.locator('[class*="drop"], [class*="upload"], [class*="drag"]').first();
        if (await dropArea.count() > 0) {
          try {
            // Read file as buffer for drag and drop
            const fileBuffer = fs.readFileSync(logoPath);
            const fileName = path.basename(logoPath);
            
            // Create a DataTransfer object and drop the file
            await dropArea.evaluate((element, { buffer, name, type }) => {
              const dataTransfer = new DataTransfer();
              const file = new File([buffer], name, { type: type || 'image/png' });
              dataTransfer.items.add(file);
              
              const dropEvent = new DragEvent('drop', {
                bubbles: true,
                cancelable: true,
                dataTransfer: dataTransfer
              });
              
              element.dispatchEvent(dropEvent);
            }, { buffer: Array.from(fileBuffer), name: fileName, type: 'image/png' });
            
            await page.waitForTimeout(250);
            console.log(`   ✓ Logo uploaded via drag-and-drop: ${logoPath}`);
            logoUploaded = true;
          } catch (e) {
            console.log(`   ⚠️  Drag-and-drop upload failed: ${e.message}`);
          }
        }
      }
      
      if (!logoUploaded) {
        console.log('   ⚠️  Could not upload logo - file input or drop area not found');
      }
    } catch (e) {
      console.log(`   ⚠️  Logo upload error: ${e.message}`);
    }
  } else {
    console.log(`   ⚠️  Logo file not found at: ${logoPath}`);
    console.log('   ⚠️  Please ensure logo.png exists in the project root directory');
  }
  
  // Language selection - Always select "English"
  console.log(`   📝 Filling Language: English`);
  
  // Wait for overlay to disappear first
  await page.waitForSelector('div.fixed.inset-0.z-0', { state: 'hidden', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(250);
  
  const languageSelectLocator = page.locator('input[placeholder*="Select Language" i], select, [role="combobox"]');
  if (await languageSelectLocator.count() > 0) {
    const languageSelect = languageSelectLocator.first();
    await languageSelect.waitFor({ state: 'visible', timeout: 10000 });
    await languageSelect.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    
    // Use JavaScript click to bypass overlay
    try {
      await languageSelect.click({ timeout: 5000 });
    } catch (e) {
      // If click is blocked by overlay, use JavaScript click
      await languageSelect.evaluate((el) => el.click());
    }
    await page.waitForTimeout(250);
    
    // Try to find and click the language option - Always select "English"
    const languageToSelect = 'English';
    
    // Check if it's a <select> element or an input/combobox
    const elementTag = await languageSelect.evaluate((el) => el.tagName).catch(() => '');
    
    if (elementTag === 'SELECT') {
      // It's a <select> element - use selectOption
      try {
        await languageSelect.selectOption({ label: languageToSelect });
        await page.waitForTimeout(250);
        console.log(`   ✓ Language selected via selectOption: ${languageToSelect}`);
      } catch (e) {
        // Try by value or index
        try {
          await languageSelect.selectOption({ value: languageToSelect });
          console.log(`   ✓ Language selected by value: ${languageToSelect}`);
        } catch (e2) {
          // Try JavaScript selection
          await languageSelect.evaluate((el, lang) => {
            const options = Array.from(el.options);
            const option = options.find(opt => opt.text.includes(lang) || opt.value.includes(lang));
            if (option) {
              el.value = option.value;
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }, languageToSelect);
          console.log(`   ✓ Language selected via JavaScript: ${languageToSelect}`);
        }
      }
    } else {
      // It's an input or combobox - click to open dropdown, then select option
      const languageOptionLocator = page.locator(`text=${languageToSelect}, text=/^English$/i`).first();
      if (await languageOptionLocator.count() > 0) {
        try {
          await languageOptionLocator.waitFor({ state: 'visible', timeout: 5000 });
          await languageOptionLocator.scrollIntoViewIfNeeded();
          await page.waitForTimeout(250);
          await languageOptionLocator.click();
          console.log(`   ✓ Language selected: ${languageToSelect}`);
        } catch (e) {
          // If click fails, try JavaScript click
          await languageOptionLocator.evaluate((el) => el.click());
          console.log(`   ✓ Language selected via JavaScript: ${languageToSelect}`);
        }
      } else {
        // If dropdown doesn't work, try typing "English" (only for input elements)
        if (elementTag === 'INPUT') {
          await languageSelect.fill(languageToSelect);
          await page.waitForTimeout(150);
          await page.keyboard.press('Enter');
          console.log(`   ✓ Language typed: ${languageToSelect}`);
        } else {
          console.log(`   ⚠️  Could not select language - element type: ${elementTag}`);
        }
      }
    }
    await page.waitForTimeout(250);
  } else {
    console.log('   ⚠️  Language select field not found');
  }
  
  // Make default language checkbox - Always check this checkbox
  console.log('   📝 Checking "Make default language" checkbox...');
  
  // Wait for overlay to disappear
  await page.waitForSelector('div.fixed.inset-0.z-0', { state: 'hidden', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(250);
  
  // Try multiple selectors to find the default language checkbox
  const checkboxSelectors = [
    'label:has-text("default") input[type="checkbox"]',
    'label:has-text("Default") input[type="checkbox"]',
    'label:has-text("DEFAULT") input[type="checkbox"]',
    'input[type="checkbox"][name*="default"]',
    'input[type="checkbox"][name*="Default"]',
    'input[type="checkbox"][id*="default"]',
    'input[type="checkbox"][id*="Default"]',
    'input[type="checkbox"]'
  ];
  
  let defaultLanguageChecked = false;
  for (const selector of checkboxSelectors) {
    const checkboxLocator = page.locator(selector).first();
    if (await checkboxLocator.count() > 0) {
      try {
        await checkboxLocator.waitFor({ state: 'visible', timeout: 5000 });
        await checkboxLocator.scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        
        // Check if it's already checked
        const isAlreadyChecked = await checkboxLocator.isChecked().catch(() => false);
        if (!isAlreadyChecked) {
          // Use JavaScript click to bypass overlay if needed
          try {
            await checkboxLocator.check({ timeout: 5000 });
          } catch (e) {
            await checkboxLocator.evaluate((el) => el.click());
          }
        }
        
        const isChecked = await checkboxLocator.isChecked();
        if (isChecked) {
          console.log('   ✓ "Make default language" checkbox checked');
          defaultLanguageChecked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  if (!defaultLanguageChecked) {
    console.log('   ⚠️  "Make default language" checkbox not found or could not be checked');
  }
  await page.waitForTimeout(300);
  
  // CRITICAL: Verify Branding form fields are filled before proceeding
  console.log('   🔍 Verifying Branding form fields...');
  
  // Verify Language is selected (if field was found)
  if (await languageSelectLocator.count() > 0) {
    const languageValue = await languageSelectLocator.first().inputValue().catch(() => '');
    if (languageValue && !languageValue.includes(config.resellerData.language)) {
      console.log(`   ⚠️  Language may not be selected correctly. Value: "${languageValue}"`);
    } else {
      console.log(`   ✓ Language verified: ${config.resellerData.language}`);
    }
  }
  
  // Verify checkbox is checked (if it was found and should be checked)
  if (config.resellerData.makeDefaultLanguage) {
    const checkboxLocator = page.locator('label:has-text("default"), label:has-text("Default"), input[type="checkbox"]');
    if (await checkboxLocator.count() > 0) {
      const isChecked = await checkboxLocator.first().isChecked().catch(() => false);
      if (isChecked) {
        console.log('   ✓ "Make default language" checkbox verified as checked');
      } else {
        console.log('   ⚠️  "Make default language" checkbox not checked');
      }
    }
  }
  
  console.log(`   ✓ Branding form filled: ${config.resellerData.language}`);
}

/**
 * Submit reseller (Step 4 - Final Commit)
 * IMPORTANT: Reseller is created ONLY after this step completes successfully
 * Steps 1-3 were temporary saves only
 */
async function submitReseller(page) {
  // Wait a bit for the form to be ready
  await page.waitForTimeout(1000); // Optimized
  
  // Get the reseller name for verification later
  const resellerName = config.resellerData.resellerName;
  console.log(`   🔍 Looking for "Create Reseller" button at bottom right...`);
  console.log(`   🔍 Will verify reseller name "${resellerName}" on dashboard after submission`);
  
  // Look for "Create Reseller" button - prioritize exact text match
  const createResellerButton = page.locator('button:has-text("Create Reseller")').first();
  
  if (await createResellerButton.count() === 0) {
    // Debug: List all buttons on the page
    const allButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map((btn, i) => ({
        index: i + 1,
        text: btn.textContent?.trim() || 'no-text',
        type: btn.type || 'button',
        className: btn.className || 'no-class',
        visible: btn.offsetParent !== null,
        position: btn.getBoundingClientRect()
      }));
    });
    
    console.log(`   🔍 Found ${allButtons.length} button(s) on page:`);
    allButtons.filter(b => b.visible).slice(0, 10).forEach(btn => {
      console.log(`   🔘 Button ${btn.index}: text="${btn.text}", type="${btn.type}", position: (${btn.position.left}, ${btn.position.top})`);
    });
    
    throw new Error('"Create Reseller" button not found. Check the button text in the screenshot.');
  }
  
  // Wait for overlay to disappear - CRITICAL: Overlay blocks clicks
  console.log('   ⏳ Waiting for overlay to disappear (overlay blocks button clicks)...');
  let overlayGone = false;
  for (let i = 0; i < 5; i++) { // Reduced from 10 to 5 attempts
    const overlay = page.locator('div.fixed.inset-0.z-0');
    const overlayCount = await overlay.count();
    if (overlayCount === 0) {
      overlayGone = true;
      console.log('   ✓ Overlay disappeared');
      break;
    }
    const isVisible = await overlay.first().isVisible().catch(() => false);
    if (!isVisible) {
      overlayGone = true;
      console.log('   ✓ Overlay is hidden');
      break;
    }
    console.log(`   ⏳ Overlay still present, waiting... (attempt ${i + 1}/5)`);
    await page.waitForTimeout(250); // Reduced from 1000ms to 500ms
  }
  
  // If overlay is still there, try to remove it
  if (!overlayGone) {
    console.log('   ⚠️  Overlay still present, attempting to remove it...');
    await page.evaluate(() => {
      const overlays = document.querySelectorAll('div.fixed.inset-0.z-0');
      overlays.forEach(overlay => {
        overlay.style.display = 'none';
        overlay.style.pointerEvents = 'none';
        overlay.remove();
      });
    });
    await page.waitForTimeout(250);
    console.log('   ✓ Attempted to remove overlay');
  }
  
  // Scroll to make sure button is visible (bottom right)
  await createResellerButton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  
  // Check if button is enabled
  const isEnabled = await createResellerButton.isEnabled().catch(() => true);
  if (!isEnabled) {
    console.log('   ⚠️  Button is disabled, waiting for it to be enabled...');
    await page.waitForTimeout(3000);
  }
  
  // Check for any validation errors before clicking
  console.log('   🔍 Checking for validation errors...');
  const validationErrorSelectors = [
    '[class*="error"]',
    '[class*="invalid"]',
    'text=/required|invalid|error/i'
  ];
  for (const selector of validationErrorSelectors) {
    const errors = page.locator(selector);
    if (await errors.count() > 0) {
      const errorText = await errors.first().textContent().catch(() => '');
      console.log(`   ⚠️  Validation error found: ${errorText}`);
      break;
    }
  }
  
  // Wait for any pending form operations
  await page.waitForTimeout(250);
  
  // Try multiple click strategies to ensure the button actually triggers submission
  console.log('   🔘 Attempting to click "Create Reseller" button...');
  let clickSuccess = false;
  
  // Wait for network activity after clicking to detect if form is submitting
  const responsePromise = page.waitForResponse(
    response => response.url().includes('reseller') || response.url().includes('create') || response.status() === 200 || response.status() === 201,
    { timeout: 15000 }
  ).catch(() => null);
  
  // Strategy 1: Normal click (not force, to ensure it's actually clickable)
  try {
    await createResellerButton.click({ timeout: 10000 });
    console.log('   ✓ "Create Reseller" button clicked (normal click)');
    clickSuccess = true;
  } catch (e) {
    console.log(`   ⚠️  Normal click failed: ${e.message}, trying force click...`);
    try {
      await createResellerButton.click({ timeout: 10000, force: true });
      console.log('   ✓ "Create Reseller" button clicked (force click)');
      clickSuccess = true;
    } catch (e2) {
      console.log(`   ⚠️  Force click also failed: ${e2.message}`);
    }
  }
  
  // Strategy 2: JavaScript click with event dispatch (if normal click didn't work)
  if (!clickSuccess) {
    try {
      await createResellerButton.evaluate((el) => {
        // Scroll element into view
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus the element
        el.focus();
        // Create and dispatch click event
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        el.dispatchEvent(clickEvent);
        // Also try the native click
        el.click();
      });
      console.log('   ✓ "Create Reseller" button clicked via JavaScript with event dispatch');
      clickSuccess = true;
    } catch (e) {
      console.log(`   ⚠️  JavaScript click failed: ${e.message}`);
    }
  }
  
  if (!clickSuccess) {
    throw new Error('Failed to click "Create Reseller" button with all strategies');
  }
  
  // Wait for network response to confirm form submission
  console.log('   ⏳ Waiting for form submission response...');
  const response = await responsePromise;
  if (response) {
    console.log(`   ✓ Form submission detected: ${response.url()} (Status: ${response.status()})`);
    const responseData = await response.json().catch(() => null);
    if (responseData) {
      console.log(`   📦 Response data: ${JSON.stringify(responseData).substring(0, 200)}...`);
    }
    // Store response for later verification (will be used in final check)
    apiResponse = response;
  } else {
    console.log('   ⚠️  No network response detected, but continuing...');
  }
  
  // Wait a bit for any client-side processing
  await page.waitForTimeout(1000); // Optimized
  
  // Wait for form to automatically navigate to dashboard after submission
  console.log('   ⏳ Waiting for form to navigate to /dashboard automatically...');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Optimized: reduced from 3000ms
  
  // Check for any error messages first
  const errorMessages = page.locator('text=/error|failed|invalid|required|validation/i');
  if (await errorMessages.count() > 0) {
    const errorText = await errorMessages.first().textContent().catch(() => '');
    console.log(`   ⚠️  Error message detected: ${errorText}`);
  }
  
  // Wait for URL to change to /dashboard (form will navigate automatically)
  console.log('   ⏳ Waiting for automatic navigation to /dashboard...');
  let navigatedToDashboard = false;
  
  try {
    // Wait up to 30 seconds for navigation
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    console.log(`   ✓ Automatically navigated to dashboard: ${page.url()}`);
    navigatedToDashboard = true;
  } catch (e) {
    const currentUrl = page.url();
    console.log(`   ⚠️  Still on form page. Current URL: ${currentUrl}`);
    
    // Wait longer and check again
    await page.waitForTimeout(3000); // Reduced from 5s
    const newUrl = page.url();
    
    if (newUrl.includes('/dashboard')) {
      console.log(`   ✓ Navigated to dashboard after additional wait: ${newUrl}`);
      navigatedToDashboard = true;
    } else {
      console.log(`   ⚠️  Still not on /dashboard. Current URL: ${newUrl}`);
      // Try one more time with even longer wait
      await page.waitForTimeout(3000); // Reduced from 5s
      const finalUrl = page.url();
      if (finalUrl.includes('/dashboard')) {
        console.log(`   ✓ Navigated to dashboard after extended wait: ${finalUrl}`);
        navigatedToDashboard = true;
      } else {
        console.log(`   ⚠️  Not on /dashboard yet. Final URL: ${finalUrl}`);
        // If still not on dashboard, manually navigate
        console.log('   🔄 Manually navigating to /dashboard...');
        try {
          await page.goto('https://test-reseller.singleinterface.com/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
          navigatedToDashboard = true;
          console.log('   ✓ Manually navigated to /dashboard');
        } catch (navError) {
          console.log(`   ⚠️  Could not manually navigate: ${navError.message}`);
        }
      }
    }
  }
  
  // Wait for dashboard to load completely
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Reduced from 3s
  
  // Check for success message "Reseller created successfully"
  console.log('   🔍 Looking for success message "Reseller created successfully"...');
  let successMessageFound = false;
  
  // Try multiple selectors for success message (could be toast, modal, alert, etc.)
  const successMessageSelectors = [
    'text=/Reseller created successfully/i',
    'text=/Reseller created successfull/i',
    '[class*="success"]',
    '[class*="toast"]',
    '[class*="notification"]',
    '[role="alert"]',
    '.alert-success',
    '[class*="message"]'
  ];
  
  for (const selector of successMessageSelectors) {
    const locator = page.locator(selector);
    if (await locator.count() > 0) {
      const text = await locator.first().textContent().catch(() => '');
      if (text && text.toLowerCase().includes('reseller created successfully')) {
        console.log(`   ✓ Success message found: "${text}"`);
        successMessageFound = true;
        break;
      }
    }
  }
  
  // Also check page text directly
  if (!successMessageFound) {
    const pageText = await page.evaluate(() => document.body.textContent || '');
    if (pageText.toLowerCase().includes('reseller created successfully')) {
      console.log('   ✓ Success message found in page text');
      successMessageFound = true;
    } else {
      console.log('   ⚠️  Success message not found (may have disappeared), continuing to check reseller list...');
    }
  }
  
  // Wait for reseller list to appear - wait longer as it might load via API
  console.log('   ⏳ Waiting for reseller list to load (this may take time if loading via API)...');
  try {
    // Wait for any table/list structure
    await page.waitForSelector('table, tbody, [role="table"], [class*="table"], [class*="list"], tr, [class*="row"]', { timeout: 20000 });
    console.log('   ✓ Reseller list container found');
  } catch (e) {
    console.log('   ⚠️  Reseller list container not found immediately, waiting longer...');
  }
  await page.waitForTimeout(3000); // Wait 3 seconds for API/data to load (reduced from 10s)
  
  // Try to trigger any lazy loading or refresh
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    window.scrollTo(0, document.documentElement.scrollHeight);
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(3000);
  
  // Scroll to top to see the reseller list
  console.log('   📜 Scrolling to top to see reseller list...');
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2000);
  
  // Look for the reseller name in the FIRST row of the table (NAME column)
  console.log(`   🔍 Checking FIRST row in reseller table for name "${resellerName}"...`);
  
  let resellerFound = false;
  
  // Strategy: Check the first row in the table (tbody tr:first-child)
  // Based on screenshot, the table structure is: table > tbody > tr (rows)
  const firstRowSelectors = [
    'tbody tr:first-child',
    'table tbody tr:first-child',
    'tr:first-child',
    '[role="row"]:first-child'
  ];
  
  for (const selector of firstRowSelectors) {
    const firstRow = page.locator(selector).first();
    if (await firstRow.count() > 0) {
      try {
        const rowText = await firstRow.textContent().catch(() => '');
        console.log(`   🔍 First row text: "${rowText.substring(0, 200)}..."`);
        
        // Check if reseller name is in the first row (should be in NAME column)
        if (rowText && (rowText.includes(resellerName) || rowText.toLowerCase().includes(resellerName.toLowerCase()))) {
          console.log(`   ✓ Found reseller name "${resellerName}" in FIRST row!`);
          resellerFound = true;
          break;
        }
      } catch (e) {
        console.log(`   ⚠️  Error checking selector "${selector}": ${e.message}`);
        continue;
      }
    }
  }
  
  // If not found in first row, try searching all rows but prioritize first
  if (!resellerFound) {
    console.log('   🔍 First row check failed, searching all table rows...');
    const allRows = page.locator('tbody tr, table tbody tr, tr');
    const rowCount = await allRows.count();
    console.log(`   🔍 Found ${rowCount} rows in table`);
    
    if (rowCount > 0) {
      // Check first row again with more detail
      const firstRow = allRows.first();
      const firstRowText = await firstRow.textContent().catch(() => '');
      console.log(`   🔍 First row full text: "${firstRowText}"`);
      
      if (firstRowText && (firstRowText.includes(resellerName) || firstRowText.toLowerCase().includes(resellerName.toLowerCase()))) {
        console.log(`   ✓ Found reseller name "${resellerName}" in first row!`);
        resellerFound = true;
      } else {
        // Search all rows (but first row should have it)
        // Check more rows (up to 20) with strict matching
        for (let i = 0; i < Math.min(rowCount, 20); i++) {
          const row = allRows.nth(i);
          const rowText = await row.textContent().catch(() => '');
          // Strict matching - must contain the exact reseller name
          if (rowText && rowText.includes(resellerName)) {
            console.log(`   ✓ Found reseller name "${resellerName}" in row ${i + 1}`);
            resellerFound = true;
            break;
          }
        }
      }
    } else {
      // If no rows found, wait a bit more and try again
      console.log('   ⏳ No rows found, waiting longer for table to load...');
      await page.waitForTimeout(3000); // Reduced from 5s
      const allRowsRetry = page.locator('tbody tr, table tbody tr, tr');
      const rowCountRetry = await allRowsRetry.count();
      console.log(`   🔍 After additional wait, found ${rowCountRetry} rows in table`);
      
      if (rowCountRetry > 0) {
        const firstRowRetry = allRowsRetry.first();
        const firstRowTextRetry = await firstRowRetry.textContent().catch(() => '');
        console.log(`   🔍 First row text after retry: "${firstRowTextRetry}"`);
        
        // Strict matching - must contain the exact reseller name
        if (firstRowTextRetry && firstRowTextRetry.includes(resellerName)) {
          console.log(`   ✓ Found reseller name "${resellerName}" in first row after retry!`);
          resellerFound = true;
        }
      }
    }
  }
  
  // Take a screenshot for verification
  try {
    const screenshotPath = resellerFound ? 'reseller-created-success.png' : 'reseller-created-failed.png';
    await page.screenshot({ path: screenshotPath, fullPage: true, timeout: 5000 });
    console.log(`   📸 Screenshot saved as ${screenshotPath}`);
  } catch (e) {
    console.warn('   ⚠️  Failed to capture screenshot:', e.message);
  }
  
  // Check if we got a successful API response (from earlier) - for logging only
  const apiSuccess = apiResponse !== null && (apiResponse.status() === 201 || apiResponse.status() === 200);
  
  // CRITICAL: Always verify reseller name is in the dashboard list
  // Success message is ignored - only reseller name verification matters
  if (resellerFound) {
    if (apiSuccess) {
      console.log(`   ✅ SUCCESS: Reseller "${resellerName}" verified in dashboard list (API also confirmed success)!`);
    } else {
      console.log(`   ✅ SUCCESS: Reseller "${resellerName}" verified in dashboard list!`);
    }
    return true;
  } else {
    // Reseller name NOT found in list - this is a failure
    console.log(`   ❌ FAILED: Reseller "${resellerName}" NOT found in dashboard list!`);
    if (apiSuccess) {
      console.log(`   ⚠️  API response showed success, but reseller not visible in list yet.`);
      console.log(`   ⚠️  This might be a timing issue - waiting longer and checking again...`);
      
      // Wait longer and check multiple times with increasing delays
      console.log(`   ⏳ Waiting for reseller to appear in dashboard (this may take up to 15 seconds)...`);
      
      let retryFound = false;
      const maxRetries = 5;
      const retryDelays = [3000, 3000, 3000, 3000, 3000]; // 5 retries of 3 seconds each
      
      for (let retryAttempt = 0; retryAttempt < maxRetries; retryAttempt++) {
        console.log(`   🔄 Retry attempt ${retryAttempt + 1}/${maxRetries}...`);
        await page.waitForTimeout(retryDelays[retryAttempt]);
        await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        // Check again with more thorough search
        const retryRows = page.locator('tbody tr, table tbody tr, tr');
        const retryRowCount = await retryRows.count();
        console.log(`   🔍 Found ${retryRowCount} rows in table (retry ${retryAttempt + 1})`);
        
        if (retryRowCount > 0) {
          // Check first 20 rows (in case there are many resellers)
          for (let i = 0; i < Math.min(retryRowCount, 20); i++) {
            const row = retryRows.nth(i);
            const rowText = await row.textContent().catch(() => '');
            // More strict matching - must contain the exact reseller name
            if (rowText && rowText.includes(resellerName)) {
              console.log(`   ✅ SUCCESS: Reseller "${resellerName}" found in dashboard list after retry ${retryAttempt + 1} (row ${i + 1})!`);
              retryFound = true;
              break;
            }
          }
        }
        
        if (retryFound) {
          break;
        }
      }
      
      if (retryFound) {
        return true;
      } else {
        console.log(`   ❌ FAILED: Reseller "${resellerName}" still NOT found in dashboard list after ${maxRetries} retries!`);
        console.log('   ⚠️  Reseller was NOT created successfully - throwing error');
        throw new Error(`CRITICAL: Reseller "${resellerName}" was not found in dashboard after creation. The reseller may not have been created successfully.`);
      }
    } else {
      console.log('   ❌ FAILED: Reseller was NOT created successfully - throwing error');
      throw new Error(`CRITICAL: Reseller "${resellerName}" was not found in dashboard after creation. The reseller may not have been created successfully.`);
    }
  }
}

// Ensure all functions are properly closed
module.exports = { createReseller };

// Run the bot - Execute immediately only if this file is run directly (not imported)
if (require.main === module) {
  console.log('TEST: Reached execution code block');
  console.log('🚀 Starting bot execution...');
  console.log('🔍 About to call createReseller()...');
  console.log('🔍 createReseller type:', typeof createReseller);

  // Call the function immediately
  createReseller()
    .then(() => {
      console.log('\n✨ Bot execution completed successfully!');
      // Keep browser open for 10 seconds before exiting
      console.log('⏳ Keeping browser open for 10 seconds...');
      return new Promise(resolve => setTimeout(resolve, 10000));
    })
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Bot execution failed:', error);
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
      // Keep browser open for 30 seconds on error
      console.log('⏳ Keeping browser open for 30 seconds so you can see the error...');
      return new Promise(resolve => setTimeout(resolve, 30000));
    })
    .then(() => {
      process.exit(1);
    });
}

