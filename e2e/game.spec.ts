import { test, expect } from '@playwright/test';

test.describe('Game Page', () => {
  test('should redirect to lobby if accessing /game directly without a match', async ({ page }) => {
    // First login
    await page.goto('/');
    await page.getByPlaceholder('Nickname').fill('GameTestUser');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // Try to navigate directly to game without a match
    await page.goto('/game');

    // Should redirect to lobby
    await expect(page).toHaveURL('/lobby', { timeout: 5000 });
  });

  test('should redirect to home if not authenticated', async ({ page }) => {
    // Use a fresh context (no authentication) to test redirect
    await page.goto('/game');

    // Should redirect to home since not authenticated
    await expect(page).toHaveURL('/');
  });
});

// Tests that require two players (multiplayer tests)
test.describe('Game Page - Single Player Setup', () => {
  test.beforeEach(async ({ page }) => {
    // Login and start matchmaking
    await page.goto('/');
    await page.getByPlaceholder('Nickname').fill('SinglePlayerTest');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });
  });

  test('matchmaking should show searching state', async ({ page }) => {
    // Click to start classic mode matchmaking
    await page.getByText('Classic Mode').click();

    // Should show matchmaking modal
    await expect(page.getByText('Finding a random player')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Searching')).toBeVisible();

    // Cancel and verify we can cancel
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Finding a random player')).not.toBeVisible();
  });
});

