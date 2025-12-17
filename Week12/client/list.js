// Week12/client/list.js

const listEl = document.querySelector('#list');
const logoutBtn = document.querySelector('#logout-btn');

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href = 'login.html';
});

async function loadList() {
  const token = localStorage.getItem('token');

  if (!token) {
    listEl.textContent = '尚未登入，請先登入。';
    return;
  }

  try {
    const res = await fetch('/api/signup', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || '載入失敗');

    const items = data.data;

    let output = '';

    items.forEach((item) => {
      output += `
ID: ${item._id}
姓名: ${item.name}
Email: ${item.email}
Phone: ${item.phone}
建立者(ownerId): ${item.ownerId}
----

      `;
    });

    listEl.textContent = output || '目前沒有任何資料';
  } catch (err) {
    listEl.textContent = '錯誤：' + err.message;
  }
}

loadList();
