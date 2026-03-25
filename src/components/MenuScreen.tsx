import { motion } from 'framer-motion';
import { useGameState } from '../hooks/useGameState';

export const MenuScreen: React.FC = () => {
  const { menuSel, setMenuSelection, goToGame, goToStart, setScreen } = useGameState();

  const menuItems = [
    { label: 'Return to Game', action: () => goToGame() },
    { label: 'Return to Start', action: () => goToStart() },
    { label: 'Controls', action: () => setScreen('help') },
  ];

  const handleSelect = (index: number) => {
    setMenuSelection(index);
    menuItems[index].action();
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
      className="fixed inset-0 flex items-center justify-center p-8 bg-ink-900 bg-opacity-70 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...springConfig, delay: 0.1 }}
        className="w-full max-w-md bg-felt-dark bg-opacity-90 backdrop-blur-sm rounded-2xl border border-paper-300 border-opacity-20 p-12"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-5xl font-serif text-paper-100 mb-3 tracking-wide" style={{ letterSpacing: '0.05em' }}>
            House <span className="italic font-light">Rules</span>
          </h2>
          <p className="text-xs font-mono text-ink-500 tracking-ui uppercase">
            Paused
          </p>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.3 }}
          className="space-y-2 mb-6"
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={`
                w-full py-4 px-6 rounded-lg border font-mono text-sm tracking-ui
                transition-all duration-200 text-left
                ${menuSel === index
                  ? 'bg-paper-100 border-paper-100 text-ink-900'
                  : 'bg-transparent border-paper-300 border-opacity-20 text-ink-500 hover:border-paper-300 hover:border-opacity-40'
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </motion.div>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-xs font-mono text-ink-500 tracking-ui text-center opacity-60"
        >
          <span className="text-paper-300">↑ / ↓</span> to navigate · <span className="text-paper-300">Space</span> to select
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
