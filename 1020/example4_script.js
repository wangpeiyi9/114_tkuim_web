// example4_script.js
// 判斷輸入數字是否為奇數或偶數

var input = prompt('請輸入一個整數：');
var n = parseInt(input, 10);
var msg = '';


if (isNaN(n)) {
  msg = '輸入不是有效的整數！';
} else if (n % 2 === 0) {
  msg = n + ' 是偶數';
} else {
  msg = n + ' 是奇數';
}

// 額外示範 switch（1、2、3 對應文字）
var choice = prompt('輸入 1/2/3 試試 switch：');
switch (choice) {
  case '1':
    msg += '\n你輸入了 1';
    break;
  case '2':
    msg += '\n你輸入了 2';
    break;
  case '3':
    msg += '\n你輸入了 3';
    break;
  default:
    msg += '\n非 1/2/3';
}

var point = prompt('請輸入分數：');
var n1 = parseInt(point, 10);
var msg1 = '';

if (isNaN(n1)) {
  msg += '輸入不是有效的整數！';
} else if (n1>=90) {
  msg += '\n你的等級是A';
} else if (n1>=80) {
  msg += '\n你的等級是B';
}else if (n1>=70) {
  msg += '\n你的等級是C';
}else if (n1>=60) {
  msg += '\n你的等級是D';
}else {
  msg += '\n你的等級是F';
}


document.getElementById('result').textContent = msg;
