// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Brewing Guide page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/brewing.html', { waitUntil: 'networkidle' });
  });

  test('page loads with correct title and nav', async ({ page }) => {
    await expect(page).toHaveTitle(/Brewing Guide/);
    // Nav
    await expect(page.locator('.brand')).toContainText('Kaapi');
    await expect(page.locator('.nav-links a[href="brewing.html"]')).toBeVisible();
  });

  test('displays exactly three brew methods with headings, steps, and ratios', async ({ page }) => {
    const cards = page.locator('.brew-card');
    await expect(cards).toHaveCount(3);

    // Headings
    await expect(cards.nth(0).locator('h2')).toContainText('South');
    await expect(cards.nth(1).locator('h2')).toContainText('French');
    await expect(cards.nth(2).locator('h2')).toContainText('Pour');

    // Each has ordered steps
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i).locator('ol.steps li').first()).toBeVisible();
    }

    // Each has a ratio pill
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i).locator('.pill').first()).toBeVisible();
    }
  });

  test('contact page is reachable via nav link', async ({ page }) => {
    await page.click('.nav-links a[href="contact.html"]');
    await expect(page).toHaveURL(/contact\.html/);
    await expect(page.locator('h1')).toContainText('Contact');
  });

  test('no console errors or broken resources', async ({ page }) => {
    const messages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') messages.push(msg.text());
    });
    page.on('requestfailed', req => {
      messages.push(`FAILED: ${req.url()}`);
    });
    await page.reload({ waitUntil: 'networkidle' });
    // font loading may produce CORS or network "errors" on local — ignore those
    const realErrors = messages.filter(m => !m.includes('fonts.googleapis') && !m.includes('fonts.gstatic'));
    expect(realErrors).toEqual([]);
  });

  test('keyboard navigation works for nav links', async ({ page }) => {
    await page.keyboard.press('Tab');
    // First tab should focus the brand link
    const brand = page.locator('.brand');
    await expect(brand).toBeFocused();

    await page.keyboard.press('Tab');
    // Second tab: first nav link (Beans)
    await expect(page.locator('.nav-links a[href="beans.html"]')).toBeFocused();
  });

  test('responsive: mobile viewport renders all content', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    const cards = page.locator('.brew-card');
    await expect(cards).toHaveCount(3);
    // All cards should be visible
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
    // Content should not overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(320);
  });
});
