/**
 * Dobble / Spot it! Algorithm
 * Based on Finite Projective Planes of order n (where n is prime).
 *
 * For a prime n:
 *   - Each card has (n + 1) symbols
 *   - Total cards = n² + n + 1
 *   - Total unique symbols = n² + n + 1
 *   - Any two cards share exactly one symbol
 */

/**
 * Generates a Dobble deck using finite projective plane construction.
 * @param {number} n - A prime number (2, 3, 5, or 7)
 * @returns {number[][]} Array of cards, each card is an array of symbol IDs (0-indexed)
 */
function generateDobbleDeck(n) {
    const totalCards = n * n + n + 1;
    const cards = [];

    // Card type 1: The first card contains symbols 0 through n
    // This card has symbols: [0, 1, 2, ..., n]
    const firstCard = [];
    for (let i = 0; i <= n; i++) {
        firstCard.push(i);
    }
    cards.push(firstCard);

    // Card type 2: n cards that share symbol 0 with the first card
    // For each i in [0, n-1]:
    //   Card contains: symbol 0, and symbols (n+1 + i*n + j) for j in [0, n-1]
    for (let i = 0; i < n; i++) {
        const card = [0];
        for (let j = 0; j < n; j++) {
            card.push(n + 1 + i * n + j);
        }
        cards.push(card);
    }

    // Card type 3: n² cards
    // For each i in [0, n-1], j in [0, n-1]:
    //   Card contains: symbol (i+1), then for each k in [0, n-1]:
    //     symbol (n+1 + k*n + ((i*k + j) mod n))
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const card = [i + 1];
            for (let k = 0; k < n; k++) {
                card.push(n + 1 + k * n + ((i * k + j) % n));
            }
            cards.push(card);
        }
    }

    return cards;
}

/**
 * Validates a generated deck: every pair of cards must share exactly one symbol.
 * @param {number[][]} deck
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateDeck(deck) {
    const errors = [];
    for (let i = 0; i < deck.length; i++) {
        for (let j = i + 1; j < deck.length; j++) {
            const shared = deck[i].filter(s => deck[j].includes(s));
            if (shared.length !== 1) {
                errors.push(`Cards ${i} and ${j} share ${shared.length} symbols: [${shared}]`);
            }
        }
    }
    return { valid: errors.length === 0, errors };
}

/**
 * Returns info about a variant.
 * @param {number} n - prime order (2, 3, 5, 7)
 */
function getVariantInfo(n) {
    const symbolsPerCard = n + 1;
    const totalCards = n * n + n + 1;
    const totalSymbols = totalCards; // same as total cards in projective plane
    return { n, symbolsPerCard, totalCards, totalSymbols };
}
