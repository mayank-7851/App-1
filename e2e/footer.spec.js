// @ts-check
const { test, expect } = require('@playwright/test');

const PAGES = [
  { name: 'Home', url: '/', file: 'index.html' },
  { name: 'Beans', url: '/beans.html', file: 'beans.html' },
  { name: 'Brewing', url: '/brewing.html', file: 'brewing.html' },
  { name: 'Story', url: '/story.html', file: 'story.html' },
];

test.describe('Site footer', () => {

  for (const pageInfo of PAGES) {
    test(`footer appears on ${pageInfo.name} page`, async ({ page }) => {
      await page.goto(pageInfo.url, { waitUntil: 'networkidle' });

      // Footer element exists
      const footer = page.locator('.site-footer');
      await expect(footer).toBeVisible();

      // Copyright line
      await expect(footer.locator('.footer-copy')).toContainText('2025 Kaapi');

      // Footer nav exists with correct aria-label
      const footerNav = footer.locator('.footer-nav');
      await expect(footerNav).toHaveAttribute('aria-label', 'Footer navigation');

      // Four nav links: Home, Beans, Brewing, Story
      const footerLinks = footerNav.locator('a');
      await expect(footerLinks).toHaveCount(4);

      // Verify link texts and hrefs
      const expectedLinks = [
        { text: 'Home', href: '/' },
        { text: 'Beans', href: 'beans.html' },
        { text: 'Brewing', href: 'brewing.html' },
        { text: 'Story', href: 'story.html' },
      ];

      for (let i = 0; i < expectedLinks.length; i++) {
        const link = footerLinks.nth(i);
        await expect(link).toContainText(expectedLinks[i].text);
        await expect(link).toHaveAttribute('href', expectedLinks[i].href);
      }
    });

    test(`footer nav links are clickable on ${pageInfo.name} page`, async ({ page }) => {
      await page.goto(pageInfo.url, { waitUntil: 'networkidle' });

      // Click "Home" in footer
      await page.locator('.footer-nav a[href="/"]').click();
      await expect(page).toHaveURL('http://localhost:8080/');

      // Click "Beans" in footer
      await page.locator('.footer-nav a[href="beans.html"]').click();
      await expect(page).toHaveURL(/beans\.html/);

      // Click "Brewing" in footer
      await page.locator('.footer-nav a[href="brewing.html"]').click();
      await expect(page).toHaveURL(/brewing\.html/);

      // Click "Story" in footer
      await page.locator('.footer-nav a[href="story.html"]').click();
      await expect(page).toHaveURL(/story\.html/);
    });
  }

  test('no console errors on any page (footer check)', async ({ page }) => {
    for (const pageInfo of PAGES) {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
      const realErrors = errors.filter(m =>
        !m.includes('fonts.googleapis') && !m.includes('fonts.gstatic')
      );
      expect(realErrors, `No console errors on ${pageInfo.name} page`).toEqual([]);
    }
  });

  test('footer is at the bottom of the page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const footerBox = await page.locator('.site-footer').boundingBox();
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

    // Footer bottom should be at or near the body bottom
    expect(footerBox.y + footerBox.height).toBeGreaterThanOrEqual(bodyHeight - 10);
  });

  test('footer responsive: stacks vertically on mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 375, height: 800 });
    await page.waitForTimeout(200);

    const wrap = page.locator('.site-footer .wrap');
    const flexDirection = await wrap.evaluate(el =>
      getComputedStyle(el).flexDirection
    );
    // On mobile (<=540px) it should stack vertically
    expect(flexDirection).toBe('column');
  });

  test('footer responsive: horizontal on desktop', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.waitForTimeout(200);

    const wrap = page.locator('.site-footer .wrap');
    const flexDirection = await wrap.evaluate(el =>
      getComputedStyle(el).flexDirection
    );
    // On desktop (>540px) it should be row
    expect(flexDirection).toBe('row');
  });
});
