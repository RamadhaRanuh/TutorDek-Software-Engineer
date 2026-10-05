import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import AxeBuilder from '@axe-core/playwright';

async function textCollisions(locator) {
  return locator.evaluate((node) => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT),
      text = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (
        !n.textContent.trim() ||
        !n.parentElement.checkVisibility() ||
        n.parentElement.closest('.visually-hidden')
      )
        continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects())
        if (r.width && r.height) text.push({ text: n.textContent.trim(), r, node: n });
    }
    const collisions = [];
    for (let i = 0; i < text.length; i++)
      for (let j = i + 1; j < text.length; j++) {
        const a = text[i],
          b = text[j];
        if (a.node === b.node) continue;
        if (
          Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left) > 2 &&
          Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top) > 2
        )
          collisions.push([a.text, b.text]);
      }
    return collisions;
  });
}

test('promo hero portrait stays inside the page on phones', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/promo.html');
  const portrait = page.locator('.button-parent8 .button47');
  await expect(portrait).toBeVisible();
  expect(await portrait.evaluate((n) => getComputedStyle(n).backgroundImage)).toContain(
    'button@3x.png',
  );
  const box = await portrait.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  const frame = await page.locator('.button-parent8').boundingBox();
  expect(box.y + box.height).toBeLessThanOrEqual(frame.y + frame.height);
});

test('ebook audio rows have no overlapping text', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/e-book.html');
  const overlaps = await page.locator('.group-parent23').evaluate((node) => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const text = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (!n.textContent.trim() || !n.parentElement.checkVisibility()) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects())
        if (r.width && r.height) text.push({ text: n.textContent.trim(), r });
    }
    const collisions = [];
    for (let i = 0; i < text.length; i++)
      for (let j = i + 1; j < text.length; j++) {
        const a = text[i],
          b = text[j];
        if (
          Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left) > 2 &&
          Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top) > 2
        )
          collisions.push([a.text, b.text]);
      }
    return collisions;
  });
  expect(overlaps).toEqual([]);
});

test('all original testimonial stories remain readable on phones', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/testimoni.html');
  await expect(page.locator('.sebelum-pakai-tutordek').first()).toBeVisible();
  await expect(page.locator('.story-card')).toHaveCount(6);
  for (const card of await page.locator('.story-card').all()) {
    await expect(card.locator('.story-text')).toBeVisible();
    await expect(card.locator('.story-person h3')).toBeVisible();
    expect(await textCollisions(card)).toEqual([]);
  }
});

