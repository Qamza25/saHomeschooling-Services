// frontend/src/pages/HomePage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";

const injectHead = () => {
  if (document.getElementById("sah-fonts")) return;
  const fonts = document.createElement("link");
  fonts.id = "sah-fonts"; fonts.rel = "stylesheet";
  fonts.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@400;500;600;700&display=swap";
  document.head.appendChild(fonts);
  const fa = document.createElement("link");
  fa.rel = "stylesheet";
  fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
  document.head.appendChild(fa);
};

const CSS = `
  :root {
    --accent:#c9621a; --accent-dark:#a84e12; --accent-light:#f5e0cc;
    --red:#c0234a; --red-dark:#96183a; --red-light:#f5d0d8;
    --dark:#3a3a3a; --mid:#555; --muted:#888;
    --grey:#b5b5b5; --grey-dark:#7a7a7a; --light-bg:#f2f2f2; --white:#fff;
    --border:rgba(0,0,0,0.08);
    --shadow-sm:0 1px 4px rgba(0,0,0,0.06);
    --shadow-md:0 4px 20px rgba(0,0,0,0.09);
    --shadow-lg:0 12px 48px rgba(0,0,0,0.12);
    --radius:8px; --radius-lg:12px; --header-h:68px;
  }
  .sah-wrap *,.sah-wrap *::before,.sah-wrap *::after{box-sizing:border-box;margin:0;padding:0;}
  .sah-wrap{font-family:'DM Sans',sans-serif;background:var(--white);color:var(--dark);line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden;}
  .sah-wrap a{color:inherit;text-decoration:none;}
  .sah-wrap button{cursor:pointer;font-family:inherit;}
  .sah-wrap img{display:block;max-width:100%;}
  .sah-container{max-width:1280px;margin:0 auto;padding:0 32px;}

  /* HEADER */
  .sah-header{position:sticky;top:0;z-index:1000;height:var(--header-h);background:#5a5a5a;}
  .sah-nav-inner{height:100%;display:flex;justify-content:space-between;align-items:center;}
  .sah-brand{display:flex;align-items:center;gap:12px;}
  .sah-brand-divider{width:2px;height:30px;background:rgba(255,255,255,0.5);border-radius:1px;}
  .sah-brand-text{display:flex;flex-direction:column;line-height:1.15;}
  .sah-brand-name{font-family:'Playfair Display',serif;font-weight:800;font-size:1rem;color:#fff;letter-spacing:0.2px;}
  .sah-brand-tag{font-size:0.66rem;color:rgba(255,255,255,0.75);font-weight:500;letter-spacing:0.5px;}
  .sah-nav-links{display:flex;align-items:center;gap:2px;}
  .sah-nav-links a{padding:8px 14px;border-radius:5px;font-weight:600;font-size:1rem;color:rgba(255,255,255,0.85);transition:all 0.15s;}
  .sah-nav-links a:hover{color:#fff;background:rgba(255,255,255,0.2);}
  .sah-nav-ctas{display:flex;align-items:center;gap:8px;}
  .sah-btn-ghost-nav{padding:7px 16px;border-radius:5px;border:1.5px solid rgba(255,255,255,0.6);background:transparent;color:#fff;font-weight:600;font-size:0.85rem;transition:all 0.15s;cursor:pointer;}
  .sah-btn-ghost-nav:hover{border-color:#fff;background:rgba(255,255,255,0.2);}
  .sah-btn-solid-nav{
    padding:7px 18px;border-radius:5px;background:var(--accent);
    color:#fff !important;font-weight:700;font-size:0.85rem;border:none;
    transition:background 0.15s;box-shadow:none !important;
    display:inline-block;cursor:pointer;text-decoration:none;
  }
  .sah-btn-solid-nav:hover{background:var(--accent-dark);}

  /* User Profile Button in Header */
  .sah-user-profile-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 7px 16px; border-radius: 6px;
    border: 1.5px solid rgba(255,255,255,0.55); background: transparent;
    color: #fff; font-weight: 600; font-size: 0.85rem;
    cursor: pointer; font-family: inherit; text-decoration: none;
    transition: all 0.15s;
  }
  .sah-user-profile-btn:hover {
    background: rgba(255,255,255,0.2); border-color: #fff;
  }
  .sah-user-profile-btn i { color: var(--accent-light); }

  .sah-logout-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 7px 18px; border-radius: 6px; border: none;
    background: var(--accent); color: #fff; font-weight: 700;
    font-size: 0.85rem; cursor: pointer; font-family: inherit;
    transition: background 0.15s;
  }
  .sah-logout-btn:hover { background: var(--accent-dark); }
  .sah-logout-btn i { color: rgba(255,255,255,0.9); }

  /* HERO */
  .sah-hero{position:relative;min-height:88vh;display:flex;align-items:center;overflow:hidden;background:#1e1e1e;}
  .sah-hero-bg{position:absolute;inset:0;z-index:0;
    background-image:url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&auto=format&fit=crop&q=80');
    background-size:cover;background-position:center 30%;}
  .sah-hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,rgba(20,20,20,0.90) 0%,rgba(50,50,50,0.80) 45%,rgba(15,15,15,0.62) 100%);}
  .sah-hero-inner{position:relative;z-index:2;padding:60px 0;width:100%;}
  .sah-hero-top{text-align:center;margin-bottom:36px;}
  .sah-hero-h1{font-family:'Playfair Display',serif;font-size:clamp(2.5rem,5.5vw,4.4rem);font-weight:900;line-height:1.07;color:#fff;margin-bottom:22px;letter-spacing:-0.3px;}
  .sah-hero-h1 em{font-style:italic;color:rgba(255,255,255,0.9);}

  /* SEARCH BAR */
  .sah-hero-search{display:flex;flex-direction:row;align-items:stretch;background:#fff;border-radius:var(--radius);overflow:hidden;max-width:780px;margin:0 auto;box-shadow:0 8px 40px rgba(0,0,0,0.4);width:100%;}
  .sah-hs-icon{display:flex;align-items:center;padding:0 14px;color:#aaa;font-size:0.9rem;flex-shrink:0;}
  .sah-hero-search input{flex:1;min-width:0;border:none;outline:none;padding:16px 6px;font-family:'DM Sans',sans-serif;font-size:0.95rem;color:var(--dark);background:transparent;-webkit-appearance:none;appearance:none;}
  .sah-hero-search input::placeholder{color:#bbb;}
  .sah-hs-sep{width:1px;background:var(--border);margin:10px 0;flex-shrink:0;}
  .sah-hero-search select{border:none;outline:none;padding:0 14px;background:transparent;font-family:'DM Sans',sans-serif;font-size:0.88rem;color:var(--muted);cursor:pointer;min-width:140px;flex-shrink:0;-webkit-appearance:none;-moz-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23aaa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px;}
  .sah-hs-btn{background:var(--accent);color:#fff;border:none;padding:0 26px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:0.92rem;white-space:nowrap;transition:background 0.15s;flex-shrink:0;cursor:pointer;}
  .sah-hs-btn:hover{background:var(--accent-dark);}

  /* HERO TAGLINE */
  .sah-hero-tagline{text-align:center;margin-top:22px;margin-bottom:36px;}
  .sah-hero-tagline h2{
    font-family:'Playfair Display',serif;
    font-size:clamp(1.1rem,2.2vw,1.4rem);
    font-weight:800;color:#fff;margin-bottom:8px;line-height:1.25;
  }
  .sah-hero-tagline p{
    font-family:'Playfair Display',serif;
    font-style:italic;
    font-size:clamp(0.88rem,1.3vw,0.98rem);
    color:rgba(255,255,255,0.78);
    max-width:580px;margin:0 auto 22px;line-height:1.7;
  }

  /* BECOME PROVIDER BUTTON */
  .sah-become-btn{
    display:inline-flex;align-items:center;gap:10px;padding:13px 30px;
    background:var(--accent);color:#fff !important;border:none;
    border-radius:var(--radius);font-weight:700;font-size:0.97rem;
    transition:background 0.15s,transform 0.15s;cursor:pointer;
    box-shadow:none;text-decoration:none;
  }
  .sah-become-btn:hover{background:var(--accent-dark);transform:translateY(-2px);}
  .sah-become-btn.active{background:#3a3a3a;box-shadow:none;}
  .sah-become-btn.active:hover{background:#1e1e1e;transform:none;}
  .sah-become-btn .sah-chev{font-size:0.78rem;transition:transform 0.3s ease;}
  .sah-become-btn.active .sah-chev{transform:rotate(180deg);}

  /* PLANS ACCORDION */
  .sah-hero-plans-wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows 0.45s cubic-bezier(0.4,0,0.2,1);}
  .sah-hero-plans-wrap.open{grid-template-rows:1fr;}
  .sah-hero-plans-inner{overflow:hidden;}
  .sah-hero-plans-grid-outer{padding-top:24px;padding-bottom:8px;}
  .sah-hero-plans-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}

  /* PLAN CARDS */
  .sah-plan-item{border:1px solid rgba(255,255,255,0.28);border-radius:var(--radius-lg);background:rgba(20,20,20,0.58);transition:border-color 0.2s,background 0.2s;cursor:pointer;overflow:hidden;user-select:none;backdrop-filter:blur(6px);display:flex;flex-direction:column;}
  .sah-plan-item:hover{border-color:rgba(201,98,26,0.65);background:rgba(20,20,20,0.68);}
  .sah-plan-item.highlight{border-color:var(--accent);background:rgba(20,20,20,0.70);box-shadow:0 0 0 1px var(--accent);}
  .sah-plan-header{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 18px 12px;}
  .sah-plan-info{flex:1;}
  .sah-plan-name{font-weight:700;font-size:0.95rem;color:#fff;}
  .sah-plan-desc{font-size:0.75rem;color:rgba(255,255,255,0.6);margin-top:3px;}
  .sah-plan-right{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;margin-left:10px;}
  .sah-plan-price{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:800;color:#fff;line-height:1;}
  .sah-plan-price small{font-size:0.66rem;color:rgba(255,255,255,0.5);font-weight:400;display:block;text-align:right;}
  .sah-plan-chevron{color:rgba(255,255,255,0.5);font-size:0.72rem;transition:transform 0.25s ease;flex-shrink:0;margin-top:4px;}
  .sah-plan-item.highlight .sah-plan-chevron{color:var(--accent);}
  .sah-plan-chevron.open{transform:rotate(180deg);}
  .sah-plan-details{display:grid;grid-template-rows:0fr;transition:grid-template-rows 0.32s ease;}
  .sah-plan-details.open{grid-template-rows:1fr;}
  .sah-plan-details-inner{overflow:hidden;padding:0 18px;transition:padding 0.32s ease;}
  .sah-plan-details.open .sah-plan-details-inner{padding:0 18px 16px;}
  .sah-plan-details-content{padding-top:12px;border-top:1px solid rgba(255,255,255,0.18);}
  .sah-plan-features{list-style:none;display:flex;flex-direction:column;gap:6px;margin-bottom:14px;padding:0;}
  .sah-plan-features li{display:flex;align-items:center;gap:7px;font-size:0.82rem;color:rgba(255,255,255,0.8);}
  .sah-plan-features li.no{color:rgba(255,255,255,0.32);}
  .sah-ico-yes{color:#4ade80;font-size:0.7rem;}
  .sah-ico-no{color:rgba(255,255,255,0.22);font-size:0.7rem;}
  .sah-plan-cta-link{display:inline-flex;align-items:center;gap:7px;padding:8px 18px;background:var(--accent);color:#fff !important;border:none;border-radius:var(--radius);font-size:0.82rem;font-weight:700;transition:background 0.15s;cursor:pointer;text-decoration:none;}
  .sah-plan-cta-link:hover{background:var(--accent-dark);}

  /* FILTER BAR */
  .sah-filter-bar{background:var(--white);border-bottom:1px solid var(--border);}
  .sah-filter-bar-row{display:flex;align-items:center;gap:6px;padding:16px 0;overflow-x:auto;-webkit-overflow-scrolling:touch;}
  .sah-filter-bar-row::-webkit-scrollbar{display:none;}
  .sah-filter-label{font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);white-space:nowrap;margin-right:6px;flex-shrink:0;}
  .sah-fpill{display:inline-flex;align-items:center;gap:6px;padding:10px 22px;border-radius:6px;border:1px solid var(--border);background:var(--white);color:var(--muted);font-size:1rem;font-weight:600;transition:all 0.15s;cursor:pointer;white-space:nowrap;flex-shrink:0;line-height:1.3;}
  .sah-fpill:hover{border-color:var(--accent);color:var(--accent);}
  .sah-fpill.active{background:var(--grey);color:#fff;border-color:var(--grey);}
  .sah-fpill i{font-size:0.95rem;}

  /* PROVIDERS */
  .sah-providers-section{padding:60px 0 76px;background:var(--light-bg);}
  .sah-sec-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;}
  .sah-sec-eyebrow{display:block;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:var(--accent);margin-bottom:5px;}
  .sah-sec-header h2{font-family:'Playfair Display',serif;font-size:clamp(1.5rem,3vw,2rem);font-weight:800;color:var(--dark);line-height:1.15;}
  .sah-sec-right{font-size:0.84rem;color:var(--muted);}
  .sah-link-btn{background:none;border:none;padding:0;color:var(--accent);font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:inherit;text-decoration:none;}
  .sah-link-btn:hover{text-decoration:underline;}
  .sah-provider-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;}
  .sah-provider-card{background:var(--white);border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--border);box-shadow:var(--shadow-sm);transition:box-shadow 0.2s,transform 0.2s;display:flex;flex-direction:column;}
  .sah-provider-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);}
  .sah-provider-card.is-featured-slot{border-color:rgba(201,98,26,0.35);box-shadow:0 2px 12px rgba(201,98,26,0.12);}
  .sah-card-thumb{position:relative;height:165px;overflow:hidden;background:var(--accent-light);flex-shrink:0;}
  .sah-card-thumb img{width:100%;height:100%;object-fit:cover;transition:transform 0.35s;}
  .sah-provider-card:hover .sah-card-thumb img{transform:scale(1.04);}
  .sah-card-thumb-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2.8rem;color:var(--accent);background:linear-gradient(135deg,#f0e8df,#f5e0cc);}
  .sah-card-badges{position:absolute;top:9px;left:9px;display:flex;gap:4px;}
  .sah-cbadge{padding:3px 9px;border-radius:3px;font-size:0.67rem;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;}
  .sah-cbadge-featured{background:var(--red);color:#fff;}
  .sah-cbadge-new{background:#0d7d6c;color:#fff;}
  .sah-cbadge-verified{background:#3a3a3a;color:#fff;}
  .sah-card-save{position:absolute;top:9px;right:9px;width:28px;height:28px;border-radius:4px;background:rgba(255,255,255,0.9);border:none;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:0.8rem;transition:color 0.15s;}
  .sah-card-save:hover{color:var(--accent);}
  .sah-card-provider-row{display:flex;align-items:center;gap:8px;padding:11px 13px 0;}
  .sah-pav{width:30px;height:30px;border-radius:50%;background:var(--accent-light);display:flex;align-items:center;justify-content:center;color:var(--accent);font-size:0.8rem;flex-shrink:0;}
  .sah-pav-name{font-weight:700;font-size:0.77rem;color:var(--dark);line-height:1.2;}
  .sah-pav-tier{font-size:0.68rem;color:var(--muted);}
  .sah-card-body{padding:9px 13px 14px;flex:1;display:flex;flex-direction:column;}
  .sah-card-title{font-weight:700;font-size:0.87rem;color:var(--dark);margin-bottom:7px;line-height:1.35;}
  .sah-card-meta{display:flex;flex-direction:column;gap:3px;font-size:0.74rem;color:var(--muted);margin-bottom:8px;}
  .sah-card-meta span{display:flex;align-items:center;gap:4px;}
  .sah-card-meta i{color:var(--accent);font-size:0.68rem;width:12px;}
  .sah-card-rating{display:flex;align-items:center;gap:5px;font-size:0.76rem;margin-bottom:10px;}
  .sah-stars{color:#c97c10;font-size:0.76rem;letter-spacing:-0.5px;}
  .sah-rnum{font-weight:700;color:var(--dark);}
  .sah-rcnt{color:var(--muted);}
  .sah-card-foot{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:10px;border-top:1px solid var(--border);}
  .sah-from-label{font-size:0.65rem;color:var(--muted);line-height:1;}
  .sah-card-price{font-family:'Playfair Display',serif;font-size:1.08rem;font-weight:800;color:var(--accent);}
  .sah-card-cta{padding:6px 13px;background:var(--grey);color:#fff;border:none;border-radius:5px;font-size:0.77rem;font-weight:700;transition:background 0.15s;}
  .sah-card-cta:hover{background:var(--accent);}
  .sah-grid-empty{grid-column:1/-1;text-align:center;padding:70px 20px;color:var(--muted);}
  .sah-grid-empty i{font-size:2.2rem;margin-bottom:12px;opacity:0.3;display:block;}
  .sah-grid-empty h3{font-family:'Playfair Display',serif;font-size:1.25rem;color:var(--dark);margin-bottom:7px;}

  /* SECTION LABEL DIVIDER */
  .sah-section-label{display:flex;align-items:center;gap:12px;margin:0 0 16px;font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:1.8px;color:var(--accent);}
  .sah-section-label::after{content:'';flex:1;height:1px;background:rgba(201,98,26,0.2);}

  /* HOW IT WORKS */
  .sah-how-section{padding:76px 0;background:var(--white);}
  .sah-how-header{margin-bottom:44px;}
  .sah-steps-grid{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;}
  .sah-step{padding:38px 28px;border-right:1px solid var(--border);}
  .sah-step:last-child{border-right:none;}
  .sah-step-num{font-family:'Playfair Display',serif;font-size:3rem;font-weight:900;color:#e0e0e0;display:block;line-height:1;margin-bottom:14px;}
  .sah-step h3{font-weight:700;font-size:0.97rem;color:var(--dark);margin-bottom:9px;}
  .sah-step p{font-size:0.85rem;color:var(--muted);line-height:1.65;}

  /* FOOTER */
  .sah-footer{background:#0e0e0e;color:rgba(255,255,255,0.55);padding:60px 0 32px;}
  .sah-footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:44px;}
  .sah-footer-logo{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:800;color:#fff;display:block;margin-bottom:12px;}
  .sah-footer-brand p{font-size:0.85rem;line-height:1.75;max-width:260px;color:rgba(255,255,255,0.55);}
  .sah-footer-newsletter{margin-top:20px;max-width:280px;}
  .sah-footer-newsletter-row{display:flex;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);}
  .sah-footer-newsletter input{flex:1;padding:10px 13px;background:rgba(255,255,255,0.06);border:none;color:#fff;font-family:inherit;font-size:0.82rem;outline:none;}
  .sah-footer-newsletter button{padding:10px 14px;background:var(--accent);color:#fff;border:none;font-weight:700;font-size:0.8rem;cursor:pointer;}
  .sah-nl-feedback{font-size:0.74rem;margin-top:6px;}
  .sah-nl-feedback.error{color:#f87171;}
  .sah-nl-feedback.success{color:#4ade80;}
  .sah-footer-col h4{font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.4);margin-bottom:14px;}
  .sah-footer-col ul{list-style:none;display:flex;flex-direction:column;gap:9px;padding:0;margin:0;}
  .sah-footer-col ul li a{color:rgba(255,255,255,0.55);text-decoration:none;font-size:0.875rem;transition:color 0.15s;}
  .sah-footer-col ul li a:hover{color:#fff;}
  .sah-footer-trust{display:flex;gap:16px;align-items:center;padding:16px 0;margin-bottom:20px;border-top:1px solid rgba(255,255,255,0.07);flex-wrap:wrap;}
  .sah-footer-trust-item{display:flex;align-items:center;gap:7px;font-size:0.78rem;color:rgba(255,255,255,0.45);}
  .sah-footer-trust-item i{color:var(--accent);font-size:0.82rem;}
  .sah-footer-bottom{border-top:1px solid rgba(255,255,255,0.07);padding-top:22px;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;}
  .sah-footer-bottom p{font-size:0.8rem;color:rgba(255,255,255,0.35);}
  .sah-footer-bottom-links{display:flex;gap:20px;font-size:0.8rem;}
  .sah-footer-bottom-links a{color:rgba(255,255,255,0.4);text-decoration:none;transition:color 0.15s;}
  .sah-footer-bottom-links a:hover{color:#fff;}
  .sah-footer-socials{display:flex;gap:8px;}
  .sah-footer-soc{width:34px;height:34px;border-radius:5px;background:rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.45);font-size:0.84rem;text-decoration:none;transition:all 0.15s;}
  .sah-footer-soc:hover{background:var(--accent);color:#fff;}

  /* REGISTER MODAL */
  .sah-modal-overlay{position:fixed;inset:0;z-index:9000;background:rgba(8,0,4,0.75);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity 0.22s;}
  .sah-modal-overlay.open{opacity:1;pointer-events:all;}
  .sah-modal-box{background:var(--white);width:460px;max-width:93vw;border-radius:var(--radius-lg);box-shadow:0 28px 72px rgba(0,0,0,0.28);overflow:hidden;transform:translateY(14px);transition:transform 0.22s ease;}
  .sah-modal-overlay.open .sah-modal-box{transform:translateY(0);}
  .sah-modal-head{background:#5a5a5a;padding:26px 28px 20px;position:relative;}
  .sah-modal-head h2{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:800;color:#fff;}
  .sah-modal-head p{font-size:0.86rem;color:rgba(255,255,255,0.65);margin-top:3px;}
  .sah-modal-close{position:absolute;top:14px;right:14px;width:28px;height:28px;border-radius:4px;background:rgba(255,255,255,0.12);border:none;color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.88rem;transition:background 0.15s;cursor:pointer;}
  .sah-modal-close:hover{background:rgba(255,255,255,0.22);}
  .sah-modal-body{padding:24px 28px 28px;}
  .sah-reg-options{display:flex;flex-direction:column;gap:10px;margin-bottom:14px;}
  .sah-reg-opt{display:flex;align-items:center;gap:12px;padding:13px 16px;border:1.5px solid var(--border);border-radius:var(--radius);text-decoration:none;color:var(--dark);transition:all 0.15s;background:#fafaf9;}
  .sah-reg-opt:hover{border-color:var(--accent);background:#fff8f2;}
  .sah-reg-opt-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0;}
  .sah-reg-opt-icon.user{background:#ede9fe;color:#5b21b6;}
  .sah-reg-opt-icon.provider{background:#fef3c7;color:#92400e;}
  .sah-reg-opt-title{font-weight:700;font-size:0.9rem;margin-bottom:1px;}
  .sah-reg-opt-desc{font-size:0.75rem;color:var(--muted);}
  .sah-modal-switch{text-align:center;margin-top:12px;font-size:0.85rem;color:var(--muted);}
  .sah-modal-switch a{color:var(--accent);font-weight:600;}

  /* LOGIN REQUIRED MODAL */
  .sah-login-modal-icon{
    width:56px;height:56px;border-radius:50%;
    background:rgba(201,98,26,0.12);
    display:flex;align-items:center;justify-content:center;
    margin:0 auto 16px;
    font-size:1.4rem;color:var(--accent);
  }
  .sah-login-modal-title{
    font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:800;
    color:var(--dark);text-align:center;margin-bottom:8px;
  }
  .sah-login-modal-desc{
    font-size:0.88rem;color:var(--muted);text-align:center;
    line-height:1.6;margin-bottom:22px;
  }
  .sah-login-modal-actions{display:flex;flex-direction:column;gap:9px;}
  .sah-login-modal-primary{
    width:100%;padding:12px 20px;background:var(--accent);color:#fff;
    border:none;border-radius:var(--radius);font-family:'DM Sans',sans-serif;
    font-weight:700;font-size:0.92rem;cursor:pointer;
    transition:background 0.15s;
  }
  .sah-login-modal-primary:hover{background:var(--accent-dark);}
  .sah-login-modal-secondary{
    width:100%;padding:11px 20px;background:transparent;color:var(--dark);
    border:1.5px solid var(--border);border-radius:var(--radius);font-family:'DM Sans',sans-serif;
    font-weight:600;font-size:0.88rem;cursor:pointer;
    transition:all 0.15s;
  }
  .sah-login-modal-secondary:hover{border-color:var(--accent);color:var(--accent);}
  .sah-login-modal-divider{
    display:flex;align-items:center;gap:10px;
    font-size:0.75rem;color:var(--grey);margin:4px 0;
  }
  .sah-login-modal-divider::before,.sah-login-modal-divider::after{
    content:'';flex:1;height:1px;background:var(--border);
  }

  /* TOAST */
  .sah-toast{position:fixed;bottom:22px;right:22px;background:var(--grey);color:#fff;padding:11px 18px;border-radius:var(--radius);font-size:0.88rem;font-weight:600;box-shadow:var(--shadow-lg);transform:translateY(60px);opacity:0;transition:all 0.26s;z-index:9999;display:flex;align-items:center;gap:8px;pointer-events:none;}
  .sah-toast.show{transform:translateY(0);opacity:1;}
  .sah-toast i{color:#4ade80;}

  /* RESPONSIVE */
  @media(max-width:1100px){
    .sah-provider-grid{grid-template-columns:repeat(2,1fr);}
    .sah-steps-grid{grid-template-columns:repeat(2,1fr);}
    .sah-step:nth-child(2){border-right:none;}
    .sah-step:nth-child(1),.sah-step:nth-child(2){border-bottom:1px solid var(--border);}
    .sah-hero-plans-grid{grid-template-columns:repeat(3,1fr);}
    .sah-footer-grid{grid-template-columns:1fr 1fr;gap:32px;}
  }
  @media(max-width:768px){
    .sah-nav-links{display:none;}
    .sah-provider-grid{grid-template-columns:repeat(2,1fr);}
    .sah-steps-grid{grid-template-columns:1fr;}
    .sah-step{border-right:none!important;border-bottom:1px solid var(--border);}
    .sah-step:last-child{border-bottom:none;}
    .sah-fpill{font-size:0.95rem;padding:9px 18px;}
    .sah-hero-plans-grid{grid-template-columns:1fr;}
  }
  @media(max-width:480px){
    .sah-provider-grid{grid-template-columns:1fr;}
    .sah-container{padding:0 16px;}
    .sah-become-btn{padding:11px 20px;font-size:0.88rem;}
  }
  @media(max-width:640px){
    .sah-footer{padding:44px 0 24px;}
    .sah-footer-grid{grid-template-columns:1fr;gap:28px;}
    .sah-footer-bottom{flex-direction:column;align-items:flex-start;gap:12px;}
    .sah-footer-bottom-links{flex-wrap:wrap;gap:12px;}
  }
`;

