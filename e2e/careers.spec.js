// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Careers page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/careers.html', { waitUntil: 'networkidle' });
  });

  test('renders 3 role cards with complete data', async ({ page }) => {
    // heading
    await expect(page.locator('h1')).toContainText('Careers');

    // eyebrow
    await expect(page.locator('.eyebrow')).toContainText('Work with us');

    // cards exist
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(3);

    // each card has title, meta, notes
    for (let i = 0; i < 3; i++) {
      const card = cards.nth(i);
      await expect(card.locator('.card-title')).not.toBeEmpty();
      await expect(card.locator('.card-meta')).not.toBeEmpty();
      await expect(card.locator('.card-notes')).not.toBeEmpty();
    }

    // verify role titles
    await expect(cards.nth(0).locator('.card-title')).toContainText('Head Roaster');
    await expect(cards.nth(1).locator('.card-title')).toContainText('Café Manager');
    await expect(cards.nth(2).locator('.card-title')).toContainText('Green Coffee Buyer');
  });

  test('Careers link is present in global nav', async ({ page }) => {
    const careersLink = page.locator('.nav-links a[href="careers.html"]');
    await expect(careersLink).toBeVisible();
    await expect(careersLink).toContainText('Careers');
  });

  test('no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.reload({ waitUntil: 'networkidle' });
    expect(errors).toHaveLength(0);
  });

  test('nav brand links to root', async ({ page }) => {
    const brandLink = page.locator('.brand');
    await expect(brandLink).toHaveAttribute('href', '/');
    await brandLink.click();
    await expect(page).toHaveURL('http://localhost:8080/');
  });

  test('nav links are present and functional', async ({ page }) => {
    const navLinks = page.locator('.nav-links a');
    await expect(navLinks).toHaveCount(7);

    await expect(navLinks.nth(0)).toHaveAttribute('href', 'beans.html');
    await expect(navLinks.nth(1)).toHaveAttribute('href', 'brewing.html');
    await expect(navLinks.nth(2)).toHaveAttribute('href', 'story.html');
    await expect(navLinks.nth(3)).toHaveAttribute('href', 'contact.html');
    await expect(navLinks.nth(4)).toHaveAttribute('href', 'locations.html');
    await expect(navLinks.nth(5)).toHaveAttribute('href', 'careers.html');
    await expect(navLinks.nth(6)).toHaveAttribute('href', '#contact');
  });

  test('styles.css loads correctly', async ({ page }) => {
    const res = await page.request.get('http://localhost:8080/styles.css');
    expect(res.status()).toBe(200);
  });

  test('responsive: all cards visible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
    // Content should not overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test('grid has 3 columns at >= 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.waitForTimeout(200);
    const cols = await page.locator('.grid-2-3').evaluate(el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    );
    expect(cols).toBeGreaterThanOrEqual(3);
  });

  test('single column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.waitForTimeout(200);
    const cols = await page.locator('.grid-2-3').evaluate(el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    );
    expect(cols).toBe(1);
  });
});
