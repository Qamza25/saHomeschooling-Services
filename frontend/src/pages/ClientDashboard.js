// frontend/src/pages/ClientDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ProfileSection from '../components/client/ProfileSection';
import ServiceItem from '../components/client/ServiceItem';
import PlanSelector from '../components/client/PlanSelector';
import TagsInput from '../components/client/TagsInput';
import { PLAN_LIMITS, DAYS_OF_WEEK, PRICING_MODELS, PROVINCES } from '../utils/constants';
import { getPlanLimits } from '../utils/helpers';
import '../assets/css/dashboard.css';

/* ─────────────── localStorage helpers ─────────────── */
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('sah_current_user') || 'null'); }
  catch { return null; }
}
function getProviderById(id) {
  try {
    const all = JSON.parse(localStorage.getItem('sah_providers') || '[]');
    return all.find(p => p.id === id) || null;
  } catch { return null; }
}
function saveProviderById(updated) {
  try {
    const all = JSON.parse(localStorage.getItem('sah_providers') || '[]');
    const idx = all.findIndex(p => p.id === updated.id);
    if (idx !== -1) all[idx] = updated; else all.push(updated);
    localStorage.setItem('sah_providers', JSON.stringify(all));
  } catch {}
}

/* ─────────────── empty profile shape ─────────────── */
const EMPTY_PROFILE = {
  id: '', name: '', email: '', accountType: 'Individual Provider',
  yearsExperience: '', languages: [], primaryCategory: '', secondaryCategories: [],
  tags: [], bio: '', degrees: '', certifications: '', memberships: '', clearance: '',
  services: [{ title: '', description: '', ageGroups: [], deliveryMode: 'Online', subjects: '' }],
  serviceTitle: '', serviceDesc: '', subjects: '', ageGroups: [],
  province: '', city: '', serviceAreas: [], serviceAreaType: 'national', radius: '',
  deliveryMode: '', pricingModel: '', startingPrice: '',
  availabilityDays: [], availabilityNotes: '',
  contactName: '', phone: '', whatsapp: '', contactEmail: '',
  social: '', website: '', facebook: '', publicToggle: true,
  plan: 'free', listingPublic: true, status: 'pending',
  image: null, photo: null, profilePhoto: null,
  reviews: { average: 0, count: 0, items: [] },
};

/* ─────────────── plan definitions ─────────────── */
const PLAN_CARDS = [
  {
    id: 'free',
    name: 'Community Member',
    desc: 'Basic profile — always free',
    price: 'R0',
    features: [
      'Basic profile information',
      '1 service listing',
      'Contact form only',
      'Max 1 service',
    ],
  },
  {
    id: 'pro',
    name: 'Trusted Provider',
    desc: 'Full profile + direct contact details',
    price: 'R149',
    features: [
      'Everything in Community',
      'Up to 5 services',
      'Direct contact details',
      'Phone & WhatsApp visible',
      'Max 5 services',
    ],
  },
  {
    id: 'featured',
    name: 'Featured Partner',
    desc: 'Homepage placement + analytics',
    price: 'R399',
    features: [
      'Everything in Trusted',
      'Homepage featured slot',
      'Priority in search results',
      'Basic analytics',
      'Max 10 services',
    ],
  },
];

/* ─────────────── tabs ─────────────── */
const TABS = [
  { id: 'profile',  label: 'Profile',            icon: 'fa-user' },
  { id: 'services', label: 'Services',            icon: 'fa-briefcase' },
  { id: 'location', label: 'Location & Pricing',  icon: 'fa-map-marker-alt' },
  { id: 'contact',  label: 'Contact & Social',    icon: 'fa-address-card' },
  { id: 'plan',     label: 'Plan & Reviews',      icon: 'fa-crown' },
];

