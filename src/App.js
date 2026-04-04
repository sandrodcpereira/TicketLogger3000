import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #2552e4; }

  :root {
    --blue: #2552e4;
    --blue-dark: #1a3bb0;
    --blue-navy: #1a2e5e;
    --cream: #f5e8d8;
    --white: #ffffff;
    --dark: #1a1a2e;
    --gray: #888;
    --gray-light: #f0ede8;
    --teal: #7fd8ca;
    --font-display: 'Playfair Display', serif;
    --font-body: 'DM Sans', sans-serif;
    --bottom-nav-h: 80px;
    --safe-bottom: env(safe-area-inset-bottom, 0px);
  }

  body { font-family: var(--font-body); overflow: hidden; }

  .app-shell {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    max-width: 430px;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    background: var(--blue);
  }

  .screen {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 128px;
  }

  /* Bottom Nav */
  .bottom-nav {
    position: absolute;
    bottom: 24px;
    left: 24px;
    right: 24px;
    display: flex;
    align-items: stretch;
    
    
    z-index: 100;
    gap: 4px;
  }
  .nav-group {
    padding: 8px;
    display: flex;
    width: 100%;
    background: var(--white);
    border-radius: 48px;
    box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.06);
  }

  .nav-pill {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 0;
    border-radius: 40px;
    cursor: pointer;
    transition: background 0.15s;
    font-size: 11px;
    font-family: var(--font-body);
    font-weight: 500;
    color: #999;
    border: none;
    background: transparent;
  }
  .nav-pill.active { color: var(--blue); background: rgba(37,82,228,0.08); }
  .nav-pill svg { width: 22px; height: 22px; }

  .nav-add-btn {
    width: 72px; 
    height: 72px;
    border-radius: 50%;
    background: var(--white);
    border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    align-self: center;
    transition: transform 0.15s, background 0.15s;
    margin: 0 4px;
    box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.06);
  }
  .nav-add-btn:active { transform: scale(0.93); }
  .nav-add-btn svg { width: 24px; height: 24px; color: rgba(37,82,228,0.08); }

  /* Header */
  .home-header {
    display: flex; align-items: center;
    padding: 16px 16px 12px;
    gap: 12px;
  }
  .app-logo { display: flex; align-items: center; gap: 12px; flex: 1; }
  .app-logo-icon {
    width: 42px; 
    height: 38px; 
    color: white;
    background-image: url('/TicketLogger3000/assets/logo.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center 5px;
  }
  .app-logo-text { font-size: 18px; font-weight: 600; color: white; font-family: var(--font-body); }
  .avatar-btn {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--teal);
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-weight: 600; font-size: 14px; color: var(--dark);
    font-family: var(--font-body);
  }

  /* Section labels */
  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 16px 8px;
  }
  .section-title { font-size: 15px; font-weight: 600; color: white; font-family: var(--font-body); }
  .section-badge {
    background: var(--blue-dark); color: white;
    font-size: 12px; font-weight: 600;
    padding: 2px 8px; border-radius: 20px;
  }

  /* Cream card container */
  .cream-card {
    margin: 0 16px;
    background: var(--cream);
    border-radius: 20px;
    padding: 8px 16px;
    overflow: hidden;
  }

  /* Empty state */
  .empty-state {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 12px;
    min-height: 180px; padding: 32px 16px;
    color: #aaa;
    font-size: 14px;
    font-family: var(--font-body);
    text-align: center;
  }
  .empty-icon { font-size: 32px; opacity: 0.4; }

  /* Favourites board */
  .fav-board {
    margin: 0 16px;
    background: var(--blue-navy);
    border-radius: 20px;
    padding: 16px;
    min-height: 160px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    align-content: start;
  }
  .fav-board-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 8px;
    min-height: 140px; grid-column: 1/-1;
    color: rgba(255,255,255,0.5);
    font-size: 13px;
    font-family: var(--font-body);
    text-align: center;
  }

  /* Concert list item */
  .concert-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 0;
    border-bottom: 0.5px solid rgba(0,0,0,0.08);
    cursor: pointer;
  }
  .concert-item:last-child { border-bottom: none; }
  .concert-thumb {
    width: 52px; height: 52px; border-radius: 0;
    flex-shrink: 0; overflow: hidden;
  }
  .concert-info { flex: 1; min-width: 0; }
  .concert-band { font-size: 14px; font-weight: 600; color: var(--dark); font-family: var(--font-body); }
  .concert-meta { font-size: 12px; color: #888; font-family: var(--font-body); margin-top: 2px; }

  /* Bottom sheet */
  .sheet-overlay {
    position: absolute; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.5);
    display: flex; flex-direction: column; justify-content: flex-end;
  }
  .sheet-panel {
    background: var(--cream);
    border-radius: 24px 24px 0 0;
    max-height: 93dvh;
    display: flex; flex-direction: column;
    overflow: hidden;
  }
  .sheet-drag-bar {
    width: 40px; height: 4px; border-radius: 2px;
    background: rgba(0,0,0,0.15);
    margin: 10px auto 0;
    flex-shrink: 0;
  }
  .sheet-header {
    display: flex; align-items: center; justify-content: flex-end;
    padding: 8px 12px 0;
    flex-shrink: 0;
  }
  .sheet-close {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(0,0,0,0.12); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--dark);
  }
  .sheet-scroll {
    overflow-y: auto; overflow-x: hidden;
    flex: 1; padding: 0 16px 24px;
    -webkit-overflow-scrolling: touch;
  }

  /* Ticket preview area */
  .ticket-preview-area {
    background: var(--blue);
    padding: 24px 16px 32px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
    min-height: 260px;
    flex-shrink: 0;
  }

  /* Form elements */
  .form-group { margin-bottom: 16px; }
  .form-label {
    display: block; font-size: 13px; font-weight: 500;
    color: var(--dark); margin-bottom: 6px;
    font-family: var(--font-body);
  }
  .form-input {
    width: 100%; padding: 12px 14px;
    border: none; border-radius: 12px;
    background: white; font-size: 15px;
    font-family: var(--font-body);
    color: var(--dark);
    outline: none;
    -webkit-appearance: none;
  }
  .form-input::placeholder { color: #bbb; }
  .form-input:focus { box-shadow: 0 0 0 2px rgba(37,82,228,0.3); }

  /* Favourite toggle */
  .fav-toggle {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px;
    border-radius: 14px;
    cursor: pointer;
    border: none;
    width: 100%;
    text-align: left;
    transition: background 0.2s;
  }
  .fav-toggle.off { background: var(--dark); }
  .fav-toggle.on  { background: linear-gradient(135deg, #a8edea, #fed6e3, #d4b8f0); }
  .fav-toggle.disabled { background: #888; cursor: not-allowed; }
  .fav-toggle-icon { width: 28px; height: 28px; flex-shrink: 0; }
  .fav-toggle-title { font-size: 14px; font-weight: 600; color: white; font-family: var(--font-body); }
  .fav-toggle.on .fav-toggle-title { color: var(--dark); }
  .fav-toggle-sub { font-size: 12px; color: rgba(255,255,255,0.7); font-family: var(--font-body); }
  .fav-toggle.on .fav-toggle-sub { color: rgba(0,0,0,0.6); }

  /* Save button */
  .save-btn {
    width: 100%; padding: 16px;
    background: var(--blue-navy); color: white;
    border: none; border-radius: 100px;
    font-size: 16px; font-weight: 600;
    font-family: var(--font-body);
    cursor: pointer;
    margin-top: 8px;
    transition: transform 0.1s, background 0.1s;
  }
  .save-btn:active { transform: scale(0.98); }

  /* Stats screen */
  .stats-screen { background: var(--blue); padding: 24px 16px 128px 16px; }
  .stats-title { font-size: 24px; font-weight: 700; color: white; font-family: var(--font-body); margin-bottom: 20px; }
  .stats-section-title { font-size: 15px; font-weight: 600; color: white; margin-bottom: 10px; font-family: var(--font-body); }
  .stats-card {
    background: var(--blue-navy); border-radius: 16px;
    padding: 16px; margin-bottom: 20px;
    min-height: 100px;
  }
  .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .bar-label { font-size: 12px; color: rgba(255,255,255,0.8); width: 80px; text-align: right; flex-shrink: 0; font-family: var(--font-body); line-height: 1.2; }
  .bar-track { flex: 1; height: 28px; background: rgba(255,255,255,0.08); border-radius: 8px; overflow: hidden; }
  .bar-fill { height: 100%; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; }
  .bar-count { font-size: 13px; font-weight: 600; color: var(--blue-navy); font-family: var(--font-body); }
  .stats-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100px; gap: 8px; color: rgba(255,255,255,0.4); font-size: 13px; font-family: var(--font-body); }

  /* Settings sheet */
  .settings-avatar {
    width: 80px; height: 80px; border-radius: 50%;
    background: var(--teal);
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; font-weight: 700; color: var(--dark);
    margin: 8px auto 20px;
    font-family: var(--font-body);
  }
  .settings-name-label { font-size: 13px; font-weight: 500; color: #999; margin-bottom: 4px; display: flex; gap: 4px; font-family: var(--font-body); }
  .settings-name-label span { color: #e55; }
  .settings-btn-row { display: flex; gap: 10px; margin: 16px 0; }
  .settings-action-btn {
    flex: 1; padding: 12px;
    background: #e5e0d8; border: none; border-radius: 100px;
    font-size: 14px; font-weight: 600;
    font-family: var(--font-body);
    cursor: pointer; color: var(--dark);
  }
  .settings-meta { text-align: center; font-size: 12px; color: #aaa; margin: 8px 0; font-family: var(--font-body); }
  .settings-danger { display: block; width: 100%; text-align: center; font-size: 13px; color: #e55; text-decoration: underline; background: none; border: none; cursor: pointer; padding: 8px; font-family: var(--font-body); }

  /* View ticket screen */
  .view-ticket-bg {
    background: var(--blue);
    min-height: 100%;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center;
    padding: 40px 24px;
    gap: 32px;
  }
  .view-actions {
    display: flex; gap: 12px;
  }
  .view-action-btn {
    padding: 12px 24px;
    border-radius: 100px;
    border: 1.5px solid rgba(255,255,255,0.4);
    background: transparent;
    color: white; font-size: 14px; font-weight: 500;
    cursor: pointer; font-family: var(--font-body);
    transition: background 0.15s;
  }
  .view-action-btn:hover { background: rgba(255,255,255,0.1); }

  /* Ticket SVG component */
  .ticket-svg-wrap { filter: drop-shadow(0 8px 24px rgba(0,0,0,0.3)); }

  /* Three.js canvas */
  .three-canvas { border-radius: 12px; overflow: hidden; touch-action: none; cursor: grab; }
  .three-canvas:active { cursor: grabbing; }

  /* Small ticket thumbnail */
  .ticket-thumb-svg { width: 52px; height: 52px; }

  /* Fav ticket on board */
  .fav-ticket-wrap { cursor: pointer; }

  /* Animations */
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  .sheet-panel { animation: slideUp 0.28s cubic-bezier(0.22,1,0.36,1); }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .sheet-overlay { animation: fadeIn 0.2s ease; }

  /* Menu sheet */
  .menu-item {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 0; cursor: pointer;
    border-bottom: 0.5px solid rgba(0,0,0,0.08);
    font-size: 15px; color: var(--dark); font-family: var(--font-body);
  }
  .menu-item:last-child { border-bottom: none; }
  .menu-item.danger { color: #e55; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 0; }

  /* Prevent pinch-to-zoom — app-shell handles all touch itself */
  .app-shell { touch-action: pan-y; }

  /* custom rotate to favourite board */
  .fav-board > .fav-ticket-wrap:first-child {transform: rotate(2deg) scale(0.94);}
  .fav-board > .fav-ticket-wrap:nth-child(2) {transform: rotate(-3deg) scale(0.94);}
  .fav-board > .fav-ticket-wrap:nth-child(3) {transform: rotate(-3deg) scale(0.94);}
  .fav-board > .fav-ticket-wrap:nth-child(4) {transform: rotate(-1deg) scale(0.94);}


`;

/* ─────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────── */
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function formatDate(d) {
  if (!d) return "";
  const parts = d.split("-");
  if (parts.length < 3) return d;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(parts[2])} ${months[parseInt(parts[1])-1]} ${parts[0]}`;
}
function formatDateUpper(d) { return formatDate(d).toUpperCase(); }

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const set = useCallback((v) => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);
  return [val, set];
}

/* ─────────────────────────────────────────────
   SVG TICKET COMPONENT
───────────────────────────────────────────── */
function TicketSVG({ band, venue, date, isFav, size = 280, style = {} }) {
  const W = size, H = size;
  const px = size / 280;
  const displayVenue = venue ? (venue.length > 26 ? venue.slice(0,24)+"…" : venue) : "WHERE DID YOU SEE THEM?";
  const displayDate = date ? formatDateUpper(date) : "WHEN DID YOU SEE THEM?";
  const displayBand = band || "Who did\nyou see?";
  const isEmpty = !band && !venue && !date;

  // Font size for band name
  let bandFontSize = 42 * px;
  if (band && band.length > 16) bandFontSize = 30 * px;
  if (band && band.length > 24) bandFontSize = 22 * px;

  const holoGradId = `holo-${size}`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={style} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {isFav && (
          <linearGradient id={holoGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#a8edea" stopOpacity="0.85"/>
            <stop offset="33%"  stopColor="#fed6e3" stopOpacity="0.85"/>
            <stop offset="66%"  stopColor="#d4b8f0" stopOpacity="0.85"/>
            <stop offset="100%" stopColor="#a8f0d0" stopOpacity="0.85"/>
          </linearGradient>
        )}
      </defs>
      {/* Card */}
      <rect x="0" y="0" width={W} height={H} rx={18*px} ry={18*px}
        fill={isFav ? `url(#${holoGradId})` : "white"} />
      {/* Venue top-left */}
      <text x={20*px} y={32*px} fontSize={10*px} fontWeight="600"
        fill={isEmpty ? "#ccc" : "#333"} fontFamily="DM Sans, sans-serif"
        letterSpacing="0.5">
        {displayVenue.toUpperCase()}
      </text>
      {/* Icon top-right */}
      <g transform={`translate(${W-36*px},${18*px}) scale(${0.7*px})`}>
        <rect x="0" y="4" width="28" height="20" rx="3" fill="none" stroke={isEmpty ? "#ccc" : "#333"} strokeWidth="1.5"/>
        <polygon points="14,4 14,0 10,4" fill={isEmpty ? "#ccc" : "#333"}/>
        <polygon points="14,24 14,28 18,24" fill={isEmpty ? "#ccc" : "#333"}/>
      </g>
      {/* Band name — wrapped text */}
      <BandText text={displayBand} isEmpty={isEmpty} W={W} px={px} fontSize={bandFontSize}/>
      {/* Date pill */}
      <rect x={20*px} y={H*0.6} width={W-40*px} height={28*px} rx={14*px}
        fill="none" stroke={isEmpty ? "#ccc" : "#333"} strokeWidth={1.2*px}/>
      <text x={W/2} y={H*0.6+18*px} fontSize={10*px} fontWeight="600"
        fill={isEmpty ? "#ccc" : "#333"} fontFamily="DM Sans, sans-serif"
        textAnchor="middle" letterSpacing="1">
        {displayDate}
      </text>
      {/* Dashed separator */}
      <line x1={16*px} y1={H*0.73} x2={W-16*px} y2={H*0.73}
        stroke={isEmpty ? "#ddd" : "#ccc"} strokeWidth={1*px} strokeDasharray={`4 3`}/>
      {/* Barcode */}
      <BarcodeLines W={W} H={H} px={px} isEmpty={isEmpty}/>
    </svg>
  );
}

function BandText({ text, isEmpty, W, px, fontSize }) {
  const lines = text.includes("\n") ? text.split("\n") : wrapText(text, Math.floor(W / (fontSize * 0.55)));
  const lineH = fontSize * 1.15;
  const totalH = lines.length * lineH;
  const startY = (W * 0.18) + (W * 0.38 - totalH) / 2 + fontSize;
  return (
    <>
      {lines.map((line, i) => (
        <text key={i} x={20*px} y={startY + i * lineH}
          fontSize={fontSize} fontWeight="900"
          fill={isEmpty ? "#ccc" : "#222"}
          fontFamily="Playfair Display, serif">
          {line}
        </text>
      ))}
    </>
  );
}
function wrapText(text, charsPerLine) {
  if (!text) return [""];
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > charsPerLine && cur) {
      lines.push(cur.trim());
      cur = w;
    } else { cur = (cur + " " + w).trim(); }
  }
  if (cur) lines.push(cur.trim());
  return lines.length ? lines : [text];
}

function BarcodeLines({ W, H, px, isEmpty }) {
  const x0 = 18*px, x1 = W-18*px, y0 = H*0.76, bH = H*0.16;
  const totalW = x1 - x0;
  const bars = [];
  let x = x0;
  let i = 0;
  const seed = 12345;
  while (x < x1) {
    const w = ((seed * (i+1) * 137) % 3) * px + px;
    const gap = (((seed * (i+2) * 91) % 3)) * px + px;
    if (x + w <= x1) {
      bars.push(<rect key={i} x={x} y={y0} width={w} height={bH}
        fill={isEmpty ? "#ddd" : "#222"} rx={0.3*px}/>);
    }
    x += w + gap;
    i++;
  }
  return <>{bars}</>;
}

/* ─────────────────────────────────────────────
   THREE.JS TICKET
───────────────────────────────────────────── */

/* Draw the ticket front face directly onto a Canvas2D context.
   No SVG intermediary — avoids all blob-URL / cross-origin / async issues. */
function drawTicketFront(canvas, { band, venue, date, isFav }) {
  const W = 512, H = 512;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H);

  // ── Background ────────────────────────────────────────────────────────────
  const r = 0; // corner radius
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(W-r, 0);
  ctx.quadraticCurveTo(W, 0, W, r);
  ctx.lineTo(W, H-r); ctx.quadraticCurveTo(W, H, W-r, H);
  ctx.lineTo(r, H);   ctx.quadraticCurveTo(0, H, 0, H-r);
  ctx.lineTo(0, r);   ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();

  if (isFav) {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,    "#a8edea");
    grad.addColorStop(0.33, "#fed6e3");
    grad.addColorStop(0.66, "#d4b8f0");
    grad.addColorStop(1,    "#a8f0d0");
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = "#ffffff";
  }
  ctx.fill();

  const isEmpty = !band && !venue && !date;
  const textCol = isEmpty ? "#cccccc" : "#222222";
  const mutedCol = isEmpty ? "#cccccc" : "#444444";

  // ── Venue (top-left, uppercase, small caps style) ─────────────────────────
  const displayVenue = venue
    ? (venue.length > 28 ? venue.slice(0, 26) + "…" : venue).toUpperCase()
    : "WHERE DID YOU SEE THEM?";
  ctx.font = "600 22px 'DM Sans', Arial, sans-serif";
  ctx.fillStyle = mutedCol;
  ctx.letterSpacing = "1px";
  ctx.fillText(displayVenue, 44, 76);
  ctx.letterSpacing = "0px";

  // ── Ticket icon (top-right) ───────────────────────────────────────────────
  const ix = W - 72, iy = 52;
  ctx.strokeStyle = mutedCol;
  ctx.lineWidth = 3;
  ctx.strokeRect(ix, iy, 36, 26);
  // notches
  ctx.fillStyle = mutedCol;
  ctx.beginPath(); ctx.arc(ix, iy+13, 5, -Math.PI/2, Math.PI/2, true); ctx.fill();
  ctx.beginPath(); ctx.arc(ix+36, iy+13, 5, Math.PI/2, -Math.PI/2, true); ctx.fill();

  // ── Band name ─────────────────────────────────────────────────────────────
  const displayBand = band || "Who did\nyou see?";
  let fontSize = 76;
  if (band && band.length > 14) fontSize = 58;
  if (band && band.length > 20) fontSize = 44;
  if (band && band.length > 28) fontSize = 34;

  ctx.fillStyle = textCol;
  ctx.font = `900 ${fontSize}px Georgia, 'Times New Roman', serif`;

  // Word-wrap the band name
  const maxW = W - 88;
  const words = displayBand.split(/\s+/);
  const lines = [];
  let current = "";
  for (const w of words) {
    const test = current ? current + " " + w : w;
    if (ctx.measureText(test).width > maxW && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  const lineH = fontSize * 1.18;
  const blockH = lines.length * lineH;
  const bandAreaTop = H * 0.15;
  const bandAreaH   = H * 0.40;
  let startY = bandAreaTop + (bandAreaH - blockH) / 2 + fontSize * 0.85;

  lines.forEach((line, i) => {
    ctx.fillText(line, 44, startY + i * lineH);
  });

  // ── Date pill ─────────────────────────────────────────────────────────────
  const displayDate = date
    ? (() => {
        const parts = date.split("-");
        if (parts.length < 3) return date.toUpperCase();
        const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
        return `${parseInt(parts[2])} ${months[parseInt(parts[1])-1]} ${parts[0]}`;
      })()
    : "WHEN DID YOU SEE THEM?";

  const pillY = H * 0.60;
  const pillH = 52;
  const pillX = 44;
  const pillW = W - 88;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
  ctx.strokeStyle = isEmpty ? "#cccccc" : "#333333";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = "600 22px 'DM Sans', Arial, sans-serif";
  ctx.fillStyle = isEmpty ? "#cccccc" : "#333333";
  ctx.textAlign = "center";
  ctx.letterSpacing = "3px";
  ctx.fillText(displayDate, W / 2, pillY + 33);
  ctx.letterSpacing = "0px";
  ctx.textAlign = "left";

  // ── Dashed separator ──────────────────────────────────────────────────────
  const sepY = H * 0.75;
  ctx.setLineDash([10, 7]);
  ctx.strokeStyle = isEmpty ? "#dddddd" : "#cccccc";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(44, sepY); ctx.lineTo(W - 44, sepY);
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Barcode ───────────────────────────────────────────────────────────────
  const bx0 = 44, bxMax = W - 44;
  const by0 = H * 0.78, bHgt = H * 0.14;
  ctx.fillStyle = isEmpty ? "#dddddd" : "#222222";
  let bx = bx0;
  for (let i = 0; bx < bxMax; i++) {
    const bw  = ((12345 * (i+1) * 137) % 3) + 1.5;
    const gap = ((12345 * (i+2) * 91)  % 3) + 1.5;
    if (bx + bw <= bxMax) ctx.fillRect(bx, by0, bw, bHgt);
    bx += bw + gap;
  }
}

function drawTicketBack(canvas) {
  const W = 512, H = 512;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H);

  // Rounded rect background
  const r = 0;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(W-r, 0);
  ctx.quadraticCurveTo(W, 0, W, r); ctx.lineTo(W, H-r);
  ctx.quadraticCurveTo(W, H, W-r, H); ctx.lineTo(r, H);
  ctx.quadraticCurveTo(0, H, 0, H-r); ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0); ctx.closePath();
  ctx.fillStyle = "#7E7E7E";
  ctx.fill();
  ctx.clip(); // clip all subsequent drawing to the rounded rect

  // Dot grid
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    ctx.beginPath();
    ctx.arc(32 + i*64, 32 + j*64, 3, 0, Math.PI*2);
    ctx.fill();
  }

  // Diamond
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.moveTo(W/2, H/2 - 22); ctx.lineTo(W/2 + 18, H/2);
  ctx.lineTo(W/2, H/2 + 22); ctx.lineTo(W/2 - 18, H/2);
  ctx.closePath(); ctx.fill();

  // Watermark text
  ctx.font = "600 20px 'DM Sans', Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.fillText("I Was There", W/2, H - 70);
  ctx.letterSpacing = "0px";
  ctx.textAlign = "left";
}

function ThreeTicket({ band, venue, date, isFav, width = 240, height = 240 }) {
  const mountRef  = useRef(null);
  const threeRef  = useRef(null);
  // Keep latest prop values accessible inside the stable animation closure
  const propsRef  = useRef({ band, venue, date, isFav });
  useEffect(() => { propsRef.current = { band, venue, date, isFav }; }, [band, venue, date, isFav]);

  // ── Mount once ────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);



    // Draw canvases synchronously
    const frontCanvas = document.createElement("canvas");
    frontCanvas.width = frontCanvas.height = 512;
    const backCanvas  = document.createElement("canvas");
    backCanvas.width  = backCanvas.height  = 512;
    drawTicketFront(frontCanvas, propsRef.current);
    drawTicketBack(backCanvas);

    const frontTex = new THREE.CanvasTexture(frontCanvas);
    const backTex  = new THREE.CanvasTexture(backCanvas);

    // Subdivided BoxGeometry so we have enough vertices to deform into a curve.
    // Segments: 30 wide × 30 tall gives smooth curvature; depth stays 1 segment.
    const W2 = 1.8, H2 = 1.8, D = 0.005;
    const SEG = 30;
    const geo = new THREE.BoxGeometry(W2, H2, D, SEG, SEG, 1);

    // ── Vertex deformation: gentle horizontal paper curl ──────────────────────
    // For every vertex we apply: Δz = curl × (1 − (x / halfW)²)
    // This bows the centre of the card toward the viewer while the edges stay flat.
    // We also apply a tiny vertical curl for a more organic feel.
    const CURL_Z = 0.1;  // max forward bow (tune: 0.0 = flat, 0.15 = noticeable)
    const CURL_Y = 0.05;  // subtle vertical bow
    const pos = geo.attributes.position;
    const halfW2 = W2 / 2;
    const halfH2 = H2 / 2;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const nx = x / halfW2;   // normalised −1..1
      const ny = y / halfH2;
      const bow = CURL_Z * (1 - nx * nx) + CURL_Y * (1 - ny * ny);
      pos.setZ(i, pos.getZ(i) + bow);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xe8e8e8 });
    const mats = [
      edgeMat,                                                    // right edge
      edgeMat,                                                    // left edge
      edgeMat,                                                    // top edge
      edgeMat,                                                    // bottom edge
      (() => {
        // Holographic ShaderMaterial for favourited tickets.
        // Middle-ground intensity: Fresnel-keyed rainbow that stays translucent
        // enough to keep the ticket text readable at all angles.
        const holoVert = `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewPos;
          void main() {
            vUv = uv;
            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            vViewPos   = mvPos.xyz;
            vNormal    = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mvPos;
          }
        `;
        const holoFrag = `
          uniform sampler2D uMap;
          uniform float     uTime;
          varying vec2  vUv;
          varying vec3  vNormal;
          varying vec3  vViewPos;

          vec3 hsl2rgb(float h, float s, float l) {
            float c = (1.0 - abs(2.0*l - 1.0)) * s;
            float x = c * (1.0 - abs(mod(h*6.0, 2.0) - 1.0));
            float m = l - c*0.5;
            vec3 rgb;
            if      (h < 1.0/6.0) rgb = vec3(c,x,0.0);
            else if (h < 2.0/6.0) rgb = vec3(x,c,0.0);
            else if (h < 3.0/6.0) rgb = vec3(0.0,c,x);
            else if (h < 4.0/6.0) rgb = vec3(0.0,x,c);
            else if (h < 5.0/6.0) rgb = vec3(x,0.0,c);
            else                   rgb = vec3(c,0.0,x);
            return rgb + m;
          }

          void main() {
            vec4  base    = texture2D(uMap, vUv);
            vec3  viewDir = normalize(-vViewPos);
            float cosA    = max(dot(vNormal, viewDir), 0.0);
            float fresnel = 1.0 - cosA;

            // Hue varies with viewing angle, UV position, and slow time drift.
            // Multipliers keep bands wide enough to read as colour, not noise.
            float hue     = mod(fresnel * 1.5 + vUv.x * 0.7 + vUv.y * 1.5 + uTime * 0.15, 1.0);
            vec3  rainbow = hsl2rgb(hue, 1.90, 0.9);

            // Blend: floor of 0.12 so a hint of colour is always present,
            // but the Fresnel term keeps the straight-on face mostly opaque/readable.
            float blend   = 0.12 + pow(fresnel, 1.6) * 0.8;
            vec3  col     = mix(base.rgb, rainbow, blend);

            // Subtle specular highlight — narrow enough not to blow out text
            float shimmer = pow(max(cosA - 0.72, 0.0) / 0.4, 8.0) * 0.1;
            col = col + vec3(shimmer);

            gl_FragColor  = vec4(col, base.a);
          }
        `;
        if (propsRef.current.isFav) {
          const mat = new THREE.ShaderMaterial({
            uniforms: { uMap: { value: frontTex }, uTime: { value: 0.0 } },
            vertexShader:   holoVert,
            fragmentShader: holoFrag,
            transparent: true,
          });
          // Stash shader strings on mat so the prop-update effect can hot-swap
          mat._holoVert = holoVert;
          mat._holoFrag = holoFrag;
          return mat;
        }
        return new THREE.MeshBasicMaterial({ map: frontTex });
      })(),                                                          // front face (+z)
      new THREE.MeshBasicMaterial({ map: backTex }),              // back face  (-z)
    ];
    const mesh = new THREE.Mesh(geo, mats);
    scene.add(mesh);
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));

    const state = { rotY: 0, autoRot: true };
    const drag  = { active: false, lastX: 0, velX: 0 };
    const alive = { v: true };

    const animate = () => {
      if (!alive.v) return;
      requestAnimationFrame(animate);
      if (state.autoRot) state.rotY += 0.008;
      if (!drag.active) { drag.velX *= 0.93; state.rotY += drag.velX * 0.012; }
      mesh.rotation.y = state.rotY;
      // Advance holographic shader time (no-op for non-fav MeshBasicMaterial)
      const fm = mesh.material[4];
      if (fm && fm.type === "ShaderMaterial") fm.uniforms.uTime.value += 0.016;
      // No x-axis wobble — it causes z-fighting on angled views
      renderer.render(scene, camera);
    };
    animate();

    const onDown = (e) => { state.autoRot = false; drag.active = true; drag.lastX = e.clientX; drag.velX = 0; };
    const onMove = (e) => {
      if (!drag.active) return;
      const dx = e.clientX - drag.lastX;
      drag.velX = dx; state.rotY += dx * 0.018; drag.lastX = e.clientX;
    };
    const onUp = () => { drag.active = false; };

    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    threeRef.current = { alive, frontTex, backTex, frontCanvas, backCanvas, renderer, mesh };

    return () => {
      alive.v = false;
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      threeRef.current = null;
    };
  }, []); // mount once

  // ── Redraw front canvas + hot-swap holo material when ticket data changes ────
  useEffect(() => {
    const t = threeRef.current;
    if (!t) return;

    // Redraw canvas texture
    drawTicketFront(t.frontCanvas, { band, venue, date, isFav });
    t.frontTex.needsUpdate = true;

    // Swap front material (index 4) if isFav has changed
    const currentMat = t.mesh.material[4];
    const isHolo = currentMat.type === "ShaderMaterial";
    if (isFav && !isHolo) {
      // Promote to holographic — recover shader strings stashed on any previous ShaderMaterial,
      // or fall back to the copies embedded in the IIFE closure via _holo* properties.
      // Since we can't easily reach the closure here, we just re-define them inline.
      const hv = `
        varying vec2 vUv; varying vec3 vNormal; varying vec3 vViewPos;
        void main() {
          vUv = uv;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewPos = mvPos.xyz; vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mvPos;
        }`;
      const hf = `
        uniform sampler2D uMap; uniform float uTime;
        varying vec2 vUv; varying vec3 vNormal; varying vec3 vViewPos;
        vec3 hsl2rgb(float h,float s,float l){
          float c=(1.0-abs(2.0*l-1.0))*s; float x=c*(1.0-abs(mod(h*6.0,2.0)-1.0)); float m=l-c*0.5;
          vec3 rgb;
          if(h<1.0/6.0)rgb=vec3(c,x,0.0); else if(h<2.0/6.0)rgb=vec3(x,c,0.0);
          else if(h<3.0/6.0)rgb=vec3(0.0,c,x); else if(h<4.0/6.0)rgb=vec3(0.0,x,c);
          else if(h<5.0/6.0)rgb=vec3(x,0.0,c); else rgb=vec3(c,0.0,x);
          return rgb+m;}
        void main(){
          vec4 base=texture2D(uMap,vUv);
          vec3 viewDir=normalize(-vViewPos); float cosA=max(dot(vNormal,viewDir),0.0);
          float fresnel=1.0-cosA;
          float hue=mod(fresnel*2.5+vUv.x*0.7+vUv.y*0.5+uTime*0.15,1.0);
          vec3 rainbow=hsl2rgb(hue,0.90,0.68);
          float blend=0.12+pow(fresnel,1.6)*0.55;
          vec3 col=mix(base.rgb,rainbow,blend);
          float shimmer=pow(max(cosA-0.72,0.0)/0.28,8.0)*0.6;
          col=col+vec3(shimmer);
          gl_FragColor=vec4(col,base.a);}`;
      const newMat = new THREE.ShaderMaterial({
        uniforms: { uMap: { value: t.frontTex }, uTime: { value: 0.0 } },
        vertexShader: hv, fragmentShader: hf, transparent: true,
      });
      const mats = [...t.mesh.material];
      mats[4] = newMat;
      t.mesh.material = mats;
    } else if (!isFav && isHolo) {
      // Demote back to plain material
      const mats = [...t.mesh.material];
      mats[4] = new THREE.MeshBasicMaterial({ map: t.frontTex });
      t.mesh.material = mats;
    }
  }, [band, venue, date, isFav]);

  return <div ref={mountRef} className="three-canvas" style={{ width, height }}/>;
}

