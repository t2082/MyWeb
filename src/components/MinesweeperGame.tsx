"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { PixelWindow } from "./PixelWindow";
import { sound } from "@/lib/sound";
import { LeaderboardEntry, getLeaderboard, submitLeaderboardScore } from "@/lib/leaderboard";
import { toArcadeCallsign } from "@/lib/anticheat";
import confetti from "canvas-confetti";

interface MinesweeperGameProps {
  onClose: () => void;
  gameId?: string;
}

interface CellData {
  r: number;
  c: number;
  hasMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  exploded?: boolean;
}

const ROWS = 9;
const COLS = 9;
const TOTAL_MINES = 10;
const TOTAL_SAFE_CELLS = ROWS * COLS - TOTAL_MINES; // 71

export const MinesweeperGame: React.FC<MinesweeperGameProps> = ({
  onClose,
  gameId = "minesweeper",
}) => {
  // Board state
  const [grid, setGrid] = useState<CellData[][]>(() => createEmptyGrid());
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [faceState, setFaceState] = useState<"idle" | "pressing" | "lost" | "won">("idle");
  const [flagMode, setFlagMode] = useState<boolean>(false); // Mobile friendly toggle

  // Timer & Score
  const [seconds, setSeconds] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);

  // Leaderboard states
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const gameStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  function createEmptyGrid(): CellData[][] {
    const b: CellData[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: CellData[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          r,
          c,
          hasMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      b.push(row);
    }
    return b;
  }

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

  // Timer loop
  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => Math.min(999, prev + 1));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameOver, gameWon]);

  // When Game Over or Won, refresh leaderboard
  useEffect(() => {
    if (gameOver || gameWon) {
      loadLeaderboard();
      setHasSubmitted(false);
      setSubmittedRank(null);
      setSubmitError(null);
    }
  }, [gameOver, gameWon, loadLeaderboard]);

  // Restart
  const restartGame = useCallback(() => {
    sound.playBlip();
    setGrid(createEmptyGrid());
    setGameStarted(false);
    setGameOver(false);
    setGameWon(false);
    setFaceState("idle");
    setSeconds(0);
    setScore(0);
    setHasSubmitted(false);
    setSubmittedRank(null);
    setSubmitError(null);
    gameStartTimeRef.current = Date.now();
  }, []);

  // Count flags
  const flagsCount = grid.reduce(
    (acc, row) => acc + row.filter((cell) => cell.isFlagged).length,
    0
  );
  const remainingMines = Math.max(0, TOTAL_MINES - flagsCount);

  // Initialize mines ensuring first click at (firstR, firstC) is safe
  const populateMines = (firstR: number, firstC: number): CellData[][] => {
    const newGrid: CellData[][] = createEmptyGrid();
    let minesPlaced = 0;

    // Collect available positions except clicked cell and its immediate neighbors
    const positions: { r: number; c: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const isNeighbor = Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1;
        if (!isNeighbor) {
          positions.push({ r, c });
        }
      }
    }

    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // Place mines
    while (minesPlaced < TOTAL_MINES && positions.length > 0) {
      const pos = positions.pop()!;
      newGrid[pos.r][pos.c].hasMine = true;
      minesPlaced++;
    }

    // Fallback if needed
    if (minesPlaced < TOTAL_MINES) {
      for (let r = 0; r < ROWS && minesPlaced < TOTAL_MINES; r++) {
        for (let c = 0; c < COLS && minesPlaced < TOTAL_MINES; c++) {
          if (r !== firstR || c !== firstC) {
            if (!newGrid[r][c].hasMine) {
              newGrid[r][c].hasMine = true;
              minesPlaced++;
            }
          }
        }
      }
    }

    // Calculate neighbor mine counts
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newGrid[r][c].hasMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                if (newGrid[nr][nc].hasMine) count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    return newGrid;
  };

  // Reveal flood fill
  const revealCell = (r: number, c: number) => {
    if (gameOver || gameWon) return;

    let currentGrid = grid;
    if (!gameStarted) {
      currentGrid = populateMines(r, c);
      setGameStarted(true);
      gameStartTimeRef.current = Date.now();
    }

    const target = currentGrid[r][c];
    if (target.isRevealed || target.isFlagged) return;

    // Check hit mine -> Loss!
    if (target.hasMine) {
      sound.playExplosion();
      setGameOver(true);
      setFaceState("lost");

      // Reveal all mines
      const finalGrid = currentGrid.map((row) =>
        row.map((cell) => {
          if (cell.r === r && cell.c === c) {
            return { ...cell, isRevealed: true, exploded: true };
          }
          if (cell.hasMine) {
            return { ...cell, isRevealed: true };
          }
          return cell;
        })
      );
      setGrid(finalGrid);
      return;
    }

    // Safe reveal
    sound.playClick();
    const nextGrid = currentGrid.map((row) => row.map((cell) => ({ ...cell })));
    const queue: [number, number][] = [[r, c]];
    nextGrid[r][c].isRevealed = true;

    while (queue.length > 0) {
      const [currR, currC] = queue.shift()!;
      const currCell = nextGrid[currR][currC];

      if (currCell.neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = currR + dr;
            const nc = currC + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              const neighbor = nextGrid[nr][nc];
              if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.hasMine) {
                neighbor.isRevealed = true;
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }

    // Count revealed cells & calculate score
    let revealedCount = 0;
    for (let rIdx = 0; rIdx < ROWS; rIdx++) {
      for (let cIdx = 0; cIdx < COLS; cIdx++) {
        if (nextGrid[rIdx][cIdx].isRevealed) {
          revealedCount++;
        }
      }
    }

    // Base score: 10 points per safe cell
    let newScore = revealedCount * 10;

    // Check win condition
    if (revealedCount === TOTAL_SAFE_CELLS) {
      sound.playHeart();
      setGameWon(true);
      setFaceState("won");
      confetti({ particleCount: 80, spread: 100 });

      // Win Bonus 500 + Speed Bonus
      const speedBonus = Math.max(0, 300 - seconds * 2);
      newScore += 500 + speedBonus;

      // Flag all remaining mines
      for (let rIdx = 0; rIdx < ROWS; rIdx++) {
        for (let cIdx = 0; cIdx < COLS; cIdx++) {
          if (nextGrid[rIdx][cIdx].hasMine) {
            nextGrid[rIdx][cIdx].isFlagged = true;
          }
        }
      }
    }

    setScore(newScore);
    setHighScore((prev) => Math.max(prev, newScore));
    setGrid(nextGrid);
  };

  // Flag cell
  const toggleFlag = (r: number, c: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (gameOver || gameWon) return;

    const cell = grid[r][c];
    if (cell.isRevealed) return;

    sound.playFlag();
    setGrid((prev) => {
      const next = prev.map((row) => row.map((cItem) => ({ ...cItem })));
      next[r][c].isFlagged = !next[r][c].isFlagged;
      return next;
    });
  };

  // Pointer interaction
  const handleCellClick = (r: number, c: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (flagMode) {
      toggleFlag(r, c);
    } else {
      revealCell(r, c);
    }
  };

  // Submit score to GitHub Gist
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

    const duration = Math.max(1, (Date.now() - gameStartTimeRef.current) / 1000);
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

  // Color map for adjacent mine numbers
  const NUMBER_COLORS: Record<number, string> = {
    1: "text-[#38bdf8]", // Blue
    2: "text-[#4ade80]", // Green
    3: "text-[#f87171]", // Red
    4: "text-[#818cf8]", // Dark Blue/Purple
    5: "text-[#f59e0b]", // Amber
    6: "text-[#2dd4bf]", // Teal
    7: "text-[#e879f9]", // Pink
    8: "text-[#94a3b8]", // Gray
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <PixelWindow
          title="Minesweeper_Classic.exe (9x9 Retro)"
          onClose={onClose}
          showMediaFooter={false}
        >
          <div className="space-y-3">
            {/* Windows 95 Style Header Bar */}
            <div className="bg-[#021d0e] border-2 border-[#10b981] p-3 flex items-center justify-between shadow-inner">
              {/* Mine Counter LED */}
              <div className="bg-black border border-[#064e3b] px-3 py-1 font-mono font-black text-rose-500 text-lg tracking-widest shadow-[0_0_8px_rgba(244,63,94,0.4)]">
                {String(remainingMines).padStart(3, "0")}
              </div>

              {/* Retro Face Status & Reset Button */}
              <button
                type="button"
                onClick={restartGame}
                onMouseDown={() => !gameOver && !gameWon && setFaceState("pressing")}
                onMouseUp={() => !gameOver && !gameWon && setFaceState("idle")}
                title="Click to restart game"
                className="w-10 h-10 bg-[#042c16] hover:bg-[#064e3b] border-2 border-[#34d399] flex items-center justify-center text-xl shadow-[2px_2px_0_#01170b] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                {faceState === "won"
                  ? "😎"
                  : faceState === "lost"
                  ? "😵"
                  : faceState === "pressing"
                  ? "😮"
                  : "🙂"}
              </button>

              {/* Seconds Timer LED */}
              <div className="bg-black border border-[#064e3b] px-3 py-1 font-mono font-black text-[#bef264] text-lg tracking-widest shadow-[0_0_8px_rgba(190,242,100,0.4)]">
                {String(seconds).padStart(3, "0")}
              </div>
            </div>

            {/* Mode & Stats Row */}
            <div className="flex items-center justify-between text-xs font-pixelify font-bold px-1 text-emerald-200">
              <div className="flex items-center gap-2">
                <span>SCORE: <strong className="text-[#bef264] text-sm">{score}</strong></span>
                <span>•</span>
                <span>HI-SCORE: <strong className="text-[#38bdf8] text-sm">{highScore}</strong></span>
              </div>

              {/* Mode Toggle Button for Touch / Mobile */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setFlagMode(!flagMode);
                }}
                className={`px-3 py-1 border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  flagMode
                    ? "bg-[#991b1b] border-rose-400 text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                    : "bg-[#042c16] border-[#10b981] text-[#bef264]"
                }`}
              >
                <span>{flagMode ? "🚩 MODE: FLAG" : "⛏️ MODE: DIG"}</span>
              </button>
            </div>

            {/* Main Minesweeper Grid Area */}
            <div className="relative bg-[#021308] border-4 border-[#34d399] p-3 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              <div
                className="grid gap-1 select-none mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                  maxWidth: "340px",
                }}
              >
                {grid.map((row, r) =>
                  row.map((cell, c) => {
                    const isExplodedMine = cell.exploded;
                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={(e) => handleCellClick(r, c, e)}
                        onContextMenu={(e) => toggleFlag(r, c, e)}
                        disabled={cell.isRevealed}
                        className={`aspect-square w-full font-pixelify font-black text-sm sm:text-base flex items-center justify-center border transition-all ${
                          cell.isRevealed
                            ? isExplodedMine
                              ? "bg-rose-600 border-rose-400 text-white animate-pulse"
                              : cell.hasMine
                              ? "bg-red-950/80 border-rose-500 text-rose-300"
                              : "bg-[#042010] border-[#064e3b]/40 text-emerald-100"
                            : cell.isFlagged
                            ? "bg-[#064e3b] border-[#bef264] text-white hover:brightness-110"
                            : "bg-[#033b1f] hover:bg-[#044c28] border-t-[#34d399] border-l-[#34d399] border-r-[#021d0e] border-b-[#021d0e] active:bg-[#022c15]"
                        }`}
                      >
                        {cell.isRevealed ? (
                          cell.hasMine ? (
                            "💣"
                          ) : cell.neighborMines > 0 ? (
                            <span className={NUMBER_COLORS[cell.neighborMines] || "text-white"}>
                              {cell.neighborMines}
                            </span>
                          ) : (
                            ""
                          )
                        ) : cell.isFlagged ? (
                          "🚩"
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Game Over / Victory Leaderboard Overlay */}
              {(gameOver || gameWon) && (
                <div
                  className="absolute inset-0 bg-[#020e06]/95 backdrop-blur-xs flex flex-col justify-between p-3 sm:p-4 text-white z-20 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top Status */}
                  <div className="text-center">
                    <div
                      className={`font-pixelify font-black text-lg sm:text-xl tracking-wider flex items-center justify-center gap-2 ${
                        gameWon ? "text-[#bef264]" : "text-[#f43f5e]"
                      }`}
                    >
                      <span>{gameWon ? "🏆" : "💣"}</span>
                      <span>{gameWon ? "GRID DEFUSED! YOU WON!" : "MINE DETONATED! GAME OVER"}</span>
                      <span>{gameWon ? "🏆" : "💣"}</span>
                    </div>
                    <div className="font-pixelify text-xs text-emerald-200 mt-0.5">
                      FINAL SCORE: <strong className="text-[#bef264] text-base">{score}</strong>
                      <span className="mx-2">•</span>
                      TIME: <strong className="text-white">{seconds}s</strong>
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
                        <span>TOP 10 SWEEPERS (GIST SYNC)</span>
                      </div>
                      <span className="text-[10px] text-teal-300">
                        {isLoadingLeaderboard ? "SYNCING..." : "LIVE"}
                      </span>
                    </div>

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
                                {entry.score}
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

            {/* Bottom Controls Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-pixelify text-emerald-200 pt-1">
              <div>
                💣 <strong className="text-white">Tip:</strong> Left Click to Dig • Right Click to Flag 🚩 (or toggle button on touch)
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={restartGame}
                  className="pixel-btn text-xs font-pixelify font-bold px-2.5 py-1 bg-[#047857] hover:bg-[#059669] text-white"
                >
                  ↺ NEW GAME
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
