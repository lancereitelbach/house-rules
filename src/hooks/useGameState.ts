import { create } from 'zustand';
import type { GameState, Card, HistorySnapshot } from '../game/types';
import { generateDeck, shuffle, cloneCards } from '../game/deck';
import { 
  canPlaceOnTableau,
  canPlaceOnFoundation,
  findFoundationForCard,
  checkWinCondition,
  getValidSequence,
} from '../game/gameLogic';
import { autoRevealColumn, aceAutoPlace, getAutocompleteMoves } from '../game/autoLogic';
import { AUTOCOMPLETE_MS } from '../game/constants';

interface GameActions {
  // Screen management
  setScreen: (screen: GameState['screen']) => void;
  goToStart: () => void;
  goToGame: () => void;
  goToMenu: () => void;
  goToWin: () => void;
  
  // Game setup
  dealGame: (drawCount: 1 | 3) => void;
  setDrawMode: (mode: 1 | 3) => void;
  
  // Card operations
  drawFromStock: () => void;
  moveToFoundation: (srcZone: 'waste' | 'tableau' | 'foundation', srcCol: number, fi: number) => void;
  moveToTableau: (srcZone: 'waste' | 'tableau' | 'foundation', srcCol: number, destCol: number, cards?: Card[]) => void;
  
  // Selection
  selectCard: () => void;
  placeCard: () => void;
  clearSelection: () => void;
  
  // Auto operations
  autoPlace: (zone: 'waste' | 'tableau' | 'foundation', col: number) => void;
  reverseAutoPlace: () => void;
  sweep: () => void;
  startAutocomplete: () => void;
  
  // Cursor movement
  moveCursor: (direction: 'up' | 'down' | 'left' | 'right') => void;
  jumpToColumn: (col: number) => void;
  cycleZone: (direction: 1 | -1) => void;
  
  // History
  saveHistory: () => void;
  undo: () => void;
  
  // Stats
  incrementMoves: () => void;
  freezeTimer: () => void;
  recordWin: () => void;
  recordLoss: () => void;
  
  // Menu
  setMenuSelection: (index: number) => void;
  
  // Audio
  audioCallbacks: {
    cardPlace?: () => void;
    foundationPlace?: () => void;
    acePlace?: () => void;
    draw?: () => void;
    recycle?: () => void;
    error?: () => void;
    undo?: () => void;
    win?: () => void;
  };
  setAudioCallbacks: (callbacks: GameActions['audioCallbacks']) => void;
}

const initialState: Omit<GameState, keyof GameActions> = {
  stock: [],
  waste: [],
  foundations: [[], [], [], []],
  tableau: [[], [], [], [], [], [], []],
  
  screen: 'start',
  mode: 'neutral',
  cursor: { zone: 'stock', col: -1, row: null },
  selection: null,
  highlights: [],
  
  drawCount: 1,
  ambiguityDests: null,
  ambiguityFoundIdx: null,
  history: [],
  
  stats: {
    gamesPlayed: 0,
    gamesWon: 0,
    currentGameMoves: 0,
    currentGameStartTime: null,
    currentGameFrozenTime: null,
  },
  
  startDrawSel: 1,
  menuSel: 0,
};

