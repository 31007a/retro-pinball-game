import fs from 'node:fs';
import path from 'node:path';

const RATE = 44100;
const OUT = new URL('../audio/', import.meta.url);

function clamp(v) { return Math.max(-1, Math.min(1, v)); }
function square(phase) { return Math.sin(phase) >= 0 ? 1 : -1; }
function triangle(phase) { return (2 / Math.PI) * Math.asin(Math.sin(phase)); }

function writeWav(name, samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(RATE, 24);
  buffer.writeUInt32LE(RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  samples.forEach((sample, index) => buffer.writeInt16LE(Math.round(clamp(sample) * 32767), 44 + index * 2));
  fs.writeFileSync(path.join(OUT.pathname, name), buffer);
}

function render(duration, synth) {
  const result = new Float32Array(Math.floor(duration * RATE));
  for (let i = 0; i < result.length; i++) result[i] = synth(i / RATE, i);
  return result;
}

function noteFrequency(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

// 16 秒、128 BPM、8-bit 太空風循環樂句。
const lead = [76, 79, 83, 79, 74, 78, 81, 78, 72, 76, 79, 76, 71, 74, 78, 74];
const bass = [40, 40, 43, 43, 36, 36, 38, 38];
const bgm = render(16, (t) => {
  const beat = t * 2;
  const leadStep = Math.floor(beat * 2) % lead.length;
  const bassStep = Math.floor(beat / 2) % bass.length;
  const leadLocal = (beat * 2) % 1;
  const bassLocal = (beat / 2) % 1;
  const leadEnv = Math.min(1, leadLocal * 16) * Math.max(0, 1 - leadLocal * .75);
  const bassEnv = Math.min(1, bassLocal * 10) * Math.max(.15, 1 - bassLocal * .7);
  const leadTone = square(2 * Math.PI * noteFrequency(lead[leadStep]) * t) * leadEnv * .12;
  const bassTone = triangle(2 * Math.PI * noteFrequency(bass[bassStep]) * t) * bassEnv * .18;
  const kickLocal = beat % 1;
  const kick = Math.sin(2 * Math.PI * (75 - 35 * kickLocal) * t) * Math.exp(-kickLocal * 16) * .22;
  const hatLocal = (beat * 2) % 1;
  const noise = (((Math.sin((t * 12131) ** 2) * 43758.5453) % 1) * 2 - 1);
  const hat = noise * Math.exp(-hatLocal * 34) * .035;
  return leadTone + bassTone + kick + hat;
});
writeWav('bgm.wav', bgm);

writeWav('flipper.wav', render(.14, (t) => {
  const f = 180 + 980 * (t / .14);
  return square(2 * Math.PI * f * t) * Math.exp(-t * 22) * .3;
}));

writeWav('hit.wav', render(.18, (t) => {
  const noise = (((Math.sin((t * 9743) ** 2) * 15731.7) % 1) * 2 - 1);
  return (triangle(2 * Math.PI * 145 * t) * .24 + noise * .16) * Math.exp(-t * 19);
}));

writeWav('point.wav', render(.32, (t) => {
  const notes = [76, 81, 88];
  const step = Math.min(2, Math.floor(t / .105));
  const local = (t % .105) / .105;
  return square(2 * Math.PI * noteFrequency(notes[step]) * t) * Math.sin(Math.PI * local) * .22;
}));

writeWav('gameover.wav', render(.85, (t) => {
  const notes = [55, 51, 48, 43];
  const step = Math.min(3, Math.floor(t / .2125));
  const local = (t % .2125) / .2125;
  return triangle(2 * Math.PI * noteFrequency(notes[step]) * t) * Math.sin(Math.PI * local) * .28;
}));