for (const width of [320, 768, 1024, 1440]) {
  test(`catalogue layouts keep text, cards and sections readable at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 960 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const name of ['paket-belajar', 'e-book', 'promo', 'testimoni']) {
      await page.goto(`/${name}.html`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      const sections = await page
        .locator('.page-layout > .page-hero, .page-layout > .page-section')
        .all();
      let bottom = 0;
      for (const section of sections) {
        const box = await section.boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width + 0.1);
        expect(box.y).toBeGreaterThanOrEqual(bottom - 0.1);
        expect(await textCollisions(section)).toEqual([]);
        bottom = box.y + box.height;
      }
      const footer = await page.locator('.page-layout > [class^=footer]').boundingBox();
      expect(footer.y).toBeGreaterThanOrEqual(bottom - 0.1);
      const top = await page.getByRole('button', { name: 'Kembali ke atas' }).boundingBox();
      expect(top.width).toBeLessThanOrEqual(56);
      fs.mkdirSync('artifacts/ui-fixes', { recursive: true });
      await page.screenshot({
        path: `artifacts/ui-fixes/${name}-${width}-${info.project.name}.png`,
        fullPage: true,
      });
    }
    expect(errors).toEqual([]);
  });
}

test('package filters match their advertised categories and every card opens its own detail', async ({
  page,
}) => {
  await page.goto('/paket-belajar.html');
  await page.getByRole('button', { name: 'Live Class', exact: true }).click();
  await expect(page.locator('.package-card:visible')).toHaveCount(2);
  await expect(page.locator('.package-card:visible').first()).toContainText(
    'Live Class Reguler UTBK',
  );
  await page.getByRole('button', { name: 'Siap UTBK + Tryout', exact: true }).click();
  await expect(page.locator('.package-card:visible')).toHaveCount(4);
  await page.getByRole('button', { name: 'Siap Belajar', exact: true }).click();
  await expect(page.locator('.package-card:visible')).toHaveCount(2);
  await page.getByRole('button', { name: 'Semua', exact: true }).click();
  for (const card of await page.locator('.package-card').all()) {
    const name = await card.locator('h3').innerText();
    await card.locator('.more-detail').click();
    await expect(page.locator('#serviceTitle')).toHaveText(name);
    await page.keyboard.press('Escape');
  }
});

test('automatic booking shows useful step guidance, tutor previews and selectable advertised times', async ({
  page,
}, info) => {
  await page.goto('/pesan-kelas-random.html');
  await expect(page.locator('#bookingStepCounter')).toHaveText('Langkah 1 dari 5');
  await page.locator('.form-select').selectOption('SMP');
  await page.locator('[for=btnradio7]').click();
  await page.getByRole('button', { name: 'Langkah berikutnya' }).click();
  await expect(page.locator('.booking-steps [aria-current=step]')).toContainText('Pelajaran');
  await page.locator('.form-lesson').selectOption('Inggris');
  await page.locator('.form-material').selectOption('english');
  await page.getByRole('button', { name: 'Langkah berikutnya' }).click();
  const catalogue = await (await page.request.get('/api/catalogue')).json();
  const matching = catalogue.tutors.filter(
    (t) => t.subject === 'Inggris' && t.levels.includes('SMP'),
  );
  await expect(page.locator('.match-card')).toHaveCount(matching.length);
  await expect(page.locator('.match-card').first()).toContainText('Fransiska Putri');
  await expect(page.locator('.match-card img').first()).toBeVisible();
  await page.screenshot({
    path: `artifacts/ui-fixes/automatic-tutors-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Langkah berikutnya' }).click();
  await page.locator('.form-place').selectOption('Online');
  const date = new Date(catalogue.today + 'T12:00:00+07:00');
  date.setUTCDate(date.getUTCDate() + 2);
  await page.locator('.form-date').fill(date.toISOString().slice(0, 10));
  await page.getByRole('button', { name: '09:00', exact: true }).click();
  await expect(page.locator('.form-time')).toHaveValue('09:00');
  await expect(page.getByRole('button', { name: '09:00', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('.form-date')).toHaveAttribute('max', /^\d{4}-\d{2}-\d{2}$/);
  expect(await textCollisions(page.locator('.booking-shell'))).toEqual([]);
  await page.screenshot({
    path: `artifacts/ui-fixes/automatic-schedule-${info.project.name}.png`,
    fullPage: true,
  });
});

test('tutor carousel animates only while visible and can be paused with working keyboard navigation', async ({
  page,
}) => {
  await page.goto('/');
  const list = page.locator('.cardlist');
  await list.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect.poll(() => list.evaluate((n) => n.scrollLeft), { timeout: 7500 }).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Jeda animasi guru' }).click();
  await expect(page.getByRole('button', { name: 'Lanjutkan animasi guru' })).toBeVisible();
  await page.evaluate(() => document.activeElement.blur());
  await page.mouse.move(0, 0);
  const firstStop = await list.evaluate((n) =>
    Math.min(n.scrollWidth - n.clientWidth, n.children[1].offsetLeft - n.children[0].offsetLeft),
  );
  await expect
    .poll(() => list.evaluate((n, target) => Math.abs(n.scrollLeft - target), firstStop))
    .toBeLessThan(2);
  await expect.poll(() => list.evaluate((n) => n.scrollLeft)).toBeGreaterThan(0);
  const stopped = await list.evaluate((n) => n.scrollLeft);
  await page.waitForTimeout(5500); // Cross the real autoplay interval after moving focus/hover away.
  expect(await list.evaluate((n) => n.scrollLeft)).toBe(stopped);
  await list.focus();
  await page.keyboard.press('End');
  await expect
    .poll(() => list.evaluate((n) => Math.abs(n.scrollLeft - (n.scrollWidth - n.clientWidth))))
    .toBeLessThan(2);
  await page.keyboard.press('Home');
  await expect.poll(() => list.evaluate((n) => n.scrollLeft)).toBe(0);
  await page.getByRole('button', { name: 'Halaman guru 2', exact: true }).click();
  await expect.poll(() => list.evaluate((n) => n.scrollLeft)).toBeGreaterThan(0);
  await expect(page.getByRole('button', { name: 'Halaman guru 2', exact: true })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.carousel-pause')).toBeHidden();
  await list.focus();
  await page.keyboard.press('Home');
  await expect.poll(() => list.evaluate((n) => n.scrollLeft)).toBe(0);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => list.evaluate((n) => n.scrollLeft)).toBeGreaterThan(0);
});

test('repaired ebook samples, promo cards and testimonial controls open the correct actions', async ({
  page,
}) => {
  await page.goto('/e-book.html');
  const titles = ['Bilangan bulat', 'Perbandingan', 'Teorema Pythagoras', 'Koordinat Kartesius'];
  for (const [i, row] of (await page.locator('.audio-row').all()).entries()) {
    await row.locator('.buy-now').click();
    await expect(page.locator('#serviceTitle')).toContainText(titles[i], { ignoreCase: true });
    await page.keyboard.press('Escape');
  }
  await page.getByRole('button', { name: 'Buka kategori materi' }).nth(2).click();
  await expect(page.locator('#servicePopup')).toContainText('SMP');
  await page.goto('/promo.html');
  for (const button of await page.locator('.offer-claim').all()) {
    await button.click();
    await expect(page.locator('#servicePopup')).toHaveAttribute('aria-hidden', 'false');
    await expect(page.locator('#servicePopup [role="dialog"]')).toBeVisible();
    await expect(page.locator('#servicePopup')).toContainText('BELAJAR20');
    await page.keyboard.press('Escape');
    await expect(page.locator('#servicePopup')).toHaveAttribute('aria-hidden', 'true');
  }
  await page.goto('/testimoni.html');
  await page.locator('.button34').click();
  await expect(page.locator('#serviceTitle')).toHaveText('Ulasan siswa');
  await page.keyboard.press('Escape');
  await page.locator('.story-video-button').click();
  await expect(page.locator('#servicePopup')).toContainText('Video testimoni belum tersedia');
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'Start Explore More' }).click();
  await expect(page).toHaveURL(/paket-belajar\.html$/);
});

test('repaired catalogue content and automatic form have no serious accessibility violations', async ({
  page,
}) => {
  for (const name of ['paket-belajar', 'e-book', 'promo', 'testimoni', 'pesan-kelas-random']) {
    await page.goto(`/${name}.html`);
    const selector = name === 'pesan-kelas-random' ? '.booking-shell' : '.page-hero, .page-section';
    const results = await new AxeBuilder({ page })
      .include(selector)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations.filter((v) => ['critical', 'serious'].includes(v.impact))).toEqual(
      [],
    );
  }
});
