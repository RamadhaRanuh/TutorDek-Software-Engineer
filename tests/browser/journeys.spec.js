import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

let count = 0;
async function signup(page) {
  const email = `learner-${Date.now()}-${count++}@example.com`;
  await page.goto('/#/signup');
  await page.getByLabel('Nama lengkap').fill('Rama Learner');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Kata sandi', { exact: true }).fill('Belajar nyaman 123!');
  await page.getByRole('button', { name: 'Buat akun', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Halo, Rama.' })).toBeVisible();
  return email;
}
async function day(page, offset = 1) {
  const response = await page.request.get('/api/catalogue');
  const catalogue = await response.json();
  const date = new Date(catalogue.today + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}
async function needs(page, level = 'SMA', grade = '10', subject = 'Matematika', topic = 'aljabar') {
  await page.getByLabel('Jenjang', { exact: true }).selectOption(level);
  await page.getByLabel('Kelas', { exact: true }).selectOption(grade);
  await page.getByLabel('Mata pelajaran', { exact: true }).selectOption(subject);
  await page.getByLabel('Materi', { exact: true }).selectOption(topic);
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
}
async function pay(page) {
  await page.getByRole('button', { name: 'Checkout simulasi', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Tutup', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Konfirmasi pembayaran demo' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Checkout simulasi', exact: true }).click();
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.getByLabel('Metode simulasi').selectOption('Demo bank');
  await page.getByRole('button', { name: 'Konfirmasi pembayaran demo' }).click();
  await expect(
    page.locator('.booking-card').getByText('Terkonfirmasi', { exact: true }),
  ).toBeVisible();
}
test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.url().includes('/assets/') || response.url().includes('/web/'))
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  page.__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect(page.__errors).toEqual([]);
});

test('account validation, password visibility, logout and real login', async ({ page }) => {
  const email = await signup(page);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Halo, Rama.' })).toBeVisible();
  await page.getByRole('button', { name: 'Keluar', exact: true }).click();
  await page.goto('/#/login');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Kata sandi', { exact: true }).fill('wrong password');
  await page.getByRole('button', { name: 'Tampilkan', exact: true }).click();
  await expect(page.locator('#password')).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Email atau kata sandi salah.');
  await page.getByLabel('Kata sandi', { exact: true }).fill('Belajar nyaman 123!');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Halo, Rama.' })).toBeVisible();
});

test('tutor discovery, manual booking, promo, payment, session workspace and cancellation', async ({
  page,
}, info) => {
  await signup(page);
  await page.goto('/#/tutors');
  await page.getByLabel('Mata pelajaran', { exact: true }).selectOption('Matematika');
  await page.getByLabel('Jenjang', { exact: true }).selectOption('SMA');
  await expect(page.locator('.tutor-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'Lihat profil', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Anita Frens Hatipuan', exact: true }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Pesan sesi', exact: true }).click();
  await needs(page);
  await page.getByLabel('Tutor', { exact: true }).selectOption('anita');
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  const date = await day(page, info.project.name === 'mobile' ? 31 : 1);
  await page.getByLabel('Tanggal sesi').fill(date);
  await page.getByLabel('Waktu mulai (WIB)').selectOption('9');
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  await page.getByRole('button', { name: 'Sebelumnya' }).click();
  await expect(page.getByLabel('Tanggal sesi')).toHaveValue(date);
  await expect(page.getByLabel('Waktu mulai (WIB)')).toHaveValue('9');
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  await page.getByLabel('Kode promo (opsional)').fill('INVALID');
  await page.getByRole('button', { name: 'Simpan pemesanan' }).click();
  await expect(page.getByRole('alert')).toHaveText('Kode promo tidak ditemukan.');
  await page.getByLabel('Kode promo (opsional)').fill('BELAJAR20');
  await page.getByRole('button', { name: 'Simpan pemesanan' }).click();
  await expect(page.locator('.booking-card')).toContainText('68.000');
  await pay(page);
  await page.getByRole('link', { name: 'Buka ruang sesi' }).click();
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.getByLabel('Catatan pribadi').fill('Ingat: jaga keseimbangan kedua ruas.');
  await page.getByRole('button', { name: 'Simpan catatan' }).click();
  await expect(page.getByRole('status')).toContainText('Catatan disimpan.');
  await page.reload();
  await expect(page.getByLabel('Catatan pribadi')).toHaveValue(
    'Ingat: jaga keseimbangan kedua ruas.',
  );
  const canvas = page.locator('canvas'),
    bounds = await canvas.boundingBox();
  await page.mouse.move(bounds.x + 30, bounds.y + 30);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 100, bounds.y + 80);
  await page.mouse.up();
  const pngPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Unduh PNG' }).click();
  expect((await pngPromise).suggestedFilename()).toBe('tutordek-papan-tulis.png');
  await page.goto('/#/dashboard');
  await page.getByRole('button', { name: 'Batalkan', exact: true }).click();
  await page.getByRole('button', { name: 'Pertahankan' }).click();
  await expect(page.locator('.booking-card')).toContainText('Terkonfirmasi');
  await page.getByRole('button', { name: 'Batalkan', exact: true }).click();
  await page.getByRole('button', { name: 'Ya, batalkan' }).click();
  await expect(page.locator('.booking-card')).toContainText('Dibatalkan');
});

test('automatic offline matching and school selection resets stale grades', async ({
  page,
}, info) => {
  await signup(page);
  await page.goto('/#/book/auto');
  await page.getByLabel('Jenjang', { exact: true }).selectOption('SD');
  await page.getByLabel('Kelas', { exact: true }).selectOption('3');
  await page.getByLabel('Jenjang', { exact: true }).selectOption('SMA');
  await expect(page.getByLabel('Kelas', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Kelas', { exact: true }).locator('option')).toHaveCount(4);
  await page.getByLabel('Kelas', { exact: true }).selectOption('11');
  await page.getByLabel('Mata pelajaran', { exact: true }).selectOption('Fisika');
  await page.getByLabel('Materi', { exact: true }).selectOption('gerak');
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  await page.getByLabel('Metode', { exact: true }).selectOption('Offline');
  await page.getByLabel('Tutor', { exact: true }).selectOption('auto');
  await page.getByLabel('Alamat pertemuan').fill('Jalan Pendidikan 10, Jakarta');
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  await page
    .getByLabel('Tanggal sesi')
    .fill(await day(page, info.project.name === 'mobile' ? 32 : 2));
  await page.getByLabel('Waktu mulai (WIB)').selectOption('14');
  await page.getByRole('button', { name: 'Lanjutkan' }).click();
  await expect(page.locator('#booking-form')).toContainText('Otomatis: Ditto Nugroho');
  await page.getByRole('button', { name: 'Simpan pemesanan' }).click();
  await expect(page.locator('.booking-card')).toContainText('Ditto Nugroho');
  await expect(page.locator('.booking-card')).toContainText('Jalan Pendidikan 10, Jakarta');
});

test('lesson reading, ebook export, quiz scoring, goals and package enrollment persist', async ({
  page,
}) => {
  await signup(page);
  await page.goto('/#/library');
  await page.getByLabel('Cari materi').fill('aljabar');
  await expect(page.locator('.lesson-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'Buka materi', exact: true }).click();
  const ebookPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Unduh e-book' }).click();
  expect((await ebookPromise).suggestedFilename()).toBe('TutorDek-aljabar.html');
  await page.getByRole('button', { name: 'Tandai selesai', exact: true }).click();
  await expect(page.getByRole('button', { name: '✓ Materi selesai' })).toBeDisabled();
  await page.getByRole('link', { name: 'Latihan materi' }).click();
  await page.locator('[name="aljabar:0"][value="1"]').check();
  await page.locator('[name="aljabar:1"][value="2"]').check();
  await page.getByRole('button', { name: 'Periksa jawaban' }).click();
  await expect(page.locator('.score-card')).toContainText('100 / 100');
  await page.getByRole('link', { name: 'Lihat progres', exact: true }).click();
  await expect(page.locator('table')).toContainText('100/100');
  await page.getByLabel('Target jumlah materi').fill('5');
  await page.getByRole('button', { name: 'Simpan target' }).click();
  await expect(page.getByLabel('Target jumlah materi')).toHaveValue('5');
  await page.goto('/#/packages');
  await page.locator('[data-enroll="smp"]').click();
  await page.reload();
  await expect(page.locator('[data-enroll="smp"]')).toBeDisabled();
  await page.goto('/#/progress');
  await expect(page.getByRole('heading', { name: 'Siap Belajar SMP', exact: true })).toBeVisible();
});

test('forum replies, grounded assistant and outgoing messages safely render content', async ({
  page,
}) => {
  await signup(page);
  await page.goto('/#/forum');
  const marker = `Belajar aljabar ${Date.now()}`;
  await page.getByLabel('Judul pertanyaan').fill(marker);
  await page.locator('#post-form').getByLabel('Mata pelajaran').selectOption('Matematika');
  await page
    .getByLabel('Detail pertanyaan')
    .fill('<img src=x onerror="window.hacked=true"> Bagaimana menjaga keseimbangan?');
  await page.getByRole('button', { name: 'Buka diskusi' }).click();
  await expect(page.getByRole('heading', { name: marker })).toBeVisible();
  await expect(page.locator('#main')).toContainText('<img src=x');
  expect(await page.evaluate(() => window.hacked)).toBeUndefined();
  await page.getByLabel('Balasanmu').fill('Kurangi kedua ruas dengan bilangan yang sama.');
  await page.getByRole('button', { name: 'Kirim balasan' }).click();
  await expect(page.locator('.reply-card')).toContainText('Kurangi kedua ruas');
  await page.reload();
  await expect(page.locator('.reply-card')).toHaveCount(1);
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.goto('/#/assistant');
  await page.getByLabel('Pertanyaanmu').fill('Jelaskan teorema Pythagoras');
  await page.getByRole('button', { name: 'Cari penjelasan' }).click();
  await expect(page.locator('.chat-answer')).toContainText('a² + b² = c²');
  await expect(page.locator('.chat-answer a')).toHaveAttribute('href', '#/lesson/pythagoras');
  await page.reload();
  await expect(page.locator('.assistant-entry')).toHaveCount(1);
  await page.goto('/#/messages/anita');
  await page.getByLabel('Pesan', { exact: true }).fill('Saya ingin membahas persamaan linear.');
  await page.getByRole('button', { name: 'Simpan pesan keluar' }).click();
  await page.reload();
  await expect(page.locator('.message-card')).toContainText('persamaan linear');
});

test('all public pages, legacy routes, FAQ and mobile navigation work', async ({ page }, info) => {
  if (info.project.name === 'mobile') await page.setViewportSize({ width: 320, height: 844 });
  for (const route of [
    '/',
    '/tutors',
    '/tutor/anita',
    '/library',
    '/lesson/aljabar',
    '/packages',
    '/practice',
    '/quiz/tryout',
    '/forum',
    '/reviews',
    '/promos',
    '/signup',
    '/login',
    '/missing',
  ]) {
    await page.goto('/#' + route);
    await expect(page.locator('#main h1:visible,#main h2:visible').first()).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      route,
    ).toBe(true);
  }
  await page.goto('/TutorDek%20Software%20Engineer/TutorDek-Final-Project-main/e-book.html');
  await expect(page).toHaveURL(/#\/library$/);
  await page.goto('/#/');
  await page.getByText('Bagaimana cara memesan tutor?', { exact: true }).click();
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
  if (info.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Buka menu' }).click();
    await expect(page.getByRole('button', { name: 'Tutup menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await page.locator('#nav-links').getByRole('link', { name: 'Cari tutor' }).click();
    await expect(page.getByRole('heading', { name: 'Tutor yang pas untukmu.' })).toBeVisible();
  }
  await page.goto('/#/dashboard');
  await expect(page).toHaveURL(/#\/login$/);
});

test('accessibility, responsive layouts, keyboard dialog and reduced motion', async ({
  page,
}, info) => {
  await signup(page);
  const routes = [
    '/',
    '/tutors',
    '/tutor/anita',
    '/book/anita',
    '/dashboard',
    '/library',
    '/lesson/aljabar',
    '/packages',
    '/practice',
    '/quiz/aljabar',
    '/progress',
    '/assistant',
    '/messages',
    '/forum',
    '/reviews',
    '/promos',
    '/login',
    '/signup',
  ];
  await fs.mkdir('artifacts', { recursive: true });
  for (const route of routes) {
    await page.goto('/#' + route);
    await expect(page.locator('#main h1').first()).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
      route,
    ).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      route,
    ).toBe(true);
    if (['/', '/book/anita', '/library', '/dashboard'].includes(route))
      await page.screenshot({
        path: `artifacts/${route === '/' ? 'home' : route.split('/')[1]}-${info.project.name}.png`,
        fullPage: true,
        animations: 'disabled',
      });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/');
  expect(
    await page
      .locator('.float-card')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  await page.reload();
  await expect(page.locator('#main h1')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
});
