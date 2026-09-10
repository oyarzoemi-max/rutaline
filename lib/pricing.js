export const MIN_STARTING_BID_CENTS = 1000; // $10.00
export const MIN_RAISE_CENTS = 500;          // hay que superar por al menos $5
export const FOUNDER_LIMIT = 10;             // primeros 10 por categoría+destino
export const LISTING_DURATION_DAYS = 30;

// Dado el listado que ya ocupa la posición más alta, calcula cuál es
// la oferta mínima válida para tomar el primer puesto.
export function nextMinimumBid(currentTopBidCents) {
  if (!currentTopBidCents || currentTopBidCents === 0) {
    return MIN_STARTING_BID_CENTS;
  }
  return currentTopBidCents + MIN_RAISE_CENTS;
}
