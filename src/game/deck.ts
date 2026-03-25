import type { Card } from './types';
import { SUITS, SUIT_COLOR } from './constants';

/**
 * Generate a full 52-card deck
 */
export function generateDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({
        suit,
        rank,
        color: SUIT_COLOR[suit],
        faceUp: false,
      });
    }
  }
  
  return deck;
}

/**
 * Fisher-Yates shuffle (in-place)
 */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Deep clone a card
 */
export function cloneCard(card: Card): Card {
  return { ...card };
}

/**
 * Deep clone an array of cards
 */
export function cloneCards(cards: Card[]): Card[] {
  return cards.map(cloneCard);
}
