// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Index page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  });

  test('page loads with correct title and nav', async ({ page }) => {
    await expect(page).toHaveTitle(/Kaapi/);
    await expect(page.locator('.brand')).toContainText('Kaapi');
    await expect(page.locator('.nav-links a[href="beans.html"]')).toBeVisible();
  });

  test('hero section renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Coffee');
    await expect(page.locator('.eyebrow')).toContainText('Roasted in small batches');
    await expect(page.locator('.btn-primary').first()).toBeVisible();
  });

  test('no console errors', async ({ page }) => {
    const messages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') messages.push(msg.text());
    });
    page.on('requestfailed', req => {
      messages.push(`FAILED: ${req.url()}`);
    });
    await page.reload({ waitUntil: 'networkidle' });
    const realErrors = messages.filter(m => !m.includes('fonts.googleapis') && !m.includes('fonts.gstatic'));
    expect(realErrors).toEqual([]);
  });

  /* ── Newsletter ── */

  test('newsletter: email input and Subscribe button render', async ({ page }) => {
    const emailInput = page.locator('#newsletterEmail');
    const subscribeBtn = page.locator('#subscribeBtn');

    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(subscribeBtn).toBeVisible();
    await expect(subscribeBtn).toContainText('Subscribe');
  });

  test('newsletter: email input uses .input-email class (design token match)', async ({ page }) => {
    const emailInput = page.locator('#newsletterEmail');
    await expect(emailInput).toHaveClass(/input-email/);
  });

  test('newsletter: submitting a valid email shows thank-you message', async ({ page }) => {
    const emailInput = page.locator('#newsletterEmail');
    const subscribeBtn = page.locator('#subscribeBtn');
    const form = page.locator('#newsletterForm');
    const thankYou = page.locator('#thankYouMessage');
    const container = page.locator('#newsletterContainer');

    await emailInput.fill('hello@kaapi.co');
    await subscribeBtn.click();

    // Form should be hidden
    await expect(form).toHaveClass(/hidden/);
    // Thank-you should be visible
    await expect(thankYou).toHaveClass(/visible/);
    // Container should have success class
    await expect(container).toHaveClass(/success/);
    // Button should be disabled
    await expect(subscribeBtn).toBeDisabled();
  });

  test('newsletter: invalid email keeps form visible and focuses input', async ({ page }) => {
    const emailInput = page.locator('#newsletterEmail');
    const subscribeBtn = page.locator('#subscribeBtn');
    const form = page.locator('#newsletterForm');
    const thankYou = page.locator('#thankYouMessage');

    // Empty submit
    await emailInput.fill('');
    await subscribeBtn.click();
    await expect(form).not.toHaveClass(/hidden/);
    await expect(thankYou).not.toHaveClass(/visible/);
    await expect(emailInput).toBeFocused();

    // No @ sign
    await emailInput.fill('notanemail');
    await subscribeBtn.click();
    await expect(form).not.toHaveClass(/hidden/);
    await expect(thankYou).not.toHaveClass(/visible/);
    await expect(emailInput).toBeFocused();
  });

  test('newsletter: no console errors after submit', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.locator('#newsletterEmail').fill('test@example.com');
    await page.locator('#subscribeBtn').click();

    // Give time for any deferred errors
    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });

  test('newsletter: thank-you message contains expected copy', async ({ page }) => {
    await page.locator('#newsletterEmail').fill('test@example.com');
    await page.locator('#subscribeBtn').click();

    const thankYou = page.locator('#thankYouMessage');
    await expect(thankYou).toBeVisible();
    await expect(thankYou.locator('h4')).toContainText('Welcome to the fold');
  });

  /* ── Footer ── */

  test('footer renders with all column headings', async ({ page }) => {
    const footerHeadings = page.locator('.footer-col h4');
    await expect(footerHeadings).toHaveCount(4);
    await expect(footerHeadings.nth(0)).toContainText('Newsletter');
    await expect(footerHeadings.nth(1)).toContainText('Shop');
    await expect(footerHeadings.nth(2)).toContainText('Learn');
    await expect(footerHeadings.nth(3)).toContainText('Connect');
  });

  test('footer links point to existing pages', async ({ page }) => {
    // Shop column links
    const shopLink = page.locator('.footer-col').nth(1).locator('a').first();
    await expect(shopLink).toHaveAttribute('href', 'beans.html');

    const learnLink = page.locator('.footer-col').nth(2).locator('a').first();
    await expect(learnLink).toHaveAttribute('href', 'story.html');

    const brewLink = page.locator('.footer-col').nth(2).locator('a').nth(1);
    await expect(brewLink).toHaveAttribute('href', 'brewing.html');
  });

  test('footer bottom shows copyright and brand', async ({ page }) => {
    await expect(page.locator('.footer-bottom')).toContainText('Kaapi Coffee Co');
    await expect(page.locator('.footer-brand')).toContainText('Kaapi');
  });

  test('footer is reachable by scrolling', async ({ page }) => {
    // Scroll to footer
    await page.locator('.footer').scrollIntoViewIfNeeded();
    await expect(page.locator('.footer')).toBeInViewport();
  });
});
