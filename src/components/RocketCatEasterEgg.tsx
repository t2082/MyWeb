"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { sound } from "@/lib/sound";
import confetti from "canvas-confetti";

interface RocketCatEasterEggProps {
  isGameActive: boolean; // True when folder or any mini-game is open
}

type CatState = "hidden" | "flying" | "exploding" | "falling" | "angry" | "walking_away";

export const RocketCatEasterEgg: React.FC<RocketCatEasterEggProps> = ({ isGameActive }) => {
  const [state, setState] = useState<CatState>("hidden");
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -100, y: 150 });
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr"); // Left-to-right or Right-to-left
  const [rotation, setRotation] = useState<number>(0);
  const [walkFrame, setWalkFrame] = useState<number>(0);

  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mutable animation state
  const animState = useRef({
    x: -120,
    y: 150,
    baseY: 150,
    speed: 3.2,
    vx: 3.2,
    vy: 0,
    rot: 0,
    t: 0,
    targetGroundY: 500,
    walkDir: 1, // 1 = right, -1 = left
  });

  // Schedule the next flyby
  const scheduleNextFlight = useCallback((delayMs?: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const delay = delayMs ?? Math.floor(Math.random() * 20000) + 18000; // 18s - 38s
    timerRef.current = setTimeout(() => {
      startFlight();
    }, delay);
  }, []);

  // Launch a new flight
  const startFlight = useCallback(() => {
    if (isGameActive) {
      scheduleNextFlight(8000);
      return;
    }

    const windowW = typeof window !== "undefined" ? window.innerWidth : 1200;
    const windowH = typeof window !== "undefined" ? window.innerHeight : 800;

    // 50% chance left-to-right, 50% right-to-left
    const isLtr = Math.random() > 0.5;
    const startX = isLtr ? -120 : windowW + 120;
    const randomY = Math.floor(Math.random() * (windowH * 0.5)) + 90; // altitude between 90px and 50% screen

    setDirection(isLtr ? "ltr" : "rtl");
    setRotation(0);

    animState.current = {
      x: startX,
      y: randomY,
      baseY: randomY,
      speed: isLtr ? 3.2 : -3.2,
      vx: isLtr ? 3.2 : -3.2,
      vy: 0,
      rot: 0,
      t: 0,
      targetGroundY: windowH - 84,
      walkDir: isLtr ? 1 : -1,
    };

    setPos({ x: startX, y: randomY });
    setState("flying");
  }, [isGameActive, scheduleNextFlight]);

  // Initial flight after 5 seconds
  useEffect(() => {
    scheduleNextFlight(5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [scheduleNextFlight]);

  // If a game becomes active while the cat is flying or active, abort!
  useEffect(() => {
    if (isGameActive && state !== "hidden") {
      setState("hidden");
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      scheduleNextFlight(15000);
    }
  }, [isGameActive, state, scheduleNextFlight]);

  // Handle Rocket Click -> Explosion!
  const handleRocketClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (state !== "flying") return;

    sound.playExplosion();
    const currentX = animState.current.x;
    const currentY = animState.current.y;

    // Burst confetti particles around the rocket
    if (typeof window !== "undefined") {
      const originX = Math.max(0, Math.min(1, currentX / window.innerWidth));
      const originY = Math.max(0, Math.min(1, currentY / window.innerHeight));
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { x: originX, y: originY },
        colors: ["#f59e0b", "#ef4444", "#facc15", "#38bdf8", "#ffffff"],
        zIndex: 9999,
      });
    }

    setState("exploding");

    // Transition to falling cat after brief explosion frame (150ms)
    setTimeout(() => {
      animState.current.vy = -5.5; // Upward pop from blast
      animState.current.vx = animState.current.vx * 0.4;
      animState.current.rot = 0;
      animState.current.targetGroundY = (window.innerHeight || 800) - 84;
      setState("falling");
    }, 180);
  };

  // Main Animation Loop
  useEffect(() => {
    if (state === "hidden") return;

    const loop = () => {
      const s = animState.current;
      const windowW = typeof window !== "undefined" ? window.innerWidth : 1200;
      const windowH = typeof window !== "undefined" ? window.innerHeight : 800;
      s.targetGroundY = windowH - 84;

      // 1. FLYING STATE
      if (state === "flying") {
        s.t += 0.04;
        s.x += s.speed;
        s.y = s.baseY + Math.sin(s.t) * 22; // Smooth sine wave bobbing

        // Slight tilt in direction of wave
        const waveAngle = Math.cos(s.t) * 12;
        s.rot = (direction === "ltr" ? waveAngle : -waveAngle);

        setPos({ x: s.x, y: s.y });
        setRotation(s.rot);

        // Check if flown past screen boundaries
        if ((direction === "ltr" && s.x > windowW + 150) || (direction === "rtl" && s.x < -150)) {
          setState("hidden");
          scheduleNextFlight();
          return;
        }
      }

      // 2. FALLING STATE (Tumbling down to bottom of window)
      else if (state === "falling") {
        s.vy += 0.42; // Gravity
        s.y += s.vy;
        s.x += s.vx * 0.8;
        s.rot += direction === "ltr" ? 14 : -14; // Tumbling spin

        setPos({ x: s.x, y: s.y });
        setRotation(s.rot);

        // Hit the viewport bottom!
        if (s.y >= s.targetGroundY) {
          s.y = s.targetGroundY;
          s.vy = 0;
          s.vx = 0;
          s.rot = 0;
          setPos({ x: s.x, y: s.y });
          setRotation(0);

          sound.playBlip();
          sound.playAngryCat();
          setState("angry");

          // Stay angry for 2 seconds, then stomp away!
          setTimeout(() => {
            // Pick walk direction towards nearest screen boundary
            const walkToRight = s.x > windowW / 2;
            s.walkDir = walkToRight ? 1 : -1;
            setDirection(walkToRight ? "ltr" : "rtl");
            setState("walking_away");
          }, 2000);
          return;
        }
      }

      // 3. WALKING AWAY STATE (Stomping off screen)
      else if (state === "walking_away") {
        s.x += s.walkDir * 2.8;
        setPos({ x: s.x, y: s.y });

        // Cycle walk animation frame every 6 frames
        setWalkFrame((prev) => (prev + 1) % 4);

        // Once fully off screen, hide and schedule next flight
        if (s.x < -90 || s.x > windowW + 90) {
          setState("hidden");
          scheduleNextFlight();
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [state, direction, scheduleNextFlight]);

  if (state === "hidden" || isGameActive) return null;

  return (
    <div
      className="fixed pointer-events-none select-none z-[45]"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* 1. FLYING: CAT RIDING ROCKET */}
      {state === "flying" && (
        <div
          onClick={handleRocketClick}
          className="relative pointer-events-auto cursor-crosshair group hover:scale-110 active:scale-95 transition-transform"
          style={{
            transform: `rotate(${rotation}deg) scaleX(${direction === "rtl" ? -1 : 1})`,
          }}
          title="Click the rocket!"
        >
          {/* Pixel Rocket & Cat SVG Sprite (Enlarged) */}
          <svg
            width="118"
            height="64"
            viewBox="0 0 42 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            className="drop-shadow-[0_6px_14px_rgba(245,158,11,0.6)]"
          >
            {/* Thruster Flame (Flickering Pixel Fire) */}
            <g className="animate-pulse">
              <rect x="0" y="10" width="6" height="4" fill="#facc15" />
              <rect x="2" y="11" width="5" height="2" fill="#ffffff" />
              <rect x="0" y="8" width="4" height="2" fill="#f97316" />
              <rect x="0" y="14" width="4" height="2" fill="#f97316" />
            </g>

            {/* Rocket Thruster Nozzle */}
            <rect x="6" y="9" width="3" height="6" fill="#334155" />

            {/* Rocket Fins */}
            <rect x="9" y="4" width="6" height="4" fill="#dc2626" />
            <rect x="7" y="2" width="4" height="3" fill="#991b1b" />
            <rect x="9" y="16" width="6" height="4" fill="#dc2626" />
            <rect x="7" y="19" width="4" height="3" fill="#991b1b" />

            {/* Rocket Main Body */}
            <rect x="9" y="8" width="20" height="8" fill="#f8fafc" />
            <rect x="15" y="8" width="4" height="8" fill="#ef4444" />
            <rect x="9" y="14" width="20" height="2" fill="#cbd5e1" />

            {/* Rocket Nosecone */}
            <rect x="29" y="9" width="5" height="6" fill="#dc2626" />
            <rect x="34" y="10" width="4" height="4" fill="#ef4444" />
            <rect x="38" y="11" width="3" height="2" fill="#ffffff" />

            {/* THE CAT PILOT (Ginger Pixel Cat riding on top) */}
            {/* Cat Ears */}
            <rect x="19" y="1" width="2" height="2" fill="#f97316" />
            <rect x="20" y="2" width="1" height="1" fill="#fed7aa" />
            <rect x="24" y="1" width="2" height="2" fill="#f97316" />
            <rect x="24" y="2" width="1" height="1" fill="#fed7aa" />

            {/* Cat Head */}
            <rect x="19" y="3" width="7" height="5" fill="#f97316" />
            <rect x="18" y="4" width="9" height="3" fill="#f97316" />

            {/* Aviator Goggles on forehead */}
            <rect x="19" y="3" width="7" height="2" fill="#0f172a" />
            <rect x="20" y="3" width="2" height="1" fill="#38bdf8" />
            <rect x="23" y="3" width="2" height="1" fill="#38bdf8" />

            {/* Cat Eyes */}
            <rect x="20" y="5" width="1" height="1" fill="#0f172a" />
            <rect x="24" y="5" width="1" height="1" fill="#0f172a" />

            {/* Muzzle & Nose */}
            <rect x="21" y="6" width="3" height="2" fill="#ffedd5" />
            <rect x="22" y="6" width="1" height="1" fill="#f43f5e" />

            {/* Paws gripping the rocket */}
            <rect x="17" y="8" width="3" height="2" fill="#ea580c" />
            <rect x="26" y="8" width="3" height="2" fill="#ea580c" />

            {/* Cat Tail trailing behind */}
            <rect x="13" y="6" width="4" height="2" fill="#ea580c" />
            <rect x="11" y="4" width="3" height="2" fill="#f97316" />
          </svg>

          {/* Target Hint Pill on hover */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-[#facc15] px-2.5 py-0.5 text-[10px] font-pixelify text-[#facc15] whitespace-nowrap pointer-events-none shadow-[0_0_10px_#facc15]">
            🎯 CLICK ME!
          </div>
        </div>
      )}

      {/* 2. EXPLODING: BLAST & SPARKS */}
      {state === "exploding" && (
        <div className="relative animate-ping">
          <div className="w-20 h-20 rounded-full bg-amber-400 border-4 border-rose-500 shadow-[0_0_30px_#f97316] flex items-center justify-center text-3xl">
            💥
          </div>
        </div>
      )}

      {/* 3. FALLING: STARTLED CAT TUMBLING DOWN */}
      {state === "falling" && (
        <div
          className="relative transition-transform"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Startled Tumbling Cat Sprite (Enlarged) */}
          <svg
            width="76"
            height="76"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            className="drop-shadow-[0_4px_12px_rgba(239,68,68,0.7)]"
          >
            {/* Ears */}
            <rect x="5" y="4" width="3" height="3" fill="#f97316" />
            <rect x="6" y="5" width="1" height="1" fill="#fed7aa" />
            <rect x="16" y="4" width="3" height="3" fill="#f97316" />
            <rect x="17" y="5" width="1" height="1" fill="#fed7aa" />

            {/* Cat Body & Head */}
            <rect x="6" y="7" width="12" height="10" fill="#f97316" />
            <rect x="7" y="10" width="10" height="6" fill="#ffedd5" />

            {/* Shocked / Wide Eyes */}
            <rect x="8" y="8" width="3" height="3" fill="#ffffff" />
            <rect x="9" y="9" width="1" height="1" fill="#0f172a" />
            <rect x="13" y="8" width="3" height="3" fill="#ffffff" />
            <rect x="14" y="9" width="1" height="1" fill="#0f172a" />

            {/* Open Mouth (Ahhh!) */}
            <rect x="11" y="12" width="2" height="2" fill="#e11d48" />

            {/* Flailing Paws */}
            <rect x="3" y="6" width="3" height="3" fill="#ea580c" />
            <rect x="18" y="6" width="3" height="3" fill="#ea580c" />
            <rect x="4" y="16" width="3" height="3" fill="#ea580c" />
            <rect x="17" y="16" width="3" height="3" fill="#ea580c" />

            {/* Tail */}
            <rect x="11" y="17" width="2" height="5" fill="#ea580c" />
          </svg>
        </div>
      )}

      {/* 4. ANGRY: STANDING ON BOTTOM WITH ANIME ANGER MARK */}
      {state === "angry" && (
        <div className="relative flex flex-col items-center">
          {/* Animated Anger Mark (💢) and Speech Bubble */}
          <div className="absolute -top-14 flex flex-col items-center animate-bounce">
            <div className="bg-[#1e070a] border-2 border-[#ef4444] px-3 py-1.5 text-xs sm:text-sm font-pixelify font-bold text-rose-300 shadow-[0_0_15px_#ef4444] whitespace-nowrap flex items-center gap-1.5">
              <span className="text-base animate-pulse">💢</span>
              <span>*HISSS!* WHO HIT MY ROCKET?!</span>
              <span className="text-base animate-pulse">😾</span>
            </div>
            <div className="w-2.5 h-2.5 bg-[#1e070a] border-r-2 border-b-2 border-[#ef4444] rotate-45 -mt-1" />
          </div>

          {/* Angry Cat Pixel Sprite (Enlarged) */}
          <div className="relative">
            {/* Steam puffs from ears */}
            <div className="absolute -top-4 -left-3 text-sm animate-ping">💨</div>
            <div className="absolute -top-4 -right-3 text-sm animate-ping">💨</div>

            <svg
              width="88"
              height="72"
              viewBox="0 0 24 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
              className="drop-shadow-[0_4px_16px_rgba(239,68,68,0.8)]"
            >
              {/* Ears flattened / pinned back */}
              <rect x="3" y="4" width="4" height="2" fill="#ea580c" />
              <rect x="17" y="4" width="4" height="2" fill="#ea580c" />

              {/* Head */}
              <rect x="5" y="5" width="14" height="7" fill="#f97316" />

              {/* Slanted Angry Eyes (>_<) */}
              <rect x="7" y="7" width="3" height="1" fill="#0f172a" />
              <rect x="8" y="8" width="1" height="1" fill="#0f172a" />
              <rect x="14" y="7" width="3" height="1" fill="#0f172a" />
              <rect x="15" y="8" width="1" height="1" fill="#0f172a" />

              {/* Angry mouth & sharp fangs */}
              <rect x="10" y="9" width="4" height="2" fill="#991b1b" />
              <rect x="10" y="9" width="1" height="1" fill="#ffffff" />
              <rect x="13" y="9" width="1" height="1" fill="#ffffff" />

              {/* Body */}
              <rect x="7" y="12" width="10" height="5" fill="#f97316" />
              <rect x="9" y="12" width="6" height="4" fill="#ffedd5" />

              {/* Front Paws planted angrily */}
              <rect x="6" y="17" width="3" height="3" fill="#ea580c" />
              <rect x="15" y="17" width="3" height="3" fill="#ea580c" />

              {/* Stiff twitching tail */}
              <rect x="17" y="11" width="4" height="2" fill="#ea580c" />
              <rect x="20" y="9" width="2" height="3" fill="#ea580c" />
            </svg>
          </div>
        </div>
      )}

      {/* 5. WALKING AWAY: STOMPING OFF SCREEN */}
      {state === "walking_away" && (
        <div
          className="relative flex flex-col items-center"
          style={{ transform: `scaleX(${direction === "rtl" ? -1 : 1})` }}
        >
          {/* Grumbling thought bubble */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 border border-rose-400 px-2.5 py-0.5 text-xs font-pixelify text-rose-300 whitespace-nowrap shadow-[0_0_10px_rgba(244,63,94,0.5)]">
            *Grrr...* 💢
          </div>

          {/* Stomping Walk Cycle (Enlarged) */}
          <svg
            width="80"
            height="62"
            viewBox="0 0 24 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
            className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]"
          >
            {/* Ears */}
            <rect x="14" y="1" width="2" height="3" fill="#ea580c" />
            <rect x="18" y="1" width="2" height="3" fill="#ea580c" />

            {/* Head facing walking direction */}
            <rect x="13" y="3" width="8" height="6" fill="#f97316" />

            {/* Side Angry Eye */}
            <rect x="18" y="5" width="2" height="1" fill="#0f172a" />

            {/* Body */}
            <rect x="5" y="6" width="10" height="6" fill="#f97316" />
            <rect x="7" y="8" width="6" height="4" fill="#ffedd5" />

            {/* Animated Legs based on walkFrame */}
            {walkFrame % 2 === 0 ? (
              <g>
                {/* Frame A: Left leg forward, right leg back */}
                <rect x="6" y="12" width="2" height="4" fill="#ea580c" />
                <rect x="13" y="12" width="2" height="4" fill="#ea580c" />
              </g>
            ) : (
              <g>
                {/* Frame B: Alternate stride */}
                <rect x="8" y="12" width="2" height="4" fill="#ea580c" />
                <rect x="11" y="12" width="2" height="4" fill="#ea580c" />
              </g>
            )}

            {/* Tail flicking */}
            <rect x="2" y={walkFrame % 2 === 0 ? "5" : "7"} width="4" height="2" fill="#ea580c" />
            <rect x="1" y={walkFrame % 2 === 0 ? "3" : "5"} width="2" height="3" fill="#ea580c" />
          </svg>
        </div>
      )}
    </div>
  );
};
