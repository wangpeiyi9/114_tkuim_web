// example1_script.js
// 統一在父層監聽點擊與送出事件，處理清單項目新增/刪除

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

function addTodo(value) {
      const item = document.createElement('li');
      item.className = 'list-group-item d-flex justify-content-between align-items-center';
      item.innerHTML = `
        <span>${value}</span>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-success" data-action="toggle">完成</button>
          <button class="btn btn-outline-danger" data-action="remove">刪除</button>
        </div>
      `;
      list.appendChild(item);
    }

form.addEventListener('submit', (event) => {
event.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      addTodo(value);
      input.value = '';
      input.focus();
});

//監聽輸入keyup
input.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        form.requestSubmit();
      }
    });

list.addEventListener('click', (event) => {
  const action = event.target.dataset.action;
      if (!action) return;

      const item = event.target.closest('li');
      if (!item) return;

      if (action === 'remove') {
        item.remove();
      } else if (action === 'toggle') {
        item.classList.toggle('list-group-item-success');
      }
});
