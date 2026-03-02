// frontend/src/pages/Registration.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

const injectHead = () => {
  if (document.getElementById('sah-reg-fonts')) return;
  const fonts = document.createElement('link');
  fonts.id = 'sah-reg-fonts'; fonts.rel = 'stylesheet';
  fonts.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@400;500;600;700&display=swap';
  document.head.appendChild(fonts);
  const fa = document.createElement('link');
  fa.rel = 'stylesheet';
  fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
  document.head.appendChild(fa);
};

const CSS = `
  :root {
    --accent: #c9621a; --accent-dark: #a84e12; --accent-light: #f0dcc8;
    --dark: #3a3a3a; --mid: #555; --muted: #888;
    --card-gray: #d6d0c8; --card-white: #ede9e3;
    --border: rgba(0,0,0,0.10);
    --header-h: 68px;
    --shadow-md: 0 4px 20px rgba(0,0,0,0.09);
    --shadow-lg: 0 16px 48px rgba(0,0,0,0.14);
    --radius: 8px; --radius-lg: 12px;
  }

  .sah-reg-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .sah-reg-wrap {
    font-family: 'DM Sans', sans-serif; background: var(--card-white);
    min-height: 100vh; -webkit-font-smoothing: antialiased; color: var(--dark);
  }

  /* ── Header ── */
  .sah-rhdr {
    position: sticky; top: 0; z-index: 200;
    height: var(--header-h); background: #5a5a5a;
    box-shadow: 0 2px 12px rgba(0,0,0,0.22);
  }
  .sah-rhdr-inner {
    max-width: 1400px; margin: 0 auto; padding: 0 32px;
    height: 100%; display: flex; align-items: center; justify-content: space-between;
  }
  .sah-rhdr-left { display: flex; align-items: center; }
  .sah-rhdr-back {
    display: inline-flex; align-items: center; gap: 8px;
    background: none; border: none; color: rgba(255,255,255,0.88);
    font-size: 0.88rem; font-weight: 600; font-family: 'DM Sans', sans-serif;
    cursor: pointer; padding: 6px 0; text-decoration: none; white-space: nowrap;
  }
  .sah-rhdr-back:hover { color: #fff; }
  .sah-rhdr-div { width: 1px; height: 28px; background: rgba(255,255,255,0.28); margin: 0 16px; }
  .sah-rhdr-brand { text-decoration: none; }
  .sah-rhdr-brand-name { font-family: 'Playfair Display', serif; font-weight: 800; font-size: 1.02rem; color: #fff; display: block; }
  .sah-rhdr-brand-tag { font-size: 0.66rem; color: rgba(255,255,255,0.68); font-weight: 500; letter-spacing: 0.45px; display: block; }
  .sah-rhdr-right { display: flex; gap: 10px; align-items: center; }
  .sah-rhdr-ghost {
    padding: 7px 16px; border-radius: 6px;
    border: 1.5px solid rgba(255,255,255,0.60); background: transparent;
    color: #fff; font-weight: 600; font-size: 0.85rem; cursor: pointer;
    font-family: 'DM Sans', sans-serif; text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .sah-rhdr-ghost:hover { border-color: #fff; background: rgba(255,255,255,0.10); }

  /* ── Hero ── */
  .sah-reg-hero {
    position: relative; overflow: hidden;
    min-height: 220px; display: flex; align-items: center;
  }
  .sah-reg-hero-bg {
    position: absolute; inset: 0; z-index: 0;
    background-image: url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&auto=format&fit=crop&q=80');
    background-size: cover; background-position: center 35%;
  }
  .sah-reg-hero-bg::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(100deg, rgba(10,10,10,0.88) 0%, rgba(30,30,30,0.82) 50%, rgba(10,10,10,0.78) 100%);
  }
  .sah-reg-hero-inner {
    position: relative; z-index: 2; width: 100%;
    max-width: 1400px; margin: 0 auto; padding: 48px 32px;
  }
  .sah-reg-hero-title {
    font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900; color: #fff; margin-bottom: 28px; line-height: 1.1;
  }
  .sah-reg-hero-title em { font-style: italic; color: var(--accent-light); }

  /* ── Step trail ── */
  .sah-step-trail {
    display: flex; align-items: center; gap: 0; flex-wrap: nowrap; overflow-x: auto;
    -webkit-overflow-scrolling: touch; padding-bottom: 4px;
  }
  .sah-step-trail::-webkit-scrollbar { display: none; }
  .sah-trail-item { display: flex; align-items: center; gap: 0; flex-shrink: 0; }
  .sah-trail-dot {
    display: flex; align-items: center; gap: 7px;
    padding: 6px 14px; border-radius: 50px;
    font-size: 0.76rem; font-weight: 700; white-space: nowrap;
    border: 1.5px solid rgba(255,255,255,0.25);
    color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.07);
    transition: all 0.2s; cursor: default;
  }
  .sah-trail-dot.active { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,98,26,0.28); }
  .sah-trail-dot.done { background: rgba(255,255,255,0.18); color: rgba(255,255,255,0.80); border-color: rgba(255,255,255,0.35); }
  .sah-trail-dot .sah-tn { font-size: 0.68rem; opacity: 0.75; margin-right: 2px; }
  .sah-trail-arrow { color: rgba(255,255,255,0.25); font-size: 0.62rem; margin: 0 6px; flex-shrink: 0; }

  /* ── Panel ── */
  .sah-reg-panel { max-width: 1100px; margin: 0 auto; padding: 0 24px 80px; }

  .sah-step-card {
    background: var(--card-gray); border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg); margin-top: 28px; overflow: visible;
  }
  .sah-step-card-head { background: #5a5a5a; padding: 24px 36px 18px; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
  .sah-step-card-head h2 { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 800; color: #fff; }
  .sah-step-card-head p { font-size: 0.85rem; color: rgba(255,255,255,0.65); margin-top: 3px; }
  .sah-step-card-body { padding: 32px 36px 28px; overflow: visible; border-radius: 0 0 var(--radius-lg) var(--radius-lg); }

  /* ── Plan cards ── */
  .sah-plan-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
  .sah-plan-card {
    border: 2px solid rgba(0,0,0,0.10); border-radius: var(--radius-lg);
    background: var(--card-white); cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s; overflow: hidden;
  }
  .sah-plan-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .sah-plan-card.selected { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,98,26,0.18), var(--shadow-md); }
  .sah-plan-card-head { padding: 18px 20px 14px; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; background: var(--card-white); }
  .sah-plan-card.selected .sah-plan-card-head { background: #f5f0ea; border-bottom: 2px solid var(--accent); }
  .sah-plan-card-name { font-weight: 800; font-size: 1rem; color: #1a1a1a; }
  .sah-plan-card-desc { font-size: 0.74rem; color: #555; margin-top: 2px; }
  .sah-plan-price-block { text-align: right; flex-shrink: 0; }
  .sah-plan-price { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 900; color: var(--accent); line-height: 1; }
  .sah-plan-price small { font-size: 0.65rem; color: #666; font-weight: 400; display: block; text-align: right; font-family: 'DM Sans', sans-serif; }
  .sah-plan-radio { width: 20px; height: 20px; accent-color: var(--accent); flex-shrink: 0; margin-top: 2px; cursor: pointer; }
  .sah-plan-body { padding: 0 20px 18px; border-top: 1px solid var(--border); }
  .sah-plan-features { list-style: none; padding: 0; margin: 14px 0; display: flex; flex-direction: column; gap: 7px; }
  .sah-plan-features li { display: flex; align-items: center; gap: 8px; font-size: 0.83rem; color: #3a3a3a; font-weight: 500; }
  .sah-plan-features li.no { color: #888; }
  .sah-ico-yes { color: #16a34a; font-size: 0.7rem; }
  .sah-ico-no { color: #ccc; font-size: 0.7rem; }
  .sah-plan-select-btn {
    width: 100%; padding: 10px; border: none; border-radius: var(--radius);
    background: var(--accent); color: #fff; font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: background 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 7px;
  }
  .sah-plan-select-btn:hover { background: var(--accent-dark); }
  .sah-plan-select-btn.selected { background: #3a3a3a; }

  /* ── Collapsible Terms box ── */
  .sah-terms-box {
    background: var(--card-white); border: 1.5px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 20px;
  }
  .sah-terms-box-head {
    background: #5a5a5a; padding: 14px 20px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    cursor: pointer; user-select: none;
  }
  .sah-terms-box-head-title {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Playfair Display', serif; font-size: 0.98rem; font-weight: 800; color: #fff;
  }
  .sah-terms-view-btn {
    flex-shrink: 0;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 16px; border-radius: 50px;
    border: 1.5px solid rgba(255,255,255,0.55); background: rgba(255,255,255,0.10);
    color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.80rem; font-weight: 700;
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .sah-terms-view-btn:hover { background: rgba(255,255,255,0.22); border-color: #fff; }
  .sah-terms-body {
    overflow: hidden;
    transition: max-height 0.38s ease, padding 0.25s ease;
  }
  .sah-terms-body.open  { max-height: 420px; overflow-y: auto; padding: 20px 22px; }
  .sah-terms-body.closed { max-height: 0; padding: 0 22px; }
  .sah-terms-body h4 { font-size: 0.85rem; font-weight: 800; color: var(--dark); margin: 14px 0 5px; text-transform: uppercase; letter-spacing: 0.4px; }
  .sah-terms-body h4:first-child { margin-top: 0; }
  .sah-terms-body p { font-size: 0.85rem; color: var(--mid); line-height: 1.7; margin-bottom: 10px; }
  .sah-terms-body ul { padding-left: 18px; margin-bottom: 10px; }
  .sah-terms-body ul li { font-size: 0.85rem; color: var(--mid); line-height: 1.7; margin-bottom: 4px; }

  /* ── Terms checkbox row ── */
  .sah-terms-row {
    background: var(--card-white); border: 1.5px solid var(--border);
    border-radius: var(--radius); padding: 16px 20px;
    display: flex; align-items: center; gap: 12px;
    font-size: 0.88rem; font-weight: 500; color: var(--mid); cursor: pointer;
  }
  .sah-terms-row.checked { border-color: var(--accent); background: rgba(201,98,26,0.05); }
  .sah-terms-row.err-border { border-color: #dc2626; background: #fff8f8; }
  .sah-terms-row input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--accent); cursor: pointer; flex-shrink: 0; }
  .sah-terms-row a { color: var(--accent); font-weight: 700; text-decoration: none; }
  .sah-terms-row a:hover { text-decoration: underline; }

  /* ── Forms ── */
  .sah-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .sah-field { display: flex; flex-direction: column; gap: 5px; }
  .sah-full { grid-column: 1 / -1; }
  .sah-field label {
    display: flex; align-items: center; gap: 6px;
    font-weight: 700; font-size: 0.74rem; text-transform: uppercase;
    letter-spacing: 0.6px; color: var(--mid);
  }
  .sah-field label i { color: var(--accent); font-size: 0.68rem; }
  .sah-req { color: var(--accent); font-size: 1rem; font-style: normal; }
  .sah-field input, .sah-field select, .sah-field textarea {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid rgba(0,0,0,0.11); border-radius: var(--radius);
    background: var(--card-white); font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem; color: var(--dark); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    -webkit-appearance: none; appearance: none;
  }
  .sah-field textarea { resize: vertical; min-height: 90px; }
  .sah-field input:focus, .sah-field select:focus, .sah-field textarea:focus {
    border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,98,26,0.14);
  }
  .sah-field input.err, .sah-field select.err, .sah-field textarea.err { border-color: #dc2626; background: #fff8f8; }
  .sah-field input[type="file"] { padding: 8px 12px; font-size: 0.83rem; cursor: pointer; background: var(--card-white); }
  .sah-field select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; cursor: pointer;
  }

  /* ── Errors ── */
  .sah-field-err {
    color: #dc2626; font-size: 0.76rem; font-weight: 600;
    display: flex; align-items: center; gap: 5px;
    margin-top: 3px; padding: 5px 10px;
    background: #fff0f0; border-radius: 5px;
    border-left: 3px solid #dc2626;
    animation: sah-err-in 0.18s ease;
  }
  @keyframes sah-err-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  .sah-field-err i { font-size: 0.7rem; flex-shrink: 0; }
  .sah-terms-err {
    color: #dc2626; font-size: 0.76rem; font-weight: 600;
    display: flex; align-items: center; gap: 5px;
    margin-top: 8px; padding: 6px 10px;
    background: #fff0f0; border-radius: 5px; border-left: 3px solid #dc2626;
  }
  .sah-group-err {
    color: #dc2626; font-size: 0.76rem; font-weight: 600;
    display: flex; align-items: center; gap: 5px;
    margin-top: 6px; padding: 5px 10px;
    background: #fff0f0; border-radius: 5px; border-left: 3px solid #dc2626;
    animation: sah-err-in 0.18s ease;
  }

  /* ── Prefix / suffix inputs ── */
  .sah-prefix-wrap { display: flex; align-items: stretch; border: 1.5px solid rgba(0,0,0,0.11); border-radius: var(--radius); overflow: hidden; background: var(--card-white); transition: border-color 0.15s, box-shadow 0.15s; }
  .sah-prefix-wrap:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,98,26,0.14); }
  .sah-prefix-wrap.err { border-color: #dc2626; background: #fff8f8; }
  .sah-prefix { background: rgba(0,0,0,0.06); border-right: 1.5px solid rgba(0,0,0,0.10); padding: 11px 12px; font-size: 0.92rem; font-weight: 700; color: var(--mid); white-space: nowrap; display: flex; align-items: center; }
  .sah-prefix-wrap input { border: none !important; box-shadow: none !important; border-radius: 0 !important; flex: 1; }
  .sah-prefix-wrap input:focus { border: none; box-shadow: none; outline: none; }
  .sah-suffix { background: rgba(0,0,0,0.04); border-left: 1.5px solid rgba(0,0,0,0.10); padding: 11px 14px; font-size: 0.85rem; font-weight: 600; color: var(--muted); white-space: nowrap; display: flex; align-items: center; min-width: 90px; }

  /* ── Password ── */
  .sah-pw-wrap { position: relative; }
  .sah-pw-wrap input { padding-right: 44px; }
  .sah-pw-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--muted); cursor: pointer; font-size: 0.9rem; padding: 4px; }
  .sah-pw-eye:hover { color: var(--accent); }

  /* ── Check groups ── */
  .sah-check-group { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; }
  .sah-check-group label {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 14px; border-radius: 6px;
    border: 1.5px solid var(--border); background: var(--card-white);
    font-size: 0.84rem; font-weight: 600; color: var(--mid);
    cursor: pointer; transition: all 0.14s;
    text-transform: none; letter-spacing: 0;
  }
  .sah-check-group label:hover:not(.disabled-opt) { border-color: var(--accent); color: var(--accent); }
  .sah-check-group label.disabled-opt { opacity: 0.4; cursor: not-allowed; }
  .sah-check-group input[type="checkbox"], .sah-check-group input[type="radio"] {
    width: auto; padding: 0; border: none; background: none;
    box-shadow: none; accent-color: var(--accent); transform: scale(1.1);
  }
  .sah-check-group label:has(input:checked) { border-color: var(--accent); background: rgba(201,98,26,0.08); color: var(--accent); }

  /* ── Secondary toggle ── */
  .sah-secondary-toggle {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 16px; border-radius: 6px;
    border: 1.5px solid var(--border); background: var(--card-white);
    font-size: 0.84rem; font-weight: 600; color: var(--mid);
    cursor: pointer; transition: all 0.14s; user-select: none;
  }
  .sah-secondary-toggle:hover { border-color: var(--accent); color: var(--accent); }
  .sah-secondary-toggle.active { border-color: var(--accent); background: rgba(201,98,26,0.08); color: var(--accent); }
  .sah-secondary-toggle input[type="checkbox"] { width: auto; padding: 0; border: none; background: none; box-shadow: none; accent-color: var(--accent); transform: scale(1.1); }
  .sah-secondary-cats-box { margin-top: 10px; padding: 14px 16px; background: var(--card-white); border: 1.5px solid var(--accent); border-radius: var(--radius); }

  /* ── File upload area ── */
  .sah-file-upload-zone {
    border: 2px dashed rgba(0,0,0,0.15); border-radius: var(--radius);
    padding: 16px; background: rgba(255,255,255,0.6); cursor: pointer;
    transition: border-color 0.15s;
  }
  .sah-file-upload-zone:hover { border-color: var(--accent); }
  .sah-file-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
  .sah-file-item {
    display: flex; align-items: center; gap: 10px; padding: 9px 12px;
    background: var(--card-white); border: 1px solid var(--border); border-radius: 6px;
    font-size: 0.82rem;
  }
  .sah-file-item-name { flex: 1; font-weight: 600; color: var(--dark); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sah-file-item-size { color: var(--muted); font-size: 0.76rem; flex-shrink: 0; }
  .sah-file-item-remove { background: none; border: none; cursor: pointer; color: var(--muted); padding: 2px 6px; border-radius: 4px; font-size: 0.78rem; flex-shrink: 0; }
  .sah-file-item-remove:hover { color: #dc2626; background: #fff0f0; }
  .sah-file-total { font-size: 0.76rem; color: var(--muted); margin-top: 6px; display: flex; align-items: center; gap: 5px; }
  .sah-file-total.warn { color: #dc2626; }

  /* ── Misc ── */
  .sah-qual-text-grid { display: flex; flex-direction: column; gap: 10px; }
  .sah-local-radius-row { display: flex; gap: 10px; align-items: stretch; }
  .sah-local-radius-row input { flex: 1; }
  .sah-local-radius-row select { width: 100px; flex-shrink: 0; }
  .sah-field-hint { font-size: 0.74rem; color: var(--muted); margin-top: 3px; display: flex; align-items: center; gap: 4px; }
  .sah-field-hint i { color: var(--accent); font-size: 0.68rem; }

  /* ── Social dropdown ── */
  .sah-add-others-wrap { position: relative; display: inline-block; }
  .sah-add-others-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 16px; border-radius: 6px;
    border: 1.5px dashed rgba(0,0,0,0.18); background: transparent;
    font-family: 'DM Sans', sans-serif; font-size: 0.84rem; font-weight: 600;
    color: var(--mid); cursor: pointer; transition: all 0.14s;
  }
  .sah-add-others-btn:hover { border-color: var(--accent); color: var(--accent); }
  .sah-add-others-dropdown {
    position: absolute; top: calc(100% + 6px); left: 0; z-index: 500;
    background: var(--card-white); border: 1.5px solid var(--border);
    border-radius: var(--radius); box-shadow: var(--shadow-md);
    min-width: 200px; overflow: hidden;
  }
  .sah-add-others-option {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; font-size: 0.85rem; font-weight: 600;
    color: var(--mid); cursor: pointer; transition: background 0.12s;
    border: none; background: none; width: 100%; text-align: left; font-family: 'DM Sans', sans-serif;
  }
  .sah-add-others-option:hover { background: rgba(201,98,26,0.07); color: var(--accent); }
  .sah-add-others-option i { color: var(--accent); width: 16px; text-align: center; }
  .sah-added-socials { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }

  /* ── Nav ── */
  .sah-form-nav-wrap {
    background: var(--card-gray); border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md); margin-top: 20px;
    padding: 20px 28px; display: flex; align-items: center;
    justify-content: space-between; gap: 16px;
  }
  .sah-nav-prev {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px; border-radius: 50px;
    border: 1.5px solid rgba(0,0,0,0.15); background: var(--card-white);
    color: var(--mid); font-weight: 700; font-size: 0.88rem;
    font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s;
  }
  .sah-nav-prev:hover { border-color: var(--accent); color: var(--accent); }
  .sah-nav-counter { text-align: center; font-size: 0.8rem; font-weight: 700; color: var(--muted); white-space: nowrap; }
  .sah-nav-counter strong { color: var(--accent); font-size: 1rem; }
  .sah-nav-progress { height: 4px; background: rgba(0,0,0,0.08); border-radius: 2px; margin-top: 6px; overflow: hidden; }
  .sah-nav-progress-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.3s; }
  .sah-nav-next {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 28px; border-radius: 50px;
    border: none; background: var(--accent); color: #fff;
    font-weight: 700; font-size: 0.92rem; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: background 0.15s, transform 0.15s;
    box-shadow: 0 6px 20px -4px rgba(201,98,26,0.45);
  }
  .sah-nav-next:hover:not(:disabled) { background: var(--accent-dark); transform: translateY(-1px); }
  .sah-nav-next:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
  .sah-nav-submit { background: #3a3a3a; box-shadow: 0 6px 20px -4px rgba(0,0,0,0.3); }
  .sah-nav-submit:hover:not(:disabled) { background: #1e1e1e; }

  .sah-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: sah-spin 0.7s linear infinite; }
  @keyframes sah-spin { to { transform: rotate(360deg); } }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .sah-reg-panel { max-width: 100%; padding: 0 16px 80px; }
    .sah-step-card-body { padding: 24px 20px; }
    .sah-step-card-head { padding: 20px 20px 14px; }
  }
  @media (max-width: 700px) {
    .sah-plan-grid { grid-template-columns: 1fr; }
    .sah-form-grid { grid-template-columns: 1fr; }
    .sah-full { grid-column: 1; }
    .sah-step-card-body { padding: 20px 16px; }
    .sah-reg-hero-inner { padding: 36px 16px; }
    .sah-rhdr-inner { padding: 0 16px; }
    .sah-form-nav-wrap { flex-wrap: wrap; }
    .sah-terms-box-head { flex-wrap: wrap; gap: 8px; }
  }
`;

