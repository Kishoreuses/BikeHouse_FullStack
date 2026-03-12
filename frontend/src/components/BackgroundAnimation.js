import React, { useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════
   BikeHouse — Professional Bike-Themed Background Animation
   
   Layers:
   1. Speed Streaks  – horizontal light trails shooting left
   2. Exhaust Smoke  – smoke clouds drifting from left side
   3. Engine Sparks  – flying sparks from bottom-left corner
   4. Speedometer Arc – subtle spinning arc decorations
   5. Race Track Grid – diagonal speed-grid in background
   6. Scrolling marquee text strips
   ═══════════════════════════════════════════════════════════ */

/* ── Inject global keyframes once ───────────────────────── */
const KEYFRAMES = `
@keyframes marquee-left  { from{transform:translateX(0)} to{transform:translateX(-33.33%)} }
@keyframes marquee-right { from{transform:translateX(-33.33%)} to{transform:translateX(0)} }
@keyframes exhaustRise   {
  0%   { transform: translateY(0)   scale(0.8); opacity:0; }
  15%  { opacity: 0.55; }
  70%  { opacity: 0.25; }
  100% { transform: translateY(-260px) scale(2.8); opacity:0; }
}
@keyframes sparkFly {
  0%   { transform: translate(0,0) rotate(var(--a)); opacity:1; }
  100% { transform: translate(var(--dx), var(--dy)) rotate(var(--a)); opacity:0; }
}
@keyframes speedometerSpin {
  0%   { transform: rotate(-10deg) scale(1);    opacity:0.06; }
  50%  { transform: rotate(18deg)  scale(1.05); opacity:0.10; }
  100% { transform: rotate(-10deg) scale(1);    opacity:0.06; }
}
@keyframes rpmPulse {
  0%,100% { opacity:0.04; transform:scale(1); }
  50%     { opacity:0.09; transform:scale(1.04); }
}
@keyframes flameLick {
  0%,100% { transform: scaleY(1)   skewX(0deg);   opacity:0.55; }
  33%     { transform: scaleY(1.4) skewX(-6deg);  opacity:0.80; }
  66%     { transform: scaleY(0.8) skewX(4deg);   opacity:0.40; }
}
`;

function InjectKeyframes() {
  useEffect(() => {
    const id = 'bh-bike-keyframes';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = KEYFRAMES;
      document.head.appendChild(s);
    }
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);
  return null;
}

/* ══════════════════════════════════════════════════════════
   1. CANVAS — Speed Streaks + Exhaust Smoke + Sparks
   ══════════════════════════════════════════════════════════ */
function BikeCanvas() {
  const ref = useRef(null);
  const anim = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    /* ── Speed streaks ──────────────────────────────────── */
    const streaks = Array.from({ length: 28 }, () => newStreak(W, H));

    function newStreak(W, H) {
      return {
        x: W + Math.random() * 400,
        y: Math.random() * H,
        len: 80 + Math.random() * 260,
        speed: 8 + Math.random() * 18,
        alpha: 0.04 + Math.random() * 0.14,
        width: 0.4 + Math.random() * 1.2,
        color: Math.random() < 0.6 ? 'orange' : Math.random() < 0.5 ? 'white' : 'cyan',
      };
    }

    const STREAK_COLOR = {
      orange: [247, 147, 30],
      white:  [200, 220, 255],
      cyan:   [30, 200, 255],
    };

    /* ── Exhaust smoke particles ────────────────────────── */
    const smokes = Array.from({ length: 18 }, () => newSmoke(W, H));

    function newSmoke(W, H) {
      const side = Math.random() < 0.5;
      return {
        x: side ? -20 + Math.random() * 80 : W + 20 - Math.random() * 80,
        y: H * 0.55 + Math.random() * H * 0.35,
        vx: (side ? 0.3 : -0.3) + (Math.random() - 0.5) * 0.4,
        vy: -(0.6 + Math.random() * 1.2),
        r: 8 + Math.random() * 18,
        alpha: 0.12 + Math.random() * 0.18,
        life: 0,
        maxLife: 90 + Math.random() * 80,
        gray: 80 + Math.floor(Math.random() * 60),
      };
    }

    /* ── Engine sparks ──────────────────────────────────── */
    const sparks = Array.from({ length: 24 }, () => newSpark(W, H));

    function newSpark(W, H) {
      // Sparks shoot from bottom corners diagonally
      const fromLeft = Math.random() < 0.5;
      const angle = fromLeft
        ? (-50 + Math.random() * 80) * Math.PI / 180
        : (-130 + Math.random() * 80) * Math.PI / 180;
      const spd = 2 + Math.random() * 5;
      return {
        x: fromLeft ? Math.random() * W * 0.15 : W - Math.random() * W * 0.15,
        y: H - Math.random() * H * 0.12,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        r: 0.5 + Math.random() * 1.5,
        alpha: 0.6 + Math.random() * 0.4,
        life: 0,
        maxLife: 30 + Math.random() * 40,
        color: Math.random() < 0.5 ? [247, 147, 30] : [255, 215, 0],
      };
    }

    /* ── Draw loop ──────────────────────────────────────── */
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      /* Speed streaks */
      for (const s of streaks) {
        s.x -= s.speed;
        if (s.x + s.len < 0) Object.assign(s, newStreak(W, H));

        const [r, g, b] = STREAK_COLOR[s.color];
        const grad = ctx.createLinearGradient(s.x - s.len, s.y, s.x, s.y);
        grad.addColorStop(0, `rgba(${r},${g},${b},${s.alpha})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.len, s.y);
        ctx.stroke();
      }

      /* Exhaust smoke */
      for (const sm of smokes) {
        sm.x += sm.vx;
        sm.y += sm.vy;
        sm.r  += 0.25;
        sm.life++;
        const progress = sm.life / sm.maxLife;
        const a = sm.alpha * (1 - progress);
        ctx.beginPath();
        ctx.arc(sm.x, sm.y, sm.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${sm.gray},${sm.gray},${sm.gray},${a})`;
        ctx.fill();
        if (sm.life >= sm.maxLife) Object.assign(sm, newSmoke(W, H));
      }

      /* Sparks */
      for (const sp of sparks) {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.08; // mild gravity
        sp.life++;
        const a = sp.alpha * (1 - sp.life / sp.maxLife);
        const [r, g, b] = sp.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fill();
        // Spark tail
        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(sp.x - sp.vx * 3, sp.y - sp.vy * 3);
        ctx.strokeStyle = `rgba(${r},${g},${b},${a * 0.5})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
        if (sp.life >= sp.maxLife) Object.assign(sp, newSpark(W, H));
      }

      anim.current = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(anim.current); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:0.75 }}
    />
  );
}

/* ══════════════════════════════════════════════════════════
   2. SPEEDOMETER RINGS — decorative arcs
   ══════════════════════════════════════════════════════════ */
function SpeedometerRings() {
  const rings = [
    { size: 420, right: '-80px', top: '8%',  delay: '0s', dur: '9s' },
    { size: 280, right: '60px',  top: '18%', delay: '2s', dur: '7s' },
    { size: 200, right: '-20px', top: '30%', delay: '4s', dur: '11s' },
    { size: 340, left: '-60px',  bottom: '12%', delay: '1s', dur: '8s' },
  ];
  return (
    <>
      {rings.map((r, i) => (
        <div key={i} style={{
          position: 'fixed',
          width: r.size, height: r.size,
          borderRadius: '50%',
          border: '1px solid rgba(247,147,30,0.10)',
          right: r.right, left: r.left,
          top: r.top, bottom: r.bottom,
          pointerEvents: 'none', zIndex: 0,
          animation: `speedometerSpin ${r.dur} ease-in-out ${r.delay} infinite`,
          background: `conic-gradient(
            from -90deg,
            rgba(247,147,30,0.06) 0deg,
            rgba(247,147,30,0.12) 120deg,
            rgba(30,136,229,0.04) 200deg,
            transparent 220deg,
            transparent 360deg
          )`,
          boxShadow: 'inset 0 0 40px rgba(247,147,30,0.04)',
        }}>
          {/* tick marks around the ring */}
          {Array.from({ length: 12 }, (_, t) => (
            <div key={t} style={{
              position: 'absolute',
              width: 2, height: t % 3 === 0 ? 14 : 8,
              background: t % 3 === 0 ? 'rgba(247,147,30,0.25)' : 'rgba(255,255,255,0.08)',
              borderRadius: 2,
              top: '50%', left: '50%',
              transformOrigin: `1px ${r.size / 2}px`,
              transform: `translateX(-1px) translateY(-${r.size / 2}px) rotate(${t * 30}deg)`,
            }} />
          ))}
        </div>
      ))}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   3. EXHAUST FLAME LICKS — bottom left corner
   ══════════════════════════════════════════════════════════ */
function ExhaustFlames() {
  const flames = [
    { left: '2%',  bottom: '4%', h: 55, color: '#f7931e', delay: '0s',    dur: '0.8s', skew: '-5deg' },
    { left: '3%',  bottom: '4%', h: 40, color: '#ffd700', delay: '0.15s', dur: '0.7s', skew: '4deg'  },
    { left: '4%',  bottom: '4%', h: 65, color: '#ff6b35', delay: '0.3s',  dur: '0.9s', skew: '-8deg' },
    { left: '5%',  bottom: '4%', h: 30, color: '#f7931e', delay: '0.45s', dur: '0.6s', skew: '6deg'  },
    // right side mirror
    { right: '2%', bottom: '4%', h: 50, color: '#f7931e', delay: '0.1s',  dur: '0.85s', skew: '5deg'  },
    { right: '3%', bottom: '4%', h: 35, color: '#ffd700', delay: '0.25s', dur: '0.75s', skew: '-4deg' },
    { right: '4%', bottom: '4%', h: 60, color: '#ff6b35', delay: '0.4s',  dur: '0.95s', skew: '8deg'  },
  ];

  return (
    <>
      {flames.map((f, i) => (
        <div key={i} style={{
          position: 'fixed',
          left: f.left, right: f.right, bottom: f.bottom,
          width: 8 + (i % 3) * 3,
          height: f.h,
          background: `linear-gradient(to top, ${f.color}, transparent)`,
          borderRadius: '50% 50% 30% 30% / 80% 80% 20% 20%',
          transformOrigin: 'bottom center',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.55,
          filter: 'blur(2px)',
          animation: `flameLick ${f.dur} ease-in-out ${f.delay} infinite`,
          transform: `skewX(${f.skew})`,
        }} />
      ))}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   4. SPEED LINE GRID — diagonal lines in far background
   ══════════════════════════════════════════════════════════ */
function SpeedGrid() {
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
    }}>
      {/* Diagonal speed lines */}
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `-20%`,
          left: `${-10 + i * 8}%`,
          width: 1,
          height: '140%',
          background: `linear-gradient(to bottom,
            transparent 0%,
            rgba(247,147,30,${0.02 + (i % 4) * 0.012}) 40%,
            rgba(247,147,30,${0.03 + (i % 3) * 0.01}) 60%,
            transparent 100%
          )`,
          transform: 'rotate(15deg)',
          transformOrigin: 'top center',
          animation: `rpmPulse ${4 + (i % 4)}s ease-in-out ${i * 0.3}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   5. SCROLLING MARQUEE TEXT — bike brands / terms
   ══════════════════════════════════════════════════════════ */
const TRACK_WORDS_1 = '  🏍️ BIKEHOUSE   ⚡ 0-100   🔥 TOP SPEED   💨 FULL THROTTLE   🏆 PREMIUM   ✅ VERIFIED   🛣️ OPEN ROAD   🔩 ENGINE ROAR';
const TRACK_WORDS_2 = '  KTM   HONDA   YAMAHA   ROYAL ENFIELD   BAJAJ   TVS   SUZUKI   HARLEY   TRIUMPH   DUCATI   BMW   KAWASAKI';

function MarqueeTrack({ words, top, dir, speed, opacity }) {
  const rep = `${words}   ${words}   ${words}`;
  return (
    <div style={{ position:'fixed', top, left:0, width:'100%', overflow:'hidden', pointerEvents:'none', zIndex:0, opacity }}>
      <div style={{
        display: 'inline-block',
        animation: `marquee-${dir} ${speed}s linear infinite`,
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 900,
        fontSize: 'clamp(8px, 1.1vw, 15px)',
        letterSpacing: '0.30em',
        color: dir === 'left' ? '#f7931e' : '#1e88e5',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        {rep}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   6. RPM METER — decorative needle gauge top-right corner
   ══════════════════════════════════════════════════════════ */
function RpmMeter() {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      width: 110, height: 110,
      pointerEvents: 'none', zIndex: 0, opacity: 0.12,
    }}>
      <svg viewBox="0 0 110 110" width="110" height="110">
        {/* Arc background */}
        <path d="M 10 90 A 50 50 0 0 1 100 90" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" strokeLinecap="round"/>
        {/* RPM fill arc */}
        <path d="M 10 90 A 50 50 0 0 1 100 90" fill="none" stroke="#f7931e" strokeWidth="6"
          strokeLinecap="round" strokeDasharray="157" strokeDashoffset="40"
          style={{ animation: 'rpmPulse 3s ease-in-out infinite' }}
        />
        {/* Tick marks */}
        {Array.from({ length: 9 }, (_, i) => {
          const a = (-180 + i * 22.5) * Math.PI / 180;
          const cx = 55, cy = 90, r1 = 44, r2 = 38;
          return (
            <line key={i}
              x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)}
              x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
              stroke={i === 8 ? '#ef4444' : 'rgba(255,255,255,0.35)'}
              strokeWidth={i === 8 ? 2.5 : 1.2} strokeLinecap="round"
            />
          );
        })}
        {/* Needle */}
        <line x1="55" y1="90" x2="22" y2="52"
          stroke="#ffd700" strokeWidth="2.2" strokeLinecap="round"
          style={{ transformOrigin: '55px 90px', animation: 'speedometerSpin 4s ease-in-out infinite' }}
        />
        {/* Center dot */}
        <circle cx="55" cy="90" r="5" fill="#f7931e"/>
        {/* Label */}
        <text x="55" y="78" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.5)" fontFamily="Poppins,sans-serif" fontWeight="700">RPM</text>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════ */
export default function BackgroundAnimation() {
  return (
    <>
      <InjectKeyframes />
      <BikeCanvas />
      <SpeedGrid />
      <SpeedometerRings />
      <ExhaustFlames />
      <RpmMeter />
      <MarqueeTrack words={TRACK_WORDS_1} top="14%"  dir="left"  speed={40} opacity={0.05} />
      <MarqueeTrack words={TRACK_WORDS_2} top="36%"  dir="right" speed={55} opacity={0.04} />
      <MarqueeTrack words={TRACK_WORDS_1} top="62%"  dir="left"  speed={48} opacity={0.035} />
      <MarqueeTrack words={TRACK_WORDS_2} top="84%"  dir="right" speed={60} opacity={0.03} />
    </>
  );
}
