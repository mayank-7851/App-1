// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Reviews page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/reviews.html', { waitUntil: 'networkidle' });
  });

  test('page loads with correct title and nav', async ({ page }) => {
    await expect(page).toHaveTitle(/Customer Reviews/);
    // Nav brand
    await expect(page.locator('.brand')).toContainText('Kaapi');
    // Reviews link is present in nav
    await expect(page.locator('.nav-links a[href="reviews.html"]')).toBeVisible();
  });

  test('renders exactly 5 review cards', async ({ page }) => {
    const cards = page.locator('.review-card');
    await expect(cards).toHaveCount(5);
  });

  test('each card has stars, a quote, and an author name', async ({ page }) => {
    const cards = page.locator('.review-card');
    for (let i = 0; i < 5; i++) {
      const card = cards.nth(i);
      // Star rating present
      await expect(card.locator('.stars')).toBeVisible();
      // Quote text present
      await expect(card.locator('.review-quote')).not.toBeEmpty();
      // Author name present
      await expect(card.locator('.review-name')).not.toBeEmpty();
    }
  });

  test('each card has exactly 5 star SVGs', async ({ page }) => {
    const cards = page.locator('.review-card');
    for (let i = 0; i < 5; i++) {
      const starCount = await cards.nth(i).locator('.stars svg').count();
      expect(starCount).toBe(5);
    }
  });

  test('stars have aria-label for accessibility', async ({ page }) => {
    const starsRows = page.locator('.stars');
    for (let i = 0; i < await starsRows.count(); i++) {
      const label = await starsRows.nth(i).getAttribute('aria-label');
      expect(label).toContain('out of 5 stars');
    }
  });

  test('nav brand logo links to root', async ({ page }) => {
    const brandLink = page.locator('.brand');
    await expect(brandLink).toHaveAttribute('href', '/');
    await brandLink.click();
    await expect(page).toHaveURL('http://localhost:8080/');
  });

  test('nav links are present including Reviews', async ({ page }) => {
    const navLinks = page.locator('.nav-links a');
    await expect(navLinks).toHaveCount(5); // Beans, Brewing, Story, Reviews, Contact
    const reviewsLink = page.locator('.nav-links a[href="reviews.html"]');
    await expect(reviewsLink).toBeVisible();
  });

  test('no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.reload({ waitUntil: 'networkidle' });
    expect(errors).toHaveLength(0);
  });

  test('styles.css and reviews.css load correctly', async ({ page }) => {
    let res = await page.request.get('http://localhost:8080/styles.css');
    expect(res.status()).toBe(200);
    res = await page.request.get('http://localhost:8080/reviews.css');
    expect(res.status()).toBe(200);
  });

  test('grid has 3 columns at >= 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.waitForTimeout(200);
    const cols = await page.locator('.reviews-grid').evaluate(el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    );
    expect(cols).toBeGreaterThanOrEqual(3);
  });

  test('grid has 2 columns at >= 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 800 });
    await page.waitForTimeout(200);
    const cols = await page.locator('.reviews-grid').evaluate(el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    );
    expect(cols).toBeGreaterThanOrEqual(2);
  });

  test('single column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.waitForTimeout(200);
    const cols = await page.locator('.reviews-grid').evaluate(el =>
      getComputedStyle(el).gridTemplateColumns.split(' ').length
    );
    expect(cols).toBe(1);
  });

  test('heading hierarchy — one h1 and card titles use semantic structure', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText('Brewed by us');
    // Review cards use <article> for semantic grouping
    const articles = page.locator('article.review-card');
    await expect(articles).toHaveCount(5);
  });

  test('long text does not overflow card', async ({ page }) => {
    await page.evaluate(() => {
      const card = document.querySelector('.review-card');
      const quote = card.querySelector('.review-quote p');
      quote.textContent = 'https://this-is-a-really-long-url-that-should-not-overflow-the-card-container.example.com/very/long/path/that/goes/on/forever';
    });
    const card = page.locator('.review-card').first();
    const cardBox = await card.boundingBox();
    const quoteBox = await card.locator('.review-quote').boundingBox();
    expect(quoteBox.width).toBeLessThanOrEqual(cardBox.width + 1);
  });
});
