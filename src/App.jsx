import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Great+Vibes&family=Cinzel:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --crimson: #8b1a2e;
  --crimson-dark: #5c0f1d;
  --crimson-light: #c4253f;
  --gold: #c9a96e;
  --gold-light: #e8d5a3;
  --cream: #faf7f2;
  --paper: #f5f0e8;
  --ink: #2c1810;
  --ink-soft: #4a3428;
  --muted: #8a7a72;
  --curtain-red: #8b1a2e;
  --curtain-stripe: rgba(255,255,255,0.18);
}

html { overflow-x: hidden; scroll-behavior: smooth; }
body {
  font-family: 'EB Garamond', serif;
  background: var(--cream);
  color: var(--ink);
  overflow-x: hidden;
}

/* ── CURTAIN SCREEN ── */
.curtain-screen {
  position: fixed; inset: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; cursor: pointer;
  background: #1a0408;
}
.curtain-screen.hidden { display: none; }

.curtain-left, .curtain-right {
  position: absolute; top: 0; bottom: 0; width: 50%;
  background: var(--curtain-red);
  transition: transform 1.8s cubic-bezier(0.77,0,0.18,1);
  overflow: hidden;
  box-shadow: inset -4px 0 20px rgba(0,0,0,0.3);
}
.curtain-left { left: 0; transform-origin: left center; }
.curtain-right { right: 0; transform-origin: right center; }
.curtain-left.open { transform: translateX(-100%); }
.curtain-right.open { transform: translateX(100%); }

/* Curtain vertical stripes */
.curtain-stripes {
  position: absolute; inset: 0;
  display: flex;
}
.curtain-stripe {
  flex: 1;
  border-right: 1.5px solid var(--curtain-stripe);
  background: linear-gradient(180deg,
    rgba(255,255,255,0.06) 0%,
    rgba(255,255,255,0.02) 40%,
    rgba(255,255,255,0.06) 100%
  );
}

/* Curtain fold shading */
.curtain-left::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg,
    rgba(0,0,0,0.35) 0%,
    transparent 30%,
    rgba(0,0,0,0.1) 60%,
    rgba(0,0,0,0.4) 100%
  );
}
.curtain-right::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg,
    rgba(0,0,0,0.4) 0%,
    rgba(0,0,0,0.1) 40%,
    transparent 70%,
    rgba(0,0,0,0.35) 100%
  );
}

/* Curtain top valance */
.curtain-valance {
  position: absolute; top: 0; left: 0; right: 0; height: 56px; z-index: 2;
  background: linear-gradient(180deg, #6a1020 0%, #8b1a2e 100%);
  display: flex; align-items: center; justify-content: center;
  border-bottom: 2px solid rgba(201,169,110,0.4);
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}
.valance-rope {
  width: 100%; height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--gold) 10%,
    var(--gold) 90%,
    transparent 100%
  );
  position: relative;
}
.valance-rope::before, .valance-rope::after {
  content: '◆';
  position: absolute; top: 50%; transform: translateY(-50%);
  color: var(--gold); font-size: 10px;
}
.valance-rope::before { left: 10%; }
.valance-rope::after { right: 10%; }

/* Tassel */
.tassel {
  position: absolute; top: 52px; z-index: 10;
  display: flex; flex-direction: column; align-items: center;
  transition: transform 1.8s cubic-bezier(0.77,0,0.18,1);
}
.tassel-left { left: 49%; transform: translateX(-100%); }
.tassel-right { right: 49%; transform: translateX(100%); }
.tassel-left.open { transform: translateX(-260%) !important; }
.tassel-right.open { transform: translateX(260%) !important; }

.tassel-knot {
  width: 18px; height: 18px; border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #e8c880, #a07830);
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
}
.tassel-body {
  width: 3px; height: 40px;
  background: linear-gradient(180deg, #c9a96e, #a07830);
}
.tassel-fringe {
  display: flex; gap: 2px;
}
.tassel-thread {
  width: 1.5px; height: 28px;
  background: linear-gradient(180deg, #c9a96e, transparent);
  border-radius: 1px;
}

/* Curtain click hint */
.curtain-hint {
  position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%);
  z-index: 20; text-align: center;
  animation: hintPulse 2s ease-in-out infinite;
}
@keyframes hintPulse { 0%,100%{opacity:0.5;transform:translateX(-50%) translateY(0)} 50%{opacity:1;transform:translateX(-50%) translateY(-4px)} }
.curtain-hint-text {
  font-family: 'Cinzel', serif; font-size: 0.6rem; letter-spacing: 0.35em;
  text-transform: uppercase; color: rgba(255,255,255,0.7);
}
.curtain-hint-line {
  width: 1px; height: 30px; background: rgba(201,169,110,0.6);
  margin: 8px auto 0;
}

/* ── MAIN PAGE ── */
.page { background: var(--cream); min-height: 100vh; }

/* ── HERO ── */
.hero {
  min-height: 100svh; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 80px 32px 60px; text-align: center;
  position: relative; overflow: hidden;
  background: var(--cream);
}

/* Decorative curtain remnants on sides */
.hero-curtain-left, .hero-curtain-right {
  position: absolute; top: 0; bottom: 0; width: 72px;
  background: var(--curtain-red); overflow: hidden;
  z-index: 2; pointer-events: none;
}
.hero-curtain-left { left: 0; box-shadow: 4px 0 30px rgba(139,26,46,0.25); }
.hero-curtain-right { right: 0; box-shadow: -4px 0 30px rgba(139,26,46,0.25); }
.hero-curtain-left .curtain-stripes,
.hero-curtain-right .curtain-stripes { opacity: 0.5; }

/* Tassel on hero curtains */
.hero-tassel {
  position: absolute; top: 44px;
  display: flex; flex-direction: column; align-items: center; z-index: 3;
}
.hero-tassel.left { right: -4px; }
.hero-tassel.right { left: -4px; }

/* Top valance bar */
.hero-valance {
  position: absolute; top: 0; left: 0; right: 0; height: 44px; z-index: 3;
  background: var(--curtain-red);
  display: flex; align-items: center; justify-content: center;
}
.hero-valance::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}

