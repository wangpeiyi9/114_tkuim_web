// Week12/client/login.js

const form = document.querySelector('#login-form');
const resultEl = document.querySelector('#result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
  const res = await fetch('/auth/login', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || '登入失敗');
    }

    // Week12 — 儲存 Token 與 User
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    resultEl.textContent = `登入成功，歡迎：${data.user.email}`;

    // 導向到報名列表頁面
    setTimeout(() => {
      window.location.href = './list.html';
    }, 800);
  } catch (err) {
    resultEl.textContent = `錯誤：${err.message}`;
  }
});