/* ─── DATA ──────────────────────────────────────────────────────────────── */
const SEED = [
  {
    id:"s1",name:"STEM Mastery Tutors",category:"tutor",location:"Johannesburg, Gauteng",
    delivery:"Online & In-person",
    image:"https://images.unsplash.com/photo-1522202176988-66273c2b033f?w=600&auto=format&fit=crop&q=75",
    priceFrom:"R280/hr",badge:"featured",rating:4.9,reviewCount:62,tier:"featured",
    registered:"2025-01-10T08:00:00Z",status:"approved",
    primaryCategory:"Tutor",city:"Johannesburg",province:"Gauteng",deliveryMode:"Online & In-person",
    bio:"Specialist STEM tutors for Grades 8–12.",tags:["Mathematics","Physical Sciences","Life Sciences","Grades 8–12"],
    ageGroups:["11–13","14–18"],startingPrice:"R280/hr",availabilityDays:["Mon","Tue","Wed","Thu","Fri"],
    phone:"+27 11 000 1111",contactEmail:"info@stemmastery.co.za",certifications:"SACE Registered",listingPlan:"featured",
    reviews:{average:4.9,count:62,items:[{reviewer:"Nomsa P.",rating:5,text:"My son went from 40% to 82% in Maths."}]}
  },
  {
    id:"s2",name:"Creative Minds Curriculum",category:"curriculum",location:"Cape Town, Western Cape",
    delivery:"Online",
    image:"https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=75",
    priceFrom:"R4 200/term",badge:"verified",rating:5.0,reviewCount:34,tier:"pro",
    registered:"2025-01-12T09:00:00Z",status:"approved",
    primaryCategory:"Curriculum Provider",city:"Cape Town",province:"Western Cape",deliveryMode:"Online",
    bio:"Award-winning home education curriculum.",tags:["CAPS Aligned","Full Curriculum","Gr R–12"],
    ageGroups:["5–7","8–10","11–13","14–18"],startingPrice:"R4 200/term",
    phone:"+27 21 000 2222",contactEmail:"hello@creativeminds.co.za",certifications:"Umalusi Accredited",listingPlan:"pro",
    reviews:{average:5.0,count:34,items:[{reviewer:"Riana V.",rating:5,text:"Best investment for our homeschool journey."}]}
  },
  {
    id:"s3",name:"EduTherapy SA",category:"therapist",location:"Durban, KwaZulu-Natal",
    delivery:"Hybrid",
    image:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=75",
    priceFrom:"R650/session",badge:"featured",rating:4.8,reviewCount:47,tier:"featured",
    registered:"2025-01-14T10:00:00Z",status:"approved",
    primaryCategory:"Therapist",city:"Durban",province:"KwaZulu-Natal",deliveryMode:"Hybrid",
    bio:"Educational therapists specialising in learning differences.",tags:["OT","ADHD","Dyslexia","Learning Support"],
    ageGroups:["5–7","8–10","11–13"],startingPrice:"R650/session",
    phone:"+27 31 000 3333",contactEmail:"bookings@edutherapy.co.za",certifications:"HPCSA Registered",listingPlan:"featured",
    reviews:{average:4.8,count:47,items:[{reviewer:"Lerato M.",rating:5,text:"Transformed our daughter's confidence."}]}
  },
  {
    id:"s4",name:"Future Leaders Academy",category:"school",location:"Online — National",
    delivery:"Online",
    image:"https://images.unsplash.com/photo-1529390079861-591de3547d13?w=600&auto=format&fit=crop&q=75",
    priceFrom:"Custom quote",badge:"new",rating:4.7,reviewCount:18,tier:"pro",
    registered:"2025-01-16T11:00:00Z",status:"approved",
    primaryCategory:"Online / Hybrid School",city:"Online",province:"Gauteng",deliveryMode:"Online",
    bio:"A fully accredited online school.",tags:["Online School","Live Classes","National","Accredited"],
    ageGroups:["8–10","11–13","14–18"],startingPrice:"Contact for quote",
    phone:"+27 10 000 4444",contactEmail:"enrol@futureleaders.co.za",certifications:"Umalusi Registered",listingPlan:"pro",
    reviews:{average:4.7,count:18,items:[{reviewer:"Sipho K.",rating:5,text:"Our kids thrive in the structure."}]}
  },
  {
    id:"khan",name:"Khan Academy SA",category:"curriculum",location:"Johannesburg, Gauteng",
    delivery:"Online",
    image:"https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop&q=75",
    priceFrom:"Free",badge:"featured",rating:4.9,reviewCount:156,tier:"featured",
    registered:"2025-01-01T00:00:00Z",status:"approved",
    primaryCategory:"Curriculum Provider",city:"Johannesburg",province:"Gauteng",deliveryMode:"Online",
    bio:"Free world-class education for anyone.",tags:["Mathematics","Science","Online Learning","Free"],
    ageGroups:["5–7","8–10","11–13","14–18"],startingPrice:"Free",
    phone:"+27 11 555 1234",contactEmail:"support@khanacademy.org.za",email:"contact@khanacademy.org.za",
    certifications:"Khan Academy Certified",listingPlan:"featured",
    reviews:{average:4.9,count:156,items:[{reviewer:"Sarah J.",rating:5,text:"Excellent resource for homeschool."}]}
  },
];

