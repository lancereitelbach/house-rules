import { useEffect } from 'react';
import { useGameState } from './useGameState';
import { COL_KEYS, FOUND_KEYS } from '../game/constants';
import type { QAmbiguityEntry } from '../game/types';

export const useKeyboard = () => {
  const {
    screen,
    mode,
    cursor,
    selection,
    drawFromStock,
    moveCursor,
    jumpToColumn,
    cycleZone,
    selectCard,
    clearSelection,
    autoPlace,
    reverseAutoPlace,
    sweep,
    undo,
    goToStart,
    goToGame,
    goToMenu,
    setScreen,
    setMenuSelection,
    menuSel,
    dealGame,
    startDrawSel,
    setDrawMode,
    recordWin,
  } = useGameState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const shift = e.shiftKey;

      // Help screen - any key dismisses
      if (screen === 'help') {
        setScreen('start');
        return;
      }

      // Start screen
      if (screen === 'start') {
        if (key === 's' || key === 'arrowleft') {
          setDrawMode(1);
        } else if (key === 'f' || key === 'arrowright') {
          setDrawMode(3);
        } else if (key === ' ' || key === 'enter') {
          e.preventDefault();
          dealGame(startDrawSel);
        } else if (key === 'n') {
          dealGame(startDrawSel);
        } else if (key === '?' || key === 'h' || key === 'escape') {
          setScreen('help');
        }
        return;
      }

      // Menu screen
      if (screen === 'menu') {
        if (key === 'w' || key === 'arrowup') {
          setMenuSelection((menuSel - 1 + 3) % 3);
        } else if (key === 's' || key === 'arrowdown') {
          setMenuSelection((menuSel + 1) % 3);
        } else if (key === ' ' || key === 'enter') {
          e.preventDefault();
          if (menuSel === 0) goToGame();
          else if (menuSel === 1) goToStart();
          else if (menuSel === 2) setScreen('help');
        } else if (key === 'escape') {
          goToGame();
        }
        return;
      }

      // Win screen
      if (screen === 'win') {
        if (key === ' ' || key === 'enter') {
          e.preventDefault();
          recordWin();
          dealGame(startDrawSel);
        } else if (key === 'escape') {
          recordWin();
          goToStart();
        }
        return;
      }

      // Game screen
      if (screen === 'game') {
        // Handle ambiguity modes (A key, Q key)
        if (mode === 'ambiguity_a' || mode === 'ambiguity_q_f' || mode === 'ambiguity_q_c') {
          // Cancel ambiguity
          if ((shift && key === ' ') || key === 'escape') {
            clearSelection();
            return;
          }
          
          const state = useGameState.getState();
          
          // Ambiguity A mode - select destination for auto-placed card
          if (mode === 'ambiguity_a') {
            const dests = state.ambiguityDests as { fds: number[]; tds: number[]; zone: string; col: number };
            
            // Foundation keys (1-4)
            if (key in FOUND_KEYS) {
              const fi = FOUND_KEYS[key as keyof typeof FOUND_KEYS];
              if (dests.fds.includes(fi)) {
                const { saveHistory, moveToFoundation, audioCallbacks } = state;
                saveHistory();
                moveToFoundation(dests.zone as any, dests.col, fi);
                audioCallbacks.foundationPlace?.();
                clearSelection();
              }
            }
            
            // Column keys (UIOP/JKL)
            if (key in COL_KEYS) {
              const col = COL_KEYS[key as keyof typeof COL_KEYS];
              if (dests.tds.includes(col)) {
                const { saveHistory, moveToTableau, audioCallbacks } = state;
                saveHistory();
                moveToTableau(dests.zone as any, dests.col, col);
                audioCallbacks.cardPlace?.();
                clearSelection();
              }
            }
          }
          
          // Ambiguity Q_F mode - select foundation to pull from
          else if (mode === 'ambiguity_q_f') {
            const eligible = state.ambiguityDests as Array<{ fi: number; card: any; tds: number[] }>;
            
            // Foundation keys (1-4)
            if (key in FOUND_KEYS) {
              const fi = FOUND_KEYS[key as keyof typeof FOUND_KEYS];
              const entry = eligible.find(e => e.fi === fi);
              
              if (entry) {
                if (entry.tds.length === 1) {
                  // Only one destination - execute immediately
                  const { saveHistory, moveToTableau, audioCallbacks } = state;
                  saveHistory();
                  moveToTableau('foundation', fi, entry.tds[0]);
                  audioCallbacks.cardPlace?.();
                  clearSelection();
                } else {
                  // Multiple destinations - enter second ambiguity mode
                  useGameState.setState({
                    mode: 'ambiguity_q_c',
                    ambiguityFoundIdx: fi,
                    ambiguityDests: entry as unknown as QAmbiguityEntry[],
                    highlights: entry.tds.map(c => ({ type: 'tableau' as const, col: c })),
                  });
                }
              }
            }
          }
          
          // Ambiguity Q_C mode - select tableau column destination
          else if (mode === 'ambiguity_q_c') {
            const entry = state.ambiguityDests as unknown as QAmbiguityEntry;
            const fi = state.ambiguityFoundIdx;
            
            // Column keys (UIOP/JKL)
            if (key in COL_KEYS) {
              const col = COL_KEYS[key as keyof typeof COL_KEYS];
              if (entry.tds.includes(col) && fi !== null) {
                const { saveHistory, moveToTableau, audioCallbacks } = state;
                saveHistory();
                moveToTableau('foundation', fi, col);
                audioCallbacks.cardPlace?.();
                clearSelection();
              }
            }
          }
          
          return;
        }

        // Escape - open menu
        if (key === 'escape') {
          goToMenu();
          return;
        }

        // Z - abandon game
        if (key === 'z') {
          e.preventDefault();
          goToStart();
          return;
        }

        // R - return to start
        if (key === 'r') {
          goToStart();
          return;
        }

        // C - undo
        if (key === 'c') {
          undo();
          return;
        }

        // Shift+Space - cancel selection
        if (shift && key === ' ') {
          e.preventDefault();
          clearSelection();
          return;
        }

        // Shift+A - sweep to foundations
        if (shift && key === 'a') {
          e.preventDefault();
          sweep();
          return;
        }

        // Tab - cycle zone
        if (key === 'tab') {
          e.preventDefault();
          cycleZone(shift ? -1 : 1);
          return;
        }

        // Arrow keys / WASD navigation
        if (key === 'w' || key === 'arrowup') {
          moveCursor('up');
          return;
        }
        if (key === 's' || key === 'arrowleft') {
          moveCursor('left');
          return;
        }
        if (key === 'd' || key === 'arrowdown') {
          moveCursor('down');
          return;
        }
        if (key === 'f' || key === 'arrowright') {
          moveCursor('right');
          return;
        }

        // E - draw from stock
        if (key === 'e') {
          drawFromStock();
          return;
        }

        // Q - reverse auto-place
        if (key === 'q') {
          reverseAutoPlace();
          return;
        }

        // A - auto-place
        if (key === 'a') {
          const cur = cursor;
          if (cur.zone === 'waste') {
            autoPlace('waste', -1);
          } else if (cur.zone === 'tableau') {
            autoPlace('tableau', cur.col);
          } else if (cur.zone === 'foundation') {
            autoPlace('foundation', cur.col);
          }
          return;
        }

        // Column jump keys (U I O P J K L)
        if (key in COL_KEYS) {
          const col = COL_KEYS[key as keyof typeof COL_KEYS];
          jumpToColumn(col);
          return;
        }

        // Foundation keys (1 2 3 4)
        if (key in FOUND_KEYS) {
          // TODO: Handle foundation selection
          return;
        }

        // Space/Enter - select or place card
        if (key === ' ' || key === 'enter') {
          e.preventDefault();
          if (mode === 'neutral') {
            selectCard();
          } else if (mode === 'selected') {
            const placeCard = useGameState.getState().placeCard;
            placeCard();
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    screen,
    mode,
    cursor,
    selection,
    menuSel,
    startDrawSel,
    drawFromStock,
    moveCursor,
    jumpToColumn,
    cycleZone,
    selectCard,
    clearSelection,
    autoPlace,
    reverseAutoPlace,
    sweep,
    undo,
    goToStart,
    goToGame,
    goToMenu,
    setScreen,
    setMenuSelection,
    dealGame,
    setDrawMode,
    recordWin,
  ]);
};
