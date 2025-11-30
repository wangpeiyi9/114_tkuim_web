const form = document.querySelector('#signup-form');
const submitBtn = document.querySelector('#submit-btn');
const resultEl = document.querySelector('#result');

const API_BASE = 'http://localhost:3001/api/signup';

// Loading 開關
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? '送出中...' : '送出';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setLoading(true);

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '送出失敗');

    resultEl.textContent = JSON.stringify(data, null, 2);
    form.reset();
  } catch (err) {
    resultEl.textContent = `錯誤：${err.message}`;
  } finally {
    setLoading(false);
  }
});
