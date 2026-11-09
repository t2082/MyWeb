"use client";

import React, { useState } from "react";
import { PixelWindow } from "./PixelWindow";
import { PORTFOLIO_DATA, Project } from "@/data/portfolioData";
import { sound } from "@/lib/sound";

export const ProjectsSection: React.FC = () => {
  const { projects } = PORTFOLIO_DATA;
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filters = [
    { id: "all", label: "ALL ROMS" },
    { id: "ai", label: "AI & GEMINI" },
    { id: "mobile", label: "MOBILE APPS" },
    { id: "utility", label: "DEV UTILITIES" },
  ];

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => {
          if (activeFilter === "ai") return p.category === "ai";
          if (activeFilter === "mobile") return p.category === "mobile";
          if (activeFilter === "utility") return p.category === "utility";
          return true;
        });

  return (
    <section id="projects" className="py-12 px-4 max-w-7xl mx-auto select-none">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 font-pixelify font-bold text-sm text-[#bef264] mb-2">
          <span>✦</span>
          <span>SELECT CARTRIDGE</span>
          <span>✦</span>
        </div>
        <h2 className="pixel-3d-title text-2xl sm:text-4xl md:text-5xl tracking-wide">
          PROJECTS_VAULT.ROM
        </h2>
        <p className="font-pixelify text-sm sm:text-base text-emerald-300 mt-2">
          Production mobile applications, AI assistants, and open-source utilities
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {filters.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  sound.playBlip();
                  setActiveFilter(f.id);
                }}
                className={`font-pixelify font-bold text-xs sm:text-sm px-4 py-2 border-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#059669] border-[#a7f3d0] text-white shadow-[2px_2px_0_#064e3b] -translate-y-0.5"
                    : "bg-[#04190c] border-[#064e3b] text-emerald-300 hover:border-[#34d399] hover:text-white"
                }`}
              >
                {isActive ? "► " : ""}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <PixelWindow title="Projects_Vault.rom">
        {/* Project Cartridge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="pixel-card flex flex-col justify-between p-4 group cursor-pointer relative"
              onClick={() => {
                sound.playClick();
                setSelectedProject(project);
              }}
            >
              <div>
                {/* Top Cartridge Header */}
                <div className="flex items-center justify-between border-b border-[#064e3b] pb-2 mb-3">
                  <span className="font-pixelify text-xs font-semibold text-teal-200 bg-[#042c16] px-2 py-0.5 border border-[#34d399]/40">
                    {project.badge}
                  </span>
                  <span className="font-pixelify text-xs font-bold text-[#bef264]">
                    {project.time}
                  </span>
                </div>

                {/* Project Title */}
                <h3 className="font-pixelify font-bold text-base sm:text-lg text-white mb-1.5 group-hover:text-[#bef264] transition-colors">
                  {project.title}
                </h3>

                {/* Role / Context */}
                <div className="font-pixelify font-medium text-xs sm:text-sm text-emerald-300 mb-3">
                  {project.role}
                </div>

                {/* Summary */}
                <p className="font-pixelify text-sm sm:text-base text-emerald-100 leading-relaxed mb-4 line-clamp-3">
                  {project.summary}
                </p>

                {/* Metrics Highlight */}
                {project.metrics && (
                  <div className="bg-[#031d0e] border-l-2 border-[#10b981] p-2 text-xs sm:text-sm font-pixelify font-medium text-mint-200 mb-4">
                    ★ {project.metrics}
                  </div>
                )}
              </div>

              <div>
                {/* Tech Chips */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.techStack.slice(0, 4).map((tech, i) => (
                    <span
                      key={i}
                      className="font-pixelify text-xs bg-[#042c16] text-emerald-200 px-2 py-0.5 border border-[#064e3b] font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="font-pixelify text-xs bg-[#064e3b] text-teal-200 px-1.5 py-0.5 font-medium">
                      +{project.techStack.length - 4}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-[#064e3b]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playWindowOpen();
                      setSelectedProject(project);
                    }}
                    className="pixel-btn text-xs font-pixelify font-bold px-3 py-1.5 bg-[#047857] border border-[#a7f3d0]"
                  >
                    🔍 INSPECT ROM
                  </button>

                  <div className="flex items-center gap-1.5">
                    {project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                        }}
                        title="GitHub Code"
                        className="w-7 h-7 flex items-center justify-center bg-[#022c15] border border-[#34d399] text-xs hover:bg-[#064e3b]"
                      >
                        👾
                      </a>
                    )}
                    {project.links.playStore && (
                      <a
                        href={project.links.playStore}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                        }}
                        title="Google Play"
                        className="w-7 h-7 flex items-center justify-center bg-[#065f46] border border-[#6ee7b7] text-xs hover:bg-[#047857]"
                      >
                        ▶
                      </a>
                    )}
                    {project.links.appStore && (
                      <a
                        href={project.links.appStore}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                        }}
                        title="App Store"
                        className="w-7 h-7 flex items-center justify-center bg-[#0284c7] border border-[#bae6fd] text-xs hover:bg-[#0369a1]"
                      >
                        
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PixelWindow>

      {/* Inspect ROM Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => {
            sound.playClick();
            setSelectedProject(null);
          }}
        >
          <div
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <PixelWindow
              title={`ROM: ${selectedProject.title}`}
              onClose={() => setSelectedProject(null)}
              showMediaFooter={false}
            >
              <div className="space-y-4">
                {/* Modal Header */}
                <div className="border-b border-[#064e3b] pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className="font-pixelify font-bold text-lg md:text-xl text-[#bef264]">
                      {selectedProject.title}
                    </h3>
                    <span className="font-pixelify text-xs font-semibold bg-[#042c16] text-mint-200 px-2.5 py-1 border border-[#34d399]">
                      {selectedProject.time}
                    </span>
                  </div>
                  <div className="font-pixelify text-xs sm:text-sm text-emerald-300 font-semibold">
                    {selectedProject.role}
                  </div>
                </div>

                {/* Key Metric Banner */}
                {selectedProject.metrics && (
                  <div className="bg-[#042c16] border-2 border-[#10b981] p-3 text-sm md:text-base font-pixelify font-semibold text-mint-200">
                    ★ {selectedProject.metrics}
                  </div>
                )}

                {/* Detailed Features */}
                <div>
                  <div className="font-pixelify font-bold text-sm sm:text-base text-white mb-2 flex items-center gap-2">
                    <span className="text-[#34d399]">◆</span>
                    <span>Core Features &amp; Implementation:</span>
                  </div>
                  <ul className="space-y-2 text-sm md:text-base text-emerald-50 font-pixelify leading-relaxed">
                    {selectedProject.description.map((desc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#34d399] font-bold text-sm mt-0.5">
                          ▪
                        </span>
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Complete Tech Arsenal */}
                <div>
                  <div className="font-pixelify font-bold text-sm sm:text-base text-white mb-2 flex items-center gap-2">
                    <span className="text-[#34d399]">◆</span>
                    <span>Technologies Used:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="font-pixelify text-xs sm:text-sm font-semibold bg-[#031d0e] text-emerald-200 px-2.5 py-1 border border-[#34d399]/40 shadow-[1px_1px_0_#022c15]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Modal Footer Links */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#064e3b]">
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.links.github && (
                      <a
                        href={selectedProject.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pixel-btn text-xs sm:text-sm font-pixelify font-bold px-3.5 py-2 bg-[#047857]"
                      >
                        👾 GITHUB REPO
                      </a>
                    )}
                    {selectedProject.links.playStore && (
                      <a
                        href={selectedProject.links.playStore}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pixel-btn text-xs sm:text-sm font-pixelify font-bold px-3.5 py-2 bg-[#059669]"
                      >
                        ▶ GOOGLE PLAY
                      </a>
                    )}
                    {selectedProject.links.appStore && (
                      <a
                        href={selectedProject.links.appStore}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pixel-btn text-xs sm:text-sm font-pixelify font-bold px-3.5 py-2 bg-[#0284c7]"
                      >
                         APP STORE
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedProject(null);
                    }}
                    className="pixel-btn text-xs sm:text-sm font-pixelify font-bold px-4 py-2 bg-[#e11d48]"
                  >
                    CLOSE [✕]
                  </button>
                </div>
              </div>
            </PixelWindow>
          </div>
        </div>
      )}
    </section>
  );
};
