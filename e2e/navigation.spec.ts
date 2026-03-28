import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test('should start at home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.getByText('LILA')).toBeVisible();
  });

  test('should redirect from lobby to home if not authenticated', async ({ page }) => {
    await page.goto('/lobby');
    await expect(page).toHaveURL('/');
  });

  test('should redirect from game to home if not authenticated', async ({ page }) => {
    await page.goto('/game');
    await expect(page).toHaveURL('/');
  });

  test('full navigation flow: home -> lobby -> logout', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Login
    await page.getByPlaceholder('Nickname').fill('NavTestUser');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Should be at lobby
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });
    await expect(page.getByText('Choose Game Mode')).toBeVisible();

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();

    // Should be back at home
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Who are you?')).toBeVisible();
  });

  test('should handle unknown routes gracefully', async ({ page }) => {
    await page.goto('/unknown-route');
    // Should redirect to home or show a 404 page
    // Since there's no explicit 404 handling, it should go to home
    await expect(page.getByText('LILA').or(page.getByText('Not Found'))).toBeVisible();
  });

  test('authenticated user going to home should redirect to lobby', async ({ page }) => {
    // First login
    await page.goto('/');
    await page.getByPlaceholder('Nickname').fill('RedirectTestUser');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // Now try to go to home again
    await page.goto('/');

    // Should redirect back to lobby since already authenticated
    await expect(page).toHaveURL('/lobby', { timeout: 5000 });
  });
});
