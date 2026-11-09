"use client";

import React, { useState } from "react";
import Image from "next/image";
import { sound } from "@/lib/sound";
import confetti from "canvas-confetti";

interface PixelWindowProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
  className?: string;
  initialMinimized?: boolean;
  onClose?: () => void;
  showMediaFooter?: boolean;
}

export const PixelWindow: React.FC<PixelWindowProps> = ({
  title,
  children,
  className = "",
  initialMinimized = false,
  onClose,
  showMediaFooter = true,
}) => {
  const [isMinimized, setIsMinimized] = useState(initialMinimized);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(42);

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    setIsMaximized(!isMaximized);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    if (onClose) {
      onClose();
    } else {
      setIsMinimized(true);
    }
  };

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    const playing = sound.toggleBgm();
    setIsPlaying(playing);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playHeart();
    setLikes((prev) => prev + 1);

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ["#34d399", "#10b981", "#6ee7b7", "#bef264"],
      ticks: 80,
    });
  };

  return (
    <div
      className={`pixel-window transition-all duration-200 border-2 border-[#a7f3d0] ${
        isMaximized
          ? "fixed inset-4 z-50 overflow-auto"
          : "w-full max-w-full"
      } ${className}`}
    >
      {/* Window Header */}
      <div
        className="pixel-window-header flex items-center justify-between px-3 py-2 select-none cursor-pointer"
        onClick={() => {
          sound.playClick();
          if (isMinimized) setIsMinimized(false);
        }}
      >
        {/* Left: Star decoration + Title */}
        <div className="flex items-center gap-2">
          <span className="text-[#bef264] text-sm animate-pixel-twinkle">✦</span>
          <span className="font-press text-xs md:text-sm text-white tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {title}
          </span>
        </div>

        {/* Center: Emerald Saturn Planet Emblem */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-0.5 rounded bg-[#022c15]/60 border border-[#34d399]/40">
          <Image
            src="/assets/planet.png"
            alt="Pixel Saturn"
            width={38}
            height={16}
            style={{ width: "auto", height: "auto" }}
            className="w-9 h-4 object-contain animate-pulse [filter:hue-rotate(220deg)_saturate(140%)]"
          />
        </div>

        {/* Right: Window Controls */}
        <div className="flex items-center gap-1.5">
          {/* Minimize */}
          <button
            type="button"
            title="Minimize"
            aria-label="Minimize Window"
            onClick={handleMinimize}
            className="pixel-btn-control"
          >
            _
          </button>
          {/* Maximize */}
          <button
            type="button"
            title="Maximize"
            aria-label="Maximize Window"
            onClick={handleMaximize}
            className="pixel-btn-control"
          >
            {isMaximized ? "❐" : "□"}
          </button>
          {/* Close */}
          <button
            type="button"
            title="Close"
            aria-label="Close Window"
            onClick={handleClose}
            className="pixel-btn-close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Window Content */}
      {!isMinimized && (
        <div className="p-4 md:p-6 bg-[#05160b]/95 text-emerald-100 min-h-[140px] font-pixelify">
          {children}
        </div>
      )}

      {/* Window Footer (Media & Status Dock) */}
      {!isMinimized && showMediaFooter && (
        <div className="pixel-window-footer flex items-center justify-between px-3 py-2 text-xs select-none">
          {/* Left: Speaker & BGM Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSound}
              title={isPlaying ? "Mute Chiptune BGM" : "Play 8-Bit Space Chiptune"}
              className="w-7 h-7 flex items-center justify-center bg-[#064e3b] border border-[#a7f3d0] text-[#bef264] hover:bg-[#047857] active:scale-95 transition-transform"
            >
              {isPlaying ? "🔊" : "🔈"}
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-pixelify font-semibold text-emerald-200">
              <span className="text-[#bef264] animate-pixel-twinkle">✦</span>
              <span>8-BIT BGM: {isPlaying ? "ON [CYBER DOCK]" : "OFF"}</span>
            </div>
          </div>

          {/* Center: Glowing Progress Meter with Sparkles */}
          <div className="flex items-center gap-2 max-w-[240px] flex-1 mx-3">
            <div className="w-full bg-[#022c15] h-3.5 border border-[#6ee7b7] p-0.5 relative overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-emerald-600 via-teal-400 to-mint-300 transition-all duration-300 ${
                  isPlaying ? "w-full animate-pulse" : "w-3/4"
                }`}
              />
            </div>
          </div>

          {/* Right: Play status + Heart counter */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSound}
              title="Play/Pause Chiptune"
              className="w-7 h-7 flex items-center justify-center bg-[#047857] border border-[#a7f3d0] text-white hover:bg-[#059669] active:scale-95"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button
              type="button"
              onClick={handleHeartClick}
              title="Like / Send Heart"
              className="h-7 px-2 flex items-center gap-1 bg-[#065f46] border border-[#6ee7b7] text-emerald-200 hover:bg-[#047857] active:scale-95 font-press text-[10px]"
            >
              <span className="text-emerald-300 animate-bounce">♥</span>
              <span>{likes}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
