import { motion } from 'framer-motion';
import type { Card as CardType } from '../game/types';

interface CardProps {
  card: CardType;
  isCursor?: boolean;
  isSelected?: boolean;
  isHighlight?: boolean;
  width?: number;
  height?: number;
  dealIndex?: number; // For deal sequence stagger animation
}

const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
} as const;

const RANK_LABELS: Record<number, string> = {
  1: 'A',
  11: 'J',
  12: 'Q',
  13: 'K',
};

export const Card: React.FC<CardProps> = ({
  card,
  isCursor = false,
  isSelected = false,
  isHighlight = false,
  width = 96,
  height = 136,
  dealIndex,
}) => {
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const rankLabel = RANK_LABELS[card.rank] || card.rank.toString();
  const suitColor = card.color === 'red' ? 'text-card-red' : 'text-card-black';

  // Determine which animation to use
  let animationConfig;
  
  if (card.cascadeKey !== undefined) {
    // Cascade animation for smart select multi-card moves
    // Extract index from cascadeKey (cascadeKey = timestamp + index)
    const baseKey = Math.floor(card.cascadeKey / 100) * 100;
    //const cascadeIndex = card.cascadeKey - baseKey;
    
    animationConfig = {
      type: "spring" as const,
      damping: 18,
      stiffness: 280,
      delay: 0
    };
  } else if (dealIndex !== undefined) {
    // Initial deal animation
    animationConfig = {
      type: "spring" as const,
      damping: 18,
      stiffness: 300,
      delay: dealIndex * 0.04, // 40ms stagger
    };
  } else {
    // Default spring config (no delay)
    animationConfig = {
      type: "spring" as const,
      damping: 18,
      stiffness: 300,
      delay: 0,
    };
  }

  if (!card.faceUp) {
    // Card back - minimalist pattern
    return (
      <motion.div
        initial={{ opacity: 0, y: -20, rotateZ: -2 }}
        animate={{ opacity: 1, y: 0, rotateZ: 0 }}
        transition={animationConfig}
        style={{ width, height }}
        className={`
          relative rounded-lg border border-paper-300
          bg-paper-200 overflow-hidden
          ${isCursor ? 'cursor-ring' : ''}
        `}
      >
        {/* Diagonal stripe pattern for card back */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="diagonal-stripes"
                patternUnits="userSpaceOnUse"
                width="8"
                height="8"
                patternTransform="rotate(45)"
              >
                <rect width="4" height="8" fill="var(--ink-700)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonal-stripes)" />
          </svg>
        </div>

        {/* Japanese character logo (安 - relax) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="rounded-full border border-accent-gold border-opacity-40 flex items-center justify-center"
            style={{ 
              width: Math.max(24, width * 0.35),
              height: Math.max(24, width * 0.35),
              backgroundColor: 'rgba(255, 255, 255, 0.5)', // White background at 50% opacity
            }}
          >
            <span 
              className="text-accent-gold font-light" 
              style={{ 
                fontFamily: "'Noto Serif JP', serif",
                fontSize: Math.max(14, width * 0.20), // Reduced from 0.25 to 0.20
                opacity: 0.9,
              }}
            >
              安
            </span>
          </div>
        </div>

        {/* Subtle inner border */}
        <div className="absolute inset-2 rounded border border-paper-300 opacity-40" />
      </motion.div>
    );
  }

  // Face-up card
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, rotateZ: -2 }}
      animate={{ 
        opacity: 1, 
        y: isSelected ? -8 : 0,
        rotateZ: 0 
      }}
      transition={animationConfig}
      whileHover={{ y: -4 }}
      style={{ width, height }}
      className={`
        relative rounded-lg border border-paper-300
        bg-paper-100 overflow-hidden
        ${isCursor && !isSelected ? 'cursor-ring' : ''}
        ${isSelected ? 'selected-ring' : ''}
        ${isHighlight ? 'ring-2 ring-accent-gold ring-offset-2 ring-offset-felt-base animate-pulse' : ''}
      `}
    >
      {/* Ace - special centered layout */}
      {card.rank === 1 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-6xl font-serif ${suitColor}`}>
            {suitSymbol}
          </span>
        </div>
      )}

      {/* Number cards (2-10) - large centered suit symbol */}
      {card.rank >= 2 && card.rank <= 10 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-5xl font-serif ${suitColor}`}>
            {suitSymbol}
          </span>
        </div>
      )}

      {/* Face cards (J, Q, K) - centered suit with label */}
      {card.rank >= 11 && card.rank <= 13 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-5xl font-serif ${suitColor}`}>
            {suitSymbol}
          </span>
        </div>
      )}

      {/* Top-left corner: rank + suit */}
      <div className={`absolute top-2 left-2 flex flex-col items-center ${suitColor}`}>
        <span className="text-sm font-mono font-bold tracking-ui leading-none">
          {rankLabel}
        </span>
        <span className="text-xs leading-none mt-0.5">
          {suitSymbol}
        </span>
      </div>

      {/* Bottom-right corner: rank + suit (rotated) */}
      <div 
        className={`absolute bottom-2 right-2 flex flex-col items-center ${suitColor}`}
        style={{ transform: 'rotate(180deg)' }}
      >
        <span className="text-sm font-mono font-bold tracking-ui leading-none">
          {rankLabel}
        </span>
        <span className="text-xs leading-none mt-0.5">
          {suitSymbol}
        </span>
      </div>

      {/* Subtle inner border for depth */}
      <div className="absolute inset-0 rounded-lg border border-ink-900 opacity-5 pointer-events-none" />
    </motion.div>
  );
};
