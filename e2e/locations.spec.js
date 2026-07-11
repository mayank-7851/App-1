// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Locations page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/locations.html', { waitUntil: 'networkidle' });
  });

  test('renders 3 location cards with complete data', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Our Locations');

    const cards = page.locator('.loc-card');
    await expect(cards).toHaveCount(3);

    // Each card has a name (h3), address, hours block, and directions link
    for (let i = 0; i < 3; i++) {
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
  });

  test('same global nav as other pages', async ({ page }) => {
    // Brand logo links to root
    const brandLink = page.locator('.brand');
    await expect(brandLink).toHaveAttribute('href', '/');
    await expect(brandLink).toContainText('Kaapi');

    // Nav links present
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
    await expect(cards).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
  });

  test('grid collapses to single column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.waitForTimeout(200);
    const cols = await page.locator('.g3').evaluate(el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    );
    expect(cols).toBe(1);
  });

  test('Mumbai location shows closed on Monday', async ({ page }) => {
    const mumbaiCard = page.locator('.loc-card').nth(2);
    await expect(mumbaiCard.locator('.closed-note')).toContainText('Closed');
  });

  test('heading hierarchy is logical', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    const cardHeadings = page.locator('.loc-card h3');
    await expect(cardHeadings).toHaveCount(3);
  });
});