/* ─────────────── inline CSS ─────────────── */
const DASH_CSS = `
  .cd-wrap { font-family:'DM Sans','Segoe UI',sans-serif; background:#f4f1ec; min-height:100vh; -webkit-font-smoothing:antialiased; }
  .cd-wrap * { box-sizing:border-box; }

  /* HERO */
  .cd-hero {
    background:linear-gradient(135deg,#3a3a3a 0%,#5a5a5a 55%,#c9621a 100%);
    padding:32px 0 0; position:relative; overflow:hidden;
  }
  .cd-hero::before {
    content:''; position:absolute; inset:0;
    background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .cd-hero-top { max-width:1280px; margin:0 auto; padding:0 32px 28px; position:relative; z-index:1; display:flex; align-items:flex-start; justify-content:space-between; gap:20px; flex-wrap:wrap; }
  .cd-hero-left { flex:1; min-width:0; }
  .cd-hero-eyebrow { font-size:0.67rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,0.5); margin-bottom:7px; display:flex; align-items:center; gap:8px; }
  .cd-hero-eyebrow span { width:20px; height:1px; background:rgba(255,255,255,0.3); display:inline-block; }
  .cd-hero-title { font-size:clamp(1.4rem,2.5vw,1.9rem); font-weight:800; color:#fff; margin:0 0 10px; line-height:1.15; font-family:'Playfair Display',Georgia,serif; }
  .cd-hero-title em { font-style:italic; color:#f0c89a; }
  .cd-hero-meta { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .cd-status-pill { display:inline-flex; align-items:center; gap:6px; padding:5px 14px; border-radius:50px; font-size:0.75rem; font-weight:700; }
  .cd-status-pill.pending  { background:rgba(245,158,11,.2); color:#fbbf24; border:1px solid rgba(245,158,11,.35); }
  .cd-status-pill.approved { background:rgba(16,185,129,.2); color:#34d399; border:1px solid rgba(16,185,129,.35); }
  .cd-status-pill.rejected { background:rgba(239,68,68,.2);  color:#f87171; border:1px solid rgba(239,68,68,.35); }
  .cd-hero-right { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }

  /* hero action buttons */
  .cd-btn-ghost { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:7px; border:1.5px solid rgba(255,255,255,.38); background:rgba(255,255,255,.07); color:#fff; font-size:0.81rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all .17s; text-decoration:none; white-space:nowrap; }
  .cd-btn-ghost:hover { background:rgba(255,255,255,.18); border-color:rgba(255,255,255,.75); }
  .cd-btn-solid { display:inline-flex; align-items:center; gap:6px; padding:8px 18px; border-radius:7px; border:none; background:#c9621a; color:#fff; font-size:0.81rem; font-weight:700; cursor:pointer; font-family:inherit; transition:all .17s; white-space:nowrap; }
  .cd-btn-solid:hover { background:#a84e12; transform:translateY(-1px); }
  .cd-btn-solid:disabled { opacity:.6; cursor:not-allowed; transform:none; }
  .cd-btn-solid.cancel { background:#6b7280; }
  .cd-btn-solid.cancel:hover { background:#4b5563; }

  /* TAB BAR — sits at bottom of hero */
  .cd-tab-bar { max-width:1280px; margin:0 auto; padding:0 32px; display:flex; gap:2px; position:relative; z-index:10; }
  .cd-tab-btn { padding:10px 18px; background:rgba(255,255,255,.1); border:none; border-bottom:none; color:rgba(255,255,255,.6); font-size:0.8rem; font-weight:600; cursor:pointer; font-family:inherit; border-radius:8px 8px 0 0; transition:all .15s; display:inline-flex; align-items:center; gap:7px; white-space:nowrap; }
  .cd-tab-btn:hover { background:rgba(255,255,255,.2); color:#fff; }
  .cd-tab-btn.active { background:#f4f1ec; color:#c9621a; font-weight:700; }

  /* MAIN */
  .cd-main { max-width:1280px; margin:0 auto; padding:22px 32px 64px; }

  /* TWO-COLUMN LAYOUT */
  .cd-layout { display:grid; grid-template-columns:1fr 300px; gap:18px; align-items:start; }

  /* CARDS */
  .cd-card { background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.04); margin-bottom:16px; border:1px solid rgba(0,0,0,.05); }
  .cd-card-header { display:flex; align-items:center; gap:11px; padding:14px 20px; border-bottom:1px solid #f0ece5; background:#faf9f7; }
  .cd-card-header-icon { width:34px; height:34px; border-radius:8px; background:linear-gradient(135deg,#c9621a,#e07a35); display:flex; align-items:center; justify-content:center; color:#fff; font-size:0.8rem; flex-shrink:0; }
  .cd-card-title    { font-size:0.88rem; font-weight:700; color:#1a1a1a; margin:0; }
  .cd-card-subtitle { font-size:0.71rem; color:#888; margin:1px 0 0; }
  .cd-card-body     { padding:20px; }
  .cd-card-body.tight { padding:14px 20px; }

  /* EDIT TOGGLE — placed in card-header */
  .cd-edit-toggle { margin-left:auto; display:inline-flex; align-items:center; gap:6px; padding:6px 13px; border-radius:6px; cursor:pointer; font-size:0.75rem; font-weight:700; border:1.5px solid; transition:all .15s; font-family:inherit; }
  .cd-edit-toggle.inactive { border-color:#d1d5db; background:transparent; color:#6b7280; }
  .cd-edit-toggle.inactive:hover { border-color:#c9621a; color:#c9621a; }
  .cd-edit-toggle.active { border-color:#c9621a; background:#fef3e8; color:#c9621a; }

  /* FIELDS */
  .cd-field { margin-bottom:14px; }
  .cd-field:last-child { margin-bottom:0; }
  .cd-label { display:block; font-size:0.67rem; font-weight:700; text-transform:uppercase; letter-spacing:.8px; color:#888; margin-bottom:5px; }
  .cd-label .req { color:#c9621a; }
  .cd-value { font-size:0.87rem; color:#1a1a1a; padding:7px 0; border-bottom:1px solid #f0ece5; min-height:32px; display:flex; align-items:center; }
  .cd-value.empty { color:#bbb; font-style:italic; }
  .cd-input { width:100%; padding:9px 12px; border:1.5px solid #e5e0d8; border-radius:7px; background:#faf9f7; font-family:inherit; font-size:0.87rem; color:#1a1a1a; outline:none; transition:border-color .15s,box-shadow .15s; -webkit-appearance:none; appearance:none; }
  .cd-input:focus { border-color:#c9621a; box-shadow:0 0 0 3px rgba(201,98,26,.11); }
  .cd-textarea { resize:vertical; min-height:82px; }
  .cd-select { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 11px center; padding-right:30px; cursor:pointer; }

  /* grid helpers */
  .cd-row   { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .cd-row-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }

  /* ── SERVICE CARD VIEW & EDIT — 3-col grid ── */
  .cd-svc-card { background:#faf9f7; border:1px solid #e5e0d8; border-radius:9px; padding:14px 16px; margin-bottom:10px; }
  .cd-svc-card.editing { border-color:#c9621a; background:#fff; }
  .cd-svc-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; align-items:start; }
  .cd-svc-grid .cd-field { margin-bottom:0; }

  /* section label */
  .cd-sec-label { font-size:0.67rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#c9621a; display:flex; align-items:center; gap:7px; padding-bottom:8px; border-bottom:1px solid #f0ece5; margin:16px 0 12px; }

  /* days chips */
  .cd-days { display:flex; flex-wrap:wrap; gap:7px; }
  .cd-day-chip { padding:5px 12px; border-radius:20px; font-size:0.77rem; font-weight:600; transition:all .13s; border:none; }
  .cd-day-chip.on  { background:#c9621a; color:#fff; cursor:default; }
  .cd-day-chip.off { background:#f0ece5; color:#bbb; border:1px solid #e5e0d8; cursor:default; }
  .cd-day-chip.clickable.off:hover { border-color:#c9621a; color:#c9621a; cursor:pointer; }
  .cd-day-chip.clickable { cursor:pointer; }

  /* tags */
  .cd-tags { display:flex; flex-wrap:wrap; gap:7px; }
  .cd-tag { display:inline-flex; align-items:center; gap:4px; padding:3px 11px; border-radius:20px; background:#fef3e8; color:#c9621a; border:1px solid #f0c89a; font-size:0.75rem; font-weight:600; }
  .cd-tag button { background:none; border:none; cursor:pointer; color:#c9621a; font-size:0.68rem; padding:0; line-height:1; }

  /* plan badge */
  .cd-plan-badge { display:inline-flex; align-items:center; gap:7px; padding:8px 15px; border-radius:9px; font-size:0.82rem; font-weight:700; border:2px solid; }
  .cd-plan-badge.free     { background:#f9f9f9; color:#666;    border-color:#e5e5e5; }
  .cd-plan-badge.pro      { background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; }
  .cd-plan-badge.featured { background:#fffbeb; color:#d97706; border-color:#fde68a; }

  /* PLAN CARDS GRID */
  .cd-plan-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  .cd-plan-card { border:2px solid #e5e0d8; border-radius:11px; padding:17px; background:#fff; position:relative; transition:border-color .18s; }
  .cd-plan-card.is-current { border-color:#c9621a; background:#fffaf6; }
  .cd-plan-current-badge { position:absolute; top:-1px; right:14px; background:#c9621a; color:#fff; font-size:0.63rem; font-weight:800; letter-spacing:.8px; text-transform:uppercase; padding:3px 9px; border-radius:0 0 7px 7px; }
  .cd-plan-card-name  { font-size:0.92rem; font-weight:800; color:#1a1a1a; margin-bottom:2px; }
  .cd-plan-card-desc  { font-size:0.72rem; color:#888; margin-bottom:9px; }
  .cd-plan-price      { font-family:'Playfair Display',serif; font-size:1.5rem; font-weight:900; color:#c9621a; line-height:1; margin-bottom:11px; }
  .cd-plan-price small { font-size:0.59rem; color:#888; font-weight:400; font-family:'DM Sans',sans-serif; display:block; margin-top:2px; }
  .cd-plan-features   { list-style:none; padding:0; margin:0 0 4px; display:flex; flex-direction:column; gap:5px; }
  .cd-plan-features li { display:flex; align-items:center; gap:6px; font-size:0.77rem; color:#555; }
  .cd-plan-features li i { color:#10b981; font-size:0.63rem; }
  .cd-plan-action-btn { width:100%; margin-top:12px; padding:9px; border-radius:7px; font-size:0.8rem; font-weight:700; cursor:pointer; border:none; font-family:inherit; transition:all .15s; display:flex; align-items:center; justify-content:center; gap:6px; }
  .cd-plan-action-btn.current   { background:#fef3e8; color:#c9621a; border:2px solid #c9621a; cursor:default; pointer-events:none; }
  .cd-plan-action-btn.upgrade   { background:#c9621a; color:#fff; }
  .cd-plan-action-btn.upgrade:hover   { background:#a84e12; }
  .cd-plan-action-btn.downgrade { background:#f3f4f6; color:#6b7280; border:1.5px solid #d1d5db; }
  .cd-plan-action-btn.downgrade:hover { background:#e5e7eb; }

  /* review */
  .cd-review { padding:12px 14px; background:#faf9f7; border-radius:9px; border-left:3px solid #c9621a; margin-bottom:9px; }
  .cd-review-stars  { color:#f59e0b; font-size:0.82rem; margin-bottom:3px; }
  .cd-review-text   { font-size:0.84rem; color:#555; font-style:italic; }
  .cd-review-author { font-size:0.72rem; color:#888; margin-top:3px; font-weight:600; }

  /* contact */
  .cd-contact-item { display:flex; align-items:center; gap:11px; padding:10px 0; border-bottom:1px solid #f0ece5; }
  .cd-contact-item:last-child { border-bottom:none; }
  .cd-contact-icon { width:31px; height:31px; border-radius:7px; background:#fef3e8; display:flex; align-items:center; justify-content:center; color:#c9621a; font-size:0.8rem; flex-shrink:0; }
  .cd-contact-label { font-size:0.67rem; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#aaa; }
  .cd-contact-val   { font-size:0.85rem; color:#1a1a1a; font-weight:500; }

  /* toggle switch */
  .cd-toggle-row { display:flex; align-items:center; justify-content:space-between; }
  .cd-switch { position:relative; display:inline-block; width:40px; height:22px; }
  .cd-switch input { opacity:0; width:0; height:0; }
  .cd-slider { position:absolute; cursor:pointer; inset:0; background:#d1d5db; border-radius:22px; transition:.2s; }
  .cd-slider::before { content:''; position:absolute; height:16px; width:16px; left:3px; bottom:3px; background:#fff; border-radius:50%; transition:.2s; box-shadow:0 1px 3px rgba(0,0,0,.18); }
  .cd-switch input:checked + .cd-slider { background:#c9621a; }
  .cd-switch input:checked + .cd-slider::before { transform:translateX(18px); }

  /* footer save bar */
  .cd-footer-bar { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; background:#faf9f7; border-top:1px solid #f0ece5; gap:10px; flex-wrap:wrap; }
  .cd-last-edit { font-size:0.72rem; color:#aaa; display:flex; align-items:center; gap:5px; }

  /* clearance badge */
  .cd-clearance { display:inline-flex; align-items:center; gap:6px; padding:4px 11px; border-radius:6px; background:#ecfdf5; color:#059669; border:1px solid #a7f3d0; font-size:0.75rem; font-weight:700; }

  /* info note */
  .cd-info-note { display:flex; align-items:flex-start; gap:8px; padding:10px 13px; background:#fffbeb; border-radius:7px; border:1px solid #fde68a; font-size:0.77rem; color:#92400e; margin-bottom:12px; }
  .cd-info-note i { color:#f59e0b; margin-top:1px; flex-shrink:0; }
  .cd-info-note.last { margin-bottom:0; }

  /* qual parsed success */
  .cd-qual-parsed { padding:9px 13px; background:#ecfdf5; border-radius:7px; border:1px solid #a7f3d0; font-size:0.77rem; color:#065f46; margin-top:8px; display:flex; align-items:center; gap:7px; }

  /* PHOTO — always clickable */
  .cd-photo-wrap { position:relative; display:inline-block; flex-shrink:0; }
  .cd-photo-img  { width:76px; height:76px; border-radius:50%; object-fit:cover; border:3px solid #c9621a; display:block; }
  .cd-photo-placeholder { width:76px; height:76px; border-radius:50%; background:#fef3e8; border:3px solid #c9621a; display:flex; align-items:center; justify-content:center; color:#c9621a; font-size:1.5rem; }
  .cd-photo-btn { position:absolute; bottom:0; right:0; background:#c9621a; color:#fff; border:2px solid #fff; border-radius:50%; width:25px; height:25px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:0.67rem; transition:background .15s; }
  .cd-photo-btn:hover { background:#a84e12; }
  .cd-photo-input { display:none; }

  /* SIDEBAR */
  .cd-sidebar-card { background:#fff; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,.06); margin-bottom:14px; border:1px solid rgba(0,0,0,.05); overflow:hidden; }
  .cd-sidebar-header { padding:12px 16px; background:#5a5a5a; }
  .cd-sidebar-title { font-size:0.75rem; font-weight:700; color:#fff; text-transform:uppercase; letter-spacing:.7px; }
  .cd-sidebar-body  { padding:14px 16px; }

  /* completeness item */
  .cd-comp-item { display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid #f8f6f3; }
  .cd-comp-item:last-of-type { border-bottom:none; }

  /* RESPONSIVE */
  @media(max-width:1024px) { .cd-layout { grid-template-columns:1fr; } .cd-plan-grid { grid-template-columns:1fr; } }
  @media(max-width:768px)  {
    .cd-main { padding:16px 14px 48px; }
    .cd-hero-top { padding:0 16px 24px; }
    .cd-tab-bar { padding:0 14px; overflow-x:auto; flex-wrap:nowrap; }
    .cd-row { grid-template-columns:1fr; }
    .cd-svc-grid { grid-template-columns:1fr 1fr; }
  }
  @media(max-width:520px)  {
    .cd-svc-grid { grid-template-columns:1fr; }
    .cd-row-3    { grid-template-columns:1fr 1fr; }
    .cd-plan-grid { grid-template-columns:1fr; }
  }
`;

