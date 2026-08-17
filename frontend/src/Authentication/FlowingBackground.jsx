import React from "react";

const FlowingBackground = ({
  className = "fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-white select-none",
  isDark = false,
}) => {
  return (
    <div className={className}>
      {/* 1. Atmospheric Icy-Blue & White Base Gradient */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-slate-950"
            : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/70 via-white to-sky-50/50"
        }`}
      ></div>

      {/* 2. Soft Ambient Luminous Glow Orbs along Outer Margins */}
      {!isDark && (
        <>
          <div className="absolute -top-20 -right-20 w-[45rem] h-[45rem] bg-sky-200/45 rounded-full filter blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-20 w-[48rem] h-[48rem] bg-cyan-200/40 rounded-full filter blur-[110px] pointer-events-none"></div>
          <div className="absolute top-1/4 -left-24 w-[36rem] h-[36rem] bg-blue-300/30 rounded-full filter blur-[90px] pointer-events-none"></div>
          <div className="absolute bottom-1/3 -right-24 w-[38rem] h-[38rem] bg-sky-300/35 rounded-full filter blur-[95px] pointer-events-none"></div>
        </>
      )}

      {/* 3. Primary Curved Light Trails Layer 1 (Sweeping Top-Right to Bottom-Left) */}
      <div className="absolute -top-[25%] -left-[15%] w-[135%] h-[140%] animate-trail-slow pointer-events-none">
        <svg
          viewBox="0 0 1600 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="w-full h-full object-cover filter drop-shadow-lg"
        >
          <defs>
            {/* Luminous Ice-Blue Ribbon Gradient 1 */}
            <linearGradient id="iceRibbonGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="25%" stopColor="#60a5fa" stopOpacity="0.3" />
              <stop offset="55%" stopColor="#bae6fd" stopOpacity="0.4" />
              <stop offset="85%" stopColor="#ffffff" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
            </linearGradient>

            {/* Glowing Thin Curved Line Gradient 2 */}
            <linearGradient id="thinLineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="20%" stopColor="#7dd3fc" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
            </linearGradient>

            {/* Glowing Thin Curved Line Gradient 3 */}
            <linearGradient id="thinLineGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="90%" stopColor="#7dd3fc" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
            </linearGradient>

            {/* Soft Glow Filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Broad Curved Luminous Background Ribbon 1 */}
          <path
            d="M -150 1050 C 150 820, 450 920, 800 600 C 1150 280, 1300 400, 1850 -200 L 1950 -100 C 1400 550, 1100 420, 750 750 C 400 1080, 100 950, -50 1150 Z"
            fill="url(#iceRibbonGrad1)"
          />

          {/* Multiple Thin Glowing Curved Lines (Edge Light Trails) */}
          <path
            d="M -100 950 C 250 750, 500 850, 850 520 C 1200 190, 1400 320, 1800 -100"
            stroke="url(#thinLineGrad1)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#softGlow)"
          />

          <path
            d="M -80 970 C 270 770, 520 870, 870 540 C 1220 210, 1420 340, 1820 -80"
            stroke="url(#thinLineGrad2)"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.9"
          />

          <path
            d="M -120 930 C 230 730, 480 830, 830 500 C 1180 170, 1380 300, 1780 -120"
            stroke="url(#thinLineGrad1)"
            strokeWidth="1.2"
            strokeDasharray="12 8"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* 4. Secondary Counter-Moving Curved Light Trails Layer 2 */}
      <div className="absolute -bottom-[20%] -right-[15%] w-[130%] h-[135%] animate-trail-reverse pointer-events-none">
        <svg
          viewBox="0 0 1600 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="w-full h-full object-cover filter drop-shadow-md"
        >
          <defs>
            <linearGradient id="iceRibbonGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.2" />
              <stop offset="40%" stopColor="#bae6fd" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.15" />
            </linearGradient>

            <linearGradient id="thinLineGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="30%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Broad Curved Luminous Background Ribbon 2 */}
          <path
            d="M -50 1100 C 400 850, 700 950, 1100 600 C 1500 250, 1650 350, 1980 -150 L 1880 -250 C 1400 250, 1200 100, 800 500 C 400 900, 150 750, -150 1200 Z"
            fill="url(#iceRibbonGrad2)"
          />

          {/* Multiple Thin Sweeping Edge Light Lines */}
          <path
            d="M 50 1050 C 450 820, 730 910, 1130 570 C 1530 230, 1680 320, 1930 -180"
            stroke="url(#thinLineGrad3)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#softGlow)"
          />

          <path
            d="M 70 1070 C 470 840, 750 930, 1150 590 C 1550 250, 1700 340, 1950 -160"
            stroke="url(#thinLineGrad1)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      </div>

      {/* 5. Clean Luminous Center Vignette Mask (Ensures Wide Open & Readable Center) */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark
            ? "bg-radial from-slate-950/80 via-slate-950/50 to-slate-950"
            : "bg-[radial-gradient(circle_at_50%_40%,_rgba(255,255,255,0.7)_0%,_rgba(255,255,255,0.4)_50%,_rgba(240,249,255,0.15)_100%)]"
        }`}
      ></div>
    </div>
  );
};

export default FlowingBackground;
