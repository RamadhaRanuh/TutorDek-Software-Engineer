/* Keep the original form; validate and save accounts instead of just redirecting. */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const signup = !!document.getElementById('fullname');
  const password = document.getElementById('password');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'password-toggle';
  toggle.textContent = 'Tampilkan password';
  toggle.onclick = () => {
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    toggle.textContent = show ? 'Sembunyikan password' : 'Tampilkan password';
    toggle.setAttribute('aria-pressed', show);
  };
  password.after(toggle);
  if (signup) {
    const hint = document.createElement('p');
    hint.style.color = 'white';
    hint.textContent = 'Gunakan password minimal 10 karakter.';
    password.after(hint);
  } else {
    const link = document.createElement('p');
    link.innerHTML = 'Belum punya akun? <a href="signup.html" style="color:#8bc4ff">Daftar</a>';
    link.style.color = 'white';
    form.append(link);
  }
  TutorDek.action(
    form,
    async () => {
      const data = {
        email: document.getElementById('email').value.trim(),
        password: password.value,
      };
      if (signup) data.name = document.getElementById('fullname').value.trim();
      else data.remember = document.getElementById('rememberMe').checked;
      await TutorDek.request(signup ? 'signup' : 'login', data);
      const next = new URLSearchParams(location.search).get('next');
      const safe =
        /^\/(?:TutorDek%20Software%20Engineer\/TutorDek-Final-Project-main\/)?(?:landing-page|pesan-kelas-milih|pesan-kelas-random|paket-belajar|e-book|promo|testimoni)\.html$/.test(
          next || '',
        );
      location.href = safe ? next : 'landing-page.html';
    },
    form,
  );
  function unavailable(title, body) {
    return () => TutorDek.modal(title, `<p>${TutorDek.escape(body)}</p>`);
  }
  document.querySelector('.google').onclick = unavailable(
    'Sign in with Google',
    'Google login belum dikonfigurasi. Gunakan formulir email dan password di halaman ini.',
  );
  document
    .querySelector('.forgor')
    ?.addEventListener(
      'click',
      unavailable(
        'Pemulihan password',
        'Pengiriman email pemulihan belum dikonfigurasi. Gunakan password akunmu yang tersimpan.',
      ),
    );
});
