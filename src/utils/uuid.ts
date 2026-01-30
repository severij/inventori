/**
 * Generate a UUID v4 using the Web Crypto API.
 * Used for entity IDs to ensure compatibility with future QR codes and P2P sync.
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
