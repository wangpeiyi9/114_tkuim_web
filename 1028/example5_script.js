// example5_script.js
// 攔截 submit、聚焦第一個錯誤、模擬送出流程、並加入隱私條款確認視窗

const form = document.getElementById('full-form');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const agree = document.getElementById('agree');
const privacyLink = document.getElementById('privacy-link');
const privacyModal = new bootstrap.Modal(document.getElementById('privacyModal'));
const agreeConfirmBtn = document.getElementById('agreeConfirmBtn');

function validateAllInputs(formElement) {
  let firstInvalid = null;
  const controls = Array.from(formElement.querySelectorAll('input, select, textarea'));
  controls.forEach((control) => {
    control.classList.remove('is-invalid');
    if (!control.checkValidity()) {
      control.classList.add('is-invalid');
      if (!firstInvalid) {
        firstInvalid = control;
      }
    }
  });
  return firstInvalid;
}

// 攔截勾選「同意條款」
agree.addEventListener('click', (e) => {
  if (!agree.checked) {
    // 阻止直接勾選
    e.preventDefault();
    // 顯示條款內容視窗
    privacyModal.show();
  }
});

// 當使用者在 modal 中按下「我已閱讀完畢」
agreeConfirmBtn.addEventListener('click', () => {
  agree.checked = true;
});

// 攔截 submit 事件
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = '送出中...';

  const firstInvalid = validateAllInputs(form);
  if (firstInvalid) {
    submitBtn.disabled = false;
    submitBtn.textContent = '送出';
    firstInvalid.focus();
    return;
  }

  // 模擬送出
  await new Promise((resolve) => setTimeout(resolve, 1000));
  alert('資料已送出，感謝您的聯絡！');
  form.reset();

  submitBtn.disabled = false;
  submitBtn.textContent = '送出';
});

// 清除表單
resetBtn.addEventListener('click', () => {
  form.reset();
  Array.from(form.elements).forEach((element) => {
    element.classList.remove('is-invalid');
  });
});

// 即時驗證修正
form.addEventListener('input', (event) => {
  const target = event.target;
  if (target.classList.contains('is-invalid') && target.checkValidity()) {
    target.classList.remove('is-invalid');
  }
});
