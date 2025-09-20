function play(userChoice) {
  const choices = ['سنگ', 'کاغذ', 'قیچی'];
  const computerChoice = choices[Math.floor(Math.random() * 3)];
  let result = '';

  if (userChoice === computerChoice) {
    result = 'مساوی شد!';
  } else if (
    (userChoice === 'سنگ' && computerChoice === 'قیچی') ||
    (userChoice === 'کاغذ' && computerChoice === 'سنگ') ||
    (userChoice === 'قیچی' && computerChoice === 'کاغذ')
  ) {
    result = 'شما بردید!';
  } else {
    result = 'کامپیوتر برد!';
  }

  document.getElementById('result').innerHTML =
    `<strong>شما:</strong> ${userChoice} <br>
     <strong>کامپیوتر:</strong> ${computerChoice} <br>
     <strong>نتیجه:</strong> ${result}`;
}