// ── Config ────────────────────────────────────────────────────────────────────
const API_URL = 'http://localhost:5000/api';
const MAX_TOTAL_UPLOAD_MB = 100;
const MAX_TOTAL_UPLOAD_BYTES = MAX_TOTAL_UPLOAD_MB * 1024 * 1024;

const STEPS = [
  { title: 'Select Plan',            label: 'Select Plan', desc: 'Choose a listing plan for your profile',                    icon: 'fa-layer-group'    },
  { title: 'Account Setup',          label: 'Account',     desc: 'Create your provider account credentials',                  icon: 'fa-user-circle'    },
  { title: 'Identity & Trust',       label: 'Identity',    desc: 'Build trust with your qualifications and bio',              icon: 'fa-id-card'        },
  { title: 'Services Offered',       label: 'Services',    desc: 'Tell families what you offer',                              icon: 'fa-briefcase'      },
  { title: 'Location & Reach',       label: 'Location',    desc: 'Where can you serve families?',                            icon: 'fa-map-marker-alt' },
  { title: 'Pricing & Availability', label: 'Pricing',     desc: 'Set your rates and schedule',                              icon: 'fa-calendar-alt'   },
  { title: 'Contact Details',        label: 'Contact',     desc: 'How families can reach you',                               icon: 'fa-phone'          },
  { title: 'Terms & Conditions',     label: 'Terms',       desc: 'Review and agree to our terms before creating your profile', icon: 'fa-file-contract' },
];
const TOTAL = STEPS.length;

