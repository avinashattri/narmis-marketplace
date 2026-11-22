import React from 'react';
import { motion, MotionValue, useReducedMotion } from 'framer-motion';

interface MountainForestLandscapeProps {
  skyY?: MotionValue<number>;
  sunX?: MotionValue<number>;
  sunY?: MotionValue<number>;
  cloudsX?: MotionValue<number>;
  farMountainsY?: MotionValue<number>;
  farMountainsX?: MotionValue<number>;
  farMountainsScale?: MotionValue<number>;
  backFogY?: MotionValue<number>;
  midMountainsY?: MotionValue<number>;
  midMountainsX?: MotionValue<number>;
  nearRidgeY?: MotionValue<number>;
  nearRidgeX?: MotionValue<number>;
  particlesY?: MotionValue<number>;
  foregroundY?: MotionValue<number>;
  foregroundX?: MotionValue<number>;
}

const FLOATING_MOTES = [
  { cx: 140, cy: 520, r: 2.1, delay: '0s', dur: '9s', opacity: 0.55 },
  { cx: 310, cy: 430, r: 1.6, delay: '1.8s', dur: '11s', opacity: 0.45 },
  { cx: 490, cy: 360, r: 2.4, delay: '0.6s', dur: '10s', opacity: 0.5 },
  { cx: 670, cy: 470, r: 1.8, delay: '2.5s', dur: '12s', opacity: 0.4 },
  { cx: 820, cy: 310, r: 2.6, delay: '1.2s', dur: '8.5s', opacity: 0.6 },
  { cx: 960, cy: 420, r: 1.9, delay: '3.1s', dur: '10.5s', opacity: 0.55 },
  { cx: 1090, cy: 280, r: 2.2, delay: '0.9s', dur: '9.5s', opacity: 0.65 },
  { cx: 1210, cy: 490, r: 1.7, delay: '2.1s', dur: '11.5s', opacity: 0.45 },
  { cx: 1340, cy: 380, r: 2.3, delay: '1.5s', dur: '9.2s', opacity: 0.5 },
  { cx: 230, cy: 610, r: 1.5, delay: '3.4s', dur: '12.5s', opacity: 0.4 },
  { cx: 740, cy: 560, r: 2.0, delay: '0.4s', dur: '10.2s', opacity: 0.5 },
  { cx: 1140, cy: 610, r: 1.8, delay: '2.8s', dur: '11.2s', opacity: 0.45 },
];

/**
 * Reusable silhouette pine cluster generator for natural alpine ridgelines
 */
const PineCluster: React.FC<{
  trees: Array<{ x: number; baseY: number; h: number; w: number }>;
  fill: string;
  opacity?: number;
}> = ({ trees, fill, opacity = 1 }) => (
  <g fill={fill} opacity={opacity}>
    {trees.map((t, i) => {
      const topY = t.baseY - t.h;
      const mid1Y = t.baseY - t.h * 0.66;
      const mid2Y = t.baseY - t.h * 0.36;
      return (
        <path
          key={i}
          d={`
            M ${t.x} ${topY}
            L ${t.x + t.w * 0.32} ${mid1Y}
            L ${t.x + t.w * 0.14} ${mid1Y}
            L ${t.x + t.w * 0.44} ${mid2Y}
            L ${t.x + t.w * 0.22} ${mid2Y}
            L ${t.x + t.w * 0.54} ${t.baseY}
            L ${t.x - t.w * 0.54} ${t.baseY}
            L ${t.x - t.w * 0.22} ${mid2Y}
            L ${t.x - t.w * 0.44} ${mid2Y}
            L ${t.x - t.w * 0.14} ${mid1Y}
            L ${t.x - t.w * 0.32} ${mid1Y}
            Z
          `}
        />
      );
    })}
  </g>
);

