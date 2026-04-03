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
    padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 16px);
  }

  /* Bottom Nav */
  .bottom-nav {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: calc(var(--bottom-nav-h) + var(--safe-bottom));
    display: flex;
    align-items: flex-start;
    padding: 10px 16px var(--safe-bottom);
    background: var(--white);
    border-radius: 24px 24px 0 0;
    z-index: 100;
    gap: 4px;
  }
  .nav-pill {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 0;
    border-radius: 16px;
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
    width: 48px; height: 48px;
    border-radius: 50%;
    background: var(--dark);
    border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    align-self: center;
    transition: transform 0.15s, background 0.15s;
    margin: 0 4px;
  }
  .nav-add-btn:active { transform: scale(0.93); }
  .nav-add-btn svg { width: 20px; height: 20px; color: white; }

  /* Header */
  .home-header {
    display: flex; align-items: center;
    padding: 16px 16px 12px;
    gap: 12px;
  }
  .app-logo { display: flex; align-items: center; gap: 8px; flex: 1; }
  .app-logo-icon svg { width: 28px; height: 28px; color: white; }
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
    padding: 16px;
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
    width: 52px; height: 52px; border-radius: 8px;
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
    border-radius: 0 0 24px 24px;
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
  .stats-screen { background: var(--blue); padding: 24px 16px; }
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
  const r = 40; // corner radius
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
  const r = 40;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(W-r, 0);
  ctx.quadraticCurveTo(W, 0, W, r); ctx.lineTo(W, H-r);
  ctx.quadraticCurveTo(W, H, W-r, H); ctx.lineTo(r, H);
  ctx.quadraticCurveTo(0, H, 0, H-r); ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0); ctx.closePath();
  ctx.fillStyle = "#1a3bb0";
  ctx.fill();
  ctx.clip(); // clip all subsequent drawing to the rounded rect

  // Grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 8; i++) {
    ctx.beginPath(); ctx.moveTo(i*64, 0); ctx.lineTo(i*64, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i*64); ctx.lineTo(W, i*64); ctx.stroke();
  }

  // Dot grid
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    ctx.beginPath();
    ctx.arc(32 + i*64, 32 + j*64, 3, 0, Math.PI*2);
    ctx.fill();
  }

  // Concentric circles
  [80, 120, 160].forEach((rad, k) => {
    ctx.beginPath();
    ctx.arc(W/2, H/2, rad, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(255,255,255,${0.25 - k*0.06})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  });

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
  ctx.fillText("TICKETLOGGER3000", W/2, H - 70);
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

    // Single BoxGeometry — Three.js face order is deterministic, no z-fighting.
    // Face indices: 0=+x, 1=-x, 2=+y, 3=-y, 4=+z (front), 5=-z (back)
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xe8e8e8 });
    const mats = [
      edgeMat,                                                    // right edge
      edgeMat,                                                    // left edge
      edgeMat,                                                    // top edge
      edgeMat,                                                    // bottom edge
      new THREE.MeshBasicMaterial({ map: frontTex }),             // front face (+z)
      new THREE.MeshBasicMaterial({ map: backTex }),              // back face  (-z)
    ];
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 0.05), mats);
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

    threeRef.current = { alive, frontTex, backTex, frontCanvas, backCanvas, renderer };

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

  // ── Redraw front canvas when ticket data changes (no scene rebuild) ────────
  useEffect(() => {
    const t = threeRef.current;
    if (!t) return;
    drawTicketFront(t.frontCanvas, { band, venue, date, isFav });
    t.frontTex.needsUpdate = true;
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
  <text x="${W/2}" y="${H-80}" font-size="28" font-weight="600" fill="rgba(255,255,255,0.4)" font-family="DM Sans, Arial, sans-serif" text-anchor="middle" letter-spacing="4">TICKETLOGGER3000</text>
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
  // If concert was deleted while sheet is open, close cleanly via effect (not during render)
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
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 16px 0" }}>
          <button style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"white" }}
            onClick={() => setShowMenu(m => !m)}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
          </button>
          <button style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"white" }}
            onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {showMenu && (
          <div style={{ margin:"8px 16px", background:"white", borderRadius:16, overflow:"hidden" }}>
            <div className="menu-item" style={{ padding:"14px 16px" }} onClick={() => { onEdit(concert); onClose(); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit concert
            </div>
            <div className="menu-item danger" style={{ padding:"14px 16px" }} onClick={handleDelete}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Delete concert
            </div>
          </div>
        )}
        <div style={{ padding:"24px 0", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <ThreeTicket band={concert.band} venue={concert.venue}
            date={concert.concertDate} isFav={concert.isFavourite}
            width={260} height={260}/>
        </div>
        <div style={{ textAlign:"center", paddingBottom: 40 }}>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-body)", marginTop:8 }}>
            {concert.venue} · {formatDate(concert.concertDate)}
          </div>
          {concert.comment && (
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)", fontFamily:"var(--font-body)", marginTop:8, padding:"0 32px" }}>
              "{concert.comment}"
            </div>
          )}
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
          <div className="settings-meta">TicketLogger3000 · V0.1 April 2026</div>
          <button className="settings-danger" onClick={handleClear}>Clear all concert data</button>
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
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 16 L14 8 L26 16 L14 24 Z" fill="white" opacity="0.9"/>
              <path d="M8 16 L16 8 L28 16 L16 24 Z" fill="white" opacity="0.6"/>
            </svg>
          </div>
          <span className="app-logo-text">TicketLogger3000</span>
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
                <svg viewBox="0 0 32 24" width="40" fill="none"><rect x="1" y="3" width="30" height="18" rx="4" fill="rgba(255,255,255,0.3)"/><rect x="5" y="3" width="22" height="18" rx="3" fill="rgba(255,255,255,0.15)"/></svg>
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
              <svg viewBox="0 0 48 32" width="48" fill="none"><rect x="1" y="4" width="46" height="24" rx="6" fill="#ccc"/><rect x="7" y="4" width="34" height="24" rx="4" fill="#bbb"/></svg>
              <span>What was the first gig you went to?</span>
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
      <button className={`nav-pill ${tab==="home"?"active":""}`} onClick={() => setTab("home")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-8l-4 4h16z"/></svg>
        Concerts
      </button>
      <button className={`nav-pill ${tab==="stats"?"active":""}`} onClick={() => setTab("stats")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
        Stats
      </button>
      <button className="nav-add-btn" onClick={onAdd}>
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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
