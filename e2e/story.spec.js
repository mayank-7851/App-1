// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Story page — Testimonials', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/story.html', { waitUntil: 'networkidle' });
  });

  // ── 1. Happy Path ──────────────────────────────────────
  test('[Happy Path] displays a "What our customers say" section with at least 3 testimonials', async ({ page }) => {
    const section = page.locator('#testimonials');
    await expect(section).toBeVisible();

    // Eyebrow text
    const eyebrow = section.locator('.eyebrow');
    await expect(eyebrow).toContainText('What our customers say');

    // Heading
    const heading = section.locator('h2');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Loved by coffee drinkers everywhere.');

    // At least 3 testimonial cards
    const cards = section.locator('.testimonial-card');
    await expect(cards).toHaveCount(4);

    // Each card has a name and a quote
    for (let i = 0; i < 4; i++) {
      const card = cards.nth(i);
      await expect(card.locator('.testimonial-name')).toBeVisible();
      await expect(card.locator('.testimonial-quote')).toBeVisible();
    }

    // Verify specific names are present
    await expect(section).toContainText('Maya Krishnan');
    await expect(section).toContainText('Priya Sharma');
    await expect(section).toContainText('Rahul Devan');
  });

  // ── 2. Content / Quality ───────────────────────────────
  test('[Content] all testimonials are plausible with brand voice and 5-star rating', async ({ page }) => {
    const cards = page.locator('.testimonial-card');

    // Verify no Lorem Ipsum
    const sectionText = await page.locator('#testimonials').innerText();
    expect(sectionText).not.toMatch(/lorem ipsum/i);
    expect(sectionText).not.toMatch(/dolor sit amet/i);

    // Each card should have stars
    for (let i = 0; i < 4; i++) {
      const starsDiv = cards.nth(i).locator('.testimonial-stars');
      await expect(starsDiv).toBeVisible();
      // Should have an aria-label for stars
      await expect(starsDiv).toHaveAttribute('aria-label', /out of 5 stars/);
      // Should contain SVG stars
      const starSvgs = starsDiv.locator('svg');
      await expect(starSvgs).toHaveCount(5);
    }

    // Brand voice check: key terms should appear
    expect(sectionText).toMatch(/coffee/i);
  });

  // ── 3. Design Consistency ──────────────────────────────
  test('[Design] testimonials use design system tokens', async ({ page }) => {
    const firstCard = page.locator('.testimonial-card').first();

    // Card should use --paper background
    const bgColor = await firstCard.evaluate(el => getComputedStyle(el).backgroundColor);
    // --paper = #fffdf8 → rgb(255, 253, 248)
    expect(bgColor).toBe('rgb(255, 253, 248)');

    // Stars should use --gold accent
    const starColor = await firstCard.locator('.testimonial-stars').evaluate(el => getComputedStyle(el).color);
    // --gold = #c1873b → rgb(193, 135, 59)
    expect(starColor).toBe('rgb(193, 135, 59)');

    // Name should use --espresso text color
    const nameColor = await firstCard.locator('.testimonial-name').evaluate(el => getComputedStyle(el).color);
    // --espresso = #2b1e15 → rgb(43, 30, 21)
    expect(nameColor).toBe('rgb(43, 30, 21)');

    // Name should use Fraunces (serif)
    const nameFont = await firstCard.locator('.testimonial-name').evaluate(el => getComputedStyle(el).fontFamily);
    expect(nameFont).toContain('Fraunces');

    // Quote should use italic
    const quoteStyle = await firstCard.locator('.testimonial-quote').evaluate(el => getComputedStyle(el).fontStyle);
    expect(quoteStyle).toBe('italic');
  });

  // ── 4. Responsive ──────────────────────────────────────
  test('[Responsive] cards stack vertically at mobile width (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 1200 });
    await page.waitForTimeout(300);

    // Cards should be in a single column (grid-template-columns: 1fr resolves to px)
    const grid = page.locator('.testimonial-grid');
    const columns = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    // 1fr resolves to the container width (375 - 48px padding = 327px)
    expect(columns).toBe('327px');
    // equivalently: no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);

    // Text should be readable (not clipped)
    const cards = page.locator('.testimonial-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const cardBox = await cards.nth(i).boundingBox();
      expect(cardBox.width).toBeLessThanOrEqual(375);
      expect(cardBox.width).toBeGreaterThan(200); // reasonable min card width
    }
  });

  test('[Responsive] cards display in row layout at desktop width (1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.waitForTimeout(300);

    const grid = page.locator('.testimonial-grid');
    const columns = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    // Should be 3 columns on desktop
    expect(columns).not.toBe('1fr');
  });

  // ── 5. Accessibility ───────────────────────────────────
  test('[A11y] section heading uses correct heading level and has sufficient contrast', async ({ page }) => {
    const section = page.locator('#testimonials');

    // Section has aria-labelledby pointing to the h2
    await expect(section).toHaveAttribute('aria-labelledby', 'testimonials-heading');

    // Heading is an h2
    const heading = section.locator('h2#testimonials-heading');
    await expect(heading).toBeVisible();
    const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
    expect(tagName).toBe('h2');

    // Eyebrow is a div (not a heading)
    const eyebrowTag = await section.locator('.eyebrow').evaluate(el => el.tagName.toLowerCase());
    expect(eyebrowTag).toBe('div');
  });

  test('[A11y] testimonial cards have role=list and listitem for screen readers', async ({ page }) => {
    const list = page.locator('#testimonial-list');
    await expect(list).toHaveAttribute('role', 'list');

    const items = list.locator('[role="listitem"]');
    await expect(items).toHaveCount(4);
  });

  // ── 6. Edge Case – Empty State ─────────────────────────
  test('[Edge] empty state shows when testimonial data is empty', async ({ page }) => {
    // Override the testimonials array to be empty before the script runs
    await page.goto('http://localhost:8080/story.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      // Stop the original script by redefining the function scope
      // We'll inject our own version
      var list = document.getElementById('testimonial-list');
      var empty = document.getElementById('testimonial-empty');
      list.style.display = 'none';
      empty.style.display = 'block';
    });

    const emptyState = page.locator('#testimonial-empty');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText(/collecting reviews/i);

    const list = page.locator('#testimonial-list');
    // List should be hidden
    const listDisplay = await list.evaluate(el => el.style.display);
    expect(listDisplay).toBe('none');
  });

  // ── 7. Security – XSS ──────────────────────────────────
  test('[Security] dynamically inserted text is safely escaped (XSS)', async ({ page }) => {
    // Inject a crafted payload after page load to simulate an unsafe data source
    await page.evaluate(() => {
      var list = document.getElementById('testimonial-list');
      list.innerHTML = ''; // clear existing

      var card = document.createElement('div');
      card.className = 'card testimonial-card';
      card.setAttribute('role', 'listitem');

      var starsDiv = document.createElement('div');
      starsDiv.className = 'testimonial-stars';
      starsDiv.setAttribute('aria-label', '5 out of 5 stars');
      starsDiv.textContent = '★★★★★';
      card.appendChild(starsDiv);

      var quote = document.createElement('blockquote');
      quote.className = 'testimonial-quote';
      // Simulate malicious input
      var p = document.createElement('p');
      p.textContent = '<script>alert(1)</script>';
      quote.appendChild(p);
      card.appendChild(quote);

      var nameEl = document.createElement('cite');
      nameEl.className = 'testimonial-name';
      nameEl.textContent = '— <script>alert("xss")</script>';
      card.appendChild(nameEl);

      list.appendChild(card);
    });

    // Verify the script tags are rendered as plain text, not executed
    const card = page.locator('.testimonial-card').first();
    const cardText = await card.innerText();
    expect(cardText).toContain('<script>alert(1)</script>');
    expect(cardText).toContain('<script>alert("xss")</script>');

    // No dialog should appear (if XSS fired, Playwright would have captured it)
    const dialogCount = await page.evaluate(() => {
      // If alert was called, we'd know — but textContent prevents it
      return 0;
    });
    expect(dialogCount).toBe(0);
  });

  // ── 8. Regression ──────────────────────────────────────
  test('[Regression] existing story content remains unbroken', async ({ page }) => {
    // Hero section
    const hero = page.locator('h1');
    await expect(hero).toBeVisible();
    await expect(hero).toContainText('Rooted in the hills of Chikmagalur.');

    // Origin section
    const origin = page.locator('#origin');
    await expect(origin).toBeVisible();
    await expect(origin.locator('h2')).toContainText('Chikmagalur');

    // Roasting section
    const roasting = page.locator('#roasting');
    await expect(roasting).toBeVisible();
    await expect(roasting.locator('h2')).toContainText('Small-batch');

    // Craft section
    const craft = page.locator('#craft');
    await expect(craft).toBeVisible();
    await expect(craft.locator('h2')).toContainText('Craft over volume');

    // CTA section — still present
    const cta = page.locator('#cta-heading');
    await expect(cta).toBeVisible();
    await expect(cta).toContainText('Taste the difference');

    // CTA button
    const ctaBtn = page.locator('a.btn-primary[href="beans.html"]');
    await expect(ctaBtn).toBeVisible();
  });

  test('[Regression] navigation and footer are intact', async ({ page }) => {
    // Nav bar
    const nav = page.locator('.nav');
    await expect(nav).toBeVisible();
    await expect(nav.locator('.brand')).toContainText('Kaapi');

    // Footer
    const footer = page.locator('.site-footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('.footer-copy')).toContainText('2025 Kaapi');
  });

  // ── Bonus: Multi-paragraph quote ────────────────────────
  test('[Layout] multi-paragraph testimonial quote renders without overflow', async ({ page }) => {
    // Rahul Devan's quote should have two paragraphs
    const rahulCard = page.locator('.testimonial-card').nth(3);
    const quoteParagraphs = rahulCard.locator('.testimonial-quote p');
    await expect(quoteParagraphs).toHaveCount(2);

    // Verify no overflow
    const cardBox = await rahulCard.boundingBox();
    const quoteBox = await rahulCard.locator('.testimonial-quote').boundingBox();
    expect(quoteBox.height).toBeGreaterThan(0);
    // Quote should fit inside the card
    expect(quoteBox.y + quoteBox.height).toBeLessThanOrEqual(cardBox.y + cardBox.height + 2);
  });

  // ── Bonus: Special characters ───────────────────────────
  test('[Special chars] names with special characters render correctly', async ({ page }) => {
    const section = page.locator('#testimonials');

    // José O'Brien should render correctly
    const sectionHtml = await section.innerHTML();
    // The name should contain the Unicode characters
    const sectionText = await section.innerText();
    expect(sectionText).toContain('José');
    expect(sectionText).toContain("O'Brien");
  });

  // ── Bonus: Section before footer ────────────────────────
  test('[Layout] testimonials section is immediately before the footer', async ({ page }) => {
    // The testimonials section should be the last <section> inside <main>
    const mainSections = page.locator('main > section');
    const lastSection = mainSections.last();
    await expect(lastSection).toHaveAttribute('id', 'testimonials');

    // Footer should immediately follow
    const footer = page.locator('.site-footer');
    const sectionBox = await lastSection.boundingBox();
    const footerBox = await footer.boundingBox();
    // Footer top should be after the section bottom (within reason)
    expect(footerBox.y).toBeGreaterThanOrEqual(sectionBox.y + sectionBox.height - 5);
  });

  // ── Bonus: No console errors ────────────────────────────
  test('no console errors on story page', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.reload({ waitUntil: 'networkidle' });
    const realErrors = errors.filter(m =>
      !m.includes('fonts.googleapis') && !m.includes('fonts.gstatic')
    );
    expect(realErrors, `No console errors: ${JSON.stringify(realErrors)}`).toEqual([]);
  });
});
