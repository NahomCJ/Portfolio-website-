// Shared audio-reactive signals, read by Beams.jsx and written from the
// Tracy chat's <audio> element so the hero wave animation vibes with the
// music without either file needing to know about the other directly.
//
// `audioLevel`   overall loudness (smoothed)
// `audioBass`    low-band energy (smoothed) — drives "disperse" turbulence
// `audioTreble`  high-band energy (smoothed) — drives flow-direction drift
// `audioBeat`    impulse envelope that spikes on a bass onset/beat and
//                decays — drives the "come apart, come back" pulse
//
// All four settle back to 0 on their own once the track pauses/stops,
// which puts the shader back to its exact original idle look.

export const audioLevel = { current: 0 };
export const audioBass = { current: 0 };
export const audioTreble = { current: 0 };
export const audioBeat = { current: 0 };

let analyser;
let dataArray;

let smoothLevel = 0;
let smoothBass = 0;
let smoothTreble = 0;
let bassAvg = 0;
let beatEnv = 0;

export function connectAudioReactivity(audioEl) {
  if (!audioEl || analyser) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const source = audioCtx.createMediaElementSource(audioEl);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0;
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
    const n = dataArray.length;
    const bassEnd = Math.max(1, Math.floor(n * 0.08));
    const trebleStart = Math.floor(n * 0.5);

    let total = 0;
    let bassSum = 0;
    let trebleSum = 0;
    for (let i = 0; i < n; i++) {
      const v = dataArray[i];
      total += v;
      if (i < bassEnd) bassSum += v;
      else if (i >= trebleStart) trebleSum += v;
    }

    const rawLevel = total / n / 255;
    const rawBass = bassSum / bassEnd / 255;
    const rawTreble = trebleSum / (n - trebleStart) / 255;

    // Fast attack, slower release so motion feels musical, not jittery.
    smoothLevel += (rawLevel - smoothLevel) * (rawLevel > smoothLevel ? 0.5 : 0.08);
    smoothBass += (rawBass - smoothBass) * (rawBass > smoothBass ? 0.6 : 0.1);
    smoothTreble += (rawTreble - smoothTreble) * (rawTreble > smoothTreble ? 0.5 : 0.08);

    // Onset detection: a bass hit meaningfully above its rolling average
    // triggers the disperse pulse; it then decays on its own.
    bassAvg += (rawBass - bassAvg) * 0.05;
    if (rawBass > bassAvg * 1.35 + 0.05) beatEnv = 1;
    beatEnv *= 0.9;
  } else {
    smoothLevel *= 0.95;
    smoothBass *= 0.95;
    smoothTreble *= 0.95;
    beatEnv *= 0.9;
  }

  audioLevel.current = smoothLevel;
  audioBass.current = smoothBass;
  audioTreble.current = smoothTreble;
  audioBeat.current = beatEnv;

  requestAnimationFrame(tick);
}
