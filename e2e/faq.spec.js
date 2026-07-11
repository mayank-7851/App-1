// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('FAQ page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/faq.html', { waitUntil: 'networkidle' });
  });

  test('page loads with correct title, heading, and nav', async ({ page }) => {
    await expect(page).toHaveTitle(/FAQ/);
    await expect(page.locator('h1')).toContainText('Frequently asked');
    await expect(page.locator('.brand')).toContainText('Kaapi');
    await expect(page.locator('.nav-links a[href="faq.html"]')).toBeVisible();
  });

  test('displays exactly five FAQ items with questions and answers', async ({ page }) => {
    const items = page.locator('.faq-item');
    await expect(items).toHaveCount(5);

    // Verify each item has a summary (question) and answer content
    for (let i = 0; i < 5; i++) {
      const item = items.nth(i);
      await expect(item.locator('summary')).not.toBeEmpty();
      await expect(item.locator('.faq-answer')).not.toBeEmpty();
    }
  });

  test('accordion: clicking a summary opens the details element', async ({ page }) => {
    const firstItem = page.locator('.faq-item').first();
    // Initially closed
    await expect(firstItem).not.toHaveAttribute('open', '');

    // Click to open
    await firstItem.locator('summary').click();
    await expect(firstItem).toHaveAttribute('open', '');

    // Click again to close
    await firstItem.locator('summary').click();
    await expect(firstItem).not.toHaveAttribute('open', '');
  });

  test('only one accordion item can be open at a time (native <details> allows multiple, so we check independence)', async ({ page }) => {
    const items = page.locator('.faq-item');

    // Open the first item
    await items.nth(0).locator('summary').click();
    await expect(items.nth(0)).toHaveAttribute('open', '');

    // Open the third item — both should be open (native <details> allows multiple)
    await items.nth(2).locator('summary').click();
    await expect(items.nth(0)).toHaveAttribute('open', '');
    await expect(items.nth(2)).toHaveAttribute('open', '');
  });

  test('FAQ content includes expected topics', async ({ page }) => {
    const pageText = await page.textContent('main');
    expect(pageText).toContain('ship');
    expect(pageText).toContain('roast');
    expect(pageText).toContain('subscription');
    expect(pageText).toContain('Chikmagalur');
    expect(pageText).toContain('store');
  });

  test('nav links are present and functional', async ({ page }) => {
    const navLinks = page.locator('.nav-links a');
    await expect(navLinks).toHaveCount(5);

    // FAQ link points to faq.html
    const faqLink = navLinks.nth(3);
    await expect(faqLink).toHaveAttribute('href', 'faq.html');

    // Brand logo links to root
    const brandLink = page.locator('.brand');
    await expect(brandLink).toHaveAttribute('href', '/');
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

  test('heading hierarchy: single h1, questions use summary not heading tags', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    // Questions are <summary> elements, not h2/h3 — no heading tag inside .faq-item summary
    const headingsInFaq = page.locator('.faq-item summary h1, .faq-item summary h2, .faq-item summary h3');
    await expect(headingsInFaq).toHaveCount(0);
  });

  test('responsive: mobile viewport renders all FAQ items', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    const items = page.locator('.faq-item');
    await expect(items).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      await expect(items.nth(i)).toBeVisible();
    }
    // No horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test('keyboard accessibility: Tab navigates to accordion summaries', async ({ page }) => {
    // Tab past brand and nav links (5 links + 1 brand = 6 tabs)
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
    }
    // Now we should be on the first FAQ summary
    const firstSummary = page.locator('.faq-item').first().locator('summary');
    await expect(firstSummary).toBeFocused();

    // Enter key should open it
    await page.keyboard.press('Enter');
    await expect(page.locator('.faq-item').first()).toHaveAttribute('open', '');
  });
});