.hero-content { position: relative; z-index: 5; max-width: 340px; width: 100%; }

.hero-eyebrow {
  font-family: 'Cinzel', serif; font-size: 0.52rem; letter-spacing: 0.38em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 28px;
  animation: fadeUp 1s 0.2s both;
}
.hero-names {
  font-family: 'Great Vibes', cursive;
  font-size: clamp(3.8rem, 14vw, 5.2rem);
  color: var(--ink); line-height: 1.05;
  animation: fadeUp 1s 0.35s both;
}
.hero-amp {
  font-family: 'Great Vibes', cursive;
  font-size: clamp(2.2rem, 8vw, 3rem);
  color: var(--crimson); display: block; margin: 4px 0;
}
.hero-divider {
  display: flex; align-items: center; gap: 12px; margin: 24px 0 20px;
  animation: fadeUp 1s 0.5s both;
}
.hero-divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--crimson), transparent); }
.hero-divider-diamond { width: 6px; height: 6px; background: var(--crimson); transform: rotate(45deg); flex-shrink: 0; }

.hero-body {
  font-family: 'EB Garamond', serif; font-style: italic;
  font-size: 1rem; color: var(--ink-soft); line-height: 1.85;
  animation: fadeUp 1s 0.6s both;
}
.hero-date {
  font-family: 'Cinzel', serif; font-size: 0.68rem; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--ink); margin-top: 20px;
  animation: fadeUp 1s 0.7s both;
}

@keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }

/* ── SECTION BASE ── */
.section {
  padding: 72px 32px; max-width: 480px; margin: 0 auto;
  text-align: center;
}
.section-label {
  font-family: 'Cinzel', serif; font-size: 0.48rem; letter-spacing: 0.42em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 8px; display: block;
}
.section-title {
  font-family: 'Great Vibes', cursive; font-size: clamp(2.6rem, 9vw, 3.4rem);
  color: var(--ink); line-height: 1;
}
.section-body {
  font-family: 'EB Garamond', serif; font-size: 1rem; color: var(--ink-soft);
  line-height: 1.8; margin-top: 14px;
}

/* ── SCRATCH REVEAL ── */
.scratch-section {
  padding: 72px 32px 60px; text-align: center; position: relative;
  background: var(--cream);
}
.scratch-subtitle {
  font-family: 'Cinzel', serif; font-size: 0.5rem; letter-spacing: 0.35em;
  text-transform: uppercase; color: var(--muted); margin-top: 6px;
  display: block;
}

.scratch-cards-row {
  display: flex; justify-content: center; gap: 16px;
  margin-top: 36px; flex-wrap: wrap;
}

.scratch-card-wrap { position: relative; }
.scratch-card {
  width: 90px; height: 90px; border-radius: 50%;
  position: relative; overflow: hidden; cursor: crosshair;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.8) inset;
  user-select: none; -webkit-user-select: none;
  flex-shrink: 0;
}
.scratch-reveal-text {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  flex-direction: column;
  background: var(--paper);
  border-radius: 50%;
}
.scratch-reveal-num {
  font-family: 'Cormorant Garamond', serif; font-weight: 500;
  font-size: 1.8rem; color: var(--crimson); line-height: 1;
}
.scratch-reveal-word {
  font-family: 'Cinzel', serif; font-size: 0.48rem; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--muted); margin-top: 4px;
}
.scratch-canvas {
  position: absolute; inset: 0; border-radius: 50%;
  touch-action: none;
}

.scratch-revealed-msg {
  margin-top: 28px; animation: fadeUp 0.6s ease both;
}
.scratch-revealed-msg span {
  font-family: 'Great Vibes', cursive; font-size: 1.6rem; color: var(--crimson);
}

/* Confetti */
.confetti-piece {
  position: fixed; pointer-events: none; z-index: 900;
  border-radius: 2px;
  animation: confettiFall linear forwards;
}
@keyframes confettiFall {
  0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
}

/* ── COUNTDOWN ── */
.countdown-section {
  padding: 60px 32px; text-align: center; background: var(--cream);
}
.cd-boxes {
  display: flex; justify-content: center; gap: 10px; margin-top: 32px;
  flex-wrap: wrap;
}
.cd-box {
  border: 1.5px solid var(--crimson); padding: 14px 12px 10px;
  min-width: 68px; position: relative;
  background: white;
}
.cd-box::before {
  content: ''; position: absolute; inset: 3px;
  border: 1px solid rgba(139,26,46,0.15); pointer-events: none;
}
.cd-num {
  font-family: 'Cormorant Garamond', serif; font-weight: 600;
  font-size: 2.2rem; color: var(--crimson); line-height: 1; display: block;
}
.cd-lbl {
  font-family: 'Cinzel', serif; font-size: 0.38rem; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--muted); margin-top: 4px; display: block;
}
.cd-num.flip { animation: numFlip 0.25s ease both; }
@keyframes numFlip { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }

/* ── VENUE ── */
.venue-section {
  padding: 72px 32px; text-align: center; position: relative;
  background: var(--cream);
}
.venue-label {
  font-family: 'Cinzel', serif; font-size: 0.48rem; letter-spacing: 0.4em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 20px;
}
.venue-illustration {
  width: min(280px, 90%); margin: 0 auto 28px;
}
.venue-name {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 500;
  font-size: clamp(1.8rem, 6vw, 2.4rem); color: var(--ink); line-height: 1.15;
}
.venue-address {
  font-family: 'EB Garamond', serif; font-size: 0.9rem; color: var(--muted);
  margin-top: 10px; line-height: 1.7;
}
.venue-map-btn {
  display: inline-flex; align-items: center; gap: 8px;
  margin-top: 20px; padding: 11px 26px;
  border: 1.5px solid var(--crimson); background: var(--crimson);
  font-family: 'Cinzel', serif; font-size: 0.5rem; letter-spacing: 0.2em;
  text-transform: uppercase; color: white; cursor: pointer;
  text-decoration: none; transition: all 0.25s ease;
}
.venue-map-btn:hover { background: var(--crimson-dark); }

