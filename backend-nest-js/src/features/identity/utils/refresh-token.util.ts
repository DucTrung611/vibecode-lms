import { createHash } from 'crypto';

/**
 * Refresh tokens are high-entropy signed JWTs, not low-entropy secrets like
 * passwords — a deterministic SHA-256 digest (vs. bcrypt) lets us look up the
 * stored row directly by hash while still never persisting the raw token.
 */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
