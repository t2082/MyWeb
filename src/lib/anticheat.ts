const SALT = "AKURO_ARCADE_VAULT_2026_ANTI_CHEAT_SALT";

export interface GameRule {
  maxScore: number;
  minTimePerPoint: number; // in seconds
  name: string;
}

export const GAME_RULES: Record<string, GameRule> = {
  "flappy-bird": {
    maxScore: 500,
    minTimePerPoint: 0.08,
    name: "Flutter Space Runner",
  },
  "fruit-box": {
    maxScore: 170, // 17 columns x 10 rows = 170 apples total!
    minTimePerPoint: 0.25, // At least 0.25s per apple cleared
    name: "Fruit Box (Apple Game)",
  },
  "minesweeper": {
    maxScore: 1500, // Safe cells cleared + win bonus + time bonus
    minTimePerPoint: 0.005, // Cascading reveals can clear cells instantly
    name: "Retro Minesweeper",
  },
  "space-shooter": {
    maxScore: 10000, // Space Invaders arcade high score cap
    minTimePerPoint: 0.005,
    name: "Retro Space Invaders (Galaxy Shooter)",
  },
};

/**
 * Automatically converts accented Vietnamese/Unicode text into unaccented
 * uppercase Arcade format (e.g. "Nguyễn Minh Tân" -> "NGUYEN MINH TAN")
 */
export function toArcadeCallsign(input: string, maxLen: number = 16): string {
  if (!input) return "";
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip all combining diacritical marks
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 _-]/g, "") // keep only A-Z, 0-9, space, hyphen, underscore
    .trim()
    .toUpperCase()
    .substring(0, maxLen);
}

// Fast sync FNV-1a hash working identically in browser and server
export function computeGameToken(
  gameId: string,
  score: number,
  duration: number,
  timestamp: number
): string {
  const timeBlock = Math.floor(timestamp / 60000); // 1-minute block
  const str = `${gameId}:${score}:${Math.floor(duration)}:${timeBlock}:${SALT}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function validateSubmission(
  gameId: string,
  score: number,
  duration?: number,
  token?: string,
  timestamp?: number
): { valid: boolean; reason?: string } {
  const rule = GAME_RULES[gameId];
  if (!rule) {
    return { valid: false, reason: `Unknown game identifier: ${gameId}` };
  }

  // 1. Hard score limit verification
  if (typeof score !== "number" || isNaN(score) || score <= 0) {
    return { valid: false, reason: "Score must be a positive number." };
  }

  if (score > rule.maxScore) {
    return {
      valid: false,
      reason: `Anti-cheat: Score ${score} exceeds the theoretical maximum limit (${rule.maxScore}) for ${rule.name}.`,
    };
  }

  // 2. Playtime duration verification
  if (typeof duration === "number") {
    const requiredMinSeconds = Math.max(0.5, score * rule.minTimePerPoint * 0.4);
    if (duration < requiredMinSeconds) {
      return {
        valid: false,
        reason: `Anti-cheat: Impossible speed detected. Score ${score} achieved in only ${duration.toFixed(1)}s (min required: ${requiredMinSeconds.toFixed(1)}s).`,
      };
    }
  }

  // 3. Signature verification if token provided
  if (token && timestamp) {
    const now = Date.now();
    // Allow up to 10 minutes session variance
    if (Math.abs(now - timestamp) > 10 * 60 * 1000) {
      return { valid: false, reason: "Anti-cheat: Match session has expired." };
    }

    const dur = typeof duration === "number" ? duration : 0;
    const expected1 = computeGameToken(gameId, score, dur, timestamp);
    const expected2 = computeGameToken(gameId, score, dur, timestamp - 60000);
    const expected3 = computeGameToken(gameId, score, dur, timestamp + 60000);

    if (token !== expected1 && token !== expected2 && token !== expected3) {
      return { valid: false, reason: "Anti-cheat: Signature hash mismatch." };
    }
  }

  return { valid: true };
}
