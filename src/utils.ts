import type { NucTokenEnvelope, NucToken } from "@nillion/nuc";
import { createHash } from "node:crypto";

/**
 * Check if a token envelope is expired
 * @param tokenEnvelope - The token envelope to check
 * @returns true if the token is expired, false otherwise
 */
export function isExpired(tokenEnvelope: NucTokenEnvelope): boolean {
  try {
    const token: NucToken = tokenEnvelope.token.token;
    if (!token.expiresAt) {
      return false;
    }
    const expiresAt = new Date(token.expiresAt.epochMilliseconds);
    const currentTime = new Date();
    return expiresAt < currentTime;
  } catch (_error) {
    return true;
  }
}

/**
 * Convert hex string to Uint8Array
 * @param hex - Hex string
 * @returns Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 * @param bytes - Uint8Array
 * @returns Hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Token summary for string
 */
export function tokenSummaryString(token: string): string {
  return createHash("sha256").update(token).digest("hex"); // Converts the hash to a hexadecimal string
}
