"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PixelWindow } from "./PixelWindow";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { sound } from "@/lib/sound";
import confetti from "canvas-confetti";

export const AboutSection: React.FC = () => {
  const { personal } = PORTFOLIO_DATA;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [gotItPressed, setGotItPressed] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    sound.playBlip();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGotIt = (e: React.MouseEvent) => {
    sound.playHeart();
    setGotItPressed(true);

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 35,
      spread: 70,
      origin: { x, y },
      colors: ["#34d399", "#10b981", "#6ee7b7", "#bef264"],
    });

    setTimeout(() => setGotItPressed(false), 2500);
  };

  const renderDots = (score: number, total: number = 5) => {
    return (
      <span className="font-pixelify font-bold text-sm tracking-wider inline-flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={i < score ? "text-[#34d399]" : "text-[#064e3b]"}
          >
            {i < score ? "●" : "○"}
          </span>
        ))}
      </span>
    );
  };

  return (
    <section id="about" className="py-12 px-4 max-w-7xl mx-auto select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Vertical Profile Window (Matches Behance ref3.png) */}
        <div className="lg:col-span-4">
          <PixelWindow title="Profile_Card.sys" showMediaFooter={false}>
            <div className="flex flex-col items-center text-center">
              {/* Circular Pixel Avatar Frame with Glow */}
              <div className="relative mb-4 mt-2">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-[#34d399] p-1 bg-[#042413] shadow-[0_0_20px_rgba(52,211,153,0.6)] overflow-hidden relative">
                  <Image
                    src={personal.avatar}
                    alt={personal.name}
                    width={140}
                    height={140}
                    className="w-full h-full object-cover scale-105 animate-pixel-glow"
                    priority
                  />
                </div>
                {/* Sparkle Badges */}
                <span className="absolute -top-1 -right-1 text-[#bef264] text-lg animate-pixel-twinkle">
                  ✦
                </span>
                <span className="absolute bottom-1 -left-1 text-mint-300 text-sm animate-pixel-twinkle">
                  ✧
                </span>
              </div>

              {/* Player / Name Info */}
              <h2 className="font-pixelify font-bold text-lg md:text-xl text-white mb-1 uppercase tracking-wider">
                {personal.name}
              </h2>
              <div className="font-pixelify font-medium text-xs md:text-sm text-[#6ee7b7] mb-4 bg-[#042c16]/80 px-3 py-1 border border-[#34d399]/40">
                {personal.class}
              </div>

              {/* RPG Stats Mini-Table */}
              <div className="w-full bg-[#04190c] border border-[#059669] p-3 mb-6 text-left font-pixelify text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-emerald-300">LEVEL:</span>
                  <span className="text-[#bef264] font-bold">
                    Lv.{personal.level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-300">HP:</span>
                  <span className="text-green-400 font-bold">
                    {personal.hp}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-300">MP:</span>
                  <span className="text-cyan-300 font-bold">
                    {personal.mp}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-300">BASE:</span>
                  <span className="text-white font-medium">{personal.location}</span>
                </div>
              </div>

              {/* My Contacts Header (Matches ref3.png) */}
              <div className="w-full text-left mb-3">
                <div className="font-pixelify font-bold text-sm text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span className="text-[#34d399]">◆</span>
                  <span>My Contacts:</span>
                </div>

                {/* Circular Contact Badges with Interactive Copy/Link */}
                <div className="space-y-3 text-sm font-pixelify">
                  {/* Email */}
                  <div
                    onClick={() => copyToClipboard(personal.email, "email")}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-[#062c16] cursor-pointer group transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#059669] border border-[#a7f3d0] flex items-center justify-center text-sm shadow-[1px_1px_0_#064e3b] group-hover:scale-105 transition-transform flex-shrink-0">
                      ✉
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate text-white font-medium group-hover:text-[#bef264]">
                        {personal.email}
                      </div>
                      <div className="text-xs text-emerald-300">
                        {copiedKey === "email" ? "✔ Copied to clipboard!" : "Click to copy"}
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div
                    onClick={() => copyToClipboard(personal.phone, "phone")}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-[#062c16] cursor-pointer group transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0284c7] border border-[#bae6fd] flex items-center justify-center text-sm shadow-[1px_1px_0_#0369a1] group-hover:scale-105 transition-transform flex-shrink-0">
                      ☎
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium group-hover:text-[#bef264]">
                        {personal.phone}
                      </div>
                      <div className="text-xs text-sky-300">
                        {copiedKey === "phone" ? "✔ Copied to clipboard!" : "Direct Call / WhatsApp"}
                      </div>
                    </div>
                  </div>

                  {/* GitHub */}
                  <a
                    href={personal.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sound.playClick()}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-[#062c16] cursor-pointer group transition-colors text-inherit no-underline"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#047857] border border-[#6ee7b7] flex items-center justify-center text-sm shadow-[1px_1px_0_#064e3b] group-hover:scale-105 transition-transform flex-shrink-0">
                      👾
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium group-hover:text-[#bef264]">
                        {personal.githubDisplay}
                      </div>
                      <div className="text-xs text-mint-300">Visit Repositories ↗</div>
                    </div>
                  </a>

                  {/* Web */}
                  <a
                    href={personal.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sound.playClick()}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-[#062c16] cursor-pointer group transition-colors text-inherit no-underline"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0d9488] border border-[#99f6e4] flex items-center justify-center text-sm shadow-[1px_1px_0_#115e59] group-hover:scale-105 transition-transform flex-shrink-0">
                      🌐
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium group-hover:text-[#bef264]">
                        {personal.websiteDisplay}
                      </div>
                      <div className="text-xs text-teal-300">Live Website ↗</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* "got it!" Button (Matches Behance ref3.png) */}
              <div className="w-full flex justify-end mt-4">
                <button
                  type="button"
                  onClick={handleGotIt}
                  className="pixel-btn text-sm font-pixelify font-bold px-5 py-2 bg-gradient-to-r from-[#059669] to-[#10b981] text-white border-2 border-[#a7f3d0]"
                >
                  {gotItPressed ? "Level Up! 🌟" : "got it!"}
                </button>
              </div>
            </div>
          </PixelWindow>
        </div>

        {/* RIGHT COLUMN: About_Me.txt Window (Matches Behance ref2.png & ref3.png) */}
        <div className="lg:col-span-8">
          <PixelWindow title="About_Me.txt">
            <div className="space-y-6">
              {/* Bio Introduction */}
              <div>
                <div className="font-pixelify font-bold text-sm md:text-base text-[#bef264] mb-2 flex items-center gap-2">
                  <span>✦</span>
                  <span>Professional_Summary:</span>
                </div>
                <p className="leading-relaxed text-emerald-50 font-pixelify text-base md:text-lg bg-[#041a0d]/70 p-4 border-l-4 border-[#34d399] tracking-wide">
                  {personal.summary}
                </p>
              </div>

              {/* Education (Matches ref3.png) */}
              <div>
                <div className="font-pixelify font-bold text-sm md:text-base text-[#bef264] mb-2 flex items-center gap-2">
                  <span>✦</span>
                  <span>Education:</span>
                </div>
                <div className="bg-[#04190c]/80 p-4 border border-[#059669] rounded-sm space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-pixelify font-bold text-base md:text-lg text-white">
                      • {personal.education.school}
                    </span>
                    <span className="font-pixelify text-xs text-mint-200 bg-[#042c16] px-2.5 py-1 border border-[#34d399]/40 font-semibold">
                      {personal.education.period}
                    </span>
                  </div>
                  <div className="font-pixelify text-sm md:text-base text-emerald-100">
                    B.S. in {personal.education.major} –{" "}
                    <span className="text-[#bef264] font-bold">
                      GPA: {personal.education.gpa}
                    </span>
                  </div>
                  <div className="text-sm text-emerald-200 border-t border-[#064e3b] pt-2.5 mt-2 font-pixelify">
                    <span className="text-teal-300 font-bold">Graduation Thesis: </span>
                    &ldquo;{personal.education.thesis}&rdquo; –{" "}
                    <span className="text-[#bef264] font-bold">
                      Graded: {personal.education.thesisGrade}
                    </span>
                  </div>
                </div>
              </div>

              {/* Softwares & Skill Dot Ratings (Matches ref3.png) */}
              <div>
                <div className="font-pixelify font-bold text-sm md:text-base text-[#bef264] mb-3 flex items-center gap-2">
                  <span>✦</span>
                  <span>Softwares &amp; Mobile Stack:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-[#04190c] border border-[#059669] p-3.5">
                    <div className="font-pixelify font-bold text-sm text-white mb-1.5">Flutter &amp; Dart</div>
                    <div>{renderDots(4)}</div>
                  </div>

                  <div className="bg-[#04190c] border border-[#059669] p-3.5">
                    <div className="font-pixelify font-bold text-sm text-white mb-1.5">Clean Architecture</div>
                    <div>{renderDots(4)}</div>
                  </div>

                  <div className="bg-[#04190c] border border-[#059669] p-3.5">
                    <div className="font-pixelify font-bold text-sm text-white mb-1.5">SQLite &amp; Drift</div>
                    <div>{renderDots(4)}</div>
                  </div>

                  <div className="bg-[#04190c] border border-[#059669] p-3.5">
                    <div className="font-pixelify font-bold text-sm text-white mb-1.5">Firebase &amp; Cloud</div>
                    <div>{renderDots(4)}</div>
                  </div>

                  <div className="bg-[#04190c] border border-[#059669] p-3.5">
                    <div className="font-pixelify font-bold text-sm text-white mb-1.5">Kotlin (Android)</div>
                    <div>{renderDots(3)}</div>
                  </div>

                  <div className="bg-[#04190c] border border-[#059669] p-3.5">
                    <div className="font-pixelify font-bold text-sm text-white mb-1.5">Swift (iOS)</div>
                    <div>{renderDots(3)}</div>
                  </div>

                  <div className="bg-[#04190c] border border-[#059669] p-3.5">
                    <div className="font-pixelify font-bold text-sm text-white mb-1.5">React Native</div>
                    <div>{renderDots(3)}</div>
                  </div>

                  <div className="bg-[#04190c] border border-[#059669] p-3.5">
                    <div className="font-pixelify font-bold text-sm text-white mb-1.5">CI/CD &amp; Fastlane</div>
                    <div>{renderDots(3)}</div>
                  </div>
                </div>
              </div>

              {/* Main Strengths & Certificates */}
              <div>
                <div className="font-pixelify font-bold text-sm md:text-base text-[#bef264] mb-2 flex items-center gap-2">
                  <span>✦</span>
                  <span>Core_Philosophy &amp; Certs:</span>
                </div>
                <div className="bg-[#04190c]/70 p-4 border border-[#059669] space-y-2.5 text-sm md:text-base font-pixelify">
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#34d399] mt-1 font-bold">▪</span>
                    <span className="text-emerald-100">
                      Certificate:{" "}
                      {personal.certificate.url ? (
                        <a
                          href={personal.certificate.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#bef264] hover:underline font-bold inline-flex items-center gap-1"
                        >
                          {personal.certificate.name} ({personal.certificate.issuer}) ↗
                        </a>
                      ) : (
                        <>
                          <strong className="text-white font-bold">{personal.certificate.name}</strong> ({personal.certificate.issuer})
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#34d399] mt-1 font-bold">▪</span>
                    <span className="text-emerald-100">
                      Languages: <strong className="text-white font-bold">English (Working Proficiency)</strong> &amp; <strong className="text-white font-bold">Vietnamese (Native)</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#34d399] mt-1 font-bold">▪</span>
                    <span className="text-emerald-100">
                      Clean Code &amp; SOLID Principles: Maintainable, robust, well-architected systems
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#34d399] mt-1 font-bold">▪</span>
                    <span className="text-emerald-100">
                      Fast Learner &amp; High Versatility across Mobile, Web, and Backend APIs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </PixelWindow>
        </div>
      </div>
    </section>
  );
};