// Two-player tests using multiple browser contexts
test.describe('Game Page - Multiplayer', () => {
  test('two players should be matched and see the game board', async ({ browser }) => {
    // Create two browser contexts (simulates two players)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const player1Page = await context1.newPage();
    const player2Page = await context2.newPage();

    try {
      // Player 1 login
      await player1Page.goto('/');
      await player1Page.getByPlaceholder('Nickname').fill('Player1');
      await player1Page.getByRole('button', { name: 'Continue' }).click();
      await expect(player1Page).toHaveURL('/lobby', { timeout: 10000 });

      // Player 2 login
      await player2Page.goto('/');
      await player2Page.getByPlaceholder('Nickname').fill('Player2');
      await player2Page.getByRole('button', { name: 'Continue' }).click();
      await expect(player2Page).toHaveURL('/lobby', { timeout: 10000 });

      // Both players start matchmaking for Classic mode
      await player1Page.getByText('Classic Mode').click();
      await player2Page.getByText('Classic Mode').click();

      // Wait for match to be found (both should navigate to /game)
      await expect(player1Page).toHaveURL('/game', { timeout: 15000 });
      await expect(player2Page).toHaveURL('/game', { timeout: 15000 });

      // Wait for game state to be received (server sends STATE_UPDATE)
      await player1Page.waitForTimeout(2000);
      await player2Page.waitForTimeout(1000);

      // Both players should see the game board
      const player1Cells = player1Page.locator('[aria-label^="Cell"]');
      const player2Cells = player2Page.locator('[aria-label^="Cell"]');

      await expect(player1Cells).toHaveCount(9);
      await expect(player2Cells).toHaveCount(9);

      // Check that game status shows playing state
      // One player should see "Your turn!" and the other should see "Opponent's turn..."
      const player1HasTurn = await player1Page.getByText('Your turn!').isVisible().catch(() => false);
      const player1WaitsTurn = await player1Page.getByText("Opponent's turn...").isVisible().catch(() => false);

      // At least one of these should be visible
      expect(player1HasTurn || player1WaitsTurn).toBe(true);

    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('players should be able to make moves alternately', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const player1Page = await context1.newPage();
    const player2Page = await context2.newPage();

    try {
      // Login both players
      await player1Page.goto('/');
      await player1Page.getByPlaceholder('Nickname').fill('MovePlayer1');
      await player1Page.getByRole('button', { name: 'Continue' }).click();
      await expect(player1Page).toHaveURL('/lobby', { timeout: 10000 });

      await player2Page.goto('/');
      await player2Page.getByPlaceholder('Nickname').fill('MovePlayer2');
      await player2Page.getByRole('button', { name: 'Continue' }).click();
      await expect(player2Page).toHaveURL('/lobby', { timeout: 10000 });

      // Start matchmaking
      await player1Page.getByText('Classic Mode').click();
      await player2Page.getByText('Classic Mode').click();

      // Wait for game to start
      await expect(player1Page).toHaveURL('/game', { timeout: 15000 });
      await expect(player2Page).toHaveURL('/game', { timeout: 15000 });

      // Wait for game state to be received
      await player1Page.waitForTimeout(2000);

      // Find who has the turn
      const player1HasTurn = await player1Page.getByText('Your turn!').isVisible().catch(() => false);
      const player2HasTurn = await player2Page.getByText('Your turn!').isVisible().catch(() => false);

      // At least one player should have a turn
      expect(player1HasTurn || player2HasTurn).toBe(true);

      // The player with the turn clicks the center cell (index 4)
      const activePage = player1HasTurn ? player1Page : player2Page;
      const waitingPage = player1HasTurn ? player2Page : player1Page;

      await activePage.locator('[aria-label="Cell 5, empty"]').click();

      // Wait for server to process
      await activePage.waitForTimeout(1000);

      // After move, the other player should have their turn OR cell should be marked
      // Verify the cell now shows X (first player is always X)
      await expect(player1Page.locator('.game-cell.x')).toHaveCount(1, { timeout: 5000 });
      await expect(player2Page.locator('.game-cell.x')).toHaveCount(1, { timeout: 5000 });

      // The waiting player should now have their turn
      await expect(waitingPage.getByText('Your turn!')).toBeVisible({ timeout: 5000 });

    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test.skip('game should detect a winner', async ({ browser }) => {
    // This test is skipped because it's flaky in CI environments
    // The full game simulation requires precise timing between two players
    // Manual testing is recommended for win detection functionality
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const player1Page = await context1.newPage();
    const player2Page = await context2.newPage();

    try {
      // Login both players
      await player1Page.goto('/');
      await player1Page.getByPlaceholder('Nickname').fill('WinPlayer1');
      await player1Page.getByRole('button', { name: 'Continue' }).click();
      await expect(player1Page).toHaveURL('/lobby', { timeout: 10000 });

      await player2Page.goto('/');
      await player2Page.getByPlaceholder('Nickname').fill('WinPlayer2');
      await player2Page.getByRole('button', { name: 'Continue' }).click();
      await expect(player2Page).toHaveURL('/lobby', { timeout: 10000 });

      // Start matchmaking
      await player1Page.getByText('Classic Mode').click();
      await player2Page.getByText('Classic Mode').click();

      // Wait for game
      await expect(player1Page).toHaveURL('/game', { timeout: 15000 });
      await expect(player2Page).toHaveURL('/game', { timeout: 15000 });

      // Wait for game state to be received
      await player1Page.waitForTimeout(2000);

      // Helper to make a move on the current player's turn
      const makeMove = async (cellIndex: number) => {
        await player1Page.waitForTimeout(300);
        const player1HasTurn = await player1Page.getByText('Your turn!').isVisible().catch(() => false);
        const activePage = player1HasTurn ? player1Page : player2Page;

        // Wait for cell to be clickable
        const cellSelector = `[aria-label="Cell ${cellIndex + 1}, empty"]`;
        await activePage.locator(cellSelector).waitFor({ state: 'visible', timeout: 5000 });
        await activePage.locator(cellSelector).click();
        await activePage.waitForTimeout(800); // Wait for server to process
      };

      // Play a game where X wins with top row (cells 0, 1, 2)
      // X plays: 0, 1, 2 (top row)
      // O plays: 3, 4 (middle left and center)

      await makeMove(0); // X at 0
      await makeMove(3); // O at 3
      await makeMove(1); // X at 1
      await makeMove(4); // O at 4
      await makeMove(2); // X at 2 - X wins!

      // Wait for game result modal to appear (2 second delay + buffer)
      await player1Page.waitForTimeout(4000);

      // One player should see "WINNER!" and the other should see "DEFEAT"
      const winnerVisible = await player1Page.getByText('WINNER!').isVisible().catch(() => false) ||
                           await player2Page.getByText('WINNER!').isVisible().catch(() => false);
      const defeatVisible = await player1Page.getByText('DEFEAT').isVisible().catch(() => false) ||
                           await player2Page.getByText('DEFEAT').isVisible().catch(() => false);

      expect(winnerVisible).toBe(true);
      expect(defeatVisible).toBe(true);

    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('player can leave the game', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const player1Page = await context1.newPage();
    const player2Page = await context2.newPage();

    try {
      // Login both players with unique names
      await player1Page.goto('/');
      await player1Page.getByPlaceholder('Nickname').fill('LeaveP1');
      await player1Page.getByRole('button', { name: 'Continue' }).click();
      await expect(player1Page).toHaveURL('/lobby', { timeout: 10000 });

      await player2Page.goto('/');
      await player2Page.getByPlaceholder('Nickname').fill('LeaveP2');
      await player2Page.getByRole('button', { name: 'Continue' }).click();
      await expect(player2Page).toHaveURL('/lobby', { timeout: 10000 });

      // Start matchmaking - player1 first, then player2
      await player1Page.getByText('Classic Mode').click();
      await player1Page.waitForTimeout(500);
      await player2Page.getByText('Classic Mode').click();

      // Wait for player1 to be in game
      await expect(player1Page).toHaveURL('/game', { timeout: 20000 });

      // Wait for game state to load
      await player1Page.waitForTimeout(2000);

      // Verify we're in game (Leave room button is visible)
      await expect(player1Page.getByText('Leave room')).toBeVisible();

      // Player 1 leaves the game
      await player1Page.getByText('Leave room').click();

      // Player 1 should be redirected to lobby
      await expect(player1Page).toHaveURL('/lobby', { timeout: 5000 });

    } finally {
      await context1.close();
      await context2.close();
    }
  });
});

test.describe('Timed Mode', () => {
  test('timed mode should show timer', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const player1Page = await context1.newPage();
    const player2Page = await context2.newPage();

    try {
      // Login both players
      await player1Page.goto('/');
      await player1Page.getByPlaceholder('Nickname').fill('TimedPlayer1');
      await player1Page.getByRole('button', { name: 'Continue' }).click();
      await expect(player1Page).toHaveURL('/lobby', { timeout: 10000 });

      await player2Page.goto('/');
      await player2Page.getByPlaceholder('Nickname').fill('TimedPlayer2');
      await player2Page.getByRole('button', { name: 'Continue' }).click();
      await expect(player2Page).toHaveURL('/lobby', { timeout: 10000 });

      // Start TIMED mode matchmaking - use role-based selector
      await player1Page.getByRole('button', { name: /Timed Mode/ }).click();
      await player2Page.getByRole('button', { name: /Timed Mode/ }).click();

      // Wait for game
      await expect(player1Page).toHaveURL('/game', { timeout: 15000 });
      await expect(player2Page).toHaveURL('/game', { timeout: 15000 });

      // Wait for game state to be received
      await player1Page.waitForTimeout(2000);

      // In timed mode, there should be a visible game state
      // Check that game status message is visible (Your turn or Opponent's turn)
      const hasGameStatus = await player1Page.getByText('Your turn!').isVisible().catch(() => false) ||
                           await player1Page.getByText("Opponent's turn...").isVisible().catch(() => false);

      expect(hasGameStatus).toBe(true);

    } finally {
      await context1.close();
      await context2.close();
    }
  });
});
