function startGame() {
  const answer = Math.floor(Math.random() * 100) + 1; // 1～100 隨機數
  var guess;
  var count = 0;

  while (true) {
    guess = prompt("請猜 1～100 之間的數字：");
    if (guess === null) return; // 使用者按取消
    guess = Number(guess);
    count++;

    if (guess > answer) {
      alert("再小一點！");
    } else if (guess < answer) {
      alert("再大一點！");
    } else if (guess === answer) {
      alert(`恭喜猜中！你總共猜了 ${count} 次！`);
      document.getElementById("result").textContent = 
        `答案是 ${answer}，共猜了 ${count} 次。`;
      break;
    } else {
      alert("請輸入有效數字！");
    }
  }
}
