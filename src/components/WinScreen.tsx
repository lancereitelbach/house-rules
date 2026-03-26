import { motion } from 'framer-motion';
import { useGameState } from '../hooks/useGameState';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export const WinScreen: React.FC = () => {
  const { stats, dealGame, startDrawSel, goToStart, recordWin } = useGameState();

  const elapsed = stats.currentGameStartTime 
    ? Math.floor(((stats.currentGameFrozenTime || Date.now()) - stats.currentGameStartTime) / 1000)
    : 0;
  
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  
  const newGamesPlayed = stats.gamesPlayed + 1;
  const newGamesWon = stats.gamesWon + 1;
  const newWinRate = Math.round((newGamesWon / newGamesPlayed) * 100);

  // Trigger confetti on mount
  useEffect(() => {
    const duration = 3 * 1000; // 3 seconds
    const end = Date.now() + duration;
    const colors = ['#b83a3a', '#2b2822']; // Red and black (suit colors)

    const frame = () => {
      if (Date.now() > end) return;

      // Left cannon
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });

      // Right cannon
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  }, []);

  const handlePlayAgain = () => {
    recordWin();
    dealGame(startDrawSel);
  };

  const handleGoHome = () => {
    recordWin();
    goToStart();
  };

  const springConfig = {
    type: "spring" as const,
    damping: 25,
    stiffness: 200,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center p-8 bg-ink-900 bg-opacity-70 backdrop-blur-md overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...springConfig, delay: 0.1 }}
        className="w-full max-w-md bg-felt-dark bg-opacity-90 backdrop-blur-sm rounded-2xl border border-paper-300 border-opacity-20 p-12 relative z-10"
      >
        {/* Medal Icon - Simple muted gold with white crown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotateZ: -20 }}
          animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
          transition={{ ...springConfig, delay: 0.3 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-accent-gold bg-opacity-60 border-2 border-accent-gold flex items-center justify-center" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.4 }}
          className="text-center mb-8"
        >
          <h2 className="text-5xl font-serif text-paper-100 mb-3 tracking-wide" style={{ letterSpacing: '0.05em' }}>
            You <span className="italic font-light">Win</span>
          </h2>
          <p className="text-xs font-mono text-ink-500 tracking-ui uppercase">
            Game Complete
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.5 }}
          className="grid grid-cols-2 gap-3 mb-8"
        >
          <div className="bg-ink-900 bg-opacity-40 backdrop-blur-sm rounded-lg border border-paper-300 border-opacity-10 p-4">
            <p className="text-xs font-mono text-ink-500 tracking-ui uppercase mb-2">Time</p>
            <p className="text-3xl font-serif text-paper-100 font-light">{minutes}:{seconds}</p>
          </div>
          <div className="bg-ink-900 bg-opacity-40 backdrop-blur-sm rounded-lg border border-paper-300 border-opacity-10 p-4">
            <p className="text-xs font-mono text-ink-500 tracking-ui uppercase mb-2">Moves</p>
            <p className="text-3xl font-serif text-paper-100 font-light">{stats.currentGameMoves}</p>
          </div>
          <div className="bg-ink-900 bg-opacity-40 backdrop-blur-sm rounded-lg border border-paper-300 border-opacity-10 p-4">
            <p className="text-xs font-mono text-ink-500 tracking-ui uppercase mb-2">Games Won</p>
            <p className="text-3xl font-serif text-accent-gold font-light">{newGamesWon}</p>
          </div>
          <div className="bg-ink-900 bg-opacity-40 backdrop-blur-sm rounded-lg border border-paper-300 border-opacity-10 p-4">
            <p className="text-xs font-mono text-ink-500 tracking-ui uppercase mb-2">Win Rate</p>
            <p className="text-3xl font-serif text-accent-gold font-light">{newWinRate}%</p>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.6 }}
          className="space-y-3"
        >
          <button
            onClick={handlePlayAgain}
            className="w-full py-4 px-8 bg-paper-100 border border-paper-100 rounded-lg
                       font-mono text-sm tracking-ui uppercase text-ink-900
                       hover:bg-paper-200 transition-all duration-200"
          >
            Play Again
          </button>
          <button
            onClick={handleGoHome}
            className="w-full py-4 px-8 bg-transparent border border-paper-300 border-opacity-30 rounded-lg
                       font-mono text-sm tracking-ui uppercase text-ink-500
                       hover:border-paper-300 hover:border-opacity-50 transition-all duration-200"
          >
            Return Home
          </button>
        </motion.div>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="text-xs font-mono text-ink-500 tracking-ui text-center mt-6 opacity-60"
        >
          <span className="text-paper-300">Space</span> to play again · <span className="text-paper-300">Esc</span> to quit
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