const CAT_ICON = {
  tutor:"fa-chalkboard-teacher", therapist:"fa-heart", curriculum:"fa-book-open",
  school:"fa-school", consultant:"fa-user-tie", extracurricular:"fa-palette"
};
const TIER_LBL = { featured:"Deluxe Package", pro:"Trusted Provider", free:"Community Member" };

const PLANS = [
  {
    id:"community", name:"Community Member", desc:"Basic profile — always free", price:"R0", highlight:false,
    features:[
      {text:"Public profile listing",yes:true},
      {text:"1 service category",yes:true},
      {text:"Basic contact form",yes:true},
      {text:"No direct contact details",yes:false},
      {text:"No featured placement",yes:false},
    ],
    cta:"Get Started Free", planParam:"Free Listing – basic profile"
  },
  {
    id:"trusted", name:"Trusted Provider", desc:"Full profile + direct contact details", price:"R149", highlight:true,
    features:[
      {text:"Everything in Community",yes:true},
      {text:"Direct phone & email visible",yes:true},
      {text:"Up to 3 service categories",yes:true},
      {text:"Verified badge on profile",yes:true},
      {text:"Priority in search results",yes:true},
    ],
    cta:"Start Trusted Plan", planParam:"Professional Listing – R149/month"
  },
  {
    id:"featured", name:"Deluxe Package", desc:"3-month campaign · maximum exposure", price:"R399", highlight:false,
    features:[
      {text:"24x Billboard banners",yes:true},
      {text:"24x Leaderboard banners",yes:true},
      {text:"24x Skyscrapers / side panels",yes:true},
      {text:"1x Business listing",yes:true},
      {text:"6x Newsletter banner ads",yes:true},
      {text:"6x Facebook post / reel",yes:true},
      {text:"6x Instagram posts / reels",yes:true},
      {text:"4x Newsletter ad posting",yes:true},
      {text:"2x Full page ad in PDF per magazine",yes:true},
      {text:"1x Native article per month",yes:true},
    ],
    cta:"Get the Deluxe Package", planParam:"Deluxe Package – R399/month"
  },
];