const MID_PINE_LINE = [
  { x: 60, baseY: 740, h: 120, w: 52 },
  { x: 110, baseY: 745, h: 95, w: 42 },
  { x: 165, baseY: 735, h: 138, w: 56 },
  { x: 225, baseY: 742, h: 108, w: 46 },
  { x: 290, baseY: 748, h: 86, w: 38 },
  { x: 350, baseY: 755, h: 74, w: 34 },
  { x: 540, baseY: 760, h: 68, w: 32 },
  { x: 600, baseY: 756, h: 84, w: 38 },
  { x: 660, baseY: 762, h: 72, w: 32 },
  { x: 960, baseY: 748, h: 88, w: 40 },
  { x: 1025, baseY: 740, h: 115, w: 48 },
  { x: 1090, baseY: 732, h: 140, w: 56 },
  { x: 1160, baseY: 738, h: 122, w: 50 },
  { x: 1230, baseY: 730, h: 148, w: 58 },
  { x: 1300, baseY: 736, h: 128, w: 52 },
  { x: 1370, baseY: 728, h: 154, w: 62 },
  { x: 1425, baseY: 736, h: 118, w: 48 },
];

const FOREGROUND_LEFT_PINES = [
  { x: -10, baseY: 910, h: 360, w: 145 },
  { x: 75, baseY: 915, h: 285, w: 115 },
  { x: 155, baseY: 920, h: 215, w: 92 },
  { x: 230, baseY: 922, h: 145, w: 66 },
];

const FOREGROUND_RIGHT_PINES = [
  { x: 1450, baseY: 910, h: 390, w: 155 },
  { x: 1355, baseY: 915, h: 310, w: 124 },
  { x: 1265, baseY: 918, h: 235, w: 96 },
  { x: 1185, baseY: 922, h: 165, w: 72 },
  { x: 1120, baseY: 924, h: 115, w: 52 },
];

