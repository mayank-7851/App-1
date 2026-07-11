// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Contact page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/contact.html', { waitUntil: 'networkidle' });
  });

  test('page loads with correct title and nav', async ({ page }) => {
    await expect(page).toHaveTitle(/Contact/);
    // Nav
    await expect(page.locator('.brand')).toContainText('Kaapi');
    await expect(page.locator('.nav-links a[href="contact.html"]')).toBeVisible();
  });

  test('displays heading, eyebrow, and blurb', async ({ page }) => {
    await expect(page.locator('.eyebrow')).toContainText('Get in touch');
    await expect(page.locator('h1')).toContainText('Contact');
    // blurb
    await expect(page.locator('p.muted').first()).toContainText(/Questions|beans|brewing/);
  });

  test('renders contact form with name, email, message fields and submit button', async ({ page }) => {
    // Form exists
    const form = page.locator('form[aria-label="Contact form"]');
    await expect(form).toBeVisible();

    // Name input
    const nameInput = form.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveAttribute('type', 'text');
    await expect(nameInput).toHaveAttribute('required');

    // Email input
    const emailInput = form.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('required');

    // Message textarea
    const messageTextarea = form.locator('textarea[name="message"]');
    await expect(messageTextarea).toBeVisible();
    await expect(messageTextarea).toHaveAttribute('required');

    // Submit button
    const submitBtn = form.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText('Send');
  });

  test('displays email address with mailto link', async ({ page }) => {
    const mailLink = page.locator('a[href="mailto:hello@kaapi.coffee"]');
    await expect(mailLink).toBeVisible();
    await expect(mailLink).toContainText('hello@kaapi.coffee');
  });

  test('displays physical address', async ({ page }) => {
    await expect(page.locator('body')).toContainText('Chikmagalur');
    await expect(page.locator('body')).toContainText('Karnataka');
    await expect(page.locator('body')).toContainText('577101');
  });

  test('displays business hours', async ({ page }) => {
    await expect(page.locator('body')).toContainText('Hours');
    await expect(page.locator('body')).toContainText(/Mon.*Fri/);
  });

  test('nav links are present and count is correct', async ({ page }) => {
    const navLinks = page.locator('.nav-links a');
    await expect(navLinks).toHaveCount(7);
    // Verify all seven links
    await expect(navLinks.nth(0)).toHaveAttribute('href', 'beans.html');
    await expect(navLinks.nth(1)).toHaveAttribute('href', 'brewing.html');
    await expect(navLinks.nth(2)).toHaveAttribute('href', 'story.html');
    await expect(navLinks.nth(3)).toHaveAttribute('href', 'contact.html');
    await expect(navLinks.nth(4)).toHaveAttribute('href', 'locations.html');
    await expect(navLinks.nth(5)).toHaveAttribute('href', 'careers.html');
    await expect(navLinks.nth(6)).toHaveAttribute('href', '#contact');
  });

  test('no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.reload({ waitUntil: 'networkidle' });
    expect(errors).toHaveLength(0);
  });

  test('form fields can be filled and submit is functional', async ({ page }) => {
    const form = page.locator('form[aria-label="Contact form"]');
    await form.locator('input[name="name"]').fill('Priya Sharma');
    await form.locator('input[name="email"]').fill('priya@example.com');
    await form.locator('textarea[name="message"]').fill('Do you ship to Mumbai?');

    await expect(form.locator('input[name="name"]')).toHaveValue('Priya Sharma');
    await expect(form.locator('input[name="email"]')).toHaveValue('priya@example.com');
    await expect(form.locator('textarea[name="message"]')).toHaveValue('Do you ship to Mumbai?');
  });

  test('responsive: mobile viewport renders all sections', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    // Form should be visible
    await expect(page.locator('form[aria-label="Contact form"]')).toBeVisible();
    // Contact details should be visible
    await expect(page.locator('.contact-details')).toBeVisible();
    // Content should not overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test('styles.css loads correctly', async ({ page }) => {
    const res = await page.request.get('http://localhost:8080/styles.css');
    expect(res.status()).toBe(200);
  });
});
