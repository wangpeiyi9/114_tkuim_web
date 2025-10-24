// example5_script.js
// 以巢狀 for 產生 1~9 的乘法表

var output = '';
for (var i = 1; i <= 9; i++) {
  for (var j = 1; j <= 9; j++) {
    output += i + 'x' + j + '=' + (i * j) + '\t';
  }
  output += '\n';
}
output += '\n';
var input1 = prompt('請輸入要顯示的乘法範圍（從?開始）：');
var input2 = prompt('請輸入要顯示的乘法範圍（到?結束）：');
var n1 = parseInt(input1, 10);
var n2 = parseInt(input2, 10);

for (var i = n1; i <= n2; i++) {
  for (var j = 1; j <= 9; j++) {
    output += i + 'x' + j + '=' + (i * j) + '\t';
  }
  output += '\n';
}
document.getElementById('result').textContent = output;