export const MountainForestLandscape: React.FC<MountainForestLandscapeProps> = ({
  skyY,
  sunX,
  sunY,
  cloudsX,
  farMountainsY,
  farMountainsX,
  farMountainsScale,
  backFogY,
  midMountainsY,
  midMountainsX,
  nearRidgeY,
  nearRidgeX,
  particlesY,
  foregroundY,
  foregroundX,
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none bg-narmis-bg"
      aria-hidden="true"
    >
      {/* LAYER 1: Golden-Hour Alpine Sky & Sunlight Glow */}
      <motion.div
        style={{ y: skyY }}
        className="absolute -inset-x-6 -top-10 bottom-0 will-change-transform"
      >
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="narmisSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0D1A18" />
              <stop offset="32%" stopColor="#142523" />
              <stop offset="62%" stopColor="#223833" />
              <stop offset="86%" stopColor="#354C42" />
              <stop offset="100%" stopColor="#6C5B42" />
            </linearGradient>

            <radialGradient id="narmisSunHalo" cx="76%" cy="38%" r="48%">
              <stop offset="0%" stopColor="#F5E9D2" stopOpacity="0.52" />
              <stop offset="22%" stopColor="#EAD3AA" stopOpacity="0.28" />
              <stop offset="52%" stopColor="#B88A4A" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#142523" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="sunbeamGrad" x1="50%" y1="0%" x2="35%" y2="100%">
              <stop offset="0%" stopColor="#F5E9D2" stopOpacity="0.22" />
              <stop offset="55%" stopColor="#EAD3AA" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#EAD3AA" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect width="1440" height="900" fill="url(#narmisSkyGrad)" />
          <rect width="1440" height="900" fill="url(#narmisSunHalo)" />

          {/* Subtle golden alpine sun disc & crepuscular light shafts */}
          <motion.g style={{ x: sunX, y: sunY }}>
            <circle cx="1085" cy="315" r="46" fill="#F5E9D2" opacity="0.24" />
            <circle cx="1085" cy="315" r="22" fill="#F5E9D2" opacity="0.55" />
            <polygon points="1060,295 1135,320 820,860 660,860" fill="url(#sunbeamGrad)" />
            <polygon points="1105,310 1165,335 1020,860 885,860" fill="url(#sunbeamGrad)" opacity="0.7" />
            <polygon points="1030,305 1075,325 560,860 450,860" fill="url(#sunbeamGrad)" opacity="0.55" />
          </motion.g>
        </svg>
      </motion.div>

      {/* LAYER 2: High-Altitude Drifting Mist & Clouds */}
      <motion.div
        style={{ x: cloudsX }}
        className="absolute -inset-x-12 top-0 bottom-0 will-change-transform"
      >
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className={`w-full h-full ${prefersReduced ? '' : 'narmis-mist-slow'}`}
        >
          <defs>
            <linearGradient id="cloudRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EAD3AA" stopOpacity="0" />
              <stop offset="35%" stopColor="#F5E9D2" stopOpacity="0.14" />
              <stop offset="70%" stopColor="#EAD3AA" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#EAD3AA" stopOpacity="0" />
            </linearGradient>
          </defs>
          <ellipse cx="320" cy="210" rx="280" ry="34" fill="url(#cloudRibbon)" />
          <ellipse cx="890" cy="175" rx="340" ry="42" fill="url(#cloudRibbon)" />
          <ellipse cx="1220" cy="255" rx="260" ry="30" fill="url(#cloudRibbon)" />
          <ellipse cx="640" cy="285" rx="300" ry="26" fill="url(#cloudRibbon)" opacity="0.8" />
        </svg>
      </motion.div>

      {/* LAYER 3: Distant Alpine Peaks (Slowest Parallax) */}
      <motion.div
        style={{ y: farMountainsY, x: farMountainsX, scale: farMountainsScale }}
        className="absolute -inset-x-10 -top-6 -bottom-10 origin-bottom will-change-transform"
      >
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="farPeakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B574F" />
              <stop offset="48%" stopColor="#2B423C" />
              <stop offset="100%" stopColor="#1D302C" />
            </linearGradient>
            <linearGradient id="farSunRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EAD3AA" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#B88A4A" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Far sweeping mountain range */}
          <path
            d="M -40 610
               L 110 475 L 220 518 L 365 385 L 485 452 L 620 355
               L 745 430 L 895 318 L 1030 402 L 1165 295 L 1310 385 L 1480 325
               L 1480 900 L -40 900 Z"
            fill="url(#farPeakGrad)"
          />

          {/* Warm sunlit eastern facets catching golden-hour light */}
          <path
            d="M 895 318 L 948 390 L 1030 402 L 962 355 Z
               M 1165 295 L 1228 370 L 1310 385 L 1235 335 Z
               M 620 355 L 675 415 L 745 430 L 680 390 Z
               M 365 385 L 418 438 L 485 452 L 425 418 Z"
            fill="url(#farSunRim)"
          />
        </svg>
      </motion.div>

      {/* LAYER 4: Atmospheric Valley Mist (Between Far & Mid Ranges) */}
      <motion.div
        style={{ y: backFogY }}
        className="absolute -inset-x-10 inset-y-0 will-change-transform"
      >
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className={`w-full h-full ${prefersReduced ? '' : 'narmis-mist-drift'}`}
        >
          <defs>
            <linearGradient id="valleyMist1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EAD3AA" stopOpacity="0" />
              <stop offset="45%" stopColor="#EAD3AA" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#1D302C" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="390" width="1440" height="260" fill="url(#valleyMist1)" />
        </svg>
      </motion.div>

      {/* LAYER 5: Midground Forested Mountain Slopes (Medium Parallax) */}
      <motion.div
        style={{ y: midMountainsY, x: midMountainsX }}
        className="absolute -inset-x-12 -top-4 -bottom-16 will-change-transform"
      >
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="midMountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#263D38" />
              <stop offset="52%" stopColor="#1D302C" />
              <stop offset="100%" stopColor="#142523" />
            </linearGradient>
            <linearGradient id="midHighlight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B88A4A" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#1D302C" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path
            d="M -40 660
               C 90 560, 210 500, 340 535
               C 470 570, 560 635, 705 600
               C 855 562, 975 455, 1145 485
               C 1275 508, 1365 560, 1480 515
               L 1480 920 L -40 920 Z"
            fill="url(#midMountainGrad)"
          />

          {/* Sunlit ridge rim */}
          <path
            d="M 705 600 C 855 562, 975 455, 1145 485 C 1065 512, 965 565, 830 618 Z"
            fill="url(#midHighlight)"
          />
        </svg>
      </motion.div>

      {/* LAYER 6: Near Evergreen Ridge + Soft Valley Fog + Sunlit Floating Particles */}
      <motion.div
        style={{ y: nearRidgeY, x: nearRidgeX }}
        className="absolute -inset-x-12 -top-2 -bottom-20 will-change-transform"
      >
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="nearSlopeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1A2D29" />
              <stop offset="100%" stopColor="#12211F" />
            </linearGradient>
            <linearGradient id="lowMistGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5E9D2" stopOpacity="0" />
              <stop offset="50%" stopColor="#EAD3AA" stopOpacity="0.11" />
              <stop offset="100%" stopColor="#142523" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Soft golden valley fog */}
          <rect x="0" y="545" width="1440" height="190" fill="url(#lowMistGrad)" />

          {/* Rolling evergreen hills */}
          <path
            d="M -40 725
               Q 210 660 470 725
               T 980 715
               T 1480 680
               L 1480 920 L -40 920 Z"
            fill="url(#nearSlopeGrad)"
          />

          {/* Distant treeline silhouette along the ridge */}
          <PineCluster trees={MID_PINE_LINE} fill="#162724" opacity={0.95} />
        </svg>
      </motion.div>

      {/* Floating Sunlit Atmospheric Particles */}
      <motion.div
        style={{ y: particlesY }}
        className="absolute inset-0 will-change-transform"
      >
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          {FLOATING_MOTES.map((p, idx) => (
            <circle
              key={idx}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              fill={idx % 2 === 0 ? '#EAD3AA' : '#F5E9D2'}
              opacity={p.opacity}
              className={prefersReduced ? '' : 'narmis-particle-float'}
              style={
                prefersReduced
                  ? undefined
                  : {
                      animationDelay: p.delay,
                      animationDuration: p.dur,
                    }
              }
            />
          ))}
        </svg>
      </motion.div>

      {/* LAYER 7: Foreground Framing Evergreen Pines & Botanical Ferns (Fastest Parallax) */}
      <motion.div
        style={{ y: foregroundY, x: foregroundX }}
        className="absolute -inset-x-14 -top-2 -bottom-24 will-change-transform"
      >
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          {/* Deep forest ground contour */}
          <path
            d="M -40 835
               C 180 785, 340 855, 620 845
               C 900 835, 1140 775, 1480 815
               L 1480 940 L -40 940 Z"
            fill="#0F1D1B"
          />

          {/* Framing foreground pine silhouettes left & right */}
          <PineCluster trees={FOREGROUND_LEFT_PINES} fill="#0D1A18" />
          <PineCluster trees={FOREGROUND_RIGHT_PINES} fill="#0D1A18" />

          {/* Subtle botanical fern & wild grass silhouettes along foreground rim */}
          <g fill="#142523" opacity="0.92">
            <path d="M 275 885 Q 290 830 325 815 Q 302 848 292 885 Z" />
            <path d="M 295 888 Q 318 845 352 840 Q 324 862 312 888 Z" />
            <path d="M 1030 875 Q 1005 825 972 818 Q 1000 846 1012 875 Z" />
            <path d="M 1055 880 Q 1040 835 1015 826 Q 1034 854 1042 880 Z" />
          </g>
        </svg>
      </motion.div>

      {/* Editorial Contrast Scrim for Crisp Typography + Seamless Bottom Blend into #142523 */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0D1A18]/80 via-[#142523]/42 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-narmis-bg via-narmis-bg/85 to-transparent" />
    </div>
  );
};
