// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Modal from '../components/common/Modal';
import ReviewCard from '../components/admin/ReviewCard';
import { reviewsMock } from '../utils/constants';
import { escapeHtml } from '../utils/helpers';
import '../assets/css/dashboard.css';

/* ── localStorage helpers ────────────────────────────────── */
function getStoredProviders() {
  try { return JSON.parse(localStorage.getItem('sah_providers') || '[]'); }
  catch { return []; }
}
function saveStoredProviders(list) {
  try { localStorage.setItem('sah_providers', JSON.stringify(list)); }
  catch {}
}
function getStoredUsers() {
  try { return JSON.parse(localStorage.getItem('sah_users') || '[]'); }
  catch { return []; }
}
function getAuthLogs() {
  try { return JSON.parse(localStorage.getItem('sah_auth_logs') || '[]'); }
  catch { return []; }
}
function getFeaturedSlots() {
  try {
    const s = localStorage.getItem('sah_featured_slots');
    if (s) {
      const slots = JSON.parse(s);
      while (slots.length < 4) slots.push({ id: slots.length + 1, provider: null, providerId: null, addedDaysAgo: 0, daysRemaining: 0 });
      return slots.slice(0, 4);
    }
    return [1,2,3,4].map(id => ({ id, provider: null, providerId: null, addedDaysAgo: 0, daysRemaining: 0 }));
  } catch {
    return [1,2,3,4].map(id => ({ id, provider: null, providerId: null, addedDaysAgo: 0, daysRemaining: 0 }));
  }
}
function saveFeaturedSlots(slots) {
  try { localStorage.setItem('sah_featured_slots', JSON.stringify(slots)); }
  catch {}
}
const MAX_FEATURED_SLOTS = 4;

/* ── Package pricing config — must match Registration.js exactly ── */
const PACKAGE_CONFIG = {
  community: { label: 'Community',         tier: 'free',     price: 0,    color: '#6b7280', bg: '#f9fafb', badge: 'community' },
  trusted:   { label: 'Trusted Provider',  tier: 'pro',      price: 149,  color: '#1d4ed8', bg: '#eff6ff', badge: 'pro'       },
  deluxe:    { label: 'Deluxe Provider',   tier: 'featured', price: 399,  color: '#d97706', bg: '#fffbeb', badge: 'featured'  },
};

/* ── Date helpers ── */
const now = new Date();
function isWithinDays(dateStr, days) {
  if (!dateStr) return false;
  try {
    const diff = (now - new Date(dateStr)) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= days;
  } catch { return false; }
}
function isWithinMonths(dateStr, months) {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - months);
    return d >= cutoff && d <= now;
  } catch { return false; }
}
function isThisYear(dateStr) {
  if (!dateStr) return false;
  try { return new Date(dateStr).getFullYear() === now.getFullYear(); }
  catch { return false; }
}

/* ── Helper: resolve package key from provider ── */
function resolvePackageKey(provider) {
  const tier = (provider.tier || provider.listingPlan || 'free').toLowerCase();
  if (tier === 'featured' || tier === 'deluxe') return 'deluxe';
  if (tier === 'pro' || tier === 'trusted')     return 'trusted';
  return 'community';
}

/* ── Helper: get all cert files for a provider (new array + legacy fallback) ── */
function getCertFiles(provider) {
  if (provider.certFilesAll && provider.certFilesAll.length > 0) {
    return provider.certFilesAll;
  }
  // Legacy flat field fallback
  if (provider.certFile) {
    return [{ name: provider.certFileName || 'Certificate', type: provider.certFileType || 'application/pdf', data: provider.certFile }];
  }
  return [];
}

/* ── Helper: get all clearance files for a provider (new array + legacy fallback) ── */
function getClearanceFiles(provider) {
  if (provider.clearanceFilesAll && provider.clearanceFilesAll.length > 0) {
    return provider.clearanceFilesAll;
  }
  // Legacy flat field fallback
  if (provider.clearanceFile) {
    return [{ name: provider.clearanceFileName || 'Police Clearance', type: provider.clearanceFileType || 'application/pdf', data: provider.clearanceFile }];
  }
  return [];
}

