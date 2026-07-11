// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Home page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  });

  test('About section renders with a heading', async ({ page }) => {
    const aboutSection = page.locator('#about');
    await expect(aboutSection).toBeVisible();

    const heading = aboutSection.locator('#about-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('From the misty hills of Coorg');
  });

  test('About section has three paragraphs of brand story', async ({ page }) => {
    const paragraphs = page.locator('#about p');
    await expect(paragraphs).toHaveCount(3);

    // First paragraph mentions the brand origin
    await expect(paragraphs.nth(0)).toContainText('Kaapi was born');

    // Second paragraph mentions sourcing
    await expect(paragraphs.nth(1)).toContainText('Western Ghats');

    // Third paragraph is the closing statement
    await expect(paragraphs.nth(2)).toContainText('Kaapi — slow');
  });

  test('About section has a decorative divider', async ({ page }) => {
    const divider = page.locator('#about .divider');
    await expect(divider).toBeVisible();
    await expect(divider.locator('.line-dot')).toHaveCount(2);
    await expect(divider.locator('svg')).toBeVisible();
  });

  test('Existing nav is still present and functional', async ({ page }) => {
    const nav = page.locator('.nav');
    await expect(nav).toBeVisible();

    const brand = nav.locator('.brand');
    await expect(brand).toBeVisible();
    await expect(brand).toContainText('Kaapi');

    const navLinks = nav.locator('.nav-links a');
    await expect(navLinks).toHaveCount(6);
    await expect(navLinks.nth(0)).toHaveAttribute('href', 'beans.html');
    await expect(navLinks.nth(1)).toHaveAttribute('href', 'brewing.html');
    await expect(navLinks.nth(2)).toHaveAttribute('href', 'story.html');
    await expect(navLinks.nth(3)).toHaveAttribute('href', 'contact.html');
    await expect(navLinks.nth(4)).toHaveAttribute('href', 'locations.html');
    await expect(navLinks.nth(5)).toHaveAttribute('href', '#contact');
  });

  test('Existing hero section is still present', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Coffee, the way it should taste');

    const eyebrow = page.locator('.eyebrow').first();
    await expect(eyebrow).toBeVisible();
    await expect(eyebrow).toContainText('Roasted in small batches');

    const cta = page.locator('.btn-primary');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '#beans');
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
    // Ignore font-loading noise on localhost
    const realErrors = messages.filter(m =>
      !m.includes('fonts.googleapis') && !m.includes('fonts.gstatic')
    );
    expect(realErrors).toEqual([]);
  });

  test('styles.css loads correctly', async ({ page }) => {
    const res = await page.request.get('http://localhost:8080/styles.css');
    expect(res.status()).toBe(200);
  });

  test('responsive: About section is readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    const aboutSection = page.locator('#about');
    await expect(aboutSection).toBeVisible();

    const heading = aboutSection.locator('h2');
    await expect(heading).toBeVisible();

    // Content should not overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });
});
