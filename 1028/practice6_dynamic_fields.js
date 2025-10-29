// practice6_dynamic_fields.js
// 動態新增報名欄位、事件委派、即時驗證、條款確認、送出攔截與 UX 強化

const form = document.getElementById('dynamic-form');
const list = document.getElementById('participant-list');
const addBtn = document.getElementById('add-participant');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const countLabel = document.getElementById('count');
const agreeCheckbox = document.getElementById('agree');
const privacyModalEl = document.getElementById('privacyModal');
const privacyModal = new bootstrap.Modal(privacyModalEl);
const confirmPrivacyBtn = document.getElementById('confirm-privacy');

const maxParticipants = 5;
let participantIndex = 0;
// 當使用者在 modal 按確認後允許這次勾選
let allowCheckPrivacy = false;

/* -------------------------
   建立參與者卡片 HTML
   ------------------------- */
function createParticipantCard() {
  const index = participantIndex++;
  const wrapper = document.createElement('div');
  wrapper.className = 'participant card border-0 shadow-sm';
  wrapper.dataset.index = index;

  wrapper.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <h5 class="card-title mb-0">參與者 <span class="participant-no">${index + 1}</span></h5>
        <button type="button" class="btn btn-sm btn-outline-danger" data-action="remove">移除</button>
      </div>
      <div class="mb-3">
        <label class="form-label" for="name-${index}">姓名</label>
        <input id="name-${index}" name="name-${index}" class="form-control" type="text" required aria-describedby="name-${index}-error">
        <p id="name-${index}-error" class="text-danger small mb-0" aria-live="polite"></p>
      </div>
      <div class="mb-0">
        <label class="form-label" for="email-${index}">Email</label>
        <input id="email-${index}" name="email-${index}" class="form-control" type="email" required aria-describedby="email-${index}-error" inputmode="email">
        <p id="email-${index}-error" class="text-danger small mb-0" aria-live="polite"></p>
      </div>
    </div>
  `;
  return wrapper;
}

/* -------------------------
   更新計數與按鈕狀態，並重編號 (避免跳號)
   ------------------------- */
function refreshParticipantNumbers() {
  const nodes = Array.from(list.querySelectorAll('.participant'));
  nodes.forEach((node, i) => {
    const no = node.querySelector('.participant-no');
    if (no) no.textContent = i + 1;
  });
}

function updateCount() {
  countLabel.textContent = list.children.length;
  addBtn.disabled = list.children.length >= maxParticipants;
  refreshParticipantNumbers();
}

/* -------------------------
   錯誤訊息與驗證函式
   ------------------------- */
function setError(input, message) {
  const errorEl = document.getElementById(`${input.id}-error`);
  input.setCustomValidity(message || '');
  if (errorEl) errorEl.textContent = message || '';
  if (message) {
    input.classList.add('is-invalid');
  } else {
    input.classList.remove('is-invalid');
  }
}

function validateInput(input) {
  // trim 之後檢查是否為空
  const value = (input.value || '').trim();
  if (!value) {
    setError(input, '此欄位必填');
    return false;
  }
  if (input.type === 'email') {
    // 基本的 email 正則（不追求 100% 覆蓋）
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      setError(input, 'Email 格式不正確');
      return false;
    }
  }
  setError(input, '');
  return true;
}

/* -------------------------
   新增參與者（按鈕事件）
   ------------------------- */
addBtn.addEventListener('click', () => {
  if (list.children.length >= maxParticipants) return;
  const card = createParticipantCard();
  list.appendChild(card);
  updateCount();
  // 聚焦到新卡片的第一個 input
  const firstInput = card.querySelector('input');
  if (firstInput) firstInput.focus();
});

/* -------------------------
   事件委派：移除按鈕（click）
   ------------------------- */
list.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('[data-action="remove"]');
  if (!removeBtn) return;
  const participant = removeBtn.closest('.participant');
  if (!participant) return;

  // 可選：加上移除確認
  // if (!confirm('確定要移除此參與者嗎？')) return;

  participant.remove();
  updateCount();

  // 移除後將焦點放回新增按鈕（或其他合理位置）
  addBtn.focus();
});

/* -------------------------
   事件委派：即時驗證（blur 與 input）
   - blur 使用 capture=true 以便捕捉各 input 的失焦事件
   ------------------------- */
list.addEventListener('blur', (e) => {
  const target = e.target;
  if (!target || !target.matches('input')) return;
  validateInput(target);
}, true);

list.addEventListener('input', (e) => {
  const target = e.target;
  if (!target || !target.matches('input')) return;
  // 只有當 input 先前有錯誤訊息時才即時驗證以減少運算
  if (target.validationMessage) {
    validateInput(target);
  }
});

/* -------------------------
   隱私條款：使用 change 事件處理勾選行為
   - 當使用者嘗試勾選 (checked === true) 且尚未 allowCheckPrivacy，
     我們把 checkbox 改回 unchecked，並顯示 modal。
   - 在 modal 按下確認後才把 checkbox 設為 checked 且 allowCheckPrivacy = true
   ------------------------- */
agreeCheckbox.addEventListener('change', (e) => {
  // 若使用者剛剛嘗試把 checkbox 變為 checked
  if (agreeCheckbox.checked && !allowCheckPrivacy) {
    // 取消這次變更（回復為 unchecked），然後顯示 modal
    agreeCheckbox.checked = false;
    privacyModal.show();
  } else {
    // 若是取消勾選或已允許，移除錯誤狀態
    if (!agreeCheckbox.checked) {
      agreeCheckbox.classList.remove('is-invalid');
    }
  }
});

// modal 的確認按鈕：允許勾選並設定為已勾選
confirmPrivacyBtn.addEventListener('click', () => {
  allowCheckPrivacy = true;
  agreeCheckbox.checked = true;
  agreeCheckbox.classList.remove('is-invalid');
  // modal 關閉後，保留 allowCheckPrivacy 直到 reset 或送出後重置
});

/* -------------------------
   表單送出：整體驗證 + 防重送
   ------------------------- */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // 若沒有任何參與者 (UX：自動新增 1 位，並提示)
  if (list.children.length === 0) {
    alert('請至少新增一位參與者');
    addBtn.click();
    return;
  }

  // 驗證所有動態欄位，並記錄第一個錯誤欄位以便聚焦
  let firstInvalid = null;
  const inputs = Array.from(list.querySelectorAll('input'));
  for (const input of inputs) {
    const ok = validateInput(input);
    if (!ok && !firstInvalid) {
      firstInvalid = input;
    }
  }

  // 若有欄位錯誤 → 聚焦第一個錯誤並中止送出
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  // 確認使用者是否勾選條款
  if (!agreeCheckbox.checked) {
    // 若還未勾選，聚焦並顯示錯誤樣式
    agreeCheckbox.classList.add('is-invalid');
    agreeCheckbox.focus();
    return;
  } else {
    agreeCheckbox.classList.remove('is-invalid');
  }

  // 禁用送出按鈕避免重複送出
  submitBtn.disabled = true;
  submitBtn.textContent = '送出中...';

  try {
    // 模擬非同步送出（可改為 fetch）
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 成功行為
    alert('表單已成功送出！');

    // 重置表單與動態區域
    form.reset();
    list.innerHTML = '';
    participantIndex = 0;
    allowCheckPrivacy = false; // 取消條款允許標記，避免下一次未確認即勾選
    updateCount();
  } catch (err) {
    console.error(err);
    alert('送出失敗，請稍後再試。');
  } finally {
    // 恢復按鈕
    submitBtn.disabled = false;
    submitBtn.textContent = '送出';
  }
});

/* -------------------------
   重設按鈕：清空所有並重置狀態
   ------------------------- */
resetBtn.addEventListener('click', () => {
  form.reset();
  list.innerHTML = '';
  participantIndex = 0;
  allowCheckPrivacy = false;
  // 移除可能的錯誤樣式
  Array.from(form.querySelectorAll('.is-invalid')).forEach((el) => el.classList.remove('is-invalid'));
  updateCount();
});

/* -------------------------
   初始化：預設產生一筆
   ------------------------- */
(function init() {
  const p = createParticipantCard();
  list.appendChild(p);
  updateCount();
})();
