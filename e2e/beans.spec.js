// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Beans page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/beans.html', { waitUntil: 'networkidle' });
  });

  test('renders a grid of coffee cards with complete data', async ({ page }) => {
    // heading
    await expect(page.locator('h1')).toContainText('Our Beans');

    // cards exist
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(6);

    // each card has name, origin, roast, notes, price
    for (let i = 0; i < 6; i++) {
      const card = cards.nth(i);
      await expect(card.locator('.card-title')).not.toBeEmpty();
      await expect(card.locator('.card-meta')).not.toBeEmpty();
      await expect(card.locator('.pill')).not.toBeEmpty();
      await expect(card.locator('.card-notes')).not.toBeEmpty();
      await expect(card.locator('.card-price')).not.toBeEmpty();
    }
  });

  test('nav logo links to root', async ({ page }) => {
    const brandLink = page.locator('.brand');
    await expect(brandLink).toHaveAttribute('href', '/');
    await brandLink.click();
    await expect(page).toHaveURL('http://localhost:8080/');
  });

  test('no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.reload({ waitUntil: 'networkidle' });
    expect(errors).toHaveLength(0);
  });

  test('nav links are present and functional', async ({ page }) => {
    const navLinks = page.locator('.nav-links a');
    await expect(navLinks).toHaveCount(5);
    const beansLink = navLinks.first();
    await expect(beansLink).toHaveAttribute('href', 'beans.html');
  });

  test('grid has 2+ columns at >= 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 800 });
    await page.waitForTimeout(200);
    const cols = await page.locator('.grid-2-3').evaluate(el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    );
    expect(cols).toBeGreaterThanOrEqual(2);
  });

  test('grid has 3+ columns at >= 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.waitForTimeout(200);
    const cols = await page.locator('.grid-2-3').evaluate(el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    );
    expect(cols).toBeGreaterThanOrEqual(3);
  });

  test('single column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.waitForTimeout(200);
    const cols = await page.locator('.grid-2-3').evaluate(el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    );
    expect(cols).toBe(1);
  });

  test('long text does not overflow card', async ({ page }) => {
    // inject a card with an extremely long word
    await page.evaluate(() => {
      const card = document.querySelector('.card');
      const notes = card.querySelector('.card-notes');
      notes.textContent = 'https://this-is-a-really-long-url-that-should-not-overflow-the-card-container.example.com/very/long/path';
    });
    const card = page.locator('.card').first();
    const cardBox = await card.boundingBox();
    const notesBox = await card.locator('.card-notes').boundingBox();
    expect(notesBox.width).toBeLessThanOrEqual(cardBox.width + 1);
  });

  test('heading hierarchy is logical with card titles using h2', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    const cardTitles = page.locator('.card-title');
    for (let i = 0; i < await cardTitles.count(); i++) {
      const tag = await cardTitles.nth(i).evaluate(el => el.tagName);
      expect(tag).toBe('H2');
    }
  });

  test('styles.css loads correctly', async ({ page }) => {
    const res = await page.request.get('http://localhost:8080/styles.css');
    expect(res.status()).toBe(200);
  });
});