/* ── SCHEDULE / WAVY FRAME ── */
.schedule-section {
  padding: 60px 24px 80px; background: var(--cream);
}
.schedule-frame-wrap {
  max-width: 360px; margin: 0 auto; position: relative;
}
.schedule-svg-frame {
  position: absolute; inset: 0; pointer-events: none; overflow: visible;
}
.schedule-inner {
  padding: 56px 36px 48px;
  position: relative; z-index: 1;
}

/* Bow */
.schedule-bow { text-align: center; margin-bottom: 20px; }

.schedule-title {
  font-family: 'Cinzel', serif; font-size: 0.52rem; letter-spacing: 0.42em;
  text-transform: uppercase; color: var(--crimson); margin-bottom: 22px;
  text-align: center;
}
.schedule-events { display: flex; flex-direction: column; gap: 0; }
.schedule-event {
  display: grid; grid-template-columns: 80px 1fr;
  gap: 0 16px; padding: 12px 0;
  border-bottom: 1px solid rgba(139,26,46,0.1);
}
.schedule-event:last-child { border-bottom: none; }
.ev-time {
  font-family: 'Cinzel', serif; font-size: 0.55rem; letter-spacing: 0.1em;
  color: var(--crimson); padding-top: 3px; text-align: right;
}
.ev-detail {}
.ev-name {
  font-family: 'Cormorant Garamond', serif; font-weight: 600;
  font-size: 0.95rem; color: var(--ink);
}
.ev-desc {
  font-family: 'EB Garamond', serif; font-style: italic;
  font-size: 0.82rem; color: var(--muted); margin-top: 2px; line-height: 1.5;
}

/* Venue illustration inside schedule */
.schedule-venue-art { text-align: center; margin-top: 20px; }

/* ── DRESS CODE ── */
.dresscode-section {
  padding: 60px 32px; text-align: center; background: var(--cream);
}
.dresscode-title {
  font-family: 'Cormorant Garamond', serif; font-size: clamp(2rem, 8vw, 3rem);
  font-weight: 400; color: var(--ink); margin-top: 4px;
}
.dresscode-body {
  font-family: 'EB Garamond', serif; font-size: 0.95rem; color: var(--ink-soft);
  line-height: 1.8; margin-top: 14px;
}
.color-swatches {
  display: flex; justify-content: center; gap: 10px; margin-top: 20px;
}
.swatch {
  width: 36px; height: 36px; border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

/* ── GIFTS ── */
.gifts-section {
  padding: 72px 32px; text-align: center; background: var(--cream);
}
.gifts-icon { font-size: 2rem; margin-bottom: 8px; }
.gifts-title {
  font-family: 'Cormorant Garamond', serif; font-size: clamp(2rem, 8vw, 3rem);
  font-weight: 400; color: var(--ink);
}
.gifts-body {
  font-family: 'EB Garamond', serif; font-size: 0.95rem; color: var(--ink-soft);
  line-height: 1.8; margin-top: 14px;
}
.gifts-love {
  font-family: 'Great Vibes', cursive; font-size: 2rem; color: var(--crimson);
  margin-top: 24px;
}
.gifts-registry {
  border: 1.5px solid rgba(139,26,46,0.3);
  padding: 20px 24px; margin-top: 24px; text-align: left;
  position: relative;
}
.gifts-registry::before {
  content: ''; position: absolute; inset: 4px;
  border: 1px solid rgba(139,26,46,0.12); pointer-events: none;
}
.registry-label {
  font-family: 'Cinzel', serif; font-size: 0.44rem; letter-spacing: 0.35em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 10px; display: block;
}
.registry-item {
  font-family: 'EB Garamond', serif; font-size: 0.88rem; color: var(--ink-soft);
  line-height: 1.7; display: flex; align-items: baseline; gap: 8px;
}
.registry-item::before { content: '◆'; font-size: 0.4rem; color: var(--crimson); flex-shrink: 0; }

/* ── TRANSPORT ── */
.transport-section {
  padding: 60px 32px 72px; background: var(--cream);
}
.transport-eyebrow {
  font-family: 'Cinzel', serif; font-size: 0.48rem; letter-spacing: 0.4em;
  text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 6px;
}
.transport-title {
  font-family: 'Cormorant Garamond', serif; font-weight: 400;
  font-size: clamp(2.6rem, 10vw, 4rem); color: var(--ink); line-height: 1;
  margin-bottom: 20px;
}
.transport-info {
  font-family: 'EB Garamond', serif; font-size: 0.95rem;
  color: var(--ink-soft); line-height: 1.8;
}
.transport-divider {
  width: 40px; height: 1px;
  background: var(--crimson); margin: 20px 0;
}

/* ── RSVP ── */
.rsvp-section {
  padding: 72px 32px 90px; background: var(--crimson);
  text-align: center;
}
.rsvp-eyebrow {
  font-family: 'Cinzel', serif; font-size: 0.5rem; letter-spacing: 0.42em;
  text-transform: uppercase; color: rgba(255,255,255,0.55); display: block; margin-bottom: 8px;
}
.rsvp-title {
  font-family: 'Great Vibes', cursive; font-size: clamp(2.8rem, 10vw, 3.8rem);
  color: white; line-height: 1;
}
.rsvp-body {
  font-family: 'EB Garamond', serif; font-style: italic;
  font-size: 1rem; color: rgba(255,255,255,0.7); line-height: 1.8; margin-top: 12px;
}
.rsvp-form {
  max-width: 380px; margin: 36px auto 0;
  display: flex; flex-direction: column; gap: 14px;
}
.rsvp-input, .rsvp-select {
  width: 100%; padding: 14px 18px;
  border: 1px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.1);
  font-family: 'EB Garamond', serif; font-size: 1rem; color: white;
  outline: none; appearance: none;
  transition: border-color 0.2s, background 0.2s;
}
.rsvp-input::placeholder { color: rgba(255,255,255,0.35); }
.rsvp-input:focus, .rsvp-select:focus {
  border-color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.15);
}
.rsvp-select option { background: var(--crimson-dark); color: white; }
.rsvp-btn {
  padding: 16px; background: white;
  font-family: 'Cinzel', serif; font-size: 0.6rem; letter-spacing: 0.3em;
  text-transform: uppercase; color: var(--crimson); border: none;
  cursor: pointer; transition: all 0.25s ease; margin-top: 6px;
}
.rsvp-btn:hover { background: var(--gold-light); }
.rsvp-success {
  padding-top: 28px;
  font-family: 'Great Vibes', cursive; font-size: 2.4rem; color: white;
  animation: fadeUp 0.6s ease both;
}

