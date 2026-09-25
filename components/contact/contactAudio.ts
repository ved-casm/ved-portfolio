/*
 * Synthesised soundscape for the contact scene (no audio files): wind through
 * the grass, a rustle of leaves, crickets at night / birds by day, a low pad,
 * plus small UI blips. Exposes an analyser for the header's level bars.
 */

export type ContactAudio = {
  start: () => void;
  setMuted: (m: boolean) => void;
  setDay: (t: number) => void;
  hover: () => void;
  click: () => void;
  whoosh: () => void;
  levels: (out: Uint8Array) => void;
  dispose: () => void;
};

export function createContactAudio(): ContactAudio {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0;
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 64;
  master.connect(analyser);
  analyser.connect(ctx.destination);

  // shared noise buffer (pinkish)
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.997 * b0 + w * 0.029591;
    b1 = 0.985 * b1 + w * 0.032534;
    b2 = 0.95 * b2 + w * 0.048056;
    d[i] = (b0 + b1 + b2 + w * 0.1) * 0.5;
  }
  const noise = () => {
    const s = ctx.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    s.loopStart = Math.random();
    return s;
  };
  const lfo = (freq: number, depth: number, target: AudioParam) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.value = depth;
    o.connect(g).connect(target);
    o.start();
    return o;
  };

  const nodes: AudioScheduledSourceNode[] = [];
  let timers: number[] = [];
  let started = false;
  let muted = false;
  let suspendTimer = 0;
  let day = 0;
  const nightBus = ctx.createGain();
  const dayBus = ctx.createGain();
  nightBus.connect(master);
  dayBus.connect(master);

  const build = () => {
    // wind
    const wind = noise();
    const wf = ctx.createBiquadFilter();
    wf.type = "bandpass";
    wf.frequency.value = 520;
    wf.Q.value = 0.6;
    const wg = ctx.createGain();
    wg.gain.value = 0.32;
    wind.connect(wf).connect(wg).connect(master);
    nodes.push(wind, lfo(0.07, 260, wf.frequency), lfo(0.11, 0.14, wg.gain));
    wind.start();

    // leaves rustle
    const rustle = noise();
    const rf = ctx.createBiquadFilter();
    rf.type = "highpass";
    rf.frequency.value = 3800;
    const rg = ctx.createGain();
    rg.gain.value = 0.03;
    rustle.connect(rf).connect(rg).connect(master);
    nodes.push(rustle, lfo(0.23, 0.025, rg.gain));
    rustle.start();

    // low pad
    [110, 164.8, 220.4].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.detune.value = i * 4;
      const g = ctx.createGain();
      g.gain.value = 0.018;
      o.connect(g).connect(master);
      nodes.push(o, lfo(0.05 + i * 0.03, 0.01, g.gain));
      o.start();
    });

    // night: crickets (pulsed high tone)
    const cr = ctx.createOscillator();
    cr.frequency.value = 4600;
    const crAm = ctx.createGain();
    crAm.gain.value = 0;
    const pulse = ctx.createOscillator();
    pulse.type = "square";
    pulse.frequency.value = 28;
    const pulseG = ctx.createGain();
    pulseG.gain.value = 0.012;
    pulse.connect(pulseG).connect(crAm.gain);
    const chirpEnv = ctx.createGain();
    chirpEnv.gain.value = 0;
    cr.connect(crAm).connect(chirpEnv).connect(nightBus);
    // on/off chirp groups
    const chirpLfo = ctx.createOscillator();
    chirpLfo.type = "square";
    chirpLfo.frequency.value = 0.9;
    const chirpDepth = ctx.createGain();
    chirpDepth.gain.value = 0.5;
    chirpLfo.connect(chirpDepth).connect(chirpEnv.gain);
    chirpEnv.gain.value = 0.5;
    cr.start();
    pulse.start();
    chirpLfo.start();
    nodes.push(cr, pulse, chirpLfo);

    // day: birds, scheduled at random
    const bird = () => {
      if (!started) return;
      if (day > 0.4 && !muted) {
        const t = ctx.currentTime;
        const notes = 2 + Math.floor(Math.random() * 4);
        const base = 2600 + Math.random() * 1600;
        for (let i = 0; i < notes; i++) {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          const s = t + i * (0.09 + Math.random() * 0.05);
          o.frequency.setValueAtTime(base, s);
          o.frequency.exponentialRampToValueAtTime(base * (1.3 + Math.random() * 0.4), s + 0.06);
          g.gain.setValueAtTime(0, s);
          g.gain.linearRampToValueAtTime(0.03, s + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, s + 0.08);
          o.connect(g).connect(dayBus);
          o.start(s);
          o.stop(s + 0.1);
        }
      }
      timers.push(window.setTimeout(bird, 1800 + Math.random() * 4200));
    };
    bird();
  };

  const applyBus = () => {
    const t = ctx.currentTime;
    nightBus.gain.setTargetAtTime(1 - day, t, 0.4);
    dayBus.gain.setTargetAtTime(day, t, 0.4);
  };

  const blip = (f0: number, f1: number, dur: number, vol: number) => {
    if (!started || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  };

  return {
    start: () => {
      if (started) return;
      started = true;
      ctx.resume();
      build();
      applyBus();
      master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 1.2);
    },
    setMuted: (m) => {
      muted = m;
      if (!started) return;
      window.clearTimeout(suspendTimer);
      if (!m) ctx.resume();
      master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, m ? 0.12 : 0.35);
      // once faded out, stop the audio thread entirely
      if (m) suspendTimer = window.setTimeout(() => muted && ctx.suspend(), 700);
    },
    setDay: (t) => {
      day = t;
      if (started) applyBus();
    },
    hover: () => blip(1500, 1900, 0.05, 0.025),
    click: () => blip(900, 520, 0.12, 0.06),
    whoosh: () => {
      if (!started || muted) return;
      const t = ctx.currentTime;
      const s = noise();
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.Q.value = 1.2;
      f.frequency.setValueAtTime(300, t);
      f.frequency.exponentialRampToValueAtTime(2400, t + 1.4);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.35, t + 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      s.connect(f).connect(g).connect(master);
      s.start(t);
      s.stop(t + 1.9);
    },
    levels: (out) => analyser.getByteFrequencyData(out as Uint8Array<ArrayBuffer>),
    dispose: () => {
      started = false;
      timers.forEach(clearTimeout);
      timers = [];
      nodes.forEach((n) => {
        try {
          n.stop();
        } catch {}
      });
      ctx.close();
    },
  };
}
