"use client";

import React, { useState, useEffect } from "react";
import { SpaceCanvas } from "@/components/SpaceCanvas";
import { RetroNavbar } from "@/components/RetroNavbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { SkillsSection } from "@/components/SkillsSection";
import { ContactSection } from "@/components/ContactSection";
import { GameFolderModal, ArcadeGameType } from "@/components/GameFolderModal";
import { PixelEasterEgg } from "@/components/PixelEasterEgg";
import { FruitBoxGame } from "@/components/FruitBoxGame";
import { MinesweeperGame } from "@/components/MinesweeperGame";
import { SpaceShooterGame } from "@/components/SpaceShooterGame";
import { RocketCatEasterEgg } from "@/components/RocketCatEasterEgg";

export default function Home() {
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [folderOpen, setFolderOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<ArcadeGameType | null>(null);
  const [isGameYellow, setIsGameYellow] = useState(false);

  // Dynamic link URL sync (?game=folder | flappy | fruit | minesweeper | shooter)
  useEffect(() => {
    const parseUrlParam = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const gameParam = params.get("game");

      if (!gameParam) return;

      if (gameParam === "folder") {
        setFolderOpen(true);
        setActiveGame(null);
      } else if (gameParam === "flappy" || gameParam === "flappy-bird") {
        setFolderOpen(true);
        setActiveGame("flappy");
      } else if (gameParam === "fruit" || gameParam === "fruit-box") {
        setFolderOpen(true);
        setActiveGame("fruit");
      } else if (gameParam === "minesweeper") {
        setFolderOpen(true);
        setActiveGame("minesweeper");
      } else if (gameParam === "shooter" || gameParam === "space-shooter") {
        setFolderOpen(true);
        setActiveGame("shooter");
      }
    };

    parseUrlParam();

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const gameParam = params.get("game");
      if (!gameParam) {
        setFolderOpen(false);
        setActiveGame(null);
      } else if (gameParam === "folder") {
        setFolderOpen(true);
        setActiveGame(null);
      } else if (gameParam === "flappy" || gameParam === "flappy-bird") {
        setFolderOpen(true);
        setActiveGame("flappy");
      } else if (gameParam === "fruit" || gameParam === "fruit-box") {
        setFolderOpen(true);
        setActiveGame("fruit");
      } else if (gameParam === "minesweeper") {
        setFolderOpen(true);
        setActiveGame("minesweeper");
      } else if (gameParam === "shooter" || gameParam === "space-shooter") {
        setFolderOpen(true);
        setActiveGame("shooter");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update browser URL query parameter when state changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const currentGameParam = url.searchParams.get("game");

    let targetParam: string | null = null;
    if (activeGame) {
      targetParam = activeGame;
    } else if (folderOpen) {
      targetParam = "folder";
    }

    if (currentGameParam !== targetParam) {
      if (targetParam) {
        url.searchParams.set("game", targetParam);
      } else {
        url.searchParams.delete("game");
      }
      window.history.pushState({}, "", url.toString());
    }
  }, [folderOpen, activeGame]);

  useEffect(() => {
    // 1. IntersectionObserver on #contact section ("THANKS FOR YOUR TIME!")
    const contactElem = document.getElementById("contact");
    let observer: IntersectionObserver | null = null;

    if (contactElem) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsGameYellow(true);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(contactElem);
    }

    // 2. Also listen to window scroll to detect when near bottom
    const handleScroll = () => {
      const scrollPos = window.innerHeight + window.scrollY;
      const totalHeight = document.documentElement.scrollHeight;
      if (scrollPos >= totalHeight - 350) {
        setIsGameYellow(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (observer) observer.disconnect();
    };
  }, []);

  const scrollToAbout = () => {
    const elem = document.getElementById("about");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenFolder = () => {
    setFolderOpen(true);
  };

  const handleLaunchGame = (gameType: ArcadeGameType) => {
    setActiveGame(gameType);
  };

  return (
    <main className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[#030e06] text-white selection:bg-emerald-600 selection:text-white">
      {/* Background Interactive Pixel Starfield & Meteors */}
      <SpaceCanvas />

      {/* CRT Scanline Retro Filter Overlay */}
      {crtEnabled && <div className="crt-overlay" />}

      {/* Top Retro HUD Navigation Bar */}
      <RetroNavbar
        crtEnabled={crtEnabled}
        onToggleCrt={() => setCrtEnabled(!crtEnabled)}
        onOpenMiniGame={handleOpenFolder}
        isGameYellow={isGameYellow}
      />

      {/* Hero Section (Matching Behance ref1.gif) */}
      <HeroSection
        onStartQuest={scrollToAbout}
        onOpenGame={handleOpenFolder}
      />

      {/* Profile & About Section (Matching Behance ref2.png & ref3.png) */}
      <AboutSection />

      {/* Career Timeline & Experience (SENBOX, NTSoft, Satek) */}
      <ExperienceSection />

      {/* Projects Showcase & ROM Vault (Self Manager AI, Daily Motivation, LADB Remover, ATTP, etc.) */}
      <ProjectsSection />

      {/* Skill Tree & Character Inventory (Flutter, Dart, Clean Architecture, SQLite, Gemini AI) */}
      <SkillsSection />

      {/* Contact & Ending Screen (Matching Behance ref4.gif) */}
      <ContactSection />

      {/* Step 1: Retro OS Game Folder Window (Opens first when clicking Game button) */}
      {folderOpen && (
        <GameFolderModal
          onClose={() => {
            setFolderOpen(false);
            setActiveGame(null);
          }}
          onLaunchGame={handleLaunchGame}
        />
      )}

      {/* Step 2A: Retro Flappy Bird Arcade */}
      {activeGame === "flappy" && (
        <PixelEasterEgg
          onClose={() => setActiveGame(null)}
          gameId="flappy-bird"
        />
      )}

      {/* Step 2B: Fruit Box (Apple Game) Arcade */}
      {activeGame === "fruit" && (
        <FruitBoxGame
          onClose={() => setActiveGame(null)}
          gameId="fruit-box"
        />
      )}

      {/* Step 2C: Retro Minesweeper */}
      {activeGame === "minesweeper" && (
        <MinesweeperGame
          onClose={() => setActiveGame(null)}
          gameId="minesweeper"
        />
      )}

      {/* Step 2D: Retro Space Shooter / Galaxy Invaders */}
      {activeGame === "shooter" && (
        <SpaceShooterGame
          onClose={() => setActiveGame(null)}
          gameId="space-shooter"
        />
      )}

      {/* Retro Interactive Cat Riding a Rocket (Hidden while playing any game) */}
      <RocketCatEasterEgg isGameActive={folderOpen || activeGame !== null} />
    </main>
  );
}
