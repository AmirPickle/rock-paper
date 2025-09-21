function play(userChoice) {
  const playerId = prompt("نام بازیکن را وارد کنید:");
  db.ref("game/" + playerId).set({
    choice: userChoice,
    time: Date.now()
  });

  db.ref("game").once("value", snapshot => {
    const data = snapshot.val();
    const players = Object.keys(data);
    if (players.length === 2) {
      const [p1, p2] = players;
      const c1 = data[p1].choice;
      const c2 = data[p2].choice;
      let result = '';

      if (c1 === c2) result = 'مساوی شد!';
      else if (
        (c1 === 'سنگ' && c2 === 'قیچی') ||
        (c1 === 'کاغذ' && c2 === 'سنگ') ||
        (c1 === 'قیچی' && c2 === 'کاغذ')
      ) result = `${p1} برد!`;
      else result = `${p2} برد!`;

      document.getElementById('result').innerText =
        `${p1}: ${c1} | ${p2}: ${c2} → ${result}`;
    } else {
      document.getElementById('result').innerText =
        `منتظر بازیکن دوم...`;
    }
  });
}
