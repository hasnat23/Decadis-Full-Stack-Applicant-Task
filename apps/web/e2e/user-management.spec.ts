import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3001';

test.describe('User Management E2E', () => {
  test('full CRUD flow: create, view, edit, run action, delete', async ({ page, request }) => {
    // Clean up any leftover test users from prior runs
    const allUsers = await (await request.get(`${API_URL}/user`)).json();
    for (const u of allUsers) {
      if (u.email?.includes('e2e-')) {
        await request.delete(`${API_URL}/user/${u.id}`);
      }
    }

    const uniqueEmail = `e2e-${Date.now()}@example.com`;

    // Navigate to users list
    await page.goto('/users');
    await expect(page.getByText(/User Management/)).toBeVisible();

    // Should show empty state initially or existing users
    // Navigate to create user
    await page.click('text=+ New User');
    await expect(page).toHaveURL('/users/new');
    await expect(page.getByText('Create New User')).toBeVisible();

    // Fill in the form
    await page.fill('input[id="firstName"]', 'Alice');
    await page.fill('input[id="lastName"]', 'Wonderland');
    await page.fill('input[id="email"]', uniqueEmail);
    await page.check('text=Create Item');
    await page.check('text=View Item');

    // Submit
    await page.click('button:has-text("Create User")');

    // Should navigate to user detail
    await page.waitForURL(/\/users\/.+/);
    await expect(page.getByRole('heading', { name: 'Alice Wonderland' })).toBeVisible();
    await expect(page.getByText('create-item').first()).toBeVisible();
    await expect(page.getByText('view-item').first()).toBeVisible();

    // Run an allowed action
    await page.click('button:has-text("create-item")');
    await expect(page.getByText(/executed successfully/)).toBeVisible();

    // Run a disallowed action
    await page.click('button:has-text("delete-item")');
    await expect(page.getByText(/not allowed/)).toBeVisible();

    // Navigate to edit
    await page.click('text=Edit');
    await page.waitForURL(/\/edit$/);

    // Change the last name
    const lastNameInput = page.locator('input[id="lastName"]');
    await lastNameInput.clear();
    await lastNameInput.fill('Updated');
    await page.click('button:has-text("Update User")');

    // Should navigate back to detail
    await page.waitForURL(/\/users\/.+/);
    await expect(page.getByRole('heading', { name: 'Alice Updated' })).toBeVisible();

    // Go back to list
    await page.click('text=All Users');
    await page.waitForURL('/users');
    await expect(page.getByText('Alice Updated').first()).toBeVisible();

    // Delete the user
    page.once('dialog', (dialog) => dialog.accept());
    // Click the Delete button in the table row for Alice
    const row = page.locator('tr', { hasText: 'Alice Updated' }).first();
    await row.getByText('Delete').click();

    // Verify the user is gone from the table
    await expect(page.locator('tr', { hasText: 'Alice Updated' })).toHaveCount(0);
  });
});
