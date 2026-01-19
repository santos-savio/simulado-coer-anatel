document.addEventListener('DOMContentLoaded', () => {
  let questions = [];
  let current = 0;
  let score = 0;
  let timerInterval;
  let timeRemaining = 30 * 60;
  let respostasUsuario = [];

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

    q.alternativas.forEach((alt, idx) => {
      const btn = document.createElement('div');
      btn.className = 'option';
      btn.innerText = alt.texto;
      btn.onclick = () => handleAnswer(btn, alt.correta, idx); // Passe idx
      optionsEl.appendChild(btn);
    });

    nextBtn.style.display = 'none';
    updateProgress();
  }

  function handleAnswer(selected, correct, idx) {
    const options = document.querySelectorAll('.option');
    options.forEach(btn => {
      btn.onclick = null;
      const isCorrect = questions[current].alternativas.find(a => a.texto === btn.innerText).correta;
      if (isCorrect) btn.classList.add('correct');
      else btn.classList.add('wrong');
    });

    respostasUsuario[current] = idx; // Salve a resposta do usuário

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
      <style>
        .certa { background-color: #c8e6c9; }
        .errada { background-color: #ffcdd2; }
        li { margin: 5px 0; padding: 5px; border-radius: 4px; }
      </style>
      <div class="has-text-centered">
        <h2 class="title is-3">Simulado concluído!</h2>
        <p><strong>Acertos:</strong> ${score} de ${questions.length}</p>
        <p><strong>Nota:</strong> ${(score / questions.length * 10).toFixed(2)}</p>
        <button class="button is-warning mt-4" onclick="window.location.reload()">Reiniciar</button>
        <button class="button is-warning mt-4" onclick="window.location.href = '/'">Voltar para o início</button>
        <p> <button class="button is-info mt-4" onclick="mostrarCorrecao()">Ver correção</button> </p>
        <div id="correcao"></div> <!-- Adicione este elemento -->
      </div>
    `;

    localStorage.setItem('questoes', JSON.stringify(questions)); // Salve as questões
    localStorage.setItem('respostas_usuario', JSON.stringify(respostasUsuario)); // Salve as respostas
  }

  function mostrarCorrecao() {
    const questoes = JSON.parse(localStorage.getItem('questoes')) || [];
    const respostas = JSON.parse(localStorage.getItem('respostas_usuario')) || [];

    const container = document.getElementById('correcao');
    container.innerHTML = ''; // limpa correções anteriores, se houver

    if (questoes.length === 0 || respostas.length === 0) {
      container.innerHTML = "<p>Dados da prova não encontrados.</p>";
      return;
    }

    questoes.forEach((q, i) => {
      const bloco = document.createElement('div');
      bloco.classList.add('bloco-questao'); // classe para estilização
      bloco.innerHTML = `<div class="numero-questao">Questão ${q.numero}</div><p>${q.enunciado}</p>`;

      const lista = document.createElement('ul');

      q.alternativas.forEach((alt, idx) => {
        const li = document.createElement('li');
        li.textContent = alt.texto;

        if (alt.correta) {
          li.classList.add('certa'); // resposta correta
        } else if (respostas[i] === idx && !alt.correta) {
          li.classList.add('errada'); // resposta errada marcada
        }

        lista.appendChild(li);
      });

      bloco.appendChild(lista);
      container.appendChild(bloco); 
    });

    // opcional: rolar até o bloco de correção
    container.scrollIntoView({ behavior: 'smooth' });
  }

  // Torne a função acessível globalmente
  window.mostrarCorrecao = mostrarCorrecao;

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
    timerEl.innerText = `\u23F3 Tempo restante: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.title = `\u23F0 ${minutes}:${seconds.toString().padStart(2, '0')} - Simulado`;
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
