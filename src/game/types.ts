// Core card type
export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: number; // 1-13 (Ace to King)
  color: 'red' | 'black';
  faceUp: boolean;
}

// Game zones
export type Zone = 'stock' | 'waste' | 'tableau' | 'foundation';

// Cursor position
export interface Cursor {
  zone: Zone;
  col: number; // -1 for stock/waste, 0-3 for foundations, 0-6 for tableau
  row: number | null; // null for non-tableau zones or empty columns
}

// Selection state
export interface Selection {
  zone: Zone;
  col: number;
  row: number;
  cards: Card[];
}

// Highlight for ambiguity resolution
export interface Highlight {
  type: 'foundation' | 'tableau';
  idx?: number; // foundation index
  col?: number; // tableau column
}

// Game modes
export type GameMode = 
  | 'neutral' 
  | 'selected' 
  | 'ambiguity_a'       // A key ambiguity (multiple destinations)
  | 'ambiguity_q_f'     // Q key ambiguity (select foundation)
  | 'ambiguity_q_c';    // Q key ambiguity (select column)

// Screen states
export type Screen = 'start' | 'game' | 'menu' | 'help' | 'win';

// Ambiguity destinations for A key
export interface AmbiguityDests {
  fds: number[];     // foundation indices
  tds: number[];     // tableau columns
  zone: Zone;
  col: number;
}

// Ambiguity destinations for Q key
export interface QAmbiguityEntry {
  fi: number;        // foundation index
  card: Card;
  tds: number[];     // valid tableau destinations
}

// Game statistics
export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentGameMoves: number;
  currentGameStartTime: number | null;
  currentGameFrozenTime: number | null; // Timer frozen at this time (for autowin)
}

// History snapshot for undo
export interface HistorySnapshot {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
  cursor: Cursor;
  drawCount: 1 | 3;
}

// Complete game state
export interface GameState {
  // Card piles
  stock: Card[];
  waste: Card[];
  foundations: Card[][]; // 4 foundations
  tableau: Card[][];     // 7 columns
  
  // UI state
  screen: Screen;
  mode: GameMode;
  cursor: Cursor;
  selection: Selection | null;
  highlights: Highlight[];
  
  // Game settings
  drawCount: 1 | 3;
  
  // Ambiguity resolution state
  ambiguityDests: AmbiguityDests | QAmbiguityEntry[] | null;
  ambiguityFoundIdx: number | null;
  
  // History for undo
  history: HistorySnapshot[];
  
  // Statistics
  stats: GameStats;
  
  // UI flags
  startDrawSel: 1 | 3;
  menuSel: number;
}
