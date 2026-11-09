"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { PixelWindow } from "./PixelWindow";
import { sound } from "@/lib/sound";
import { LeaderboardEntry, getLeaderboard, submitLeaderboardScore } from "@/lib/leaderboard";
import { toArcadeCallsign } from "@/lib/anticheat";
import confetti from "canvas-confetti";

interface FruitBoxGameProps {
  onClose: () => void;
  gameId?: string;
}

interface CellData {
  r: number;
  c: number;
  num: number;
  cleared: boolean;
}

const COLS = 17;
const ROWS = 10;
const TOTAL_APPLES = COLS * ROWS; // 170
const INITIAL_TIME = 120; // 120 seconds

export const FruitBoxGame: React.FC<FruitBoxGameProps> = ({
  onClose,
  gameId = "fruit-box",
}) => {
  // Generate random grid of apples
  const generateGrid = (): CellData[][] => {
    const grid: CellData[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: CellData[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          r,
          c,
          num: Math.floor(Math.random() * 9) + 1, // 1 to 9
          cleared: false,
        });
      }
      grid.push(row);
    }
    return grid;
  };

  const [grid, setGrid] = useState<CellData[][]>(generateGrid);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Dragging selection states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startCell, setStartCell] = useState<{ r: number; c: number } | null>(null);
  const [currentCell, setCurrentCell] = useState<{ r: number; c: number } | null>(null);

  // Leaderboard states
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const gameStartTimeRef = useRef<number>(Date.now());
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  // Load Leaderboard
  const loadLeaderboard = useCallback(async () => {
    setIsLoadingLeaderboard(true);
    const scores = await getLeaderboard(gameId);
    setLeaderboard(scores);
    if (scores.length > 0) {
      setHighScore(scores[0].score);
    }
    setIsLoadingLeaderboard(false);
  }, [gameId]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          sound.playClick();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, isGameOver]);

  // When Game Over, refresh leaderboard
  useEffect(() => {
    if (isGameOver) {
      loadLeaderboard();
      setHasSubmitted(false);
      setSubmittedRank(null);
      setSubmitError(null);
    }
  }, [isGameOver, loadLeaderboard]);

  // Calculate selection bounds
  const getSelectionBounds = () => {
    if (!startCell || !currentCell) return null;
    const minR = Math.min(startCell.r, currentCell.r);
    const maxR = Math.max(startCell.r, currentCell.r);
    const minC = Math.min(startCell.c, currentCell.c);
    const maxC = Math.max(startCell.c, currentCell.c);
    return { minR, maxR, minC, maxC };
  };

  const bounds = getSelectionBounds();

  // Calculate current selection sum and apple count
  let selectedSum = 0;
  let selectedApplesCount = 0;
  if (bounds && isDragging) {
    for (let r = bounds.minR; r <= bounds.maxR; r++) {
      for (let c = bounds.minC; c <= bounds.maxC; c++) {
        const cell = grid[r][c];
        if (!cell.cleared) {
          selectedSum += cell.num;
          selectedApplesCount++;
        }
      }
    }
  }

  // Pointer event handlers for grid selection
  const handleCellPointerDown = (r: number, c: number) => {
    if (isGameOver) return;
    if (!hasStarted) {
      setHasStarted(true);
      gameStartTimeRef.current = Date.now();
    }
    sound.playBlip();
    setIsDragging(true);
    setStartCell({ r, c });
    setCurrentCell({ r, c });
  };

  const handleCellPointerEnter = (r: number, c: number) => {
    if (isDragging && !isGameOver) {
      setCurrentCell({ r, c });
    }
  };

  const handlePointerUp = useCallback(() => {
    if (!isDragging || isGameOver) return;
    setIsDragging(false);

    if (bounds) {
      let sum = 0;
      const applesToClear: { r: number; c: number }[] = [];

      for (let r = bounds.minR; r <= bounds.maxR; r++) {
        for (let c = bounds.minC; c <= bounds.maxC; c++) {
          const cell = grid[r][c];
          if (!cell.cleared) {
            sum += cell.num;
            applesToClear.push({ r, c });
          }
        }
      }

      // MATCH RULE: Sum of numbers must equal EXACTLY 10!
      if (sum === 10 && applesToClear.length > 0) {
        sound.playHeart();

        // Clear apples
        setGrid((prev) => {
          const next = prev.map((row) => row.map((cell) => ({ ...cell })));
          applesToClear.forEach(({ r, c }) => {
            next[r][c].cleared = true;
          });
          return next;
        });

        // 1 point per cleared apple
        const pointsEarned = applesToClear.length;
        setScore((prev) => {
          const newScore = prev + pointsEarned;
          setHighScore((h) => Math.max(h, newScore));
          if (newScore >= TOTAL_APPLES) {
            setIsGameOver(true);
            confetti({ particleCount: 80, spread: 100 });
          }
          return newScore;
        });
      }
    }

    setStartCell(null);
    setCurrentCell(null);
  }, [isDragging, isGameOver, bounds, grid]);

  // Listen to window pointerup so releasing outside grid cleanly ends selection
  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerUp]);

  // Restart game
  const restartGame = () => {
    sound.playBlip();
    setGrid(generateGrid());
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setIsGameOver(false);
    setHasStarted(false);
    setIsDragging(false);
    setStartCell(null);
    setCurrentCell(null);
    setHasSubmitted(false);
    setSubmittedRank(null);
    setSubmitError(null);
    gameStartTimeRef.current = Date.now();
  };

  // Submit Score to GitHub Gist
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Automatically convert Vietnamese/Accented characters into clean unaccented Arcade uppercase
    const cleanName = toArcadeCallsign(playerName, 18);
    if (!cleanName || score <= 0 || isSubmitting) return;

    setPlayerName(cleanName);
    setIsSubmitting(true);
    setSubmitError(null);
    sound.playHeart();

    const duration = Math.max(1, INITIAL_TIME - timeLeft);
    const result = await submitLeaderboardScore(gameId, cleanName, score, duration);
    setIsSubmitting(false);

    if (result.success) {
      setHasSubmitted(true);
      if (result.scores && result.scores.length > 0) {
        setLeaderboard(result.scores);
      }
      if (result.rank) {
        setSubmittedRank(result.rank);
      }
    } else {
      setSubmitError(result.message || "Failed to record score.");
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <PixelWindow
          title="Fruit_Box_Puzzle.exe (Apple Game)"
          onClose={onClose}
          showMediaFooter={false}
        >
          <div className="space-y-3">
            {/* Top HUD: Score, Timer, Cleared count, Hi-Score */}
            <div className="flex flex-wrap items-center justify-between font-pixelify font-bold text-xs sm:text-sm bg-[#041a0d] border border-[#059669] p-2.5 gap-2">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-emerald-300">SCORE: </span>
                  <span className="text-[#bef264] text-base">{score}</span>
                  <span className="text-emerald-500 text-xs"> / {TOTAL_APPLES}</span>
                </div>
                <div>
                  <span className="text-teal-300">CLEARED: </span>
                  <span className="text-white">{score}</span>
                </div>
              </div>

              {/* Real-time drag sum indicator */}
              {isDragging && bounds && (
                <div
                  className={`px-2.5 py-0.5 border text-xs sm:text-sm font-pixelify font-black animate-pulse ${
                    selectedSum === 10
                      ? "bg-[#042c16] border-[#bef264] text-[#bef264] shadow-[0_0_12px_#bef264]"
                      : selectedSum < 10
                      ? "bg-[#031d28] border-sky-400 text-sky-200"
                      : "bg-[#2b080c] border-rose-500 text-rose-300"
                  }`}
                >
                  BOX SUM: {selectedSum} {selectedSum === 10 ? "★ MATCH (10)!" : ""}
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-300">TIME: </span>
                  <span
                    className={`font-mono text-sm sm:text-base font-black px-2 py-0.5 border ${
                      timeLeft <= 15
                        ? "bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse"
                        : "bg-[#021d0e] border-[#10b981] text-[#bef264]"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div>
                  <span className="text-teal-300">HI-SCORE: </span>
                  <span className="text-[#38bdf8]">{highScore}</span>
                </div>
              </div>
            </div>

            {/* Main Apple Grid Area */}
            <div className="relative border-4 border-[#34d399] bg-[#021107] p-2 sm:p-3 overflow-hidden shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              {/* Instructions banner when not started */}
              {!hasStarted && !isGameOver && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[#022c15]/90 border border-[#bef264] px-4 py-1 text-xs font-pixelify text-[#bef264] animate-bounce pointer-events-none whitespace-nowrap shadow-[0_0_10px_#022c15]">
                  ✦ DRAG A BOX AROUND APPLES TO MAKE A SUM OF 10!
                </div>
              )}

              {/* The 17x10 Grid */}
              <div
                ref={gridContainerRef}
                className="grid grid-cols-17 gap-1 sm:gap-1.5 touch-none"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                }}
              >
                {grid.map((row, r) =>
                  row.map((cell, c) => {
                    const isSelected =
                      bounds &&
                      r >= bounds.minR &&
                      r <= bounds.maxR &&
                      c >= bounds.minC &&
                      c <= bounds.maxC;

                    if (cell.cleared) {
                      return (
                        <div
                          key={`${r}-${c}`}
                          onPointerDown={() => handleCellPointerDown(r, c)}
                          onPointerEnter={() => handleCellPointerEnter(r, c)}
                          className={`w-full aspect-square border border-[#042c16]/30 flex items-center justify-center transition-colors ${
                            isSelected ? "bg-[#bef264]/10 border-[#bef264]/40" : "bg-[#011409]/30"
                          }`}
                        />
                      );
                    }

                    return (
                      <div
                        key={`${r}-${c}`}
                        onPointerDown={() => handleCellPointerDown(r, c)}
                        onPointerEnter={() => handleCellPointerEnter(r, c)}
                        className={`relative w-full aspect-square flex items-center justify-center cursor-pointer transition-transform ${
                          isSelected ? "scale-105" : "hover:brightness-110"
                        }`}
                      >
                        {/* Pixel Apple Element (Dark Red Retro) */}
                        <div
                          className={`w-[90%] h-[90%] rounded-[3px] flex items-center justify-center relative shadow-[1px_1px_0_#011207] border transition-all ${
                            isSelected
                              ? selectedSum === 10
                                ? "bg-[#059669] border-[#bef264] text-white shadow-[0_0_8px_#bef264]"
                                : selectedSum > 10
                                ? "bg-[#7f1d1d] border-rose-400 text-white"
                                : "bg-[#0284c7] border-sky-300 text-white"
                              : "bg-[#6b1414] hover:bg-[#7a1818] border-[#380b0b] text-[#f8fafc]"
                          }`}
                        >
                          {/* Apple Stem & Leaf */}
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center pointer-events-none">
                            <div className="w-[1.5px] h-1 bg-[#5c2b09]" />
                            <div className="w-1.5 h-1 bg-[#16a34a] rounded-tr" />
                          </div>

                          {/* Pixel Digit (1 to 9) using Press Start 2P font */}
                          <span className="font-press font-bold text-[10px] sm:text-xs leading-none select-none text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]">
                            {cell.num}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Game Over Leaderboard Overlay */}
              {isGameOver && (
                <div
                  className="absolute inset-0 bg-[#020e06]/95 backdrop-blur-xs flex flex-col justify-between p-3 sm:p-4 text-white z-20 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="text-center">
                    <div className="font-pixelify font-black text-lg sm:text-2xl text-[#f43f5e] tracking-wider flex items-center justify-center gap-2">
                      <span>🍎</span>
                      <span>TIME&apos;S UP! GAME OVER</span>
                      <span>🍎</span>
                    </div>
                    <div className="font-pixelify text-xs sm:text-sm text-emerald-200 mt-0.5">
                      YOUR FINAL SCORE: <strong className="text-[#bef264] text-base sm:text-lg">{score}</strong> / {TOTAL_APPLES}
                      <span className="mx-2">•</span>
                      HI-SCORE: <strong className="text-[#38bdf8] text-base">{highScore}</strong>
                    </div>
                  </div>

                  {/* Leaderboard Box */}
                  <div
                    className="bg-[#03170c] border border-[#10b981] p-2.5 my-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-[#064e3b] pb-1 mb-1.5 font-pixelify font-bold text-xs text-[#bef264]">
                      <div className="flex items-center gap-1.5">
                        <span>🏆</span>
                        <span>TOP 10 FRUIT BOX PILOTS (GIST SYNC)</span>
                      </div>
                      <span className="text-[10px] text-teal-300">
                        {isLoadingLeaderboard ? "SYNCING..." : "LIVE"}
                      </span>
                    </div>

                    {/* 2-Column Grid */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-pixelify text-xs">
                      {leaderboard.length === 0 ? (
                        <div className="col-span-2 text-center text-emerald-300/70 py-2">
                          {isLoadingLeaderboard ? "Loading Gist scores..." : "No scores recorded yet. Be the first!"}
                        </div>
                      ) : (
                        leaderboard.slice(0, 10).map((entry, idx) => {
                          const isLatest = submittedRank === idx + 1;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center justify-between px-2 py-0.5 border ${
                                isLatest
                                  ? "bg-[#064e3b] border-[#bef264] text-[#bef264] font-bold"
                                  : idx === 0
                                  ? "bg-[#042c16]/80 border-[#facc15]/40 text-[#facc15]"
                                  : idx === 1
                                  ? "bg-[#042c16]/50 border-slate-400/40 text-slate-200"
                                  : idx === 2
                                  ? "bg-[#042c16]/50 border-amber-600/40 text-amber-300"
                                  : "bg-transparent border-transparent text-emerald-100"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                                <span className="text-[10px] opacity-80 font-mono">
                                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                                </span>
                                <span className="truncate">{entry.name}</span>
                              </div>
                              <span className="font-mono font-bold text-white ml-1">
                                {entry.score} pts
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Callsign Submit Form (Auto unaccented uppercase arcade conversion!) */}
                    {score > 0 && !hasSubmitted ? (
                      <div className="mt-2 pt-2 border-t border-[#064e3b] space-y-1">
                        <form
                          onSubmit={handleSubmitScore}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2"
                        >
                          <span className="font-pixelify text-xs text-mint-200 hidden sm:inline whitespace-nowrap">
                            CALLSIGN:
                          </span>
                          <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            onBlur={() => setPlayerName((prev) => toArcadeCallsign(prev, 18))}
                            placeholder="NAME (VI/EN -> ARCADE)"
                            maxLength={24}
                            className="flex-1 bg-[#020e06] border border-[#34d399] px-2.5 py-1 font-pixelify text-xs text-[#bef264] tracking-wider focus:outline-none focus:border-[#bef264] uppercase"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            type="submit"
                            disabled={isSubmitting || !playerName.trim()}
                            className="pixel-btn text-xs font-pixelify font-bold px-3 py-1 bg-[#059669] hover:bg-[#10b981] text-white whitespace-nowrap disabled:opacity-50"
                          >
                            {isSubmitting ? "SAVING..." : "💾 SUBMIT"}
                          </button>
                        </form>
                        {playerName.trim() && (
                          <div className="text-[10px] text-emerald-400 font-pixelify flex items-center justify-between px-1">
                            <span>ARCADE ID: <strong className="text-[#bef264]">{toArcadeCallsign(playerName, 18)}</strong></span>
                            <span className="text-emerald-500">Auto converted to unaccented</span>
                          </div>
                        )}
                      </div>
                    ) : hasSubmitted ? (
                      <div className="mt-2 pt-1 border-t border-[#064e3b] text-center font-pixelify text-xs text-[#bef264]">
                        ★ RECORD SAVED TO GITHUB GIST (RANK #{submittedRank || "TOP 10"})!
                      </div>
                    ) : null}

                    {submitError && (
                      <div className="mt-1 text-center font-pixelify text-[11px] text-rose-400">
                        ⚠ {submitError}
                      </div>
                    )}
                  </div>

                  {/* Explicit Restart Button */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        restartGame();
                      }}
                      className="pixel-btn text-xs sm:text-sm font-pixelify font-bold px-6 py-2 bg-[#059669] hover:bg-[#10b981] text-white border-2 border-[#a7f3d0] shadow-[3px_3px_0_#01170b] cursor-pointer inline-flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                    >
                      <span className="text-base">↺</span>
                      <span>PLAY AGAIN</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Rules & Controls Info in English */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-pixelify text-emerald-200 pt-1">
              <div>
                🍎 <strong className="text-white">Rule:</strong> Drag a box around apples that sum to <strong className="text-[#bef264]">10</strong> to clear them! (1 point per apple)
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={restartGame}
                  className="pixel-btn text-xs font-pixelify font-bold px-2.5 py-1 bg-[#047857] hover:bg-[#059669] text-white"
                >
                  ↺ RESET GRID
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="pixel-btn text-xs font-pixelify font-bold px-3 py-1 bg-[#e11d48] hover:bg-[#f43f5e] text-white"
                >
                  EXIT [✕]
                </button>
              </div>
            </div>
          </div>
        </PixelWindow>
      </div>
    </div>
  );
};
