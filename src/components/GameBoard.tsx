import { Card } from './Card';
import { useGameState } from '../hooks/useGameState';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const GameBoard: React.FC = () => {
  const {
    stock,
    waste,
    foundations,
    tableau,
    cursor,
    selection,
    highlights,
    drawCount,
    stats,
  } = useGameState();
  
  const [isShuffling, setIsShuffling] = useState(false);
  const [wasteCardKey, setWasteCardKey] = useState(0);
  const prevStockLengthRef = useRef(stock.length);
  const prevWasteLengthRef = useRef(waste.length);
  
  // Detect recycle (stock length increases from 0)
  useEffect(() => {
    if (prevStockLengthRef.current === 0 && stock.length > 0) {
      setIsShuffling(true);
      setTimeout(() => setIsShuffling(false), 400);
    }
    prevStockLengthRef.current = stock.length;
  }, [stock.length]);
  
  // Detect new cards drawn to waste
  useEffect(() => {
    if (waste.length > prevWasteLengthRef.current) {
      // New card(s) drawn - trigger animation
      setWasteCardKey(prev => prev + 1);
    }
    prevWasteLengthRef.current = waste.length;
  }, [waste.length]);

  // Layout calculations
  const cardWidth = 96;
  const cardHeight = 136;
  const gap = 16;
  const topPadding = 48;
  const tableauTopMargin = 180;
  const statusBarHeight = 60; // Status bar at bottom
  const bottomPadding = 24;

  // Calculate dynamic overlap based on tallest column
  const calculateDynamicOverlap = () => {
    const availableHeight = window.innerHeight - tableauTopMargin - cardHeight - statusBarHeight - bottomPadding;
    
    // Find tallest column
    let maxFaceDownCards = 0;
    let maxFaceUpCards = 0;
    
    tableau.forEach(col => {
      const faceDownCount = col.filter(c => !c.faceUp).length;
      const faceUpCount = col.filter(c => c.faceUp).length;
      maxFaceDownCards = Math.max(maxFaceDownCards, faceDownCount);
      maxFaceUpCards = Math.max(maxFaceUpCards, faceUpCount);
    });
    
    // Default overlap values
    const defaultFaceDownOverlap = 12;
    const defaultFaceUpOverlap = 32;
    
    // Calculate minimum overlap needed to fit
    const spaceForFaceDown = maxFaceDownCards * defaultFaceDownOverlap;
    const spaceForFaceUp = (maxFaceUpCards - 1) * defaultFaceUpOverlap; // -1 because last card doesn't overlap
    const totalNeededSpace = spaceForFaceDown + spaceForFaceUp;
    
    if (totalNeededSpace > availableHeight) {
      // Need to squeeze - calculate tighter overlap
      const totalCards = maxFaceDownCards + maxFaceUpCards - 1;
      const squeezedOverlap = Math.max(8, Math.floor(availableHeight / totalCards));
      
      return {
        faceDownOverlap: squeezedOverlap,
        faceUpOverlap: squeezedOverlap,
      };
    }
    
    return {
      faceDownOverlap: defaultFaceDownOverlap,
      faceUpOverlap: defaultFaceUpOverlap,
    };
  };
  
  const { faceDownOverlap, faceUpOverlap } = calculateDynamicOverlap();

  // Check if cursor is on a specific card
  const isCursorOn = (zone: string, col: number, row?: number | null) => {
    if (cursor.zone !== zone) return false;
    if (cursor.col !== col) return false;
    if (row !== undefined && row !== null && cursor.row !== row) return false;
    if (zone !== 'tableau' && cursor.row !== null) return false;
    return true;
  };

  // Check if card is selected
  const isCardSelected = (zone: string, col: number, row?: number) => {
    if (!selection || selection.zone !== zone || selection.col !== col) return false;
    if (row !== undefined) {
      return row >= selection.row;
    }
    return true;
  };

  // Check if position is highlighted
  const isHighlighted = (type: 'foundation' | 'tableau', idx: number) => {
    return highlights.some(h => h.type === type && (h.idx === idx || h.col === idx));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Top row: Stock, Waste, Spacer, Foundations */}
      <div className="absolute top-0 left-0 right-0" style={{ paddingTop: topPadding, paddingLeft: gap * 2, paddingRight: gap * 2 }}>
        <div className="flex items-start justify-between max-w-7xl mx-auto">
          {/* Left side: Stock & Waste */}
          <div className="flex items-start gap-4">
            {/* Stock */}
            <div className="relative" style={{ width: cardWidth, height: cardHeight }}>
              {stock.length > 0 ? (
                <motion.div 
                  className="relative"
                  animate={{ rotateZ: isShuffling ? 360 : 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <Card
                    card={stock[stock.length - 1]}
                    isCursor={isCursorOn('stock', -1)}
                  />
                  {/* Stock count */}
                  <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className="text-xs font-mono text-paper-100 opacity-60 tracking-ui">
                      {stock.length}
                    </span>
                  </div>
                </motion.div>
              ) : (
                /* Empty stock slot */
                <div
                  className={`w-full h-full rounded-lg border border-paper-300 border-opacity-30 bg-felt-dark bg-opacity-20 ${
                    isCursorOn('stock', -1) ? 'cursor-ring' : ''
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-paper-300 opacity-20 text-2xl">↻</span>
                  </div>
                </div>
              )}
            </div>

            {/* Waste */}
            <div className="relative" style={{ width: cardWidth + (drawCount === 3 ? 40 : 0), height: cardHeight }}>
              {waste.length > 0 ? (
                <div className="relative">
                  {/* Show last 3 cards if draw-3, or just last card if draw-1 */}
                  {drawCount === 3 && waste.length >= 3 && (
                    <>
                      <motion.div 
                        key={`waste-${wasteCardKey}-2`}
                        className="absolute" 
                        style={{ left: 0, top: 0 }}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                      >
                        <Card card={waste[waste.length - 3]} width={cardWidth} height={cardHeight} />
                      </motion.div>
                      <motion.div 
                        key={`waste-${wasteCardKey}-1`}
                        className="absolute" 
                        style={{ left: 20, top: 0 }}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.15, ease: 'easeOut', delay: 0.05 }}
                      >
                        <Card card={waste[waste.length - 2]} width={cardWidth} height={cardHeight} />
                      </motion.div>
                    </>
                  )}
                  {drawCount === 3 && waste.length === 2 && (
                    <motion.div 
                      key={`waste-${wasteCardKey}-1`}
                      className="absolute" 
                      style={{ left: 0, top: 0 }}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                    >
                      <Card card={waste[waste.length - 2]} width={cardWidth} height={cardHeight} />
                    </motion.div>
                  )}
                  <motion.div 
                    key={`waste-${wasteCardKey}-0`}
                    className="absolute" 
                    style={{ left: drawCount === 3 && waste.length >= 2 ? 40 : 0, top: 0 }}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.15, ease: 'easeOut', delay: drawCount === 3 ? 0.1 : 0 }}
                  >
                    <Card
                      card={waste[waste.length - 1]}
                      isCursor={isCursorOn('waste', -1)}
                      isSelected={isCardSelected('waste', -1)}
                      width={cardWidth}
                      height={cardHeight}
                    />
                  </motion.div>
                </div>
              ) : (
                /* Empty waste slot */
                <div
                  className={`w-full h-full rounded-lg border border-paper-300 border-opacity-20 bg-felt-dark bg-opacity-10 ${
                    isCursorOn('waste', -1) ? 'cursor-ring' : ''
                  }`}
                />
              )}
            </div>
          </div>

          {/* Right side: Foundations */}
          <div className="flex items-start gap-3">
            {foundations.map((foundation, idx) => (
              <div key={idx} className="relative" style={{ width: cardWidth, height: cardHeight }}>
                {foundation.length > 0 ? (
                  <Card
                    card={foundation[foundation.length - 1]}
                    isCursor={isCursorOn('foundation', idx)}
                    isSelected={isCardSelected('foundation', idx)}
                    isHighlight={isHighlighted('foundation', idx)}
                  />
                ) : (
                  /* Empty foundation slot with suit symbol */
                  <div
                    className={`w-full h-full rounded-lg border border-paper-300 border-opacity-30 bg-felt-dark bg-opacity-20 relative ${
                      isCursorOn('foundation', idx) ? 'cursor-ring' : ''
                    } ${isHighlighted('foundation', idx) ? 'ring-2 ring-accent-gold ring-offset-2 ring-offset-felt-base animate-pulse' : ''}`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border border-paper-300 border-opacity-20 flex items-center justify-center">
                        <span className="text-3xl opacity-20 text-paper-300">
                          {idx === 0 ? '♥' : idx === 1 ? '♦' : idx === 2 ? '♣' : '♠'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau columns */}
      <div className="absolute left-0 right-0" style={{ top: tableauTopMargin, paddingLeft: gap * 2, paddingRight: gap * 2 }}>
        <div className="flex items-start justify-center gap-4 max-w-7xl mx-auto">
          {tableau.map((column, colIdx) => (
            <div key={colIdx} className="relative" style={{ width: cardWidth }}>
              {/* Empty column slot */}
              {column.length === 0 ? (
                <div
                  className={`w-full rounded-lg border border-paper-300 border-opacity-20 bg-felt-dark bg-opacity-10 ${
                    isCursorOn('tableau', colIdx, null) ? 'cursor-ring' : ''
                  } ${isHighlighted('tableau', colIdx) ? 'ring-2 ring-accent-gold ring-offset-2 ring-offset-felt-base animate-pulse' : ''}`}
                  style={{ height: 48 }}
                />
              ) : (
                /* Render cards with overlap */
                column.map((card, rowIdx) => {
                  const isLast = rowIdx === column.length - 1;
                  let offsetY = 0;
                  
                  // Calculate Y offset based on face-up/down
                  for (let i = 0; i < rowIdx; i++) {
                    offsetY += column[i].faceUp ? faceUpOverlap : faceDownOverlap;
                  }

                  // Calculate deal index for stagger animation
                  // Cards are dealt column by column: col 0 gets 1 card, col 1 gets 2, etc.
                  let dealIndex = 0;
                  for (let c = 0; c < colIdx; c++) {
                    dealIndex += c + 1; // Sum: 1 + 2 + 3 + ... + colIdx
                  }
                  dealIndex += rowIdx; // Add row position within this column

                  return (
                    <div
                      key={rowIdx}
                      className="absolute"
                      style={{
                        top: offsetY,
                        left: 0,
                        zIndex: rowIdx,
                      }}
                    >
                      <Card
                        card={card}
                        isCursor={!isCardSelected('tableau', colIdx, rowIdx) && isCursorOn('tableau', colIdx, rowIdx)}
                        isSelected={isCardSelected('tableau', colIdx, rowIdx)}
                        isHighlight={isLast && isHighlighted('tableau', colIdx)}
                        dealIndex={dealIndex}
                      />
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 pb-6 px-8">
        <div className="max-w-2xl mx-auto bg-ink-900 bg-opacity-80 backdrop-blur-sm rounded-2xl border border-paper-300 border-opacity-10 px-6 py-3">
          <div className="flex items-center justify-between text-xs font-mono tracking-ui">
            <div className="text-ink-500 uppercase">
              {stats.currentGameMoves} moves
            </div>
            <div className="text-paper-300">
              {stats.currentGameStartTime && (() => {
                const endTime = stats.currentGameFrozenTime || Date.now();
                const elapsed = endTime - stats.currentGameStartTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
              })()}
            </div>
            <div className="text-ink-500 uppercase">
              Draw {drawCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
