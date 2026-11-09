"use client";

import React, { useState } from "react";
import { sound } from "@/lib/sound";
import { LeaderboardEntry, getLeaderboard } from "@/lib/leaderboard";

export type ArcadeGameType = "flappy" | "fruit" | "minesweeper" | "shooter";

interface GameFolderModalProps {
  onClose: () => void;
  onLaunchGame: (gameType: ArcadeGameType) => void;
}

export const GameFolderModal: React.FC<GameFolderModalProps> = ({
  onClose,
  onLaunchGame,
}) => {
  const [selectedItem, setSelectedItem] = useState<string>("flappy");
  const [showReadme, setShowReadme] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState<
    "flappy-bird" | "fruit-box" | "minesweeper" | "space-shooter"
  >("flappy-bird");
  const [loadingScores, setLoadingScores] = useState<boolean>(false);

  const fetchScoresForGame = (
    gameId: "flappy-bird" | "fruit-box" | "minesweeper" | "space-shooter"
  ) => {
    setLoadingScores(true);
    setLeaderboardTab(gameId);
    getLeaderboard(gameId).then((data) => {
      setLeaderboard(data);
      setLoadingScores(false);
    });
  };

  const handleItemClick = (id: string) => {
    sound.playBlip();
    setSelectedItem(id);
    if (id === "readme") {
      setShowReadme(true);
    } else if (id === "scores") {
      fetchScoresForGame(leaderboardTab);
    } else {
      setShowReadme(false);
    }
  };

  const handleItemDoubleClick = (id: string) => {
    if (id === "flappy") {
      sound.playWindowOpen();
      onLaunchGame("flappy");
    } else if (id === "fruit") {
      sound.playWindowOpen();
      onLaunchGame("fruit");
    } else if (id === "minesweeper") {
      sound.playWindowOpen();
      onLaunchGame("minesweeper");
    } else if (id === "shooter") {
      sound.playWindowOpen();
      onLaunchGame("shooter");
    } else if (id === "readme") {
      setShowReadme(true);
    } else if (id === "scores") {
      fetchScoresForGame(leaderboardTab);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm select-none animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#03140a] border-2 border-[#34d399] shadow-[0_0_35px_rgba(52,211,153,0.4)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro Window Title Bar */}
        <div className="bg-[#042c16] border-b-2 border-[#10b981] px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📁</span>
            <span className="font-pixelify font-bold text-sm sm:text-base text-white tracking-wide">
              C:\Retro_Arcade\Games\
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => sound.playClick()}
              title="Minimize"
              className="w-5 h-5 flex items-center justify-center bg-[#022c15] hover:bg-[#064e3b] border border-[#34d399] text-xs font-mono text-[#bef264]"
            >
              _
            </button>
            <button
              type="button"
              onClick={() => sound.playClick()}
              title="Maximize"
              className="w-5 h-5 flex items-center justify-center bg-[#022c15] hover:bg-[#064e3b] border border-[#34d399] text-xs font-mono text-[#bef264]"
            >
              □
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              title="Close Folder"
              className="w-5 h-5 flex items-center justify-center bg-[#e11d48] hover:bg-[#f43f5e] border border-[#fecdd3] text-xs font-mono text-white font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="bg-[#021d0e] border-b border-[#064e3b] px-3 py-1 flex items-center gap-4 text-xs font-pixelify text-emerald-200">
          <span className="hover:text-white cursor-pointer">File</span>
          <span className="hover:text-white cursor-pointer">Edit</span>
          <span className="hover:text-white cursor-pointer">View</span>
          <span className="hover:text-white cursor-pointer">Favorites</span>
          <span className="hover:text-white cursor-pointer">Help</span>
        </div>

        {/* Toolbar & Address Bar */}
        <div className="bg-[#03160c] border-b border-[#064e3b] p-2 space-y-1.5 text-xs font-pixelify">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => sound.playClick()}
              className="px-2 py-0.5 bg-[#042c16] border border-[#10b981]/50 text-emerald-300 hover:text-white flex items-center gap-1"
            >
              <span>◀</span>
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => sound.playClick()}
              className="px-2 py-0.5 bg-[#042c16] border border-[#10b981]/50 text-emerald-300 hover:text-white flex items-center gap-1"
            >
              <span>▶</span>
              <span>Forward</span>
            </button>
            <button
              type="button"
              onClick={() => sound.playClick()}
              className="px-2 py-0.5 bg-[#042c16] border border-[#10b981]/50 text-emerald-300 hover:text-white flex items-center gap-1"
            >
              <span>⬆</span>
              <span>Up</span>
            </button>
            <div className="h-4 w-px bg-[#064e3b] mx-1" />
            <button
              type="button"
              onClick={() => sound.playClick()}
              className="px-2 py-0.5 bg-[#042c16] border border-[#10b981]/50 text-emerald-300 hover:text-white flex items-center gap-1"
            >
              <span>⟳</span>
              <span>Refresh</span>
            </button>
          </div>

          {/* Address Line */}
          <div className="flex items-center gap-2">
            <span className="text-emerald-300 font-bold">Address:</span>
            <div className="flex-1 bg-[#020e06] border border-[#10b981] px-2 py-0.5 text-white flex items-center gap-1.5 font-mono text-[11px] sm:text-xs">
              <span>📂</span>
              <span className="text-[#bef264]">C:\Akuro\Retro_Arcade\Games\</span>
            </div>
            <button
              type="button"
              onClick={() => sound.playClick()}
              className="px-2.5 py-0.5 bg-[#047857] hover:bg-[#059669] border border-[#a7f3d0] text-white font-bold text-xs"
            >
              Go
            </button>
          </div>
        </div>

        {/* Main Folder Explorer Body */}
        <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[300px] max-h-[460px] overflow-y-auto">
          {/* Left Tree Sidebar (Hidden on small screens) */}
          <div className="hidden sm:block sm:col-span-4 bg-[#02130a] border-r border-[#064e3b] p-3 text-xs font-pixelify space-y-2">
            <div className="text-emerald-300 font-bold uppercase tracking-wider pb-1 border-b border-[#042c16] flex items-center gap-1">
              <span>📁</span>
              <span>FOLDERS:</span>
            </div>
            <div className="space-y-1.5 text-emerald-100 pl-1">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span>🖥️</span>
                <span>Desktop</span>
              </div>
              <div className="flex items-center gap-1.5 pl-3 text-emerald-300">
                <span>💾</span>
                <span>System (C:)</span>
              </div>
              <div className="pl-6 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-300/70">
                  <span>📁</span>
                  <span>Documents</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#bef264] font-bold bg-[#042c16] px-1.5 py-0.5 border border-[#34d399]/40">
                  <span>📂</span>
                  <span>Arcade Games (4)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300/70">
                  <span>📁</span>
                  <span>Projects</span>
                </div>
              </div>
            </div>

            {/* Retro Easter Egg Hint Box */}
            <div className="mt-4 p-2 bg-[#041d0e] border border-[#10b981]/40 text-[11px] text-mint-200 leading-relaxed font-pixelify">
              <strong className="text-[#bef264]">★ 4-IN-1 ARCADE SUITE</strong>
              <p className="mt-1">
                Select and double-click any executable to play! All high scores sync to GitHub Gist with anti-cheat protection.
              </p>
            </div>
          </div>

          {/* Right Files Area */}
          <div className="sm:col-span-8 p-3 sm:p-4 bg-[#03150b] flex flex-col justify-between">
            {/* Grid of Files (6 items: 4 Games + README + HighScores) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* File 1: FLAPPY BIRD */}
              <div
                onClick={() => handleItemClick("flappy")}
                onDoubleClick={() => handleItemDoubleClick("flappy")}
                className={`p-2.5 border-2 cursor-pointer transition-all flex flex-col items-center text-center group ${
                  selectedItem === "flappy"
                    ? "bg-[#064e3b]/90 border-[#bef264] shadow-[0_0_12px_rgba(190,242,100,0.5)] -translate-y-0.5"
                    : "bg-[#021d0e]/60 border-[#064e3b] hover:border-[#34d399] hover:bg-[#042c16]"
                }`}
              >
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center mb-1 bg-[#022c15] border-2 border-[#10b981] shadow-[2px_2px_0_#01170b] group-hover:scale-105 transition-transform">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 28 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
                    className="animate-bounce"
                  >
                    <rect x="4" y="0" width="18" height="18" fill="#0284c7" />
                    <rect x="2" y="2" width="20" height="14" fill="#0284c7" />
                    <rect x="6" y="8" width="12" height="8" fill="#38bdf8" />
                    <rect x="0" y="5" width="6" height="8" fill="#7dd3fc" />
                    <rect x="1" y="6" width="4" height="6" fill="#38bdf8" />
                    <rect x="14" y="2" width="6" height="6" fill="#ffffff" />
                    <rect x="17" y="3" width="2" height="3" fill="#0f172a" />
                    <rect x="22" y="6" width="6" height="5" fill="#f59e0b" />
                    <rect x="24" y="8" width="3" height="2" fill="#d97706" />
                  </svg>
                  <span className="absolute -bottom-1 -right-1 font-pixelify font-bold text-[7px] bg-[#facc15] text-black px-1 border border-black">
                    RUN
                  </span>
                </div>
                <span className="font-pixelify font-bold text-xs text-white group-hover:text-[#bef264] break-all">
                  Flappy_Bird.exe
                </span>
                <span className="font-pixelify text-[9px] text-emerald-300 mt-0.5">
                  Action • 64 KB
                </span>
              </div>

              {/* File 2: FRUIT BOX */}
              <div
                onClick={() => handleItemClick("fruit")}
                onDoubleClick={() => handleItemDoubleClick("fruit")}
                className={`p-2.5 border-2 cursor-pointer transition-all flex flex-col items-center text-center group ${
                  selectedItem === "fruit"
                    ? "bg-[#064e3b]/90 border-[#bef264] shadow-[0_0_12px_rgba(190,242,100,0.5)] -translate-y-0.5"
                    : "bg-[#021d0e]/60 border-[#064e3b] hover:border-[#34d399] hover:bg-[#042c16]"
                }`}
              >
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center mb-1 bg-[#022c15] border-2 border-[#10b981] shadow-[2px_2px_0_#01170b] group-hover:scale-105 transition-transform">
                  <div className="w-7 h-7 rounded bg-[#6b1414] border-2 border-[#380b0b] flex items-center justify-center relative shadow-[1px_1px_0_#01170b]">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-center">
                      <div className="w-0.5 h-1 bg-[#5c2b09]" />
                      <div className="w-1.5 h-1 bg-[#16a34a] rounded-tr" />
                    </div>
                    <span className="font-press font-bold text-[9px] text-white">10</span>
                  </div>
                  <span className="absolute -bottom-1 -right-1 font-pixelify font-bold text-[7px] bg-[#6b1414] text-white px-1 border border-black">
                    SUM
                  </span>
                </div>
                <span className="font-pixelify font-bold text-xs text-white group-hover:text-[#bef264] break-all">
                  Fruit_Box.exe
                </span>
                <span className="font-pixelify text-[9px] text-emerald-300 mt-0.5">
                  Puzzle • 120 KB
                </span>
              </div>

              {/* File 3: MINESWEEPER (NEW!) */}
              <div
                onClick={() => handleItemClick("minesweeper")}
                onDoubleClick={() => handleItemDoubleClick("minesweeper")}
                className={`p-2.5 border-2 cursor-pointer transition-all flex flex-col items-center text-center group ${
                  selectedItem === "minesweeper"
                    ? "bg-[#064e3b]/90 border-[#bef264] shadow-[0_0_12px_rgba(190,242,100,0.5)] -translate-y-0.5"
                    : "bg-[#021d0e]/60 border-[#064e3b] hover:border-[#34d399] hover:bg-[#042c16]"
                }`}
              >
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center mb-1 bg-[#022c15] border-2 border-[#10b981] shadow-[2px_2px_0_#01170b] group-hover:scale-105 transition-transform text-xl">
                  <span>💣</span>
                  <span className="absolute -bottom-1 -right-1 font-pixelify font-bold text-[7px] bg-[#0284c7] text-white px-1 border border-black animate-pulse">
                    9x9
                  </span>
                </div>
                <span className="font-pixelify font-bold text-xs text-white group-hover:text-[#bef264] break-all">
                  Minesweeper.exe
                </span>
                <span className="font-pixelify text-[9px] text-emerald-300 mt-0.5">
                  Logic • 98 KB
                </span>
              </div>

              {/* File 4: SPACE SHOOTER (NEW!) */}
              <div
                onClick={() => handleItemClick("shooter")}
                onDoubleClick={() => handleItemDoubleClick("shooter")}
                className={`p-2.5 border-2 cursor-pointer transition-all flex flex-col items-center text-center group ${
                  selectedItem === "shooter"
                    ? "bg-[#064e3b]/90 border-[#bef264] shadow-[0_0_12px_rgba(190,242,100,0.5)] -translate-y-0.5"
                    : "bg-[#021d0e]/60 border-[#064e3b] hover:border-[#34d399] hover:bg-[#042c16]"
                }`}
              >
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center mb-1 bg-[#022c15] border-2 border-[#10b981] shadow-[2px_2px_0_#01170b] group-hover:scale-105 transition-transform text-xl">
                  <span>🚀</span>
                  <span className="absolute -bottom-1 -right-1 font-pixelify font-bold text-[7px] bg-[#8b5cf6] text-white px-1 border border-black animate-pulse">
                    SHMUP
                  </span>
                </div>
                <span className="font-pixelify font-bold text-xs text-white group-hover:text-[#bef264] break-all">
                  Space_Shooter.exe
                </span>
                <span className="font-pixelify text-[9px] text-emerald-300 mt-0.5">
                  Arcade • 150 KB
                </span>
              </div>

              {/* File 5: README.txt */}
              <div
                onClick={() => handleItemClick("readme")}
                onDoubleClick={() => handleItemDoubleClick("readme")}
                className={`p-2.5 border-2 cursor-pointer transition-all flex flex-col items-center text-center group ${
                  selectedItem === "readme"
                    ? "bg-[#064e3b]/90 border-[#bef264] shadow-[0_0_12px_rgba(190,242,100,0.5)] -translate-y-0.5"
                    : "bg-[#021d0e]/60 border-[#064e3b] hover:border-[#34d399] hover:bg-[#042c16]"
                }`}
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center mb-1 bg-[#022c15] border-2 border-[#10b981] text-lg group-hover:scale-105 transition-transform">
                  📄
                </div>
                <span className="font-pixelify font-bold text-xs text-white group-hover:text-[#bef264] break-all">
                  README.txt
                </span>
                <span className="font-pixelify text-[9px] text-emerald-300 mt-0.5">
                  Manual • 2 KB
                </span>
              </div>

              {/* File 6: HighScores.dat */}
              <div
                onClick={() => handleItemClick("scores")}
                onDoubleClick={() => handleItemDoubleClick("scores")}
                className={`p-2.5 border-2 cursor-pointer transition-all flex flex-col items-center text-center group ${
                  selectedItem === "scores"
                    ? "bg-[#064e3b]/90 border-[#bef264] shadow-[0_0_12px_rgba(190,242,100,0.5)] -translate-y-0.5"
                    : "bg-[#021d0e]/60 border-[#064e3b] hover:border-[#34d399] hover:bg-[#042c16]"
                }`}
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center mb-1 bg-[#022c15] border-2 border-[#10b981] text-lg group-hover:scale-105 transition-transform">
                  💾
                </div>
                <span className="font-pixelify font-bold text-xs text-white group-hover:text-[#bef264] break-all">
                  HighScores.dat
                </span>
                <span className="font-pixelify text-[9px] text-emerald-300 mt-0.5">
                  Data • 1 KB
                </span>
              </div>
            </div>

            {/* Readme / File preview banner */}
            {showReadme && (
              <div className="mt-2.5 p-2.5 bg-[#021f10] border border-[#34d399] text-xs font-pixelify text-emerald-100 space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between text-[#bef264] font-bold border-b border-[#064e3b] pb-1">
                  <span>📄 [README.TXT - 4-IN-1 ARCADE MANUAL]</span>
                  <button
                    type="button"
                    onClick={() => setShowReadme(false)}
                    className="text-white hover:text-red-300 font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <p>
                    <strong className="text-sky-300">1. Flappy_Bird.exe:</strong> Tap Spacebar or Click to flap wings and avoid cyber pillars!
                  </p>
                  <p>
                    <strong className="text-rose-300">2. Fruit_Box.exe:</strong> Drag a box around apples that sum to 10 to clear them within 120s!
                  </p>
                  <p>
                    <strong className="text-amber-300">3. Minesweeper.exe:</strong> Left click to dig, Right click (or toggle button) to flag 10 hidden mines!
                  </p>
                  <p>
                    <strong className="text-purple-300">4. Space_Shooter.exe:</strong> Arrow keys / Drag to pilot starfighter, shoot alien invaders & bosses!
                  </p>
                </div>
                <p className="text-teal-300 text-[10px] pt-0.5 border-t border-[#064e3b]">
                  • All high scores sync to GitHub Gist with anti-cheat protection. Vietnamese CallSign supported!
                </p>
              </div>
            )}

            {/* HighScores / Data preview banner with 4 Tabs */}
            {selectedItem === "scores" && (
              <div className="mt-2.5 p-2 bg-[#021f10] border border-[#34d399] text-xs font-pixelify text-emerald-100 space-y-1.5 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#064e3b] pb-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[#bef264] font-bold">💾 [HIGHSCORES]</span>
                    <button
                      type="button"
                      onClick={() => fetchScoresForGame("flappy-bird")}
                      className={`px-1.5 py-0.5 text-[10px] border ${
                        leaderboardTab === "flappy-bird"
                          ? "bg-[#047857] text-white border-[#bef264]"
                          : "bg-[#02140a] text-emerald-300 border-[#064e3b]"
                      }`}
                    >
                      FLAPPY
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchScoresForGame("fruit-box")}
                      className={`px-1.5 py-0.5 text-[10px] border ${
                        leaderboardTab === "fruit-box"
                          ? "bg-[#047857] text-white border-[#bef264]"
                          : "bg-[#02140a] text-emerald-300 border-[#064e3b]"
                      }`}
                    >
                      FRUIT BOX
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchScoresForGame("minesweeper")}
                      className={`px-1.5 py-0.5 text-[10px] border ${
                        leaderboardTab === "minesweeper"
                          ? "bg-[#047857] text-white border-[#bef264]"
                          : "bg-[#02140a] text-emerald-300 border-[#064e3b]"
                      }`}
                    >
                      MINESWEEPER
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchScoresForGame("space-shooter")}
                      className={`px-1.5 py-0.5 text-[10px] border ${
                        leaderboardTab === "space-shooter"
                          ? "bg-[#047857] text-white border-[#bef264]"
                          : "bg-[#02140a] text-emerald-300 border-[#064e3b]"
                      }`}
                    >
                      SHOOTER
                    </button>
                  </div>
                  <span className="text-[10px] text-teal-300">
                    {loadingScores ? "SYNCING..." : "LIVE"}
                  </span>
                </div>

                {loadingScores ? (
                  <div className="text-center py-2 text-emerald-300">Fetching live Gist data...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                    {leaderboard.length === 0 ? (
                      <div className="col-span-2 text-center text-emerald-300/70 py-1">
                        No scores recorded yet.
                      </div>
                    ) : (
                      leaderboard.slice(0, 10).map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between px-1 bg-[#03150b]">
                          <span className="truncate">
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`} {entry.name}
                          </span>
                          <span className="font-mono text-white font-bold ml-1">{entry.score} pts</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* File Action Row */}
            <div className="mt-3 pt-2.5 border-t border-[#064e3b] flex flex-wrap items-center justify-between gap-2">
              <span className="font-pixelify text-xs text-mint-200">
                {selectedItem === "flappy" && (
                  <span className="text-[#bef264] font-bold">
                    ▶ Selected: Flappy_Bird.exe
                  </span>
                )}
                {selectedItem === "fruit" && (
                  <span className="text-[#bef264] font-bold">
                    ▶ Selected: Fruit_Box.exe (Apple Game)
                  </span>
                )}
                {selectedItem === "minesweeper" && (
                  <span className="text-[#bef264] font-bold">
                    ▶ Selected: Minesweeper.exe (Retro 9x9)
                  </span>
                )}
                {selectedItem === "shooter" && (
                  <span className="text-[#bef264] font-bold">
                    ▶ Selected: Space_Shooter.exe (Galaxy Invaders)
                  </span>
                )}
                {selectedItem === "readme" && <span>Selected: README.txt</span>}
                {selectedItem === "scores" && <span>Selected: HighScores.dat</span>}
              </span>

              <div className="flex items-center gap-2">
                {selectedItem === "fruit" ? (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playWindowOpen();
                      onLaunchGame("fruit");
                    }}
                    className="pixel-btn text-xs sm:text-sm font-pixelify font-bold px-4 py-2 bg-[#dc2626] hover:bg-[#ef4444] text-white flex items-center gap-2 shadow-[2px_2px_0_#022c15]"
                  >
                    <span>🍎</span>
                    <span>LAUNCH FRUIT BOX</span>
                  </button>
                ) : selectedItem === "minesweeper" ? (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playWindowOpen();
                      onLaunchGame("minesweeper");
                    }}
                    className="pixel-btn text-xs sm:text-sm font-pixelify font-bold px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white flex items-center gap-2 shadow-[2px_2px_0_#022c15]"
                  >
                    <span>💣</span>
                    <span>LAUNCH MINESWEEPER</span>
                  </button>
                ) : selectedItem === "shooter" ? (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playWindowOpen();
                      onLaunchGame("shooter");
                    }}
                    className="pixel-btn text-xs sm:text-sm font-pixelify font-bold px-4 py-2 bg-[#7c3aed] hover:bg-[#8b5cf6] text-white flex items-center gap-2 shadow-[2px_2px_0_#022c15]"
                  >
                    <span>🚀</span>
                    <span>LAUNCH SPACE SHOOTER</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playWindowOpen();
                      onLaunchGame("flappy");
                    }}
                    className="pixel-btn text-xs sm:text-sm font-pixelify font-bold px-4 py-2 bg-[#059669] hover:bg-[#10b981] text-white flex items-center gap-2 shadow-[2px_2px_0_#022c15]"
                  >
                    <span>🎮</span>
                    <span>LAUNCH FLAPPY BIRD</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="pixel-btn text-xs font-pixelify font-bold px-3 py-2 bg-[#1e293b] hover:bg-[#334155] text-slate-200 border border-slate-500"
                >
                  ✕ CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-[#02160b] border-t border-[#064e3b] px-3 py-1 flex items-center justify-between text-[11px] font-pixelify text-emerald-300">
          <div>6 object(s) in directory • 434.0 KB</div>
          <div className="flex items-center gap-3">
            <span>MS-DOS Arcade Emulator</span>
            <span className="text-[#34d399]">● ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