/* ─── GET ALL PROVIDERS ──────────────────────────────────────────────────── */
function getAll() {
  try {
    const stored = JSON.parse(localStorage.getItem("sah_providers") || "[]");
    const allRaw = [...stored, ...SEED].filter(p => (p.status || "approved") === "approved");
    const seen = new Set();
    const all = allRaw.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });

    const marked = all.map(p => ({ ...p, _inFeaturedSlot: false }));

    return marked.sort((a, b) => {
      if (a._inFeaturedSlot && !b._inFeaturedSlot) return -1;
      if (!a._inFeaturedSlot && b._inFeaturedSlot)  return 1;
      const tierOrder = { featured:0, pro:1, free:2 };
      const td = (tierOrder[a.tier] ?? 2) - (tierOrder[b.tier] ?? 2);
      if (td !== 0) return td;
      return new Date(b.registered) - new Date(a.registered);
    });
  } catch { return SEED; }
}

function starsStr(r) { return "★".repeat(Math.floor(r)) + (r % 1 >= 0.5 ? "½" : ""); }

/* ─── SUB-COMPONENTS ─────────────────────────────────────────────────────── */

function Badge({ badge }) {
  if (!badge) return null;
  if (badge === "featured") return <span className="sah-cbadge sah-cbadge-featured">Featured</span>;
  if (badge === "new")      return <span className="sah-cbadge sah-cbadge-new">New</span>;
  if (badge === "verified") return <span className="sah-cbadge sah-cbadge-verified">Verified</span>;
  return null;
}

