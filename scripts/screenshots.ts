/**
 * Screenshot capture script for README documentation.
 * Run with: npx tsx scripts/screenshots.ts
 * Requires both dev servers to be running.
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3001';
const OUT_DIR = path.join(process.cwd(), 'docs', 'screenshots');

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await ctx.newPage();

  // ── Seed: clean + create sample users ─────────────────────────────────────
  console.log('Seeding sample data…');
  const existing: { id: string; email: string }[] = await fetch(`${API_URL}/users`).then((r) =>
    r.json(),
  );
  for (const u of existing) {
    if (u.email.includes('screenshot-')) {
      await fetch(`${API_URL}/users/${u.id}`, { method: 'DELETE' });
    }
  }

  const _alice = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'screenshot-alice@example.com',
      actions: ['create-item', 'view-item'],
    }),
  }).then((r) => r.json());

  await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Bob',
      lastName: 'Martinez',
      email: 'screenshot-bob@example.com',
      actions: ['view-item', 'move-item'],
    }),
  });

  await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Carol',
      lastName: 'Smith',
      email: 'screenshot-carol@example.com',
      actions: ['create-item', 'delete-item', 'view-item', 'move-item'],
    }),
  });

  // ── 1. Users list ──────────────────────────────────────────────────────────
  console.log('1/7  Users list…');
  await page.goto(`${BASE_URL}/users`);
  await page.waitForSelector('table');
  await page.screenshot({ path: `${OUT_DIR}/01-users-list.png`, fullPage: false });

  // ── 2. Empty state ─────────────────────────────────────────────────────────
  console.log('2/7  Empty state…');
  const allUsers: { id: string }[] = await fetch(`${API_URL}/users`).then((r) => r.json());
  for (const u of allUsers) await fetch(`${API_URL}/users/${u.id}`, { method: 'DELETE' });
  await page.reload();
  await page.waitForSelector('text=No users yet');
  await page.screenshot({ path: `${OUT_DIR}/02-empty-state.png`, fullPage: false });

  // Re-seed
  const alice2 = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'screenshot-alice@example.com',
      actions: ['create-item', 'view-item'],
    }),
  }).then((r) => r.json());
  await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Bob',
      lastName: 'Martinez',
      email: 'screenshot-bob@example.com',
      actions: ['view-item', 'move-item'],
    }),
  });
  await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Carol',
      lastName: 'Smith',
      email: 'screenshot-carol@example.com',
      actions: ['create-item', 'delete-item', 'view-item', 'move-item'],
    }),
  });

  // ── 3. Create user form ────────────────────────────────────────────────────
  console.log('3/7  Create user form…');
  await page.goto(`${BASE_URL}/users/new`);
  await page.waitForSelector('input[id="firstName"]');
  await page.fill('input[id="firstName"]', 'David');
  await page.fill('input[id="lastName"]', 'Kim');
  await page.fill('input[id="email"]', 'david@example.com');
  await page.check('text=Create Item');
  await page.check('text=View Item');
  await page.screenshot({ path: `${OUT_DIR}/03-create-user.png`, fullPage: false });

  // ── 4. User detail ─────────────────────────────────────────────────────────
  console.log('4/7  User detail…');
  await page.goto(`${BASE_URL}/users/${alice2.id}`);
  await page.waitForSelector('text=User Information');
  await page.screenshot({ path: `${OUT_DIR}/04-user-detail.png`, fullPage: false });

  // ── 5. Execute action – allowed ────────────────────────────────────────────
  console.log('5/7  Execute action (allowed)…');
  await page.click('button:has-text("Create Item")');
  await page.waitForSelector('text=Action Succeeded');
  await page.screenshot({ path: `${OUT_DIR}/05-action-allowed.png`, fullPage: false });

  // ── 6. Execute action – denied ─────────────────────────────────────────────
  console.log('6/7  Execute action (denied)…');
  await page.click('button:has-text("Delete Item")');
  await page.waitForSelector('text=Action Denied');
  await page.screenshot({ path: `${OUT_DIR}/06-action-denied.png`, fullPage: false });

  // ── 7. Edit user form ──────────────────────────────────────────────────────
  console.log('7/7  Edit user form…');
  await page.goto(`${BASE_URL}/users/${alice2.id}/edit`);
  await page.waitForSelector('input[id="firstName"]');
  await page.screenshot({ path: `${OUT_DIR}/07-edit-user.png`, fullPage: false });

  await browser.close();

  // Cleanup seed users
  const finalUsers: { id: string; email: string }[] = await fetch(`${API_URL}/users`).then((r) =>
    r.json(),
  );
  for (const u of finalUsers) {
    if (u.email.includes('screenshot-')) {
      await fetch(`${API_URL}/users/${u.id}`, { method: 'DELETE' });
    }
  }

  console.log(`\n✅ Screenshots saved to docs/screenshots/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
