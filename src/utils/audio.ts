/**
 * Sintetizador V12 baseado na potência do motor (cv) usando Web Audio API.
 * Retorna uma promessa que é resolvida ao final do ronco (2.6 segundos).
 */
export async function playV12Roar(power: number): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        throw new Error('Web Audio API não suportada');
      }
      
      const ctx = new AudioCtx();
      const oscillatorsCount = 3;
      const oscillators: OscillatorNode[] = [];
      const gainNodes: GainNode[] = [];
      const masterVolume = ctx.createGain();
      masterVolume.gain.setValueAtTime(0, ctx.currentTime);
      masterVolume.connect(ctx.destination);
      const now = ctx.currentTime;

      const powerModifier = power ? Math.min(power / 150, 2.5) : 1.2;

      for (let i = 0; i < oscillatorsCount; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        const fundamental = (45 + i * 30) * powerModifier;
        osc.frequency.setValueAtTime(fundamental, now);
        osc.detune.setValueAtTime((i % 2 === 0 ? 8 : -8), now);
        gain.gain.setValueAtTime(0, now);
        osc.connect(gain);
        gain.connect(masterVolume);
        oscillators.push(osc);
        gainNodes.push(gain);
      }

      oscillators.forEach(o => o.start(now));
      masterVolume.gain.linearRampToValueAtTime(0.4, now + 0.12);
      gainNodes.forEach((gn, index) => {
        gn.gain.linearRampToValueAtTime(index === 0 ? 0.35 : 0.18, now + 0.12);
      });

      const revTime = 1.0;
      oscillators.forEach((osc, index) => {
        osc.frequency.exponentialRampToValueAtTime((45 + index * 30) * powerModifier * 4.4, now + revTime);
      });
      masterVolume.gain.linearRampToValueAtTime(0.75, now + revTime);

      const returnTime = 1.8;
      oscillators.forEach((osc, index) => {
        osc.frequency.exponentialRampToValueAtTime((45 + index * 30) * powerModifier * 1.02, now + returnTime);
      });
      masterVolume.gain.setValueAtTime(0.45, now + returnTime);
      masterVolume.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      setTimeout(() => {
        oscillators.forEach(o => { try { o.stop(); } catch(e){} });
        ctx.close();
        resolve();
      }, 2600);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