function ProviderCard({ p, onView }) {
  const [imgErr, setImgErr] = useState(false);
  const ic = CAT_ICON[p.category] || "fa-star";
  return (
    <article className={`sah-provider-card${p._inFeaturedSlot ? " is-featured-slot" : ""}`} data-cat={p.category}>
      <div className="sah-card-thumb">
        {p.image && !imgErr
          ? <img src={p.image} alt={p.name} loading="lazy" onError={() => setImgErr(true)} />
          : <div className="sah-card-thumb-fallback"><i className={`fas ${ic}`} /></div>
        }
        <div className="sah-card-badges">
          <Badge badge={p.badge} />
        </div>
        <button className="sah-card-save"><i className="far fa-heart" /></button>
      </div>
      <div className="sah-card-provider-row">
        <div className="sah-pav"><i className={`fas ${ic}`} /></div>
        <div>
          <div className="sah-pav-name">{p.name}</div>
          <div className="sah-pav-tier">{TIER_LBL[p.tier] || "Community Member"}</div>
        </div>
      </div>
      <div className="sah-card-body">
        <div className="sah-card-title">{p.name}</div>
        <div className="sah-card-meta">
          <span><i className="fas fa-map-marker-alt" />{p.location}</span>
          <span><i className="fas fa-laptop" />{p.delivery}</span>
        </div>
        {p.rating && (
          <div className="sah-card-rating">
            <span className="sah-stars">{starsStr(p.rating)}</span>
            <span className="sah-rnum">{p.rating.toFixed(1)}</span>
            <span className="sah-rcnt">({p.reviewCount})</span>
          </div>
        )}
        <div className="sah-card-foot">
          <div>
            <div className="sah-from-label">Starting from</div>
            <div className="sah-card-price">{p.priceFrom || "Contact"}</div>
          </div>
          <button className="sah-card-cta" onClick={() => onView(p.id)}>View Profile</button>
        </div>
      </div>
    </article>
  );
}

