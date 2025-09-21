let playerName = "";
let roomId = "";
let round = 1;

function enterGame() {
  const nameInput = document.getElementById("player-name");
  const roomInput = document.getElementById("room-id");
  if (!nameInput.value || !roomInput.value) return alert("نام و شناسه اتاق را وارد کنید");

  playerName = nameInput.value;
  roomId = roomInput.value;

  document.getElementById("player-label").innerText = `بازیکن: ${playerName}`;
  document.getElementById("room-label").innerText = `اتاق: ${roomId}`;

  db.ref(`rooms/${roomId}/players/${playerName}`).set({ choice: null, score: 0 });
  db.ref(`rooms/${roomId}/meta/round`).set(round);

  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");

  listenToRoom();
}

function play(choice) {
  db.ref(`rooms/${roomId}/players/${playerName}`).update({ choice: choice });
}

function resetGame() {
  db.ref(`rooms/${roomId}/players`).once("value", snapshot => {
    const players = snapshot.val();
    for (let name in players) {
      db.ref(`rooms/${roomId}/players/${name}/choice`).set(null);
    }
    round++;
    db.ref(`rooms/${roomId}/meta/round`).set(round);
    document.getElementById("round-num").innerText = round;
    document.getElementById("result").innerText = "";
  });
}

function leaveGame() {
  db.ref(`rooms/${roomId}/players/${playerName}`).remove();
  document.getElementById("game-screen").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
}

function listenToRoom() {
  db.ref(`rooms/${roomId}/players`).on("value", snapshot => {
    const players = snapshot.val();
    updateScores(players);
    checkResult(players);
  });

  db.ref(`rooms/${roomId}/meta/round`).on("value", snapshot => {
    round = snapshot.val() || 1;
    document.getElementById("round-num").innerText = round;
  });

  db.ref(`rooms/${roomId}/history`).on("value", snapshot => {
    const history = snapshot.val();
    updateHistory(history);
  });
}

function updateScores(players) {
  let scoreText = "امتیازها:\n";
  for (let name in players) {
    scoreText += `${name}: ${players[name].score || 0}\n`;
  }
  document.getElementById("score").innerText = scoreText;
}

function updateHistory(history) {
  if (!history) return;
  let text = "تاریخچه:\n";
  for (let r in history) {
    const h = history[r];
    text += `دور ${r}: ${h.p1} (${h.c1}) vs ${h.p2} (${h.c2}) → ${h.result}\n`;
  }
  document.getElementById("history").innerText = text;
}

function checkResult(players) {
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

  db.ref(`rooms/${roomId}/history/${round}`).once("value", snap => {
    if (snap.exists()) return;

    let result = "";
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

    db.ref(`rooms/${roomId}/history/${round}`).set({
      p1: p1,
      c1: c1,
      p2: p2,
      c2: c2,
      result: result
    });

    if (winner) {
      db.ref(`rooms/${roomId}/players/${winner}`).once("value", snap => {
        const score = snap.val().score || 0;
        db.ref(`rooms/${roomId}/players/${winner}/score`).set(score + 1);
      });
    }
  });
}
