let questions = [];
let current = 0;

fetch('/api/questions')
  .then(res => res.json())
  .then(data => {
    questions = data;
    showQuestion();
  });

function showQuestion() {
  const q = questions[current];
  document.getElementById('question').innerText = q.enunciado;
  
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';

  q.alternativas.forEach((alt, idx) => {
    const btn = document.createElement('div');
    btn.className = 'option';
    btn.innerText = alt.texto;
    btn.onclick = () => handleAnswer(btn, alt.correta);
    optionsDiv.appendChild(btn);
  });

  document.getElementById('nextBtn').style.display = 'none';
}

function handleAnswer(selected, correct) {
  const options = document.querySelectorAll('.option');
  options.forEach(btn => {
    btn.onclick = null;
    const isCorrect = btn.innerText === selected.innerText ? correct : questions[current].alternativas.find(a => a.texto === btn.innerText).correta;
    if (isCorrect) btn.classList.add('correct');
    else btn.classList.add('wrong');
  });

  document.getElementById('nextBtn').style.display = 'block';
  document.getElementById('nextBtn').onclick = nextQuestion;
}

function nextQuestion() {
  current++;
  if (current < questions.length) {
    showQuestion();
  } else {
    document.getElementById('app').innerHTML = '<h2>Simulado concluído!</h2>';
  }
}
