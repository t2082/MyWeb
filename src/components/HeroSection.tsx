"use client";

import React from "react";
import { sound } from "@/lib/sound";
import { PORTFOLIO_DATA } from "@/data/portfolioData";

interface HeroSectionProps {
  onStartQuest: () => void;
  onOpenGame: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartQuest, onOpenGame }) => {
  const { personal } = PORTFOLIO_DATA;

  return (
    <section className="relative min-h-screen w-full max-w-full flex flex-col justify-between items-center px-3 sm:px-4 pt-16 pb-8 overflow-hidden select-none">
      {/* Background Cosmic Deep Space Glow in Cyber Emerald */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden max-w-full">
        <div className="absolute -top-32 -left-32 w-72 sm:w-[600px] h-72 sm:h-[600px] rounded-full bg-[#059669]/20 blur-[80px] sm:blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-72 sm:w-[550px] h-72 sm:h-[550px] rounded-full bg-[#10b981]/15 blur-[80px] sm:blur-[130px]" />
        <div className="absolute -bottom-32 left-1/3 w-72 sm:w-[700px] h-72 sm:h-[700px] rounded-full bg-[#047857]/20 blur-[80px] sm:blur-[140px]" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#030c06]/60 to-[#030c06]" />
      </div>

      {/* Top Retro HUD Bar */}
      <header className="relative z-10 w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[#06190e]/85 border-2 border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.4)] backdrop-blur-sm mt-2">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 bg-emerald-400 animate-ping rounded-full inline-block" />
          <span className="font-pixelify font-bold text-xs sm:text-sm text-emerald-300">
            SYS: ONLINE • READY FOR QUEST
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-pixelify font-semibold text-emerald-200">
          <div>
            <span className="text-teal-300">CLASS: </span>
            <span className="text-white">FLUTTER DEV</span>
          </div>
          <div>
            <span className="text-cyan-300">EXP: </span>
            <span className="text-white">2+ YRS</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-lime-300">LOC: </span>
            <span className="text-white">CAN THO, VN</span>
          </div>
        </div>
      </header>

      {/* Center 3D Pixel Title */}
      <div className="relative z-10 my-auto text-center flex flex-col items-center justify-center px-2 sm:px-4 py-8 max-w-full w-full">
        {/* Top Decorative Sparkles */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 text-[#bef264] font-pixelify font-bold text-xs sm:text-sm md:text-base">
          <span className="animate-pixel-twinkle">✦</span>
          <span className="tracking-widest uppercase text-emerald-300">
            PIXEL ART PORTFOLIO ARCHIVE
          </span>
          <span className="animate-pixel-twinkle">✦</span>
        </div>

        {/* 3D Beveled Pixel Name (Always Single Line) */}
        <h1 className="pixel-3d-title whitespace-nowrap text-[12px] min-[360px]:text-[13px] sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl mb-3 tracking-normal sm:tracking-wide max-w-full select-none">
          {personal.name}
        </h1>

        {/* Subtitle: PORTFOLIO (3xl) */}
        <div className="pixel-3d-sub text-base sm:text-2xl md:text-3xl font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase mb-4 select-none">
          PORTFOLIO
        </div>

        {/* Tagline */}
        <div className="font-pixelify text-[11px] min-[360px]:text-xs sm:text-sm md:text-base font-semibold text-mint-100 tracking-wide sm:tracking-wider mb-6 sm:mb-8 bg-[#042413]/80 px-3 sm:px-4 py-2 border border-[#6ee7b7]/40 shadow-[2px_2px_0_#022c15] max-w-full">
          ★ {personal.subtitle} ★
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 max-w-2xl w-full font-pixelify font-bold">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onStartQuest();
            }}
            className="pixel-btn text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 bg-[#059669] border-2 border-[#a7f3d0] text-white shadow-[3px_3px_0_#064e3b]"
          >
            ▶ START EXPLORING
          </button>

          <a
            href={personal.cvDownload}
            download="Luong_Luu_Minh_Tan_CV.pdf"
            onClick={() => sound.playHeart()}
            className="pixel-btn text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 bg-[#047857] border-2 border-[#6ee7b7] text-emerald-100 hover:text-white"
          >
            📜 DOWNLOAD CV
          </a>

          <a
            href={personal.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="pixel-btn text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 bg-[#064e3b] border-2 border-[#34d399] text-emerald-200 hover:text-white"
          >
            👾 GITHUB
          </a>

          <button
            type="button"
            onClick={() => {
              sound.playBlip();
              onOpenGame();
            }}
            className="pixel-btn text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 bg-[#0284c7] border-2 border-[#7dd3fc] text-sky-100 hover:text-white"
          >
            🎮 MINI-GAME
          </button>
        </div>
      </div>

      {/* Bottom: SCROLL DOWN TO START! */}
      <div
        onClick={() => {
          sound.playClick();
          onStartQuest();
        }}
        className="relative z-10 flex flex-col items-center justify-center gap-2 cursor-pointer pb-4 group"
        title="Scroll down to begin exploration"
      >
        <span className="font-pixelify font-bold text-sm sm:text-base text-[#6ee7b7] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover:text-[#bef264] transition-colors">
          SCROLL DOWN TO START!
        </span>

        {/* Pixel Bouncing Down Arrow */}
        <div className="animate-pixel-bounce text-xl text-[#bef264] font-press drop-shadow-[0_0_10px_rgba(190,242,100,0.8)]">
          ▼
        </div>
      </div>
    </section>
  );
};
