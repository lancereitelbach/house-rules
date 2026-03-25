import { motion } from 'framer-motion';
import { useGameState } from '../hooks/useGameState';
import { useEffect, useState } from 'react';

interface ConfettiParticle {
  id: number;
  color: 'red' | 'black';
  x: number;
  delay: number;
  duration: number;
  rotation: number;
  swayAmplitude: number;
  width: number;
  height: number;
}

export const WinScreen: React.FC = () => {
  const { stats, dealGame, startDrawSel, goToStart, recordWin } = useGameState();
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

  const elapsed = stats.currentGameStartTime 
    ? Math.floor(((stats.currentGameFrozenTime || Date.now()) - stats.currentGameStartTime) / 1000)
    : 0;
  
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  
  const newGamesPlayed = stats.gamesPlayed + 1;
  const newGamesWon = stats.gamesWon + 1;
  const newWinRate = Math.round((newGamesWon / newGamesPlayed) * 100);

  // Generate confetti on mount
  useEffect(() => {
    const particles: ConfettiParticle[] = [];
    
    // Create 40 confetti particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        id: i,
        color: Math.random() > 0.5 ? 'red' : 'black',
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.5 + Math.random() * 2,
        rotation: Math.random() * 720 - 360,
        swayAmplitude: 20 + Math.random() * 40,
        width: 8 + Math.random() * 8,
        height: 12 + Math.random() * 16,
      });
    }
    
    setConfetti(particles);
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
        {/* Medal Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotateZ: -20 }}
          animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
          transition={{ ...springConfig, delay: 0.3 }}
          className="flex justify-center mb-6"
        >
          <div className="w-16 h-16 rounded-full border-2 border-accent-gold flex items-center justify-center bg-accent-gold bg-opacity-10">
            <svg 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-accent-gold"
            >
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
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

      {/* Confetti particles - rendered AFTER modal so they appear on top */}
      {confetti.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ y: -50, opacity: 0, rotateZ: 0 }}
          animate={{ 
            y: window.innerHeight + 50,
            x: [0, particle.swayAmplitude, -particle.swayAmplitude, 0],
            opacity: [0, 1, 1, 1, 0.6, 0],
            rotateZ: particle.rotation,
          }}
          transition={{
            delay: particle.delay,
            duration: particle.duration,
            ease: "linear",
            opacity: {
              times: [0, 0.1, 0.3, 0.7, 0.9, 1],
            },
            x: {
              duration: particle.duration * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
            }
          }}
          className="absolute pointer-events-none rounded-sm"
          style={{
            left: `${particle.x}%`,
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            backgroundColor: particle.color === 'red' ? '#b83a3a' : '#2b2822',
            zIndex: 100,
          }}
        />
      ))}
    </motion.div>
  );
};