/* ═══════════════════════════════════════════════════ */
/*   COMPONENT                                         */
/* ═══════════════════════════════════════════════════ */
const ClientDashboard = () => {
  const { user, updateUserPlan } = useAuth();
  const { showNotification }     = useNotification();
  const navigate                 = useNavigate();
  const photoInputRef            = useRef(null);

  const [activeTab,    setActiveTab]    = useState('profile');
  const [editing,      setEditing]      = useState(false);
  const [snapshot,     setSnapshot]     = useState(null);   // for cancel
  const [profileData,  setProfileData]  = useState(EMPTY_PROFILE);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading,      setLoading]      = useState(false);

  /* inject CSS once */
  useEffect(() => {
    if (!document.getElementById('cd-styles')) {
      const s = document.createElement('style');
      s.id = 'cd-styles'; s.textContent = DASH_CSS;
      document.head.appendChild(s);
    }
    if (!document.getElementById('cd-fonts')) {
      const l = document.createElement('link');
      l.id = 'cd-fonts'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@400;500;600;700&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  /* load data */
  useEffect(() => {
    const cu = getCurrentUser();
    if (!cu) { navigate('/login'); return; }
    const stored = cu.id ? getProviderById(cu.id) : null;
    if (stored) {
      setProfileData({ ...EMPTY_PROFILE, ...stored });
      const photo = stored.profilePhoto || stored.photo || stored.image || null;
      setPhotoPreview(photo);
    } else {
      setProfileData(prev => ({
        ...prev,
        id: cu.id || prev.id,
        name: cu.name || prev.name,
        email: cu.email || prev.email,
        plan: cu.plan || prev.plan,
        contactEmail: cu.email || prev.contactEmail,
      }));
    }
  }, [navigate]);

  /* computed */
  const maxServices  = (getPlanLimits && getPlanLimits(profileData.plan)?.maxServices) || (profileData.plan === 'featured' ? 10 : profileData.plan === 'pro' ? 5 : 1);
  const svcCount     = profileData.services?.length || 1;
  const isPaidPlan   = profileData.plan === 'pro' || profileData.plan === 'featured';
  const planOrder    = { free: 0, pro: 1, featured: 2 };

  /* ─── edit helpers ─── */
  const startEdit   = () => { setSnapshot({ ...profileData }); setEditing(true); };
  const cancelEdit  = () => { if (snapshot) setProfileData(snapshot); setEditing(false); showNotification('Changes discarded', 'info'); };
  const toggleEdit  = () => editing ? cancelEdit() : startEdit();

  const upd = (patch) => setProfileData(prev => ({ ...prev, ...patch }));

  const saveChanges = () => {
    setLoading(true);
    try {
      const toSave = { ...profileData, social: profileData.website || profileData.social || '' };
      saveProviderById(toSave);
      const cu = getCurrentUser();
      if (cu) localStorage.setItem('sah_current_user', JSON.stringify({ ...cu, name: profileData.name, plan: profileData.plan }));
      setSnapshot({ ...profileData });
      setEditing(false);
      showNotification('Changes saved!', 'success');
    } catch { showNotification('Error saving changes', 'error'); }
    finally { setLoading(false); }
  };

  /* ─── photo (always active, no edit mode required) ─── */
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result;
      setPhotoPreview(b64);
      upd({ photo: b64, image: b64, profilePhoto: b64 });
      // auto-save photo immediately
      const toSave = { ...profileData, photo: b64, image: b64, profilePhoto: b64, social: profileData.website || profileData.social || '' };
      saveProviderById(toSave);
      showNotification('Photo updated!', 'success');
    };
    reader.readAsDataURL(file);
  };

  /* ─── service helpers ─── */
  const addService    = () => { if (svcCount < maxServices) upd({ services: [...profileData.services, { title: '', ageGroups: [], deliveryMode: 'Online', description: '', subjects: '' }] }); };
  const updService    = (i, s) => { const a = [...profileData.services]; a[i] = s; upd({ services: a }); };
  const removeService = (i)    => { if (profileData.services.length > 1) upd({ services: profileData.services.filter((_, idx) => idx !== i) }); };

  /* ─── day toggle ─── */
  const toggleDay = (d) => upd({ availabilityDays: profileData.availabilityDays.includes(d) ? profileData.availabilityDays.filter(x => x !== d) : [...profileData.availabilityDays, d] });

  /* ─── qualification file ─── */
  const handleQualFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const base  = file.name.replace(/\.[^.]+$/, '').replace(/[_\-.]/g, ' ').replace(/\s+/g, ' ').trim();
    const lc    = base.toLowerCase();
    const degKw = ['bed','bsc','ba ','honours','diploma','degree','masters','phd','med ','pgce'];
    const cerKw = ['sace','umalusi','cert','accredited','registered','clearance'];
    const hasDeg = degKw.some(k => lc.includes(k)), hasCer = cerKw.some(k => lc.includes(k));
    if (file.name.toLowerCase().endsWith('.txt')) {
      const r = new FileReader();
      r.onload = (ev) => {
        const lines = ev.target.result.split('\n').map(l => l.trim()).filter(Boolean);
        const dL = lines.find(l => degKw.some(k => l.toLowerCase().includes(k)));
        const cL = lines.find(l => cerKw.some(k => l.toLowerCase().includes(k)));
        const mL = lines.find(l => l.toLowerCase().includes('member'));
        upd({ degrees: dL || profileData.degrees || base, certifications: cL || profileData.certifications || '', memberships: mL || profileData.memberships, _qualFileName: file.name });
        showNotification('File parsed — review the pre-filled fields.', 'success');
      };
      r.readAsText(file);
    } else {
      upd({ degrees: hasDeg ? base : profileData.degrees, certifications: hasCer ? base : profileData.certifications, _qualFileName: file.name });
      showNotification('File attached — please review pre-filled fields.', 'info');
    }
  };

  /* ─── plan change ─── */
  const handlePlanChange = (p) => {
    upd({ plan: p });
    if (updateUserPlan) updateUserPlan(p);
    const names = { free: 'Community Member', pro: 'Trusted Provider', featured: 'Featured Partner' };
    showNotification(`Plan changed to ${names[p] || p}`, 'success');
  };

  /* ─── misc ─── */
  const getPlanName = () => ({ free: 'Community Member (Free)', pro: 'Trusted Provider (R149/mo)', featured: 'Featured Partner (R399/mo)' }[profileData.plan] || 'Community Member');
  const statusInfo  = { approved: { cls: 'approved', icon: 'fa-check-circle', label: 'Approved — Live' }, rejected: { cls: 'rejected', icon: 'fa-times-circle', label: 'Rejected' }, pending: { cls: 'pending', icon: 'fa-clock', label: 'Pending Approval' } }[profileData.status] || { cls: 'pending', icon: 'fa-clock', label: 'Pending Approval' };
  const days        = DAYS_OF_WEEK || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  /* completeness */
  const compItems = [
    { label: 'Name & Bio',      done: !!(profileData.name && profileData.bio) },
    { label: 'Photo',           done: !!(profileData.image || profileData.photo || profileData.profilePhoto) },
    { label: 'Services',        done: (profileData.services || []).some(s => s.title) },
    { label: 'Location',        done: !!(profileData.city && profileData.province) },
    { label: 'Contact Details', done: !!(profileData.phone && profileData.contactEmail) },
    { label: 'Qualifications',  done: !!(profileData.degrees || profileData.certifications) },
    { label: 'Availability',    done: (profileData.availabilityDays || []).length > 0 },
  ];
  const compPct = Math.round(compItems.filter(x => x.done).length / compItems.length * 100);

  /* ─────────────────────────────────────────── */
  /* SAVE BAR (reused in each tab footer)         */
  /* ─────────────────────────────────────────── */
  const SaveBar = () => editing ? (
    <div className="cd-footer-bar">
      <span className="cd-last-edit"><i className="far fa-clock"></i> unsaved changes</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="cd-btn-solid" onClick={saveChanges} disabled={loading}><i className="fas fa-floppy-disk"></i> {loading ? 'Saving…' : 'Save Changes'}</button>
        <button className="cd-btn-solid cancel" onClick={cancelEdit} disabled={loading}>Cancel</button>
      </div>
    </div>
  ) : null;

  /* ─────────────────────────────────────────── */
  /* SIDEBAR                                      */
  /* ─────────────────────────────────────────── */
  const Sidebar = () => (
    <div>
      {/* Completeness */}
      <div className="cd-sidebar-card">
        <div className="cd-sidebar-header"><div className="cd-sidebar-title"><i className="fas fa-tasks" style={{ marginRight: 6 }}></i>Profile Completeness</div></div>
        <div className="cd-sidebar-body">
          {compItems.map(({ label, done }) => (
            <div key={label} className="cd-comp-item">
              <i className={`fas ${done ? 'fa-check-circle' : 'fa-circle'}`} style={{ color: done ? '#10b981' : '#d1d5db', fontSize: '0.82rem', width: 14 }}></i>
              <span style={{ fontSize: '0.8rem', color: done ? '#1a1a1a' : '#999', fontWeight: done ? 600 : 400 }}>{label}</span>
            </div>
          ))}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: '0.69rem', color: '#888', fontWeight: 700 }}>COMPLETE</span>
              <span style={{ fontSize: '0.69rem', color: '#c9621a', fontWeight: 800 }}>{compPct}%</span>
            </div>
            <div style={{ height: 5, background: '#f0ece5', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${compPct}%`, background: 'linear-gradient(90deg,#c9621a,#e07a35)', borderRadius: 3, transition: 'width .5s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick nav */}
      <div className="cd-sidebar-card">
        <div className="cd-sidebar-header"><div className="cd-sidebar-title"><i className="fas fa-bolt" style={{ marginRight: 6 }}></i>Quick Navigation</div></div>
        <div className="cd-sidebar-body" style={{ padding: '8px 0' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 16px', width: '100%', background: activeTab === t.id ? '#fef3e8' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.81rem', fontWeight: activeTab === t.id ? 700 : 500, color: activeTab === t.id ? '#c9621a' : '#555', transition: 'all .13s' }}>
              <i className={`fas ${t.icon}`} style={{ width: 13, color: activeTab === t.id ? '#c9621a' : '#aaa' }}></i>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pending notice */}
      {profileData.status === 'pending' && (
        <div className="cd-sidebar-card">
          <div className="cd-sidebar-header" style={{ background: '#92400e' }}><div className="cd-sidebar-title"><i className="fas fa-clock" style={{ marginRight: 6 }}></i>Pending Review</div></div>
          <div className="cd-sidebar-body"><p style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.65 }}>Your profile is awaiting admin verification. Once approved it will appear live in the directory — typically 1–2 business days.</p></div>
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════ */
  /* TAB: PROFILE                                         */
  /* ═══════════════════════════════════════════════════ */
  const TabProfile = () => (
    <div className="cd-layout">
      <div>
        {/* Account Information — edit toggle lives HERE */}
        <div className="cd-card">
          <div className="cd-card-header">
            <div className="cd-card-header-icon"><i className="fas fa-id-card"></i></div>
            <div><div className="cd-card-title">Account Information</div><div className="cd-card-subtitle">Your public-facing identity</div></div>
            {/* ── Edit button moved from Profile card to Account Information ── */}
            <button className={`cd-edit-toggle ${editing ? 'active' : 'inactive'}`} onClick={toggleEdit}>
              <i className={`fas ${editing ? 'fa-pencil-alt' : 'fa-edit'}`}></i>
              {editing ? 'Editing…' : 'Edit Profile'}
            </button>
          </div>
          <div className="cd-card-body">
            {/* Photo row — ALWAYS clickable, no edit mode needed */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid #f0ece5' }}>
              <div className="cd-photo-wrap">
                {photoPreview
                  ? <img src={photoPreview} alt="Profile" className="cd-photo-img" />
                  : <div className="cd-photo-placeholder"><i className="fas fa-user"></i></div>}
                <div className="cd-photo-btn" onClick={() => photoInputRef.current?.click()} title="Change photo">
                  <i className="fas fa-camera"></i>
                </div>
                <input ref={photoInputRef} type="file" accept="image/*" className="cd-photo-input" onChange={handlePhotoChange} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a' }}>{profileData.name || 'Your Name'}</div>
                <div style={{ fontSize: '0.76rem', color: '#888', margin: '2px 0 6px' }}>{profileData.email}</div>
                <button onClick={() => photoInputRef.current?.click()} style={{ background: 'none', border: 'none', color: '#c9621a', fontSize: '0.73rem', fontWeight: 600, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                  <i className="fas fa-camera"></i> Change photo / logo
                </button>
              </div>
            </div>

            <div className="cd-row">
              <div className="cd-field">
                <label className="cd-label">Full Name / Business <span className="req">*</span></label>
                {editing ? <input className="cd-input" type="text" value={profileData.name} onChange={e => upd({ name: e.target.value })} placeholder="Name or business name" />
                  : <div className={`cd-value ${!profileData.name ? 'empty' : ''}`}>{profileData.name || '—'}</div>}
              </div>
              <div className="cd-field">
                <label className="cd-label">Email Address <span className="req">*</span></label>
                {editing ? <input className="cd-input" type="email" value={profileData.email} onChange={e => upd({ email: e.target.value })} />
                  : <div className={`cd-value ${!profileData.email ? 'empty' : ''}`}>{profileData.email || '—'}</div>}
              </div>
              <div className="cd-field">
                <label className="cd-label">Account Type</label>
                {editing ? (
                  <select className="cd-input cd-select" value={profileData.accountType} onChange={e => upd({ accountType: e.target.value })}>
                    <option>Individual Provider</option>
                    <option>Organisation / Company</option>
                  </select>
                ) : <div className={`cd-value ${!profileData.accountType ? 'empty' : ''}`}>{profileData.accountType || '—'}</div>}
              </div>
              <div className="cd-field">
                <label className="cd-label">Years of Experience</label>
                {editing ? <input className="cd-input" type="number" value={profileData.yearsExperience} min={0} max={60} onChange={e => upd({ yearsExperience: e.target.value })} />
                  : <div className={`cd-value ${!profileData.yearsExperience ? 'empty' : ''}`}>{profileData.yearsExperience || '—'}</div>}
              </div>
            </div>

            <div className="cd-field" style={{ marginTop: 4 }}>
              <label className="cd-label">Short Bio <span className="req">*</span></label>
              {editing
                ? <textarea className="cd-input cd-textarea" value={profileData.bio} onChange={e => upd({ bio: e.target.value })} placeholder="Tell families about your experience and approach…" />
                : <div className={`cd-value ${!profileData.bio ? 'empty' : ''}`} style={{ display: 'block', lineHeight: 1.6, padding: '7px 0' }}>{profileData.bio || 'No bio added yet.'}</div>}
            </div>

            <div className="cd-field">
              <label className="cd-label">Primary Category</label>
              {editing ? (
                <select className="cd-input cd-select" value={profileData.primaryCategory} onChange={e => upd({ primaryCategory: e.target.value })}>
                  <option value="">-- Select --</option>
                  {['Tutor', 'Therapist', 'Curriculum Provider', 'Online / Hybrid School', 'Educational Consultant', 'Extracurricular / Enrichment'].map(o => <option key={o}>{o}</option>)}
                </select>
              ) : <div className={`cd-value ${!profileData.primaryCategory ? 'empty' : ''}`}>{profileData.primaryCategory || '—'}</div>}
            </div>

            <div className="cd-field">
              <label className="cd-label">Tags / Subjects</label>
              {editing
                ? <TagsInput tags={profileData.tags} isEditing onAddTag={t => !profileData.tags.includes(t) && upd({ tags: [...profileData.tags, t] })} onRemoveTag={i => upd({ tags: profileData.tags.filter((_, idx) => idx !== i) })} />
                : <div className="cd-tags">{profileData.tags?.length > 0 ? profileData.tags.map((t, i) => <span key={i} className="cd-tag">{t}</span>) : <span className="cd-value empty" style={{ padding: 0 }}>No tags yet</span>}</div>}
            </div>
          </div>
          <SaveBar />
        </div>

        {/* Qualifications */}
        <div className="cd-card">
          <div className="cd-card-header">
            <div className="cd-card-header-icon"><i className="fas fa-graduation-cap"></i></div>
            <div><div className="cd-card-title">Qualifications & Experience</div><div className="cd-card-subtitle">Credentials that build trust</div></div>
          </div>
          <div className="cd-card-body">
            {editing && (
              <div className="cd-field">
                <label className="cd-label"><i className="fas fa-upload" style={{ marginRight: 5 }}></i>Upload Qualification File (auto-fill)</label>
                <input type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.png" className="cd-input" style={{ padding: '7px 10px', fontSize: '0.8rem', cursor: 'pointer' }} onChange={handleQualFile} />
                {profileData._qualFileName && <div className="cd-qual-parsed"><i className="fas fa-check-circle"></i> <strong>{profileData._qualFileName}</strong> — review fields below.</div>}
              </div>
            )}
            <div className="cd-row">
              <div className="cd-field">
                <label className="cd-label">Degrees / Diplomas</label>
                {editing ? <input className="cd-input" type="text" value={profileData.degrees} onChange={e => upd({ degrees: e.target.value })} placeholder="e.g. BEd Honours, Mathematics" />
                  : <div className={`cd-value ${!profileData.degrees ? 'empty' : ''}`}>{profileData.degrees || '—'}</div>}
              </div>
              <div className="cd-field">
                <label className="cd-label">Certifications</label>
                {editing ? <input className="cd-input" type="text" value={profileData.certifications} onChange={e => upd({ certifications: e.target.value })} placeholder="e.g. SACE Registered" />
                  : <div className={`cd-value ${!profileData.certifications ? 'empty' : ''}`}>{profileData.certifications || '—'}</div>}
              </div>
              <div className="cd-field">
                <label className="cd-label">Professional Memberships</label>
                {editing ? <input className="cd-input" type="text" value={profileData.memberships} onChange={e => upd({ memberships: e.target.value })} placeholder="e.g. SA Curriculum Association" />
                  : <div className={`cd-value ${!profileData.memberships ? 'empty' : ''}`}>{profileData.memberships || '—'}</div>}
              </div>
              <div className="cd-field">
                <label className="cd-label">Background Clearance</label>
                {editing ? <input className="cd-input" type="text" value={profileData.clearance} onChange={e => upd({ clearance: e.target.value })} placeholder="e.g. Verified 2024 — Cert No. 12345" />
                  : profileData.clearance ? <span className="cd-clearance"><i className="fas fa-shield-alt"></i>{profileData.clearance}</span>
                  : <div className="cd-value empty">Not provided</div>}
              </div>
            </div>
          </div>
          <SaveBar />
        </div>
      </div>
      <Sidebar />
    </div>
  );

  /* ═══════════════════════════════════════════════════ */
  /* TAB: SERVICES                                        */
  /* ═══════════════════════════════════════════════════ */
  const TabServices = () => (
    <div className="cd-layout">
      <div>
        <div className="cd-card">
          <div className="cd-card-header">
            <div className="cd-card-header-icon"><i className="fas fa-briefcase"></i></div>
            <div><div className="cd-card-title">Service Details</div><div className="cd-card-subtitle">What you offer to homeschooling families</div></div>
            <button className={`cd-edit-toggle ${editing ? 'active' : 'inactive'}`} onClick={toggleEdit}>
              <i className={`fas ${editing ? 'fa-pencil-alt' : 'fa-edit'}`}></i> {editing ? 'Editing…' : 'Edit'}
            </button>
          </div>
          <div className="cd-card-body">
            <div className="cd-info-note">
              <i className="fas fa-info-circle"></i>
              {profileData.plan === 'featured' ? 'Featured Partner: You can add up to 10 services.'
                : profileData.plan === 'pro' ? 'Trusted Provider: You can add up to 5 services.'
                : 'Free plan: 1 service. Upgrade to add more.'}
            </div>

            {(profileData.services || []).map((svc, idx) => (
              <div key={idx} className={`cd-svc-card ${editing ? 'editing' : ''}`}>
                {/* ── SERVICE CARD: 3-column grid, properly aligned ── */}
                {editing ? (
                  <div>
                    <div className="cd-svc-grid">
                      {/* col 1: title */}
                      <div className="cd-field">
                        <label className="cd-label">Service Title <span className="req">*</span></label>
                        <input className="cd-input" type="text" value={svc.title || ''} placeholder="e.g. Maths Tutor Gr 10–12" onChange={e => updService(idx, { ...svc, title: e.target.value })} />
                      </div>
                      {/* col 2: age groups */}
                      <div className="cd-field">
                        <label className="cd-label">Age Group Served</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                          {['5–7', '8–10', '11–13', '14–18'].map(ag => (
                            <label key={ag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.79rem', cursor: 'pointer', userSelect: 'none' }}>
                              <input type="checkbox" style={{ accentColor: '#c9621a' }}
                                checked={(svc.ageGroups || []).includes(ag)}
                                onChange={e => updService(idx, { ...svc, ageGroups: e.target.checked ? [...(svc.ageGroups || []), ag] : (svc.ageGroups || []).filter(a => a !== ag) })} />
                              {ag}
                            </label>
                          ))}
                        </div>
                      </div>
                      {/* col 3: delivery */}
                      <div className="cd-field">
                        <label className="cd-label">Mode of Delivery</label>
                        <select className="cd-input cd-select" value={svc.deliveryMode || 'Online'} onChange={e => updService(idx, { ...svc, deliveryMode: e.target.value })}>
                          <option>Online</option>
                          <option>In-person</option>
                          <option>Hybrid (Online &amp; In-person)</option>
                        </select>
                      </div>
                    </div>
                    {/* row 2 */}
                    <div className="cd-row" style={{ marginTop: 10 }}>
                      <div className="cd-field" style={{ marginBottom: 0 }}>
                        <label className="cd-label">Subjects / Specialisations</label>
                        <input className="cd-input" type="text" value={svc.subjects || ''} placeholder="e.g. Mathematics, Dance" onChange={e => updService(idx, { ...svc, subjects: e.target.value })} />
                      </div>
                      <div className="cd-field" style={{ marginBottom: 0 }}>
                        <label className="cd-label">Service Description</label>
                        <textarea className="cd-input cd-textarea" style={{ minHeight: 55 }} value={svc.description || ''} placeholder="Brief description…" onChange={e => updService(idx, { ...svc, description: e.target.value })} />
                      </div>
                    </div>
                    {isPaidPlan && (profileData.services || []).length > 1 && (
                      <button onClick={() => removeService(idx)} style={{ marginTop: 10, background: 'none', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 6, padding: '5px 12px', fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <i className="fas fa-times" style={{ marginRight: 4 }}></i>Remove
                      </button>
                    )}
                  </div>
                ) : (
                  /* VIEW mode — clean 3-column grid */
                  <div className="cd-svc-grid">
                    <div className="cd-field">
                      <label className="cd-label">Service Title</label>
                      <div className="cd-value" style={{ fontWeight: 600, display: 'block', padding: '5px 0' }}>
                        {svc.title || <span style={{ color: '#bbb', fontStyle: 'italic' }}>Untitled</span>}
                        {svc.description && <div style={{ fontSize: '0.76rem', color: '#666', marginTop: 3, fontWeight: 400, lineHeight: 1.5 }}>{svc.description}</div>}
                      </div>
                    </div>
                    <div className="cd-field">
                      <label className="cd-label">Age Group Served</label>
                      <div className="cd-value" style={{ flexWrap: 'wrap', gap: 5, padding: '5px 0' }}>
                        {(svc.ageGroups || []).length > 0
                          ? (svc.ageGroups).map(a => <span key={a} className="cd-tag" style={{ fontSize: '0.72rem', padding: '2px 9px' }}>{a}</span>)
                          : <span style={{ color: '#bbb', fontStyle: 'italic' }}>—</span>}
                      </div>
                    </div>
                    <div className="cd-field">
                      <label className="cd-label">Mode of Delivery</label>
                      <div className={`cd-value ${!svc.deliveryMode ? 'empty' : ''}`} style={{ padding: '5px 0' }}>{svc.deliveryMode || '—'}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {editing && isPaidPlan && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <button onClick={addService} disabled={svcCount >= maxServices}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 15px', borderRadius: 7, border: '1.5px dashed #c9621a', background: '#fef3e8', color: '#c9621a', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'inherit', cursor: svcCount >= maxServices ? 'not-allowed' : 'pointer', opacity: svcCount >= maxServices ? 0.5 : 1 }}>
                  <i className="fas fa-plus-circle"></i> Add Service
                </button>
                <span style={{ fontSize: '0.74rem', color: '#888' }}>{svcCount}/{maxServices} used</span>
              </div>
            )}
            {editing && !isPaidPlan && (
              <div className="cd-info-note last" style={{ marginTop: 8 }}>
                <i className="fas fa-lock"></i>
                <span>Want more services? <span style={{ fontWeight: 700, color: '#c9621a', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setActiveTab('plan')}>Upgrade your plan →</span></span>
              </div>
            )}
          </div>
          <SaveBar />
        </div>
      </div>
      <Sidebar />
    </div>
  );

  /* ═══════════════════════════════════════════════════ */
  /* TAB: LOCATION & PRICING                              */
  /* ═══════════════════════════════════════════════════ */
  const TabLocation = () => (
    <div className="cd-layout">
      <div>
        <div className="cd-card">
          <div className="cd-card-header">
            <div className="cd-card-header-icon"><i className="fas fa-map-marker-alt"></i></div>
            <div><div className="cd-card-title">Location & Reach</div><div className="cd-card-subtitle">Where you serve families</div></div>
            <button className={`cd-edit-toggle ${editing ? 'active' : 'inactive'}`} onClick={toggleEdit}>
              <i className={`fas ${editing ? 'fa-pencil-alt' : 'fa-edit'}`}></i> {editing ? 'Editing…' : 'Edit'}
            </button>
          </div>
          <div className="cd-card-body">
            <div className="cd-row">
              <div className="cd-field">
                <label className="cd-label">Province <span className="req">*</span></label>
                {editing ? (
                  <select className="cd-input cd-select" value={profileData.province} onChange={e => upd({ province: e.target.value })}>
                    <option value="">-- Select --</option>
                    {(PROVINCES || ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape']).map(p => <option key={p}>{p}</option>)}
                  </select>
                ) : <div className={`cd-value ${!profileData.province ? 'empty' : ''}`}>{profileData.province || '—'}</div>}
              </div>
              <div className="cd-field">
                <label className="cd-label">City / Town</label>
                {editing ? <input className="cd-input" type="text" value={profileData.city} onChange={e => upd({ city: e.target.value })} />
                  : <div className={`cd-value ${!profileData.city ? 'empty' : ''}`}>{profileData.city || '—'}</div>}
              </div>
            </div>
            <div className="cd-field">
              <label className="cd-label">Service Area <span className="req">*</span></label>
              {editing ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select className="cd-input cd-select" value={profileData.serviceAreaType} style={{ width: 'auto' }} onChange={e => upd({ serviceAreaType: e.target.value })}>
                    <option value="local">Local (radius)</option>
                    <option value="national">National</option>
                    <option value="online">Online only</option>
                  </select>
                  {profileData.serviceAreaType === 'local' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input className="cd-input" type="number" value={profileData.radius} style={{ width: 80 }} min="1" max="200" onChange={e => upd({ radius: e.target.value })} />
                      <span style={{ fontSize: '0.82rem', color: '#888' }}>km</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="cd-value">
                  {profileData.serviceAreaType === 'local' ? `Local — ${profileData.radius || '?'} km radius`
                    : profileData.serviceAreaType === 'online' ? 'Online only' : 'National'}
                </div>
              )}
            </div>
          </div>
          <SaveBar />
        </div>

        <div className="cd-card">
          <div className="cd-card-header">
            <div className="cd-card-header-icon"><i className="fas fa-tag"></i></div>
            <div><div className="cd-card-title">Pricing & Availability</div><div className="cd-card-subtitle">Your rates and schedule</div></div>
          </div>
          <div className="cd-card-body">
            <div className="cd-row">
              <div className="cd-field">
                <label className="cd-label">Pricing Model <span className="req">*</span></label>
                {editing ? (
                  <select className="cd-input cd-select" value={profileData.pricingModel} onChange={e => upd({ pricingModel: e.target.value })}>
                    <option value="">-- Select --</option>
                    {(PRICING_MODELS || ['Hourly', 'Per package', 'Per term', 'Custom quote']).map(m => <option key={m}>{m}</option>)}
                  </select>
                ) : <div className={`cd-value ${!profileData.pricingModel ? 'empty' : ''}`}>{profileData.pricingModel || '—'}</div>}
              </div>
              <div className="cd-field">
                <label className="cd-label">Starting Price</label>
                {editing ? <input className="cd-input" type="text" value={profileData.startingPrice} onChange={e => upd({ startingPrice: e.target.value })} placeholder="e.g. R150/hr" />
                  : <div className={`cd-value ${!profileData.startingPrice ? 'empty' : ''}`}>{profileData.startingPrice || '—'}</div>}
              </div>
            </div>
            <div className="cd-field">
              <label className="cd-label">Days Available</label>
              <div className="cd-days" style={{ marginTop: 5 }}>
                {days.map(d => {
                  const active = (profileData.availabilityDays || []).includes(d);
                  return (
                    <button key={d} className={`cd-day-chip ${active ? 'on' : 'off'} ${editing ? 'clickable' : ''}`}
                      onClick={() => editing && toggleDay(d)} style={{ border: active ? 'none' : '1px solid #e5e0d8' }}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="cd-field">
              <label className="cd-label">Availability Notes</label>
              {editing ? <input className="cd-input" type="text" value={profileData.availabilityNotes} onChange={e => upd({ availabilityNotes: e.target.value })} placeholder="e.g. Weekday afternoons & Saturdays" />
                : <div className={`cd-value ${!profileData.availabilityNotes ? 'empty' : ''}`} style={{ fontSize: '0.84rem' }}>{profileData.availabilityNotes || '—'}</div>}
            </div>
          </div>
          <SaveBar />
        </div>
      </div>
      <Sidebar />
    </div>
  );

  /* ═══════════════════════════════════════════════════ */
  /* TAB: CONTACT & SOCIAL                                */
  /* ═══════════════════════════════════════════════════ */
  const TabContact = () => (
    <div className="cd-layout">
      <div>
        <div className="cd-card">
          <div className="cd-card-header">
            <div className="cd-card-header-icon"><i className="fas fa-address-card"></i></div>
            <div><div className="cd-card-title">Contact & Online Presence</div><div className="cd-card-subtitle">How families reach you</div></div>
            <button className={`cd-edit-toggle ${editing ? 'active' : 'inactive'}`} onClick={toggleEdit}>
              <i className={`fas ${editing ? 'fa-pencil-alt' : 'fa-edit'}`}></i> {editing ? 'Editing…' : 'Edit'}
            </button>
          </div>
          <div className="cd-card-body">
            {editing ? (
              <div className="cd-row">
                {[
                  { label: 'Contact Name',  key: 'contactName',  type: 'text',  placeholder: 'Full name' },
                  { label: 'Phone',         key: 'phone',        type: 'text',  placeholder: '+27 82 000 0000' },
                  { label: 'WhatsApp',      key: 'whatsapp',     type: 'text',  placeholder: '+27 82 000 0000' },
                  { label: 'Enquiry Email', key: 'contactEmail', type: 'email', placeholder: 'contact@example.com' },
                  { label: 'Website',       key: 'website',      type: 'url',   placeholder: 'https://yoursite.co.za' },
                  { label: 'Facebook Page', key: 'facebook',     type: 'url',   placeholder: 'https://facebook.com/yourpage' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key} className="cd-field">
                    <label className="cd-label">{label}</label>
                    <input className="cd-input" type={type} value={profileData[key] || ''} placeholder={placeholder} onChange={e => upd({ [key]: e.target.value })} />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {[
                  { icon: 'fa-user',     label: 'Contact Name', val: profileData.contactName },
                  { icon: 'fa-phone',    label: 'Phone',        val: profileData.phone },
                  { icon: 'fa-whatsapp', label: 'WhatsApp',     val: profileData.whatsapp || profileData.phone },
                  { icon: 'fa-envelope', label: 'Email',        val: profileData.contactEmail },
                  { icon: 'fa-globe',    label: 'Website',      val: profileData.website || profileData.social },
                  { icon: 'fa-facebook', label: 'Facebook',     val: profileData.facebook },
                ].filter(x => x.val).map(({ icon, label, val }) => (
                  <div key={label} className="cd-contact-item">
                    <div className="cd-contact-icon"><i className={`fas ${icon}`}></i></div>
                    <div><div className="cd-contact-label">{label}</div><div className="cd-contact-val">{val}</div></div>
                  </div>
                ))}
                {!profileData.contactName && !profileData.phone && !profileData.contactEmail && (
                  <div className="cd-value empty">No contact details yet — click Edit to add.</div>
                )}
              </div>
            )}
            <div className="cd-toggle-row" style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f0ece5' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1a1a1a' }}>Display contact publicly</div>
                <div style={{ fontSize: '0.72rem', color: '#888' }}>Visible to families on your profile page</div>
              </div>
              <label className="cd-switch">
                <input type="checkbox" checked={!!profileData.publicToggle} onChange={e => upd({ publicToggle: e.target.checked })} disabled={!editing} />
                <span className="cd-slider"></span>
              </label>
            </div>
          </div>
          <SaveBar />
        </div>
      </div>
      <Sidebar />
    </div>
  );

  /* ═══════════════════════════════════════════════════ */
  /* TAB: PLAN & REVIEWS                                  */
  /* ═══════════════════════════════════════════════════ */
  const TabPlan = () => (
    <div className="cd-layout">
      <div>
        {/* Current plan strip */}
        <div className="cd-card">
          <div className="cd-card-header">
            <div className="cd-card-header-icon"><i className="fas fa-crown"></i></div>
            <div><div className="cd-card-title">Your Current Plan</div><div className="cd-card-subtitle">Active listing tier</div></div>
          </div>
          <div className="cd-card-body tight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span className={`cd-plan-badge ${profileData.plan}`}>
                <i className="fas fa-crown" style={{ color: '#f59e0b' }}></i>
                {getPlanName()}
              </span>
              <span style={{ fontSize: '0.76rem', color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fas fa-circle" style={{ color: profileData.status === 'approved' ? '#10b981' : '#f59e0b', fontSize: '0.5rem' }}></i>
                Listing is {profileData.status}
              </span>
            </div>
          </div>
        </div>

        {/* Plan grid — current/upgrade/downgrade buttons */}
        <div className="cd-card">
          <div className="cd-card-header">
            <div className="cd-card-header-icon"><i className="fas fa-arrow-up"></i></div>
            <div><div className="cd-card-title">Change Plan</div><div className="cd-card-subtitle">Select an upgrade or adjust your tier</div></div>
          </div>
          <div className="cd-card-body">
            <div className="cd-plan-grid">
              {PLAN_CARDS.map(plan => {
                const isCurrent = profileData.plan === plan.id;
                const isHigher  = planOrder[plan.id] > planOrder[profileData.plan];
                // isLower = not current and not higher
                return (
                  <div key={plan.id} className={`cd-plan-card ${isCurrent ? 'is-current' : ''}`}>
                    {isCurrent && <div className="cd-plan-current-badge">Current</div>}
                    <div className="cd-plan-card-name">{plan.name}</div>
                    <div className="cd-plan-card-desc">{plan.desc}</div>
                    <div className="cd-plan-price">{plan.price}<small>/month</small></div>
                    <ul className="cd-plan-features">
                      {plan.features.map((f, i) => <li key={i}><i className="fas fa-check-circle"></i>{f}</li>)}
                    </ul>
                    <button
                      className={`cd-plan-action-btn ${isCurrent ? 'current' : isHigher ? 'upgrade' : 'downgrade'}`}
                      disabled={isCurrent}
                      onClick={() => !isCurrent && handlePlanChange(plan.id)}
                    >
                      {isCurrent
                        ? <><i className="fas fa-check"></i> Current Plan</>
                        : isHigher
                          ? <><i className="fas fa-arrow-up"></i> Upgrade</>
                          : <><i className="fas fa-arrow-down"></i> Downgrade</>
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="cd-card">
          <div className="cd-card-header">
            <div className="cd-card-header-icon"><i className="fas fa-star"></i></div>
            <div><div className="cd-card-title">Reviews & Testimonials</div><div className="cd-card-subtitle">Family feedback on your listing</div></div>
          </div>
          <div className="cd-card-body">
            {profileData.reviews?.items?.length > 0 ? (
              <>
                {profileData.reviews.count > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, padding: '9px 13px', background: '#faf9f7', borderRadius: 9 }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c9621a', lineHeight: 1 }}>{profileData.reviews.average}</div>
                    <div>
                      <div style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(profileData.reviews.average))}{'☆'.repeat(5 - Math.round(profileData.reviews.average))}</div>
                      <div style={{ fontSize: '0.72rem', color: '#888' }}>Based on {profileData.reviews.count} reviews</div>
                    </div>
                  </div>
                )}
                {profileData.reviews.items.map((r, i) => (
                  <div key={i} className="cd-review">
                    <div className="cd-review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    <div className="cd-review-text">"{r.text}"</div>
                    <div className="cd-review-author">— {r.reviewer}</div>
                  </div>
                ))}
              </>
            ) : (
              <div className="cd-value empty">No reviews yet. Reviews appear once families leave feedback on your public profile.</div>
            )}
          </div>
        </div>
      </div>
      <Sidebar />
    </div>
  );

  /* ─── tab → renderer ─── */
  const TAB_MAP = { profile: TabProfile, services: TabServices, location: TabLocation, contact: TabContact, plan: TabPlan };
  const ActiveTab = TAB_MAP[activeTab] || TabProfile;

  /* ═══════════════════════════════════════════════════ */
  /* RENDER                                               */
  /* ═══════════════════════════════════════════════════ */
  return (
    <div className="cd-wrap">
      <Header userType="client" />

      {/* ── HERO ── */}
      <section className="cd-hero">
        <div className="cd-hero-top">
          <div className="cd-hero-left">
            <div className="cd-hero-eyebrow"><span></span>Provider Dashboard</div>
            <h1 className="cd-hero-title">Welcome back, <em>{profileData.name || 'Provider'}</em></h1>
            <div className="cd-hero-meta">
              <div className={`cd-status-pill ${statusInfo.cls}`}>
                <i className={`fas ${statusInfo.icon}`}></i> {statusInfo.label}
              </div>
              <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fas fa-crown" style={{ color: '#f59e0b' }}></i> {getPlanName()}
              </div>
            </div>
          </div>
          <div className="cd-hero-right">
            {/* ── Back to Directory → navigates to / (home) ── */}
            <button className="cd-btn-ghost" onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left"></i> Back to Directory
            </button>
            <button className="cd-btn-ghost" onClick={() => navigate(profileData.id ? `/profile?id=${profileData.id}&from=dashboard` : '/profile?from=dashboard')}>
              <i className="fas fa-eye"></i> Public View
            </button>
            {editing ? (
              <>
                <button className="cd-btn-solid" onClick={saveChanges} disabled={loading}>
                  <i className="fas fa-floppy-disk"></i> {loading ? 'Saving…' : 'Save'}
                </button>
                <button className="cd-btn-solid cancel" onClick={cancelEdit} disabled={loading}>Cancel</button>
              </>
            ) : (
              <button className="cd-btn-solid" onClick={startEdit}>
                <i className="fas fa-pen"></i> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* TAB BAR at bottom of hero */}
        <div className="cd-tab-bar">
          {TABS.map(t => (
            <button key={t.id} className={`cd-tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <i className={`fas ${t.icon}`}></i> {t.label}
            </button>
          ))}
        </div>
      </section>

      <main className="cd-main">
        <ActiveTab />
      </main>
      <Footer />
    </div>
  );
};

export default ClientDashboard;