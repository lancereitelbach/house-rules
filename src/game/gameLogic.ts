import type { Card } from './types';

/**
 * Check if a card can be placed on a tableau column
 * Rules: Descending rank, alternating color, Kings to empty
 */
export function canPlaceOnTableau(card: Card, destColumn: Card[]): boolean {
  // Empty column - only Kings allowed
  if (destColumn.length === 0) {
    return card.rank === 13;
  }
  
  const topCard = destColumn[destColumn.length - 1];
  
  // Must be face-up
  if (!topCard.faceUp) {
    return false;
  }
  
  // Must be descending rank (card.rank = topCard.rank - 1)
  // Must be alternating color
  return (
    topCard.rank === card.rank + 1 &&
    topCard.color !== card.color
  );
}

/**
 * Check if a card can be placed on a foundation
 * Rules: Aces start, suit match, rank sequential
 */
export function canPlaceOnFoundation(card: Card, foundation: Card[]): boolean {
  // Empty foundation - only Aces allowed
  if (foundation.length === 0) {
    return card.rank === 1;
  }
  
  const topCard = foundation[foundation.length - 1];
  
  // Must be same suit and next rank (card.rank = topCard.rank + 1)
  return (
    topCard.suit === card.suit &&
    card.rank === topCard.rank + 1
  );
}

/**
 * Find which foundation (if any) can accept this card
 * Returns foundation index (0-3) or -1 if none
 */
export function findFoundationForCard(card: Card, foundations: Card[][]): number {
  for (let i = 0; i < 4; i++) {
    if (canPlaceOnFoundation(card, foundations[i])) {
      return i;
    }
  }
  return -1;
}

/**
 * Check if a sequence of cards is valid for moving together
 * (descending rank, alternating color)
 */
export function isValidSequence(cards: Card[]): boolean {
  if (cards.length === 0) return false;
  if (cards.length === 1) return cards[0].faceUp;
  
  for (let i = 0; i < cards.length - 1; i++) {
    const current = cards[i];
    const next = cards[i + 1];
    
    if (!current.faceUp || !next.faceUp) {
      return false;
    }
    
    if (current.rank !== next.rank + 1 || current.color === next.color) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check win condition
 * Rules: Stock empty + Waste empty + All tableau cards face-up
 */
export function checkWinCondition(
  stock: Card[],
  waste: Card[],
  tableau: Card[][]
): boolean {
  // Stock and waste must be empty
  if (stock.length > 0 || waste.length > 0) {
    return false;
  }
  
  // All tableau cards must be face-up
  for (const column of tableau) {
    for (const card of column) {
      if (!card.faceUp) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Get the longest valid sequence from a given position in a tableau column
 */
export function getValidSequence(column: Card[], startRow: number): Card[] {
  if (startRow >= column.length || !column[startRow].faceUp) {
    return [];
  }
  
  const sequence: Card[] = [column[startRow]];
  
  for (let i = startRow + 1; i < column.length; i++) {
    const prev = column[i - 1];
    const curr = column[i];
    
    if (!curr.faceUp || curr.rank !== prev.rank - 1 || curr.color === prev.color) {
      break;
    }
    
    sequence.push(curr);
  }
  
  return sequence;
}
