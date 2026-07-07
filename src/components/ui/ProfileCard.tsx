"use client";

import { useState } from "react";

const profileImg = "/assets/Profile.webp";

interface ProfileCardProps {
  image?: string;
  name?: string;
  bio?: string;
  projects?: string;
  repos?: string;
}

export default function ProfileCard({
  image = profileImg,
  name = "Excel Viryan",
  bio = "Information Technology undergraduate at President University. Full-stack web developer & robotics enthusiast.",
  projects = "12",
  repos = "21"
}: ProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="group relative w-[300px] h-[460px] rounded-[28px] bg-[#1a1a1f] border border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:shadow-[0_24px_64px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] mx-auto text-left">
      {/* Photo wrapper — Default: ~55% height, Hover: 100% height */}
      <div className="absolute top-3 left-3 right-3 h-[55%] overflow-hidden rounded-[24px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:h-[calc(100%-24px)] group-hover:rounded-[18px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="Profile" className="w-full h-full object-cover object-top block transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />
        <div className="absolute bottom-0 left-0 right-0 h-[160px] bg-gradient-to-b from-transparent to-[#1a1a1f] opacity-0 transition-opacity duration-500 ease pointer-events-none group-hover:opacity-100" />
      </div>

      {/* Info — always pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-[18px_20px_20px] flex flex-col gap-3 bg-[#1a1a1f] transition-colors duration-500 ease group-hover:bg-transparent">
        <div className="flex items-center gap-1.5">
          <h1 className="text-[1.25rem] font-bold text-[#f0f0f5] tracking-tight leading-[1.2] m-0">{name}</h1>
          <span className="flex items-center justify-center w-[22px] h-[22px] bg-[#22c55e] rounded-full shrink-0 transition-colors duration-300 ease group-hover:bg-[#ffffff]/25" title="Verified">
            <svg viewBox="0 0 24 24" fill="currentColor" className="fill-white w-[13px] h-[13px]">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </span>
        </div>
        <p className="text-[0.82rem] text-white/45 leading-[1.55] transition-colors duration-300 ease group-hover:text-white/65 m-0">{bio}</p>

        {/* Bottom Row: Stats & Action Button */}
        <div className="flex items-center justify-between gap-4 mt-1">
          <div className="flex items-center gap-3.5">
            {/* Projects Stat — folder icon */}
            <div className="flex items-center gap-1.25" title="Projects">
              <svg className="text-white/35 group-hover:text-white/55 w-[15px] h-[15px] shrink-0 transition-colors duration-300 ease" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
              </svg>
              <span className="text-[0.86rem] font-bold text-[#f0f0f5] leading-none">{projects}</span>
            </div>

            {/* Repos Stat — book icon (GitHub-repo style) */}
            <div className="flex items-center gap-1.25" title="Repositories">
              <svg className="text-white/35 group-hover:text-white/55 w-[15px] h-[15px] shrink-0 transition-colors duration-300 ease" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              <span className="text-[0.86rem] font-bold text-[#f0f0f5] leading-none">{repos}</span>
            </div>
          </div>

          <button
            className={"flex-1 inline-flex items-center justify-center py-2.5 px-4 rounded-full font-semibold text-[0.78rem] cursor-pointer transition-all duration-180 ease active:translate-y-0 border-none min-w-[100px] " + (isFollowing ? "bg-[#ffffff]/10 text-white border border-white/15 shadow-none hover:bg-[#ffffff]/15" : "bg-[#ffffff] text-[#111113] shadow-[0_2px_12px_rgba(255,255,255,0.15)] hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,255,255,0.25)]")}
            onClick={() => setIsFollowing(!isFollowing)}
          >
            {isFollowing ? "Resume Downloaded" : "Get Resume"}
          </button>
        </div>
      </div>
    </div>
  );
}
