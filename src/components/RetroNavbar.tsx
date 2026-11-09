"use client";

import React, { useState } from "react";
import Image from "next/image";
import { sound } from "@/lib/sound";
import { PORTFOLIO_DATA } from "@/data/portfolioData";

interface RetroNavbarProps {
  crtEnabled: boolean;
  onToggleCrt: () => void;
  onOpenMiniGame: () => void;
  isGameYellow?: boolean;
}

export const RetroNavbar: React.FC<RetroNavbarProps> = ({
  crtEnabled,
  onToggleCrt,
  onOpenMiniGame,
  isGameYellow = false,
}) => {
  const { personal } = PORTFOLIO_DATA;
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [isBgmOn, setIsBgmOn] = useState(sound.isBgmPlaying);

  const toggleSoundMute = () => {
    sound.isMuted = !sound.isMuted;
    setIsMuted(sound.isMuted);
    if (sound.isMuted && sound.isBgmPlaying) {
      sound.stopBgm();
      setIsBgmOn(false);
    }
    sound.playClick();
  };

  const toggleBgm = () => {
    sound.playClick();
    const playing = sound.toggleBgm();
    setIsBgmOn(playing);
  };

  const scrollTo = (id: string) => {
    sound.playClick();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#041409]/92 border-b-2 border-[#10b981] backdrop-blur-md select-none px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.85)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Avatar + Player Tag */}
        <div
          onClick={() => {
            sound.playHeart();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full border-2 border-[#34d399] overflow-hidden bg-[#042413] p-0.5 group-hover:scale-110 transition-transform">
            <Image
              src={personal.avatar}
              alt="Avatar"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-pixelify font-bold text-xs sm:text-sm text-white group-hover:text-[#bef264] transition-colors">
              AKURO
            </div>
            <div className="font-pixelify text-xs text-[#6ee7b7] font-semibold">
              Lv.{personal.level} Flutter
            </div>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            type="button"
            onClick={() => scrollTo("about")}
            className="pixel-btn text-xs font-pixelify font-bold px-3 py-1 bg-[#042c16] border border-[#10b981]"
          >
            PROFILE
          </button>
          <button
            type="button"
            onClick={() => scrollTo("experience")}
            className="pixel-btn text-xs font-pixelify font-bold px-3 py-1 bg-[#042c16] border border-[#10b981]"
          >
            EXPERIENCE
          </button>
          <button
            type="button"
            onClick={() => scrollTo("projects")}
            className="pixel-btn text-xs font-pixelify font-bold px-3 py-1 bg-[#042c16] border border-[#10b981]"
          >
            PROJECTS
          </button>
          <button
            type="button"
            onClick={() => scrollTo("skills")}
            className="pixel-btn text-xs font-pixelify font-bold px-3 py-1 bg-[#042c16] border border-[#10b981]"
          >
            SKILLS
          </button>
          <button
            type="button"
            onClick={() => scrollTo("contact")}
            className="pixel-btn text-xs font-pixelify font-bold px-3 py-1 bg-[#042c16] border border-[#10b981]"
          >
            CONTACT
          </button>
        </div>

        {/* Right: Controls & Mini-game button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mini-Game Button */}
          <button
            type="button"
            onClick={() => {
              sound.playWindowOpen();
              onOpenMiniGame();
            }}
            title={
              isGameYellow
                ? "Secret Arcade Unlocked! Click to open game folder"
                : "Play Retro Easter Egg Game"
            }
            className={`pixel-btn text-xs font-pixelify font-bold px-2.5 py-1 transition-all ${
              isGameYellow
                ? "bg-[#facc15] text-[#022c15] border-2 border-[#fef08a] shadow-[0_0_16px_rgba(250,204,21,0.9)] animate-pulse hover:bg-[#fde047]"
                : "bg-[#047857] text-white border-[#6ee7b7] hover:bg-[#065f46]"
            }`}
          >
            {isGameYellow ? "⭐" : "🎮"}{" "}
            <span className="hidden sm:inline">GAME</span>
          </button>

          {/* CRT Scanlines Toggle */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onToggleCrt();
            }}
            title="Toggle Retro CRT Scanlines"
            className={`font-pixelify font-bold text-xs px-2.5 py-1 border transition-all ${
              crtEnabled
                ? "bg-[#065f46] text-emerald-200 border-[#6ee7b7]"
                : "bg-[#04190c] text-emerald-300 border-[#064e3b]"
            }`}
          >
            <span className="hidden sm:inline">CRT: </span>
            {crtEnabled ? "ON" : "OFF"}
          </button>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={toggleSoundMute}
            title={isMuted ? "Unmute Sound FX" : "Mute Sound FX"}
            className="w-7 h-7 flex items-center justify-center bg-[#042c16] border border-[#34d399] text-xs hover:bg-[#064e3b]"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          {/* BGM Toggle */}
          <button
            type="button"
            onClick={toggleBgm}
            title={isBgmOn ? "Stop 8-Bit BGM" : "Start 8-Bit BGM"}
            className={`w-7 h-7 flex items-center justify-center border text-xs ${
              isBgmOn
                ? "bg-[#059669] text-[#bef264] border-[#bef264] animate-pulse"
                : "bg-[#031409] text-emerald-300 border-[#064e3b]"
            }`}
          >
            🎵
          </button>
        </div>
      </div>
    </nav>
  );
};