function generateTicketSVGString(band, venue, date, isFav) {
  const W = 512, H = 512;
  const px = W / 280;
  const displayVenue = venue ? (venue.length > 26 ? venue.slice(0,24)+"…" : venue.toUpperCase()) : "WHERE DID YOU SEE THEM?";
  const displayDate  = date ? formatDateUpper(date) : "WHEN DID YOU SEE THEM?";
  const isEmpty = !band && !venue && !date;
  let bandFontSize = 80;
  const displayBand = band || "Who did you see?";
  if (band && band.length > 16) bandFontSize = 60;
  if (band && band.length > 24) bandFontSize = 44;

  const holoFill = isFav
    ? `<defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#a8edea" stop-opacity="0.9"/><stop offset="33%" stop-color="#fed6e3" stop-opacity="0.9"/><stop offset="66%" stop-color="#d4b8f0" stop-opacity="0.9"/><stop offset="100%" stop-color="#a8f0d0" stop-opacity="0.9"/></linearGradient></defs>`
    : "";
  const cardFill = isFav ? `url(#hg)` : "white";

  // Generate barcode
  let barcodeRects = "";
  let bx = 64, by = H*0.76, bH2 = H*0.16, seed2 = 12345;
  for (let i = 0; bx < W-64; i++) {
    const w = ((seed2*(i+1)*137)%3)*px + px*2;
    const gap = (((seed2*(i+2)*91)%3))*px + px*2;
    if (bx + w <= W-64) {
      barcodeRects += `<rect x="${bx}" y="${by}" width="${w}" height="${bH2}" fill="${isEmpty?"#ddd":"#222"}"/>`;
    }
    bx += w + gap;
  }



  // Wrap band lines
  const charsPerLine = Math.floor(W / (bandFontSize * 0.55));
  const lines = !band ? ["Who did you", "see?"] : wrapText(band, charsPerLine);
  const lineH2 = bandFontSize * 1.15;
  const totalH2 = lines.length * lineH2;
  const startY2 = (W*0.18) + (W*0.38 - totalH2)/2 + bandFontSize;
  const bandLines = lines.map((l, i) =>
    `<text x="72" y="${startY2 + i*lineH2}" font-size="${bandFontSize}" font-weight="900" fill="${isEmpty?"#ccc":"#222"}" font-family="Playfair Display, Georgia, serif">${escXml(l)}</text>`
  ).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${holoFill}
  <rect width="${W}" height="${H}" rx="64" ry="64" fill="${cardFill}"/>
  <text x="72" y="120" font-size="38" font-weight="600" fill="${isEmpty?"#ccc":"#444"}" font-family="DM Sans, Arial, sans-serif" letter-spacing="2">${escXml(displayVenue)}</text>
  ${bandLines}
  <rect x="72" y="${H*0.6}" width="${W-144}" height="100" rx="50" fill="none" stroke="${isEmpty?"#ccc":"#333"}" stroke-width="4"/>
  <text x="${W/2}" y="${H*0.6+66}" font-size="36" font-weight="600" fill="${isEmpty?"#ccc":"#333"}" font-family="DM Sans, Arial, sans-serif" text-anchor="middle" letter-spacing="4">${escXml(displayDate)}</text>
  <line x1="60" y1="${H*0.735}" x2="${W-60}" y2="${H*0.735}" stroke="${isEmpty?"#ddd":"#ccc"}" stroke-width="3" stroke-dasharray="14 10"/>
  ${barcodeRects}
</svg>`;
}

function generateBackSVGString() {
  const W = 512, H = 512;
  // Decorative geometric pattern
  let circles = "";
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    circles += `<circle cx="${32 + i*64}" cy="${32 + j*64}" r="20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>`;
  }
  let lines2 = "";
  for (let i = 0; i < 9; i++) {
    lines2 += `<line x1="${i*64}" y1="0" x2="${i*64}" y2="${H}" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>`;
    lines2 += `<line x1="0" y1="${i*64}" x2="${W}" y2="${i*64}" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" rx="64" ry="64" fill="#1a3bb0"/>
  ${lines2}${circles}
  <circle cx="${W/2}" cy="${H/2}" r="80" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  <circle cx="${W/2}" cy="${H/2}" r="50" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  <path d="M${W/2-16} ${H/2} L${W/2} ${H/2-20} L${W/2+16} ${H/2} L${W/2} ${H/2+20}Z" fill="rgba(255,255,255,0.3)"/>
  <text x="${W/2}" y="${H-80}" font-size="28" font-weight="600" fill="rgba(255,255,255,0.4)" font-family="DM Sans, Arial, sans-serif" text-anchor="middle" letter-spacing="4">I Was There</text>
</svg>`;
}

