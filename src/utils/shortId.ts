/**
 * ID utilities using Crockford's Base32 encoding.
 *
 * Crockford's Base32 is designed for human readability:
 * - Excludes confusable characters: I, L, O, U
 * - Case-insensitive
 * - Supports common substitutions (I→1, L→1, O→0)
 *
 * We generate 8-character IDs (40 bits = ~1 trillion combinations)
 * and display them as XXXX-XXXX for readability.
 */

// Crockford's Base32 alphabet (excludes I, L, O, U)
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

// Map for decoding - includes substitutions for commonly confused characters
const DECODE_MAP: Record<string, number> = {};
for (let i = 0; i < ALPHABET.length; i++) {
  DECODE_MAP[ALPHABET[i]] = i;
}
// Crockford substitutions
DECODE_MAP['I'] = 1; // I → 1
DECODE_MAP['L'] = 1; // L → 1
DECODE_MAP['O'] = 0; // O → 0

/**
 * Generate an 8-character Crockford Base32 ID.
 * Uses 5 random bytes (40 bits) encoded as 8 Base32 characters.
 */
export function generateId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return encodeCrockford(bytes);
}

/**
 * Encode bytes as Crockford Base32.
 * 5 bytes (40 bits) → 8 characters
 */
function encodeCrockford(bytes: Uint8Array): string {
  // Convert 5 bytes to a 40-bit number (as two parts to avoid overflow)
  // We'll process 5 bits at a time
  let result = '';

  // Combine bytes into bits and extract 5 bits at a time
  // 40 bits = 8 groups of 5 bits
  // JavaScript bitwise ops work on 32 bits, so we need BigInt for 40 bits
  const bigBits =
    (BigInt(bytes[0]) << 32n) |
    (BigInt(bytes[1]) << 24n) |
    (BigInt(bytes[2]) << 16n) |
    (BigInt(bytes[3]) << 8n) |
    BigInt(bytes[4]);

  for (let i = 7; i >= 0; i--) {
    const index = Number((bigBits >> BigInt(i * 5)) & 0x1fn);
    result += ALPHABET[index];
  }

  return result;
}

/**
 * Format an ID for display: "ABCDEFGH" → "ABCD-EFGH"
 */
export function formatShortId(id: string): string {
  if (id.length !== 8) return id;
  return `${id.slice(0, 4)}-${id.slice(4)}`;
}

/**
 * Normalize user input for ID lookup.
 * - Removes hyphens and spaces
 * - Converts to uppercase
 * - Applies Crockford substitutions (I→1, L→1, O→0)
 *
 * Returns the normalized 8-character string, or null if invalid.
 */
export function normalizeShortId(input: string): string | null {
  // Remove common separators
  const cleaned = input.replace(/[-\s]/g, '').toUpperCase();

  if (cleaned.length !== 8) {
    return null;
  }

  // Apply substitutions and validate
  let result = '';
  for (const char of cleaned) {
    if (char === 'I' || char === 'L') {
      result += '1';
    } else if (char === 'O') {
      result += '0';
    } else if (ALPHABET.includes(char)) {
      result += char;
    } else {
      return null; // Invalid character
    }
  }

  return result;
}

/**
 * Check if a string is a valid ID format.
 * Accepts both raw (ABCDEFGH) and formatted (ABCD-EFGH) forms.
 */
export function isValidShortId(input: string): boolean {
  return normalizeShortId(input) !== null;
}

/**
 * Check if a search query looks like it might be an ID.
 * Used to trigger exact-match ID search.
 */
export function looksLikeShortId(query: string): boolean {
  const cleaned = query.replace(/[-\s]/g, '');
  // Must be exactly 8 characters and all valid Base32 chars (including substitutable ones)
  if (cleaned.length !== 8) return false;

  const validChars = ALPHABET + 'ILO';
  for (const char of cleaned.toUpperCase()) {
    if (!validChars.includes(char)) {
      return false;
    }
  }
  return true;
}

/**
 * Generate a unique ID by checking for collisions.
 * Takes a callback that checks if an ID already exists.
 * Retries up to maxAttempts times if collision detected.
 */
export async function generateUniqueId(
  isCollision: (id: string) => Promise<boolean>,
  maxAttempts = 10
): Promise<string> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const id = generateId();
    const hasCollision = await isCollision(id);
    if (!hasCollision) {
      return id;
    }
    attempts++;
  }

  throw new Error('Failed to generate unique ID after multiple attempts');
}
