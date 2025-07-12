// Ativa o VLibras
new window.VLibras.Widget('https://vlibras.gov.br/app');

// Acha os botoes
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const sessaoAtual = document.getElementById('sessaoAtual');
const historico = document.getElementById('historico');

let recognition;
let isListening = false;
let currentSessionText = ""; // Texto desta sessão

//Configuração por reconhecimento de voz
//webkitSpeechRecognition: Reconhecimento do navegador
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Inicia o microfone e verifica se navegador suporta o microfone
if (!window.SpeechRecognition) {
  alert("Seu navegador não suporta a API de reconhecimento de voz.");
} else {
  recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = true;
  recognition.continuous = true;

  // Começa a gravação
  recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        currentSessionText += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    // Mostra o texto da sessão atual
    sessaoAtual.textContent = currentSessionText + interimTranscript;
  };

  recognition.onerror = (event) => {
    console.error('Erro no reconhecimento: ', event.error);
  };
}

startBtn.onclick = () => {
  if (recognition && !isListening) {
    // Limpa a sessão atual ao iniciar
    currentSessionText = "";
    sessaoAtual.textContent = "";
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
    // Ao parar, adiciona o texto da sessão ao histórico como bloco separado
    if (currentSessionText.trim().length > 0) {
      const bloco = document.createElement('div');
      bloco.className = 'bloco-sessao';
      bloco.textContent = currentSessionText.trim();
      historico.appendChild(bloco);
    }
    // Sessão atual será limpa na próxima vez que clicar "Iniciar"
  }
};