function escXml(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

/* ─────────────────────────────────────────────
   SMALL TICKET (list thumbnail)
───────────────────────────────────────────── */
function MiniTicket({ band, venue, date, isFav, size = 52 }) {
  return <TicketSVG band={band} venue={venue} date={date} isFav={isFav} size={size}/>;
}

/* ─────────────────────────────────────────────
   FAV BOARD TICKET
───────────────────────────────────────────── */
function FavBoardTicket({ concert, onClick }) {
  return (
    <div className="fav-ticket-wrap" onClick={() => onClick(concert)}>
      <TicketSVG band={concert.band} venue={concert.venue}
        date={concert.concertDate} isFav={true} size={130}
        style={{ width: "100%", height: "auto" }}/>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FORM SHEET
───────────────────────────────────────────── */
function FormSheet({ concert, onClose, onSave, favCount }) {
  const isEdit = !!concert?.id;
  const [band, setBand]   = useState(concert?.band || "");
  const [venue, setVenue] = useState(concert?.venue || "");
  const [date, setDate]   = useState(concert?.concertDate || "");
  const [comment, setComment] = useState(concert?.comment || "");
  const [isFav, setIsFav] = useState(concert?.isFavourite || false);

  const slotsLeft = isFav ? (4 - favCount + 1) : (4 - favCount);
  const canFav = isFav || favCount < 4;

  const handleFavToggle = () => {
    if (!isFav && favCount >= 4) return;
    setIsFav(f => !f);
  };

  const handleSave = () => {
    if (!band.trim()) return;
    const now = new Date().toISOString();
    const item = {
      id: concert?.id || genId(),
      createdAt: concert?.createdAt || now,
      updatedAt: now,
      band: band.trim(),
      venue: venue.trim(),
      concertDate: date,
      comment: comment.trim(),
      isFavourite: isFav,
      price: concert?.price || null,
      group: concert?.group || null,
    };
    onSave(item);
    onClose();
  };

  return (
    <div className="sheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet-panel" style={{ maxHeight: "93dvh" }}>
        <div className="ticket-preview-area">
          <button className="sheet-close" style={{ position:"absolute", top:12, right:12 }} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <ThreeTicket band={band} venue={venue} date={date} isFav={isFav} width={220} height={220}/>
        </div>
        <div className="sheet-scroll">
          <div style={{ height: 16 }}/>
          <div className="form-group">
            <label className="form-label">Artist</label>
            <input className="form-input" value={band} onChange={e => setBand(e.target.value)} placeholder="Who did you see?"/>
          </div>
          <div className="form-group">
            <label className="form-label">Venue</label>
            <input className="form-input" value={venue} onChange={e => setVenue(e.target.value)} placeholder="Where did you see them?"/>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Comment <span style={{color:"#aaa",fontWeight:400}}>(optional)</span></label>
            <input className="form-input" value={comment} onChange={e => setComment(e.target.value)} placeholder="Any thoughts?"/>
          </div>
          <div className="form-group">
            <button
              className={`fav-toggle ${isFav ? "on" : !canFav ? "disabled" : "off"}`}
              onClick={handleFavToggle}
            >
              <svg className="fav-toggle-icon" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="white" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <div>
                <div className="fav-toggle-title">
                  {isFav ? "Added to favourites!" : !canFav ? "Can't add to favourites" : "Add to favourites"}
                </div>
                <div className="fav-toggle-sub">
                  {isFav
                    ? `You have ${4 - favCount} slots left on your favourites board. Tap to remove.`
                    : !canFav
                    ? `You have 0 favourite slots left out of 4.`
                    : `This will add it to the favourites cork board. You have ${slotsLeft} slots left out of 4.`}
                </div>
              </div>
            </button>
          </div>
          <button className="save-btn" onClick={handleSave} disabled={!band.trim()}>Save</button>
          <div style={{ height: 16 }}/>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VIEW TICKET SHEET
───────────────────────────────────────────── */
function ViewSheet({ concertId, concerts, onClose, onEdit, onDelete }) {
  const concert = concerts.find(c => c.id === concertId) || null;
  const [showMenu, setShowMenu] = useState(false);
  useEffect(() => { if (!concert) onClose(); }, [concert]);
  if (!concert) return null;

  const handleDelete = () => {
    if (window.confirm(`Delete "${concert.band}"? This cannot be undone.`)) {
      onDelete(concert.id);
      onClose();
    }
  };

  return (
    <div className="sheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet-panel" style={{ background: "var(--blue)" }}>
        <div className="sheet-drag-bar" style={{ background: "rgba(255,255,255,0.3)" }}/>

        {/* Top bar — kebab left, close right. Menu floats absolutely below kebab. */}
        <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 16px 0" }}>
          <button
            style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"white", flexShrink:0 }}
            onClick={() => setShowMenu(m => !m)}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
          </button>
          <button
            style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"white", flexShrink:0 }}
            onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          {/* Floating dropdown — positioned absolutely so it overlays content */}
          {showMenu && (
            <>
              {/* Tap-outside dismissal backdrop */}
              <div
                style={{ position:"fixed", inset:0, zIndex:10 }}
                onClick={() => setShowMenu(false)}
              />
              <div style={{
                position:"absolute", top:"calc(100% + 6px)", left:16,
                background:"white", borderRadius:16, overflow:"hidden",
                minWidth:200, zIndex:20,
                boxShadow:"0 8px 32px rgba(0,0,0,0.25)",
              }}>
                <div
                  className="menu-item"
                  style={{ padding:"14px 18px" }}
                  onClick={() => { setShowMenu(false); onEdit(concert); }}>
                  Edit concert
                </div>
                <div
                  className="menu-item danger"
                  style={{ padding:"14px 18px" }}
                  onClick={() => { setShowMenu(false); handleDelete(); }}>
                  Delete concert
                </div>
              </div>
            </>
          )}
        </div>

        {/* 3D ticket */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px 16px" }}>
          <ThreeTicket band={concert.band} venue={concert.venue}
            date={concert.concertDate} isFav={concert.isFavourite}
            width={270} height={270}/>
        </div>

        {/* Metadata */}
        <div style={{ textAlign:"center", padding:"0 32px 20px" }}>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)", fontFamily:"var(--font-body)", lineHeight:1.5 }}>
            {[concert.venue, formatDate(concert.concertDate)].filter(Boolean).join(" · ")}
          </div>
          {concert.comment && (
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", fontFamily:"var(--font-body)", marginTop:6, fontStyle:"italic" }}>
              "{concert.comment}"
            </div>
          )}
        </div>

        {/* Share button */}
        <div style={{ padding:"0 32px 32px" }}>
          <button style={{
            width:"100%", padding:"16px",
            background:"var(--blue-navy)", color:"white",
            border:"none", borderRadius:"100px",
            fontSize:16, fontWeight:600,
            fontFamily:"var(--font-body)",
            cursor:"pointer",
            transition:"transform 0.1s",
          }}
            onClick={() => {}}>
            Share ticket
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SETTINGS SHEET
───────────────────────────────────────────── */
function SettingsSheet({ onClose, concerts, setConcerts, userName, setUserName }) {
  const [nameInput, setNameInput] = useState(userName);
  const fileRef = useRef(null);

  const initial = (nameInput || "?")[0].toUpperCase();

  const handleNameBlur = () => setUserName(nameInput);

  const handleExport = () => {
    const header = "id,createdAt,updatedAt,band,venue,concertDate,comment,isFavourite,price,group";
    const rows = concerts.map(c =>
      [c.id,c.createdAt,c.updatedAt,`"${c.band}"`,`"${c.venue||""}"`,c.concertDate||"",`"${c.comment||""}"`,c.isFavourite?"true":"false","",""]
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "concerts.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g,""));
      const get = (row, key) => {
        const i = headers.indexOf(key);
        return i >= 0 ? row[i]?.trim().replace(/^"|"$/g,"") || "" : "";
      };
      const now = new Date().toISOString();
      const imported = lines.slice(1).map(line => {
        const row = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) || line.split(",");
        return {
          id: genId(),
          createdAt: now, updatedAt: now,
          band: get(row, "band"),
          venue: get(row, "venue"),
          concertDate: get(row, "concertDate"),
          comment: get(row, "comment"),
          isFavourite: false,
          price: null, group: null,
        };
      }).filter(c => c.band);
      setConcerts(prev => [...prev, ...imported]);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClear = () => {
    if (window.confirm("Clear ALL concert data? This cannot be undone.")) {
      setConcerts([]);
      onClose();
    }
  };

  const handleLoadDemo = () => {
    if (!window.confirm("Load 40 demo concerts? This will add them to your existing data.")) return;
    const csv = `band,venue,concertDate,comment
The Velvet Static,Roundhouse,2020-07-15,
Neon Palms,O2 Brixton Academy,2021-03-22,Supporting act was better honestly
The Velvet Static,Electric Ballroom,2022-11-04,
Hollow Earth,Roundhouse,2022-06-18,Best show I've ever seen
The Midnight Echoes,Scala,2023-01-29,
Neon Palms,O2 Brixton Academy,2023-04-11,Came with friends amazing night
The Velvet Static,O2 Brixton Academy,2023-05-03,They played the old stuff!
Pale Riders,Roundhouse,2023-07-19,
Hollow Earth,Electric Ballroom,2023-08-25,Sound was a bit off but great energy
The Midnight Echoes,O2 Brixton Academy,2023-09-14,
The Velvet Static,Roundhouse,2023-10-07,New album sounded great live
Pale Riders,Scala,2023-11-02,
Neon Palms,Village Underground,2023-12-16,Incredible set front row!
The Velvet Static,O2 Brixton Academy,2024-01-20,
Glass Animals Jr.,Roundhouse,2024-02-08,Solo trip totally worth it
The Midnight Echoes,Electric Ballroom,2024-03-15,
Hollow Earth,O2 Brixton Academy,2024-04-27,
Pale Riders,Roundhouse,2024-06-01,Best show I've ever seen
Neon Palms,Scala,2024-07-13,
The Velvet Static,Electric Ballroom,2024-08-22,Incredible set front row!
Solar Flare,O2 Brixton Academy,2024-09-06,
Glass Animals Jr.,Village Underground,2024-10-18,
The Velvet Static,O2 Brixton Academy,2024-11-30,New album sounded great live
Hollow Earth,Roundhouse,2025-01-11,
Pale Riders,O2 Brixton Academy,2025-02-23,
Neon Palms,Electric Ballroom,2025-03-14,Came with friends amazing night
The Velvet Static,Roundhouse,2025-04-05,
Solar Flare,Scala,2025-05-17,
The Midnight Echoes,O2 Brixton Academy,2025-06-28,Sound was a bit off but great energy
Glass Animals Jr.,Fabric,2025-07-09,
The Velvet Static,O2 Brixton Academy,2025-08-21,They played the old stuff!
Pale Riders,Electric Ballroom,2025-09-03,
Neon Palms,O2 Brixton Academy,2025-10-16,Incredible set front row!
Crater Lake,Roundhouse,2025-11-27,Solo trip totally worth it
The Velvet Static,Village Underground,2025-12-12,
Distant Signals,O2 Brixton Academy,2026-01-08,
The Velvet Static,Electric Ballroom,2026-02-19,New album sounded great live
Hollow Earth,O2 Brixton Academy,2026-03-04,Best show I've ever seen
Wax Phantom,Oslo Hackney,2026-03-22,
The Velvet Static,Barbican Centre,2026-04-01,Incredible set front row!`;
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",");
    const now = new Date().toISOString();
    const imported = lines.slice(1).map(line => {
      const row = line.split(",");
      const get = (key) => { const i = headers.indexOf(key); return i >= 0 ? (row[i] || "").trim() : ""; };
      return { id: genId(), createdAt: now, updatedAt: now,
        band: get("band"), venue: get("venue"), concertDate: get("concertDate"),
        comment: get("comment"), isFavourite: false, price: null, group: null };
    }).filter(c => c.band);
    setConcerts(prev => [...prev, ...imported]);
  };

  return (
    <div className="sheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet-panel">
        <div className="sheet-drag-bar"/>
        <div className="sheet-header">
          <button className="sheet-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="sheet-scroll">
          <div className="settings-avatar">{initial}</div>
          <div className="settings-name-label">Name <span>*</span></div>
          <input className="form-input" style={{ background:"white" }}
            value={nameInput} onChange={e => setNameInput(e.target.value)}
            onBlur={handleNameBlur} placeholder="What's your name?"/>
          <div className="settings-btn-row">
            <button className="settings-action-btn" onClick={() => fileRef.current?.click()}>Import concerts</button>
            <button className="settings-action-btn" onClick={handleExport}>Export concerts</button>
          </div>
          <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }} onChange={handleImport}/>
          <div className="settings-meta">I Was There · V0.1 April 2026</div>
          <button className="settings-danger" onClick={handleClear}>Clear all concert data</button>
          <button className="settings-danger" style={{ color:"#888", marginTop:4 }} onClick={handleLoadDemo}>Load demo concerts</button>
          <div style={{ height: 16 }}/>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HOME SCREEN
───────────────────────────────────────────── */
function HomeScreen({ concerts, onAdd, onView, userName, onSettings }) {
  const favourites = concerts.filter(c => c.isFavourite);
  const sorted = [...concerts].sort((a, b) => {
    const ad = a.concertDate || "";
    const bd = b.concertDate || "";
    if (!ad && !bd) return 0;
    if (!ad) return 1;   // no date → pushed to end
    if (!bd) return -1;  // no date → pushed to end
    // YYYY-MM-DD is lexicographically sortable; b > a = newest first
    if (bd > ad) return 1;
    if (bd < ad) return -1;
    return 0;
  });
  const initial = (userName || "?")[0].toUpperCase();

  return (
    <div className="screen" style={{ background: "var(--blue)" }}>
      <div className="home-header">
        <div className="app-logo">
          <div className="app-logo-icon">
          </div>
          <span className="app-logo-text">I Was There</span>
        </div>
        <button className="avatar-btn" onClick={onSettings}>{initial}</button>
      </div>

      {/* Favourites board — only if at least 1 ticket */}
      {concerts.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="section-header">
            <span className="section-title">Favourites board</span>
            <span className="section-badge">{favourites.length}/4</span>
          </div>
          <div className="fav-board">
            {favourites.length === 0 ? (
              <div className="fav-board-empty">

                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M28.0003 6C28.5307 6.00009 29.0394 6.21094 29.4144 6.58594C29.7894 6.96099 30.0003 7.46964 30.0003 8V13C30.0003 13.2651 29.8948 13.5195 29.7074 13.707C29.5199 13.8945 29.2654 13.9999 29.0003 14C28.47 14 27.9613 14.211 27.5863 14.5859C27.2112 14.961 27.0003 15.4696 27.0003 16C27.0003 16.5304 27.2112 17.039 27.5863 17.4141C27.9613 17.789 28.47 18 29.0003 18C29.2654 18.0001 29.5199 18.1055 29.7074 18.293C29.8948 18.4805 30.0003 18.7349 30.0003 19V24C30.0003 24.5304 29.7894 25.039 29.4144 25.4141C29.0394 25.7891 28.5307 25.9999 28.0003 26H4.00034C3.46998 26 2.96133 25.789 2.58627 25.4141C2.2112 25.039 2.00034 24.5304 2.00034 24V19C2.00034 18.7348 2.10577 18.4805 2.2933 18.293C2.48083 18.1055 2.7352 18 3.00034 18C3.53065 17.9999 4.0394 17.7891 4.4144 17.4141C4.78937 17.039 5.00034 16.5304 5.00034 16C5.00034 15.4696 4.78937 14.961 4.4144 14.5859C4.0394 14.2109 3.53065 14.0001 3.00034 14C2.7352 14 2.48083 13.8945 2.2933 13.707C2.10577 13.5195 2.00034 13.2652 2.00034 13V8C2.00034 7.46957 2.2112 6.96101 2.58627 6.58594C2.96133 6.21097 3.46998 6 4.00034 6H28.0003ZM4.00034 8V12.1299C4.85622 12.3536 5.61393 12.8555 6.15463 13.5557C6.6952 14.2559 6.98862 15.1154 6.98862 16C6.98862 16.8846 6.6952 17.7441 6.15463 18.4443C5.61393 19.1445 4.85622 19.6464 4.00034 19.8701V24H19.0003V21H21.0003V24H28.0003V19.8701C27.1443 19.6464 26.3868 19.1446 25.846 18.4443C25.3053 17.7441 25.0111 16.8847 25.0111 16C25.0111 15.1153 25.3053 14.2559 25.846 13.5557C26.3868 12.8554 27.1443 12.3536 28.0003 12.1299V8H21.0003V11H19.0003V8H4.00034ZM21.0003 13V19H19.0003V13H21.0003Z" fill="rgba(255,255,255,0.3)"/>
                </svg>

                <span>Favourite a ticket<br/>to add them to this board</span>
              </div>
            ) : (
              favourites.map(c => (
                <FavBoardTicket key={c.id} concert={c} onClick={onView}/>
              ))
            )}
          </div>
        </div>
      )}

      {/* All concerts */}
      <div style={{ marginBottom: 8 }}>
        <div className="section-header">
          <span className="section-title">All concerts</span>
          <span className="section-badge">{concerts.length}</span>
        </div>
        <div className="cream-card">
          {concerts.length === 0 ? (
            <div className="empty-state">

              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M28.0003 6C28.5307 6.00009 29.0394 6.21094 29.4144 6.58594C29.7894 6.96099 30.0003 7.46964 30.0003 8V13C30.0003 13.2651 29.8948 13.5195 29.7074 13.707C29.5199 13.8945 29.2654 13.9999 29.0003 14C28.47 14 27.9613 14.211 27.5863 14.5859C27.2112 14.961 27.0003 15.4696 27.0003 16C27.0003 16.5304 27.2112 17.039 27.5863 17.4141C27.9613 17.789 28.47 18 29.0003 18C29.2654 18.0001 29.5199 18.1055 29.7074 18.293C29.8948 18.4805 30.0003 18.7349 30.0003 19V24C30.0003 24.5304 29.7894 25.039 29.4144 25.4141C29.0394 25.7891 28.5307 25.9999 28.0003 26H4.00034C3.46998 26 2.96133 25.789 2.58627 25.4141C2.2112 25.039 2.00034 24.5304 2.00034 24V19C2.00034 18.7348 2.10577 18.4805 2.2933 18.293C2.48083 18.1055 2.7352 18 3.00034 18C3.53065 17.9999 4.0394 17.7891 4.4144 17.4141C4.78937 17.039 5.00034 16.5304 5.00034 16C5.00034 15.4696 4.78937 14.961 4.4144 14.5859C4.0394 14.2109 3.53065 14.0001 3.00034 14C2.7352 14 2.48083 13.8945 2.2933 13.707C2.10577 13.5195 2.00034 13.2652 2.00034 13V8C2.00034 7.46957 2.2112 6.96101 2.58627 6.58594C2.96133 6.21097 3.46998 6 4.00034 6H28.0003ZM4.00034 8V12.1299C4.85622 12.3536 5.61393 12.8555 6.15463 13.5557C6.6952 14.2559 6.98862 15.1154 6.98862 16C6.98862 16.8846 6.6952 17.7441 6.15463 18.4443C5.61393 19.1445 4.85622 19.6464 4.00034 19.8701V24H19.0003V21H21.0003V24H28.0003V19.8701C27.1443 19.6464 26.3868 19.1446 25.846 18.4443C25.3053 17.7441 25.0111 16.8847 25.0111 16C25.0111 15.1153 25.3053 14.2559 25.846 13.5557C26.3868 12.8554 27.1443 12.3536 28.0003 12.1299V8H21.0003V11H19.0003V8H4.00034ZM21.0003 13V19H19.0003V13H21.0003Z" fill="#aaa"/>
              </svg>

              <span>What was the first gig you went to?</span>

              <button class="save-btn" onClick={onAdd}> Log your first concert </button>
            </div>
          ) : (
            sorted.map(c => (
              <div key={c.id} className="concert-item" onClick={() => onView(c)}>
                <div className="concert-thumb">
                  <MiniTicket band={c.band} venue={c.venue} date={c.concertDate} isFav={c.isFavourite} size={52}/>
                </div>
                <div className="concert-info">
                  <div className="concert-band">{c.band}</div>
                  <div className="concert-meta">{c.venue}{c.venue && c.concertDate ? " on " : ""}{formatDate(c.concertDate)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STATS SCREEN
───────────────────────────────────────────── */
function StatsScreen({ concerts }) {
  // Band counts
  const bandMap = {};
  concerts.forEach(c => { if (c.band) bandMap[c.band] = (bandMap[c.band]||0) + 1; });
  const bands = Object.entries(bandMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Venue counts
  const venueMap = {};
  concerts.forEach(c => { if (c.venue) venueMap[c.venue] = (venueMap[c.venue]||0) + 1; });
  const venues = Object.entries(venueMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Year counts
  const yearMap = {};
  concerts.forEach(c => {
    if (c.concertDate) { const y = (c.concertDate.split("-")[0] || "").slice(0,4); if (y.match(/^\d{4}$/)) yearMap[y] = (yearMap[y]||0)+1; }
  });
  const years = Object.entries(yearMap).sort((a,b) => Number(b[0]) - Number(a[0]));

  const maxBand  = bands.length ? Math.max(...bands.map(e=>e[1])) : 1;
  const maxVenue = venues.length ? Math.max(...venues.map(e=>e[1])) : 1;
  const maxYear  = years.length ? Math.max(...years.map(e=>e[1])) : 1;

  const showBands  = Object.keys(bandMap).length >= 2;
  const showVenues = Object.keys(venueMap).length >= 2;
  const showYears  = years.length >= 1;

  return (
    <div className="screen stats-screen">
      <div className="stats-title">My statistics</div>

      <div className="stats-section-title">Favourite bands</div>
      <div className="stats-card">
        {!showBands ? (
          <div className="stats-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><rect x="3" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="17" y="5" width="4" height="16"/></svg>
            Log more concerts to see this chart
          </div>
        ) : bands.map(([name, count]) => (
          <div key={name} className="bar-row">
            <div className="bar-label">{name.length > 14 ? name.slice(0,12)+"…" : name}</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(count/maxBand)*100}%` }}>
                <span className="bar-count">{count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-section-title">Favourite venues</div>
      <div className="stats-card">
        {!showVenues ? (
          <div className="stats-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><rect x="3" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="17" y="5" width="4" height="16"/></svg>
            Log more concerts to see this chart
          </div>
        ) : venues.map(([name, count]) => (
          <div key={name} className="bar-row">
            <div className="bar-label">{name.length > 14 ? name.slice(0,12)+"…" : name}</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(count/maxVenue)*100}%` }}>
                <span className="bar-count">{count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-section-title">Concerts per year</div>
      <div className="stats-card">
        {!showYears ? (
          <div className="stats-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><rect x="3" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="17" y="5" width="4" height="16"/></svg>
            Log more concerts to see this chart
          </div>
        ) : years.map(([year, count]) => (
          <div key={year} className="bar-row">
            <div className="bar-label">{year}</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(count/maxYear)*100}%` }}>
                <span className="bar-count">{count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BOTTOM NAV
───────────────────────────────────────────── */
function BottomNav({ tab, setTab, onAdd }) {
  return (
    <nav className="bottom-nav">

      <div className="nav-group">
        <button className={`nav-pill ${tab==="home"?"active":""}`} onClick={() => setTab("home")}>

          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 4.5C21.3978 4.5 21.7792 4.65815 22.0605 4.93945C22.3419 5.22076 22.5 5.60218 22.5 6V9.75C22.5 9.94891 22.4209 10.1396 22.2803 10.2803C22.1396 10.4209 21.9489 10.5 21.75 10.5C21.3522 10.5 20.9708 10.6581 20.6895 10.9395C20.4081 11.2208 20.25 11.6022 20.25 12C20.25 12.3978 20.4081 12.7792 20.6895 13.0605C20.9708 13.3419 21.3522 13.5 21.75 13.5C21.9489 13.5 22.1396 13.5791 22.2803 13.7197C22.4209 13.8604 22.5 14.0511 22.5 14.25V18C22.5 18.3978 22.3419 18.7792 22.0605 19.0605C21.7792 19.3419 21.3978 19.5 21 19.5H3C2.60218 19.5 2.22076 19.3419 1.93945 19.0605C1.65815 18.7792 1.5 18.3978 1.5 18V14.25C1.5 14.0511 1.57907 13.8604 1.71973 13.7197C1.86038 13.5791 2.05109 13.5 2.25 13.5C2.64782 13.5 3.02924 13.3419 3.31055 13.0605C3.59185 12.7792 3.75 12.3978 3.75 12C3.75 11.6022 3.59185 11.2208 3.31055 10.9395C3.02924 10.6581 2.64782 10.5 2.25 10.5C2.05109 10.5 1.86038 10.4209 1.71973 10.2803C1.57907 10.1396 1.5 9.94891 1.5 9.75V6C1.5 5.60218 1.65815 5.22076 1.93945 4.93945C2.22076 4.65815 2.60218 4.5 3 4.5H21ZM3 6V9.09766C3.64196 9.26545 4.21065 9.64086 4.61621 10.166C5.02178 10.6912 5.24121 11.3364 5.24121 12C5.24121 12.6636 5.02178 13.3088 4.61621 13.834C4.21065 14.3591 3.64196 14.7345 3 14.9023V18H14.25V15.75H15.75V18H21V14.9023C20.358 14.7345 19.7893 14.3591 19.3838 13.834C18.9782 13.3088 18.7588 12.6636 18.7588 12C18.7588 11.3364 18.9782 10.6912 19.3838 10.166C19.7893 9.64086 20.358 9.26545 21 9.09766V6H15.75V8.25H14.25V6H3ZM15.75 9.75V14.25H14.25V9.75H15.75Z" fill="currentColor"/>
          </svg>

          Concerts
        </button>
        <button className={`nav-pill ${tab==="stats"?"active":""}`} onClick={() => setTab("stats")}>

          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.5C9.9233 1.5 7.89323 2.11581 6.16652 3.26957C4.4398 4.42332 3.09399 6.0632 2.29927 7.98182C1.50455 9.90045 1.29661 12.0116 1.70176 14.0484C2.1069 16.0852 3.10693 17.9562 4.57538 19.4246C6.04383 20.8931 7.91476 21.8931 9.95156 22.2982C11.9884 22.7034 14.0996 22.4955 16.0182 21.7007C17.9368 20.906 19.5767 19.5602 20.7304 17.8335C21.8842 16.1068 22.5 14.0767 22.5 12C22.4969 9.21619 21.3896 6.5473 19.4212 4.57884C17.4527 2.61039 14.7838 1.50314 12 1.5V1.5ZM20.962 11.2508H16.4325C16.3075 10.4992 15.9932 9.7919 15.5193 9.19544C15.0453 8.59898 14.4272 8.13303 13.7234 7.8415C13.0195 7.54997 12.253 7.44247 11.4961 7.52912C10.7392 7.61577 10.0168 7.89372 9.39705 8.33677L6.19455 5.13427C7.45407 4.06514 8.98401 3.36402 10.6162 3.10801C12.2483 2.852 13.9194 3.05102 15.4458 3.68318C16.9722 4.31534 18.2947 5.35616 19.2679 6.6912C20.2411 8.02623 20.8273 9.60378 20.9621 11.2504L20.962 11.2508ZM12 15C11.4067 15 10.8266 14.8241 10.3333 14.4944C9.83995 14.1648 9.45543 13.6962 9.22837 13.148C9.0013 12.5999 8.94189 11.9967 9.05765 11.4147C9.1734 10.8328 9.45913 10.2982 9.87868 9.87868C10.2982 9.45912 10.8328 9.1734 11.4147 9.05764C11.9967 8.94189 12.5999 9.0013 13.1481 9.22836C13.6962 9.45542 14.1648 9.83994 14.4944 10.3333C14.8241 10.8266 15 11.4067 15 12C14.9991 12.7954 14.6828 13.5579 14.1203 14.1203C13.5579 14.6827 12.7954 14.9991 12 15ZM3 12C2.99919 9.87292 3.75574 7.81504 5.13413 6.195L8.33663 9.39713C7.89372 10.0169 7.61588 10.7393 7.52927 11.4961C7.44266 12.2529 7.55013 13.0194 7.84157 13.7232C8.13301 14.427 8.59882 15.0451 9.19512 15.5192C9.79142 15.9932 10.4986 16.3077 11.25 16.433V20.9629C9.0024 20.7732 6.90778 19.7471 5.3802 18.0875C3.85262 16.4279 3.00326 14.2556 3 12V12ZM12.75 20.9625V16.4325C13.6695 16.2755 14.5176 15.8369 15.1773 15.1773C15.8369 14.5176 16.2755 13.6695 16.4325 12.75H20.9625C20.7828 14.8679 19.8599 16.854 18.3569 18.3569C16.854 19.8598 14.8679 20.7828 12.75 20.9625V20.9625Z" fill="currentColor"/>
          </svg>

          Stats
        </button>
      </div>


      <button className="nav-add-btn" onClick={onAdd}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#1C2E5B" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function App() {
  const [concerts, setConcerts] = useLocalStorage("tl3k_concerts", []);
  const [userName, setUserName] = useLocalStorage("tl3k_user", "");
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState(null); // null | { type, data }

  // Disable pinch-to-zoom: set viewport meta to user-scalable=no
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "viewport"; document.head.appendChild(meta); }
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
  }, []);

  const favCount = concerts.filter(c => c.isFavourite).length;

  const openAdd = () => setSheet({ type: "form", data: null });
  const openEdit = (c) => setSheet({ type: "form", data: c });
  const openView = (c) => setSheet({ type: "view", data: c });
  const openSettings = () => setSheet({ type: "settings" });
  const closeSheet = () => setSheet(null);

  const handleSave = (item) => {
    setConcerts(prev => {
      const idx = prev.findIndex(c => c.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [item, ...prev];
    });
  };

  const handleDelete = (id) => {
    setConcerts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="app-shell">
        {tab === "home" && (
          <HomeScreen
            concerts={concerts}
            onAdd={openAdd}
            onView={openView}
            userName={userName}
            onSettings={openSettings}
          />
        )}
        {tab === "stats" && <StatsScreen concerts={concerts}/>}

        <BottomNav tab={tab} setTab={setTab} onAdd={openAdd}/>

        {sheet?.type === "form" && (
          <FormSheet
            concert={sheet.data}
            onClose={closeSheet}
            onSave={handleSave}
            favCount={favCount - (sheet.data?.isFavourite ? 1 : 0)}
          />
        )}
        {sheet?.type === "view" && (
          <ViewSheet
            concertId={sheet.data?.id}
            concerts={concerts}
            onClose={closeSheet}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
        {sheet?.type === "settings" && (
          <SettingsSheet
            onClose={closeSheet}
            concerts={concerts}
            setConcerts={setConcerts}
            userName={userName}
            setUserName={setUserName}
          />
        )}
      </div>
    </>
  );
}