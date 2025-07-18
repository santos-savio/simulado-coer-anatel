document.addEventListener('DOMContentLoaded', () => {
  let questions = [];
  let current = 0;
  let score = 0;
  let timerInterval;
  let timeRemaining = 30 * 60;

  const appEl = document.getElementById('app');
  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('options');
  const nextBtn = document.getElementById('nextBtn');
  const progressBar = document.getElementById('progressBar');

  // Carrega perguntas
  fetch('/api/questions')
    .then(res => {
      if (!res.ok) throw new Error("Falha ao carregar questões.");
      return res.json();
    })
    .then(data => {
      questions = data.slice(0, 20);
      showQuestion();
      startTimer();
    })
    .catch(err => {
      console.error(err);
      appEl.innerHTML = `
        <div class="notification is-danger">
          <strong>Erro ao carregar as questões!</strong><br>
          Verifique sua conexão ou tente novamente.
        </div>
        <button class="button is-link mt-3" onclick="window.location.reload()">Tentar novamente</button>
      `;
    });

  // Mostrar pergunta
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
    appEl.innerHTML = `
      <div class="has-text-centered">
        <h2 class="title is-3">Simulado concluído!</h2>
        <p><strong>Acertos:</strong> ${score} de ${questions.length}</p>
        <p><strong>Nota:</strong> ${(score / questions.length * 10).toFixed(2)}</p>
        <button class="button is-warning mt-4" onclick="window.location.reload()">Reiniciar</button>
      </div>
    `;
  }

  function updateProgress() {
    progressBar.value = current + 1;
    progressBar.max = questions.length;
  }

  function startTimer() {
    insertTimerAndExitBtn();

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
    const timerEl = document.getElementById('timer');
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerEl.innerText = `⏳ Tempo restante: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.title = `⏰ ${minutes}:${seconds.toString().padStart(2, '0')} - Simulado`;
  }

  function insertTimerAndExitBtn() {
    const controlDiv = document.createElement('div');
    controlDiv.className = 'is-flex is-justify-content-space-between mb-4';

    const timerDiv = document.createElement('div');
    timerDiv.id = 'timer';
    timerDiv.className = 'has-text-weight-semibold';

    const exitBtn = document.createElement('button');
    exitBtn.className = 'button is-danger is-small';
    exitBtn.innerText = 'Sair da prova';
    exitBtn.onclick = () => {
      if (confirm("Tem certeza que deseja sair da prova? Seu progresso será perdido.")) {
        window.location.href = "/"; // ou outro destino
      }
    };

    controlDiv.appendChild(timerDiv);
    controlDiv.appendChild(exitBtn);
    appEl.insertBefore(controlDiv, questionEl);
  }
});
