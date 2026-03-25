// Suit definitions
export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export type Suit = typeof SUITS[number];

// Suit colors
export const SUIT_COLOR: Record<Suit, 'red' | 'black'> = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black',
};

// Suit symbols
export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

// Rank labels
export const RANK_LABELS: Record<number, string> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
};

// Column jump keys (U I O P J K L)
export const COL_KEYS: Record<string, number> = {
  u: 0,
  i: 1,
  o: 2,
  p: 3,
  j: 4,
  k: 5,
  l: 6,
};

// Foundation selection keys (1 2 3 4)
export const FOUND_KEYS: Record<string, number> = {
  '1': 0,
  '2': 1,
  '3': 2,
  '4': 3,
};

// Autocomplete timing
export const AUTOCOMPLETE_MS = 80;
