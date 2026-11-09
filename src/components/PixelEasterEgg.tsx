"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { PixelWindow } from "./PixelWindow";
import { sound } from "@/lib/sound";
import { LeaderboardEntry, getLeaderboard, submitLeaderboardScore } from "@/lib/leaderboard";
import { toArcadeCallsign } from "@/lib/anticheat";

interface PixelEasterEggProps {
  onClose: () => void;
  gameId?: string;
}

export const PixelEasterEgg: React.FC<PixelEasterEggProps> = ({
  onClose,
  gameId = "flappy-bird",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const gameStartTimeRef = useRef<number>(Date.now());

  // Leaderboard states
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const gameState = useRef({
    playerY: 150,
    velocity: 0,
    gravity: 0.35,
    jumpForce: -6,
    obstacles: [] as { x: number; top: number; bottom: number; passed?: boolean }[],
    stars: [] as { x: number; y: number; collected?: boolean }[],
    frameCount: 0,
    score: 0,
    isRunning: false,
  });

  // Fetch Leaderboard for this game
  const loadLeaderboard = useCallback(async () => {
    setIsLoadingLeaderboard(true);
    const scores = await getLeaderboard(gameId);
    setLeaderboard(scores);
    setIsLoadingLeaderboard(false);
  }, [gameId]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    if (gameOver) {
      loadLeaderboard();
      setHasSubmitted(false);
      setSubmittedRank(null);
    }
  }, [gameOver, loadLeaderboard]);

  const restartGame = useCallback(() => {
    sound.playBlip();
    gameStartTimeRef.current = Date.now();
    gameState.current = {
      playerY: 150,
      velocity: 0,
      gravity: 0.35,
      jumpForce: -6,
      obstacles: [],
      stars: [],
      frameCount: 0,
      score: 0,
      isRunning: true,
    };
    setGameOver(false);
    setScore(0);
    setHasSubmitted(false);
    setSubmittedRank(null);
    setSubmitError(null);
  }, []);

  const jump = useCallback(() => {
    if (gameOver) {
      // Do nothing on game over! Only clicking the Restart button restarts!
      return;
    }
    sound.playBlip();
    if (!gameStarted) {
      setGameStarted(true);
      gameState.current.isRunning = true;
      gameStartTimeRef.current = Date.now();
    }
    gameState.current.velocity = gameState.current.jumpForce;
  }, [gameStarted, gameOver]);

  // Handle score submission to GitHub Gist
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) {
        // Do not restart on Space / ArrowUp; require clicking the Restart button!
        return;
      }
      if (e.code === "Space" || e.code === "ArrowUp") {
        // If focusing on input, let user type freely
        if (document.activeElement?.tagName === "INPUT") {
          return;
        }
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump, gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const state = gameState.current;
      const W = canvas.width;
      const H = canvas.height;

      // Dark forest cyber background
      ctx.fillStyle = "#030f07";
      ctx.fillRect(0, 0, W, H);

      // Draw background grid lines (retro green cyber grid)
      ctx.strokeStyle = "#062c16";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      if (state.isRunning && !gameOver) {
        state.frameCount++;

        // Apply physics
        state.velocity += state.gravity;
        state.playerY += state.velocity;

        // Ground / Ceiling collision
        if (state.playerY > H - 25) {
          state.playerY = H - 25;
          sound.playClick();
          setGameOver(true);
          state.isRunning = false;
        }
        if (state.playerY < 10) {
          state.playerY = 10;
          state.velocity = 0;
        }

        // Spawn obstacles
        if (state.frameCount % 90 === 0) {
          const gap = 110;
          const topHeight = Math.floor(Math.random() * (H - gap - 60)) + 30;
          state.obstacles.push({
            x: W,
            top: topHeight,
            bottom: topHeight + gap,
          });

          // Chance to spawn Flutter Gem
          state.stars.push({
            x: W + 15,
            y: topHeight + gap / 2,
          });
        }

        // Update obstacles
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
          const obs = state.obstacles[i];
          obs.x -= 2.5;

          // Check pass
          if (!obs.passed && obs.x < 50) {
            obs.passed = true;
            state.score += 10;
            setScore(state.score);
            setHighScore((prev) => Math.max(prev, state.score));
            sound.playClick();
          }

          // Check collision with player
          if (
            obs.x < 50 + 18 &&
            obs.x + 35 > 50 &&
            (state.playerY < obs.top || state.playerY + 18 > obs.bottom)
          ) {
            sound.playClick();
            setGameOver(true);
            state.isRunning = false;
          }

          if (obs.x < -40) {
            state.obstacles.splice(i, 1);
          }
        }

        // Update Stars / Gems
        for (let i = state.stars.length - 1; i >= 0; i--) {
          const s = state.stars[i];
          s.x -= 2.5;

          // Check collect
          if (!s.collected && Math.hypot(s.x - 59, s.y - (state.playerY + 9)) < 20) {
            s.collected = true;
            state.score += 50;
            setScore(state.score);
            setHighScore((prev) => Math.max(prev, state.score));
            sound.playHeart();
          }

          if (s.x < -30) {
            state.stars.splice(i, 1);
          }
        }
      }

      // Draw Obstacles (Cyber Pillars)
      for (const obs of state.obstacles) {
        ctx.fillStyle = "#047857";
        ctx.fillRect(obs.x, 0, 32, obs.top);
        ctx.fillRect(obs.x, obs.bottom, 32, H - obs.bottom);

        // Neon border
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, 0, 32, obs.top);
        ctx.strokeRect(obs.x, obs.bottom, 32, H - obs.bottom);
      }

      // Draw Flutter Gems
      for (const s of state.stars) {
        if (!s.collected) {
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(s.x - 6, s.y - 6, 12, 12);
          ctx.fillStyle = "#bef264";
          ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
        }
      }

      // Draw Player: Pixel Flutter Bot
      ctx.fillStyle = "#0284c7"; // Flutter Blue
      ctx.fillRect(50, Math.floor(state.playerY), 18, 18);
      ctx.fillStyle = "#38bdf8"; // Light Blue Wing
      ctx.fillRect(46, Math.floor(state.playerY) + 5, 6, 8);
      ctx.fillStyle = "#ffffff"; // Eye
      ctx.fillRect(60, Math.floor(state.playerY) + 3, 5, 5);
      ctx.fillStyle = "#0f172a"; // Pupil
      ctx.fillRect(62, Math.floor(state.playerY) + 4, 2, 2);
      ctx.fillStyle = "#f59e0b"; // Beak
      ctx.fillRect(68, Math.floor(state.playerY) + 6, 5, 5);

      // Overlay if not started
      if (!gameStarted) {
        ctx.fillStyle = "rgba(4, 20, 10, 0.8)";
        ctx.fillRect(0, 0, W, H);
        ctx.font = "14px monospace";
        ctx.fillStyle = "#bef264";
        ctx.textAlign = "center";
        ctx.fillText("FLUTTER SPACE RUNNER", W / 2, H / 2 - 20);
        ctx.font = "11px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("TAP OR PRESS SPACEBAR TO JUMP", W / 2, H / 2 + 10);
      }

      // Overlay if Game Over
      if (gameOver) {
        ctx.fillStyle = "rgba(4, 20, 10, 0.88)";
        ctx.fillRect(0, 0, W, H);
        ctx.font = "16px monospace";
        ctx.fillStyle = "#f43f5e";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER!", W / 2, H / 2 - 25);
        ctx.font = "12px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`SCORE: ${state.score}`, W / 2, H / 2);
        ctx.font = "10px monospace";
        ctx.fillStyle = "#34d399";
        ctx.fillText("CLICK PLAY AGAIN TO RETRY", W / 2, H / 2 + 25);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameStarted, gameOver]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <PixelWindow
          title="Flutter_Quest_Arcade.exe"
          onClose={onClose}
          showMediaFooter={false}
        >
          <div className="space-y-4">
            {/* Top Score HUD */}
            <div className="flex items-center justify-between font-pixelify font-bold text-sm bg-[#041a0d] border border-[#059669] p-2.5">
              <div>
                <span className="text-emerald-300">SCORE: </span>
                <span className="text-[#bef264]">{score}</span>
              </div>
              <div>
                <span className="text-teal-300">HI-SCORE: </span>
                <span className="text-[#38bdf8]">{highScore}</span>
              </div>
            </div>

            {/* Canvas Screen */}
            <div
              className="border-4 border-[#34d399] shadow-[0_0_15px_rgba(52,211,153,0.4)] cursor-pointer overflow-hidden relative"
              onClick={jump}
            >
              <canvas
                ref={canvasRef}
                width={500}
                height={300}
                className="w-full h-auto block"
              />

              {/* Game Over Leaderboard Overlay */}
              {gameOver && (
                <div
                  className="absolute inset-0 bg-[#020e06]/94 backdrop-blur-xs flex flex-col justify-between p-2 sm:p-3 text-white z-20 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top Game Over Header */}
                  <div className="text-center">
                    <div className="font-pixelify font-black text-base sm:text-xl text-[#f43f5e] tracking-wider flex items-center justify-center gap-1.5">
                      <span>💀</span>
                      <span>GAME OVER</span>
                      <span>💀</span>
                    </div>
                    <div className="font-pixelify text-xs text-emerald-200">
                      SCORE: <strong className="text-[#bef264]">{score}</strong> • HI-SCORE: <strong className="text-[#38bdf8]">{highScore}</strong>
                    </div>
                  </div>

                  {/* Leaderboard Table (GitHub Gist Top 10) */}
                  <div
                    className="bg-[#03170c] border border-[#10b981] p-2 my-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-[#064e3b] pb-1 mb-1 font-pixelify font-bold text-xs text-[#bef264]">
                      <div className="flex items-center gap-1.5">
                        <span>🏆</span>
                        <span>TOP 10 PILOTS (GIST SYNC)</span>
                      </div>
                      <span className="text-[10px] text-teal-300">
                        {isLoadingLeaderboard ? "SYNCING..." : "LIVE"}
                      </span>
                    </div>

                    {/* 2-Column Grid of Top 10 */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 font-pixelify text-[11px]">
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
                              className={`flex items-center justify-between px-1.5 py-0.5 border ${
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
                              <div className="flex items-center gap-1 truncate max-w-[70%]">
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
                      <div className="mt-1.5 pt-1.5 border-t border-[#064e3b] space-y-1">
                        <form
                          onSubmit={handleSubmitScore}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5"
                        >
                          <span className="font-pixelify text-[11px] text-mint-200 hidden sm:inline whitespace-nowrap">
                            CALLSIGN:
                          </span>
                          <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            onBlur={() => setPlayerName((prev) => toArcadeCallsign(prev, 18))}
                            placeholder="NAME (VI/EN -> ARCADE)"
                            maxLength={24}
                            className="flex-1 bg-[#020e06] border border-[#34d399] px-2 py-0.5 font-pixelify text-xs text-[#bef264] tracking-wider focus:outline-none focus:border-[#bef264] uppercase"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            type="submit"
                            disabled={isSubmitting || !playerName.trim()}
                            className="pixel-btn text-[11px] font-pixelify font-bold px-2.5 py-0.5 bg-[#059669] hover:bg-[#10b981] text-white whitespace-nowrap disabled:opacity-50"
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
                      <div className="mt-1 pt-1 border-t border-[#064e3b] text-center font-pixelify text-[11px] text-[#bef264]">
                        ★ RECORD SAVED TO GITHUB GIST (RANK #{submittedRank || "TOP 10"})!
                      </div>
                    ) : null}

                    {submitError && (
                      <div className="mt-1 text-center font-pixelify text-[10px] text-rose-400">
                        ⚠ {submitError}
                      </div>
                    )}
                  </div>

                  {/* Action Restart Button */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        restartGame();
                      }}
                      className="pixel-btn text-xs sm:text-sm font-pixelify font-bold px-6 py-1.5 bg-[#059669] hover:bg-[#10b981] text-white border-2 border-[#a7f3d0] shadow-[3px_3px_0_#01170b] cursor-pointer inline-flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                    >
                      <span className="text-base">↺</span>
                      <span>PLAY AGAIN</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Controls Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-pixelify font-semibold text-emerald-200">
              <div>
                🎮 <strong className="text-white">Controls:</strong> Spacebar / Click / Tap to Flap
              </div>
              <button
                type="button"
                onClick={onClose}
                className="pixel-btn text-xs font-pixelify font-bold px-3 py-1 bg-[#e11d48]"
              >
                EXIT [✕]
              </button>
            </div>
          </div>
        </PixelWindow>
      </div>
    </div>
  );
};
