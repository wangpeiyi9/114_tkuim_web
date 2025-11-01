// 取得 DOM 元素
const form = document.getElementById("signup-form");
const inputs = form.querySelectorAll("input[required]");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");
const interestContainer = document.getElementById("interest-container");

// === Helper: 顯示錯誤訊息 ===
function showError(input, msg) {
  const errMsg = document.getElementById(input.id + "Error");
  input.setCustomValidity(msg);
  errMsg.textContent = msg;
}

// === Helper: 清除錯誤 ===
function clearError(input) {
  const errMsg = document.getElementById(input.id + "Error");
  input.setCustomValidity("");
  errMsg.textContent = "";
}

// === 密碼強度分析 ===
function checkPasswordStrength(pwd) {
  let strength = 0;
  if (/[a-z]/.test(pwd)) strength++;
  if (/[A-Z]/.test(pwd)) strength++;
  if (/\d/.test(pwd)) strength++;
  if (/[^A-Za-z0-9]/.test(pwd)) strength++;
  if (pwd.length >= 12) strength++;

  const levels = ["弱", "中", "強", "非常強"];
  const colors = ["#dc3545", "#ffc107", "#198754", "#0d6efd"];
  const index = Math.min(strength - 1, 3);

  if (pwd.length === 0) {
    strengthBar.style.width = "0";
    strengthText.textContent = "";
    return;
  }

  strengthBar.style.width = (strength * 20) + "%";
  strengthBar.style.backgroundColor = colors[index];
  strengthText.textContent = "密碼強度：" + levels[index];
}

// === 儲存欄位到 localStorage ===
function saveToStorage() {
  const data = {};
  inputs.forEach(i => {
    if (i.type === "checkbox") return;
    data[i.id] = i.value;
  });
  localStorage.setItem("signupData", JSON.stringify(data));
}

// === 恢復欄位資料 ===
function restoreFromStorage() {
  const data = JSON.parse(localStorage.getItem("signupData") || "{}");
  Object.keys(data).forEach(key => {
    const el = document.getElementById(key);
    if (el) el.value = data[key];
  });
}

// === 各欄位驗證 ===
function validateInput(input) {
  const value = input.value.trim();

  switch (input.id) {
    case "name":
      if (!value) showError(input, "姓名為必填欄位");
      else clearError(input);
      break;

    case "email":
      if (!value) showError(input, "Email 為必填欄位");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        showError(input, "Email 格式不正確");
      else clearError(input);
      break;

    case "phone":
      if (!/^\d{10}$/.test(value)) showError(input, "手機需為10碼數字");
      else clearError(input);
      break;

    case "password":
      if (value.length < 8) showError(input, "密碼至少需8碼");
      else if (!/[A-Za-z]/.test(value) || !/\d/.test(value))
        showError(input, "密碼需包含英文字母與數字");
      else clearError(input);
      checkPasswordStrength(value);
      break;

    case "confirm":
      const pwd = document.getElementById("password").value;
      if (value !== pwd) showError(input, "兩次密碼不一致");
      else clearError(input);
      break;

    case "terms":
      if (!input.checked) showError(input, "請同意服務條款");
      else clearError(input);
      break;
  }
}

// === blur / input 即時驗證 ===
inputs.forEach(input => {
  input.addEventListener("blur", () => validateInput(input));
  input.addEventListener("input", () => {
    validateInput(input);
    saveToStorage();
  });
});

// === 興趣標籤事件委派 ===
interestContainer.addEventListener("change", () => {
  const checked = interestContainer.querySelectorAll("input:checked").length;
  const interestError = document.getElementById("interestError");
  if (checked === 0) interestError.textContent = "請至少勾選一項興趣";
  else interestError.textContent = "";
});

// === 表單送出事件 ===
form.addEventListener("submit", e => {
  e.preventDefault();

  let firstInvalid = null;
  inputs.forEach(input => {
    validateInput(input);
    if (!input.checkValidity() && !firstInvalid) firstInvalid = input;
  });

  const checkedInterests = interestContainer.querySelectorAll("input:checked").length;
  const terms = document.getElementById("terms");

  if (checkedInterests === 0) {
    document.getElementById("interestError").textContent = "請至少勾選一項興趣";
    if (!firstInvalid) firstInvalid = interestContainer.querySelector("input");
  }

  if (!terms.checked) {
    showError(terms, "請勾選服務條款");
    if (!firstInvalid) firstInvalid = terms;
  }

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  // === 模擬送出 ===
  submitBtn.disabled = true;
  submitBtn.textContent = "Loading...";
  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "送出";
    document.getElementById("successMsg").classList.remove("d-none");
    localStorage.removeItem("signupData");
    form.reset();
    strengthBar.style.width = "0";
    strengthText.textContent = "";
  }, 1000);
});

// === 重設功能 ===
resetBtn.addEventListener("click", () => {
  form.reset();
  inputs.forEach(clearError);
  document.getElementById("interestError").textContent = "";
  document.getElementById("successMsg").classList.add("d-none");
  strengthBar.style.width = "0";
  strengthText.textContent = "";
  localStorage.removeItem("signupData");
});

// === 初始化 ===
restoreFromStorage();