/* ── Inline CSS ─────────────────────────────────────────── */
const ADMIN_CSS = `
  .admin-stats { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; }
  .stat-filter-card { flex:1; min-width:140px; padding:12px 16px; background:#fff; border:2px solid #e5e0d8; border-radius:10px; cursor:pointer; transition:all 0.15s; display:flex; flex-direction:column; gap:6px; }
  .stat-filter-card:hover { border-color:#c9621a; transform:translateY(-2px); box-shadow:0 4px 12px rgba(201,98,26,0.15); }
  .stat-filter-card.active { border-color:#c9621a; background:#fff8f2; box-shadow:0 0 0 3px rgba(201,98,26,0.1); }
  .stat-filter-value { font-size:1.6rem; font-weight:800; color:#c9621a; font-family:'Playfair Display',serif; }
  .stat-filter-label { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#888; }

  /* ── Scrollable list container ── */
  .adm-scroll-list {
    max-height: calc(4 * 82px);
    overflow-y: auto;
    overflow-x: hidden;
    border-radius: 10px;
    scrollbar-width: thin;
    scrollbar-color: #c9621a #f5f0e8;
    padding-right: 2px;
  }
  .adm-scroll-list::-webkit-scrollbar { width: 6px; }
  .adm-scroll-list::-webkit-scrollbar-track { background: #f5f0e8; border-radius: 6px; }
  .adm-scroll-list::-webkit-scrollbar-thumb { background: #c9621a; border-radius: 6px; }
  .adm-scroll-list::-webkit-scrollbar-thumb:hover { background: #a84e12; }

  /* ── Pending list scroll ── */
  .adm-pending-scroll {
    max-height: calc(4 * 72px);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #c9621a #f5f0e8;
    padding-right: 2px;
  }
  .adm-pending-scroll::-webkit-scrollbar { width: 6px; }
  .adm-pending-scroll::-webkit-scrollbar-track { background: #f5f0e8; border-radius: 6px; }
  .adm-pending-scroll::-webkit-scrollbar-thumb { background: #c9621a; border-radius: 6px; }

  /* ── Users list scroll ── */
  .adm-users-scroll {
    max-height: calc(4 * 80px);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #c9621a #f5f0e8;
    padding-right: 2px;
  }
  .adm-users-scroll::-webkit-scrollbar { width: 6px; }
  .adm-users-scroll::-webkit-scrollbar-track { background: #f5f0e8; border-radius: 6px; }
  .adm-users-scroll::-webkit-scrollbar-thumb { background: #c9621a; border-radius: 6px; }

  /* ── Revenue table scroll ── */
  .adm-revenue-scroll {
    max-height: calc(4 * 56px + 44px);
    overflow-y: auto;
    overflow-x: auto;
    border-radius: 10px;
    scrollbar-width: thin;
    scrollbar-color: #c9621a #f5f0e8;
  }
  .adm-revenue-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
  .adm-revenue-scroll::-webkit-scrollbar-track { background: #f5f0e8; border-radius: 6px; }
  .adm-revenue-scroll::-webkit-scrollbar-thumb { background: #c9621a; border-radius: 6px; }
  .adm-revenue-scroll::-webkit-scrollbar-thumb:hover { background: #a84e12; }

  /* ── Auth logs scroll ── */
  .adm-logs-scroll {
    max-height: calc(4 * 52px);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #c9621a #f5f0e8;
  }
  .adm-logs-scroll::-webkit-scrollbar { width: 6px; }
  .adm-logs-scroll::-webkit-scrollbar-track { background: #f5f0e8; }
  .adm-logs-scroll::-webkit-scrollbar-thumb { background: #c9621a; border-radius: 6px; }

  /* ── Scroll hint ── */
  .adm-scroll-hint {
    text-align: center;
    padding: 6px 0 0;
    font-size: 0.7rem;
    color: #aaa;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  .adm-expand-row { border:1px solid #e5e0d8; border-radius:12px; overflow:hidden; margin-bottom:12px; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.05); transition:box-shadow 0.15s; }
  .adm-expand-row:hover { box-shadow:0 3px 12px rgba(0,0,0,0.10); }
  .adm-expand-row.expanded { border-color:#c9621a; box-shadow:0 4px 20px rgba(201,98,26,0.12); }
  .adm-row-header { display:flex; align-items:center; gap:14px; padding:14px 18px; cursor:pointer; background:#faf9f7; transition:background 0.12s; user-select:none; }
  .adm-row-header:hover { background:#f5f0e8; }
  .adm-expand-row.expanded .adm-row-header { background:#fff3e8; border-bottom:1px solid #f0d4b8; }
  .adm-avatar { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1rem; font-weight:800; flex-shrink:0; box-shadow:0 2px 8px rgba(0,0,0,0.15); overflow:hidden; }
  .adm-avatar img { width:100%; height:100%; object-fit:cover; border-radius:10px; }
  .adm-avatar.no-photo { background:linear-gradient(135deg,#c9621a,#e07a35); }
  .adm-avatar.user-av     { background:linear-gradient(135deg,#6366f1,#818cf8); }
  .adm-avatar.parent-av   { background:linear-gradient(135deg,#0891b2,#22d3ee); }
  .adm-avatar.provider-av { background:linear-gradient(135deg,#c9621a,#e07a35); }
  .adm-avatar.admin-av    { background:linear-gradient(135deg,#1a1a1a,#555); }
  .adm-row-info { flex:1; min-width:0; }
  .adm-row-name { font-size:0.92rem; font-weight:700; color:#1a1a1a; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .adm-row-meta { font-size:0.75rem; color:#888; margin-top:2px; }
  .adm-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:4px; font-size:0.68rem; font-weight:700; }
  .adm-badge.pending  { background:#fef3c7; color:#92400e; }
  .adm-badge.approved { background:#d1fae5; color:#065f46; }
  .adm-badge.rejected { background:#fee2e2; color:#991b1b; }
  .adm-badge.featured { background:#fffbeb; color:#d97706; }
  .adm-badge.pro      { background:#dbeafe; color:#1e3a8a; }
  .adm-badge.user     { background:#ede9fe; color:#5b21b6; }
  .adm-badge.parent   { background:#cffafe; color:#0e7490; }
  .adm-expand-icon { color:#aaa; font-size:0.8rem; transition:transform 0.2s; flex-shrink:0; }
  .adm-expand-row.expanded .adm-expand-icon { transform:rotate(180deg); color:#c9621a; }
  .adm-row-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .adm-btn-approve { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:7px; cursor:pointer; font-size:0.8rem; font-weight:700; border:none; font-family:inherit; background:#d1fae5; color:#065f46; transition:all 0.15s; }
  .adm-btn-approve:hover { background:#a7f3d0; }
  .adm-btn-reject  { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:7px; cursor:pointer; font-size:0.8rem; font-weight:700; border:none; font-family:inherit; background:#fee2e2; color:#991b1b; transition:all 0.15s; }
  .adm-btn-reject:hover  { background:#fecaca; }

  /* ── Detail panel ── */
  .adm-detail-panel { padding:0; animation:adm-slide-in 0.2s ease; }
  @keyframes adm-slide-in { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  .adm-detail-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0; border-bottom:1px solid #f0ece5; }
  .adm-detail-section { padding:18px 20px; border-right:1px solid #f0ece5; }
  .adm-detail-section:last-child { border-right:none; }
  .adm-detail-section-title { font-size:0.68rem; font-weight:800; text-transform:uppercase; letter-spacing:0.9px; color:#c9621a; margin-bottom:12px; display:flex; align-items:center; gap:6px; }
  .adm-detail-field { margin-bottom:10px; }
  .adm-detail-label { font-size:0.66rem; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color:#aaa; margin-bottom:3px; }
  .adm-detail-val { font-size:0.83rem; color:#1a1a1a; font-weight:500; word-break:break-word; }
  .adm-detail-val.empty { color:#bbb; font-style:italic; }
  .adm-detail-tags { display:flex; flex-wrap:wrap; gap:5px; margin-top:4px; }
  .adm-detail-tag { padding:2px 10px; border-radius:20px; font-size:0.72rem; font-weight:600; background:#fef3e8; color:#c9621a; border:1px solid #f0c89a; }
  .adm-detail-footer { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; background:#faf9f7; flex-wrap:wrap; gap:12px; }
  .adm-detail-footer-note { font-size:0.75rem; color:#888; display:flex; align-items:center; gap:6px; }

  /* ── File preview in admin panel ── */
  .adm-file-section { padding:16px 20px; border-top:1px solid #f0ece5; }
  .adm-file-section-title { font-size:0.68rem; font-weight:800; text-transform:uppercase; letter-spacing:0.9px; color:#c9621a; margin-bottom:12px; display:flex; align-items:center; gap:6px; }
  .adm-file-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  .adm-file-card { border:1.5px solid #e5e0d8; border-radius:10px; overflow:hidden; background:#faf9f7; }
  .adm-file-card-head { display:flex; align-items:center; gap:8px; padding:8px 12px; background:#fff3e8; border-bottom:1px solid #f0d4b8; }
  .adm-file-card-head i { color:#c9621a; font-size:0.82rem; flex-shrink:0; }
  .adm-file-card-name { font-size:0.75rem; font-weight:700; color:#1a1a1a; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .adm-file-card-body { padding:10px 12px; }
  .adm-file-img { width:100%; max-height:160px; object-fit:contain; border-radius:5px; border:1px solid #e5e0d8; background:#fff; display:block; }
  .adm-file-pdf-note { display:flex; align-items:center; gap:7px; padding:8px 10px; background:#fef3e8; border-radius:5px; font-size:0.76rem; color:#92400e; font-weight:600; }
  .adm-file-none { padding:16px; text-align:center; color:#bbb; font-size:0.78rem; font-style:italic; }
  .adm-file-dl { display:inline-flex; align-items:center; gap:5px; margin-top:8px; padding:6px 12px; border-radius:5px; background:#c9621a; color:#fff; font-size:0.74rem; font-weight:700; cursor:pointer; border:none; font-family:inherit; transition:background 0.14s; }
  .adm-file-dl:hover { background:#a84e12; }
  .adm-photo-big { width:80px; height:80px; border-radius:50%; object-fit:cover; border:3px solid #c9621a; display:block; margin:0 auto 8px; box-shadow:0 3px 12px rgba(201,98,26,0.3); }
  .adm-photo-placeholder { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#c9621a,#e07a35); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.8rem; font-weight:800; margin:0 auto 8px; }

  /* ── Multi-doc list ── */
  .adm-doc-list { display:flex; flex-direction:column; gap:8px; }
  .adm-doc-list-item { display:flex; align-items:center; gap:10px; padding:8px 10px; border:1.5px solid #e5e0d8; border-radius:8px; background:#fff; }
  .adm-doc-list-icon { width:28px; height:28px; border-radius:6px; background:#fff3e8; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .adm-doc-list-icon i { color:#c9621a; font-size:0.78rem; }
  .adm-doc-list-info { flex:1; min-width:0; }
  .adm-doc-list-name { font-size:0.76rem; font-weight:700; color:#1a1a1a; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .adm-doc-list-sub { font-size:0.67rem; color:#aaa; margin-top:1px; }
  .adm-doc-list-dl { padding:4px 9px; border-radius:5px; background:#c9621a; color:#fff; font-size:0.68rem; font-weight:700; border:none; cursor:pointer; font-family:inherit; transition:background 0.14s; flex-shrink:0; }
  .adm-doc-list-dl:hover { background:#a84e12; }
  .adm-doc-none { padding:12px; text-align:center; color:#bbb; font-size:0.76rem; font-style:italic; }

  /* ── Listings ── */
  .adm-listing-row { display:flex; align-items:center; gap:14px; padding:13px 18px; border:1px solid #e5e0d8; border-radius:10px; background:#fff; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.04); transition:box-shadow 0.15s, border-color 0.15s; }
  .adm-listing-row:hover { box-shadow:0 3px 10px rgba(0,0,0,0.08); border-color:#c9621a; }
  .adm-listing-row.selected { border-color:#c9621a; background:#fff8f2; box-shadow:0 0 0 3px rgba(201,98,26,0.12); }
  .adm-promote-btn { display:inline-flex; align-items:center; gap:5px; padding:5px 11px; border-radius:6px; cursor:pointer; font-size:0.77rem; font-weight:700; border:none; font-family:inherit; background:#dbeafe; color:#1e40af; transition:all 0.15s; }
  .adm-promote-btn:hover { background:#bfdbfe; }
  .adm-demote-btn  { display:inline-flex; align-items:center; gap:5px; padding:5px 11px; border-radius:6px; cursor:pointer; font-size:0.77rem; font-weight:700; border:none; font-family:inherit; background:#f3f4f6; color:#4b5563; transition:all 0.15s; }
  .adm-demote-btn:hover  { background:#e5e7eb; }
  .adm-badge-opt { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:5px; cursor:pointer; font-size:0.72rem; font-weight:700; transition:all 0.14s; border:1.5px solid transparent; }
  .adm-badge-opt.community { background:#f9fafb; color:#6b7280; border-color:#e5e7eb; }
  .adm-badge-opt.community.selected { background:#e5e7eb; color:#374151; border-color:#9ca3af; }
  .adm-badge-opt.trusted   { background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; }
  .adm-badge-opt.trusted.selected   { background:#dbeafe; }
  .adm-badge-opt.featured  { background:#fffbeb; color:#d97706; border-color:#fde68a; }
  .adm-badge-opt.featured.selected  { background:#fde68a; }
  .adm-badge-opt:hover { transform:translateY(-1px); }

  /* ── Floating Profile Card ── */
  .adm-floating-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(2px);
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 20px;
    animation: adm-overlay-in 0.2s ease;
  }
  @keyframes adm-overlay-in { from { opacity:0; } to { opacity:1; } }
  .adm-float-card {
    width: 420px;
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 40px);
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(201,98,26,0.15);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: adm-card-slide-in 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes adm-card-slide-in {
    from { opacity:0; transform: translateX(40px) scale(0.96); }
    to   { opacity:1; transform: translateX(0) scale(1); }
  }
  .adm-float-card-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px 20px 16px;
    background: linear-gradient(135deg, #fff3e8 0%, #fff8f2 100%);
    border-bottom: 1px solid #f0d4b8;
    flex-shrink: 0;
  }
  .adm-float-avatar {
    width: 56px; height: 56px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 1.4rem; font-weight: 800; flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(201,98,26,0.35); overflow: hidden;
    background: linear-gradient(135deg,#c9621a,#e07a35);
  }
  .adm-float-avatar img { width:100%; height:100%; object-fit:cover; border-radius:14px; }
  .adm-float-header-info { flex: 1; min-width: 0; }
  .adm-float-name { font-size: 1rem; font-weight: 800; color: #1a1a1a; margin-bottom: 4px; }
  .adm-float-meta { font-size: 0.75rem; color: #888; }
  .adm-float-close {
    width: 32px; height: 32px; border-radius: 8px; border: none;
    background: rgba(0,0,0,0.06); color: #666; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; transition: all 0.15s; flex-shrink: 0;
  }
  .adm-float-close:hover { background: #fee2e2; color: #991b1b; }
  .adm-float-body {
    flex: 1; overflow-y: auto; padding: 0;
    scrollbar-width: thin; scrollbar-color: #c9621a #f5f0e8;
  }
  .adm-float-body::-webkit-scrollbar { width: 5px; }
  .adm-float-body::-webkit-scrollbar-track { background: #f5f0e8; }
  .adm-float-body::-webkit-scrollbar-thumb { background: #c9621a; border-radius: 4px; }
  .adm-float-section { padding: 16px 20px; border-bottom: 1px solid #f5f0e8; }
  .adm-float-section:last-child { border-bottom: none; }
  .adm-float-section-title {
    font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.9px; color: #c9621a; margin-bottom: 12px;
    display: flex; align-items: center; gap: 6px;
  }
  .adm-float-field { margin-bottom: 9px; }
  .adm-float-field-label { font-size: 0.63rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #bbb; margin-bottom: 2px; }
  .adm-float-field-val { font-size: 0.82rem; color: #1a1a1a; font-weight: 500; word-break: break-word; line-height: 1.4; }
  .adm-float-field-val.empty { color: #ccc; font-style: italic; font-weight: 400; }
  .adm-float-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px; }
  .adm-float-tag { padding: 2px 9px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; background: #fef3e8; color: #c9621a; border: 1px solid #f0c89a; }
  .adm-float-photo { width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 3px solid #c9621a; display: block; margin: 0 auto 10px; box-shadow: 0 3px 12px rgba(201,98,26,0.25); }
  .adm-float-photo-placeholder { width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg,#c9621a,#e07a35); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.6rem; font-weight: 800; margin: 0 auto 10px; }
  .adm-float-doc-row { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border: 1.5px solid #e5e0d8; border-radius: 8px; margin-bottom: 8px; background: #faf9f7; }
  .adm-float-doc-icon { width: 30px; height: 30px; border-radius: 7px; background: #fff3e8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .adm-float-doc-icon i { color: #c9621a; font-size: 0.8rem; }
  .adm-float-doc-info { flex: 1; min-width: 0; }
  .adm-float-doc-name { font-size: 0.78rem; font-weight: 700; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .adm-float-doc-sub { font-size: 0.68rem; color: #aaa; }
  .adm-float-doc-dl { padding: 5px 10px; border-radius: 5px; background: #c9621a; color: #fff; font-size: 0.7rem; font-weight: 700; border: none; cursor: pointer; font-family: inherit; transition: background 0.14s; flex-shrink: 0; }
  .adm-float-doc-dl:hover { background: #a84e12; }
  .adm-float-footer {
    padding: 14px 20px; background: #faf9f7; border-top: 1px solid #f0ece5;
    display: flex; gap: 8px; flex-shrink: 0;
  }
  .adm-float-footer .adm-btn-approve,
  .adm-float-footer .adm-btn-reject { flex: 1; justify-content: center; padding: 9px 12px; font-size: 0.82rem; }

  /* ── Featured slots ── */
  .adm-featured-slots-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px; }
  .adm-slot-card { border:2px solid #e5e0d8; border-radius:12px; overflow:hidden; background:#fff; transition:all 0.15s; }
  .adm-slot-card.filled { border-color:#c9621a; }
  .adm-slot-card-head { padding:14px 16px; background:#faf9f7; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f0ece5; }
  .adm-slot-card.filled .adm-slot-card-head { background:#fff3e8; }
  .adm-slot-num { font-size:0.68rem; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; color:#aaa; }
  .adm-slot-card.filled .adm-slot-num { color:#c9621a; }
  .adm-slot-status { font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:4px; background:#f3f4f6; color:#9ca3af; }
  .adm-slot-card.filled .adm-slot-status { background:#fef3c7; color:#92400e; }
  .adm-slot-body { padding:14px 16px; }
  .adm-slot-empty { text-align:center; padding:18px 0; }
  .adm-slot-empty i { font-size:1.5rem; color:#ddd; margin-bottom:6px; display:block; }
  .adm-slot-empty p { font-size:0.8rem; color:#bbb; }
  .adm-slot-provider-name { font-weight:700; font-size:0.92rem; color:#1a1a1a; margin-bottom:4px; }
  .adm-slot-meta { font-size:0.75rem; color:#888; margin-bottom:12px; }
  .adm-slot-actions { display:flex; gap:6px; }
  .adm-slot-btn { flex:1; padding:7px 10px; border-radius:6px; cursor:pointer; font-size:0.76rem; font-weight:700; border:none; font-family:inherit; display:inline-flex; align-items:center; justify-content:center; gap:5px; transition:all 0.14s; }
  .adm-slot-btn.remove { background:#fee2e2; color:#991b1b; }
  .adm-slot-btn.remove:hover { background:#fecaca; }
  .adm-slot-btn.rotate { background:#dbeafe; color:#1e40af; }
  .adm-slot-btn.rotate:hover { background:#bfdbfe; }

  /* ── Users ── */
  .adm-user-row { display:flex; align-items:center; gap:12px; padding:12px 18px; border:1px solid #e5e0d8; border-radius:10px; background:#fff; margin-bottom:8px; box-shadow:0 1px 4px rgba(0,0,0,0.04); }
  .adm-user-info { flex:1; min-width:0; }
  .adm-user-email { font-size:0.88rem; font-weight:700; color:#1a1a1a; }
  .adm-user-meta  { font-size:0.73rem; color:#888; margin-top:2px; display:flex; gap:12px; flex-wrap:wrap; }
  .adm-role-tabs { display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap; }
  .adm-role-tab { padding:6px 16px; border-radius:20px; font-size:0.78rem; font-weight:700; border:1.5px solid #e5e0d8; background:#fff; color:#888; cursor:pointer; transition:all 0.15s; display:inline-flex; align-items:center; gap:6px; }
  .adm-role-tab:hover { border-color:#c9621a; color:#c9621a; }
  .adm-role-tab.active { background:#c9621a; border-color:#c9621a; color:#fff; }
  .adm-role-tab .adm-role-tab-count { border-radius:10px; padding:0 6px; font-size:0.68rem; background:rgba(255,255,255,0.25); }
  .adm-role-tab:not(.active) .adm-role-tab-count { background:#f0ece5; color:#888; }

  /* ── Auth logs ── */
  .adm-log-row { display:flex; align-items:center; gap:12px; padding:10px 18px; border-bottom:1px solid #f5f0e8; font-size:0.8rem; color:#555; }
  .adm-log-row:last-child { border-bottom:none; }
  .adm-log-event { padding:2px 8px; border-radius:4px; font-size:0.68rem; font-weight:700; flex-shrink:0; min-width:72px; text-align:center; }
  .adm-log-event.REGISTER { background:#d1fae5; color:#065f46; }
  .adm-log-event.LOGIN    { background:#dbeafe; color:#1e3a8a; }
  .adm-log-event.LOGOUT   { background:#f3f4f6; color:#4b5563; }
  .adm-log-email { flex:1; font-weight:600; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .adm-log-role  { font-size:0.68rem; font-weight:700; padding:2px 7px; border-radius:4px; flex-shrink:0; }
  .adm-log-role.USER     { background:#cffafe; color:#0e7490; }
  .adm-log-role.PROVIDER { background:#fef3c7; color:#92400e; }
  .adm-log-role.ADMIN    { background:#1a1a1a; color:#fff; }
  .adm-log-time { font-size:0.72rem; color:#aaa; flex-shrink:0; white-space:nowrap; }

  /* ── Search/filter ── */
  .adm-search-row { display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
  .adm-search-input { flex:1; min-width:180px; padding:9px 14px; border:1.5px solid rgba(0,0,0,0.10); border-radius:7px; font-family:inherit; font-size:0.85rem; color:#333; outline:none; background:#fff; transition:border-color 0.15s; }
  .adm-search-input:focus { border-color:#c9621a; }
  .adm-filter-select { padding:9px 14px; border:1.5px solid rgba(0,0,0,0.10); border-radius:7px; font-family:inherit; font-size:0.85rem; color:#555; background:#fff; outline:none; cursor:pointer; }
  .adm-err-banner { background:#fff0f0; border:1.5px solid #f5b3b3; border-radius:8px; padding:12px 18px; color:#a00c2c; font-size:0.85rem; font-weight:600; margin-bottom:16px; display:flex; align-items:center; gap:8px; }

  /* ── Modal ── */
  .modal-field { margin-bottom:0.75rem; }
  .modal-field label { display:block; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#888; margin-bottom:3px; }
  .modal-field .value { font-size:0.88rem; color:#1a1a1a; font-weight:500; }
  .modal-section-title { font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#c9621a; padding-top:0.75rem; margin:1.25rem 0 0.75rem; border-top:1px solid #e5e0d8; }
  .modal-file-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:8px; }
  .modal-file-card { border:1.5px solid #e5e0d8; border-radius:8px; overflow:hidden; }
  .modal-file-head { display:flex; align-items:center; gap:7px; padding:7px 10px; background:#fff3e8; border-bottom:1px solid #f0d4b8; }
  .modal-file-head i { color:#c9621a; font-size:0.8rem; }
  .modal-file-head span { font-size:0.73rem; font-weight:700; color:#1a1a1a; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; }
  .modal-file-body { padding:8px 10px; }
  .modal-file-img { width:100%; max-height:140px; object-fit:contain; border-radius:4px; display:block; }
  .modal-file-pdf { display:flex; align-items:center; gap:6px; padding:8px; background:#fef3e8; border-radius:4px; font-size:0.74rem; color:#92400e; font-weight:600; }
  .modal-file-none { padding:12px; text-align:center; color:#bbb; font-size:0.76rem; font-style:italic; }
  .modal-file-dl { display:inline-flex; align-items:center; gap:5px; margin-top:7px; padding:5px 10px; border-radius:4px; background:#c9621a; color:#fff; font-size:0.72rem; font-weight:700; cursor:pointer; border:none; font-family:inherit; }
  .modal-file-dl:hover { background:#a84e12; }
  .modal-photo-wrap { text-align:center; margin-bottom:12px; }
  .modal-photo { width:90px; height:90px; border-radius:50%; object-fit:cover; border:3px solid #c9621a; display:inline-block; }
  .modal-photo-placeholder { width:90px; height:90px; border-radius:50%; background:linear-gradient(135deg,#c9621a,#e07a35); display:inline-flex; align-items:center; justify-content:center; color:#fff; font-size:2rem; font-weight:800; }

  /* ── Package Sales / Revenue ── */
  .adm-pkg-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
  .adm-pkg-card { border:2px solid #e5e0d8; border-radius:14px; overflow:hidden; background:#fff; }
  .adm-pkg-card-head { padding:14px 18px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f0ece5; }
  .adm-pkg-card-name { font-size:0.85rem; font-weight:800; }
  .adm-pkg-price-tag { font-size:0.72rem; font-weight:700; padding:3px 10px; border-radius:20px; }
  .adm-pkg-card-body { padding:16px 18px; }
  .adm-pkg-stat { display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid #f5f0e8; }
  .adm-pkg-stat:last-child { border-bottom:none; }
  .adm-pkg-stat-label { font-size:0.74rem; color:#888; font-weight:600; }
  .adm-pkg-stat-val { font-size:0.88rem; font-weight:800; color:#1a1a1a; }
  .adm-revenue-summary { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; padding:16px 0; border-top:2px solid #f0ece5; margin-top:4px; }
  .adm-rev-box { text-align:center; padding:14px; background:#faf9f7; border-radius:10px; border:1px solid #e5e0d8; }
  .adm-rev-box-val { font-size:1.5rem; font-weight:800; color:#c9621a; font-family:'Playfair Display',serif; }
  .adm-rev-box-label { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.7px; color:#888; margin-top:4px; }

  /* ── Revenue table ── */
  .adm-rev-table { width:100%; border-collapse:collapse; margin-top:12px; font-size:0.82rem; }
  .adm-rev-table th { text-align:left; padding:8px 12px; font-size:0.68rem; font-weight:800; text-transform:uppercase; letter-spacing:0.7px; color:#aaa; background:#faf9f7; border-bottom:2px solid #f0ece5; }
  .adm-rev-table td { padding:10px 12px; border-bottom:1px solid #f5f0e8; vertical-align:middle; }
  .adm-rev-table tr:last-child td { border-bottom:none; }
  .adm-rev-table tr:hover td { background:#fffbf5; }

  /* ── Signup time filter ── */
  .adm-time-tabs { display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap; }
  .adm-time-tab { padding:5px 14px; border-radius:20px; font-size:0.76rem; font-weight:700; border:1.5px solid #e5e0d8; background:#fff; color:#888; cursor:pointer; transition:all 0.15s; display:inline-flex; align-items:center; gap:5px; }
  .adm-time-tab:hover { border-color:#c9621a; color:#c9621a; }
  .adm-time-tab.active { background:#c9621a; border-color:#c9621a; color:#fff; }
  .adm-time-summary { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
  .adm-time-stat { padding:10px 16px; border-radius:10px; background:#faf9f7; border:1.5px solid #e5e0d8; display:flex; flex-direction:column; gap:3px; min-width:110px; cursor:pointer; transition:all 0.15s; }
  .adm-time-stat:hover { border-color:#c9621a; }
  .adm-time-stat-val { font-size:1.3rem; font-weight:800; color:#c9621a; font-family:'Playfair Display',serif; }
  .adm-time-stat-label { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color:#888; }

  @media (max-width:900px) { .adm-featured-slots-grid { grid-template-columns:1fr 1fr; } .adm-file-grid { grid-template-columns:1fr 1fr; } .modal-file-grid { grid-template-columns:1fr 1fr; } .adm-pkg-grid { grid-template-columns:1fr; } .adm-revenue-summary { grid-template-columns:1fr 1fr; } }
  @media (max-width:800px) { .adm-detail-grid { grid-template-columns:1fr 1fr; } .adm-detail-section { border-right:none; border-bottom:1px solid #f0ece5; } }
  @media (max-width:600px) { .adm-featured-slots-grid { grid-template-columns:1fr; } .adm-detail-grid { grid-template-columns:1fr; } .adm-row-actions { flex-wrap:wrap; } .adm-file-grid { grid-template-columns:1fr; } .modal-file-grid { grid-template-columns:1fr; } .adm-revenue-summary { grid-template-columns:1fr; } .adm-float-card { width:100%; } }
`;

