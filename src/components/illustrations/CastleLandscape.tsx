import React from 'react';
import { motion, MotionValue } from 'framer-motion';

interface CastleLandscapeProps {
  skyY?: MotionValue<number>;
  distantMountainsY?: MotionValue<number>;
  midMountainsY?: MotionValue<number>;
  castleY?: MotionValue<number>;
  foregroundY?: MotionValue<number>;
  cloudsX?: MotionValue<number>;
}

export const CastleLandscape: React.FC<CastleLandscapeProps> = ({
  skyY,
  distantMountainsY,
  midMountainsY,
  castleY,
  foregroundY,
  cloudsX,
}) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Layer 1: Warm Parchment Beige Sky & Sun Glow */}
      <motion.div
        style={{ y: skyY }}
        className="absolute inset-0 bg-gradient-to-b from-[#EEDBBB] via-[#E8D1A7] to-[#DEC093]"
      >
        {/* Soft Golden Sun Orb */}
        <div className="absolute top-[18%] left-[22%] w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-radial from-[#FFF3D6] via-[#F5E2B8]/80 to-transparent blur-2xl opacity-70" />
      </motion.div>

      {/* Layer 2: Atmospheric Drifting Clouds */}
      <motion.div
        style={{ x: cloudsX }}
        className="absolute top-[10%] inset-x-0 h-44 opacity-40 mix-blend-screen"
      >
        <svg viewBox="0 0 1440 200" fill="none" className="w-[180%] h-full">
          <path
            d="M50 120 C120 70, 200 80, 260 110 C320 80, 420 75, 490 115 C560 90, 660 95, 720 125 C800 100, 910 105, 980 130 C1060 95, 1180 90, 1260 125 C1340 105, 1420 110, 1480 135 L1480 200 L0 200 Z"
            fill="#FFF8EC"
            opacity="0.6"
          />
          <path
            d="M-50 150 C40 110, 150 120, 220 140 C310 115, 410 110, 480 145 C580 120, 680 125, 760 150 C860 130, 960 135, 1040 155 C1140 125, 1260 130, 1340 160 L1440 200 L-100 200 Z"
            fill="#F6E7CE"
            opacity="0.8"
          />
        </svg>
      </motion.div>

      {/* Layer 3: Distant Mountain Ranges (Soft Muted Sage Tone #57736B) */}
      <motion.div
        style={{ y: distantMountainsY }}
        className="absolute bottom-[28%] inset-x-0 h-[48%]"
      >
        <svg
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0 240 L120 180 L280 230 L450 140 L620 220 L780 160 L920 210 L1100 130 L1260 200 L1440 150 L1440 400 L0 400 Z"
            fill="#69857D"
            opacity="0.85"
          />
          <path
            d="M0 260 L180 200 L340 250 L520 170 L680 240 L840 190 L1020 230 L1200 170 L1360 220 L1440 190 L1440 400 L0 400 Z"
            fill="#4F6D65"
            opacity="0.9"
          />
        </svg>
      </motion.div>

      {/* Layer 4: Middle Mountain Silhouettes (#304943) */}
      <motion.div
        style={{ y: midMountainsY }}
        className="absolute bottom-[16%] inset-x-0 h-[45%]"
      >
        <svg
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0 290 Q150 200 320 260 T680 220 T1040 240 T1440 180 L1440 400 L0 400 Z"
            fill="#304943"
          />
          {/* Subtle ridge highlights */}
          <path
            d="M320 260 L450 320 L580 270 L680 220"
            stroke="#476860"
            strokeWidth="3"
            fill="none"
            opacity="0.4"
          />
          <path
            d="M1040 240 L1180 300 L1320 230 L1440 180"
            stroke="#476860"
            strokeWidth="3"
            fill="none"
            opacity="0.4"
          />
        </svg>
      </motion.div>

      {/* Layer 5: Medieval Mountain Castle on the Right Ridge */}
      <motion.div
        style={{ y: castleY }}
        className="absolute bottom-[20%] right-2 md:right-16 lg:right-28 w-[320px] sm:w-[420px] md:w-[540px] lg:w-[620px] z-10"
      >
        <svg
          viewBox="0 0 600 450"
          className="w-full h-auto drop-shadow-[0_20px_35px_rgba(10,25,22,0.6)]"
        >
          {/* Castle Rocky Foundation Cliff */}
          <path
            d="M160 410 L210 320 L270 335 L330 300 L410 320 L480 300 L550 360 L570 450 L100 450 Z"
            fill="#1D302C"
          />
          <path
            d="M210 320 L240 370 L280 340 L340 380 L420 330 L490 380 L550 360"
            stroke="#2C453F"
            strokeWidth="4"
            fill="none"
          />

          {/* Castle Main Keep & Walls (#202724 & Charcoal tones) */}
          {/* Outer Curtain Wall */}
          <rect x="230" y="270" width="280" height="60" fill="#1C2C28" rx="2" />
          {/* Battlements on outer wall */}
          <path
            d="M230 270 h15 v-10 h15 v10 h15 v-10 h15 v10 h15 v-10 h15 v10 h15 v-10 h15 v10 h15 v-10 h15 v10 h15 v-10 h15 v10 h15 v-10 h15 v10 h15 v-10 h15 v10 h15 v-10 h15 v10"
            stroke="#13201D"
            strokeWidth="2"
            fill="#1C2C28"
          />

          {/* Left Round Tower */}
          <rect x="210" y="210" width="55" height="110" fill="#182723" rx="4" />
          {/* Conical Roof Left Tower */}
          <polygon points="205,210 237,135 270,210" fill="#B88A4A" />
          <line x1="237" y1="135" x2="237" y2="115" stroke="#EAD3AA" strokeWidth="2" />
          {/* Banner flag on left tower */}
          <polygon points="237,115 260,123 237,131" fill="#D97A53" />

          {/* Central High Keep */}
          <rect x="280" y="160" width="105" height="150" fill="#1D2E2A" />
          {/* Main Tower Battlements */}
          <path
            d="M278 160 h12 v-8 h12 v8 h12 v-8 h12 v8 h12 v-8 h12 v8 h12 v-8 h12 v8 h13"
            stroke="#121D1A"
            strokeWidth="2"
            fill="#1D2E2A"
          />
          {/* Spires on Central Keep */}
          <polygon points="310,160 332,80 355,160" fill="#B88A4A" />
          <line x1="332" y1="80" x2="332" y2="60" stroke="#EAD3AA" strokeWidth="2" />
          <polygon points="332,60 360,70 332,80" fill="#D97A53" />

          {/* Right Sentry Tower */}
          <rect x="420" y="195" width="50" height="120" fill="#172522" rx="3" />
          <polygon points="415,195 445,130 475,195" fill="#80674D" />
          <line x1="445" y1="130" x2="445" y2="112" stroke="#EAD3AA" strokeWidth="2" />
          <polygon points="445,112 468,120 445,128" fill="#B88A4A" />

          {/* Far Right Corner Turret */}
          <rect x="485" y="240" width="40" height="85" fill="#15211E" />
          <polygon points="480,240 505,185 530,240" fill="#9C743E" />

          {/* Castle Windows & Warm Amber Arrow Slits */}
          <rect x="232" y="240" width="8" height="18" rx="4" fill="#EAD3AA" opacity="0.8" />
          <rect x="300" y="190" width="12" height="24" rx="6" fill="#F5E9D2" opacity="0.9" />
          <rect x="350" y="190" width="12" height="24" rx="6" fill="#F5E9D2" opacity="0.9" />
          <rect x="325" y="235" width="16" height="28" rx="8" fill="#EAD3AA" opacity="0.75" />
          <rect x="440" y="225" width="8" height="18" rx="4" fill="#EAD3AA" opacity="0.8" />
          <rect x="500" y="260" width="6" height="14" rx="3" fill="#EAD3AA" opacity="0.7" />

          {/* Castle Gatehouse Arch */}
          <path d="M320 320 Q335 285 350 320 Z" fill="#0C1412" />
          {/* Ambient Window Glow effect */}
          <circle cx="332" cy="202" r="18" fill="#EAD3AA" opacity="0.15" filter="blur(6px)" />
        </svg>
      </motion.div>

      {/* Layer 6: Dark Foreground Mountains & Forest Ridges (#142523 and #0D1A18) */}
      <motion.div
        style={{ y: foregroundY }}
        className="absolute bottom-0 inset-x-0 h-[28%] z-20"
      >
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Mid-foreground Pine Tree Ridge */}
          <path
            d="M0 160 Q200 120 440 150 T900 130 T1440 120 L1440 320 L0 320 Z"
            fill="#1D302C"
          />
          {/* Foreground Deep Forest Slope */}
          <path
            d="M0 210 Q320 160 720 200 T1440 180 L1440 320 L0 320 Z"
            fill="#142523"
          />
          {/* Base Anchor Dark Tone */}
          <rect x="0" y="280" width="1440" height="40" fill="#142523" />
        </svg>
      </motion.div>

      {/* Ambient Atmospheric Bottom Fog/Fade into Marketplace Section */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#142523] via-[#142523]/80 to-transparent z-30" />
    </div>
  );
};
