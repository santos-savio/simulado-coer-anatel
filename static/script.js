let questions = [];
let current = 0;
let score = 0;
const totalTime = 30 * 60; // 30 minutos em segundos
let timeRemaining = totalTime;
let timerInterval;

// Elementos do DOM
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');

// Início do app
fetch('/api/questions')
  .then(res => res.json())
  .then(data => {
    questions = data.slice(0, 20); // Garante no máximo 20 questões
    showQuestion();
    startTimer();
  });

function showQuestion() {
  const q = questions[current];
  questionEl.innerText = `${current + 1}. ${q.enunciado}`;
  optionsEl.innerHTML = '';

  q.alternativas.forEach((alt) => {
    const btn = document.createElement('div');
    btn.className = 'option';
    btn.innerText = alt.texto;
    btn.onclick = () => handleAnswer(btn, alt.correta);
    optionsEl.appendChild(btn);
  });

  nextBtn.style.display = 'none';
  updateProgress();
}

function handleAnswer(selected, correct) {
  const options = document.querySelectorAll('.option');

  options.forEach(btn => {
    btn.onclick = null;
    const isCorrect = questions[current].alternativas.find(a => a.texto === btn.innerText).correta;
    if (isCorrect) btn.classList.add('correct');
    else btn.classList.add('wrong');
  });

  if (correct) score++;

  nextBtn.style.display = 'block';
  nextBtn.onclick = nextQuestion;
}

function nextQuestion() {
  current++;
  if (current < questions.length) {
    showQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  clearInterval(timerInterval);
  document.title = '✅ Simulado Finalizado';

  const acertos = `${score} de ${questions.length} questões`;
  const nota = ((score / questions.length) * 10).toFixed(2);

  document.getElementById('app').innerHTML = `
    <div class="has-text-centered">
      <h2 class="title is-3">Simulado concluído!</h2>
      <p><strong>Acertos:</strong> ${acertos}</p>
      <p><strong>Nota:</strong> ${nota}</p>
      <button class="button is-warning mt-4" onclick="window.location.reload()">Reiniciar</button>
    </div>
  `;
}

function updateProgress() {
  progressBar.value = current + 1;
  progressBar.max = questions.length;
  const percentage = Math.round(((current + 1) / questions.length) * 100);
  progressBar.innerText = `${percentage}%`;
}

function startTimer() {
  const timerDisplay = document.createElement('div');
  timerDisplay.id = 'timer';
  timerDisplay.className = 'has-text-right mb-4 has-text-weight-semibold';
  questionEl.parentNode.insertBefore(timerDisplay, questionEl);

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      finishQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timerEl = document.getElementById('timer');
  timerEl.innerText = `⏳ Tempo restante: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  document.title = `⏰ ${minutes}:${seconds.toString().padStart(2, '0')} - Simulado`;
}
