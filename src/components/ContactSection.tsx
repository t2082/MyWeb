"use client";

import React, { useState } from "react";
import Image from "next/image";
import { sound } from "@/lib/sound";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import confetti from "canvas-confetti";

export const ContactSection: React.FC = () => {
  const { personal, rpgQuest } = PORTFOLIO_DATA;
  const [selectedOptionId, setSelectedOptionId] = useState<string>("yes");
  const [activeReply, setActiveReply] = useState<string | null>(null);

  const handleSelectOption = (
    opt: (typeof rpgQuest.options)[0],
    e: React.MouseEvent
  ) => {
    sound.playSelect();
    setSelectedOptionId(opt.id);
    setActiveReply(opt.reply);

    if (opt.action === "download") {
      sound.playHeart();
      const a = document.createElement("a");
      a.href = personal.cvDownload;
      a.download = "Luong_Luu_Minh_Tan_CV.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      confetti({
        particleCount: 45,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#bef264", "#34d399", "#10b981", "#6ee7b7"],
      });
    } else if (opt.action === "email") {
      sound.playHeart();
      confetti({
        particleCount: 50,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#34d399", "#10b981", "#6ee7b7", "#38bdf8"],
      });
    } else if (opt.action === "github") {
      sound.playClick();
      window.open(personal.github, "_blank");
    }
  };

  return (
    <section
      id="contact"
      className="relative min-h-screen w-full max-w-full flex flex-col items-center justify-between px-3 sm:px-4 py-16 overflow-hidden select-none"
    >
      {/* Background Cosmic Atmosphere in Green */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden max-w-full">
        <div className="absolute -top-32 left-1/4 w-72 sm:w-[600px] h-72 sm:h-[600px] rounded-full bg-[#059669]/20 blur-[80px] sm:blur-[130px]" />
        <div className="absolute bottom-10 right-1/4 w-72 sm:w-[500px] h-72 sm:h-[500px] rounded-full bg-[#047857]/20 blur-[80px] sm:blur-[120px]" />
      </div>

      {/* Top 3D Title: THANKS FOR YOUR TIME! */}
      <div className="relative z-10 text-center mt-6 mb-8">
        <div className="flex items-center justify-center gap-2 font-press text-xs text-[#bef264] mb-3">
          <span className="animate-pixel-twinkle">✦</span>
          <span>QUEST COMPLETED</span>
          <span className="animate-pixel-twinkle">✦</span>
        </div>

        <h2 className="pixel-3d-title text-xl sm:text-4xl md:text-6xl lg:text-8xl tracking-normal sm:tracking-wide max-w-full mx-auto leading-tight px-2">
          THANKS FOR YOUR TIME!
        </h2>
      </div>

      {/* RPG Dialogue Box (Matches Behance ref4.gif in Green) */}
      <div className="relative z-10 w-full max-w-2xl my-auto">
        <div className="pixel-window border-2 border-[#a7f3d0] shadow-[0_0_30px_rgba(16,185,129,0.5)]">
          {/* Window Header */}
          <div className="pixel-window-header flex items-center justify-between px-3.5 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[#bef264] text-xs">✦</span>
              <span className="font-press text-xs text-white">
                M.Tan (Akuro)
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-0.5 rounded bg-[#022c15]/60 border border-[#34d399]/40">
              <Image
                src="/assets/planet.png"
                alt="Saturn"
                width={38}
                height={16}
                style={{ width: "auto", height: "auto" }}
                className="w-8 h-3.5 object-contain [filter:hue-rotate(220deg)_saturate(140%)]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="pixel-btn-control">_</span>
              <span className="pixel-btn-control">□</span>
              <span className="pixel-btn-close">✕</span>
            </div>
          </div>

          {/* Dialogue Body */}
          <div className="p-5 md:p-7 bg-[#05160b]/95 space-y-5">
            {/* Main Question */}
            <p className="font-pixelify font-bold text-base sm:text-lg md:text-xl text-white leading-relaxed tracking-wide">
              {rpgQuest.question}
            </p>

            {/* Interactive RPG Option List with Cursor */}
            <div className="space-y-3 pt-2">
              {rpgQuest.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={(e) => handleSelectOption(opt, e)}
                    className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#042c16] text-[#bef264] border-l-4 border-[#34d399] translate-x-1"
                        : "text-emerald-200 hover:bg-[#062413] hover:text-white"
                    }`}
                  >
                    {/* Retro Blinking Cursor */}
                    <span
                      className={`font-press text-sm ${
                        isSelected
                          ? "text-[#bef264] animate-pixel-bounce"
                          : "opacity-0"
                      }`}
                    >
                      ►
                    </span>

                    <span className="font-pixelify font-bold text-sm sm:text-base md:text-lg">
                      {opt.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Response Speech Bubble */}
            {activeReply && (
              <div className="mt-4 p-4 bg-[#041a0d] border-2 border-[#10b981] rounded-sm text-emerald-100 font-pixelify text-base sm:text-lg leading-relaxed animate-fade-in shadow-[2px_2px_0_#064e3b]">
                <div className="font-pixelify font-bold text-xs sm:text-sm text-teal-300 mb-1">
                  RESPONSE:
                </div>
                <div className="text-emerald-50">{activeReply}</div>

                {selectedOptionId === "yes" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`mailto:${personal.email}?subject=Collaboration%20Inquiry%20with%20Luong%20Luu%20Minh%20Tan`}
                      onClick={() => sound.playHeart()}
                      className="pixel-btn text-xs sm:text-sm font-pixelify font-bold px-4 py-2 bg-[#059669] border-[#a7f3d0]"
                    >
                      ✉ SEND EMAIL NOW
                    </a>
                    <a
                      href={`tel:${personal.phone.replace(/\s+/g, "")}`}
                      onClick={() => sound.playClick()}
                      className="pixel-btn text-xs sm:text-sm font-pixelify font-bold px-4 py-2 bg-[#0284c7] border-[#bae6fd]"
                    >
                      ☎ CALL DIRECTLY
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Contact Badges in Emerald Green */}
      <footer className="relative z-10 w-full max-w-4xl flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-8 pb-2">
        {/* Email Badge */}
        <a
          href={`mailto:${personal.email}`}
          onClick={() => sound.playClick()}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#04190c]/90 border border-[#34d399] rounded-full hover:bg-[#042c16] transition-colors text-inherit no-underline shadow-[2px_2px_0_#022c15]"
        >
          <div className="w-6 h-6 rounded-full bg-[#059669] border border-[#a7f3d0] flex items-center justify-center text-xs">
            ✉
          </div>
          <span className="font-pixelify text-xs sm:text-sm font-semibold text-emerald-200">
            {personal.email}
          </span>
        </a>

        {/* GitHub Badge */}
        <a
          href={personal.github}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sound.playClick()}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#04190c]/90 border border-[#34d399] rounded-full hover:bg-[#042c16] transition-colors text-inherit no-underline shadow-[2px_2px_0_#022c15]"
        >
          <div className="w-6 h-6 rounded-full bg-[#047857] border border-[#6ee7b7] flex items-center justify-center text-xs">
            👾
          </div>
          <span className="font-pixelify text-xs sm:text-sm font-semibold text-emerald-200">
            {personal.githubDisplay}
          </span>
        </a>

        {/* Phone Badge */}
        <a
          href={`tel:${personal.phone.replace(/\s+/g, "")}`}
          onClick={() => sound.playClick()}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#04190c]/90 border border-[#34d399] rounded-full hover:bg-[#042c16] transition-colors text-inherit no-underline shadow-[2px_2px_0_#022c15]"
        >
          <div className="w-6 h-6 rounded-full bg-[#0284c7] border border-[#bae6fd] flex items-center justify-center text-xs">
            ☎
          </div>
          <span className="font-pixelify text-xs sm:text-sm font-semibold text-emerald-200">
            {personal.phone}
          </span>
        </a>

        {/* Website Badge */}
        <a
          href={personal.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sound.playClick()}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#04190c]/90 border border-[#34d399] rounded-full hover:bg-[#042c16] transition-colors text-inherit no-underline shadow-[2px_2px_0_#022c15]"
        >
          <div className="w-6 h-6 rounded-full bg-[#0d9488] border border-[#99f6e4] flex items-center justify-center text-xs">
            🌐
          </div>
          <span className="font-pixelify text-xs sm:text-sm font-semibold text-emerald-200">
            {personal.websiteDisplay}
          </span>
        </a>
      </footer>
    </section>
  );
};
