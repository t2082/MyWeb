"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { PixelWindow } from "./PixelWindow";
import { sound } from "@/lib/sound";
import { LeaderboardEntry, getLeaderboard, submitLeaderboardScore } from "@/lib/leaderboard";
import { toArcadeCallsign } from "@/lib/anticheat";
import confetti from "canvas-confetti";

interface SpaceShooterGameProps {
  onClose: () => void;
  gameId?: string;
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isEnemy?: boolean;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  type: "grunt" | "cruiser" | "bomber" | "boss";
  vx: number;
  vy: number;
  shootCooldown: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface PowerUp {
  x: number;
  y: number;
  type: "triple" | "shield" | "bomb" | "heart";
}

export const SpaceShooterGame: React.FC<SpaceShooterGameProps> = ({
  onClose,
  gameId = "space-shooter",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game UI States
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [tripleShotActive, setTripleShotActive] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // Leaderboard states
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const gameStartTimeRef = useRef<number>(Date.now());

  // Mutable Game Loop State
  const state = useRef({
    playerX: 240,
    playerY: 480,
    playerSpeed: 6,
    invulnerableFrames: 0,
    keys: { left: false, right: false, up: false, down: false, shoot: false },
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    powerups: [] as PowerUp[],
    stars: [] as Star[],
    frameCount: 0,
    lastShotFrame: 0,
    tripleShotFrames: 0,
    hasShield: false,
    lives: 3,
    score: 0,
    isRunning: false,
    bossSpawnScore: 400,
  });

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

  useEffect(() => {
    if (gameOver) {
      loadLeaderboard();
      setHasSubmitted(false);
      setSubmittedRank(null);
      setSubmitError(null);
    }
  }, [gameOver, loadLeaderboard]);

  // Restart Game
  const restartGame = useCallback(() => {
    sound.playBlip();
    gameStartTimeRef.current = Date.now();
    state.current = {
      playerX: 240,
      playerY: 480,
      playerSpeed: 6,
      invulnerableFrames: 0,
      keys: { left: false, right: false, up: false, down: false, shoot: false },
      bullets: [],
      enemies: [],
      particles: [],
      powerups: [],
      stars: state.current.stars,
      frameCount: 0,
      lastShotFrame: 0,
      tripleShotFrames: 0,
      hasShield: false,
      lives: 3,
      score: 0,
      isRunning: true,
      bossSpawnScore: 400,
    };
    setGameOver(false);
    setScore(0);
    setLives(3);
    setHasShield(false);
    setTripleShotActive(false);
    setHasSubmitted(false);
    setSubmittedRank(null);
    setSubmitError(null);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in callsign input
      if (document.activeElement?.tagName === "INPUT") return;

      if (gameOver) {
        // Explicitly require clicking button to restart!
        return;
      }

      if (!gameStarted && (e.code === "Space" || e.key.startsWith("Arrow"))) {
        setGameStarted(true);
        state.current.isRunning = true;
        gameStartTimeRef.current = Date.now();
      }

      if (e.code === "ArrowLeft" || e.code === "KeyA") state.current.keys.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") state.current.keys.right = true;
      if (e.code === "ArrowUp" || e.code === "KeyW") state.current.keys.up = true;
      if (e.code === "ArrowDown" || e.code === "KeyS") state.current.keys.down = true;
      if (e.code === "Space") {
        e.preventDefault();
        state.current.keys.shoot = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;

      if (e.code === "ArrowLeft" || e.code === "KeyA") state.current.keys.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") state.current.keys.right = false;
      if (e.code === "ArrowUp" || e.code === "KeyW") state.current.keys.up = false;
      if (e.code === "ArrowDown" || e.code === "KeyS") state.current.keys.down = false;
      if (e.code === "Space") state.current.keys.shoot = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameStarted, gameOver]);

  // Touch & Pointer move support
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!canvasRef.current || gameOver) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 480 / rect.width;
    const targetX = (e.clientX - rect.left) * scaleX;
    state.current.playerX = Math.max(20, Math.min(460, targetX));
  };

  const handlePointerDown = () => {
    if (gameOver) return;
    if (!gameStarted) {
      setGameStarted(true);
      state.current.isRunning = true;
      gameStartTimeRef.current = Date.now();
    }
    state.current.keys.shoot = true;
  };

  const handlePointerUp = () => {
    state.current.keys.shoot = false;
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

  // Trigger screen bomb
  const triggerBomb = () => {
    sound.playExplosion();
    const s = state.current;
    // Wipe all non-boss enemies
    for (const enemy of s.enemies) {
      if (enemy.type !== "boss") {
        createExplosion(enemy.x, enemy.y, "#f59e0b", 12);
        s.score += enemy.type === "grunt" ? 10 : 20;
      }
    }
    s.enemies = s.enemies.filter((e) => e.type === "boss");
    s.bullets = s.bullets.filter((b) => !b.isEnemy);
    setScore(s.score);
  };

  function createExplosion(x: number, y: number, color: string, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      state.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.floor(Math.random() * 20) + 15,
        color,
      });
    }
  }

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 480;
    const H = 540;

    // Generate background stars
    if (state.current.stars.length === 0) {
      for (let i = 0; i < 60; i++) {
        state.current.stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          size: Math.random() > 0.8 ? 2 : 1,
          speed: Math.random() * 1.5 + 0.5,
          color: Math.random() > 0.5 ? "#38bdf8" : "#ffffff",
        });
      }
    }

    let animId: number;

    const loop = () => {
      const s = state.current;

      // 1. Clear background
      ctx.fillStyle = "#020904";
      ctx.fillRect(0, 0, W, H);

      // 2. Update & Draw Stars
      for (const star of s.stars) {
        star.y += star.speed;
        if (star.y > H) {
          star.y = 0;
          star.x = Math.random() * W;
        }
        ctx.fillStyle = star.color;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }

      if (s.isRunning && !gameOver) {
        s.frameCount++;

        // Triple shot timer
        if (s.tripleShotFrames > 0) {
          s.tripleShotFrames--;
          if (s.tripleShotFrames === 0) {
            setTripleShotActive(false);
          }
        }

        // Invulnerable frames
        if (s.invulnerableFrames > 0) {
          s.invulnerableFrames--;
        }

        // Player Movement
        if (s.keys.left) s.playerX -= s.playerSpeed;
        if (s.keys.right) s.playerX += s.playerSpeed;
        if (s.keys.up) s.playerY -= s.playerSpeed;
        if (s.keys.down) s.playerY += s.playerSpeed;

        s.playerX = Math.max(18, Math.min(W - 18, s.playerX));
        s.playerY = Math.max(200, Math.min(H - 24, s.playerY));

        // Player Fire Lasers (every 10 frames if holding space/pointer)
        if (s.keys.shoot && s.frameCount - s.lastShotFrame >= 9) {
          s.lastShotFrame = s.frameCount;
          sound.playLaser();

          if (s.tripleShotFrames > 0) {
            // Triple spread
            s.bullets.push({ x: s.playerX, y: s.playerY - 14, vx: 0, vy: -9 });
            s.bullets.push({ x: s.playerX - 10, y: s.playerY - 10, vx: -2.5, vy: -8.5 });
            s.bullets.push({ x: s.playerX + 10, y: s.playerY - 10, vx: 2.5, vy: -8.5 });
          } else {
            // Dual laser
            s.bullets.push({ x: s.playerX - 6, y: s.playerY - 14, vx: 0, vy: -9 });
            s.bullets.push({ x: s.playerX + 6, y: s.playerY - 14, vx: 0, vy: -9 });
          }
        }

        // Spawn Boss or Normal Enemies
        if (s.score >= s.bossSpawnScore && !s.enemies.some((e) => e.type === "boss")) {
          // Spawn Boss
          s.enemies.push({
            id: s.frameCount,
            x: W / 2,
            y: -50,
            w: 64,
            h: 40,
            hp: 25,
            maxHp: 25,
            type: "boss",
            vx: 2,
            vy: 0.8,
            shootCooldown: 60,
          });
          s.bossSpawnScore += 500;
        } else if (s.frameCount % 45 === 0) {
          // Regular enemies
          const rand = Math.random();
          if (rand < 0.5) {
            // Grunt
            s.enemies.push({
              id: s.frameCount,
              x: Math.random() * (W - 40) + 20,
              y: -20,
              w: 24,
              h: 20,
              hp: 1,
              maxHp: 1,
              type: "grunt",
              vx: Math.sin(s.frameCount) * 2,
              vy: 2.2,
              shootCooldown: 999,
            });
          } else if (rand < 0.8) {
            // Cruiser
            s.enemies.push({
              id: s.frameCount,
              x: Math.random() * (W - 40) + 20,
              y: -20,
              w: 28,
              h: 22,
              hp: 2,
              maxHp: 2,
              type: "cruiser",
              vx: 0,
              vy: 3.2,
              shootCooldown: 999,
            });
          } else {
            // Bomber
            s.enemies.push({
              id: s.frameCount,
              x: Math.random() * (W - 40) + 20,
              y: -20,
              w: 32,
              h: 24,
              hp: 3,
              maxHp: 3,
              type: "bomber",
              vx: (Math.random() - 0.5) * 1.5,
              vy: 1.5,
              shootCooldown: 60,
            });
          }
        }

        // Update Enemies
        for (let i = s.enemies.length - 1; i >= 0; i--) {
          const e = s.enemies[i];
          e.y += e.vy;
          e.x += e.vx;

          if (e.type === "boss") {
            if (e.y > 60) e.vy = 0;
            if (e.x < 50 || e.x > W - 50) e.vx *= -1;

            e.shootCooldown--;
            if (e.shootCooldown <= 0) {
              e.shootCooldown = 55;
              // Boss spread fire
              s.bullets.push({ x: e.x - 15, y: e.y + 20, vx: -1.5, vy: 4, isEnemy: true });
              s.bullets.push({ x: e.x, y: e.y + 20, vx: 0, vy: 4.5, isEnemy: true });
              s.bullets.push({ x: e.x + 15, y: e.y + 20, vx: 1.5, vy: 4, isEnemy: true });
            }
          } else if (e.type === "bomber") {
            e.shootCooldown--;
            if (e.shootCooldown <= 0) {
              e.shootCooldown = 90;
              s.bullets.push({ x: e.x, y: e.y + 12, vx: 0, vy: 3.5, isEnemy: true });
            }
          }

          // Off-screen removal
          if (e.y > H + 40) {
            s.enemies.splice(i, 1);
            continue;
          }

          // Collision with Player
          if (
            s.invulnerableFrames <= 0 &&
            Math.abs(e.x - s.playerX) < (e.w / 2 + 12) &&
            Math.abs(e.y - s.playerY) < (e.h / 2 + 12)
          ) {
            takeDamage();
            if (e.type !== "boss") {
              createExplosion(e.x, e.y, "#f43f5e", 12);
              s.enemies.splice(i, 1);
            }
          }
        }

        // Update Bullets
        for (let i = s.bullets.length - 1; i >= 0; i--) {
          const b = s.bullets[i];
          b.x += b.vx;
          b.y += b.vy;

          if (b.y < -20 || b.y > H + 20 || b.x < -20 || b.x > W + 20) {
            s.bullets.splice(i, 1);
            continue;
          }

          if (b.isEnemy) {
            // Hit Player?
            if (
              s.invulnerableFrames <= 0 &&
              Math.hypot(b.x - s.playerX, b.y - s.playerY) < 14
            ) {
              s.bullets.splice(i, 1);
              takeDamage();
            }
          } else {
            // Hit Enemies?
            for (let j = s.enemies.length - 1; j >= 0; j--) {
              const enemy = s.enemies[j];
              if (
                Math.abs(b.x - enemy.x) < enemy.w / 2 + 4 &&
                Math.abs(b.y - enemy.y) < enemy.h / 2 + 4
              ) {
                // Bullet hit enemy!
                s.bullets.splice(i, 1);
                enemy.hp--;
                createExplosion(b.x, b.y, "#38bdf8", 4);

                if (enemy.hp <= 0) {
                  sound.playExplosion();
                  createExplosion(
                    enemy.x,
                    enemy.y,
                    enemy.type === "boss" ? "#f59e0b" : "#4ade80",
                    enemy.type === "boss" ? 25 : 12
                  );

                  // Points
                  const pts =
                    enemy.type === "boss"
                      ? 200
                      : enemy.type === "bomber"
                      ? 30
                      : enemy.type === "cruiser"
                      ? 20
                      : 10;
                  s.score += pts;
                  setScore(s.score);
                  setHighScore((h) => Math.max(h, s.score));

                  // Power-up Drop Chance
                  const dropRoll = Math.random();
                  if (enemy.type === "boss" || dropRoll < 0.15) {
                    const powerType: PowerUp["type"] =
                      enemy.type === "boss"
                        ? "triple"
                        : dropRoll < 0.05
                        ? "bomb"
                        : dropRoll < 0.1
                        ? "shield"
                        : "heart";
                    s.powerups.push({ x: enemy.x, y: enemy.y, type: powerType });
                  }

                  s.enemies.splice(j, 1);
                }
                break;
              }
            }
          }
        }

        // Update Powerups
        for (let i = s.powerups.length - 1; i >= 0; i--) {
          const p = s.powerups[i];
          p.y += 1.8;

          if (p.y > H + 20) {
            s.powerups.splice(i, 1);
            continue;
          }

          // Player collects powerup
          if (Math.hypot(p.x - s.playerX, p.y - s.playerY) < 22) {
            sound.playPowerup();
            if (p.type === "triple") {
              s.tripleShotFrames = 600; // 10 seconds
              setTripleShotActive(true);
            } else if (p.type === "shield") {
              s.hasShield = true;
              setHasShield(true);
            } else if (p.type === "bomb") {
              triggerBomb();
            } else if (p.type === "heart") {
              s.lives = Math.min(3, s.lives + 1);
              setLives(s.lives);
            }
            createExplosion(p.x, p.y, "#facc15", 8);
            s.powerups.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const pt = s.particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life++;
          if (pt.life >= pt.maxLife) {
            s.particles.splice(i, 1);
          }
        }
      }

      function takeDamage() {
        if (s.hasShield) {
          sound.playBlip();
          s.hasShield = false;
          setHasShield(false);
          s.invulnerableFrames = 40;
          createExplosion(s.playerX, s.playerY, "#38bdf8", 15);
          return;
        }

        sound.playExplosion();
        createExplosion(s.playerX, s.playerY, "#f43f5e", 20);
        s.lives--;
        setLives(s.lives);
        s.invulnerableFrames = 80;

        if (s.lives <= 0) {
          s.isRunning = false;
          setGameOver(true);
          confetti({ particleCount: 50, spread: 80 });
        }
      }

      // 3. Render Particles
      for (const pt of s.particles) {
        ctx.fillStyle = pt.color;
        const alpha = 1 - pt.life / pt.maxLife;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillRect(pt.x - 1.5, pt.y - 1.5, 3, 3);
        ctx.globalAlpha = 1.0;
      }

      // 4. Render Bullets
      for (const b of s.bullets) {
        if (b.isEnemy) {
          ctx.fillStyle = "#f43f5e";
          ctx.fillRect(b.x - 2, b.y - 4, 4, 8);
          ctx.fillStyle = "#fecdd3";
          ctx.fillRect(b.x - 1, b.y - 2, 2, 4);
        } else {
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(b.x - 2, b.y - 5, 4, 10);
          ctx.fillStyle = "#bef264";
          ctx.fillRect(b.x - 1, b.y - 3, 2, 6);
        }
      }

      // 5. Render Power-ups
      for (const p of s.powerups) {
        ctx.fillStyle =
          p.type === "triple"
            ? "#38bdf8"
            : p.type === "shield"
            ? "#06b6d4"
            : p.type === "bomb"
            ? "#f97316"
            : "#ec4899";
        ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x - 8, p.y - 8, 16, 16);

        ctx.font = "10px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(
          p.type === "triple" ? "3" : p.type === "shield" ? "S" : p.type === "bomb" ? "B" : "♥",
          p.x,
          p.y + 3.5
        );
      }

      // 6. Render Enemies
      for (const e of s.enemies) {
        if (e.type === "boss") {
          // Boss Dreadnought
          ctx.fillStyle = "#dc2626";
          ctx.fillRect(e.x - 30, e.y - 15, 60, 30);
          ctx.fillStyle = "#991b1b";
          ctx.fillRect(e.x - 24, e.y - 10, 48, 20);
          ctx.fillStyle = "#facc15";
          ctx.fillRect(e.x - 8, e.y - 5, 16, 10);

          // HP Bar
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(e.x - 25, e.y - 22, 50, 4);
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(e.x - 25, e.y - 22, 50 * (e.hp / e.maxHp), 4);
        } else if (e.type === "bomber") {
          // Bomber (Red)
          ctx.fillStyle = "#e11d48";
          ctx.fillRect(e.x - 14, e.y - 10, 28, 20);
          ctx.fillStyle = "#fda4af";
          ctx.fillRect(e.x - 6, e.y - 4, 12, 8);
        } else if (e.type === "cruiser") {
          // Cruiser (Purple)
          ctx.fillStyle = "#8b5cf6";
          ctx.fillRect(e.x - 12, e.y - 8, 24, 16);
          ctx.fillStyle = "#c4b5fd";
          ctx.fillRect(e.x - 4, e.y - 3, 8, 6);
        } else {
          // Grunt (Green)
          ctx.fillStyle = "#10b981";
          ctx.fillRect(e.x - 10, e.y - 8, 20, 16);
          ctx.fillStyle = "#bef264";
          ctx.fillRect(e.x - 4, e.y - 4, 8, 8);
        }
      }

      // 7. Render Player Ship
      if (s.lives > 0) {
        const isBlinking = s.invulnerableFrames > 0 && Math.floor(s.frameCount / 4) % 2 === 0;
        if (!isBlinking) {
          // Ship Body (Pixel Starfighter)
          ctx.fillStyle = "#0284c7"; // Blue hull
          ctx.fillRect(s.playerX - 10, s.playerY - 8, 20, 16);
          ctx.fillStyle = "#38bdf8"; // Cockpit
          ctx.fillRect(s.playerX - 4, s.playerY - 14, 8, 12);
          ctx.fillStyle = "#bef264"; // Wingtips
          ctx.fillRect(s.playerX - 16, s.playerY - 2, 6, 12);
          ctx.fillRect(s.playerX + 10, s.playerY - 2, 6, 12);

          // Thruster fire animation
          const flameH = (s.frameCount % 4) + 6;
          ctx.fillStyle = "#f59e0b";
          ctx.fillRect(s.playerX - 3, s.playerY + 8, 6, flameH);
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(s.playerX - 1, s.playerY + 8, 2, flameH + 2);

          // Energy Shield Aura
          if (s.hasShield) {
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(s.playerX, s.playerY - 2, 22, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      // 8. Start Screen Overlay
      if (!gameStarted) {
        ctx.fillStyle = "rgba(2, 14, 6, 0.82)";
        ctx.fillRect(0, 0, W, H);

        ctx.font = "bold 16px monospace";
        ctx.fillStyle = "#bef264";
        ctx.textAlign = "center";
        ctx.fillText("SPACE INVADERS ARCADE", W / 2, H / 2 - 30);

        ctx.font = "12px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("ARROW KEYS / DRAG TO MOVE", W / 2, H / 2);
        ctx.fillText("SPACEBAR / TAP TO FIRE", W / 2, H / 2 + 25);

        ctx.font = "11px monospace";
        ctx.fillStyle = "#38bdf8";
        ctx.fillText("COLLECT 3 (TRIPLE), S (SHIELD), B (BOMB)", W / 2, H / 2 + 55);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameStarted, gameOver]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <PixelWindow
          title="Space_Shooter_Galaxy.exe (Retro Arcade)"
          onClose={onClose}
          showMediaFooter={false}
        >
          <div className="space-y-3">
            {/* Top HUD: Score, Lives, Shields */}
            <div className="flex items-center justify-between font-pixelify font-bold text-xs sm:text-sm bg-[#041a0d] border border-[#059669] p-2.5">
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-emerald-300">SCORE: </span>
                  <span className="text-[#bef264] text-base">{score}</span>
                </div>
                <div>
                  <span className="text-teal-300">HI-SCORE: </span>
                  <span className="text-[#38bdf8]">{highScore}</span>
                </div>
              </div>

              {/* Status Perks & Lives */}
              <div className="flex items-center gap-2">
                {tripleShotActive && (
                  <span className="bg-sky-950 border border-sky-400 text-sky-200 text-[10px] px-1.5 py-0.5 animate-pulse">
                    ★ TRIPLE SHOT
                  </span>
                )}
                {hasShield && (
                  <span className="bg-cyan-950 border border-cyan-400 text-cyan-200 text-[10px] px-1.5 py-0.5 animate-pulse">
                    🛡️ SHIELD
                  </span>
                )}
                <div className="flex items-center gap-1 text-sm">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={i < lives ? "text-rose-500" : "text-slate-600"}>
                      ♥
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas Screen */}
            <div
              className="border-4 border-[#34d399] bg-[#020904] shadow-[0_0_20px_rgba(52,211,153,0.3)] overflow-hidden relative cursor-crosshair touch-none"
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            >
              <canvas
                ref={canvasRef}
                width={480}
                height={540}
                className="w-full h-auto block max-h-[60vh] object-contain mx-auto"
              />

              {/* Game Over Leaderboard Overlay */}
              {gameOver && (
                <div
                  className="absolute inset-0 bg-[#020e06]/95 backdrop-blur-xs flex flex-col justify-between p-3 sm:p-4 text-white z-20 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Status */}
                  <div className="text-center">
                    <div className="font-pixelify font-black text-lg sm:text-2xl text-[#f43f5e] tracking-wider flex items-center justify-center gap-2">
                      <span>🚀</span>
                      <span>SHIP DESTROYED! GAME OVER</span>
                      <span>🚀</span>
                    </div>
                    <div className="font-pixelify text-xs sm:text-sm text-emerald-200 mt-0.5">
                      FINAL SCORE: <strong className="text-[#bef264] text-base sm:text-lg">{score}</strong>
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
                        <span>TOP 10 PILOTS (GIST SYNC)</span>
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
                🚀 <strong className="text-white">Controls:</strong> Arrow Keys / Drag to Move • Spacebar / Tap to Shoot
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={restartGame}
                  className="pixel-btn text-xs font-pixelify font-bold px-2.5 py-1 bg-[#047857] hover:bg-[#059669] text-white"
                >
                  ↺ RESTART
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