const PLANS = [
  {
    id: 'free', name: 'Community Member', desc: 'Basic profile — always free', price: 'R0',
    param: 'Free Listing – basic profile',
    features: [
      { t: 'Public profile listing', y: true },
      { t: '1 service category', y: true },
      { t: 'Basic contact form', y: true },
      { t: 'Direct contact details visible', y: false },
      { t: 'Featured placement', y: false },
    ],
    cta: 'Get Started Free',
  },
  {
    id: 'pro', name: 'Trusted Provider', desc: 'Full profile + direct contact details', price: 'R149',
    param: 'Professional Listing – R149/month (full contact, direct enquiries)',
    highlight: true,
    features: [
      { t: 'Everything in Community', y: true },
      { t: 'Direct phone & email visible', y: true },
      { t: 'Up to 3 service categories', y: true },
      { t: 'Verified badge on profile', y: true },
      { t: 'Priority in search results', y: true },
    ],
    cta: 'Start Trusted Plan',
  },
  {
    id: 'featured', name: 'Deluxe Package', desc: '3-month campaign · maximum exposure', price: 'R399',
    param: 'Deluxe Package – R399/month (3-month campaign, max exposure)',
    features: [
      { t: '24x Billboard banners', y: true },
      { t: '24x Leaderboard banners', y: true },
      { t: '24x Skyscrapers / side panels', y: true },
      { t: '1x Business listing', y: true },
      { t: '6x Newsletter banner ads', y: true },
      { t: '6x Facebook post / reel', y: true },
      { t: '6x Instagram posts / reels', y: true },
      { t: '4x Newsletter ad posting', y: true },
      { t: '2x Full page ad in PDF per magazine', y: true },
      { t: '1x Native article per month', y: true },
    ],
    cta: 'Get the Deluxe Package',
  },
];

const PRICING_UNIT_MAP = { 'Hourly': '/hr', 'Per package': '/package', 'Per term': '/term', 'Custom quote': '' };
const TIME_SLOT_REGEX = /^(\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2})(\s*,\s*\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2})*$/;

const EXTRA_SOCIALS = [
  { key: 'instagram', label: 'Instagram',   icon: 'fab fa-instagram',   placeholder: 'https://instagram.com/yourprofile' },
  { key: 'linkedin',  label: 'LinkedIn',    icon: 'fab fa-linkedin-in', placeholder: 'https://linkedin.com/in/yourname'  },
  { key: 'tiktok',    label: 'TikTok',      icon: 'fab fa-tiktok',      placeholder: 'https://tiktok.com/@yourhandle'    },
  { key: 'youtube',   label: 'YouTube',     icon: 'fab fa-youtube',     placeholder: 'https://youtube.com/@yourchannel' },
  { key: 'twitter',   label: 'X / Twitter', icon: 'fab fa-x-twitter',   placeholder: 'https://x.com/yourhandle'         },
];

const ALL_CATEGORIES = [
  'Tutor', 'Therapist', 'Curriculum Provider',
  'Online / Hybrid School', 'Educational Consultant', 'Extracurricular / Enrichment',
];