export const useGameState = create<GameState & GameActions>((set, get) => ({
  ...initialState,
  audioCallbacks: {},
  
  // Audio
  setAudioCallbacks: (callbacks) => set({ audioCallbacks: callbacks }),
  
  // Screen management
  setScreen: (screen) => set({ screen }),
  
  goToStart: () => set({ 
    screen: 'start',
    mode: 'neutral',
    selection: null,
    highlights: [],
  }),
  
  goToGame: () => set({ screen: 'game' }),
  
  goToMenu: () => set({ 
    screen: 'menu',
    menuSel: 0,
  }),
  
  goToWin: () => {
    get().audioCallbacks.win?.(); // Play win fanfare
    set({ screen: 'win' });
  },
  
  // Game setup
  setDrawMode: (mode) => set({ startDrawSel: mode }),
  
  dealGame: (drawCount) => {
    const deck = shuffle(generateDeck());
    const tableau: Card[][] = [[], [], [], [], [], [], []];
    let deckIndex = 0;
    
    // Deal tableau (1 card to col 0, 2 to col 1, ..., 7 to col 6)
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        tableau[col].push({ ...deck[deckIndex++] });
      }
    }
    
    // Flip top card of each column
    for (let col = 0; col < 7; col++) {
      tableau[col][tableau[col].length - 1].faceUp = true;
    }
    
    // Remaining cards go to stock
    const stock = deck.slice(deckIndex).map(c => ({ ...c }));
    
    set({
      stock,
      waste: [],
      foundations: [[], [], [], []],
      tableau,
      drawCount,
      mode: 'neutral',
      cursor: { zone: 'stock', col: -1, row: null },
      selection: null,
      highlights: [],
      history: [],
      screen: 'game',
      stats: {
        ...get().stats,
        currentGameMoves: 0,
        currentGameStartTime: Date.now(),
      },
    });
    
    // Auto-place any Aces
    const state = get();
    const acesPlaced = aceAutoPlace(state.waste, state.tableau, state.foundations);
    if (acesPlaced) {
      state.audioCallbacks.acePlace?.();
    }
  },
  
  // Card operations
  drawFromStock: () => {
    const { stock, waste, drawCount } = get();
    
    if (stock.length === 0) {
      // Recycle: reverse waste to stock, face-down
      if (waste.length === 0) return;
      
      get().saveHistory();
      const newStock = [...waste].reverse().map(c => ({ ...c, faceUp: false }));
      set({ 
        stock: newStock, 
        waste: [],
        cursor: { zone: 'stock', col: -1, row: null },
      });
      get().incrementMoves();
      get().audioCallbacks.recycle?.(); // Play recycle sound
    } else {
      // Draw cards
      get().saveHistory();
      const toDraw = Math.min(drawCount, stock.length);
      const drawn = stock.slice(-toDraw).map(c => ({ ...c, faceUp: true }));
      const newStock = stock.slice(0, -toDraw);
      
      set({
        stock: newStock,
        waste: [...waste, ...drawn],
        cursor: { zone: 'waste', col: -1, row: null },
      });
      get().incrementMoves();
      get().audioCallbacks.draw?.(); // Play draw sound
      
      // Auto-place Aces
      const state = get();
      if (state.waste.length > 0 && state.waste[state.waste.length - 1].rank === 1) {
        const acesPlaced = aceAutoPlace(state.waste, state.tableau, state.foundations);
        if (acesPlaced) {
          state.audioCallbacks.acePlace?.();
        }
      }
    }
  },
  
  moveToFoundation: (srcZone, srcCol, fi) => {
    const { waste, tableau, foundations } = get();
    let card: Card;
    
    if (srcZone === 'waste') {
      card = waste.pop()!;
    } else if (srcZone === 'tableau') {
      card = tableau[srcCol].pop()!;
      autoRevealColumn(tableau[srcCol]);
      const acesPlaced = aceAutoPlace(waste, tableau, foundations);
      if (acesPlaced) {
        get().audioCallbacks.acePlace?.();
      }
    } else {
      card = foundations[srcCol].pop()!;
    }
    
    card.faceUp = true;
    foundations[fi].push(card);
    
    set({ 
      mode: 'neutral',
      selection: null,
      highlights: [],
      cursor: srcZone === 'tableau' 
        ? { zone: 'tableau', col: srcCol, row: tableau[srcCol].length > 0 ? tableau[srcCol].length - 1 : null }
        : get().cursor,
    });
    
    get().incrementMoves();
    
    // Check win condition
    if (checkWinCondition(get().stock, get().waste, get().tableau)) {
      get().freezeTimer(); // Stop timer before autocomplete begins
      setTimeout(() => get().startAutocomplete(), 300);
    }
  },
  
  moveToTableau: (srcZone, srcCol, destCol, cards) => {
    const { waste, tableau, foundations } = get();
    let moved: Card[];
    
    if (srcZone === 'waste') {
      moved = [waste.pop()!];
    } else if (srcZone === 'tableau') {
      if (cards) {
        moved = tableau[srcCol].splice(tableau[srcCol].length - cards.length);
      } else {
        moved = [tableau[srcCol].pop()!];
      }
      autoRevealColumn(tableau[srcCol]);
      const acesPlaced = aceAutoPlace(waste, tableau, foundations);
      if (acesPlaced) {
        get().audioCallbacks.acePlace?.();
      }
    } else {
      moved = [foundations[srcCol].pop()!];
    }
    
    moved.forEach(c => c.faceUp = true);
    tableau[destCol].push(...moved);
    
    set({
      mode: 'neutral',
      selection: null,
      highlights: [],
      cursor: { zone: 'tableau', col: destCol, row: tableau[destCol].length - 1 },
    });
    
    get().incrementMoves();
    
    // Check win condition
    if (checkWinCondition(get().stock, get().waste, get().tableau)) {
      get().freezeTimer(); // Stop timer before autocomplete begins
      setTimeout(() => get().startAutocomplete(), 300);
    }
  },
  
  // Selection
  selectCard: () => {
    const { cursor, tableau, waste, foundations } = get();
    
    if (cursor.zone === 'tableau') {
      const column = tableau[cursor.col];
      if (column.length === 0) return;
      
      const row = cursor.row !== null ? cursor.row : column.length - 1;
      const card = column[row];
      if (!card || !card.faceUp) return;
      
      const sequence = getValidSequence(column, row);
      
      set({
        selection: {
          zone: 'tableau',
          col: cursor.col,
          row,
          cards: sequence,
        },
        mode: 'selected',
      });
    } else if (cursor.zone === 'waste') {
      if (waste.length === 0) return;
      
      set({
        selection: {
          zone: 'waste',
          col: -1,
          row: waste.length - 1,
          cards: [waste[waste.length - 1]],
        },
        mode: 'selected',
      });
    } else if (cursor.zone === 'foundation') {
      const foundation = foundations[cursor.col];
      if (foundation.length === 0) return;
      
      set({
        selection: {
          zone: 'foundation',
          col: cursor.col,
          row: foundation.length - 1,
          cards: [foundation[foundation.length - 1]],
        },
        mode: 'selected',
      });
    }
  },
  
  placeCard: () => {
    const { cursor, selection, tableau, foundations } = get();
    if (!selection) return;
    
    // If cursor is on tableau
    if (cursor.zone === 'tableau') {
      // Same column - deselect
      if (selection.zone === 'tableau' && selection.col === cursor.col) {
        get().clearSelection();
        return;
      }
      
      const card = selection.cards[0];
      if (canPlaceOnTableau(card, tableau[cursor.col])) {
        get().saveHistory();
        get().moveToTableau(selection.zone, selection.col, cursor.col, selection.cards);
        get().audioCallbacks.cardPlace?.();
      } else {
        get().audioCallbacks.error?.();
      }
    }
    
    // If cursor is on foundation
    else if (cursor.zone === 'foundation') {
      // Can only place single cards on foundation
      if (selection.cards.length !== 1) {
        get().audioCallbacks.error?.();
        return;
      }
      
      const card = selection.cards[0];
      if (canPlaceOnFoundation(card, foundations[cursor.col])) {
        get().saveHistory();
        get().moveToFoundation(selection.zone, selection.col, cursor.col);
        get().audioCallbacks.foundationPlace?.();
      } else {
        get().audioCallbacks.error?.();
      }
    }
    
    // If cursor is on waste/stock - just clear selection
    else {
      get().clearSelection();
    }
  },
  
  clearSelection: () => set({ 
    mode: 'neutral',
    selection: null,
    highlights: [],
    ambiguityDests: null,
    ambiguityFoundIdx: null,
  }),
  
  // Auto operations
  autoPlace: (zone, col) => {
    const { waste, tableau, foundations } = get();
    let card: Card | null = null;
    
    // Get the card to auto-place
    if (zone === 'waste' && waste.length > 0) {
      card = waste[waste.length - 1];
    } else if (zone === 'tableau') {
      const column = tableau[col];
      if (column.length > 0 && column[column.length - 1].faceUp) {
        card = column[column.length - 1];
      }
    } else if (zone === 'foundation') {
      const foundation = foundations[col];
      if (foundation.length > 0) {
        card = foundation[foundation.length - 1];
      }
    }
    
    if (!card) {
      get().audioCallbacks.error?.();
      return;
    }
    
    // Find all valid destinations
    const fds: number[] = [];
    const tds: number[] = [];
    
    for (let i = 0; i < 4; i++) {
      if (canPlaceOnFoundation(card, foundations[i])) {
        fds.push(i);
      }
    }
    
    for (let c = 0; c < 7; c++) {
      if (zone === 'tableau' && c === col) continue;
      if (canPlaceOnTableau(card, tableau[c])) {
        tds.push(c);
      }
    }
    
    const total = fds.length + tds.length;
    
    if (total === 0) {
      get().audioCallbacks.error?.();
      return;
    }
    
    // Prefer foundation if only one exists
    if (fds.length >= 1 && tds.length === 0) {
      get().saveHistory();
      get().moveToFoundation(zone, col, fds[0]);
      get().audioCallbacks.foundationPlace?.();
      return;
    }
    
    // If only one tableau destination
    if (fds.length === 0 && tds.length === 1) {
      get().saveHistory();
      get().moveToTableau(zone, col, tds[0]);
      get().audioCallbacks.cardPlace?.();
      return;
    }
    
    // Multiple destinations - enter ambiguity mode
    set({
      mode: 'ambiguity_a',
      ambiguityDests: { fds, tds, zone, col },
      highlights: [
        ...fds.map(i => ({ type: 'foundation' as const, idx: i })),
        ...tds.map(c => ({ type: 'tableau' as const, col: c })),
      ],
    });
  },
  
  reverseAutoPlace: () => {
    const { foundations, tableau } = get();
    const eligible: Array<{ fi: number; card: Card; tds: number[] }> = [];
    
    // Find all foundations with cards that can move to tableau
    for (let fi = 0; fi < 4; fi++) {
      const foundation = foundations[fi];
      if (foundation.length === 0) continue;
      
      const card = foundation[foundation.length - 1];
      const tds: number[] = [];
      
      for (let c = 0; c < 7; c++) {
        if (canPlaceOnTableau(card, tableau[c])) {
          tds.push(c);
        }
      }
      
      if (tds.length > 0) {
        eligible.push({ fi, card, tds });
      }
    }
    
    if (eligible.length === 0) {
      get().audioCallbacks.error?.();
      return;
    }
    
    // If only one foundation with one destination
    if (eligible.length === 1 && eligible[0].tds.length === 1) {
      get().saveHistory();
      get().moveToTableau('foundation', eligible[0].fi, eligible[0].tds[0]);
      get().audioCallbacks.cardPlace?.();
      return;
    }
    
    // Multiple options - enter ambiguity mode
    set({
      mode: 'ambiguity_q_f',
      ambiguityDests: eligible,
      highlights: eligible.map(e => ({ type: 'foundation' as const, idx: e.fi })),
    });
  },
  
  sweep: () => {
    // Shift+A - sweep all eligible cards to foundations
    const { waste, tableau, foundations } = get();
    const moves = getAutocompleteMoves(waste, tableau, foundations);
    
    if (moves.length === 0) return;
    
    get().saveHistory();
    
    for (const move of moves) {
      get().moveToFoundation(move.zone, move.col, move.fi);
    }
  },
  
  startAutocomplete: () => {
    const autoStep = () => {
      const { waste, tableau, foundations } = get();
      const moves = getAutocompleteMoves(waste, tableau, foundations);
      
      if (moves.length > 0) {
        get().moveToFoundation(moves[0].zone, moves[0].col, moves[0].fi);
        setTimeout(autoStep, AUTOCOMPLETE_MS);
      } else {
        // Check if game is won
        const totalInFoundations = foundations.reduce((sum, f) => sum + f.length, 0);
        if (totalInFoundations === 52) {
          get().goToWin();
        }
      }
    };
    
    autoStep();
  },
  
  // Cursor movement
  moveCursor: (direction) => {
    const { cursor, tableau, selection, mode } = get();
    
    if (direction === 'up' && cursor.zone === 'tableau') {
      const column = tableau[cursor.col];
      const row = cursor.row !== null ? cursor.row : column.length - 1;
      
      if (row > 0 && column[row - 1] && column[row - 1].faceUp) {
        set({ cursor: { ...cursor, row: row - 1 } });
        
        // Extend selection if in selected mode
        if (mode === 'selected' && selection?.zone === 'tableau' && selection.col === cursor.col) {
          const newRow = selection.row - 1;
          if (newRow >= 0 && column[newRow]?.faceUp) {
            const newSequence = getValidSequence(column, newRow);
            set({
              selection: {
                ...selection,
                row: newRow,
                cards: newSequence,
              },
            });
          }
        }
      }
    } else if (direction === 'down' && cursor.zone === 'tableau') {
      const column = tableau[cursor.col];
      const row = cursor.row !== null ? cursor.row : column.length - 1;
      
      if (row < column.length - 1) {
        set({ cursor: { ...cursor, row: row + 1 } });
        
        // Shrink selection if in selected mode
        if (mode === 'selected' && selection?.zone === 'tableau' && selection.col === cursor.col && selection.cards.length > 1) {
          set({
            selection: {
              ...selection,
              row: selection.row + 1,
              cards: selection.cards.slice(1),
            },
          });
        }
      }
    } else if (direction === 'left') {
      if (cursor.zone === 'tableau') {
        const newCol = (cursor.col - 1 + 7) % 7;
        const column = tableau[newCol];
        set({ cursor: { zone: 'tableau', col: newCol, row: column.length > 0 ? column.length - 1 : null } });
      } else if (cursor.zone === 'foundation') {
        set({ cursor: { zone: 'foundation', col: (cursor.col - 1 + 4) % 4, row: null } });
      } else if (cursor.zone === 'waste') {
        set({ cursor: { zone: 'stock', col: -1, row: null } });
      } else if (cursor.zone === 'stock') {
        set({ cursor: { zone: 'waste', col: -1, row: null } });
      }
    } else if (direction === 'right') {
      if (cursor.zone === 'tableau') {
        const newCol = (cursor.col + 1) % 7;
        const column = tableau[newCol];
        set({ cursor: { zone: 'tableau', col: newCol, row: column.length > 0 ? column.length - 1 : null } });
      } else if (cursor.zone === 'foundation') {
        set({ cursor: { zone: 'foundation', col: (cursor.col + 1) % 4, row: null } });
      } else if (cursor.zone === 'waste') {
        set({ cursor: { zone: 'stock', col: -1, row: null } });
      } else if (cursor.zone === 'stock') {
        set({ cursor: { zone: 'waste', col: -1, row: null } });
      }
    }
  },
  
  jumpToColumn: (col) => {
    const { tableau } = get();
    const column = tableau[col];
    set({ 
      cursor: { 
        zone: 'tableau', 
        col, 
        row: column.length > 0 ? column.length - 1 : null 
      } 
    });
  },
  
  cycleZone: (direction) => {
    const zones: Array<'tableau' | 'waste' | 'foundation'> = ['tableau', 'waste', 'foundation'];
    const { cursor, tableau } = get();
    const currentZone = cursor.zone === 'stock' ? 'waste' : cursor.zone;
    const currentIndex = zones.indexOf(currentZone as any);
    const nextIndex = (currentIndex + direction + 3) % 3;
    const nextZone = zones[nextIndex];
    
    if (nextZone === 'tableau') {
      const column = tableau[0];
      set({ cursor: { zone: 'tableau', col: 0, row: column.length > 0 ? column.length - 1 : null } });
    } else if (nextZone === 'waste') {
      set({ cursor: { zone: get().waste.length > 0 ? 'waste' : 'stock', col: -1, row: null } });
    } else {
      set({ cursor: { zone: 'foundation', col: 0, row: null } });
    }
  },
  
  // History
  saveHistory: () => {
    const { stock, waste, foundations, tableau, cursor, drawCount } = get();
    
    const snapshot: HistorySnapshot = {
      stock: cloneCards(stock),
      waste: cloneCards(waste),
      foundations: foundations.map(f => cloneCards(f)),
      tableau: tableau.map(col => cloneCards(col)),
      cursor: { ...cursor },
      drawCount,
    };
    
    set({ history: [...get().history, snapshot] });
  },
  
  undo: () => {
    const { history } = get();
    if (history.length === 0) return;
    
    const snapshot = history[history.length - 1];
    
    set({
      stock: snapshot.stock,
      waste: snapshot.waste,
      foundations: snapshot.foundations,
      tableau: snapshot.tableau,
      cursor: snapshot.cursor,
      drawCount: snapshot.drawCount,
      mode: 'neutral',
      selection: null,
      highlights: [],
      ambiguityDests: null,
      ambiguityFoundIdx: null,
      history: history.slice(0, -1),
    });
    
    get().audioCallbacks.undo?.(); // Play undo sound
  },
  
  // Stats
  incrementMoves: () => set(state => ({
    stats: {
      ...state.stats,
      currentGameMoves: state.stats.currentGameMoves + 1,
    },
  })),
  
  freezeTimer: () => set(state => ({
    stats: {
      ...state.stats,
      currentGameFrozenTime: Date.now(),
    },
  })),
  
  recordWin: () => set(state => ({
    stats: {
      ...state.stats,
      gamesWon: state.stats.gamesWon + 1,
      gamesPlayed: state.stats.gamesPlayed + 1,
    },
  })),
  
  recordLoss: () => set(state => ({
    stats: {
      ...state.stats,
      gamesPlayed: state.stats.gamesPlayed + 1,
    },
  })),
  
  // Menu
  setMenuSelection: (index) => set({ menuSel: index }),
}));
