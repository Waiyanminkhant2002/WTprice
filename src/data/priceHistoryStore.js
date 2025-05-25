import { writable } from "svelte/store";

// Structure:
// {
//   A: [{ timestamp: 1683200000000, highest: 98 }, ...],
//   B: [{ timestamp: 1683200200000, highest: 104 }, ...],
//   ...
// }
export const priceHistory = writable({});

/**
 * Update the price history for a given category.
 * @param {string} category - Category key like "A", "B", etc.
 * @param {Object} bestDeals - Object with tiers and best deal per tier
 */
export function logBestPrice(category, bestDeals) {
  const tiers = ["under25", "over25", "over50", "over90"];
  const currentTimestamp = Date.now();

  let maxPrice = -Infinity;
  for (const tier of tiers) {
    const deal = bestDeals[tier];
    if (deal && typeof deal[tier] === "number") {
      maxPrice = Math.max(maxPrice, deal[tier]);
    }
  }

  if (maxPrice === -Infinity) return; // No valid price to log

  priceHistory.update((history) => {
    if (!history[category]) {
      history[category] = [];
    }

    history[category].push({
      timestamp: currentTimestamp,
      highest: maxPrice,
    });

    return history;
  });
}
