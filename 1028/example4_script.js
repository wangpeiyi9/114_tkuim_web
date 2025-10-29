// example4_script.js
// 功能：攔截 submit、手動驗證欄位、防止重送、錯誤聚焦、送出後 reset

// 取得表單與按鈕
const form = document.getElementById('access-form');
const submitBtn = document.getElementById('submit-btn');

// 建立欄位設定（方便批次操作）
const fields = [
  { input: document.getElementById('name'), error: document.getElementById('name-error') },
  { input: document.getElementById('age'), error: document.getElementById('age-error') }
];

/**
 * 驗證單一欄位
 * - 根據欄位的 validity 狀態，設定對應的錯誤訊息
 * - 同步更新 aria-live 區域（error <p> 內文）
 * - 回傳布林值：true 表示通過驗證
 */
function validateField(field) {
  const { input, error } = field;
  let message = '';

  // 檢查是否為必填空白
  if (input.validity.valueMissing) {
    message = '此欄位為必填。';
  }
  // 檢查數值範圍
  else if (input.validity.rangeUnderflow || input.validity.rangeOverflow) {
    message = `請輸入 ${input.min} 到 ${input.max} 之間的數字。`;
  }

  // 將訊息套用到欄位與畫面
  input.setCustomValidity(message); // 原生表單驗證機制
  error.textContent = message;      // 給助讀器用 aria-live 提示
  return !message;                  // 無錯誤 → 通過驗證
}

/**
 * 即時驗證行為設定：
 * - input事件：使用者輸入時若先前有錯誤會即時檢查
 * - blur事件：離開欄位時檢查（避免沒操作過就出現錯誤）
 */
fields.forEach((field) => {
  field.input.addEventListener('input', () => {
    if (field.input.validationMessage) {
      validateField(field);
    }
  });
  field.input.addEventListener('blur', () => {
    validateField(field);
  });
});

/**
 * 攔截表單送出事件：
 * - 阻止預設行為（不讓瀏覽器自己送出）
 * - 依序驗證每個欄位
 * - 若有錯誤則聚焦第一個欄位
 * - 若通過 → 模擬送出並防止重複點擊
 */
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // 阻止瀏覽器自動送出

  let firstInvalid = null;

  // 清空舊錯誤訊息（避免殘留）
  fields.forEach(({ error }) => (error.textContent = ''));

  // 依序驗證欄位，記錄第一個錯誤
  fields.forEach((field) => {
    const isValid = validateField(field);
    if (!isValid && !firstInvalid) {
      firstInvalid = field.input;
    }
  });

  // 若有錯誤 → 聚焦到第一個錯誤欄位
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  // 防止重送：按鈕設為 disabled 並改文字
  submitBtn.disabled = true;
  submitBtn.textContent = '送出中...';

  try {
    // 模擬與後端連線（此處可替換成 fetch）
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // 成功提示
    alert('表單送出成功！');

    // 重置表單與清除錯誤
    form.reset();
    fields.forEach(({ error }) => (error.textContent = ''));
  } catch (err) {
    alert('送出失敗，請稍後再試。');
  } finally {
    // 恢復按鈕狀態
    submitBtn.disabled = false;
    submitBtn.textContent = '送出';
  }
});
