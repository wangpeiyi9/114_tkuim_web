// example2_script.js
// 變數宣告與基本型態操作

var text = '123';              // 字串
var num = 45;                  // 數字
var isPass = true;             // 布林
var emptyValue = null;         // 空值
var notAssigned;               // undefined（尚未指定）
var one = prompt("請輸入數字1","");
var two = prompt("請輸入數字2","");

// 型態檢查
var lines = '';
lines += 'text = ' + text + '，typeof: ' + (typeof text) + '\n';
lines += 'num = ' + num + '，typeof: ' + (typeof num) + '\n';
lines += 'isPass = ' + isPass + '，typeof: ' + (typeof isPass) + '\n';
lines += 'emptyValue = ' + emptyValue + '，typeof: ' + (typeof emptyValue) + '\n';
lines += 'notAssigned = ' + notAssigned + '，typeof: ' + (typeof notAssigned) + '\n';

lines += 'one = ' + one + '，typeof: ' + (typeof text) + '\n';
lines += 'two = ' + two + '，typeof: ' + (typeof text) + '\n\n';

// 轉型
var textToNumber = parseInt(text, 10); // 將 '123' → 123
lines += 'parseInt(\'123\') = ' + textToNumber + '\n';
lines += 'String(45) = ' + String(num) + '\n\n';

var n1 = parseInt(one, 10); // 將 '123' → 123
var n2 = parseInt(two, 10); // 將 '123' → 123
lines += 'parseInt(one, 10) = ' + n1 + '\n';
lines += 'parseInt(two, 10) = ' + n2 + '\n';
lines += '兩數相加 = ' + (n1 + n2) + '\n';



document.getElementById('result').textContent = lines;
