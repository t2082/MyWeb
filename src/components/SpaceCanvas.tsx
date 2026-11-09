"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  alpha: number;
  twinkleSpeed: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
}

export const SpaceCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Color palette matching retro green cyber space
    const starColors = ["#ffffff", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#bef264", "#fef08a"];

    // Initialize stars
    const starCount = Math.floor((width * height) / 3600);
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() < 0.7 ? 2 : Math.random() < 0.9 ? 3 : 4,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      speed: 0.1 + Math.random() * 0.3,
      alpha: 0.2 + Math.random() * 0.8,
      twinkleSpeed: 0.01 + Math.random() * 0.03,
    }));

    const meteors: Meteor[] = [];

    const spawnMeteor = () => {
      if (Math.random() < 0.03 && meteors.length < 3) {
        meteors.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.4),
          vx: -(3 + Math.random() * 4),
          vy: 2 + Math.random() * 3,
          length: 20 + Math.random() * 40,
          life: 1,
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render pixel stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Twinkle
        star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.015;
        if (star.alpha > 1) star.alpha = 1;
        if (star.alpha < 0.2) star.alpha = 0.2;

        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;

        // Draw crisp pixel squares
        ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);

        // Add 4-point cross twinkle for larger stars
        if (star.size >= 3 && star.alpha > 0.7) {
          ctx.fillRect(Math.floor(star.x - 2), Math.floor(star.y), 1, 1);
          ctx.fillRect(Math.floor(star.x + star.size + 1), Math.floor(star.y), 1, 1);
          ctx.fillRect(Math.floor(star.x), Math.floor(star.y - 2), 1, 1);
          ctx.fillRect(Math.floor(star.x), Math.floor(star.y + star.size + 1), 1, 1);
        }

        // Slow drift
        star.y += star.speed * 0.2;
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }
      }

      // Render Meteors
      spawnMeteor();
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.02;

        if (m.life <= 0 || m.x < -100 || m.y > height + 100) {
          meteors.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = m.life;
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 4, m.y - m.vy * 4);
        ctx.stroke();

        // Bright pixel head
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.floor(m.x), Math.floor(m.y), 3, 3);
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
};
