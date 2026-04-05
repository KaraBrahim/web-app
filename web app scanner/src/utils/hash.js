// A lightweight SHA-256 implementation or simple string hashing utility
// Useful for comparing ETags or data hashes if real API is used.

export const simpleHash = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};
