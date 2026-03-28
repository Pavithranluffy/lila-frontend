import { test, expect } from '@playwright/test';

test.describe('Lobby Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first before each test
    await page.goto('/');
    await page.getByPlaceholder('Nickname').fill('LobbyTestUser');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });
  });

  test('should display the header with logo', async ({ page }) => {
    await expect(page.locator('header').getByText('LILA')).toBeVisible();
  });

  test('should display the user display name', async ({ page }) => {
    // Username appears in multiple places (header for both mobile and desktop)
    await expect(page.getByText('LobbyTestUser').first()).toBeVisible();
  });

  test('should show connection status indicator', async ({ page }) => {
    // Look for the green dot (connected state)
    const connectionIndicator = page.locator('.bg-\\[var\\(--accent-green\\)\\]').first();
    await expect(connectionIndicator).toBeVisible();

    // Should show "Connected" text on desktop
    await expect(page.getByText('Connected')).toBeVisible();
  });

  test('should display "Choose Game Mode" heading', async ({ page }) => {
    await expect(page.getByText('Choose Game Mode')).toBeVisible();
  });

  test('should display Classic Mode button', async ({ page }) => {
    await expect(page.getByText('Classic Mode')).toBeVisible();
    await expect(page.getByText('No time limit. Take your time to think.')).toBeVisible();
  });

  test('should display Timed Mode button', async ({ page }) => {
    // Use role-based selector to avoid matching "In timed mode" text
    await expect(page.getByRole('button', { name: /Timed Mode/ })).toBeVisible();
    await expect(page.getByText('30 seconds per turn. Fast-paced action!')).toBeVisible();
  });

  test('should display "How to Play" section', async ({ page }) => {
    await expect(page.getByText('How to Play')).toBeVisible();
    await expect(page.getByText('Get 3 marks in a row to win')).toBeVisible();
    await expect(page.getByText('In timed mode, run out of time and you lose')).toBeVisible();
    await expect(page.getByText('First player is X (cyan), second is O (pink)')).toBeVisible();
  });

  test('should display Leaderboard section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible();
  });

  test('should show matchmaking modal when clicking Classic Mode', async ({ page }) => {
    await page.getByText('Classic Mode').click();

    // Matchmaking modal should appear
    await expect(page.getByText('Finding a random player')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Searching')).toBeVisible();
    await expect(page.getByText('Waiting for another player to join...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('should show matchmaking modal when clicking Timed Mode', async ({ page }) => {
    // Use role-based selector to avoid matching "In timed mode" text
    await page.getByRole('button', { name: /Timed Mode/ }).click();

    // Matchmaking modal should appear
    await expect(page.getByText('Finding a random player')).toBeVisible({ timeout: 5000 });
  });

  test('should be able to cancel matchmaking', async ({ page }) => {
    await page.getByText('Classic Mode').click();

    // Wait for modal to appear
    await expect(page.getByText('Finding a random player')).toBeVisible({ timeout: 5000 });

    // Cancel matchmaking
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Modal should close
    await expect(page.getByText('Finding a random player')).not.toBeVisible();
  });

  test('should show elapsed time in matchmaking modal', async ({ page }) => {
    await page.getByText('Classic Mode').click();

    // Wait for modal and check time display
    await expect(page.getByText('Time elapsed:')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('0:00')).toBeVisible();

    // Wait a couple seconds and verify time updates
    await page.waitForTimeout(2000);
    await expect(page.getByText('0:02').or(page.getByText('0:01')).or(page.getByText('0:03'))).toBeVisible();
  });

  test('should logout and redirect to home page', async ({ page }) => {
    // Find and click logout button
    await page.getByRole('button', { name: 'Logout' }).click();

    // Should redirect to home page
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Who are you?')).toBeVisible();
  });

  test('should redirect to home if not authenticated', async ({ page }) => {
    // Clear storage and navigate directly to lobby
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('/lobby');

    // Should redirect to home
    await expect(page).toHaveURL('/');
  });
});
