// example8_script.js
// 宣告一個學生物件，包含屬性與方法

var student = {
  name: '小明',
  id: 'A123456789',
  scores: [85, 90, 78],
  getAverage: function() {
    var sum = 0;
    for (var i = 0; i < this.scores.length; i++) {
      sum += this.scores[i];
    }
    return sum / this.scores.length;
  },
  info: function() {
    return '姓名：' + this.name + '\n學號：' + this.id;
  }
};
function getGrade() {
  var g = 'F';
  if (student.getAverage().toFixed(2) >= 90) {
    g = 'A';
  } else if (student.getAverage().toFixed(2) >= 80) {
    g = 'B';
  } else if (student.getAverage().toFixed(2) >= 70) {
    g = 'C';
  } else if (student.getAverage().toFixed(2) >= 60) {
    g = 'D';
  } else {
    g = 'F';
  }
  return g;
}
var text = student.info() + '\n平均：' + student.getAverage().toFixed(2) + "\n等第：" + getGrade();
document.getElementById('result').textContent = text;
