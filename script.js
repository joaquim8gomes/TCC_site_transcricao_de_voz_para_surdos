new window.VLibras.Widget('https://vlibras.gov.br/app');

const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('stop');
    const texto = document.getElementById('texto');

    let recognition;
    let isListening = false;

    // Verifica se a API é suportada
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!window.SpeechRecognition) {
      alert("Seu navegador não suporta a API de reconhecimento de voz.");
    } else {
      recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onresult = (event) => {
        let result = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          result += event.results[i][0].transcript;
        }
        texto.textContent = result;
      };

      recognition.onerror = (event) => {
        console.error('Erro no reconhecimento: ', event.error);
      };
    }

    startBtn.onclick = () => {
      if (recognition && !isListening) {
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
      }
    };