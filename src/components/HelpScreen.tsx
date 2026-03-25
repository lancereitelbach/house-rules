import { motion } from 'framer-motion';
import { useGameState } from '../hooks/useGameState';

interface KeybindRow {
  keys: string;
  description: string;
}

interface KeybindTier {
  title: string;
  binds: KeybindRow[];
}

const keybindTiers: KeybindTier[] = [
  {
    title: 'Tier 1 — Beginner',
    binds: [
      { keys: '↑ ↓ ← →', description: 'Navigate cards' },
      { keys: 'Enter', description: 'Select / confirm' },
      { keys: 'E', description: 'Draw from stock' },
      { keys: 'Tab', description: 'Cycle zone focus' },
    ],
  },
  {
    title: 'Tier 2 — Intermediate',
    binds: [
      { keys: 'A', description: 'Auto-place card' },
      { keys: 'Q', description: 'Reverse auto-place' },
      { keys: 'C', description: 'Undo last move' },
      { keys: 'Shift+A', description: 'Sweep to foundations' },
      { keys: 'Shift+Space', description: 'Cancel selection' },
      { keys: 'Esc', description: 'Open menu' },
    ],
  },
  {
    title: 'Tier 3 — Advanced',
    binds: [
      { keys: 'W S D F', description: 'Navigate (WASD)' },
      { keys: 'U I O P', description: 'Jump to col 1–4' },
      { keys: 'J K L', description: 'Jump to col 5–7' },
      { keys: 'Shift+Col', description: 'Smart stack select' },
      { keys: '1 2 3 4', description: 'Select foundation' },
      { keys: 'Z', description: 'Abandon & restart' },
      { keys: 'R', description: 'Return to start' },
    ],
  },
];

export const HelpScreen: React.FC = () => {
  const { setScreen } = useGameState();

  const handleClose = () => {
    setScreen('start');
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
      className="fixed inset-0 bg-ink-900 overflow-y-auto p-8"
    >
      <div className="max-w-3xl mx-auto py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-serif text-paper-100 mb-4 tracking-wide" style={{ letterSpacing: '0.05em' }}>
            Key<span className="italic font-light">binds</span>
          </h1>
          <p className="text-xs font-mono text-ink-500 tracking-ui uppercase">
            Complete Reference
          </p>
        </motion.div>

        {/* Keybind Tiers */}
        {keybindTiers.map((tier, tierIndex) => (
          <motion.div
            key={tierIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.2 + tierIndex * 0.1 }}
            className="mb-12"
          >
            {/* Tier Header */}
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xs font-mono text-accent-gold tracking-ui uppercase">
                {tier.title}
              </h2>
              <div className="flex-1 h-px bg-paper-300 opacity-10" />
            </div>

            {/* Keybinds Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tier.binds.map((bind, bindIndex) => (
                <motion.div
                  key={bindIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    ...springConfig, 
                    delay: 0.3 + tierIndex * 0.1 + bindIndex * 0.05 
                  }}
                  className="flex items-center gap-4 bg-felt-dark bg-opacity-40 backdrop-blur-sm
                             rounded-lg border border-paper-300 border-opacity-10 p-4"
                >
                  <div className="flex-shrink-0 min-w-[120px]">
                    <kbd className="inline-block px-3 py-2 bg-ink-900 bg-opacity-60 border border-paper-300 border-opacity-20
                                   rounded font-mono text-xs text-paper-100 tracking-ui text-center">
                      {bind.keys}
                    </kbd>
                  </div>
                  <p className="text-sm font-mono text-ink-500">
                    {bind.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Close Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.6 }}
          className="text-center mt-16"
        >
          <button
            onClick={handleClose}
            className="py-4 px-12 bg-paper-100 border border-paper-100 rounded-lg
                       font-mono text-sm tracking-ui uppercase text-ink-900
                       hover:bg-paper-200 transition-all duration-200"
          >
            Close
          </button>
          <p className="text-xs font-mono text-ink-500 tracking-ui text-center mt-6 opacity-60">
            Press any key to dismiss
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
