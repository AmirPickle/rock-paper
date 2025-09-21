let playerName = "";

function enterGame() {
  const nameInput = document.getElementById("player-name");
  if (!nameInput.value) return alert("نام را وارد کنید");
  playerName = nameInput.value;
  db.ref("players/" + playerName).set({ choice: null, score: 0 });
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
}

function play(choice) {
  db.ref("players/" + playerName).update({ choice: choice });

  db.ref("players").once("value", snapshot => {
    const players = snapshot.val();
    const names = Object.keys(players);
    if (names.length < 2) {
      document.getElementById("result").innerText = "منتظر بازیکن دوم...";
      return;
    }

    const [p1, p2] = names;
    const c1 = players[p1].choice;
    const c2 = players[p2].choice;

    if (!c1 || !c2) {
      document.getElementById("result").innerText = "منتظر انتخاب هر دو بازیکن...";
      return;
    }

    let winner = null;
    if (c1 === c2) {
      result = "مساوی شد!";
    } else if (
      (c1 === "سنگ" && c2 === "قیچی") ||
      (c1 === "کاغذ" && c2 === "سنگ") ||
      (c1 === "قیچی" && c2 === "کاغذ")
    ) {
      result = `${p1} برد!`;
      winner = p1;
    } else {
      result = `${p2} برد!`;
      winner = p2;
    }

    document.getElementById("result").innerText = `${p1}: ${c1} | ${p2}: ${c2} → ${result}`;

    if (winner) {
      db.ref("players/" + winner).once("value", snap => {
        const score = snap.val().score || 0;
        db.ref("players/" + winner).update({ score: score + 1 });
      });
    }

    updateScores();
  });
}

function updateScores() {
  db.ref("players").once("value", snapshot => {
    const players = snapshot.val();
    let scoreText = "امتیازها:\n";
    for (let name in players) {
      scoreText += `${name}: ${players[name].score || 0}\n`;
    }
    document.getElementById("score").innerText = scoreText;
  });
}

function resetGame() {
  db.ref("players").once("value", snapshot => {
    const players = snapshot.val();
    for (let name in players) {
      db.ref("players/" + name).update({ choice: null });
    }
    document.getElementById("result").innerText = "";
  });
}