/* ── FOOTER ── */
.footer {
  background: var(--ink); padding: 56px 32px; text-align: center;
}
.footer-names {
  font-family: 'Great Vibes', cursive; font-size: 2.8rem;
  color: var(--gold-light); margin-bottom: 10px;
}
.footer-date {
  font-family: 'Cinzel', serif; font-size: 0.52rem; letter-spacing: 0.3em;
  text-transform: uppercase; color: rgba(255,255,255,0.3);
}
.footer-ornament {
  display: flex; align-items: center; gap: 14px;
  justify-content: center; margin-top: 22px;
}
.footer-line { flex: 1; max-width: 60px; height: 1px; background: rgba(201,169,110,0.25); }
.footer-gem { width: 6px; height: 6px; background: rgba(201,169,110,0.4); transform: rotate(45deg); }

/* ── SCROLL REVEAL ── */
.reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.9s ease, transform 0.9s ease; }
.reveal.d1 { transition-delay: 0.1s; }
.reveal.d2 { transition-delay: 0.2s; }
.reveal.visible { opacity: 1; transform: none; }

/* ── MUSIC FAB ── */
.music-fab {
  position: fixed; bottom: 24px; right: 20px; z-index: 800;
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--crimson); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(139,26,46,0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.music-fab:hover { transform: scale(1.1); box-shadow: 0 8px 32px rgba(139,26,46,0.5); }
.music-waves { display: flex; align-items: center; gap: 2px; height: 16px; }
.wave-bar {
  width: 2.5px; border-radius: 2px; background: white;
  animation: waveAnim ease-in-out infinite alternate;
}
@keyframes waveAnim { from{height:3px} to{height:14px} }
`;

/* ═══════════════════════════════════════════════
   CURTAIN COMPONENT
═══════════════════════════════════════════════ */
function Curtain({ onOpen }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const stripeCount = 14;

  const handleClick = () => {
    if (open) return;
    setOpen(true);
    setTimeout(() => setHidden(true), 2200);
    setTimeout(onOpen, 1200);
  };

  const threads = [0, -1, 1, -2, 2, -1, 0, 1, -1, 0];

  return (
    <div className={`curtain-screen${hidden ? " hidden" : ""}`} onClick={handleClick}>
      <div className="curtain-valance">
        <div className="valance-rope" />
      </div>

      {/* Left curtain */}
      <div className={`curtain-left${open ? " open" : ""}`}>
        <div className="curtain-stripes">
          {Array.from({ length: stripeCount }, (_, i) => (
            <div key={i} className="curtain-stripe" />
          ))}
        </div>
      </div>

      {/* Right curtain */}
      <div className={`curtain-right${open ? " open" : ""}`}>
        <div className="curtain-stripes">
          {Array.from({ length: stripeCount }, (_, i) => (
            <div key={i} className="curtain-stripe" />
          ))}
        </div>
      </div>

      {/* Tassels */}
      <div className={`tassel tassel-left${open ? " open" : ""}`}>
        <div className="tassel-knot" />
        <div className="tassel-body" />
        <div className="tassel-fringe">
          {threads.map((_, i) => (
            <div key={i} className="tassel-thread" style={{ height: 24 + (i % 3) * 6 }} />
          ))}
        </div>
      </div>
      <div className={`tassel tassel-right${open ? " open" : ""}`}>
        <div className="tassel-knot" />
        <div className="tassel-body" />
        <div className="tassel-fringe">
          {threads.map((_, i) => (
            <div key={i} className="tassel-thread" style={{ height: 24 + (i % 3) * 6 }} />
          ))}
        </div>
      </div>

      {!open && (
        <div className="curtain-hint">
          <div className="curtain-hint-text">Tap to open</div>
          <div className="curtain-hint-line" />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SCRATCH CARD
═══════════════════════════════════════════════ */
function ScratchCard({ label, value, onScratched }) {
  const canvasRef = useRef(null);
  const [scratched, setScratched] = useState(false);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const scratchedPct = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;

    // Gold radial scratch-off overlay
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, "#d4b06a");
    grad.addColorStop(0.4, "#c9a050");
    grad.addColorStop(0.7, "#b08030");
    grad.addColorStop(1, "#9a6820");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();

    // Radial shine lines
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const x1 = w / 2 + Math.cos(angle) * 8;
      const y1 = h / 2 + Math.sin(angle) * 8;
      const x2 = w / 2 + Math.cos(angle) * (w / 2 - 2);
      const y2 = h / 2 + Math.sin(angle) * (w / 2 - 2);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, []);

  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - r.left) * scaleX,
      y: (src.clientY - r.top) * scaleY,
    };
  };

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      ctx.lineWidth = 28;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
    lastPos.current = { x, y };

    // Check % scratched
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) transparent++;
    }
    const pct = transparent / (data.length / 4);
    scratchedPct.current = pct;
    if (pct > 0.55 && !scratched) {
      setScratched(true);
      // Clear fully
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onScratched?.();
    }
  };

  const onMouseDown = (e) => { isDrawing.current = true; const p = getPos(e, canvasRef.current); scratch(p.x, p.y); };
  const onMouseMove = (e) => { if (!isDrawing.current) return; const p = getPos(e, canvasRef.current); scratch(p.x, p.y); };
  const onMouseUp = () => { isDrawing.current = false; lastPos.current = null; };
  const onTouchStart = (e) => { e.preventDefault(); isDrawing.current = true; const p = getPos(e, canvasRef.current); scratch(p.x, p.y); };
  const onTouchMove = (e) => { e.preventDefault(); if (!isDrawing.current) return; const p = getPos(e, canvasRef.current); scratch(p.x, p.y); };

  return (
    <div className="scratch-card-wrap">
      <div className="scratch-card">
        <div className="scratch-reveal-text">
          <span className="scratch-reveal-num">{value}</span>
          <span className="scratch-reveal-word">{label}</span>
        </div>
        <canvas
          ref={canvasRef}
          className="scratch-canvas"
          width={180} height={180}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onMouseUp}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CONFETTI
═══════════════════════════════════════════════ */
function launchConfetti() {
  const colors = ["#8b1a2e", "#c9a96e", "#2c1810", "#e8d5a3", "#c4253f", "#5c0f1d"];
  const pieces = 80;
  for (let i = 0; i < pieces; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    const color = colors[Math.floor(Math.random() * colors.length)];
    const isRect = Math.random() > 0.5;
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: -10px;
      width: ${isRect ? Math.random() * 8 + 4 : Math.random() * 6 + 4}px;
      height: ${isRect ? Math.random() * 4 + 2 : Math.random() * 6 + 4}px;
      background: ${color};
      border-radius: ${isRect ? "2px" : "50%"};
      animation-duration: ${Math.random() * 2.5 + 2}s;
      animation-delay: ${Math.random() * 0.8}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

/* ═══════════════════════════════════════════════
   VENUE ILLUSTRATION SVG
═══════════════════════════════════════════════ */
function VenueIllustration({ size = 280 }) {
  return (
    <svg viewBox="0 0 280 160" width={size} style={{ display: "block", margin: "0 auto" }}>
      {/* Sky / bg */}
      <rect width="280" height="160" fill="none" />
      {/* Ground line */}
      <line x1="0" y1="148" x2="280" y2="148" stroke="#8b1a2e" strokeWidth="0.8" strokeDasharray="4,3" opacity="0.4" />
      {/* Main building */}
      <rect x="70" y="60" width="140" height="88" fill="none" stroke="#8b1a2e" strokeWidth="1.2" />
      {/* Roof */}
      <polygon points="70,60 140,20 210,60" fill="none" stroke="#8b1a2e" strokeWidth="1.2" />
      {/* Chimney L */}
      <rect x="90" y="28" width="8" height="18" fill="none" stroke="#8b1a2e" strokeWidth="1" />
      {/* Chimney R */}
      <rect x="182" y="28" width="8" height="18" fill="none" stroke="#8b1a2e" strokeWidth="1" />
      {/* Columns */}
      {[90, 115, 140, 165].map(x => (
        <line key={x} x1={x} y1="60" x2={x} y2="148" stroke="#8b1a2e" strokeWidth="0.8" opacity="0.5" />
      ))}
      {/* Windows row 1 */}
      {[85, 125, 165].map(x => (
        <g key={x}>
          <rect x={x} y="72" width="22" height="28" fill="none" stroke="#8b1a2e" strokeWidth="1" />
          <line x1={x + 11} y1="72" x2={x + 11} y2="100" stroke="#8b1a2e" strokeWidth="0.6" opacity="0.6" />
        </g>
      ))}
      {/* Door */}
      <rect x="123" y="110" width="34" height="38" fill="none" stroke="#8b1a2e" strokeWidth="1.2" />
      <path d="M123 110 Q140 96 157 110" fill="none" stroke="#8b1a2e" strokeWidth="1" />
      {/* Door knob */}
      <circle cx="152" cy="130" r="2" fill="#8b1a2e" opacity="0.6" />
      {/* Steps */}
      <rect x="115" y="146" width="50" height="4" fill="none" stroke="#8b1a2e" strokeWidth="0.8" />
      <rect x="119" y="142" width="42" height="4" fill="none" stroke="#8b1a2e" strokeWidth="0.8" />
      {/* Side wings */}
      <rect x="20" y="80" width="50" height="68" fill="none" stroke="#8b1a2e" strokeWidth="1" opacity="0.7" />
      <rect x="210" y="80" width="50" height="68" fill="none" stroke="#8b1a2e" strokeWidth="1" opacity="0.7" />
      {/* Wing windows */}
      {[30, 50].map(x => (
        <rect key={x} x={x} y="92" width="16" height="20" fill="none" stroke="#8b1a2e" strokeWidth="0.8" opacity="0.6" />
      ))}
      {[220, 240].map(x => (
        <rect key={x} x={x} y="92" width="16" height="20" fill="none" stroke="#8b1a2e" strokeWidth="0.8" opacity="0.6" />
      ))}
      {/* Trees */}
      {[8, 260].map((x, i) => (
        <g key={i}>
          <line x1={x + 6} y1="148" x2={x + 6} y2="100" stroke="#8b1a2e" strokeWidth="1" opacity="0.5" />
          <ellipse cx={x + 6} cy="90" rx="12" ry="18" fill="none" stroke="#8b1a2e" strokeWidth="1" opacity="0.5" />
          <ellipse cx={x + 6} cy="80" rx="9" ry="14" fill="none" stroke="#8b1a2e" strokeWidth="0.8" opacity="0.4" />
        </g>
      ))}
      {/* Flowers/bushes */}
      {[28, 56, 200, 228].map((x, i) => (
        <g key={i}>
          <ellipse cx={x} cy={148} rx="8" ry="6" fill="none" stroke="#8b1a2e" strokeWidth="0.8" opacity="0.4" />
        </g>
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   SCHEDULE WAVY FRAME SVG
═══════════════════════════════════════════════ */
function WavyFrame({ children }) {
  return (
    <div className="schedule-frame-wrap">
      <svg className="schedule-svg-frame" viewBox="0 0 360 520" preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <path
          d={`
            M 20 20
            Q 30 10, 45 18
            Q 60 26, 70 14
            Q 85 2, 100 16
            Q 115 28, 130 12
            Q 145 0, 160 14
            Q 175 28, 190 12
            Q 205 0, 220 16
            Q 235 28, 250 14
            Q 265 2, 280 16
            Q 295 28, 310 14
            Q 325 2, 340 20
            L 340 500
            Q 330 510, 315 502
            Q 300 494, 285 508
            Q 270 518, 255 504
            Q 240 492, 225 508
            Q 210 520, 195 506
            Q 180 492, 165 508
            Q 150 520, 135 504
            Q 120 490, 105 506
            Q 90 518, 75 504
            Q 60 492, 45 508
            Q 30 520, 20 500
            Z
          `}
          fill="none"
          stroke="#8b1a2e"
          strokeWidth="2"
          opacity="0.85"
        />
        {/* Inner offset */}
        <path
          d={`
            M 30 32
            Q 40 22, 52 30
            Q 64 38, 73 27
            Q 85 16, 98 29
            Q 111 40, 124 28
            Q 137 16, 150 28
            Q 163 40, 176 27
            Q 189 16, 202 28
            Q 215 40, 228 27
            Q 241 16, 254 28
            Q 267 40, 280 27
            Q 293 16, 306 28
            Q 319 40, 330 32
            L 330 488
            Q 320 498, 308 491
            Q 296 484, 284 496
            Q 272 506, 260 494
            Q 248 484, 236 496
            Q 224 508, 212 496
            Q 200 484, 188 496
            Q 176 508, 164 494
            Q 152 482, 140 496
            Q 128 508, 116 494
            Q 104 482, 92 496
            Q 80 508, 68 494
            Q 56 482, 44 494
            Q 34 504, 30 488
            Z
          `}
          fill="none"
          stroke="#8b1a2e"
          strokeWidth="0.8"
          opacity="0.3"
        />
      </svg>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   BOW SVG
═══════════════════════════════════════════════ */
function BowSVG() {
  return (
    <svg viewBox="0 0 120 70" width="120" style={{ display: "block", margin: "0 auto -8px" }}>
      {/* Left loop */}
      <path d="M60 35 Q30 5 10 18 Q0 28 20 35 Q40 42 60 35Z"
        fill="none" stroke="#8b1a2e" strokeWidth="1.5" />
      {/* Right loop */}
      <path d="M60 35 Q90 5 110 18 Q120 28 100 35 Q80 42 60 35Z"
        fill="none" stroke="#8b1a2e" strokeWidth="1.5" />
      {/* Center knot */}
      <circle cx="60" cy="35" r="5" fill="none" stroke="#8b1a2e" strokeWidth="1.5" />
      <circle cx="60" cy="35" r="2.5" fill="#8b1a2e" opacity="0.7" />
      {/* Tails */}
      <path d="M57 40 Q50 56 42 62" stroke="#8b1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M63 40 Q70 56 78 62" stroke="#8b1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Tail ends (slight wave) */}
      <path d="M42 62 Q38 65 44 68" stroke="#8b1a2e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M78 62 Q82 65 76 68" stroke="#8b1a2e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Detail lines on loops */}
      <path d="M60 35 Q38 14 20 22" stroke="#8b1a2e" strokeWidth="0.6" fill="none" opacity="0.5" />
      <path d="M60 35 Q82 14 100 22" stroke="#8b1a2e" strokeWidth="0.6" fill="none" opacity="0.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════ */
function useCountdown(target) {
  const calc = () => {
    const d = new Date(target) - Date.now();
    if (d <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      minutes: Math.floor((d % 3600000) / 60000),
      seconds: Math.floor((d % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  const prev = useRef(t);
  const [flip, setFlip] = useState({});
  useEffect(() => {
    const id = setInterval(() => {
      const n = calc();
      const ch = {};
      Object.keys(n).forEach(k => { if (n[k] !== prev.current[k]) ch[k] = true; });
      prev.current = n; setT(n); setFlip(ch);
      setTimeout(() => setFlip({}), 280);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return { t, flip };
}

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}
function Reveal({ children, delay = "" }) {
  const ref = useReveal();
  return <div ref={ref} className={`reveal ${delay}`}>{children}</div>;
}

/* ═══════════════════════════════════════════════
   HERO CURTAIN TASSEL
═══════════════════════════════════════════════ */
function HeroTassel({ side }) {
  return (
    <div className="hero-tassel" style={{ [side === "left" ? "right" : "left"]: -4 }}>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%,#e8c880,#a07830)", margin: "0 auto" }} />
      <div style={{ width: 2.5, height: 32, background: "linear-gradient(180deg,#c9a96e,#a07830)", margin: "0 auto" }} />
      <div style={{ display: "flex", gap: 2 }}>
        {[22, 28, 26, 24, 28, 22, 26].map((h, i) => (
          <div key={i} style={{ width: 1.5, height: h, background: "linear-gradient(180deg,#c9a96e,transparent)", borderRadius: 1 }} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MUSIC FAB
═══════════════════════════════════════════════ */
function MusicFab({ muted, onToggle }) {
  return (
    <button className="music-fab" onClick={onToggle} title={muted ? "Play music" : "Mute"}>
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <div className="music-waves">
          {[1, 2, 3, 2, 1].map((h, i) => (
            <div key={i} className="wave-bar" style={{ height: h * 3 + 3, animationDelay: `${i * 0.1}s`, animationDuration: `${0.45 + i * 0.08}s` }} />
          ))}
        </div>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   RSVP FORM
═══════════════════════════════════════════════ */
function RSVPForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attend, setAttend] = useState("");
  const [done, setDone] = useState(false);
  if (done) return (
    <div className="rsvp-success">
      {attend === "yes" ? "We can't wait to celebrate with you! 🌹" : "You'll be dearly missed..."}
    </div>
  );
  return (
    <div className="rsvp-form">
      <input className="rsvp-input" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
      <input className="rsvp-input" type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
      <select className="rsvp-select" value={attend} onChange={e => setAttend(e.target.value)}>
        <option value="">Will you be attending?</option>
        <option value="yes">Joyfully accepts ✓</option>
        <option value="no">Regretfully declines</option>
      </select>
      <button className="rsvp-btn" onClick={() => { if (name && phone && attend) setDone(true); }}>
        Send RSVP
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════ */
export default function WeddingInvitation() {
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const audioRef = useRef(null);
  const { t: cd, flip } = useCountdown("2026-03-11T20:00:00");

  // Scratch state: track how many cards revealed
  const [scratchedCount, setScratchedCount] = useState(0);
  const [confettiDone, setConfettiDone] = useState(false);

  const handleScratched = useCallback(() => {
    setScratchedCount(c => {
      const next = c + 1;
      if (next === 3 && !confettiDone) {
        launchConfetti();
        setConfettiDone(true);
      }
      return next;
    });
  }, [confettiDone]);

  // Audio
  useEffect(() => {
    const audio = new Audio();
    audio.src = "https://cdn.pixabay.com/audio/2023/06/06/audio_ead1627dd2.mp3";
    audio.loop = true; audio.volume = 0.3; audio.preload = "auto";
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  const startMusic = useCallback(() => {
    audioRef.current?.play().then(() => setMuted(false)).catch(() => {});
  }, []);

  const toggleMute = useCallback(() => {
    const a = audioRef.current; if (!a) return;
    if (muted) { a.play().catch(() => {}); setMuted(false); }
    else { a.pause(); setMuted(true); }
  }, [muted]);

  const handleCurtainOpen = useCallback(() => {
    setCurtainOpen(true);
    startMusic();
  }, [startMusic]);

  const events = [
    { time: "4:00 PM", name: "Guests Arrive", desc: "Welcome drinks & canapés in the garden" },
    { time: "5:00 PM", name: "Ceremony", desc: "Join us in the Grand Ballroom" },
    { time: "6:00 PM", name: "Cocktail Hour", desc: "Champagne reception on the terrace" },
    { time: "7:30 PM", name: "Dinner", desc: "Seated banquet & speeches" },
    { time: "10:00 PM", name: "Dancing", desc: "Celebrate with us until midnight" },
  ];

  return (
    <div>
      <style>{CSS}</style>

      {/* CURTAIN */}
      <Curtain onOpen={handleCurtainOpen} />

      {/* MUSIC FAB */}
      {curtainOpen && <MusicFab muted={muted} onToggle={toggleMute} />}

      {/* PAGE */}
      <div className="page">

        {/* ── HERO ── */}
        <section className="hero">
          {/* Side curtains */}
          <div className="hero-curtain-left">
            <div className="curtain-stripes">
              {Array.from({ length: 6 }, (_, i) => <div key={i} className="curtain-stripe" />)}
            </div>
            <HeroTassel side="left" />
          </div>
          <div className="hero-curtain-right">
            <div className="curtain-stripes">
              {Array.from({ length: 6 }, (_, i) => <div key={i} className="curtain-stripe" />)}
            </div>
            <HeroTassel side="right" />
          </div>

          {/* Top valance */}
          <div className="hero-valance" />

          <div className="hero-content">
            <div className="hero-eyebrow">Together with their families</div>
            <div className="hero-names">
              Kawalpreet
              <span className="hero-amp">&</span>
              Avneesh
            </div>
            <div className="hero-divider">
              <div className="hero-divider-line" />
              <div className="hero-divider-diamond" />
              <div className="hero-divider-line" />
            </div>
            <div className="hero-body">
              We would like to invite you to celebrate<br />
              the marriage of Kawalpreet &amp; Avneesh.<br />
              It would be an honour to have<br />
              you join us for this joyous occasion.
            </div>
            <div className="hero-date">
              Wednesday · 10th Jun 2026
            </div>
          </div>
        </section>

        {/* ── SCRATCH REVEAL ── */}
        <section className="scratch-section">
          <Reveal>
            <span className="section-label">Interactive</span>
            <div className="section-title">Reveal</div>
            <span className="scratch-subtitle">Scratch to discover the date</span>
          </Reveal>

          <Reveal delay="d1">
            <div className="scratch-cards-row">
              <ScratchCard value="11" label="Day" onScratched={handleScratched} />
              <ScratchCard value="March" label="Month" onScratched={handleScratched} />
              <ScratchCard value="2026" label="Year" onScratched={handleScratched} />
            </div>

            {scratchedCount === 3 && (
              <div className="scratch-revealed-msg">
                <span>Save the date! 🎉</span>
              </div>
            )}
          </Reveal>
        </section>

        {/* ── COUNTDOWN ── */}
        <section className="countdown-section">
          <Reveal>
            <span className="section-label">Until we say I do</span>
            <div className="section-title">Countdown</div>
          </Reveal>
          <Reveal delay="d1">
            <div className="cd-boxes">
              {[
                { v: cd.days, l: "Days", k: "days" },
                { v: cd.hours, l: "Hours", k: "hours" },
                { v: cd.minutes, l: "Mins", k: "minutes" },
                { v: cd.seconds, l: "Secs", k: "seconds" },
              ].map(({ v, l, k }) => (
                <div key={l} className="cd-box">
                  <span key={v} className={`cd-num${flip[k] ? " flip" : ""}`}>
                    {String(v).padStart(2, "0")}
                  </span>
                  <span className="cd-lbl">{l}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ── VENUE ── */}
        <section className="venue-section">
          <Reveal>
            <div className="venue-label">The celebration will take place at</div>
          </Reveal>
          <Reveal delay="d1">
            <div className="venue-illustration">
              <VenueIllustration size={280} />
            </div>
            <div className="venue-name">Krishna Resort</div>
            <div className="venue-address">
              Awankha, Dinanagar<br />
              Punjab, India
            </div>
            <a
              className="venue-map-btn"
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              View on Maps
            </a>
          </Reveal>
        </section>

        {/* ── SCHEDULE ── */}
        <section className="schedule-section">
          <Reveal>
            <span className="section-label" style={{ textAlign: "center", display: "block", marginBottom: 28 }}>
              Order of the day
            </span>
          </Reveal>
          <WavyFrame>
            <div className="schedule-inner">
              <div className="schedule-bow">
                <BowSVG />
              </div>
              <div className="schedule-title">Schedule</div>
              <div className="schedule-events" style={{ marginTop: 20 }}>
                {events.map((ev, i) => (
                  <Reveal key={i} delay={i % 2 === 0 ? "d1" : "d2"}>
                    <div className="schedule-event">
                      <div className="ev-time">{ev.time}</div>
                      <div className="ev-detail">
                        <div className="ev-name">{ev.name}</div>
                        <div className="ev-desc">{ev.desc}</div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div className="schedule-venue-art" style={{ marginTop: 24 }}>
                <VenueIllustration size={160} />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.82rem", color: "var(--muted)", marginTop: 8 }}>
                  Krishna Resort, Punjab
                </div>
              </div>
            </div>
          </WavyFrame>
        </section>

        {/* ── DRESS CODE ── */}
        <section className="dresscode-section">
          <Reveal>
            <span className="section-label">Please wear</span>
            <div className="dresscode-title">Dress Code</div>
            <div className="dresscode-body">
              We kindly request that our guests dress in<br />
              <em>formal attire</em> in keeping with the elegance<br />
              of the occasion. We suggest tones of<br />
              ivory, blush, champagne & deep jewel hues.
            </div>
            <div className="color-swatches">
              {["#f5f0e8", "#e8d5c4", "#d4a898", "#c9a96e", "#8b1a2e", "#2c1810"].map((c, i) => (
                <div key={i} className="swatch" style={{ background: c, border: c === "#f5f0e8" ? "1px solid #ddd" : "none" }} />
              ))}
            </div>
          </Reveal>
        </section>

        {/* ── GIFTS ── */}
        <section className="gifts-section">
          <Reveal>
            <div className="gifts-icon">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="#8b1a2e" strokeWidth="1.4">
                <rect x="4" y="18" width="36" height="22" rx="1" />
                <rect x="4" y="12" width="36" height="6" rx="1" />
                <line x1="22" y1="12" x2="22" y2="40" />
                <path d="M22 12 C22 12 14 8 14 4 C14 1 17 0 19 2 C21 4 22 8 22 12Z" />
                <path d="M22 12 C22 12 30 8 30 4 C30 1 27 0 25 2 C23 4 22 8 22 12Z" />
              </svg>
            </div>
            <div className="gifts-title">Gifts</div>
            <div className="gifts-body">
              Your presence is the greatest gift we could receive.<br />
              However, if you would like to mark the occasion,<br />
              we would be grateful for a contribution to our<br />
              honeymoon fund.
            </div>
            <div className="gifts-love">With all our love</div>
            <div className="gifts-registry">
              <span className="registry-label">Gift Registry Details</span>
              <div className="registry-item">
                Account Name: Avneesh &amp; Kawalpreet Muchal
              </div>
              <div className="registry-item" style={{ marginTop: 6 }}>
                IFSC: HDFC0001234 · A/C: 5041 2222 8899
              </div>
              <div className="registry-item" style={{ marginTop: 6 }}>
                UPI: kawalpreet.avneesh@hdfc
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── TRANSPORT ── */}
        <section className="transport-section">
          <Reveal>
            <span className="transport-eyebrow">How to get there</span>
            <div className="transport-title">Transport</div>
            <div className="transport-divider" />
            <div className="transport-info">
              <strong>By Car</strong><br />
              Krishna Resort is located off NH44, Awankha, Dinanagar.<br />
              Ample free parking is available on site.
            </div>
            <div className="transport-divider" style={{ marginTop: 24 }} />
            <div className="transport-info">
              <strong>From Pathankot Railway Station</strong><br />
              Approx. 18 km · 25 mins by taxi or auto.<br />
              Pre-booked cabs available — contact us for details.
            </div>
            <div className="transport-divider" style={{ marginTop: 24 }} />
            <div className="transport-info">
              <strong>Shuttle Service</strong><br />
              A complimentary shuttle will run from<br />
              Hotel Sai Palace, Dinanagar at 7:30 PM.
            </div>
          </Reveal>
        </section>

        {/* ── RSVP ── */}
        <section className="rsvp-section">
          <Reveal>
            <span className="rsvp-eyebrow">Kindly reply by 1st September 2025</span>
            <div className="rsvp-title">RSVP</div>
            <div className="rsvp-body">
              We eagerly await your confirmation<br />
              so we can celebrate together.
            </div>
            <RSVPForm />
          </Reveal>
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="footer-names">Kawalpreet &amp; Avneesh</div>
          <div className="footer-date">10· 06 · 2026 &nbsp;·&nbsp; Punjab, India</div>
          <div className="footer-ornament">
            <div className="footer-line" />
            <div className="footer-gem" />
            <div className="footer-line" />
          </div>
        </footer>

      </div>
    </div>
  );
}