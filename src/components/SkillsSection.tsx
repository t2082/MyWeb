"use client";

import React, { useState } from "react";
import { PixelWindow } from "./PixelWindow";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { sound } from "@/lib/sound";

export const SkillsSection: React.FC = () => {
  const { skillCategories } = PORTFOLIO_DATA;
  const [activeTab, setActiveTab] = useState<number>(0);

  const currentCategory = skillCategories[activeTab];

  return (
    <section id="skills" className="py-12 px-4 max-w-7xl mx-auto select-none">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 font-pixelify font-bold text-sm text-[#bef264] mb-2">
          <span>✦</span>
          <span>CHARACTER INVENTORY</span>
          <span>✦</span>
        </div>
        <h2 className="pixel-3d-title text-2xl sm:text-4xl md:text-5xl tracking-wide">
          SKILL_TREE.DAT
        </h2>
        <p className="font-pixelify text-sm sm:text-base text-emerald-300 mt-2">
          Weapons, state mechanics, and architectural mastery
        </p>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {skillCategories.map((cat, idx) => {
            const isActive = activeTab === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  sound.playBlip();
                  setActiveTab(idx);
                }}
                className={`font-pixelify font-bold text-xs sm:text-sm px-4 py-2 border-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#059669] border-[#a7f3d0] text-white shadow-[2px_2px_0_#064e3b] -translate-y-0.5"
                    : "bg-[#04190c] border-[#064e3b] text-emerald-300 hover:border-[#34d399] hover:text-white"
                }`}
              >
                {isActive ? "◆ " : ""}
                {cat.title}
              </button>
            );
          })}
        </div>
      </div>

      <PixelWindow title={`Skill_Tree: ${currentCategory.title}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {currentCategory.skills.map((skill, idx) => {
            const percentage = (skill.level / 5) * 100;
            return (
              <div
                key={idx}
                className="bg-[#04190c] border-2 border-[#064e3b] p-3.5 hover:border-[#34d399] transition-all group"
              >
                {/* Skill Name & Level */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-pixelify font-bold text-sm sm:text-base text-white group-hover:text-[#bef264] transition-colors">
                      {skill.name}
                    </span>
                    {skill.tag && (
                      <span className="font-pixelify text-xs font-semibold bg-[#042c16] text-mint-200 px-2 py-0.5 border border-[#34d399]/30">
                        {skill.tag}
                      </span>
                    )}
                  </div>
                  <span className="font-pixelify font-bold text-xs sm:text-sm text-[#bef264]">
                    Lv.{skill.level * 20}
                  </span>
                </div>

                {/* Pixel Progress Bar */}
                <div className="w-full bg-[#021307] border-2 border-[#064e3b] p-0.5 h-5 relative overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 via-teal-400 to-mint-300 transition-all duration-500 relative"
                    style={{ width: `${percentage}%` }}
                  >
                    {/* Dotted pixel texture overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:4px_4px] opacity-30" />
                  </div>
                </div>

                {/* Dot Rating */}
                <div className="flex items-center justify-between font-pixelify text-xs sm:text-sm font-semibold text-emerald-300">
                  <span>MASTERY LEVEL:</span>
                  <div className="flex gap-1.5 font-pixelify text-xs sm:text-sm">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={
                          i < skill.level ? "text-[#34d399]" : "text-[#064e3b]"
                        }
                      >
                        {i < skill.level ? "●" : "○"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inventory Quick Slot Bar */}
        <div className="mt-6 pt-4 border-t border-[#064e3b]">
          <div className="font-pixelify font-bold text-xs sm:text-sm text-emerald-200 mb-2 flex items-center gap-2">
            <span className="text-[#bef264]">✦</span>
            <span>EQUIPPED BUFFS &amp; PRINCIPLES:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm font-pixelify">
            <div className="bg-[#031409] border border-[#064e3b] p-2.5 flex items-center gap-2.5">
              <span className="text-xl">🛡️</span>
              <div>
                <div className="text-white font-bold text-sm">SOLID Code</div>
                <div className="text-xs text-emerald-300">Maintainable</div>
              </div>
            </div>

            <div className="bg-[#031409] border border-[#064e3b] p-2.5 flex items-center gap-2.5">
              <span className="text-xl">⚡</span>
              <div>
                <div className="text-white font-bold text-sm">-50% Cloud Cost</div>
                <div className="text-xs text-emerald-300">Optimized Ops</div>
              </div>
            </div>

            <div className="bg-[#031409] border border-[#064e3b] p-2.5 flex items-center gap-2.5">
              <span className="text-xl">🧩</span>
              <div>
                <div className="text-white font-bold text-sm">Clean State</div>
                <div className="text-xs text-emerald-300">BLoC &amp; Riverpod</div>
              </div>
            </div>

            <div className="bg-[#031409] border border-[#064e3b] p-2.5 flex items-center gap-2.5">
              <span className="text-xl">📱</span>
              <div>
                <div className="text-white font-bold text-sm">Native Plugins</div>
                <div className="text-xs text-emerald-300">Kotlin &amp; Swift</div>
              </div>
            </div>
          </div>
        </div>
      </PixelWindow>
    </section>
  );
};
