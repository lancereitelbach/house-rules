import { useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { StartScreen } from './components/StartScreen';
import { WinScreen } from './components/WinScreen';
import { MenuScreen } from './components/MenuScreen';
import { HelpScreen } from './components/HelpScreen';
import { useGameState } from './hooks/useGameState';
import { useKeyboard } from './hooks/useKeyboard';
import { useAudio } from './hooks/useAudio';

function App() {
  const screen = useGameState(state => state.screen);
  const setAudioCallbacks = useGameState(state => state.setAudioCallbacks);
  const audio = useAudio();
  
  // Initialize keyboard controls
  useKeyboard();
  
  // Wire audio callbacks into game state
  useEffect(() => {
    setAudioCallbacks({
      cardPlace: audio.cardPlace,
      foundationPlace: audio.foundationPlace,
      acePlace: audio.acePlace,
      draw: audio.draw,
      recycle: audio.recycle,
      error: audio.error,
      undo: audio.undo,
      win: audio.win,
    });
  }, [audio, setAudioCallbacks]);
  
  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      audio.ensureContext();
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
    
    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
    
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, [audio]);

  return (
    <div className="w-full h-screen overflow-hidden">
      {screen === 'start' && <StartScreen />}
      {screen === 'game' && <GameBoard />}
      {screen === 'win' && <WinScreen />}
      {screen === 'menu' && <MenuScreen />}
      {screen === 'help' && <HelpScreen />}
    </div>
  );
}

export default App;