const SECONDARY_CAT_MAP = {
  'Tutor':       'Tutor',
  'Therapist':   'Therapist',
  'Curriculum':  'Curriculum Provider',
  'School':      'Online / Hybrid School',
  'Consultant':  'Educational Consultant',
  'Enrichment':  'Extracurricular / Enrichment',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const planToTier = (param) => {
  if (param?.includes('R399') || param?.includes('Deluxe'))       return 'featured';
  if (param?.includes('R149') || param?.includes('Professional')) return 'pro';
  return 'free';
};

const catToSlug = (cat) => {
  const m = {
    'Tutor': 'tutor', 'Therapist': 'therapist', 'Curriculum Provider': 'curriculum',
    'Online / Hybrid School': 'school', 'Educational Consultant': 'consultant',
    'Extracurricular / Enrichment': 'extracurricular',
  };
  return m[cat] || 'tutor';
};

const formatBytes = (bytes) => {
  if (bytes < 1024)          return bytes + ' B';
  if (bytes < 1024 * 1024)   return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

function saveToLocalStorage({ userId, email, fullName, tier, newProvider }) {
  try {
    const users = JSON.parse(localStorage.getItem('sah_users') || '[]');
    if (!users.find(u => u.email?.toLowerCase() === email.toLowerCase())) {
      users.push({
        id: userId, email: email.toLowerCase(), role: 'PROVIDER',
        accountType: 'provider', name: fullName,
        registered: new Date().toISOString(), lastLogin: new Date().toISOString(),
      });
      localStorage.setItem('sah_users', JSON.stringify(users));
    }
    const providers = JSON.parse(localStorage.getItem('sah_providers') || '[]');
    providers.push(newProvider);
    localStorage.setItem('sah_providers', JSON.stringify(providers));

    const authLogs = JSON.parse(localStorage.getItem('sah_auth_logs') || '[]');
    authLogs.unshift({ userId, email: email.toLowerCase(), role: 'PROVIDER', event: 'REGISTER', timestamp: new Date().toISOString() });
    localStorage.setItem('sah_auth_logs', JSON.stringify(authLogs.slice(0, 500)));

    localStorage.setItem('sah_current_user', JSON.stringify({ role: 'client', email, id: userId, name: fullName, plan: tier }));
    localStorage.setItem('sah_token', 'local_' + userId);
  } catch (e) {
    console.warn('localStorage save error:', e);
  }
}

const FieldErr = ({ msg }) => msg
  ? <div className="sah-field-err"><i className="fas fa-exclamation-circle" /> {msg}</div>
  : null;

// ══════════════════════════════════════════════════════════════════════════════
//  COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const Registration = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { showNotification } = useNotification();

  const [step, setStep]                   = useState(1);
  const [data, setData]                   = useState({ listingPlan: 'Free Listing – basic profile', terms: false });
  const [fieldErrors, setFieldErrors]     = useState({});
  const [showPw, setShowPw]               = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const [timeSlotErr, setTimeSlotErr]     = useState('');
  const [showSocialDropdown, setShowSocialDropdown] = useState(false);
  const [addedSocials, setAddedSocials]   = useState([]);
  const [termsOpen, setTermsOpen]         = useState(false);

  // ── REMOVED: apiOnline state and health-check useEffect ──
  // The banner text "Connected to database..." has been removed.
  // Submit now tries the API directly with try/catch instead of
  // relying on a pre-checked apiOnline flag.

  const [certFiles, setCertFiles]             = useState([]);
  const [clearanceFiles, setClearanceFiles]   = useState([]);

  const topRef            = useRef(null);
  const socialDropRef     = useRef(null);
  const certInputRef      = useRef(null);
  const clearanceInputRef = useRef(null);

  // ── Inject CSS + fonts ──
  useEffect(() => {
    injectHead();
    if (!document.getElementById('sah-reg-css')) {
      const s = document.createElement('style');
      s.id = 'sah-reg-css'; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  // ── Pre-fill plan from URL ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    if (plan) setData(p => ({ ...p, listingPlan: decodeURIComponent(plan) }));
  }, [location.search]);

  // ── Scroll + clear errors on step change ──
  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setFieldErrors({});
    setTimeSlotErr('');
  }, [step]);

  // ── Close social dropdown on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (socialDropRef.current && !socialDropRef.current.contains(e.target))
        setShowSocialDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Field helpers ──
  const set = (name, value) => {
    setData(p => ({ ...p, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleMulti = (name, value, checked) => {
    setData(p => {
      const cur = p[name] || [];
      return { ...p, [name]: checked ? [...cur, value] : cur.filter(v => v !== value) };
    });
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleServiceArea = (value) => {
    setData(p => {
      const cur  = p.serviceAreas || [];
      const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value];
      return { ...p, serviceAreas: next };
    });
    setFieldErrors(prev => ({ ...prev, serviceAreas: '' }));
  };

  const addSocial    = (key) => { if (!addedSocials.includes(key)) setAddedSocials(prev => [...prev, key]); setShowSocialDropdown(false); };
  const removeSocial = (key) => { setAddedSocials(prev => prev.filter(k => k !== key)); set(key, ''); };

  // ── File helpers (PDF only) ──
  const totalFileBytes = (files) => files.reduce((acc, f) => acc + f.size, 0);

  const handleCertFilesAdd = (e) => {
    const incoming = Array.from(e.target.files || []);
    const pdfOnly  = incoming.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfOnly.length < incoming.length)
      setFieldErrors(prev => ({ ...prev, certFiles: 'Only PDF files are allowed for certificates.' }));
    const combined = [...certFiles, ...pdfOnly];
    if (totalFileBytes(combined) > MAX_TOTAL_UPLOAD_BYTES) {
      setFieldErrors(prev => ({ ...prev, certFiles: `Total file size cannot exceed ${MAX_TOTAL_UPLOAD_MB}MB.` }));
      return;
    }
    setCertFiles(combined);
    setFieldErrors(prev => ({ ...prev, certFiles: '' }));
    if (certInputRef.current) certInputRef.current.value = '';
  };

  const removeCertFile = (idx) => setCertFiles(prev => prev.filter((_, i) => i !== idx));

  const handleClearanceFilesAdd = (e) => {
    const incoming = Array.from(e.target.files || []);
    const pdfOnly  = incoming.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfOnly.length < incoming.length)
      setFieldErrors(prev => ({ ...prev, clearanceFiles: 'Only PDF files are allowed for police clearance.' }));
    const combined = [...clearanceFiles, ...pdfOnly];
    if (totalFileBytes([...certFiles, ...combined]) > MAX_TOTAL_UPLOAD_BYTES) {
      setFieldErrors(prev => ({ ...prev, clearanceFiles: `Total combined file size cannot exceed ${MAX_TOTAL_UPLOAD_MB}MB.` }));
      return;
    }
    setClearanceFiles(combined);
    setFieldErrors(prev => ({ ...prev, clearanceFiles: '' }));
    if (clearanceInputRef.current) clearanceInputRef.current.value = '';
  };

  const removeClearanceFile = (idx) => setClearanceFiles(prev => prev.filter((_, i) => i !== idx));

  // ── Validation ──
  const validateStep = () => {
    const errs = {};
    if (step === 2) {
      if (!data.fullName?.trim()) errs.fullName = 'Please enter your full name or business name.';
      if (!data.email?.trim() || !/^\S+@\S+\.\S+$/.test(data.email)) errs.email = 'Enter a valid email address (e.g. name@example.com).';
      if (!data.password || data.password.length < 8) errs.password = 'Password must be at least 8 characters long.';
      if (!data.accountType) errs.accountType = 'Please select whether you are an individual or organisation.';
    }
    if (step === 3) {
      if (!data.bio?.trim()) errs.bio = 'Please write a short bio.';
      if (!data.experience && data.experience !== 0) errs.experience = 'Please enter your years of experience.';
    }
    if (step === 4) {
      if (!data.primaryCat) errs.primaryCat = 'Please select your primary service category.';
      if (!data.serviceTitle?.trim()) errs.serviceTitle = 'Please enter a title for your service.';
      if (!data.serviceDesc?.trim()) errs.serviceDesc = 'Please describe the services you offer.';
      if (!data.subjects?.trim()) errs.subjects = 'Please list the subjects or specialisations you offer.';
      if (!data.ageGroups?.length) errs.ageGroups = 'Please select at least one age group.';
      if (!data.deliveryMode) errs.deliveryMode = 'Please select how you deliver your services.';
    }
    if (step === 5) {
      if (!data.city?.trim()) errs.city = 'Please enter your city.';
      if (!data.province) errs.province = 'Please select your province.';
      if (!data.serviceAreas?.length) errs.serviceAreas = 'Please select at least one service area.';
    }
    if (step === 6) {
      if (!data.pricingModel) errs.pricingModel = 'Please select how you charge for your services.';
      if (!data.daysAvailable?.length) errs.daysAvailable = 'Please select at least one day.';
      if (!data.timeSlots?.trim()) errs.timeSlots = 'Please enter your available time slots.';
      else if (!TIME_SLOT_REGEX.test(data.timeSlots.trim())) errs.timeSlots = 'Use the format HH:MM - HH:MM.';
    }
    if (step === 7) {
      if (!data.phoneLocal?.trim()) errs.phoneLocal = 'Please enter your phone number.';
      else if (data.phoneLocal.replace(/\D/g, '').length !== 9) errs.phoneLocal = 'Enter exactly 9 digits after +27.';
      if (!data.inquiryEmail?.trim() || !/^\S+@\S+\.\S+$/.test(data.inquiryEmail)) errs.inquiryEmail = 'Please enter a valid email for enquiries.';
    }
    if (step === 8) {
      if (!data.terms) errs.terms = 'Please tick the box to agree to the Terms and Community Guidelines before creating your profile.';
    }
    return errs;
  };

  const next = () => {
    const errs = validateStep();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setTimeout(() => {
        const firstErr = document.querySelector('.sah-field-err, .sah-group-err, .sah-terms-err');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setFieldErrors({});
    if (step < TOTAL) { setStep(s => s + 1); return; }
    submit();
  };

  const prev = () => { setFieldErrors({}); setStep(s => s - 1); };

  // ── Submit ────────────────────────────────────────────────────────────────
  // NOTE: apiOnline state removed. We now probe the API directly inside submit()
  // using try/catch. If the API is reachable we use it; otherwise we fall through
  // to the localStorage fallback. Both paths call navigate('/client-dashboard').
  const submit = async () => {
    setSubmitting(true);
    setFieldErrors({});

    const tier            = planToTier(data.listingPlan);
    const fullPhone       = data.phoneLocal    ? '+27' + data.phoneLocal.replace(/\D/g, '')    : '';
    const fullWhatsapp    = data.whatsappLocal ? '+27' + data.whatsappLocal.replace(/\D/g, '') : fullPhone;
    const priceUnit       = PRICING_UNIT_MAP[data.pricingModel] || '';
    const priceDisplay    = data.startingPrice ? `R${data.startingPrice}${priceUnit}` : 'Contact';
    const qualDegree      = data.qualDegree || '';
    const qualCerts       = data.qualCerts  || '';
    const qualMemberships = data.qualMemberships || '';
    const certsCombined   = [qualDegree, qualCerts].filter(Boolean).join(' | ');
    const svcAreas        = data.serviceAreas || [];
    let serviceAreaType   = 'national';
    if (svcAreas.includes('Local') && svcAreas.length === 1)            serviceAreaType = 'local';
    else if (svcAreas.includes('Online only') && svcAreas.length === 1) serviceAreaType = 'online';
    else if (svcAreas.includes('Local'))                                serviceAreaType = 'local';

    const certFileNames      = certFiles.map(f => f.name);
    const clearanceFileNames = clearanceFiles.map(f => f.name);

    const providerId  = 'prov_' + Date.now();
    const newProvider = {
      id: providerId,
      name: data.fullName || '',
      email: (data.email || '').toLowerCase(),
      accountType: data.accountType || 'Individual Provider',
      plan: tier, listingPlan: tier, tier,
      badge: tier === 'featured' ? 'featured' : tier === 'pro' ? 'verified' : null,
      status: 'pending',
      registered: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      category: catToSlug(data.primaryCat),
      primaryCategory: data.primaryCat || '',
      secondaryCategories: data.secondaryCats || [],
      bio: data.bio || '',
      experience: data.experience || '',
      degrees: qualDegree,
      certifications: certsCombined,
      qualCerts,
      certTextEntry: data.qualCerts || '',
      certDocuments: certFileNames,
      memberships: qualMemberships,
      clearanceText: data.clearanceText || '',
      clearanceDocuments: clearanceFileNames,
      tags: data.subjects ? data.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
      languages: data.languages || [],
      serviceTitle: data.serviceTitle || '',
      serviceDesc: data.serviceDesc || '',
      subjects: data.subjects || '',
      ageGroups: data.ageGroups || [],
      deliveryMode: data.deliveryMode || '',
      delivery: data.deliveryMode || '',
      location: data.city ? `${data.city}, ${data.province}` : '',
      city: data.city || '',
      province: data.province || '',
      serviceAreas: svcAreas,
      serviceAreaType,
      radius: data.localRadiusNum ? `${data.localRadiusNum} ${data.localRadiusUnit || 'km'}` : '',
      pricingModel: data.pricingModel || '',
      startingPrice: priceDisplay, priceFrom: priceDisplay,
      availabilityDays: (data.daysAvailable || []).map(d => d.slice(0, 3)),
      availabilityNotes: data.timeSlots || '',
      phone: fullPhone, whatsapp: fullWhatsapp,
      contactEmail: data.inquiryEmail || data.email || '',
      inquiryEmail: data.inquiryEmail || '',
      website: data.website || '',
      facebook: data.facebook || '', instagram: data.instagram || '',
      linkedin: data.linkedin || '', tiktok: data.tiktok || '',
      twitter: data.twitter || '', youtube: data.youtube || '',
      image: data.profilePhoto || null, photo: data.profilePhoto || null,
      rating: null, reviewCount: 0,
      reviews: { average: 0, count: 0, items: [] },
      listingPublic: true, publicToggle: true,
    };

    // ── Try real API (probe + register in one try/catch) ──────────────────
    try {
      const healthRes = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(3000) });

      if (healthRes.ok) {
        const userRes = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email:       data.email.trim().toLowerCase(),
            password:    data.password,
            role:        'PROVIDER',
            name:        data.fullName,
            accountType: data.accountType || 'Individual Provider',
          }),
        });
        const userData = await userRes.json();
        if (!userRes.ok) {
          setFieldErrors({ _submit: userData.message || 'Failed to create account.' });
          setSubmitting(false);
          return;
        }
        const dbUserId = userData.user.id;

        const formData = new FormData();
        formData.append('providerData', JSON.stringify({
          userId: dbUserId,
          fullName: data.fullName,
          accountType: data.accountType || 'Individual Provider',
          bio: data.bio,
          experience: parseInt(data.experience) || 0,
          primaryCategory: data.primaryCat,
          secondaryCategories: data.secondaryCats || [],
          serviceTitle: data.serviceTitle,
          serviceDesc: data.serviceDesc,
          subjects: data.subjects,
          ageGroups: data.ageGroups || [],
          deliveryMode: data.deliveryMode,
          city: data.city,
          province: data.province,
          serviceAreaType,
          radius: data.localRadiusNum ? parseInt(data.localRadiusNum) : null,
          pricingModel: data.pricingModel,
          startingPrice: priceDisplay,
          availabilityDays: (data.daysAvailable || []).map(d => d.slice(0, 3)),
          availabilityNotes: data.timeSlots,
          phone: fullPhone,
          whatsapp: fullWhatsapp,
          inquiryEmail: data.inquiryEmail,
          website: data.website || null,
          facebook: data.facebook || null,
          instagram: data.instagram || null,
          linkedin: data.linkedin || null,
          tiktok: data.tiktok || null,
          twitter: data.twitter || null,
          degrees: qualDegree,
          certifications: certsCombined,
          certTextEntry: data.qualCerts || '',
          memberships: qualMemberships,
          clearanceText: data.clearanceText || null,
          listingPlan: tier,
          languages: data.languages || [],
        }));
        certFiles.forEach((file, i)      => formData.append(`certFile_${i}`, file, file.name));
        clearanceFiles.forEach((file, i) => formData.append(`clearanceFile_${i}`, file, file.name));

        const providerRes  = await fetch(`${API_URL}/providers`, { method: 'POST', body: formData });
        const providerData = await providerRes.json();
        if (!providerRes.ok) {
          setFieldErrors({ _submit: providerData.message || 'Failed to create provider profile.' });
          setSubmitting(false);
          return;
        }

        saveToLocalStorage({
          userId: dbUserId, email: data.email, fullName: data.fullName, tier,
          newProvider: { ...newProvider, id: providerData.provider?.id || providerId, dbId: providerData.provider?.id },
        });
        localStorage.setItem('sah_current_user', JSON.stringify({
          role: 'client', email: data.email, id: dbUserId, name: data.fullName, plan: tier,
        }));

        showNotification?.('✅ Registration successful! Your profile is pending admin approval.', 'success');
        navigate('/client-dashboard');
        return;
      }
    } catch (apiErr) {
      // API unreachable — fall through to localStorage fallback below
    }

    // ── localStorage fallback ─────────────────────────────────────────────
    const existingUsers     = JSON.parse(localStorage.getItem('sah_users') || '[]');
    const existingProviders = JSON.parse(localStorage.getItem('sah_providers') || '[]');
    const emailLower        = data.email.trim().toLowerCase();

    if (
      existingUsers.find(u => u.email?.toLowerCase() === emailLower) ||
      existingProviders.find(p => p.email?.toLowerCase() === emailLower)
    ) {
      setFieldErrors({ _submit: 'An account with this email already exists.' });
      setSubmitting(false);
      return;
    }

    const localUserId = 'prov_' + Date.now();
    saveToLocalStorage({
      userId: localUserId, email: data.email, fullName: data.fullName, tier,
      newProvider: { ...newProvider, id: localUserId },
    });

    showNotification?.('✅ Registration successful! Your profile is pending admin approval.', 'success');
    navigate('/client-dashboard');
  };

  const fe = fieldErrors;

  // ── Derived ───────────────────────────────────────────────────────────────
  const allCertBytes = totalFileBytes([...certFiles, ...clearanceFiles]);
  const overLimit    = allCertBytes > MAX_TOTAL_UPLOAD_BYTES;
  const primaryFull  = data.primaryCat || '';

  // ─────────────────────────────────────────────────────────────────────────
  //  STEP RENDERERS
  // ─────────────────────────────────────────────────────────────────────────

  // Step 1 — Select Plan (banner removed entirely)
  const renderStep1 = () => (
    <div className="sah-plan-grid" style={{ marginTop: 8 }}>
      {PLANS.map(plan => {
        const selected = data.listingPlan === plan.param;
        return (
          <div key={plan.id} className={`sah-plan-card${selected ? ' selected' : ''}`} onClick={() => set('listingPlan', plan.param)}>
            <div className="sah-plan-card-head">
              <div>
                <div className="sah-plan-card-name">{plan.name}</div>
                <div className="sah-plan-card-desc">{plan.desc}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div className="sah-plan-price-block">
                  <div className="sah-plan-price">{plan.price} <small>/month</small></div>
                </div>
                <input type="radio" className="sah-plan-radio" name="listingPlan" value={plan.param}
                  checked={selected} onChange={() => set('listingPlan', plan.param)}
                  onClick={e => e.stopPropagation()} />
              </div>
            </div>
            <div className="sah-plan-body">
              <ul className="sah-plan-features">
                {plan.features.map((f, i) => (
                  <li key={i} className={f.y ? '' : 'no'}>
                    {f.y ? <i className="fas fa-check sah-ico-yes" /> : <i className="fas fa-times sah-ico-no" />}
                    {f.t}
                  </li>
                ))}
              </ul>
              <button className={`sah-plan-select-btn${selected ? ' selected' : ''}`}
                onClick={e => { e.stopPropagation(); set('listingPlan', plan.param); }}>
                {selected ? <><i className="fas fa-check" /> Selected</> : plan.cta}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Step 2 — Account Setup
  const renderStep2 = () => (
    <div className="sah-form-grid">
      <div className="sah-field sah-full">
        <label><i className="fas fa-user" /> Full Name / Business Name <em className="sah-req">*</em></label>
        <input type="text" value={data.fullName || ''} placeholder="e.g. Thando Mkhize or Bright Minds Learning"
          className={fe.fullName ? 'err' : ''} onChange={e => set('fullName', e.target.value)} />
        <FieldErr msg={fe.fullName} />
      </div>
      <div className="sah-field">
        <label><i className="fas fa-envelope" /> Email Address <em className="sah-req">*</em></label>
        <input type="email" value={data.email || ''} placeholder="name@example.com"
          className={fe.email ? 'err' : ''} onChange={e => set('email', e.target.value)} />
        <FieldErr msg={fe.email} />
      </div>
      <div className="sah-field">
        <label><i className="fas fa-lock" /> Password <em className="sah-req">*</em></label>
        <div className="sah-pw-wrap">
          <input type={showPw ? 'text' : 'password'} value={data.password || ''} placeholder="Min. 8 characters"
            className={fe.password ? 'err' : ''} onChange={e => set('password', e.target.value)} />
          <button type="button" className="sah-pw-eye" onClick={() => setShowPw(s => !s)}>
            <i className={`far fa-eye${showPw ? '-slash' : ''}`} />
          </button>
        </div>
        <FieldErr msg={fe.password} />
      </div>
      <div className="sah-field sah-full">
        <label><i className="fas fa-building" /> Account Type <em className="sah-req">*</em></label>
        <select value={data.accountType || ''} className={fe.accountType ? 'err' : ''} onChange={e => set('accountType', e.target.value)}>
          <option value="">-- Select --</option>
          <option>Individual Provider</option>
          <option>Organisation / Company</option>
        </select>
        <FieldErr msg={fe.accountType} />
      </div>
    </div>
  );

  // Step 3 — Identity & Trust
  const renderStep3 = () => (
    <div className="sah-form-grid">
      <div className="sah-field">
        <label><i className="fas fa-upload" /> Profile Photo / Logo</label>
        <input type="file" accept="image/*" onChange={e => {
          const file = e.target.files[0]; if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => set('profilePhoto', ev.target.result);
          reader.readAsDataURL(file);
        }} />
        {data.profilePhoto && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={data.profilePhoto} alt="Preview" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }} />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)' }}><i className="fas fa-check-circle" /> Photo selected</div>
              <button type="button" onClick={() => set('profilePhoto', null)} style={{ fontSize: '0.72rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }}>Remove</button>
            </div>
          </div>
        )}
      </div>

      <div className="sah-field">
        <label><i className="fas fa-hashtag" /> Years of Experience <em className="sah-req">*</em></label>
        <input type="number" value={data.experience ?? ''} placeholder="e.g. 8" min={0} max={60}
          className={fe.experience ? 'err' : ''} onChange={e => set('experience', e.target.value)} />
        <FieldErr msg={fe.experience} />
      </div>

      <div className="sah-field sah-full">
        <label><i className="fas fa-align-left" /> Short Bio (150–250 words) <em className="sah-req">*</em></label>
        <textarea value={data.bio || ''} placeholder="Tell families about your teaching philosophy, experience, and approach..."
          className={fe.bio ? 'err' : ''} onChange={e => set('bio', e.target.value)} />
        <FieldErr msg={fe.bio} />
      </div>

      <div className="sah-field sah-full">
        <label><i className="fas fa-certificate" /> Qualifications / Certifications</label>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--muted)', marginBottom: 8 }}>
            <i className="fas fa-edit" style={{ color: 'var(--accent)', marginRight: 4 }} /> Text Entry (optional)
          </div>
          <div className="sah-qual-text-grid">
            <input type="text" value={data.qualDegree || ''} placeholder="Degree / Diploma (e.g. BEd Honours)" onChange={e => set('qualDegree', e.target.value)} />
            <input type="text" value={data.qualCerts  || ''} placeholder="Certifications (e.g. SACE Registered)" onChange={e => set('qualCerts',  e.target.value)} />
            <input type="text" value={data.qualMemberships || ''} placeholder="Memberships (e.g. SA Curriculum Association)" onChange={e => set('qualMemberships', e.target.value)} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--muted)', marginBottom: 8 }}>
            <i className="fas fa-file-pdf" style={{ color: 'var(--accent)', marginRight: 4 }} /> PDF Documents (optional)
          </div>
          <div className="sah-file-upload-zone" onClick={() => certInputRef.current?.click()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.4rem', color: 'var(--accent)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark)' }}>Click to upload certificate PDFs</div>
                <div style={{ fontSize: '0.76rem', marginTop: 2, color: 'var(--muted)' }}>PDF files only · Multiple files allowed · Combined limit {MAX_TOTAL_UPLOAD_MB}MB</div>
              </div>
            </div>
            <input ref={certInputRef} type="file" accept="application/pdf,.pdf" multiple style={{ display: 'none' }} onChange={handleCertFilesAdd} />
          </div>
          {fe.certFiles && <div className="sah-field-err" style={{ marginTop: 8 }}><i className="fas fa-exclamation-circle" /> {fe.certFiles}</div>}
          {certFiles.length > 0 && (
            <div className="sah-file-list">
              {certFiles.map((f, i) => (
                <div key={i} className="sah-file-item">
                  <i className="fas fa-file-pdf" style={{ color: '#dc2626', fontSize: '1rem', flexShrink: 0 }} />
                  <span className="sah-file-item-name">{f.name}</span>
                  <span className="sah-file-item-size">{formatBytes(f.size)}</span>
                  <button type="button" className="sah-file-item-remove" onClick={() => removeCertFile(i)}><i className="fas fa-times" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sah-field sah-full">
        <label><i className="fas fa-shield-alt" /> Police Clearance (optional)</label>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--muted)', marginBottom: 8 }}>
            <i className="fas fa-edit" style={{ color: 'var(--accent)', marginRight: 4 }} /> Text Entry (optional)
          </div>
          <input type="text" value={data.clearanceText || ''} placeholder="e.g. Verified 2024 — Certificate No. 12345678" onChange={e => set('clearanceText', e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--muted)', marginBottom: 8 }}>
            <i className="fas fa-file-pdf" style={{ color: 'var(--accent)', marginRight: 4 }} /> PDF Documents (optional)
          </div>
          <div className="sah-file-upload-zone" onClick={() => clearanceInputRef.current?.click()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.4rem', color: 'var(--accent)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark)' }}>Click to upload police clearance PDFs</div>
                <div style={{ fontSize: '0.76rem', marginTop: 2, color: 'var(--muted)' }}>PDF files only · Multiple files allowed</div>
              </div>
            </div>
            <input ref={clearanceInputRef} type="file" accept="application/pdf,.pdf" multiple style={{ display: 'none' }} onChange={handleClearanceFilesAdd} />
          </div>
          {fe.clearanceFiles && <div className="sah-field-err" style={{ marginTop: 8 }}><i className="fas fa-exclamation-circle" /> {fe.clearanceFiles}</div>}
          {clearanceFiles.length > 0 && (
            <div className="sah-file-list">
              {clearanceFiles.map((f, i) => (
                <div key={i} className="sah-file-item">
                  <i className="fas fa-file-pdf" style={{ color: '#dc2626', fontSize: '1rem', flexShrink: 0 }} />
                  <span className="sah-file-item-name">{f.name}</span>
                  <span className="sah-file-item-size">{formatBytes(f.size)}</span>
                  <button type="button" className="sah-file-item-remove" onClick={() => removeClearanceFile(i)}><i className="fas fa-times" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        {(certFiles.length > 0 || clearanceFiles.length > 0) && (
          <div className={`sah-file-total${overLimit ? ' warn' : ''}`}>
            <i className={`fas ${overLimit ? 'fa-exclamation-triangle' : 'fa-hdd'}`} />
            Total uploaded: <strong>{formatBytes(allCertBytes)}</strong> / {MAX_TOTAL_UPLOAD_MB}MB limit
            {overLimit && ' — Please remove some files.'}
          </div>
        )}
      </div>

      <div className="sah-field sah-full">
        <label><i className="fas fa-check-square" /> Languages Spoken</label>
        <div className="sah-check-group">
          {['English','Afrikaans','isiZulu','isiXhosa','Sepedi','Setswana','Sesotho','Xitsonga','SiSwati','Tshivenda','isiNdebele','Other'].map(lang => (
            <label key={lang}>
              <input type="checkbox" value={lang} checked={(data.languages || []).includes(lang)} onChange={e => toggleMulti('languages', lang, e.target.checked)} />
              {lang}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 4 — Services
  const renderStep4 = () => (
    <div className="sah-form-grid">
      <div className="sah-field">
        <label><i className="fas fa-chevron-down" /> Primary Category <em className="sah-req">*</em></label>
        <select value={data.primaryCat || ''} className={fe.primaryCat ? 'err' : ''}
          onChange={e => {
            const newPrimary = e.target.value;
            const filteredSecondary = (data.secondaryCats || []).filter(sc => (SECONDARY_CAT_MAP[sc] || sc) !== newPrimary);
            setData(p => ({ ...p, primaryCat: newPrimary, secondaryCats: filteredSecondary }));
            setFieldErrors(prev => ({ ...prev, primaryCat: '' }));
          }}>
          <option value="">-- Select --</option>
          {ALL_CATEGORIES.map(o => <option key={o}>{o}</option>)}
        </select>
        <FieldErr msg={fe.primaryCat} />
      </div>

      <div className="sah-field">
        <label><i className="fas fa-layer-group" /> Secondary Categories</label>
        <label className={`sah-secondary-toggle${showSecondary ? ' active' : ''}`}>
          <input type="checkbox" checked={showSecondary} onChange={e => { setShowSecondary(e.target.checked); if (!e.target.checked) set('secondaryCats', []); }} />
          {showSecondary ? 'I offer other services (click to collapse)' : 'I also offer other services'}
        </label>
        {showSecondary && (
          <div className="sah-secondary-cats-box">
            {data.primaryCat && (
              <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <i className="fas fa-info-circle" style={{ color: 'var(--accent)' }} />
                <em>"{data.primaryCat}"</em> is your primary and cannot be re-selected.
              </div>
            )}
            <div className="sah-check-group">
              {Object.entries(SECONDARY_CAT_MAP).map(([shortLabel, fullLabel]) => {
                const isDisabled = fullLabel === primaryFull;
                const isChecked  = (data.secondaryCats || []).includes(shortLabel);
                return (
                  <label key={shortLabel} className={isDisabled ? 'disabled-opt' : ''}>
                    <input type="checkbox" value={shortLabel} disabled={isDisabled}
                      checked={isChecked && !isDisabled}
                      onChange={e => !isDisabled && toggleMulti('secondaryCats', shortLabel, e.target.checked)} />
                    {shortLabel}
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="sah-field sah-full">
        <label><i className="fas fa-edit" /> Service Title <em className="sah-req">*</em></label>
        <input type="text" value={data.serviceTitle || ''} placeholder="e.g. Mathematics Tutor for Grades 10–12"
          className={fe.serviceTitle ? 'err' : ''} onChange={e => set('serviceTitle', e.target.value)} />
        <FieldErr msg={fe.serviceTitle} />
      </div>
      <div className="sah-field sah-full">
        <label><i className="fas fa-align-left" /> Service Description <em className="sah-req">*</em></label>
        <textarea value={data.serviceDesc || ''} placeholder="Describe what you offer, your methods, and what makes you unique..."
          className={fe.serviceDesc ? 'err' : ''} onChange={e => set('serviceDesc', e.target.value)} />
        <FieldErr msg={fe.serviceDesc} />
      </div>
      <div className="sah-field">
        <label><i className="fas fa-edit" /> Subjects / Specialisations <em className="sah-req">*</em></label>
        <input type="text" value={data.subjects || ''} placeholder="e.g. Mathematics, Phonics, OT, ADHD support"
          className={fe.subjects ? 'err' : ''} onChange={e => set('subjects', e.target.value)} />
        <FieldErr msg={fe.subjects} />
      </div>
      <div className="sah-field">
        <label><i className="fas fa-check-square" /> Age Groups <em className="sah-req">*</em></label>
        <div className="sah-check-group">
          {['5–7','8–10','11–13','14–18'].map(ag => (
            <label key={ag}><input type="checkbox" value={ag} checked={(data.ageGroups || []).includes(ag)} onChange={e => toggleMulti('ageGroups', ag, e.target.checked)} />{ag}</label>
          ))}
        </div>
        {fe.ageGroups && <div className="sah-group-err"><i className="fas fa-exclamation-circle" /> {fe.ageGroups}</div>}
      </div>
      <div className="sah-field sah-full">
        <label><i className="fas fa-dot-circle" /> Delivery Mode <em className="sah-req">*</em></label>
        <div className="sah-check-group">
          {['Online','In-person','Hybrid (Online & In-person)'].map(m => (
            <label key={m}><input type="radio" name="deliveryMode" value={m} checked={data.deliveryMode === m} onChange={() => set('deliveryMode', m)} />{m}</label>
          ))}
        </div>
        {fe.deliveryMode && <div className="sah-group-err"><i className="fas fa-exclamation-circle" /> {fe.deliveryMode}</div>}
      </div>
    </div>
  );

  // Step 5 — Location
  const renderStep5 = () => (
    <div className="sah-form-grid">
      <div className="sah-field">
        <label><i className="fas fa-city" /> City <em className="sah-req">*</em></label>
        <input type="text" value={data.city || ''} placeholder="e.g. Cape Town"
          className={fe.city ? 'err' : ''} onChange={e => set('city', e.target.value)} />
        <FieldErr msg={fe.city} />
      </div>
      <div className="sah-field">
        <label><i className="fas fa-chevron-down" /> Province <em className="sah-req">*</em></label>
        <select value={data.province || ''} className={fe.province ? 'err' : ''} onChange={e => set('province', e.target.value)}>
          <option value="">-- Select --</option>
          {['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'].map(o => <option key={o}>{o}</option>)}
        </select>
        <FieldErr msg={fe.province} />
      </div>
      <div className="sah-field sah-full">
        <label><i className="fas fa-dot-circle" /> Service Area <em className="sah-req">*</em></label>
        <div className="sah-check-group">
          {['Local','National','Online only'].map(m => (
            <label key={m}><input type="checkbox" value={m} checked={(data.serviceAreas || []).includes(m)} onChange={() => toggleServiceArea(m)} />{m}</label>
          ))}
        </div>
        <div className="sah-field-hint"><i className="fas fa-info-circle" /> You may select more than one option.</div>
        {fe.serviceAreas && <div className="sah-group-err"><i className="fas fa-exclamation-circle" /> {fe.serviceAreas}</div>}
      </div>
      {(data.serviceAreas || []).includes('Local') && (
        <div className="sah-field">
          <label><i className="fas fa-route" /> Local Service Radius</label>
          <div className="sah-local-radius-row">
            <input type="number" min={1} value={data.localRadiusNum || ''} placeholder="e.g. 30"
              onChange={e => set('localRadiusNum', e.target.value.replace(/[^0-9]/g, ''))} />
            <select value={data.localRadiusUnit || 'km'} onChange={e => set('localRadiusUnit', e.target.value)} style={{ width: 80 }}>
              <option value="km">km</option>
              <option value="m">m</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );

  // Step 6 — Pricing & Availability
  const renderStep6 = () => {
    const priceUnit = PRICING_UNIT_MAP[data.pricingModel] || '';
    return (
      <div className="sah-form-grid">
        <div className="sah-field">
          <label><i className="fas fa-chevron-down" /> Pricing Model <em className="sah-req">*</em></label>
          <select value={data.pricingModel || ''} className={fe.pricingModel ? 'err' : ''} onChange={e => set('pricingModel', e.target.value)}>
            <option value="">-- Select --</option>
            {['Hourly','Per package','Per term','Custom quote'].map(o => <option key={o}>{o}</option>)}
          </select>
          <FieldErr msg={fe.pricingModel} />
        </div>
        <div className="sah-field">
          <label><i className="fas fa-tag" /> Starting Price (optional)</label>
          <div className="sah-prefix-wrap">
            <span className="sah-prefix">R</span>
            <input type="text" inputMode="numeric" value={data.startingPrice || ''}
              placeholder={data.pricingModel ? `Amount${priceUnit}` : 'Select pricing model first'}
              onChange={e => set('startingPrice', e.target.value.replace(/[^0-9]/g, ''))} />
            {priceUnit && <span className="sah-suffix">{priceUnit}</span>}
          </div>
          {data.startingPrice && priceUnit && (
            <div className="sah-field-hint"><i className="fas fa-eye" /> Preview: <strong>R{data.startingPrice}{priceUnit}</strong></div>
          )}
        </div>
        <div className="sah-field sah-full">
          <label><i className="fas fa-check-square" /> Days Available <em className="sah-req">*</em></label>
          <div className="sah-check-group">
            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
              <label key={d}><input type="checkbox" value={d} checked={(data.daysAvailable || []).includes(d)} onChange={e => toggleMulti('daysAvailable', d, e.target.checked)} />{d}</label>
            ))}
          </div>
          {fe.daysAvailable && <div className="sah-group-err"><i className="fas fa-exclamation-circle" /> {fe.daysAvailable}</div>}
        </div>
        <div className="sah-field sah-full">
          <label><i className="fas fa-clock" /> Time Slots <em className="sah-req">*</em></label>
          <input type="text" value={data.timeSlots || ''} placeholder="e.g. 9:00 - 12:00, 14:00 - 17:30"
            className={fe.timeSlots ? 'err' : ''}
            onChange={e => {
              const val = e.target.value;
              set('timeSlots', val);
              if (val.trim() && !TIME_SLOT_REGEX.test(val.trim())) setTimeSlotErr('Use the format HH:MM - HH:MM (e.g. 9:00 - 17:00).');
              else setTimeSlotErr('');
            }} />
          {(fe.timeSlots || timeSlotErr)
            ? <div className="sah-field-err"><i className="fas fa-exclamation-circle" /> {fe.timeSlots || timeSlotErr}</div>
            : <div className="sah-field-hint"><i className="fas fa-info-circle" /> Format: 9:00 - 17:00 &nbsp;·&nbsp; Multiple: 9:00 - 12:00, 14:00 - 17:00</div>}
        </div>
      </div>
    );
  };

  // Step 7 — Contact Details
  const renderStep7 = () => {
    const availableToAdd = EXTRA_SOCIALS.filter(s => !addedSocials.includes(s.key));
    return (
      <div className="sah-form-grid">
        <div className="sah-field">
          <label><i className="fas fa-phone" /> Phone Number <em className="sah-req">*</em></label>
          <div className={`sah-prefix-wrap${fe.phoneLocal ? ' err' : ''}`}>
            <span className="sah-prefix">+27</span>
            <input type="tel" value={data.phoneLocal || ''} placeholder="71 234 5678" maxLength={12}
              onChange={e => {
                let val = e.target.value.replace(/[^0-9\s]/g, '');
                const digits = val.replace(/\D/g, '');
                if (digits.length > 9) val = val.slice(0, val.length - (digits.length - 9));
                set('phoneLocal', val);
              }} />
          </div>
          <FieldErr msg={fe.phoneLocal} />
          {!fe.phoneLocal && <div className="sah-field-hint"><i className="fas fa-info-circle" /> Enter 9 digits after +27</div>}
        </div>
        <div className="sah-field">
          <label><i className="fab fa-whatsapp" /> WhatsApp Number</label>
          <div className="sah-prefix-wrap">
            <span className="sah-prefix">+27</span>
            <input type="tel" value={data.whatsappLocal || ''} placeholder="71 234 5678" maxLength={12}
              onChange={e => {
                let val = e.target.value.replace(/[^0-9\s]/g, '');
                const digits = val.replace(/\D/g, '');
                if (digits.length > 9) val = val.slice(0, val.length - (digits.length - 9));
                set('whatsappLocal', val);
              }} />
          </div>
        </div>
        <div className="sah-field sah-full">
          <label><i className="fas fa-envelope" /> Email for Enquiries <em className="sah-req">*</em></label>
          <input type="email" value={data.inquiryEmail || ''} placeholder="contact@example.com"
            className={fe.inquiryEmail ? 'err' : ''} onChange={e => set('inquiryEmail', e.target.value)} />
          <FieldErr msg={fe.inquiryEmail} />
        </div>
        <div className="sah-field">
          <label><i className="fas fa-globe" /> Website</label>
          <input type="url" value={data.website || ''} placeholder="https://yourwebsite.co.za" onChange={e => set('website', e.target.value)} />
        </div>
        <div className="sah-field">
          <label><i className="fab fa-facebook-f" /> Facebook</label>
          <input type="url" value={data.facebook || ''} placeholder="https://facebook.com/yourpage" onChange={e => set('facebook', e.target.value)} />
        </div>
        {addedSocials.length > 0 && (
          <div className="sah-full sah-added-socials">
            {addedSocials.map(key => {
              const s = EXTRA_SOCIALS.find(x => x.key === key);
              if (!s) return null;
              return (
                <div key={key} className="sah-field">
                  <label><i className={s.icon} /> {s.label}</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="url" value={data[key] || ''} placeholder={s.placeholder} onChange={e => set(key, e.target.value)} style={{ flex: 1 }} />
                    <button type="button" onClick={() => removeSocial(key)}
                      style={{ background: 'none', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 6, padding: '10px 12px', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.8rem', flexShrink: 0 }}>
                      <i className="fas fa-times" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {availableToAdd.length > 0 && (
          <div className="sah-full">
            <div className="sah-add-others-wrap" ref={socialDropRef}>
              <button type="button" className="sah-add-others-btn" onClick={() => setShowSocialDropdown(s => !s)}>
                <i className="fas fa-plus" /> Add other social platforms
                <i className={`fas fa-chevron-${showSocialDropdown ? 'up' : 'down'}`} style={{ fontSize: '0.7rem', marginLeft: 2 }} />
              </button>
              {showSocialDropdown && (
                <div className="sah-add-others-dropdown">
                  {availableToAdd.map(s => (
                    <button key={s.key} type="button" className="sah-add-others-option" onClick={() => addSocial(s.key)}>
                      <i className={s.icon} /> {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Step 8 — Terms & Conditions
  const renderStep8 = () => (
    <>
      <div className="sah-terms-box">
        <div className="sah-terms-box-head" onClick={() => setTermsOpen(o => !o)}>
          <div className="sah-terms-box-head-title">
            <i className="fas fa-file-contract" />
            SA Homeschooling Services Directory — Terms &amp; Community Guidelines
          </div>
          <button type="button" className="sah-terms-view-btn"
            onClick={e => { e.stopPropagation(); setTermsOpen(o => !o); }}>
            {termsOpen
              ? <><i className="fas fa-chevron-up" style={{ fontSize: '0.72rem' }} /> Hide</>
              : <><i className="fas fa-eye" /> View Terms</>}
          </button>
        </div>
        <div className={`sah-terms-body ${termsOpen ? 'open' : 'closed'}`}>
          <h4>1. Eligibility &amp; Accuracy</h4>
          <p>By registering as a service provider, you confirm that all information provided is accurate, current, and complete. You must be at least 18 years of age or represent a legally registered organisation.</p>
          <h4>2. Listing Standards</h4>
          <p>Your listing must represent genuine educational or support services relevant to the homeschooling community. Listings that are misleading, fraudulent, or offensive will be removed without notice.</p>
          <h4>3. Qualifications &amp; Credentials</h4>
          <p>Any qualifications, certifications, police clearances, or memberships listed must be legitimate and verifiable upon request. SA Homeschooling reserves the right to request proof of credentials at any time.</p>
          <h4>4. Conduct &amp; Community Standards</h4>
          <ul>
            <li>Treat all families and platform users with respect.</li>
            <li>Do not engage in spam, unsolicited advertising, or misleading promotions.</li>
            <li>Do not impersonate other individuals, organisations, or credentials.</li>
          </ul>
          <h4>5. Privacy &amp; Data Use</h4>
          <p>Information you provide will be stored and used to create and display your public provider profile. Contact information will be shared with families according to your selected plan. We do not sell personal data to third parties.</p>
          <h4>6. Profile Approval</h4>
          <p>All new profiles are subject to admin review before going live. SA Homeschooling reserves the right to reject or remove any listing that does not meet our community standards.</p>
          <h4>7. Paid Plans &amp; Billing</h4>
          <p>Paid listing plans are billed monthly. Cancellation can be requested at any time with effect from the next billing cycle. Refunds are not provided for partial months.</p>
          <h4>8. Liability</h4>
          <p>SA Homeschooling acts as a directory platform and is not responsible for the quality, safety, or outcome of services provided by listed providers. Families are encouraged to conduct their own due diligence.</p>
          <h4>9. Amendments</h4>
          <p>These terms may be updated periodically. Continued use of the platform constitutes acceptance of the updated terms.</p>
          <p style={{ marginTop: 16, fontStyle: 'italic', color: 'var(--muted)' }}>Last updated: January 2025</p>
        </div>
      </div>

      <label className={`sah-terms-row${data.terms ? ' checked' : ''}${fe.terms ? ' err-border' : ''}`}>
        <input type="checkbox" checked={!!data.terms} onChange={e => set('terms', e.target.checked)} />
        <span>
          I have read and agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms and Community Guidelines</a>.
          By proceeding, I confirm all my details are accurate and I am authorised to create this listing.
        </span>
      </label>
      {fe.terms && <div className="sah-terms-err"><i className="fas fa-exclamation-circle" /> {fe.terms}</div>}

      <div style={{ marginTop: 20, padding: '16px 20px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8 }}>
        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0369a1', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
          <i className="fas fa-clipboard-check" /> Registration Summary
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', fontSize: '0.82rem', color: '#334155' }}>
          {[
            ['Name',     data.fullName || '—'],
            ['Email',    data.email || '—'],
            ['Plan',     PLANS.find(p => p.param === data.listingPlan)?.name || '—'],
            ['Category', data.primaryCat || '—'],
            ['Location', data.city && data.province ? `${data.city}, ${data.province}` : '—'],
            ['Pricing',  data.pricingModel || '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 6 }}>
              <span style={{ fontWeight: 700, color: '#64748b', minWidth: 70 }}>{k}:</span>
              <span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const RENDERERS = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7, renderStep8];
  const pct = Math.round((step / TOTAL) * 100);

  return (
    <div className="sah-reg-wrap" ref={topRef}>
      <header className="sah-rhdr">
        <div className="sah-rhdr-inner">
          <div className="sah-rhdr-left">
            <button className="sah-rhdr-back" onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left" /> Back to Directory
            </button>
            <div className="sah-rhdr-div" />
            <Link to="/" className="sah-rhdr-brand">
              <span className="sah-rhdr-brand-name">SA Homeschooling</span>
              <span className="sah-rhdr-brand-tag">Education Services Directory</span>
            </Link>
          </div>
          <div className="sah-rhdr-right">
            <Link to="/login" className="sah-rhdr-ghost">Already registered? Log in</Link>
          </div>
        </div>
      </header>

      <section className="sah-reg-hero">
        <div className="sah-reg-hero-bg" />
        <div className="sah-reg-hero-inner">
          <h1 className="sah-reg-hero-title">Become a <em>Trusted Provider</em></h1>
          <div className="sah-step-trail">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const isActive = n === step;
              const isDone   = n < step;
              return (
                <div key={n} className="sah-trail-item">
                  <div className={`sah-trail-dot${isActive ? ' active' : isDone ? ' done' : ''}`}>
                    {isDone ? <i className="fas fa-check" style={{ fontSize: '0.65rem' }} /> : <span className="sah-tn">{n}</span>}
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && <i className="fas fa-chevron-right sah-trail-arrow" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="sah-reg-panel">
        {fe._submit && (
          <div style={{ marginTop: 20, padding: '12px 18px', background: '#fee9e9', color: '#a00c2c', border: '1px solid #f5b3b3', borderRadius: 8, fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fas fa-exclamation-triangle" /> {fe._submit}
          </div>
        )}

        <div className="sah-step-card">
          <div className="sah-step-card-head">
            <h2>
              <i className={`fas ${STEPS[step - 1].icon}`} style={{ marginRight: 10, color: 'var(--accent-light)', fontSize: '1.1rem' }} />
              Step {step} of {TOTAL}: {STEPS[step - 1].title}
            </h2>
            <p>{STEPS[step - 1].desc}</p>
          </div>
          <div className="sah-step-card-body">
            {RENDERERS[step - 1]()}
          </div>
        </div>

        <div className="sah-form-nav-wrap">
          {step > 1
            ? <button className="sah-nav-prev" onClick={prev}><i className="fas fa-arrow-left" /> Previous</button>
            : <div />}
          <div className="sah-nav-counter">
            <strong>{step}</strong> of {TOTAL} steps
            <div className="sah-nav-progress">
              <div className="sah-nav-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <button
            className={`sah-nav-next${step === TOTAL ? ' sah-nav-submit' : ''}`}
            onClick={next}
            disabled={submitting || (step === 3 && overLimit)}
          >
            {submitting ? <span className="sah-spinner" /> : null}
            {step < TOTAL
              ? <><span>Next</span> <i className="fas fa-arrow-right" /></>
              : <><i className="fas fa-check-circle" /> <span>{submitting ? 'Creating Profile…' : 'Create My Profile'}</span></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registration;