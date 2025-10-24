function convertTemp() {
  // 讀入使用者輸入
  var input = prompt("請輸入溫度與單位（例如：30C 或 86F）：");

  if (!input) return; // 若按取消則結束

  // 取得數值與單位
  var value = parseFloat(input);
  var unit = input.trim().slice(-1).toUpperCase();

  var resultText = "";

  if (unit === "C") {
    // 攝氏轉華氏
    var f = value * 9 / 5 + 32;
    resultText = `${value}°C = ${f.toFixed(2)}°F`;
  } else if (unit === "F") {
    // 華氏轉攝氏
    var c = (value - 32) * 5 / 9;
    resultText = `${value}°F = ${c.toFixed(2)}°C`;
  } else {
    resultText = "請輸入正確格式（例如：30C 或 86F）";
  }

  alert(resultText);
  document.getElementById("result").textContent = resultText;
}

