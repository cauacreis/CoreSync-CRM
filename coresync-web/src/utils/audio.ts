// Mock de um som curto (Base64) ou gerador procedural
// Usamos a API Audio e tentamos um som via AudioContext para um "pop" mais satisfatório, 
// além de manter a instância de Audio solicitada para compatibilidade.

// Um base64 válido de um beep curto de 0.1s
const beepBase64 = "data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVQAAACcnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJw=";

export const dropSound = new Audio(beepBase64);
dropSound.volume = 0.5;

// Pré-carrega o áudio
dropSound.load();

export const playDropSound = () => {
  const isEnabled = localStorage.getItem('@CoreSync:sound') !== 'false'; // default is true
  if (!isEnabled) return;

  try {
    // Tenta usar Web Audio API para um 'thump' Brutalista (mais grave e satisfatório)
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
      return;
    }
  } catch (e) {
    // Fallback silencioso para o áudio base64 se o AudioContext falhar
  }

  // Fallback usando a tag <audio> nativa
  try {
    dropSound.currentTime = 0;
    dropSound.play().catch(() => {
      // Ignora erro de autoplay
    });
  } catch (err) {
    // Fallback final
  }
};
