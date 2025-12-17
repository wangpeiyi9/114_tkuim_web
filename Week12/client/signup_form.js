// Week12/client/signup_form.js

const form = document.querySelector('#signup-form');
const btn = document.querySelector('#submit-btn');
const resultEl = document.querySelector('#result');

function loading(b) {
  btn.disabled = b;
  btn.textContent = b ? '送出中...' : '送出';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  loading(true);

  const token = localStorage.getItem('token');
  if (!token) {
    resultEl.textContent = '尚未登入，請先登入。';
    loading(false);
    return;
  }

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const res = await fetch('http://localhost:3001/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || '建立資料失敗');

    resultEl.textContent = `新增成功：${JSON.stringify(data, null, 2)}`;
    form.reset();
  } catch (err) {
    resultEl.textContent = '錯誤：' + err.message;
    if (err.message.includes('401')) {
      localStorage.removeItem('token');
    }
  } finally {
    loading(false);
  }
});
