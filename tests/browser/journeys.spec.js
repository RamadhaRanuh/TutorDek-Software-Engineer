import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const original = 'TutorDek Software Engineer/TutorDek-Final-Project-main';
const pages = [
  'landing-page',
  'signup',
  'sign-in',
  'paket-belajar',
  'e-book',
  'promo',
  'testimoni',
  'pesan-kelas-milih',
  'pesan-kelas-random',
  'tes-map',
];
const runtimeErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  runtimeErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page)).toEqual([]);
});
async function signup(page) {
  const email = `learner-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
  await page.goto('/signup.html');
  await page.locator('#fullname').fill('TutorDek Learner');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill('my original password 2026');
  await page.locator('[type=submit]').click();
  await expect(page).toHaveURL(/landing-page\.html$/);
  return email;
}
async function feature(page, id) {
  await page.locator('#' + id).click();
  await page.getByRole('button', { name: 'Lihat detail fitur' }).click();
  await expect(page.locator('#servicePopup')).toHaveClass(/active/);
}
async function futureDate(page, offset) {
  const cat = await (await page.request.get('/api/catalogue')).json();
  const date = new Date(cat.today + 'T12:00:00+07:00');
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}
async function book(page, automatic, offline, offset) {
  await page.goto(automatic ? '/pesan-kelas-random.html' : '/pesan-kelas-milih.html');
  const next = page.getByRole('button', { name: 'Langkah berikutnya' });
  await expect(next).toBeEnabled();
  await page.locator('.form-select').selectOption('SMP');
  await page.locator('[for=btnradio7]').click();
  await next.click();
  await page.locator('.form-lesson').selectOption('Inggris');
  await page.locator('.form-material').selectOption('english');
  await next.click();
  if (automatic) await expect(page.locator('#map')).toContainText('jadwal');
  else {
    await expect(page.locator('.card-main').first()).toContainText('Fransiska Putri');
    await page.locator('#tutor-fransiska').check();
  }
  await next.click();
  await page.locator('.form-place').selectOption(offline ? 'Offline' : 'Online');
  if (offline) await page.locator('.form-alamat').fill('Jalan Belajar nomor 42, Jakarta');
  await page.locator('.form-date').fill(await futureDate(page, offset));
  await page.locator('.form-time').fill('09:00');
  await next.click();
  await expect(page.locator('#selectedDetail')).toContainText('09:00 WIB');
  await expect(page.locator('#selectedPlace')).toContainText(offline ? 'Offline' : 'Online');
  await page.locator('#bookingPromo').fill('BELAJAR20');
  await expect(page.locator('#selectedPrice')).toContainText('56.000');
  await page.locator('.dropdown-toggle').click();
  await page.getByText('Gopay', { exact: true }).click();
  await page.locator('.selesai').click();
  await expect(page.locator('#servicePopup')).toContainText('Pemesanan tersimpan');
  await expect(page.locator('#servicePopup')).toContainText('Tidak ada uang yang ditagih');
  await page.getByRole('button', { name: 'Lihat sesi saya' }).click();
  await expect(page.locator('#serviceTitle')).toHaveText('Progress Tracking & Sesi Saya');
}

for (const name of pages) {
  test(`original ${name} loads without missing assets or clipped page width`, async ({
    page,
  }, info) => {
    const errors = [],
      failed = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) failed.push(response.url());
    });
    await page.goto('/' + name + '.html');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(page.viewportSize().width + 1);
    expect(
      await page.evaluate(() =>
        [...document.images]
          .filter((n) => !n.complete || !n.naturalWidth)
          .map((n) => n.getAttribute('src')),
      ),
    ).toEqual([]);
    expect(
      await page.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map((n) => n.id);
        return ids.filter((id, index) => ids.indexOf(id) !== index);
      }),
    ).toEqual([]);
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
    fs.mkdirSync('artifacts/original', { recursive: true });
    await page.screenshot({
      path: `artifacts/original/${name}-${info.project.name}.png`,
      fullPage: true,
    });
  });
}

test('root keeps original hero, art, cards and desktop composition', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.locator('.desktop-default .hero-section')).toBeVisible();
  await expect(page.locator('.hero-section')).toContainText('Tingkatin Nilaimu');
  await expect(page.locator('.image-icon7')).toHaveAttribute('src', './public/image6@2x.png');
  await expect(page.locator('.cardlist .card2')).toHaveCount(8);
  expect(
    await page
      .locator('link[rel=stylesheet]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('href'))),
  ).toContain('./CSS/tugas-akhir.css');
  if (info.project.name === 'desktop') {
    const hero = await page.locator('.hero-section').boundingBox();
    expect(hero).toMatchObject({ x: 0, y: 96, width: 1440, height: 622 });
    expect((await page.locator('.pesan-guru-section').boundingBox()).y).toBe(718);
    expect((await page.locator('.promo-section').boundingBox()).y).toBe(1496);
  }
});

test('original signup, password toggle, logout and login persist the account', async ({ page }) => {
  const email = await signup(page);
  await expect(page.locator('.button48')).toHaveText('Akun Saya');
  await page.locator('.button48').click();
  await expect(page.locator('#servicePopup')).toContainText('Progress Tracking');
  await page.getByRole('button', { name: 'Keluar akun' }).click();
  await expect(page.locator('.button48')).toHaveText('Masuk');
  await page.goto('/sign-in.html');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill('wrong password');
  await page.locator('[type=submit]').click();
  await expect(page.locator('.service-status')).toContainText('Email atau kata sandi');
  await page.locator('#password').fill('my original password 2026');
  await page.getByRole('button', { name: 'Tampilkan password' }).click();
  await expect(page.locator('#password')).toHaveAttribute('type', 'text');
  await page.locator('[type=submit]').click();
  await expect(page).toHaveURL(/landing-page\.html$/);
  await page.reload();
  await expect(page.locator('.button48')).toHaveText('Akun Saya');
});

test('original manual offline booking saves notes and cancellation', async ({ page }, info) => {
  await signup(page);
  await book(page, false, true, info.project.name === 'desktop' ? 12 : 13);
  await expect(page.locator('#servicePopup')).toContainText('Fransiska Putri');
  await expect(page.locator('#servicePopup')).toContainText('Jalan Belajar');
  await page.locator('[data-booking] > label textarea').fill('Tolong bahas simple present.');
  await page.getByRole('button', { name: 'Simpan catatan' }).click();
  await expect(page.locator('#servicePopup .service-status')).toContainText('Catatan tersimpan');
  await page.reload();
  await page.evaluate(() => TutorDek.openFeature('progresstracking'));
  await expect(page.locator('[data-booking] > label textarea')).toHaveValue(
    'Tolong bahas simple present.',
  );
  await page.getByRole('button', { name: 'Batalkan sesi' }).click();
  await expect(page.locator('[data-booking]')).toContainText('cancelled');
});

test('original automatic online flow chooses an available compatible tutor', async ({
  page,
}, info) => {
  await signup(page);
  await book(page, true, false, info.project.name === 'desktop' ? 16 : 17);
  const data = await (await page.request.get('/api/dashboard')).json();
  expect(data.bookings).toHaveLength(1);
  expect(data.bookings[0]).toMatchObject({
    level: 'SMP',
    grade: 7,
    subject: 'Inggris',
    mode: 'Online',
    status: 'confirmed',
    total: 56000,
  });
});

test('step validation clears old grades and requires offline schedule', async ({ page }) => {
  await page.goto('/pesan-kelas-milih.html');
  const next = page.getByRole('button', { name: 'Langkah berikutnya' });
  await expect(next).toBeEnabled();
  await next.click();
  await expect(page.locator('.page').first()).toBeVisible();
  await expect(page.locator('.service-status')).toContainText('Lengkapi pilihan');
  await page.locator('.form-select').selectOption('SMA');
  await page.locator('[for=btnradio10]').click();
  await page.locator('.form-select').selectOption('SMP');
  await next.click();
  await expect(page.locator('.page').first()).toBeVisible();
  await page.locator('[for=btnradio7]').click();
  await next.click();
  await page.locator('.form-lesson').selectOption('Inggris');
  await page.locator('.form-material').selectOption('english');
  await next.click();
  await page.locator('#tutor-fransiska').check();
  await next.click();
  await page.locator('.form-place').selectOption('Offline');
  await page.locator('.form-alamat').fill('Jalan Panjang 123 Jakarta');
  await next.click();
  await expect(page.locator('.page').nth(3)).toBeVisible();
  await expect(page.locator('.form-date')).toBeVisible();
});

test('original FAQ, carousels, profile popup and search work by keyboard', async ({ page }) => {
  await page.goto('/');
  const faq = page.locator('.faq-accordian-item-wrap1').first();
  await faq.focus();
  await page.keyboard.press('Enter');
  await expect(faq).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#faq1')).toContainText('10 karakter');
  await page.keyboard.press('Enter');
  await expect(faq).toHaveAttribute('aria-expanded', 'false');
  const list = page.locator('.cardlist');
  await page.getByRole('button', { name: 'Tutor berikutnya', exact: true }).click();
  await expect.poll(() => list.evaluate((n) => n.scrollLeft)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Tutor sebelumnya', exact: true }).click();
  await expect.poll(() => list.evaluate((n) => n.scrollLeft)).toBe(0);
  const profile = page.locator('.cardlist .card2').first().locator('[onclick]');
  await profile.click();
  await expect(page.locator('#popup-1')).toHaveClass(/active/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#popup-1')).not.toHaveClass(/active/);
  await page.locator('.hero-section input[type=search]').fill('Pythagoras');
  await page.locator('.hero-section input[type=search]').press('Enter');
  await expect(page.locator('#servicePopup')).toContainText('Mengenal teorema Pythagoras');
});

test('original package prices and categories open a saved sample collection', async ({ page }) => {
  await signup(page);
  await page.goto('/paket-belajar.html');
  await expect(page.locator('.rp-1200000').first()).toHaveText('Rp 1.200.000');
  await page.locator('.button-parent31').click();
  await expect(page.locator('.button-parent33')).toBeVisible();
  await expect(page.locator('.button-parent37')).toBeHidden();
  await page.locator('.button-parent29').click();
  await page.locator('.more-detail').first().click();
  await expect(page.locator('#servicePopup')).toContainText('Live Class Reguler UTBK');
  await expect(page.locator('#servicePopup')).toContainText('Langganan berbayar belum tersedia');
  await page.getByRole('button', { name: 'Simpan koleksi demo' }).click();
  await expect(page.locator('.service-status')).toContainText('tersimpan');
  await expect
    .poll(async () => (await (await page.request.get('/api/dashboard')).json()).enrollments)
    .toEqual(['utbk-reguler']);
});

test('original feature controls read lessons, complete them, grade exercises and retain progress', async ({
  page,
}) => {
  await signup(page);
  await feature(page, 'videosoal');
  await page.locator('#servicePopup #bilangan').click();
  await expect(page.locator('#servicePopup')).toContainText('Kenali garis bilangan');
  await page.getByRole('button', { name: 'Tandai selesai' }).click();
  await expect(page.locator('.service-status')).toContainText('kemajuan tersimpan');
  await page.getByRole('button', { name: 'Latihan soal' }).click();
  await page.locator('[name="bilangan:0"][value="1"]').check();
  await page.locator('[name="bilangan:1"][value="3"]').check();
  await page.getByRole('button', { name: 'Periksa jawaban' }).click();
  await expect(page.locator('.quiz-feedback')).toContainText('Nilai 100%');
  await page.keyboard.press('Escape');
  await feature(page, 'progresstracking');
  await expect(page.locator('#servicePopup')).toContainText('1 materi selesai');
  await page.locator('[name=target]').fill('5');
  await page.getByRole('button', { name: 'Simpan target' }).click();
  await expect(page.locator('.service-status')).toContainText('Target tersimpan');
  await page.keyboard.press('Escape');
  await feature(page, 'brainboost');
  await expect(page.locator('#serviceTitle')).toHaveText('BrainBoost');
});

test('original forum and Robot Tutor controls persist real activity without rendering submitted HTML', async ({
  page,
}) => {
  await signup(page);
  await feature(page, 'forumdiscussion');
  const title = 'Pertanyaan aljabar ' + Date.now();
  await page.locator('[name=title]').fill(title);
  await page
    .locator('[name=body]')
    .fill('Bagaimana menghitung x pada x + 2 = 5? <img src=x onerror=alert(1)>');
  await page.getByRole('button', { name: 'Kirim diskusi' }).click();
  const card = page.locator('.service-card').filter({ hasText: title });
  await card.getByRole('button', { name: 'Buka diskusi' }).click();
  await expect(page.locator('#servicePopup')).toContainText('<img src=x');
  await expect(page.locator('#servicePopup img')).toHaveCount(0);
  await page.locator('textarea[name=body]').fill('Kurangi kedua ruas dengan dua.');
  await page.getByRole('button', { name: 'Kirim balasan' }).click();
  await expect(page.locator('#servicePopup')).toContainText('Kurangi kedua ruas dengan dua.');
  await page.keyboard.press('Escape');
  await feature(page, 'robottutor');
  await page.locator('[name=question]').fill('Bagaimana menghitung Pythagoras?');
  await page.getByRole('button', { name: 'Cari penjelasan' }).click();
  await expect(page.locator('#servicePopup')).toContainText('Sumber: Mengenal teorema Pythagoras');
});

test('original promo and ebook actions expose available material and honest service limits', async ({
  page,
}) => {
  await page.goto('/promo.html');
  await page.locator('.button79').click();
  await expect(page.locator('#servicePopup')).toContainText('BELAJAR20');
  await page.getByRole('button', { name: 'Gunakan promo' }).click();
  await expect(page.locator('.service-status')).toContainText('checkout');
  await page.goto('/e-book.html');
  await page.locator('.button118').click();
  await expect(page.locator('#servicePopup')).toContainText('Materi contoh orisinal');
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'Pratinjau materi Matematika', exact: true })
    .first()
    .click();
  await expect(page.locator('#servicePopup')).toContainText('Aljabar');
  await page.goto('/sign-in.html');
  await page.locator('.google').click();
  await expect(page.locator('#servicePopup')).toContainText('belum dikonfigurasi');
});

test('repaired original forms and learning dialog meet critical and serious accessibility checks', async ({
  page,
}) => {
  await page.goto('/signup.html');
  let result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(result.violations.filter((v) => ['critical', 'serious'].includes(v.impact))).toEqual([]);
  await signup(page);
  await feature(page, 'videosoal');
  result = await new AxeBuilder({ page })
    .include('#servicePopup')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(result.violations.filter((v) => ['critical', 'serious'].includes(v.impact))).toEqual([]);
});

test('learning dialog restores focus, traps Tab, downloads material and saves outgoing tutor messages', async ({
  page,
}) => {
  await signup(page);
  await feature(page, 'videosoal');
  await page.locator('#servicePopup #bilangan').click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Unduh materi' }).click();
  expect((await download).suggestedFilename()).toBe('tutordek-bilangan.txt');
  await page.locator('#servicePopup .close-btn').focus();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Unduh materi' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#servicePopup .close-btn')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Lihat detail fitur' })).toBeFocused();
  await feature(page, 'livetutor');
  await page.locator('select[name=tutorId]').selectOption('fransiska');
  await page.locator('textarea[name=body]').fill('Tolong jelaskan kata kerja simple present.');
  await page.getByRole('button', { name: 'Simpan pesan' }).click();
  await expect(page.locator('.service-card')).toContainText(
    'Tolong jelaskan kata kerja simple present.',
  );
  await page.reload();
  await feature(page, 'livetutor');
  await expect(page.locator('.service-card')).toContainText(
    'Tolong jelaskan kata kerja simple present.',
  );
  await expect(page.locator('#servicePopup')).toContainText(
    'Balasan tutor dan panggilan video belum terhubung',
  );
});

test('guest booking choices survive signup and resume with a fresh schedule check', async ({
  page,
}) => {
  await page.goto('/pesan-kelas-milih.html');
  const next = page.getByRole('button', { name: 'Langkah berikutnya' });
  await expect(next).toBeEnabled();
  await page.locator('.form-select').selectOption('SMP');
  await page.locator('[for=btnradio7]').click();
  await next.click();
  await page.locator('.form-lesson').selectOption('Inggris');
  await page.locator('.form-material').selectOption('english');
  await next.click();
  await page.locator('#tutor-fransiska').check();
  await next.click();
  await page.locator('.form-place').selectOption('Online');
  await page.locator('.form-date').fill(await futureDate(page, 20));
  await page.locator('.form-time').fill('09:00');
  await next.click();
  await expect(page.locator('#selectedDetail')).toContainText('09:00');
  await page.locator('.dropdown-toggle').click();
  await page.getByText('Gopay', { exact: true }).click();
  await page.locator('.selesai').click();
  await expect(page.locator('#serviceTitle')).toHaveText('Masuk untuk melanjutkan');
  await page.getByRole('link', { name: 'Daftar', exact: true }).click();
  await page.locator('#fullname').fill('Returning Guest');
  await page.locator('#email').fill(`guest-${Date.now()}-${Math.random()}@example.com`);
  await page.locator('#password').fill('guest account password');
  await page.locator('[type=submit]').click();
  await expect(page).toHaveURL(/pesan-kelas-milih\.html$/);
  await expect(page.locator('.page').nth(3)).toBeVisible();
  await expect(page.locator('.form-time')).toHaveValue('09:00');
  await expect(page.locator('.page').nth(3)).toContainText('dipulihkan');
  await next.click();
  await expect(page.locator('#selectedTeacher')).toContainText('Fransiska Putri');
});

test('narrow layouts and reduced motion keep original navigation and feature controls reachable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of ['landing-page', 'paket-belajar', 'e-book', 'promo', 'testimoni']) {
      await page.goto('/' + name + '.html');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width + 1,
      );
      const menus = page.locator('[role=navigation] [role=button]');
      for (const menu of await menus.all()) {
        const box = await menu.boundingBox();
        if (box) {
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
        }
      }
    }
  }
});
