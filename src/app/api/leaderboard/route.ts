import { NextRequest, NextResponse } from "next/server";
import { LeaderboardEntry, MultiGameLeaderboard } from "@/lib/leaderboard";
import { validateSubmission, toArcadeCallsign } from "@/lib/anticheat";

const GIST_ID = process.env.GITHUB_GIST_ID || "7b6431c28a908311dd94e852d39c1df1";
const GIST_TOKEN = process.env.GITHUB_GIST_TOKEN || "";
const GIST_FILENAME = "arcade_leaderboards.json";

// In-memory fallback cache
let fallbackStore: MultiGameLeaderboard = {
  "flappy-bird": [
    { name: "Akuro", score: 42, date: new Date().toISOString() },
    { name: "Senbox", score: 35, date: new Date().toISOString() },
    { name: "FlutterDev", score: 28, date: new Date().toISOString() },
    { name: "PixelBot", score: 20, date: new Date().toISOString() },
    { name: "RetroChamp", score: 15, date: new Date().toISOString() },
  ],
  "fruit-box": [
    { name: "Akuro", score: 112, date: new Date().toISOString() },
    { name: "AppleMaster", score: 95, date: new Date().toISOString() },
    { name: "SpeedMatcher", score: 82, date: new Date().toISOString() },
    { name: "MathGenius", score: 70, date: new Date().toISOString() },
    { name: "PixelPicker", score: 54, date: new Date().toISOString() },
  ],
  "minesweeper": [
    { name: "Akuro", score: 980, date: new Date().toISOString() },
    { name: "MineSweeperPro", score: 890, date: new Date().toISOString() },
    { name: "BombDefuser", score: 810, date: new Date().toISOString() },
    { name: "LogicMaster", score: 720, date: new Date().toISOString() },
    { name: "FlagHunter", score: 650, date: new Date().toISOString() },
  ],
  "space-shooter": [
    { name: "Akuro", score: 2840, date: new Date().toISOString() },
    { name: "StarAce", score: 2450, date: new Date().toISOString() },
    { name: "GalacticHero", score: 1980, date: new Date().toISOString() },
    { name: "LaserFury", score: 1420, date: new Date().toISOString() },
    { name: "CosmicPilot", score: 960, date: new Date().toISOString() },
  ],
};

// Simple rate limiter per client IP
const rateLimitMap = new Map<string, number>();

async function fetchFromGist(): Promise<MultiGameLeaderboard> {
  if (!GIST_ID) return fallbackStore;

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "MyWeb-Arcade-Leaderboard",
    };
    if (GIST_TOKEN) {
      headers["Authorization"] = `Bearer ${GIST_TOKEN}`;
    }

    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers,
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const rawRes = await fetch(
        `https://gist.githubusercontent.com/t2082/${GIST_ID}/raw/${GIST_FILENAME}?t=${Date.now()}`
      );
      if (rawRes.ok) {
        const json = await rawRes.json();
        const merged: MultiGameLeaderboard = { ...fallbackStore, ...json };
        fallbackStore = merged;
        return merged;
      }
      return fallbackStore;
    }

    const gistData = await res.json();
    const file = gistData.files?.[GIST_FILENAME];
    if (file && file.content) {
      const parsed = JSON.parse(file.content);
      const merged: MultiGameLeaderboard = { ...fallbackStore, ...parsed };
      fallbackStore = merged;
      return merged;
    }
  } catch (err) {
    console.warn("Failed to fetch leaderboard from Gist, using fallback store:", err);
  }

  return fallbackStore;
}

async function saveToGist(data: MultiGameLeaderboard): Promise<boolean> {
  fallbackStore = data;

  if (!GIST_ID || !GIST_TOKEN) {
    console.warn("GIST_TOKEN missing, saved only to in-memory fallback");
    return true;
  }

  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${GIST_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "MyWeb-Arcade-Leaderboard",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: "Retro Arcade Top 10 Leaderboards (Multi-Game)",
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(data, null, 2),
          },
        },
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("Failed to update Gist:", err);
    return false;
  }
}

// GET: Fetch top 10 for a given gameId
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId") || "flappy-bird";

  const allData = await fetchFromGist();
  const gameScores: LeaderboardEntry[] = (allData[gameId] || [])
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return NextResponse.json({
    gameId,
    scores: gameScores,
  });
}

// POST: Submit a score for a given gameId with anti-cheat & Vietnamese support
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local_player";
    const now = Date.now();
    const lastRequestTime = rateLimitMap.get(ip) || 0;

    // Rate limiting: 2.5 seconds cooldown
    if (now - lastRequestTime < 2500) {
      return NextResponse.json(
        { success: false, message: "Too many submissions. Please wait a moment." },
        { status: 429 }
      );
    }
    rateLimitMap.set(ip, now);

    const body = await request.json();
    const gameId = typeof body.gameId === "string" && body.gameId.trim() ? body.gameId.trim() : "flappy-bird";
    const score = Math.floor(Number(body.score) || 0);
    const duration = typeof body.duration === "number" ? body.duration : undefined;

    // 1. Anti-cheat validation (check max score, min time, signature)
    const check = validateSubmission(gameId, score, duration, body.token, body.timestamp);
    if (!check.valid) {
      console.warn("Anti-cheat blocked submission:", check.reason, { gameId, score, duration, ip });
      return NextResponse.json(
        { success: false, message: check.reason, isAntiCheatBlocked: true },
        { status: 400 }
      );
    }

    // 2. Convert Vietnamese/Accented to Clean Unaccented Arcade Callsign
    const rawName = typeof body.name === "string" ? body.name : "";
    const name = toArcadeCallsign(rawName, 18) || "ARCADE_PILOT";

    const allData = await fetchFromGist();
    const currentList: LeaderboardEntry[] = (allData[gameId] || []).slice();

    const newEntry: LeaderboardEntry = {
      name,
      score,
      date: new Date().toISOString(),
    };

    // Combine, sort descending
    const combined = [...currentList, newEntry].sort((a, b) => b.score - a.score);

    // Find rank of newly added score (1-indexed)
    const rank = combined.findIndex((item) => item === newEntry) + 1;
    const isTop10 = rank <= 10;

    // Keep top 10 only
    const top10 = combined.slice(0, 10);
    allData[gameId] = top10;

    await saveToGist(allData);

    return NextResponse.json({
      success: true,
      gameId,
      scores: top10,
      rank,
      isTop10,
      newEntry,
    });
  } catch (err) {
    console.error("Error in leaderboard POST:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
