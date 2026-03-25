import { useRef, useCallback } from 'react';

export const useAudio = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const ensureContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', gainValue: number = 0.1) => {
    try {
      const ctx = ensureContext();
      const now = ctx.currentTime;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      gainNode.gain.setValueAtTime(gainValue, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
      
      oscillator.start(now);
      oscillator.stop(now + duration / 1000);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [ensureContext]);

  const cardPlace = useCallback(() => {
    playTone(440, 30, 'sine', 0.10);
  }, [playTone]);

  const foundationPlace = useCallback(() => {
    playTone(520, 40, 'sine', 0.10);
  }, [playTone]);

  const acePlace = useCallback(() => {
    try {
      const ctx = ensureContext();
      const now = ctx.currentTime;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(520, now);
      oscillator.frequency.linearRampToValueAtTime(660, now + 0.08);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      gainNode.gain.setValueAtTime(0.10, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
      
      oscillator.start(now);
      oscillator.stop(now + 0.10);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [ensureContext]);

  const draw = useCallback(() => {
    playTone(300, 20, 'sine', 0.06);
  }, [playTone]);

  const recycle = useCallback(() => {
    try {
      const ctx = ensureContext();
      const now = ctx.currentTime;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(200, now);
      oscillator.frequency.linearRampToValueAtTime(260, now + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      gainNode.gain.setValueAtTime(0.09, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      oscillator.start(now);
      oscillator.stop(now + 0.12);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [ensureContext]);

  const error = useCallback(() => {
    playTone(150, 50, 'sawtooth', 0.09);
  }, [playTone]);

  const undoSound = useCallback(() => {
    playTone(380, 25, 'sine', 0.07);
  }, [playTone]);

  const win = useCallback(() => {
    try {
      const ctx = ensureContext();
      const notes = [440, 554, 659, 880];
      
      notes.forEach((freq, i) => {
        setTimeout(() => {
          playTone(freq, 100, 'sine', 0.12);
        }, i * 125);
      });
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [ensureContext, playTone]);

  return {
    cardPlace,
    foundationPlace,
    acePlace,
    draw,
    recycle,
    error,
    undo: undoSound,
    win,
    ensureContext,
  };
};
