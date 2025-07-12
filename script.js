(function () {
  // Ativa o VLibras
  new window.VLibras.Widget('https://vlibras.gov.br/app');

  const startBtn = document.getElementById('start');
  const stopBtn = document.getElementById('stop');
  const clearBtn = document.getElementById('clearHistory'); // Novo botão
  const sessaoAtual = document.getElementById('sessaoAtual');
  const historico = document.getElementById('historico');
  const status = document.getElementById('status'); // Indicador de status

  let recognition;
  let isListening = false;
  let currentSessionText = "";

  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function setStatus(msg, active = false) {
    status.textContent = msg;
    status.style.color = active ? "red" : "black";
  }

  function addToHistory(text) {
    const bloco = document.createElement('div');
    bloco.className = 'bloco-sessao';
    bloco.textContent = text;
    historico.appendChild(bloco);
    saveHistory();
  }

  function saveHistory() {
    localStorage.setItem('speechHistory', historico.innerHTML);
  }

  function loadHistory() {
    historico.innerHTML = localStorage.getItem('speechHistory') || '';
  }

  function clearHistory() {
    historico.innerHTML = '';
    saveHistory();
  }

  if (!window.SpeechRecognition) {
    alert("Seu navegador não suporta a API de reconhecimento de voz.");
    startBtn.disabled = true;
    stopBtn.disabled = true;
  } else {
    recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentSessionText += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      sessaoAtual.textContent = currentSessionText + interimTranscript;
    };

    recognition.onerror = (event) => {
      setStatus('Erro: ' + event.error);
      isListening = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;
    };

    recognition.onspeechend = () => {
      setStatus('Fala encerrada.');
    };

    recognition.onend = () => {
      setStatus('Reconhecimento parado.');
      isListening = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;
    };
  }

  startBtn.onclick = () => {
    if (recognition && !isListening) {
      currentSessionText = "";
      sessaoAtual.textContent = "";
      setStatus("Gravando...", true);
      recognition.start();
      isListening = true;
      startBtn.disabled = true;
      stopBtn.disabled = false;
    }
  };

  stopBtn.onclick = () => {
    if (recognition && isListening) {
      recognition.stop();
      isListening = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;
      if (currentSessionText.trim().length > 0) {
        addToHistory(currentSessionText.trim());
      }
    }
  };

  if (clearBtn) {
    clearBtn.onclick = clearHistory;
  }

  // Carrega histórico ao iniciar
  loadHistory();
})();