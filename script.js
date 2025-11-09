(function () {
  // Ativa o VLibras
  new window.VLibras.Widget('https://vlibras.gov.br/app');

  const startBtn = document.getElementById('start');
  const stopBtn = document.getElementById('stop');
  const clearBtn = document.getElementById('clearHistory'); // Novo botão
  const sessaoAtual = document.getElementById('sessaoAtual');
  const historico = document.getElementById('historico');
  const status = document.getElementById('status'); // Indicador de status

  //Variaveis
  let recognition;
  let isListening = false;
  let currentSessionText = "";

  //Compatibilidade com o Chrome
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  //Função para atualizar o status na interface do usuário
  function setStatus(msg, active = false) {
    status.textContent = msg;
    //Muda a cor para indicar se o status é "ativo"
    status.style.color = active ? "red" : "black";
  }

  // Função para adicionar o texto finalizado ao histórico de sessões
  function addToHistory(text) {
    const bloco = document.createElement('div');
    bloco.className = 'bloco-sessao';
    bloco.textContent = text;
    historico.appendChild(bloco);
    saveHistory();
  }

  //Função para salvar o conteúdo HTML do histórico
  function saveHistory() {
    localStorage.setItem('speechHistory', historico.innerHTML);
  }

  //Função para carregar o histórico salvo
  function loadHistory() {
    historico.innerHTML = localStorage.getItem('speechHistory') || '';
  }

  //Função para limpar o histórico
  function clearHistory() {
    historico.innerHTML = '';
    saveHistory();
  }

  // Alerta e desabilita botões se a API não for suportada pelo navegador
  if (!window.SpeechRecognition) {
    alert("Seu navegador não suporta a API de reconhecimento de voz.");
    startBtn.disabled = true;
    stopBtn.disabled = true;
  } else {
    // Inicializa a API e configura seus parâmetros
    recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = true;
    recognition.continuous = true;

    //vento disparado quando o reconhecimento de voz é reconhecido
    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentSessionText += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Atualiza a área de sessão atual com o texto final
      sessaoAtual.textContent = currentSessionText + interimTranscript;
    };

    // Evento disparado em caso de erro no reconhecimento.
    recognition.onerror = (event) => {
      setStatus('Erro: ' + event.error);
      isListening = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;
    };

    // Evento disparado quando o motor de reconhecimento detecta o fim da fala
    recognition.onspeechend = () => {
      setStatus('Fala encerrada.');
    };

    // Evento disparado quando o reconhecimento é encerrado
    recognition.onend = () => {
      setStatus('Reconhecimento parado.');
      isListening = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;
    };
  }

  // Ação do botão INICIAR
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

  // Ação do botão PARAR
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

  // Ação do botão LIMPAR HISTÓRICO
  if (clearBtn) {
    clearBtn.onclick = clearHistory;
  }

  const exportBtn = document.getElementById('exportHistory');

    // Função para exportar transcrição salva
    if (exportBtn) {
    exportBtn.onclick = () => {
        // Pega todo o texto do histórico
        let text = '';
        document.querySelectorAll('#historico .bloco-sessao').forEach((bloco, i) => {
        text += `Sessão ${i + 1}:\n${bloco.textContent}\n\n`;
        });
        if (!text) {
        alert('Nenhuma sessão no histórico para exportar.');
        return;
        }
        // Cria um blob e link de download
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'historico-transcricao.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    }

  // Carrega histórico ao iniciar
  loadHistory();
})();