import type { Card } from './types';
import { findFoundationForCard } from './gameLogic';

/**
 * Auto-reveal the top card of a tableau column if it's face-down
 * Returns true if a card was revealed
 */
export function autoRevealColumn(column: Card[]): boolean {
  if (column.length === 0) {
    return false;
  }
  
  const topCard = column[column.length - 1];
  
  if (!topCard.faceUp) {
    topCard.faceUp = true;
    return true;
  }
  
  return false;
}

/**
 * Auto-place Aces to foundations
 * This runs automatically after certain moves
 * Returns true if any Aces were placed
 */
export function aceAutoPlace(
  waste: Card[],
  tableau: Card[][],
  foundations: Card[][]
): boolean {
  let placedAny = false;
  let placedThisLoop = true;
  
  // Keep trying until no more Aces can be placed
  while (placedThisLoop) {
    placedThisLoop = false;
    
    // Check waste for Ace
    if (waste.length > 0) {
      const wasteTop = waste[waste.length - 1];
      if (wasteTop.rank === 1) {
        // Find empty foundation slot
        const emptyFoundation = foundations.findIndex(f => f.length === 0);
        if (emptyFoundation >= 0) {
          const ace = waste.pop()!;
          ace.faceUp = true;
          foundations[emptyFoundation].push(ace);
          placedThisLoop = true;
          placedAny = true;
          continue;
        }
      }
    }
    
    // Check tableau columns for Aces
    for (let col = 0; col < 7; col++) {
      const column = tableau[col];
      if (column.length === 0) continue;
      
      const topCard = column[column.length - 1];
      if (topCard.faceUp && topCard.rank === 1) {
        // Find empty foundation slot
        const emptyFoundation = foundations.findIndex(f => f.length === 0);
        if (emptyFoundation >= 0) {
          const ace = column.pop()!;
          foundations[emptyFoundation].push(ace);
          autoRevealColumn(column);
          placedThisLoop = true;
          placedAny = true;
          break; // Start over from waste
        }
      }
    }
  }
  
  return placedAny;
}

/**
 * Check if autocomplete is possible
 * (All cards can be automatically moved to foundations)
 */
export function canAutocomplete(
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

export function getAutocompleteMoves(
  waste: Card[],
  tableau: Card[][],
  foundations: Card[][]
): Array<{ zone: 'waste' | 'tableau'; col: number; fi: number }> {
  const moves: Array<{ zone: 'waste' | 'tableau'; col: number; fi: number }> = [];
  
  // Check waste
  if (waste.length > 0) {
    const card = waste[waste.length - 1];
    const fi = findFoundationForCard(card, foundations);
    if (fi >= 0) {
      moves.push({ zone: 'waste', col: -1, fi });
    }
  }
  
  // Check tableau
  for (let col = 0; col < 7; col++) {
    const column = tableau[col];
    if (column.length === 0) continue;
    
    const card = column[column.length - 1];
    if (!card.faceUp) continue;
    
    const fi = findFoundationForCard(card, foundations);
    if (fi >= 0) {
      moves.push({ zone: 'tableau', col, fi });
    }
  }
  
  return moves;
}
