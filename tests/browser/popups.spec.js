import { test, expect } from '@playwright/test';

test('original profile and Fitur popups stay on screen after scrolling and open working actions', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/signup.html');
  await page.locator('#fullname').fill('Popup Learner');
  await page.locator('#email').fill(`popup-${Date.now()}-${Math.random()}@example.com`);
  await page.locator('#password').fill('my original password 2026');
  await page.locator('[type=submit]').click();
  await expect(page).toHaveURL(/landing-page\.html$/);
  await page.locator('.cardlist .card2').first().locator('[onclick]').click();
  const profile = page.locator('#popup-1 > .content');
  await expect(profile).toBeVisible();
  const bounds = await profile.boundingBox(),
    viewport = page.viewportSize();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
  await page.locator('#popup-1 [onclick*=milih]').click();
  await expect(page).toHaveURL(/pesan-kelas-milih\.html\?tutor=anita$/);
  await expect(page.locator('.form-select')).toHaveValue('SMA');
  await expect(page.locator('.form-lesson')).toHaveValue('Matematika');
  await page.goto('/landing-page.html');
  await page.locator('#fitur').click();
  const features = page.locator('#popupFitur > .content11');
  await expect(features).toBeVisible();
  const box = await features.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  await page.locator('#popupFitur [role=button]').filter({ hasText: 'Robot Tutor' }).click();
  await expect(page.locator('#serviceTitle')).toHaveText('Robot Tutor');
  expect(errors).toEqual([]);
});