/* ── Reusable multi-file document list ── */
const DocFileList = ({ files, emptyLabel }) => {
  const downloadFile = (fileData, fileName) => {
    if (!fileData) return;
    const a = document.createElement('a');
    a.href = fileData;
    a.download = fileName || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!files || files.length === 0) {
    return <div className="adm-doc-none">{emptyLabel || 'Not uploaded'}</div>;
  }

  return (
    <div className="adm-doc-list">
      {files.map((f, i) => {
        const isImage = f.type && f.type.startsWith('image/');
        const isPdf   = f.type === 'application/pdf';
        const icon    = isImage ? 'fa-image' : isPdf ? 'fa-file-pdf' : 'fa-file-alt';
        const sizeKb  = f.size ? `${Math.round(f.size / 1024)} KB` : '';
        return (
          <div key={i} className="adm-doc-list-item">
            <div className="adm-doc-list-icon">
              <i className={`fas ${icon}`}></i>
            </div>
            <div className="adm-doc-list-info">
              <div className="adm-doc-list-name">{f.name || `Document ${i + 1}`}</div>
              <div className="adm-doc-list-sub">
                {isPdf ? 'PDF document' : isImage ? 'Image file' : 'Document'}
                {sizeKb && ` · ${sizeKb}`}
              </div>
            </div>
            {f.data ? (
              <button className="adm-doc-list-dl" onClick={() => downloadFile(f.data, f.name)}>
                <i className="fas fa-download"></i> Download
              </button>
            ) : (
              <span style={{ fontSize: '0.68rem', color: '#bbb', flexShrink: 0 }}>No data</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ── File card used in admin detail panel ── */
const AdminFileCard = ({ file, fileName, fileType, label }) => {
  const isImage = fileType && fileType.startsWith('image/');
  const isPdf   = fileType === 'application/pdf';
  const download = () => {
    if (!file) return;
    const a = document.createElement('a'); a.href = file; a.download = fileName || label;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  return (
    <div className="adm-file-card">
      <div className="adm-file-card-head">
        <i className={`fas ${isImage ? 'fa-image' : isPdf ? 'fa-file-pdf' : 'fa-file-alt'}`}></i>
        <span className="adm-file-card-name">{label}</span>
      </div>
      <div className="adm-file-card-body">
        {file ? (
          <>
            {isImage && <img src={file} alt={label} className="adm-file-img" />}
            {!isImage && (
              <div className="adm-file-pdf-note">
                <i className={`fas ${isPdf ? 'fa-file-pdf' : 'fa-file'}`} style={{ color: isPdf ? '#dc2626' : '#888' }}></i>
                {fileName || 'Document on file'}
              </div>
            )}
            <button className="adm-file-dl" onClick={download}>
              <i className="fas fa-download"></i> Download
            </button>
          </>
        ) : (
          <div className="adm-file-none">Not uploaded</div>
        )}
      </div>
    </div>
  );
};

/* ── Expandable Pending Row ── */
const ExpandablePendingRow = ({ provider, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false);
  const initial = (provider.name || '?')[0].toUpperCase();
  const regDate = provider.registered ? new Date(provider.registered).toLocaleDateString('en-ZA') : '—';
  const val     = (v) => (v ? String(v) : null);

  const profilePhotoSrc = provider.profilePhoto || provider.photo || provider.image || null;
  const certFiles       = getCertFiles(provider);
  const clearanceFiles  = getClearanceFiles(provider);

  return (
    <div className={`adm-expand-row ${expanded ? 'expanded' : ''}`}>
      <div className="adm-row-header" onClick={() => setExpanded(e => !e)}>
        <div className={`adm-avatar ${profilePhotoSrc ? '' : 'no-photo'}`}>
          {profilePhotoSrc
            ? <img src={profilePhotoSrc} alt={provider.name} />
            : initial}
        </div>
        <div className="adm-row-info">
          <div className="adm-row-name">
            {provider.name}
            <span className="adm-badge pending">Pending</span>
            {provider.tier === 'featured' && <span className="adm-badge featured"><i className="fas fa-crown"></i> Featured Plan</span>}
            {provider.tier === 'pro'      && <span className="adm-badge pro"><i className="fas fa-check-circle"></i> Pro Plan</span>}
            {certFiles.length > 0      && <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}><i className="fas fa-file-alt" style={{ marginRight: 3 }}></i>Cert ({certFiles.length})</span>}
            {clearanceFiles.length > 0 && <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}><i className="fas fa-shield-alt" style={{ marginRight: 3 }}></i>Clearance ({clearanceFiles.length})</span>}
          </div>
          <div className="adm-row-meta">
            {provider.email} &nbsp;·&nbsp; {provider.city || '—'}, {provider.province || '—'} &nbsp;·&nbsp;
            {provider.listingPlan || provider.tier || 'free'} plan &nbsp;·&nbsp; Registered: {regDate}
          </div>
        </div>
        <i className="fas fa-chevron-down adm-expand-icon"></i>
        <div className="adm-row-actions" onClick={e => e.stopPropagation()}>
          <button className="adm-btn-approve" onClick={() => onApprove(provider.id)}>
            <i className="fas fa-check"></i> Approve
          </button>
          <button className="adm-btn-reject" onClick={() => onReject(provider.id)}>
            <i className="fas fa-times"></i> Reject
          </button>
        </div>
      </div>

      {expanded && (
        <div className="adm-detail-panel">
          <div className="adm-detail-grid">
            <div className="adm-detail-section">
              <div className="adm-detail-section-title"><i className="fas fa-user"></i> Account &amp; Contact</div>
              {[
                { label: 'Full Name / Business', val: val(provider.name) },
                { label: 'Account Type',         val: val(provider.accountType) },
                { label: 'Email',                val: val(provider.email) },
                { label: 'Phone',                val: val(provider.phone) },
                { label: 'WhatsApp',             val: val(provider.whatsapp) },
                { label: 'Enquiry Email',         val: val(provider.contactEmail) },
                { label: 'Website',              val: val(provider.website || provider.social) },
                { label: 'Plan',                 val: val(provider.listingPlan || provider.tier) },
                { label: 'Registered',           val: regDate },
              ].map(({ label, val: v }) => (
                <div className="adm-detail-field" key={label}>
                  <div className="adm-detail-label">{label}</div>
                  <div className={`adm-detail-val ${!v ? 'empty' : ''}`}>{v || '—'}</div>
                </div>
              ))}
            </div>

            <div className="adm-detail-section">
              <div className="adm-detail-section-title"><i className="fas fa-briefcase"></i> Bio &amp; Services</div>
              <div className="adm-detail-field">
                <div className="adm-detail-label">Bio</div>
                <div className={`adm-detail-val ${!val(provider.bio) ? 'empty' : ''}`} style={{ lineHeight: 1.6, fontSize: '0.8rem' }}>
                  {val(provider.bio) || '—'}
                </div>
              </div>
              <div className="adm-detail-field">
                <div className="adm-detail-label">Primary Category</div>
                <div className="adm-detail-val">{val(provider.primaryCategory || provider.category) || '—'}</div>
              </div>
              <div className="adm-detail-field">
                <div className="adm-detail-label">Tags / Subjects</div>
                {provider.tags?.length > 0
                  ? <div className="adm-detail-tags">{provider.tags.map((t, i) => <span key={i} className="adm-detail-tag">{t}</span>)}</div>
                  : <div className="adm-detail-val empty">—</div>}
              </div>
              {provider.services?.length > 0 && (
                <div className="adm-detail-field">
                  <div className="adm-detail-label">Services ({provider.services.length})</div>
                  {provider.services.map((svc, i) => (
                    <div key={i} style={{ padding: '6px 10px', background: '#faf9f7', borderRadius: 6, marginTop: 5, fontSize: '0.8rem' }}>
                      {svc.title && <div style={{ fontWeight: 700 }}>{svc.title}</div>}
                      {svc.description && <div style={{ color: '#666', marginTop: 2 }}>{svc.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="adm-detail-section">
              <div className="adm-detail-section-title"><i className="fas fa-map-marker-alt"></i> Location &amp; Credentials</div>
              {[
                { label: 'City',         val: val(provider.city) },
                { label: 'Province',     val: val(provider.province) },
                { label: 'Service Area', val: val(provider.serviceAreaType) },
                { label: 'Radius',       val: provider.radius ? val(provider.radius) + ' km' : null },
              ].map(({ label, val: v }) => (
                <div className="adm-detail-field" key={label}>
                  <div className="adm-detail-label">{label}</div>
                  <div className={`adm-detail-val ${!v ? 'empty' : ''}`}>{v || '—'}</div>
                </div>
              ))}
              <div className="adm-detail-section-title" style={{ marginTop: 14 }}><i className="fas fa-graduation-cap"></i> Qualifications</div>
              {[
                { label: 'Degrees',        val: val(provider.degrees) },
                { label: 'Certifications', val: val(provider.certifications) },
                { label: 'Memberships',    val: val(provider.memberships) },
                { label: 'Clearance Ref.', val: val(provider.clearance) },
              ].map(({ label, val: v }) => (
                <div className="adm-detail-field" key={label}>
                  <div className="adm-detail-label">{label}</div>
                  <div className={`adm-detail-val ${!v ? 'empty' : ''}`}>{v || '—'}</div>
                </div>
              ))}
              <div className="adm-detail-section-title" style={{ marginTop: 14 }}><i className="fas fa-tag"></i> Pricing</div>
              {[
                { label: 'Model', val: val(provider.pricingModel) },
                { label: 'Price', val: val(provider.startingPrice || provider.priceFrom) },
              ].map(({ label, val: v }) => (
                <div className="adm-detail-field" key={label}>
                  <div className="adm-detail-label">{label}</div>
                  <div className={`adm-detail-val ${!v ? 'empty' : ''}`}>{v || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Documents section — multi-file aware ── */}
          <div className="adm-file-section">
            <div className="adm-file-section-title">
              <i className="fas fa-paperclip"></i> Uploaded Files &amp; Documents
            </div>

            {/* Profile photo row */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#c9621a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fas fa-camera"></i> Profile Photo
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {profilePhotoSrc ? (
                  <>
                    <img src={profilePhotoSrc} alt="Profile" className="adm-photo-big" style={{ margin: 0 }} />
                    <button className="adm-file-dl" onClick={() => {
                      const a = document.createElement('a'); a.href = profilePhotoSrc;
                      a.download = `${provider.name || 'profile'}-photo`;
                      document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    }}>
                      <i className="fas fa-download"></i> Download Photo
                    </button>
                  </>
                ) : (
                  <>
                    <div className="adm-photo-placeholder" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>{initial}</div>
                    <span className="adm-file-none" style={{ padding: 0 }}>No photo uploaded</span>
                  </>
                )}
              </div>
            </div>

            {/* Cert & Clearance as two columns */}
            <div className="adm-file-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="adm-file-card">
                <div className="adm-file-card-head">
                  <i className="fas fa-file-alt"></i>
                  <span className="adm-file-card-name">
                    Qualification / Certificates ({certFiles.length})
                  </span>
                </div>
                <div className="adm-file-card-body">
                  <DocFileList files={certFiles} emptyLabel="No certificates uploaded" />
                </div>
              </div>
              <div className="adm-file-card">
                <div className="adm-file-card-head">
                  <i className="fas fa-shield-alt"></i>
                  <span className="adm-file-card-name">
                    Police Clearance ({clearanceFiles.length})
                  </span>
                </div>
                <div className="adm-file-card-body">
                  <DocFileList files={clearanceFiles} emptyLabel="No clearance uploaded" />
                </div>
              </div>
            </div>
          </div>

          <div className="adm-detail-footer">
            <div className="adm-detail-footer-note">
              <i className="fas fa-info-circle" style={{ color: '#c9621a' }}></i>
              Admin review on {new Date().toLocaleDateString('en-ZA')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="adm-btn-approve" style={{ padding: '9px 20px', fontSize: '0.85rem' }}
                onClick={() => onApprove(provider.id)}>
                <i className="fas fa-check-circle"></i> Approve &amp; Go Live
              </button>
              <button className="adm-btn-reject" style={{ padding: '9px 20px', fontSize: '0.85rem' }}
                onClick={() => onReject(provider.id)}>
                <i className="fas fa-times-circle"></i> Reject Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Featured Slot Card ── */
const InlineFeaturedSlotCard = ({ slot, onRemove, onRotate }) => {
  const filled = !!slot.provider;
  return (
    <div className={`adm-slot-card ${filled ? 'filled' : ''}`}>
      <div className="adm-slot-card-head">
        <span className="adm-slot-num">Slot #{slot.id}</span>
        <span className="adm-slot-status">{filled ? 'Occupied' : 'Empty'}</span>
      </div>
      <div className="adm-slot-body">
        {!filled ? (
          <div className="adm-slot-empty">
            <i className="fas fa-star" />
            <p>No provider assigned</p>
          </div>
        ) : (
          <>
            <div className="adm-slot-provider-name">{slot.provider}</div>
            <div className="adm-slot-meta">
              <i className="fas fa-clock" style={{ marginRight: 4, color: '#c9621a' }} />
              {slot.daysRemaining > 0 ? `${slot.daysRemaining} days remaining` : 'Duration ended'}
              {slot.addedDaysAgo > 0 && ` · added ${slot.addedDaysAgo}d ago`}
            </div>
            <div className="adm-slot-actions">
              <button className="adm-slot-btn remove" onClick={() => onRemove(slot.id, slot.provider)}>
                <i className="fas fa-times" /> Remove
              </button>
              <button className="adm-slot-btn rotate" onClick={() => onRotate(slot.id)}>
                <i className="fas fa-sync" /> Rotate
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Floating Profile Card ── */
const FloatingProfileCard = ({ provider, featuredSlots, onApprove, onReject, onClose }) => {
  const initial = (provider.name || '?')[0].toUpperCase();
  const profilePhotoSrc = provider.profilePhoto || provider.photo || provider.image || null;
  const regDate = provider.registered ? new Date(provider.registered).toLocaleDateString('en-ZA') : '—';

  const certFiles      = getCertFiles(provider);
  const clearanceFiles = getClearanceFiles(provider);

  const downloadFile = (file, name) => {
    if (!file) return;
    const a = document.createElement('a'); a.href = file; a.download = name || 'file';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="adm-floating-overlay" onClick={onClose}>
      <div className="adm-float-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="adm-float-card-header">
          <div className="adm-float-avatar">
            {profilePhotoSrc ? <img src={profilePhotoSrc} alt={provider.name} /> : initial}
          </div>
          <div className="adm-float-header-info">
            <div className="adm-float-name">{provider.name || '—'}</div>
            <div className="adm-float-meta" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span className={`adm-badge ${provider.status}`}>{provider.status}</span>
              {provider.tier === 'featured' && <span className="adm-badge featured"><i className="fas fa-crown"></i> featured</span>}
              {provider.tier === 'pro'      && <span className="adm-badge pro"><i className="fas fa-check-circle"></i> trusted</span>}
              {featuredSlots?.some(s => s.providerId === provider.id) && (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#fde68a', color: '#92400e' }}>
                  <i className="fas fa-star" style={{ marginRight: 3 }}></i>
                  Slot #{featuredSlots.find(s => s.providerId === provider.id)?.id}
                </span>
              )}
            </div>
          </div>
          <button className="adm-float-close" onClick={onClose} title="Close (Esc)">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="adm-float-body">
          {/* Photo section */}
          {profilePhotoSrc && (
            <div className="adm-float-section" style={{ textAlign: 'center', paddingTop: 18 }}>
              <img src={profilePhotoSrc} alt="Profile" className="adm-float-photo" />
              <div style={{ fontSize: '0.72rem', color: '#aaa' }}>Profile photo</div>
            </div>
          )}

          {/* Contact */}
          <div className="adm-float-section">
            <div className="adm-float-section-title"><i className="fas fa-user"></i> Account &amp; Contact</div>
            {[
              { label: 'Email',          val: provider.email },
              { label: 'Phone',          val: provider.phone },
              { label: 'WhatsApp',       val: provider.whatsapp },
              { label: 'Enquiry Email',   val: provider.contactEmail },
              { label: 'Website',        val: provider.website || provider.social },
              { label: 'Account Type',   val: provider.accountType },
              { label: 'Plan',           val: provider.listingPlan || provider.tier },
              { label: 'Registered',     val: regDate },
            ].map(({ label, val }) => (
              <div className="adm-float-field" key={label}>
                <div className="adm-float-field-label">{label}</div>
                <div className={`adm-float-field-val ${!val ? 'empty' : ''}`}>{val || '—'}</div>
              </div>
            ))}
          </div>

          {/* Location */}
          <div className="adm-float-section">
            <div className="adm-float-section-title"><i className="fas fa-map-marker-alt"></i> Location</div>
            {[
              { label: 'City',         val: provider.city },
              { label: 'Province',     val: provider.province },
              { label: 'Service Area', val: provider.serviceAreaType },
              { label: 'Radius',       val: provider.radius ? `${provider.radius} km` : null },
            ].map(({ label, val }) => (
              <div className="adm-float-field" key={label}>
                <div className="adm-float-field-label">{label}</div>
                <div className={`adm-float-field-val ${!val ? 'empty' : ''}`}>{val || '—'}</div>
              </div>
            ))}
          </div>

          {/* Bio & Services */}
          <div className="adm-float-section">
            <div className="adm-float-section-title"><i className="fas fa-briefcase"></i> Bio &amp; Services</div>
            <div className="adm-float-field">
              <div className="adm-float-field-label">Category</div>
              <div className={`adm-float-field-val ${!provider.primaryCategory && !provider.category ? 'empty' : ''}`}>
                {provider.primaryCategory || provider.category || '—'}
              </div>
            </div>
            <div className="adm-float-field">
              <div className="adm-float-field-label">Bio</div>
              <div className={`adm-float-field-val ${!provider.bio ? 'empty' : ''}`} style={{ lineHeight: 1.5, fontSize: '0.8rem' }}>
                {provider.bio || '—'}
              </div>
            </div>
            {provider.tags?.length > 0 && (
              <div className="adm-float-field">
                <div className="adm-float-field-label">Tags / Subjects</div>
                <div className="adm-float-tags">
                  {provider.tags.map((t, i) => <span key={i} className="adm-float-tag">{t}</span>)}
                </div>
              </div>
            )}
            {[
              { label: 'Pricing Model', val: provider.pricingModel },
              { label: 'Starting Price', val: provider.startingPrice || provider.priceFrom },
            ].map(({ label, val }) => (
              <div className="adm-float-field" key={label}>
                <div className="adm-float-field-label">{label}</div>
                <div className={`adm-float-field-val ${!val ? 'empty' : ''}`}>{val || '—'}</div>
              </div>
            ))}
          </div>

          {/* Qualifications */}
          <div className="adm-float-section">
            <div className="adm-float-section-title"><i className="fas fa-graduation-cap"></i> Qualifications</div>
            {[
              { label: 'Degrees',        val: provider.degrees },
              { label: 'Certifications', val: provider.certifications },
              { label: 'Memberships',    val: provider.memberships },
              { label: 'Clearance Ref.', val: provider.clearance },
            ].map(({ label, val }) => (
              <div className="adm-float-field" key={label}>
                <div className="adm-float-field-label">{label}</div>
                <div className={`adm-float-field-val ${!val ? 'empty' : ''}`}>{val || '—'}</div>
              </div>
            ))}
          </div>

          {/* Documents — multi-file aware */}
          <div className="adm-float-section">
            <div className="adm-float-section-title"><i className="fas fa-paperclip"></i> Documents</div>

            {/* Certificates */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#bbb', marginBottom: 6 }}>
                Qualification / Certificates ({certFiles.length})
              </div>
              {certFiles.length === 0 ? (
                <div className="adm-float-doc-row">
                  <div className="adm-float-doc-icon"><i className="fas fa-file-alt"></i></div>
                  <div className="adm-float-doc-info">
                    <div className="adm-float-doc-name">No certificates uploaded</div>
                    <div className="adm-float-doc-sub">—</div>
                  </div>
                </div>
              ) : (
                certFiles.map((f, i) => {
                  const isImage = f.type && f.type.startsWith('image/');
                  const isPdf   = f.type === 'application/pdf';
                  return (
                    <div key={i} className="adm-float-doc-row">
                      <div className="adm-float-doc-icon">
                        <i className={`fas ${isImage ? 'fa-image' : isPdf ? 'fa-file-pdf' : 'fa-file-alt'}`}></i>
                      </div>
                      <div className="adm-float-doc-info">
                        <div className="adm-float-doc-name">{f.name || `Certificate ${i + 1}`}</div>
                        <div className="adm-float-doc-sub">
                          {isPdf ? 'PDF' : isImage ? 'Image' : 'Document'}
                          {f.size ? ` · ${Math.round(f.size / 1024)} KB` : ''}
                        </div>
                      </div>
                      {f.data && (
                        <button className="adm-float-doc-dl" onClick={() => downloadFile(f.data, f.name)}>
                          <i className="fas fa-download"></i>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Police Clearance */}
            <div>
              <div style={{ fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#bbb', marginBottom: 6 }}>
                Police Clearance ({clearanceFiles.length})
              </div>
              {clearanceFiles.length === 0 ? (
                <div className="adm-float-doc-row">
                  <div className="adm-float-doc-icon"><i className="fas fa-shield-alt"></i></div>
                  <div className="adm-float-doc-info">
                    <div className="adm-float-doc-name">No clearance uploaded</div>
                    <div className="adm-float-doc-sub">—</div>
                  </div>
                </div>
              ) : (
                clearanceFiles.map((f, i) => {
                  const isImage = f.type && f.type.startsWith('image/');
                  const isPdf   = f.type === 'application/pdf';
                  return (
                    <div key={i} className="adm-float-doc-row">
                      <div className="adm-float-doc-icon">
                        <i className={`fas ${isImage ? 'fa-image' : isPdf ? 'fa-file-pdf' : 'fa-shield-alt'}`}></i>
                      </div>
                      <div className="adm-float-doc-info">
                        <div className="adm-float-doc-name">{f.name || `Clearance ${i + 1}`}</div>
                        <div className="adm-float-doc-sub">
                          {isPdf ? 'PDF' : isImage ? 'Image' : 'Document'}
                          {f.size ? ` · ${Math.round(f.size / 1024)} KB` : ''}
                        </div>
                      </div>
                      {f.data && (
                        <button className="adm-float-doc-dl" onClick={() => downloadFile(f.data, f.name)}>
                          <i className="fas fa-download"></i>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer actions — only show approve/reject for pending */}
        {provider.status === 'pending' && (
          <div className="adm-float-footer">
            <button className="adm-btn-approve" onClick={() => { onApprove(provider.id); onClose(); }}>
              <i className="fas fa-check-circle"></i> Approve &amp; Go Live
            </button>
            <button className="adm-btn-reject" onClick={() => { onReject(provider.id); onClose(); }}>
              <i className="fas fa-times-circle"></i> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const EMPTY_MODAL = { title: '', body: '' };

/* ═══════════════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const { user }              = useAuth();
  const { showNotification }  = useNotification();
  const navigate              = useNavigate();

  const [activeTab, setActiveTab]         = useState('all');
  const [providers, setProviders]         = useState([]);
  const [featuredSlots, setFeaturedSlots] = useState([]);
  const [reviews, setReviews]             = useState(reviewsMock || []);
  const [modalOpen, setModalOpen]         = useState(false);
  const [modalContent, setModalContent]   = useState(EMPTY_MODAL);
  const [featuredError, setFeaturedError] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const [filterType, setFilterType]       = useState('all');
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [authLogs, setAuthLogs]           = useState([]);
  const [userSearch, setUserSearch]       = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userTimeFilter, setUserTimeFilter] = useState('ALL');
  const [logSearch, setLogSearch]         = useState('');
  const [logEventFilter, setLogEventFilter] = useState('ALL');
  const [revenueSearch, setRevenueSearch] = useState('');
  const [revenuePkgFilter, setRevenuePkgFilter] = useState('ALL');
  // Floating card state
  const [floatingProvider, setFloatingProvider] = useState(null);

  useEffect(() => {
    if (!document.getElementById('adm-styles')) {
      const style = document.createElement('style'); style.id = 'adm-styles'; style.textContent = ADMIN_CSS;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const loadedProviders = getStoredProviders();
    setProviders(loadedProviders);
    setFeaturedSlots(getFeaturedSlots());
    const storedUsers = getStoredUsers();
    const providerUsers = loadedProviders.map(p => ({
      id: p.id, email: p.email || p.contactEmail || '', name: p.name || '',
      role: 'PROVIDER', registered: p.registered || '', lastLogin: p.lastLogin || p.registered || '',
      status: p.status || 'pending', plan: p.plan || p.listingPlan || p.tier || 'free',
    }));
    const seen = new Set();
    const merged = [
      ...storedUsers.map(u => ({ ...u, role: u.role || 'USER', accountType: u.accountType || 'parent' })),
      ...providerUsers,
    ].filter(u => {
      const k = (u.email || u.id || '').toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k); return true;
    });
    setRegisteredUsers(merged);
    setAuthLogs(getAuthLogs());
  }, []);

  const pendingProviders  = providers.filter(p => p.status === 'pending');
  const approvedProviders = providers.filter(p => p.status === 'approved');
  const rejectedProviders = providers.filter(p => p.status === 'rejected');
  const featuredCount     = featuredSlots.filter(s => !!s.provider).length;
  const pendingReviews    = (reviews || []).filter(r => r.status === 'pending');
  const parentUsers       = registeredUsers.filter(u => u.role === 'USER');
  const providerAccounts  = registeredUsers.filter(u => u.role === 'PROVIDER');

  /* ── Package sales computed ── */
  const packageSales = {
    community: providers.filter(p => resolvePackageKey(p) === 'community'),
    trusted:   providers.filter(p => resolvePackageKey(p) === 'trusted'),
    deluxe:    providers.filter(p => resolvePackageKey(p) === 'deluxe'),
  };
  const totalRevenue = providers.reduce((sum, p) => {
    const key = resolvePackageKey(p);
    return sum + PACKAGE_CONFIG[key].price;
  }, 0);
  const paidProviders = providers.filter(p => {
    const key = resolvePackageKey(p);
    return PACKAGE_CONFIG[key].price > 0;
  });

  const stats = {
    totalProviders:  providers.length,
    pendingApproval: pendingProviders.length,
    approved:        approvedProviders.length,
    rejected:        rejectedProviders.length,
    featuredSlots:   featuredCount,
    pendingReviews:  pendingReviews.length,
    totalUsers:      parentUsers.length,
    totalAccounts:   registeredUsers.length,
  };

  const handleApprove = (id) => {
    const updated = providers.map(p => p.id === id ? { ...p, status: 'approved' } : p);
    setProviders(updated); saveStoredProviders(updated);
    const p = providers.find(x => x.id === id);
    showNotification(`✅ ${p?.name || 'Provider'} approved and is now live.`, 'success');
  };
  const handleReject = (id) => {
    const updated = providers.map(p => p.id === id ? { ...p, status: 'rejected' } : p);
    setProviders(updated); saveStoredProviders(updated);
    const p = providers.find(x => x.id === id);
    showNotification(`${p?.name || 'Provider'} registration rejected.`, 'info');
  };

  const handleBadgeSelect = (providerId, badgeType) => {
    setFeaturedError('');
    const tierMap = { community: 'free', trusted: 'pro', featured: 'featured' };
    const provider = providers.find(p => p.id === providerId);
    if (badgeType === 'featured') {
      const alreadyInSlot = featuredSlots.some(s => s.providerId === providerId);
      if (alreadyInSlot) { showNotification(`${provider?.name} is already in a featured slot.`, 'info'); }
      else {
        const emptySlot = featuredSlots.find(s => !s.provider);
        if (!emptySlot) {
          setFeaturedError(`All ${MAX_FEATURED_SLOTS} featured slots are occupied. Remove a provider first.`);
          setActiveTab('featured'); return;
        }
        const updatedSlots = featuredSlots.map(s =>
          s.id === emptySlot.id ? { ...s, provider: provider?.name || 'Unknown', providerId, addedDaysAgo: 0, daysRemaining: 7 } : s
        );
        setFeaturedSlots(updatedSlots); saveFeaturedSlots(updatedSlots);
        showNotification(`⭐ ${provider?.name} assigned to Featured Slot #${emptySlot.id}!`, 'success');
      }
    }
    const updated = providers.map(p => p.id === providerId ? { ...p, badge: badgeType, tier: tierMap[badgeType] || p.tier } : p);
    setProviders(updated); saveStoredProviders(updated);
    if (badgeType !== 'featured') showNotification(`Badge "${badgeType}" assigned to ${provider?.name}.`, 'success');
  };

  const handlePromote = (id) => {
    const updated = providers.map(p => p.id === id ? { ...p, promoted: true, demoted: false } : p);
    setProviders(updated); saveStoredProviders(updated);
    showNotification(`"${providers.find(p => p.id === id)?.name}" promoted.`, 'success');
  };
  const handleDemote = (id) => {
    const updated = providers.map(p => p.id === id ? { ...p, demoted: true, promoted: false } : p);
    setProviders(updated); saveStoredProviders(updated);
    showNotification(`"${providers.find(p => p.id === id)?.name}" demoted.`, 'info');
  };

  const handleRemoveFeatured = (slotId, providerName) => {
    setFeaturedError('');
    const slot = featuredSlots.find(s => s.id === slotId);
    const updatedSlots = featuredSlots.map(s =>
      s.id === slotId ? { ...s, provider: null, providerId: null, addedDaysAgo: 0, daysRemaining: 0 } : s
    );
    setFeaturedSlots(updatedSlots); saveFeaturedSlots(updatedSlots);
    if (slot?.providerId) {
      const updated = providers.map(p => p.id === slot.providerId ? { ...p, tier: 'pro', badge: 'verified' } : p);
      setProviders(updated); saveStoredProviders(updated);
    }
    showNotification(`Removed ${providerName} from featured slot #${slotId}`, 'info');
  };
  const handleRotateFeatured = (slotId) => {
    const available = approvedProviders.map(p => p.name).filter(Boolean);
    const current   = featuredSlots.find(s => s.id === slotId)?.provider;
    const others    = available.filter(n => n !== current);
    const picked    = others.length ? others[Math.floor(Math.random() * others.length)]
                    : available.length ? available[Math.floor(Math.random() * available.length)]
                    : 'STEM Mastery Tutors';
    const pickedProvider = providers.find(p => p.name === picked);
    const updatedSlots = featuredSlots.map(s =>
      s.id === slotId ? { ...s, provider: picked, providerId: pickedProvider?.id || null, addedDaysAgo: 0, daysRemaining: 7 } : s
    );
    setFeaturedSlots(updatedSlots); saveFeaturedSlots(updatedSlots);
    showNotification(`Rotated slot #${slotId} to ${picked}`, 'success');
  };

  const handleModerateReview = (reviewId, action) => {
    setReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r
    ));
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setModalContent(EMPTY_MODAL), 300);
  };

  /* ── Filtered listings ── */
  const getFilteredListings = () => {
    let filtered = providers;
    if (listingSearch) {
      const term = listingSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.city?.toLowerCase().includes(term)
      );
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(p => {
        switch (filterType) {
          case 'featured':  return p.tier === 'featured';
          case 'trusted':   return p.tier === 'pro';
          case 'community': return p.tier === 'free' || !p.tier;
          case 'promoted':  return p.promoted === true;
          case 'demoted':   return p.demoted === true;
          case 'approved':  return p.status === 'approved';
          case 'pending':   return p.status === 'pending';
          case 'rejected':  return p.status === 'rejected';
          default:          return true;
        }
      });
    }
    return filtered;
  };
  const filteredListings = getFilteredListings();

  /* ── Time-filtered users ── */
  const applyTimeFilter = (users, filter) => {
    if (filter === 'ALL')     return users;
    if (filter === 'WEEK')    return users.filter(u => isWithinDays(u.registered, 7));
    if (filter === 'MONTH')   return users.filter(u => isWithinDays(u.registered, 30));
    if (filter === '3MONTHS') return users.filter(u => isWithinMonths(u.registered, 3));
    if (filter === '6MONTHS') return users.filter(u => isWithinMonths(u.registered, 6));
    if (filter === 'YEAR')    return users.filter(u => isThisYear(u.registered));
    return users;
  };

  const filteredUsers = registeredUsers.filter(u => {
    const matchSearch = !userSearch ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });
  const timeFilteredUsers = applyTimeFilter(filteredUsers, userTimeFilter);

  const signupStats = {
    week:    registeredUsers.filter(u => isWithinDays(u.registered, 7)).length,
    month:   registeredUsers.filter(u => isWithinDays(u.registered, 30)).length,
    months3: registeredUsers.filter(u => isWithinMonths(u.registered, 3)).length,
    year:    registeredUsers.filter(u => isThisYear(u.registered)).length,
    total:   registeredUsers.length,
  };

  const revenueProviders = paidProviders.filter(p => {
    const matchSearch = !revenueSearch ||
      p.name?.toLowerCase().includes(revenueSearch.toLowerCase()) ||
      p.email?.toLowerCase().includes(revenueSearch.toLowerCase());
    const matchPkg = revenuePkgFilter === 'ALL' || resolvePackageKey(p) === revenuePkgFilter;
    return matchSearch && matchPkg;
  });

  const filteredLogs = authLogs.filter(l => {
    const matchSearch = !logSearch || l.email?.toLowerCase().includes(logSearch.toLowerCase());
    const matchEvent  = logEventFilter === 'ALL' || l.event === logEventFilter;
    return matchSearch && matchEvent;
  });

  const fmtDate = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('en-ZA', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
    catch { return iso; }
  };

  const fmtShortDate = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-ZA'); }
    catch { return iso; }
  };

  const getRoleDisplay = (u) => {
    if (u.role === 'ADMIN')    return { label: 'Admin',           cls: 'admin-av',    badge: { background: '#1a1a1a', color: '#fff' } };
    if (u.role === 'PROVIDER') return { label: 'Provider',        cls: 'provider-av', badge: { background: '#fef3c7', color: '#92400e' } };
    return                            { label: 'Parent / Family', cls: 'parent-av',   badge: { background: '#cffafe', color: '#0e7490' } };
  };

  const fmtZAR = (n) => `R ${n.toLocaleString('en-ZA')}`;

  return (
    <>
      <Header userType="admin" />
      <main className="dash-wrapper">
        <div className="page-headline">
          <h1>Admin Control Panel</h1>
          <p>Manage listings, approvals, featured slots, provider badges, users, and review moderation</p>
        </div>

        <div className="card">
          <div className="card-header">
            <i className="fas fa-shield-halved"></i>
            <h2>Directory Oversight</h2>
            <span className="badge"><i className="fas fa-lock"></i> admin</span>
          </div>

          {/* ── Stats ── */}
          <div className="admin-stats">
            {[
              { id: 'all',      val: stats.totalProviders,  label: 'Total Providers' },
              { id: 'pending',  val: stats.pendingApproval, label: 'Pending Approval' },
              { id: 'featured', val: `${featuredCount}/${MAX_FEATURED_SLOTS}`, label: 'Featured Slots' },
              { id: 'reviews',  val: stats.pendingReviews,  label: 'Reviews Pending' },
              { id: 'users',    val: stats.totalUsers,      label: 'Registered Families' },
              { id: 'revenue',  val: fmtZAR(totalRevenue),  label: 'Total Revenue' },
            ].map(s => (
              <div key={s.id} className={`stat-filter-card${activeTab === s.id ? ' active' : ''}`} onClick={() => setActiveTab(s.id)}>
                <div className="stat-filter-value" style={s.id === 'revenue' ? { fontSize: '1.1rem' } : {}}>{s.val}</div>
                <div className="stat-filter-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Tabs ── */}
          <div className="admin-tabs" role="tablist">
            {[
              { id: 'all',      icon: 'fa-list',              label: 'All Listings',      badge: stats.totalProviders },
              { id: 'pending',  icon: 'fa-hourglass-half',    label: 'Pending Approvals', badge: pendingProviders.length },
              { id: 'featured', icon: 'fa-star',              label: 'Featured Slots',    badge: featuredCount },
              { id: 'reviews',  icon: 'fa-star-half-alt',     label: 'Review Moderation', badge: pendingReviews.length },
              { id: 'revenue',  icon: 'fa-chart-pie',         label: 'Packages & Revenue',badge: paidProviders.length || undefined },
              { id: 'users',    icon: 'fa-users',             label: 'Users & Accounts',  badge: registeredUsers.length },
              { id: 'logs',     icon: 'fa-clock-rotate-left', label: 'Auth Logs',         badge: authLogs.length > 0 ? authLogs.length : undefined },
            ].map(tab => (
              <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                role="tab" aria-selected={activeTab === tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id !== 'featured') setFeaturedError(''); }}>
                <i className={`fas ${tab.icon}`}></i> {tab.label}
                {tab.badge > 0 && <span className="pending-badge">{tab.badge}</span>}
              </button>
            ))}
          </div>

          {/* ── PENDING APPROVALS ── */}
          {activeTab === 'pending' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-hourglass-half"></i>
                Pending Approval ({pendingProviders.length}) — click a row to review full profile &amp; uploaded documents
              </p>
              {pendingProviders.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-3)' }}>
                  <i className="fas fa-check-circle" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block', color: 'var(--success)' }}></i>
                  No pending registrations at this time.
                </div>
              ) : (
                <div className="adm-pending-scroll">
                  {pendingProviders.map(p => (
                    <ExpandablePendingRow key={p.id} provider={p} onApprove={handleApprove} onReject={handleReject} />
                  ))}
                </div>
              )}
              {pendingProviders.length > 4 && (
                <div className="adm-scroll-hint">
                  <i className="fas fa-chevron-down"></i>
                  Scroll to see all {pendingProviders.length} pending applications
                </div>
              )}
            </div>
          )}

          {/* ── ALL LISTINGS ── */}
          {activeTab === 'all' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-list"></i>
                All Providers ({filteredListings.length} of {providers.length}) — click a listing to view profile details
              </p>
              <div className="adm-search-row">
                <input className="adm-search-input" type="text" placeholder="Search by name, email, or city…"
                  value={listingSearch} onChange={e => setListingSearch(e.target.value)} />
                <select className="adm-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                  {['all','approved','pending','rejected','featured','trusted','community','promoted','demoted'].map(v => (
                    <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                  ))}
                </select>
              </div>
              {featuredError && <div className="adm-err-banner"><i className="fas fa-exclamation-triangle"></i> {featuredError}</div>}
              {filteredListings.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-3)' }}>No providers match your filters.</div>
              ) : (
                <>
                  <div className="adm-scroll-list">
                    {filteredListings.map(provider => {
                      const photoSrc = provider.profilePhoto || provider.photo || provider.image || null;
                      const isSelected = floatingProvider?.id === provider.id;
                      const provCertFiles      = getCertFiles(provider);
                      const provClearanceFiles = getClearanceFiles(provider);
                      return (
                        <div
                          className={`adm-listing-row ${isSelected ? 'selected' : ''}`}
                          key={provider.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setFloatingProvider(provider)}
                        >
                          <div className={`adm-avatar ${photoSrc ? '' : 'no-photo'}`}>
                            {photoSrc ? <img src={photoSrc} alt={provider.name} /> : (provider.name || '?')[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>{provider.name}</strong>
                              <span className={`adm-badge ${provider.status}`}>{provider.status}</span>
                              {provider.promoted && <span className="adm-badge" style={{ background: '#dcfce7', color: '#166534' }}>Promoted</span>}
                              {provider.demoted  && <span className="adm-badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Demoted</span>}
                              {provider.tier === 'featured' && <span className="adm-badge featured"><i className="fas fa-crown"></i> featured</span>}
                              {provider.tier === 'pro'      && <span className="adm-badge pro"><i className="fas fa-check-circle"></i> trusted</span>}
                              {provCertFiles.length > 0      && <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 3, background: '#ecfdf5', color: '#065f46', fontWeight: 700 }}><i className="fas fa-file-alt" style={{ marginRight: 2 }}></i>Cert ({provCertFiles.length})</span>}
                              {provClearanceFiles.length > 0 && <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 3, background: '#eff6ff', color: '#1e40af', fontWeight: 700 }}><i className="fas fa-shield-alt" style={{ marginRight: 2 }}></i>Clearance ({provClearanceFiles.length})</span>}
                              {featuredSlots.some(s => s.providerId === provider.id) && (
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#fde68a', color: '#92400e' }}>
                                  <i className="fas fa-star" style={{ marginRight: 3 }}></i>Slot #{featuredSlots.find(s => s.providerId === provider.id)?.id}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 2 }}>
                              {provider.city}, {provider.province} · {provider.email}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}
                            onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button className="adm-promote-btn" onClick={() => handlePromote(provider.id)}><i className="fas fa-arrow-up"></i> Promote</button>
                              <button className="adm-demote-btn"  onClick={() => handleDemote(provider.id)}><i className="fas fa-arrow-down"></i> Demote</button>
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {['community', 'trusted', 'featured'].map(b => {
                                const isSelected = provider.tier === (b === 'community' ? 'free' : b === 'trusted' ? 'pro' : 'featured');
                                const inSlot = b === 'featured' && featuredSlots.some(s => s.providerId === provider.id);
                                return (
                                  <span key={b} className={`adm-badge-opt ${b} ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleBadgeSelect(provider.id, b)} role="button" tabIndex="0">
                                    {b === 'featured' && <i className="fas fa-star" style={{ fontSize: '0.65rem' }}></i>}
                                    {b.charAt(0).toUpperCase() + b.slice(1)}
                                    {inSlot && <i className="fas fa-check" style={{ fontSize: '0.6rem', marginLeft: 2 }}></i>}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {filteredListings.length > 4 && (
                    <div className="adm-scroll-hint">
                      <i className="fas fa-mouse-pointer"></i>
                      {filteredListings.length - 4} more providers · scroll to view · click any row to see full profile
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── FEATURED SLOTS ── */}
          {activeTab === 'featured' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-star"></i>
                Featured Slots ({featuredCount}/{MAX_FEATURED_SLOTS} occupied)
              </p>
              {featuredError && <div className="adm-err-banner"><i className="fas fa-exclamation-triangle"></i> {featuredError}</div>}
              <div className="adm-featured-slots-grid">
                {featuredSlots.map(slot => (
                  <InlineFeaturedSlotCard key={slot.id} slot={slot} onRemove={handleRemoveFeatured} onRotate={handleRotateFeatured} />
                ))}
              </div>
            </div>
          )}

          {/* ── REVIEW MODERATION ── */}
          {activeTab === 'reviews' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading"><i className="fas fa-star-half-alt"></i> Moderate Reviews ({pendingReviews.length} pending)</p>
              {pendingReviews.map(review => (
                <ReviewCard key={review.id} review={review} onModerate={handleModerateReview} />
              ))}
              <div className="info-block">
                <i className="fas fa-circle-info"></i>
                <p><strong>Review Moderation:</strong> Only approved reviews appear on client profile pages.</p>
              </div>
            </div>
          )}

          {/* ── PACKAGES & REVENUE ── */}
          {activeTab === 'revenue' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-chart-pie"></i>
                Package Sales &amp; Revenue Overview
              </p>

              <div className="adm-pkg-grid">
                {Object.entries(PACKAGE_CONFIG).map(([key, cfg]) => {
                  const pkgProviders = packageSales[key] || [];
                  const approved  = pkgProviders.filter(p => p.status === 'approved').length;
                  const pending   = pkgProviders.filter(p => p.status === 'pending').length;
                  const revenue   = pkgProviders.length * cfg.price;
                  return (
                    <div className="adm-pkg-card" key={key} style={{ borderColor: cfg.color }}>
                      <div className="adm-pkg-card-head" style={{ background: cfg.bg }}>
                        <span className="adm-pkg-card-name" style={{ color: cfg.color }}>
                          {key === 'community' && <i className="fas fa-users" style={{ marginRight: 6 }}></i>}
                          {key === 'trusted'   && <i className="fas fa-check-circle" style={{ marginRight: 6 }}></i>}
                          {key === 'deluxe'    && <i className="fas fa-crown" style={{ marginRight: 6 }}></i>}
                          {cfg.label}
                        </span>
                        <span className="adm-pkg-price-tag" style={{ background: cfg.color + '22', color: cfg.color }}>
                          {cfg.price === 0 ? 'Free' : `R ${cfg.price}/mo`}
                        </span>
                      </div>
                      <div className="adm-pkg-card-body">
                        <div className="adm-pkg-stat">
                          <span className="adm-pkg-stat-label">Total signed up</span>
                          <span className="adm-pkg-stat-val">{pkgProviders.length}</span>
                        </div>
                        <div className="adm-pkg-stat">
                          <span className="adm-pkg-stat-label">Approved / Live</span>
                          <span className="adm-pkg-stat-val" style={{ color: '#065f46' }}>{approved}</span>
                        </div>
                        <div className="adm-pkg-stat">
                          <span className="adm-pkg-stat-label">Pending review</span>
                          <span className="adm-pkg-stat-val" style={{ color: '#92400e' }}>{pending}</span>
                        </div>
                        <div className="adm-pkg-stat">
                          <span className="adm-pkg-stat-label">Revenue generated</span>
                          <span className="adm-pkg-stat-val" style={{ color: cfg.price > 0 ? '#c9621a' : '#aaa' }}>
                            {cfg.price === 0 ? '—' : fmtZAR(revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="adm-revenue-summary">
                <div className="adm-rev-box">
                  <div className="adm-rev-box-val">{fmtZAR(totalRevenue)}</div>
                  <div className="adm-rev-box-label">Total Revenue</div>
                </div>
                <div className="adm-rev-box">
                  <div className="adm-rev-box-val">{paidProviders.length}</div>
                  <div className="adm-rev-box-label">Paid Subscribers</div>
                </div>
                <div className="adm-rev-box">
                  <div className="adm-rev-box-val">
                    {paidProviders.length > 0 ? fmtZAR(Math.round(totalRevenue / paidProviders.length)) : '—'}
                  </div>
                  <div className="adm-rev-box-label">Avg. Revenue / Provider</div>
                </div>
              </div>

              <p className="section-heading" style={{ marginTop: 24 }}>
                <i className="fas fa-receipt"></i>
                Paid Subscribers ({revenueProviders.length} of {paidProviders.length})
              </p>
              <div className="adm-search-row">
                <input className="adm-search-input" type="text" placeholder="Search by name or email…"
                  value={revenueSearch} onChange={e => setRevenueSearch(e.target.value)} />
                <select className="adm-filter-select" value={revenuePkgFilter} onChange={e => setRevenuePkgFilter(e.target.value)}>
                  <option value="ALL">All Paid Packages</option>
                  <option value="trusted">Trusted Provider</option>
                  <option value="deluxe">Deluxe Provider</option>
                </select>
              </div>
              {revenueProviders.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>
                  <i className="fas fa-receipt" style={{ fontSize: '1.8rem', display: 'block', marginBottom: 8, opacity: 0.25 }}></i>
                  No paid subscribers yet.
                </div>
              ) : (
                <>
                  <div className="adm-revenue-scroll" style={{ border: '1px solid #e5e0d8', borderRadius: 10, background: '#fff' }}>
                    <table className="adm-rev-table">
                      <thead>
                        <tr>
                          <th>Provider</th>
                          <th>Email</th>
                          <th>Package</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueProviders.map((p, i) => {
                          const key = resolvePackageKey(p);
                          const cfg = PACKAGE_CONFIG[key];
                          const photoSrc = p.profilePhoto || p.photo || p.image || null;
                          return (
                            <tr key={p.id || i} style={{ cursor: 'pointer' }} onClick={() => setFloatingProvider(p)}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div className={`adm-avatar ${photoSrc ? '' : 'no-photo'}`} style={{ width: 30, height: 30, fontSize: '0.75rem', borderRadius: 6, flexShrink: 0 }}>
                                    {photoSrc ? <img src={photoSrc} alt={p.name} /> : (p.name || '?')[0].toUpperCase()}
                                  </div>
                                  <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>{p.name || '—'}</span>
                                </div>
                              </td>
                              <td style={{ color: '#555', fontSize: '0.8rem' }}>{p.email || '—'}</td>
                              <td>
                                <span className="adm-pkg-price-tag" style={{ background: cfg.bg, color: cfg.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 }}>
                                  {cfg.label}
                                </span>
                              </td>
                              <td style={{ fontWeight: 800, color: '#c9621a' }}>{fmtZAR(cfg.price)}</td>
                              <td><span className={`adm-badge ${p.status}`}>{p.status}</span></td>
                              <td style={{ color: '#888', fontSize: '0.78rem' }}>{fmtShortDate(p.registered)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {revenueProviders.length > 4 && (
                    <div className="adm-scroll-hint">
                      <i className="fas fa-chevron-down"></i>
                      {revenueProviders.length - 4} more subscribers · scroll to view · click any row to see full profile
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── USERS & ACCOUNTS ── */}
          {activeTab === 'users' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-users"></i>
                All Registered Accounts ({timeFilteredUsers.length} shown of {registeredUsers.length} total) —&nbsp;
                <span style={{ color: '#0e7490' }}>{parentUsers.length} parent/family</span>
                <span style={{ color: '#888', margin: '0 6px' }}>·</span>
                <span style={{ color: '#92400e' }}>{providerAccounts.length} providers</span>
              </p>

              <div className="adm-time-tabs">
                {[
                  { key: 'ALL',      label: 'All Time',      icon: 'fa-infinity' },
                  { key: 'WEEK',     label: 'This Week',     icon: 'fa-calendar-week' },
                  { key: 'MONTH',    label: 'This Month',    icon: 'fa-calendar' },
                  { key: '3MONTHS',  label: 'Last 3 Months', icon: 'fa-calendar-alt' },
                  { key: '6MONTHS',  label: 'Last 6 Months', icon: 'fa-calendar-alt' },
                  { key: 'YEAR',     label: 'This Year',     icon: 'fa-calendar-check' },
                ].map(t => (
                  <button key={t.key} className={`adm-time-tab ${userTimeFilter === t.key ? 'active' : ''}`}
                    onClick={() => setUserTimeFilter(t.key)}>
                    <i className={`fas ${t.icon}`}></i> {t.label}
                    <span style={{ marginLeft: 4, fontSize: '0.68rem', opacity: 0.8 }}>
                      ({applyTimeFilter(filteredUsers, t.key).length})
                    </span>
                  </button>
                ))}
              </div>

              <div className="adm-search-row">
                <input className="adm-search-input" type="text" placeholder="Search by email or name…"
                  value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              </div>
              <div className="adm-role-tabs">
                {[
                  { key: 'ALL',      label: 'All Accounts',     icon: 'fa-users',         count: registeredUsers.length },
                  { key: 'USER',     label: 'Parents/Families', icon: 'fa-house-chimney',  count: parentUsers.length },
                  { key: 'PROVIDER', label: 'Providers',        icon: 'fa-store',          count: providerAccounts.length },
                  { key: 'ADMIN',    label: 'Admins',           icon: 'fa-shield-halved',  count: registeredUsers.filter(u => u.role === 'ADMIN').length },
                ].map(tab => (
                  <button key={tab.key} className={`adm-role-tab ${userRoleFilter === tab.key ? 'active' : ''}`}
                    onClick={() => setUserRoleFilter(tab.key)}>
                    <i className={`fas ${tab.icon}`}></i> {tab.label}
                    <span className="adm-role-tab-count">{tab.count}</span>
                  </button>
                ))}
              </div>
              {timeFilteredUsers.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>
                  <i className="fas fa-users" style={{ fontSize: '1.8rem', display: 'block', marginBottom: 8, opacity: 0.3 }}></i>
                  No accounts found{userTimeFilter !== 'ALL' ? ' in this time period' : ''}.
                </div>
              ) : (
                <>
                  <div className="adm-users-scroll">
                    {timeFilteredUsers.map((u, i) => {
                      const roleInfo = getRoleDisplay(u);
                      const photoSrc = u.profilePhoto || u.photo || u.image || null;
                      return (
                        <div key={u.id || i} className="adm-user-row">
                          <div className={`adm-avatar ${photoSrc ? '' : roleInfo.cls}`}>
                            {photoSrc ? <img src={photoSrc} alt={u.email} /> : (u.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="adm-user-info">
                            <div className="adm-user-email">
                              {u.email}
                              {u.name && <span style={{ fontWeight: 500, color: '#888', marginLeft: 8, fontSize: '0.82rem' }}>({u.name})</span>}
                            </div>
                            <div className="adm-user-meta">
                              <span><i className="fas fa-clock"></i> Registered: {fmtDate(u.registered)}</span>
                              {u.lastLogin && <span><i className="fas fa-sign-in-alt"></i> Last login: {fmtDate(u.lastLogin)}</span>}
                              {u.status && u.role === 'PROVIDER' && <span><i className="fas fa-circle"></i> {u.status}</span>}
                              {u.plan && u.role === 'PROVIDER' && <span><i className="fas fa-layer-group"></i> {u.plan}</span>}
                            </div>
                          </div>
                          <span className="adm-badge" style={roleInfo.badge}>{roleInfo.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {timeFilteredUsers.length > 4 && (
                    <div className="adm-scroll-hint">
                      <i className="fas fa-chevron-down"></i>
                      {timeFilteredUsers.length - 4} more accounts · scroll to view
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── AUTH LOGS ── */}
          {activeTab === 'logs' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading"><i className="fas fa-clock-rotate-left"></i> Authentication Logs ({filteredLogs.length} entries)</p>
              <div className="adm-search-row">
                <input className="adm-search-input" type="text" placeholder="Search by email…"
                  value={logSearch} onChange={e => setLogSearch(e.target.value)} />
                <select className="adm-filter-select" value={logEventFilter} onChange={e => setLogEventFilter(e.target.value)}>
                  <option value="ALL">All Events</option>
                  <option value="REGISTER">Register</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                </select>
              </div>
              <div style={{ border: '1px solid #f0ece5', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                {filteredLogs.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>
                    <i className="fas fa-scroll" style={{ fontSize: '1.8rem', display: 'block', marginBottom: 8, opacity: 0.25 }}></i>
                    No authentication events logged yet.
                  </div>
                ) : (
                  <div className="adm-logs-scroll">
                    {filteredLogs.map((log, i) => (
                      <div key={i} className="adm-log-row">
                        <span className={`adm-log-event ${log.event}`}>{log.event}</span>
                        <span className="adm-log-email">{log.email}</span>
                        <span className={`adm-log-role ${log.role}`}>{log.role}</span>
                        <span className="adm-log-time">{fmtDate(log.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {filteredLogs.length > 4 && (
                  <div className="adm-scroll-hint" style={{ padding: '8px 0' }}>
                    <i className="fas fa-chevron-down"></i>
                    {filteredLogs.length - 4} more log entries
                  </div>
                )}
              </div>
            </div>
          )}

          <hr />
          <div className="audit-row">
            <span className="audit-chip"><i className="fas fa-clock-rotate-left"></i> audit log</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.82rem', color: 'var(--ink-3)' }}>
              <i className="fas fa-toggle-on" style={{ color: 'var(--success)' }}></i>
              manual verification override active
            </span>
          </div>
        </div>
      </main>

      {/* ── Floating Profile Card (All Listings tab) ── */}
      {floatingProvider && (
        <FloatingProfileCard
          provider={floatingProvider}
          featuredSlots={featuredSlots}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setFloatingProvider(null)}
        />
      )}

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={closeModal} title={modalContent.title}>
          <div dangerouslySetInnerHTML={{ __html: modalContent.body }} />
        </Modal>
      )}

      <Footer />
    </>
  );
};

export default AdminDashboard;