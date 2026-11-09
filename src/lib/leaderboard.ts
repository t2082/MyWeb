import { computeGameToken } from "./anticheat";

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export interface MultiGameLeaderboard {
  [gameId: string]: LeaderboardEntry[];
}

export interface LeaderboardResponse {
  gameId: string;
  scores: LeaderboardEntry[];
  success?: boolean;
  rank?: number;
  message?: string;
}

export async function getLeaderboard(
  gameId: string = "flappy-bird"
): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(
      `/api/leaderboard?gameId=${encodeURIComponent(gameId)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch leaderboard: ${res.statusText}`);
    }
    const data: LeaderboardResponse = await res.json();
    return data.scores || [];
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    return [];
  }
}

export async function submitLeaderboardScore(
  gameId: string,
  name: string,
  score: number,
  duration: number = 5
): Promise<{
  success: boolean;
  scores: LeaderboardEntry[];
  rank?: number;
  message?: string;
}> {
  try {
    const timestamp = Date.now();
    const token = computeGameToken(gameId, score, duration, timestamp);

    const res = await fetch("/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameId,
        name,
        score,
        duration,
        token,
        timestamp,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error submitting leaderboard score:", err);
    return { success: false, scores: [], message: "Network connection failed" };
  }
}