function PlanCard({ plan, openId, onToggle, allOpen, onCtaClick }) {
  const isOpen = allOpen || openId === plan.id;
  return (
    <div className={`sah-plan-item${plan.highlight ? " highlight" : ""}`} onClick={() => onToggle(plan.id)}>
      <div className="sah-plan-header">
        <div className="sah-plan-info">
          <div className="sah-plan-name">{plan.name}</div>
          <div className="sah-plan-desc">{plan.desc}</div>
        </div>
        <div className="sah-plan-right">
          <div className="sah-plan-price">{plan.price}<small>/ month</small></div>
          <i className={`fas fa-chevron-down sah-plan-chevron${isOpen ? " open" : ""}`} />
        </div>
      </div>
      <div className={`sah-plan-details${isOpen ? " open" : ""}`}>
        <div className="sah-plan-details-inner">
          <div className="sah-plan-details-content">
            <ul className="sah-plan-features">
              {plan.features.map((f, i) => (
                <li key={i} className={f.yes ? "" : "no"}>
                  {f.yes
                    ? <i className="fas fa-check sah-ico-yes" />
                    : <i className="fas fa-times sah-ico-no" />
                  }
                  {f.text}
                </li>
              ))}
            </ul>
            <button
              className="sah-plan-cta-link"
              onClick={e => { e.stopPropagation(); onCtaClick(plan.planParam); }}
            >
              {plan.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── LOGIN REQUIRED MODAL (only used for "View Profile") ────────────────── */
function LoginRequiredModal({ open, onClose, onLogin, onRegister, message }) {
  return (
    <div
      className={`sah-modal-overlay${open ? " open" : ""}`}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="sah-modal-box">
        <div className="sah-modal-head" style={{ background:"#5a5a5a" }}>
          <h2>Login Required</h2>
          <p>You need an account to continue</p>
          <button className="sah-modal-close" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="sah-modal-body">
          <div style={{ paddingTop:"8px" }}>
            <div className="sah-login-modal-icon">
              <i className="fas fa-lock" />
            </div>
            <div className="sah-login-modal-title">
              {message || "Please log in to continue"}
            </div>
            <div className="sah-login-modal-desc">
              Sign in to your existing account, or create a free account to get started.
            </div>
            <div className="sah-login-modal-actions">
              <button className="sah-login-modal-primary" onClick={onLogin}>
                <i className="fas fa-right-to-bracket" style={{ marginRight:"8px" }} />
                Log In to My Account
              </button>
              <div className="sah-login-modal-divider">or</div>
              <button className="sah-login-modal-secondary" onClick={onRegister}>
                <i className="fas fa-user-plus" style={{ marginRight:"8px" }} />
                Create a Free Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm]     = useState("");
  const [searchCat, setSearchCat]       = useState("");
  const [activeCat, setActiveCat]       = useState("all");
  const [providers, setProviders]       = useState([]);
  const [showAllProviders, setShowAllProviders] = useState(false);
  const [openPlanId, setOpenPlanId]     = useState(null);
  const [allPlansOpen, setAllPlansOpen] = useState(false);
  const [plansVisible, setPlansVisible] = useState(false);
  const [regModal, setRegModal]         = useState(false);
  const [nlEmail, setNlEmail]           = useState("");
  const [nlMsg, setNlMsg]               = useState({ text:"", type:"" });
  const [toast, setToast]               = useState({ show:false, msg:"", err:false });
  const [currentUser, setCurrentUser]   = useState(null);
  // Login-required modal — only shown when viewing a profile while logged out
  const [loginModal, setLoginModal]     = useState({ open:false, message:"" });

  useEffect(() => {
    injectHead();
    if (!document.getElementById("sah-styles")) {
      const s = document.createElement("style");
      s.id = "sah-styles"; s.textContent = CSS;
      document.head.appendChild(s);
    }

    const checkUser = () => {
      try {
        const user = JSON.parse(localStorage.getItem('sah_current_user'));
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") { setRegModal(false); setLoginModal(m => ({ ...m, open:false })); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    setProviders(getAll());
  }, []);

  const showToast = useCallback((msg, err = false) => {
    setToast({ show:true, msg, err });
    setTimeout(() => setToast(t => ({ ...t, show:false })), 3500);
  }, []);

  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    let list = getAll();
    if (searchCat) list = list.filter(p => p.category === searchCat);
    if (term) list = list.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.location || "").toLowerCase().includes(term) ||
      (p.tags || []).some(t => t.toLowerCase().includes(term))
    );
    setProviders(list);
    setShowAllProviders(false);
    document.getElementById("sah-providers")?.scrollIntoView({ behavior:"smooth" });
  };

  const filterCat = (cat) => {
    setActiveCat(cat);
    setShowAllProviders(false);
    let list = getAll();
    if (cat !== "all") list = list.filter(p => p.category === cat);
    setProviders(list);
  };

  const togglePlan = (id) => {
    setAllPlansOpen(false);
    setOpenPlanId(prev => prev === id ? null : id);
  };

  const handleBecomeProvider = (e) => {
    if (e) e.preventDefault();
    const next = !plansVisible;
    setPlansVisible(next);
    if (next) {
      setAllPlansOpen(true);
      setTimeout(() => {
        document.getElementById("sah-plans-anchor")?.scrollIntoView({ behavior:"smooth", block:"center" });
      }, 80);
    }
  };

  // ── PLAN CTA: always navigate to provider registration step 2 ──────────────
  // No login check here — anyone can start the registration flow regardless of
  // whether they are logged in or not.
  const handlePlanCtaClick = (planParam) => {
    navigate(`/register/provider?step=2&plan=${encodeURIComponent(planParam)}`);
  };

  // ── VIEW PROFILE: requires login ───────────────────────────────────────────
  const viewProfile = (id) => {
    if (!currentUser) {
      setLoginModal({
        open: true,
        message: "Please log in to view provider profiles.",
      });
      return;
    }
    navigate("/profile?id=" + id);
  };

  // Login modal action handlers (only relevant for "View Profile" flow)
  const handleLoginModalLogin = () => {
    setLoginModal(m => ({ ...m, open:false }));
    navigate('/login');
  };

  const handleLoginModalRegister = () => {
    setLoginModal(m => ({ ...m, open:false }));
    setRegModal(true);
  };

  const handleNewsletter = () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nlEmail.trim());
    if (!nlEmail.trim() || !valid) {
      setNlMsg({ text:"Please enter a valid email address.", type:"error" });
      return;
    }
    setNlMsg({ text:"You're subscribed — thank you!", type:"success" });
    setNlEmail("");
  };

  const handleLogout = () => {
    localStorage.removeItem('sah_current_user');
    localStorage.removeItem('sah_token');
    setCurrentUser(null);
    showToast("Logged out successfully");
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    return currentUser.role === 'admin' ? '/admin-dashboard' : '/client-dashboard';
  };

  const FILTER_PILLS = [
    { cat:"all",            label:"All Services" },
    { cat:"tutor",          label:"Tutors",         icon:"fa-chalkboard-teacher" },
    { cat:"therapist",      label:"Therapists",     icon:"fa-heart" },
    { cat:"curriculum",     label:"Curriculum",     icon:"fa-book-open" },
    { cat:"school",         label:"Online Schools", icon:"fa-school" },
    { cat:"consultant",     label:"Consultants",    icon:"fa-user-tie" },
    { cat:"extracurricular",label:"Enrichment",     icon:"fa-palette" },
  ];

  const displayedProviders = showAllProviders ? providers : providers.slice(0, 4);

  return (
    <div className="sah-wrap">

      {/* HEADER */}
      <header className="sah-header">
        <div className="sah-container sah-nav-inner">
          <Link to="/" className="sah-brand">
            <div className="sah-brand-divider" />
            <div className="sah-brand-text">
              <span className="sah-brand-name">SA Homeschooling</span>
              <span className="sah-brand-tag">Education Services</span>
            </div>
          </Link>
          <nav className="sah-nav-links">
            <a href="#sah-providers">Find Services</a>
            <a href="#sah-how">How It Works</a>
            <a href="#sah-plans-anchor" onClick={handleBecomeProvider}>Become a Provider</a>
            <a href="https://sahomeschooling.com" target="_blank" rel="noreferrer">
              Magazine <i className="fas fa-arrow-up-right-from-square" style={{ fontSize:"0.65rem" }} />
            </a>
          </nav>
          <div className="sah-nav-ctas">
            {currentUser ? (
              <>
                {currentUser.role === 'admin' || currentUser.role === 'provider' ? (
                  <Link to={getDashboardPath()} className="sah-user-profile-btn">
                    <i className="fas fa-user-circle" /> Profile
                  </Link>
                ) : null}
                <button onClick={handleLogout} className="sah-logout-btn">
                  <i className="fas fa-right-from-bracket" /> Log Out
                </button>
              </>
            ) : (
              <>
                <button className="sah-btn-ghost-nav" onClick={() => navigate('/login')}>Log In</button>
                <button className="sah-btn-solid-nav" onClick={() => setRegModal(true)}>Register</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="sah-hero">
        <div className="sah-hero-bg" />
        <div className="sah-container">
          <div className="sah-hero-inner">
            <div className="sah-hero-top">
              <h1 className="sah-hero-h1">
                Find the Right <em>Support</em><br />for Your Child's Education
              </h1>

              {/* SEARCH BAR */}
              <div className="sah-hero-search">
                <div className="sah-hs-icon"><i className="fas fa-search" /></div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="Search subjects, services or provider names..."
                />
                <div className="sah-hs-sep" />
                <select value={searchCat} onChange={e => setSearchCat(e.target.value)}>
                  <option value="">All Categories</option>
                  <option value="tutor">Tutors</option>
                  <option value="therapist">Therapists</option>
                  <option value="curriculum">Curriculum</option>
                  <option value="school">Online Schools</option>
                  <option value="consultant">Consultants</option>
                  <option value="extracurricular">Enrichment</option>
                </select>
                <button className="sah-hs-btn" onClick={handleSearch}>Search</button>
              </div>

              {/* HERO TAGLINE */}
              <div className="sah-hero-tagline">
                <h2>Are You a Homeschooling Service Provider?</h2>
                <p>
                  Reach thousands of South African homeschooling families. List your services
                  on our dedicated directory — free to start.
                </p>
                <button
                  className={`sah-become-btn${plansVisible ? " active" : ""}`}
                  onClick={handleBecomeProvider}
                >
                  <i className="fas fa-store" />
                  Become a Service Provider
                  <i className={`fas fa-chevron-down sah-chev`} />
                </button>
              </div>
            </div>

            {/* PLANS ACCORDION */}
            <div id="sah-plans-anchor" />
            <div className={`sah-hero-plans-wrap${plansVisible ? " open" : ""}`}>
              <div className="sah-hero-plans-inner">
                <div className="sah-hero-plans-grid-outer">
                  <div className="sah-hero-plans-grid">
                    {PLANS.map(plan => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        openId={openPlanId}
                        onToggle={togglePlan}
                        allOpen={allPlansOpen}
                        onCtaClick={handlePlanCtaClick}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="sah-filter-bar">
        <div className="sah-container">
          <div className="sah-filter-bar-row">
            <span className="sah-filter-label">Browse:</span>
            {FILTER_PILLS.map(pill => (
              <button
                key={pill.cat}
                className={`sah-fpill${activeCat === pill.cat ? " active" : ""}`}
                onClick={() => filterCat(pill.cat)}
              >
                {pill.icon && <i className={`fas ${pill.icon}`} />} {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PROVIDERS */}
      <section className="sah-providers-section" id="sah-providers">
        <div className="sah-container">
          <div className="sah-sec-header">
            <div>
              <span className="sah-sec-eyebrow">Service Providers</span>
              <h2>Recently Added Providers</h2>
            </div>
            <div className="sah-sec-right">
              {providers.length > 4 && !showAllProviders && (
                <button className="sah-link-btn" onClick={() => setShowAllProviders(true)}>
                  Show all {providers.length} providers →
                </button>
              )}
              {showAllProviders && providers.length > 4 && (
                <button className="sah-link-btn" onClick={() => setShowAllProviders(false)}>
                  ← Show fewer
                </button>
              )}
            </div>
          </div>
          <div className="sah-provider-grid">
            {providers.length === 0 ? (
              <div className="sah-grid-empty">
                <i className="fas fa-search" />
                <h3>No providers found</h3>
                <p>Be the first to list — it's free.</p>
                <Link
                  to="/register/provider"
                  className="sah-become-btn"
                  style={{ fontSize:"0.88rem", marginTop:"12px", textDecoration:"none" }}
                >
                  <i className="fas fa-plus" /> Add Your Listing
                </Link>
              </div>
            ) : (
              displayedProviders.map(p => <ProviderCard key={p.id} p={p} onView={viewProfile} />)
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="sah-how-section" id="sah-how">
        <div className="sah-container">
          <div className="sah-how-header">
            <span className="sah-sec-eyebrow">How It Works</span>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,3vw,2rem)", fontWeight:800, color:"var(--dark)" }}>
              Get Listed in Four Simple Steps
            </h2>
          </div>
          <div className="sah-steps-grid">
            {[
              { n:"01", t:"Create Your Profile",  d:"Complete our registration: your details, services, location, qualifications, pricing and availability." },
              { n:"02", t:"Get Verified",          d:"Our team reviews your credentials to ensure quality and trust for all homeschooling families on the platform." },
              { n:"03", t:"Appear in Search",      d:"Your listing goes live. Families searching your area and subject will find and contact you directly." },
              { n:"04", t:"Grow Your Reach",       d:"Upgrade to the Deluxe Package for homepage placement, a 3-month campaign, analytics dashboard and newsletter exposure." },
            ].map(s => (
              <div key={s.n} className="sah-step">
                <span className="sah-step-num">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="sah-footer">
        <div className="sah-container">
          <div className="sah-footer-grid">
            <div className="sah-footer-brand">
              <span className="sah-footer-logo">SA Homeschooling Directory</span>
              <p>South Africa's dedicated directory connecting homeschooling families with trusted tutors, therapists, curriculum providers and education specialists.</p>
              <div className="sah-footer-newsletter">
                <div className="sah-footer-newsletter-row">
                  <input
                    type="email"
                    value={nlEmail}
                    onChange={e => setNlEmail(e.target.value)}
                    placeholder="Your email address…"
                  />
                  <button type="button" onClick={handleNewsletter}>Subscribe</button>
                </div>
                {nlMsg.text && <div className={`sah-nl-feedback ${nlMsg.type}`}>{nlMsg.text}</div>}
              </div>
            </div>
            <div className="sah-footer-col"><h4>For Families</h4><ul>
              <li><a href="#sah-providers">Find a Tutor</a></li>
              <li><a href="#sah-providers">Browse Curriculum</a></li>
              <li><a href="#sah-providers">Therapists</a></li>
              <li><a href="#sah-providers">Online Schools</a></li>
            </ul></div>
            <div className="sah-footer-col"><h4>For Providers</h4><ul>
              <li><a href="#sah-plans-anchor" onClick={handleBecomeProvider}>List a Service</a></li>
              <li><a href="#sah-plans-anchor" onClick={handleBecomeProvider}>Pricing Plans</a></li>
              <li><Link to="/login">Provider Login</Link></li>
              <li><a href="#sah-how">Verification Process</a></li>
            </ul></div>
            <div className="sah-footer-col"><h4>SA Homeschooling</h4><ul>
              <li><a href="https://sahomeschooling.com" target="_blank" rel="noreferrer">Magazine</a></li>
              <li><Link to="/about">About the Directory</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><a href="https://sahomeschooling.com/privacy-policy-for-sa-homeschooling-beyond/" target="_blank" rel="noreferrer">Privacy Policy</a></li>
            </ul></div>
          </div>
          <div className="sah-footer-trust">
            {[
              ["fa-shield-alt","All providers manually verified"],
              ["fa-lock","Secure & private enquiries"],
              ["fa-star","4.9 average provider rating"],
            ].map(([ic, txt]) => (
              <div key={txt} className="sah-footer-trust-item">
                <i className={`fas ${ic}`} /> {txt}
              </div>
            ))}
            <div className="sah-footer-trust-item" style={{ marginLeft:"auto" }}>
              <i className="fas fa-map-marker-alt" />
              <span>
                <strong style={{ color:"rgba(255,255,255,0.65)" }}>OUR OFFICE:</strong>{" "}
                Tshimologong Digital Precinct, 41 Juta Street, Braamfontein, Johannesburg, South Africa
              </span>
            </div>
          </div>
          <div className="sah-footer-bottom">
            <p>&copy; 2025 SA Homeschooling Directory. All rights reserved.</p>
            <div className="sah-footer-bottom-links">
              <a href="https://sahomeschooling.com/privacy-policy-for-sa-homeschooling-beyond/" target="_blank" rel="noreferrer">Privacy</a>
              {["Terms","Cookies","Sitemap"].map(l => <Link key={l} to={`/${l.toLowerCase()}`}>{l}</Link>)}
            </div>
            <div className="sah-footer-socials">
              {[
                ["fab fa-facebook-f",  "https://www.facebook.com/SAHomeschoolingMagazine"],
                ["fab fa-instagram",   "https://www.instagram.com/sahomeschoolingmag"],
                ["fab fa-linkedin-in", "https://www.linkedin.com"],
                ["fab fa-x-twitter",  "https://x.com/SAH_andBeyond"],
              ].map(([ic, href]) => (
                <a key={ic} href={href} className="sah-footer-soc" target="_blank" rel="noreferrer">
                  <i className={ic} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* REGISTER CHOOSER MODAL */}
      <div
        className={`sah-modal-overlay${regModal ? " open" : ""}`}
        onClick={e => { if (e.target === e.currentTarget) setRegModal(false); }}
      >
        <div className="sah-modal-box">
          <div className="sah-modal-head">
            <h2>Create an Account</h2>
            <p>Choose how you'd like to join</p>
            <button className="sah-modal-close" onClick={() => setRegModal(false)}>
              <i className="fas fa-times" />
            </button>
          </div>
          <div className="sah-modal-body">
            <div className="sah-reg-options">
              <Link to="/register/user" className="sah-reg-opt" onClick={() => setRegModal(false)}>
                <div className="sah-reg-opt-icon user"><i className="fas fa-user" /></div>
                <div>
                  <div className="sah-reg-opt-title">I'm a User / Customer</div>
                  <div className="sah-reg-opt-desc">Browse, search and save provider profiles</div>
                </div>
                <i className="fas fa-chevron-right" style={{ marginLeft:"auto", color:"#ccc", fontSize:"0.8rem" }} />
              </Link>
              <Link to="/register/provider" className="sah-reg-opt" onClick={() => setRegModal(false)}>
                <div className="sah-reg-opt-icon provider"><i className="fas fa-store" /></div>
                <div>
                  <div className="sah-reg-opt-title">I'm a Service Provider</div>
                  <div className="sah-reg-opt-desc">Create a full listing — tutor, therapist, school etc.</div>
                </div>
                <i className="fas fa-chevron-right" style={{ marginLeft:"auto", color:"#ccc", fontSize:"0.8rem" }} />
              </Link>
            </div>
            <div className="sah-modal-switch">
              Already have an account?{" "}
              <a href="#login" onClick={e => { e.preventDefault(); setRegModal(false); navigate('/login'); }}>
                Log in
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* LOGIN REQUIRED MODAL — only triggered by "View Profile" when logged out */}
      <LoginRequiredModal
        open={loginModal.open}
        message={loginModal.message}
        onClose={() => setLoginModal(m => ({ ...m, open:false }))}
        onLogin={handleLoginModalLogin}
        onRegister={handleLoginModalRegister}
      />

      {/* TOAST */}
      <div
        className={`sah-toast${toast.show ? " show" : ""}`}
        style={{ background: toast.err ? "#b91c1c" : "var(--grey)" }}
      >
        <i className="fas fa-check-circle" />
        <span>{toast.msg}</span>
      </div>

    </div>
  );
}