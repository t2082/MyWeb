"use client";

import React, { useState } from "react";
import { PixelWindow } from "./PixelWindow";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { sound } from "@/lib/sound";

export const ExperienceSection: React.FC = () => {
  const { experiences } = PORTFOLIO_DATA;
  const [selectedExpId, setSelectedExpId] = useState<string>(experiences[0].id);

  const activeExp =
    experiences.find((exp) => exp.id === selectedExpId) || experiences[0];

  return (
    <section id="experience" className="py-12 px-4 max-w-7xl mx-auto select-none">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 font-pixelify font-bold text-sm text-[#bef264] mb-2">
          <span>✦</span>
          <span>CAREER TIMELINE</span>
          <span>✦</span>
        </div>
        <h2 className="pixel-3d-title text-2xl sm:text-4xl md:text-5xl tracking-wide">
          WORK_HISTORY.EXE
        </h2>
        <p className="font-pixelify text-sm sm:text-base text-emerald-300 mt-2">
          Professional quests completed across Mobile and Web ecosystems
        </p>
      </div>

      <PixelWindow title="Work_History.exe">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Company List / Tabs (Left) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="font-pixelify font-bold text-sm text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="text-[#34d399]">▶</span>
              <span>Select Guild / Company:</span>
            </div>

            {experiences.map((exp) => {
              const isSelected = exp.id === activeExp.id;
              return (
                <div
                  key={exp.id}
                  onClick={() => {
                    sound.playBlip();
                    setSelectedExpId(exp.id);
                  }}
                  className={`p-3.5 border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#042c16] border-[#34d399] shadow-[3px_3px_0_#022c15] translate-x-1"
                      : "bg-[#04190c]/70 border-[#064e3b] hover:border-[#10b981] hover:bg-[#062c16]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-pixelify font-bold text-base ${
                        isSelected ? "text-[#bef264]" : "text-white"
                      }`}
                    >
                      {exp.company}
                    </span>
                    {isSelected && (
                      <span className="font-pixelify font-bold text-xs text-teal-300">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="font-pixelify text-xs md:text-sm text-emerald-300">
                    {exp.role} • {exp.period}
                  </div>
                  <div className="text-xs md:text-sm text-mint-200 font-pixelify mt-1.5 line-clamp-2">
                    ★ {exp.highlight}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Experience Details (Right) */}
          <div className="lg:col-span-8 bg-[#04190c]/90 border-2 border-[#059669] p-4 md:p-6 space-y-6">
            {/* Header info */}
            <div className="border-b border-[#064e3b] pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h3 className="font-pixelify font-bold text-lg md:text-xl text-white">
                  {activeExp.company}
                </h3>
                <span className="font-pixelify text-xs md:text-sm bg-[#042c16] text-mint-200 px-3 py-1 border border-[#34d399]/40 font-semibold">
                  {activeExp.period}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 font-pixelify text-sm text-emerald-100 mb-2">
                <div>
                  <strong className="text-teal-300">Role:</strong> {activeExp.role}
                </div>
                <div>
                  <strong className="text-teal-300">Location:</strong>{" "}
                  {activeExp.location}
                </div>
                <div>
                  <strong className="text-teal-300">Team Size:</strong>{" "}
                  {activeExp.teamSize} members
                </div>
              </div>

              {/* Achievement Badge */}
              <div className="inline-flex items-center gap-2 bg-[#022c15] border border-[#34d399]/40 px-3.5 py-1.5 text-xs md:text-sm text-emerald-200 font-pixelify">
                <span>🏆</span>
                <span>
                  <strong className="text-white">Key Impact: </strong>
                  {activeExp.highlight}
                </span>
              </div>
            </div>

            {/* Projects in this Experience */}
            <div className="space-y-6">
              {activeExp.projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="bg-[#031208] border border-[#064e3b] p-4 md:p-5 space-y-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between border-b border-[#042c16] pb-2 gap-2">
                    <div className="font-pixelify font-bold text-base md:text-lg text-[#bef264] flex items-center gap-2">
                      <span>◈</span>
                      <span>{proj.name}</span>
                    </div>

                    {proj.links && (
                      <div className="flex flex-wrap items-center gap-2">
                        {proj.links.playStore && (
                          <a
                            href={proj.links.playStore}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => sound.playClick()}
                            className="font-pixelify text-xs font-bold px-2.5 py-1 bg-[#065f46] hover:bg-[#047857] border border-[#6ee7b7] text-white flex items-center gap-1.5 transition-colors"
                            title="Open Google Play"
                          >
                            <span>▶</span>
                            <span>Google Play</span>
                          </a>
                        )}
                        {proj.links.appStore && (
                          <a
                            href={proj.links.appStore}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => sound.playClick()}
                            className="font-pixelify text-xs font-bold px-2.5 py-1 bg-[#0284c7] hover:bg-[#0369a1] border border-[#bae6fd] text-white flex items-center gap-1.5 transition-colors"
                            title="Open App Store"
                          >
                            <span></span>
                            <span>App Store</span>
                          </a>
                        )}
                        {proj.links.web && (
                          <a
                            href={proj.links.web}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => sound.playClick()}
                            className="font-pixelify text-xs font-bold px-2.5 py-1 bg-[#047857] hover:bg-[#065f46] border border-[#a7f3d0] text-white flex items-center gap-1.5 transition-colors"
                            title="Open Website"
                          >
                            <span>🌐</span>
                            <span>Website</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bullet points with readable pixel font */}
                  <ul className="space-y-2.5 text-sm md:text-base text-emerald-50 font-pixelify leading-relaxed">
                    {proj.description.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5">
                        <span className="text-[#34d399] font-bold mt-1">
                          ▪
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Tech Stack Chips */}
                  <div>
                    <div className="font-pixelify font-bold text-xs text-emerald-300 mb-2 uppercase">
                      TECH ARSENAL:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.tech.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="font-pixelify text-xs bg-[#042c16] text-white px-2.5 py-1 border border-[#10b981]/40 shadow-[1px_1px_0_#022c15] font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PixelWindow>
    </section>
  );
};
