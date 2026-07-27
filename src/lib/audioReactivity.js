// Shared audio-reactive level, read by Beams.jsx and written from the
// Tracy chat's <audio> element so the hero wave animation pulses with
// the music without either file needing to know about the other directly.

export const audioLevel = { current: 0 };

let analyser;
let dataArray;

export function connectAudioReactivity(audioEl) {
  if (!audioEl || analyser) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const source = audioCtx.createMediaElementSource(audioEl);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    audioCtx.resume?.();

    tick();
  } catch {
    // Web Audio unavailable/blocked — the wave just keeps its default motion.
  }
}

function tick() {
  if (analyser) {
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    audioLevel.current = sum / dataArray.length / 255;
  }
  requestAnimationFrame(tick);
}
