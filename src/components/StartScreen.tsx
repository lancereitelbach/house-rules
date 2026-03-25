import { motion } from 'framer-motion';
import { useGameState } from '../hooks/useGameState';

export const StartScreen: React.FC = () => {
  const { 
    startDrawSel, 
    setDrawMode, 
    dealGame,
    stats,
  } = useGameState();

  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;

  const handleDeal = () => {
    dealGame(startDrawSel);
  };

  // Spring animation config
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
      className="fixed inset-0 flex items-center justify-center p-8"
    >
      <div className="w-full max-w-md">
        {/* Logo - Japanese character for relax (安) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springConfig, delay: 0.05 }}
          className="flex justify-center mb-8"
        >
          <div className="w-24 h-24 rounded-full border-2 border-accent-gold flex items-center justify-center bg-paper-100">
            <span className="text-6xl text-accent-gold font-light" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              安
            </span>
          </div>
        </motion.div>
        
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-serif text-paper-100 mb-4 tracking-wide" style={{ letterSpacing: '0.05em' }}>
            House Rules
          </h1>
          <p className="text-sm font-mono text-paper-300 tracking-ui uppercase">
            Keyboard Solitaire
          </p>
        </motion.div>

        {/* Stats (if games played) */}
        {stats.gamesPlayed > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.2 }}
            className="grid grid-cols-2 gap-3 mb-8"
          >
            <div className="bg-felt-dark bg-opacity-30 backdrop-blur-sm rounded-lg border border-paper-300 border-opacity-10 p-4">
              <p className="text-xs font-mono text-ink-500 tracking-ui uppercase mb-2">Games</p>
              <p className="text-3xl font-serif text-paper-100 font-light">{stats.gamesPlayed}</p>
            </div>
            <div className="bg-felt-dark bg-opacity-30 backdrop-blur-sm rounded-lg border border-paper-300 border-opacity-10 p-4">
              <p className="text-xs font-mono text-ink-500 tracking-ui uppercase mb-2">Win Rate</p>
              <p className="text-3xl font-serif text-accent-gold font-light">{winRate}%</p>
            </div>
          </motion.div>
        )}

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ ...springConfig, delay: 0.3 }}
          className="flex items-center gap-3 my-8"
        >
          <div className="flex-1 h-px bg-paper-300 opacity-20" />
          <div className="w-2 h-2 rotate-45 border border-paper-300 opacity-30" />
          <div className="flex-1 h-px bg-paper-300 opacity-20" />
        </motion.div>

        {/* Draw Mode Label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.4 }}
          className="text-xs font-mono text-ink-500 tracking-ui uppercase text-center mb-4"
        >
          Draw Mode
        </motion.p>

        {/* Draw Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.5 }}
          className="grid grid-cols-2 gap-3 mb-8"
        >
          <button
            onClick={() => setDrawMode(1)}
            className={`
              py-4 px-6 rounded-lg border font-mono text-sm tracking-ui uppercase
              transition-all duration-200
              ${startDrawSel === 1
                ? 'bg-paper-100 border-paper-100 text-ink-900'
                : 'bg-transparent border-paper-300 border-opacity-30 text-ink-500 hover:border-paper-300 hover:border-opacity-50'
              }
            `}
          >
            Draw 1
          </button>
          <button
            onClick={() => setDrawMode(3)}
            className={`
              py-4 px-6 rounded-lg border font-mono text-sm tracking-ui uppercase
              transition-all duration-200
              ${startDrawSel === 3
                ? 'bg-paper-100 border-paper-100 text-ink-900'
                : 'bg-transparent border-paper-300 border-opacity-30 text-ink-500 hover:border-paper-300 hover:border-opacity-50'
              }
            `}
          >
            Draw 3
          </button>
        </motion.div>

        {/* Deal Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.6 }}
          onClick={handleDeal}
          className="w-full py-4 px-8 bg-paper-100 border border-paper-100 rounded-lg
                     font-mono text-sm tracking-ui uppercase text-ink-900
                     hover:bg-paper-200 transition-all duration-200"
        >
          Deal Cards
        </motion.button>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="text-xs font-mono text-ink-500 tracking-ui text-center mt-6 opacity-60"
        >
          <span className="text-paper-300">Space</span> or <span className="text-paper-300">Enter</span> to deal
        </motion.p>
      </div>
    </motion.div>
  );
};
