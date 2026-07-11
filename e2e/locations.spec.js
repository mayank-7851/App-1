// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Locations page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/locations.html', { waitUntil: 'networkidle' });
  });

  test('renders 5 location cards with complete data', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Our Locations');

    const cards = page.locator('.loc-card');
    await expect(cards).toHaveCount(5);

    // Each card has a name (h3), address, hours block, and directions link
    for (let i = 0; i < 5; i++) {
      const card = cards.nth(i);
      await expect(card.locator('h3')).not.toBeEmpty();
      await expect(card.locator('.address')).not.toBeEmpty();
      await expect(card.locator('.hours-block')).not.toBeEmpty();
      await expect(card.locator('.card-link')).toContainText('Get directions');
    }
  });

  test('location cards have expected names', async ({ page }) => {
    const headings = page.locator('.loc-card h3');
    await expect(headings.nth(0)).toContainText('Kaapi Brew Bar');
    await expect(headings.nth(1)).toContainText('Kaapi House');
    await expect(headings.nth(2)).toContainText('Kaapi Roastery');
    await expect(headings.nth(3)).toContainText('Kaapi Kolkata');
    await expect(headings.nth(4)).toContainText('Kaapi Delhi');
  });

  test('Kolkata card displays correct city name and address', async ({ page }) => {
    const kolkataCard = page.locator('.loc-card').nth(3);
    await expect(kolkataCard.locator('h3')).toContainText('Kolkata');
    await expect(kolkataCard.locator('.address')).toContainText('Kolkata 700017');
    await expect(kolkataCard.locator('.address')).toContainText('Park Street');
  });

  test('Delhi card displays correct city name and address', async ({ page }) => {
    const delhiCard = page.locator('.loc-card').nth(4);
    await expect(delhiCard.locator('h3')).toContainText('Delhi');
    await expect(delhiCard.locator('.address')).toContainText('New Delhi 110003');
    await expect(delhiCard.locator('.address')).toContainText('Khan Market');
  });

  test('existing location cards remain unchanged', async ({ page }) => {
    const headings = page.locator('.loc-card h3');
    await expect(headings.nth(0)).toContainText('Kaapi Brew Bar');
    await expect(headings.nth(1)).toContainText('Kaapi House');
    await expect(headings.nth(2)).toContainText('Kaapi Roastery');

    const bangaloreCard = page.locator('.loc-card').nth(0);
    await expect(bangaloreCard.locator('.address')).toContainText('Bangalore 560095');

    const chennaiCard = page.locator('.loc-card').nth(1);
    await expect(chennaiCard.locator('.address')).toContainText('Chennai 600004');

    const mumbaiCard = page.locator('.loc-card').nth(2);
    await expect(mumbaiCard.locator('.address')).toContainText('Mumbai 400050');
    await expect(mumbaiCard.locator('.closed-note')).toContainText('Closed');
  });

  test('same global nav as other pages', async ({ page }) => {
    // Brand logo links to root
    const brandLink = page.locator('.brand');
    await expect(brandLink).toHaveAttribute('href', '/');
    await expect(brandLink).toContainText('Kaapi');

    // Nav links present
    const navLinks = page.locator('.nav-links a');
    await expect(navLinks).toHaveCount(5);
    await expect(navLinks.nth(0)).toHaveAttribute('href', 'beans.html');
    await expect(navLinks.nth(1)).toHaveAttribute('href', 'brewing.html');
    await expect(navLinks.nth(2)).toHaveAttribute('href', 'story.html');
    await expect(navLinks.nth(3)).toHaveAttribute('href', 'locations.html');
    await expect(navLinks.nth(4)).toHaveAttribute('href', '#contact');
  });

  test('nav logo links to root', async ({ page }) => {
    const brandLink = page.locator('.brand');
    await brandLink.click();
    await expect(page).toHaveURL('http://localhost:8080/');
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
    const realErrors = messages.filter(m => !m.includes('fonts.googleapis') && !m.includes('fonts.gstatic'));
    expect(realErrors).toEqual([]);
  });

  test('styles.css loads correctly', async ({ page }) => {
    const res = await page.request.get('http://localhost:8080/styles.css');
    expect(res.status()).toBe(200);
  });

  test('responsive: all cards visible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    const cards = page.locator('.loc-card');
    await expect(cards).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
  });

  test('grid collapses to single column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.waitForTimeout(200);
    const cols = await page.locator('.g4').evaluate(el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    );
    expect(cols).toBe(1);
  });

  test('no horizontal scroll at 320px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.waitForTimeout(200);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1); // tolerate 1px rounding
  });

  test('Mumbai location shows closed on Monday', async ({ page }) => {
    const mumbaiCard = page.locator('.loc-card').nth(2);
    await expect(mumbaiCard.locator('.closed-note')).toContainText('Closed');
  });

  test('heading hierarchy is logical', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    const cardHeadings = page.locator('.loc-card h3');
    await expect(cardHeadings).toHaveCount(5);
  });
});
