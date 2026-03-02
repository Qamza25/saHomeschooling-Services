import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../assets/css/profile.css';

const SEED_PROVIDERS = [
  {
    id: "s1", name: "STEM Mastery Tutors", category: "tutor", location: "Johannesburg, Gauteng",
    delivery: "Online & In-person",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2b033f?w=600&auto=format&fit=crop&q=75",
    priceFrom: "R280/hr", badge: "featured", rating: 4.9, reviewCount: 62, tier: "featured",
    registered: "2025-01-10T08:00:00Z", status: "approved",
    primaryCategory: "Tutor", city: "Johannesburg", province: "Gauteng", deliveryMode: "Online & In-person",
    bio: "Specialist STEM tutors for Grades 8–12. We focus on Mathematics, Physical Sciences and Life Sciences with a proven track record of improving results.",
    tags: ["Mathematics", "Physical Sciences", "Life Sciences", "Grades 8–12"],
    ageGroups: ["11–13", "14–18"], startingPrice: "R280/hr",
    availabilityDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    availabilityNotes: "Weekday afternoons & Saturdays",
    phone: "+27 11 000 1111", contactEmail: "info@stemmastery.co.za",
    certifications: "SACE Registered, Honours in Mathematics Education",
    listingPlan: "featured",
    reviews: { average: 4.9, count: 62, items: [{ reviewer: "Nomsa P.", rating: 5, text: "My son went from 40% to 82% in Maths. Incredible tutors." }] }
  },
  {
    id: "s2", name: "Creative Minds Curriculum", category: "curriculum", location: "Cape Town, Western Cape",
    delivery: "Online",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=75",
    priceFrom: "R4 200/term", badge: "verified", rating: 5.0, reviewCount: 34, tier: "pro",
    registered: "2025-01-12T09:00:00Z", status: "approved",
    primaryCategory: "Curriculum Provider", city: "Cape Town", province: "Western Cape", deliveryMode: "Online",
    bio: "Award-winning home education curriculum aligned with CAPS and internationally accredited. Full Gr R–12 offerings with parent support included.",
    tags: ["CAPS Aligned", "Full Curriculum", "Gr R–12", "Parent Support"],
    ageGroups: ["5–7", "8–10", "11–13", "14–18"], startingPrice: "R4 200/term",
    availabilityDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    availabilityNotes: "Online resources available 24/7",
    phone: "+27 21 000 2222", contactEmail: "hello@creativeminds.co.za",
    certifications: "Umalusi Accredited, Cambridge Affiliated",
    listingPlan: "pro",
    reviews: { average: 5.0, count: 34, items: [{ reviewer: "Riana V.", rating: 5, text: "The best investment we made for our homeschool journey." }] }
  },
  {
    id: "s3", name: "EduTherapy SA", category: "therapist", location: "Durban, KwaZulu-Natal",
    delivery: "Hybrid",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=75",
    priceFrom: "R650/session", badge: "featured", rating: 4.8, reviewCount: 47, tier: "featured",
    registered: "2025-01-14T10:00:00Z", status: "approved",
    primaryCategory: "Therapist", city: "Durban", province: "KwaZulu-Natal", deliveryMode: "Hybrid",
    bio: "Educational therapists specialising in learning differences, ADHD, dyslexia, and occupational therapy for homeschooled children.",
    tags: ["OT", "ADHD", "Dyslexia", "Learning Support", "Educational Therapy"],
    ageGroups: ["5–7", "8–10", "11–13"], startingPrice: "R650/session",
    availabilityDays: ["Mon", "Tue", "Wed", "Thu"],
    availabilityNotes: "By appointment — contact to book",
    phone: "+27 31 000 3333", contactEmail: "bookings@edutherapy.co.za",
    certifications: "HPCSA Registered, BEd Honours (Learning Support)",
    listingPlan: "featured",
    reviews: { average: 4.8, count: 47, items: [{ reviewer: "Lerato M.", rating: 5, text: "Transformed our daughter's confidence and love of learning." }] }
  },
  {
    id: "s4", name: "Future Leaders Academy", category: "school", location: "Online — National",
    delivery: "Online",
    image: "https://images.unsplash.com/photo-1529390079861-591de3547d13?w=600&auto=format&fit=crop&q=75",
    priceFrom: "Custom quote", badge: "new", rating: 4.7, reviewCount: 18, tier: "pro",
    registered: "2025-01-16T11:00:00Z", status: "approved",
    primaryCategory: "Online / Hybrid School", city: "Online", province: "Gauteng", deliveryMode: "Online",
    bio: "A fully accredited online school delivering quality education to homeschoolers across all 9 provinces. Live classes, recorded lessons and dedicated academic support.",
    tags: ["Online School", "Live Classes", "National", "Accredited"],
    ageGroups: ["8–10", "11–13", "14–18"], startingPrice: "Contact for quote",
    availabilityDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    availabilityNotes: "Live classes Mon–Fri, 8:00–14:00",
    phone: "+27 10 000 4444", contactEmail: "enrol@futureleaders.co.za",
    certifications: "Umalusi Registered, ISASA Member",
    listingPlan: "pro",
    reviews: { average: 4.7, count: 18, items: [{ reviewer: "Sipho K.", rating: 5, text: "Our kids thrive in the structured online environment." }] }
  },
  {
    id: "khan", name: "Khan Academy SA", category: "curriculum", location: "Johannesburg, Gauteng",
    delivery: "Online",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop&q=75",
    priceFrom: "Free", badge: "featured", rating: 4.9, reviewCount: 156, tier: "featured",
    registered: "2025-01-01T00:00:00Z", status: "approved",
    primaryCategory: "Curriculum Provider", city: "Johannesburg", province: "Gauteng", deliveryMode: "Online",
    bio: "Free world-class education for anyone, anywhere. Our curriculum covers mathematics, science, computing, humanities and more. We provide video lessons, practice exercises, and personalised learning dashboards for homeschoolers across South Africa. Completely free, forever.",
    tags: ["Mathematics", "Science", "Online Learning", "Free Curriculum", "Video Lessons", "All Ages"],
    ageGroups: ["5–7", "8–10", "11–13", "14–18"], startingPrice: "Free",
    availabilityDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    availabilityNotes: "24/7 Online — self-paced learning available anytime",
    phone: "+27 11 555 1234", contactEmail: "support@khanacademy.org.za",
    email: "contact@khanacademy.org.za",
    certifications: "Khan Academy Certified Content Provider, Google for Education Partner",
    degrees: "BSc Computer Science (Stanford), MEd (Harvard)",
    memberships: "SA Curriculum Association, Digital Learning Collective",
    clearance: "Verified (2025)",
    social: "https://www.khanacademy.org",
    listingPlan: "featured",
    reviews: {
      average: 4.9, count: 156,
      items: [
        { reviewer: "Sarah J.", rating: 5, text: "Excellent resource for our homeschool curriculum." },
        { reviewer: "Thabo M.", rating: 5, text: "My kids love the math challenges." }
      ]
    }
  },
];

function findProvider(id, email) {
  try {
    const stored = JSON.parse(localStorage.getItem('sah_providers') || '[]');
    const all = [...stored, ...SEED_PROVIDERS];
    let found = null;
    if (id) found = all.find(p => p.id === id) || null;
    else if (email) found = all.find(p => p.email === email || p.contactEmail === email) || null;
    if (found) {
      return {
        ...found,
        name: found.name || '',
        bio: found.bio || '',
        primaryCategory: found.primaryCategory || found.category || '',
        city: found.city || '',
        province: found.province || '',
        phone: found.phone || '',
        whatsapp: found.whatsapp || '',
        contactEmail: found.contactEmail || found.email || '',
        website: found.website || found.social || '',
        facebook: found.facebook || '',
        social: found.social || found.website || '',
        startingPrice: typeof found.startingPrice === 'string' ? found.startingPrice : (found.priceFrom || ''),
        deliveryMode: found.deliveryMode || found.delivery || '',
        degrees: found.degrees || '',
        certifications: found.certifications || '',
        memberships: found.memberships || '',
        clearance: found.clearance || '',
        availabilityNotes: found.availabilityNotes || '',
        tags: Array.isArray(found.tags) ? found.tags : [],
        ageGroups: Array.isArray(found.ageGroups) ? found.ageGroups : [],
        availabilityDays: Array.isArray(found.availabilityDays) ? found.availabilityDays : [],
        services: Array.isArray(found.services) ? found.services : [],
        reviews: found.reviews || { average: 0, count: 0, items: [] },
      };
    }
    return null;
  } catch { return null; }
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ORANGE = '#c2510a';

/* ─── Design tokens ────────────────────────────────────────────
   Single card style used throughout — keeps all cards visually
   identical so the only differentiator is content.
──────────────────────────────────────────────────────────────── */
const S = {
  hero: {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
    border: 'none',
    borderRadius: '0',
    marginBottom: '0',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    background: '#ede9e3',
    border: '1px solid #dedad4',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  // Kept for backward-compat — same values as card
  gray: {
    background: '#ede9e3',
    border: '1px solid #dedad4',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  white: {
    background: '#ede9e3',
    border: '1px solid #dedad4',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
};

/* ─── CSS injection ─────────────────────────────────────────────
   All spacing uses one rhythm unit: 24px.
   Sections are separated by 24px.  Internal card padding: 24px.
   No element has its own ad-hoc marginBottom — everything flows
   from .profile-section-block + the grid gap values.
──────────────────────────────────────────────────────────────── */
const injectResponsiveStyles = () => {
  if (document.getElementById('profile-responsive-styles')) return;
  const style = document.createElement('style');
  style.id = 'profile-responsive-styles';
  style.textContent = `

    /* ── Global box-sizing reset (scoped) ── */
    #profilePage *,
    #profilePage *::before,
    #profilePage *::after {
      box-sizing: border-box;
    }

    /* ════════════════════════════════════════
       PAGE WRAPPER
       Handles all outer padding.  Never add
       padding to individual sections — use
       this class only.
    ════════════════════════════════════════ */
    .page-inner {
      max-width: 1280px;
      margin: 0 auto;
      /* top 24px | sides 32px | bottom 48px */
      padding: 24px 32px 48px;
    }

    /* ════════════════════════════════════════
       SECTION RHYTHM
       Every top-level block gets exactly 24px
       below it.  The last block (#contactSection)
       needs no bottom margin — the page-inner
       bottom padding handles the footer gap.
    ════════════════════════════════════════ */
    .profile-section-block {
      margin-bottom: 24px;
    }
    .profile-section-block > *:last-child {
      margin-bottom: 0;
    }

    /* ════════════════════════════════════════
       HERO GRID
    ════════════════════════════════════════ */
    .profile-hero-grid {
      display: grid;
      grid-template-columns: 68% 1fr;
      gap: 24px;
      align-items: stretch;
      /* margin handled exclusively by .profile-section-block */
    }

    /* ── Left card ── */
    .profile-left-card {
      background: #ede9e3;
      border: 1px solid #dedad4;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    }

    /* Sections inside the left card */
    .profile-section {
      margin-top: 32px;
      padding-top: 28px;
      border-top: 1px solid rgba(0,0,0,0.08);
    }
    .profile-section.no-border {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }

    /* ── Right card (image/profile panel) ── */
    .profile-right-card {
      position: relative;
      border-radius: 14px;
      overflow: hidden;
      background-color: #2a2a2a;
      background-size: cover;
      background-position: center 20%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.30);
      min-height: 0;
      height: 100%;      /* fills grid row via align-items:stretch */
    }
    .profile-right-overlay {
      position: absolute;
      inset: 0;
      z-index: 0;
      background: linear-gradient(
        160deg,
        rgba(10,10,10,0.88) 0%,
        rgba(35,35,35,0.70) 55%,
        rgba(10,10,10,0.82) 100%
      );
    }
    .profile-right-content {
      position: relative;
      z-index: 1;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      height: 100%;
    }

    /* ════════════════════════════════════════
       TYPOGRAPHY HELPERS
    ════════════════════════════════════════ */
    .sec-eyebrow {
      display: block;
      margin-bottom: 6px;
    }
    .card-heading {
      margin: 0 0 16px 0;
      font-size: 1.35rem;
      line-height: 1.3;
    }

    /* ════════════════════════════════════════
       TAG CLOUD & GRADE PILLS
    ════════════════════════════════════════ */
    .tag-cloud,
    .grade-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 0;
    }
    .tag-cloud .tag,
    .grade-pills > div {
      display: inline-flex;
      align-items: center;
      background: #ffffff;
      color: ${ORANGE};
      border: 1.5px solid ${ORANGE};
      font-weight: 600;
      padding: 7px 16px;
      border-radius: 30px;
      font-size: 0.85rem;
      line-height: 1;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(194,81,10,0.08);
      transition: background 0.18s, color 0.18s;
    }
    .tag-cloud .tag:hover,
    .grade-pills > div:hover {
      background: ${ORANGE};
      color: #fff;
    }
    .no-services-msg {
      color: #888;
      font-style: italic;
      font-size: 0.9rem;
      margin: 0;
      padding: 4px 0;
    }
    .age-groups-section {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid rgba(0,0,0,0.07);
    }
    .age-groups-section .sec-eyebrow {
      margin-bottom: 10px;
    }

    /* ════════════════════════════════════════
       RATING BAR (inside right card)
    ════════════════════════════════════════ */
    .rating-bar {
      display: flex;
      align-items: center;
      gap: 14px;
      width: 100%;
      background: rgba(255,255,255,0.10);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 10px;
      padding: 14px 16px;
      margin-top: 20px;
    }
    .rating-big {
      font-size: 2.2rem;
      font-weight: 800;
      line-height: 1;
      flex-shrink: 0;
    }
    .rating-stars { font-size: 1rem; line-height: 1.4; letter-spacing: 1px; }
    .rating-sub   { font-size: 0.75rem; line-height: 1.4; margin-top: 2px; }

    /* ════════════════════════════════════════
       CREDENTIALS + AVAILABILITY ROW
    ════════════════════════════════════════ */
    .profile-two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      align-items: start;
    }

    /* ════════════════════════════════════════
       CARD PADDING — uniform across every card
    ════════════════════════════════════════ */
    .card-pad {
      padding: 24px;
    }

    /* ════════════════════════════════════════
       DAY PILLS
    ════════════════════════════════════════ */
    .avail-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }
    .avail-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 48px;
      padding: 7px 10px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      line-height: 1;
      white-space: nowrap;
    }

    /* ════════════════════════════════════════
       QUALIFICATIONS LIST
    ════════════════════════════════════════ */
    .qual-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .qual-list li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 0.9rem;
      color: #3a3a3a;
      line-height: 1.5;
    }
    .qual-list li i { margin-top: 2px; flex-shrink: 0; }

    /* ════════════════════════════════════════
       CONTACT SECTION
    ════════════════════════════════════════ */

    /* Outer two-col: form left | right stack
       align-items: stretch makes both columns
       exactly the same height.               */
    .contact-two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      align-items: stretch;
    }

    /* Form card — anchors to top, natural height */
    .contact-form-card {
      align-self: start;
    }

    /* Right stack fills the full column height
       so Contact Details + Location together
       match the form height on the left.     */
    .contact-right-stack {
      display: flex;
      flex-direction: column;
      gap: 24px;
      width: 100%;
      height: 100%;           /* fills grid row height */
    }

    /* Location card grows to fill whatever
       space remains after Contact Details.   */
    .location-card {
      flex: 1;                /* takes up remaining height */
      width: 100%;
      display: flex;
      flex-direction: column;
    }
    /* card-pad inside location must also flex */
    .location-card > .card-pad {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .location-card .location-body {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    /* Push delivery line to bottom of card */
    .location-card .location-delivery {
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid rgba(0,0,0,0.08);
    }

    /* Location inner layout */
    .location-body {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    /* Place row: icon + name + badge */
    .location-place {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      margin-bottom: 16px;
    }
    .location-place-name {
      font-weight: 600;
      font-size: 0.92rem;
      color: #2a2a2a;
    }
    .location-badge {
      font-size: 0.72rem;
      color: #777;
      background: rgba(0,0,0,0.05);
      padding: 3px 10px;
      border-radius: 20px;
      white-space: nowrap;
    }
    /* Delivery row — pushed to bottom by margin-top:auto */
    .location-delivery {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #555;
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid rgba(0,0,0,0.08);
    }

    /* ════════════════════════════════════════
       FORM FIELDS
    ════════════════════════════════════════ */
    .form-group .field {
      margin-bottom: 14px;
    }
    .form-group .field label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #444;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .form-group .field input,
    .form-group .field select,
    .form-group .field textarea {
      width: 100%;
      font-family: inherit;
    }
    .form-group .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* ════════════════════════════════════════
       RESPONSIVE BREAKPOINTS
    ════════════════════════════════════════ */

    /* Large tablet */
    @media (max-width: 1024px) {
      .profile-hero-grid {
        grid-template-columns: 63% 1fr;
      }
    }

    /* Tablet portrait — single column */
    @media (max-width: 900px) {
      .profile-hero-grid {
        grid-template-columns: 1fr;
        align-items: start;
      }
      .profile-right-card {
        height: auto;
        min-height: 320px;
      }
      .profile-two-col {
        grid-template-columns: 1fr;
      }
      /* Stack contact columns — reset height stretching */
      .contact-two-col {
        grid-template-columns: 1fr;
        align-items: start;
      }
      .contact-right-stack {
        height: auto;
      }
      .location-card {
        flex: none;
      }
      .location-card > .card-pad,
      .location-card .location-body {
        flex: none;
      }
      .location-delivery {
        margin-top: 16px;
        padding-top: 16px;
      }
    }

    /* Mobile landscape / small tablet */
    @media (max-width: 768px) {
      .page-inner {
        padding: 16px 16px 40px;
      }
      .profile-left-card {
        padding: 20px;
      }
      .card-pad {
        padding: 18px;
      }
      /* All section gaps drop to 16px on mobile */
      .profile-hero-grid,
      .profile-two-col,
      .contact-two-col,
      .contact-right-stack {
        gap: 16px;
      }
      .profile-section-block {
        margin-bottom: 16px;
      }
      .tag-cloud,
      .grade-pills { gap: 8px; }
      .tag-cloud .tag,
      .grade-pills > div { font-size: 0.82rem; padding: 6px 14px; }
      .avail-grid   { gap: 6px; }
      .avail-pill   { min-width: 42px; padding: 6px 8px; font-size: 0.75rem; }
      .form-group .form-row { grid-template-columns: 1fr; }
      .rating-big   { font-size: 1.8rem; }
    }

    /* Small mobile */
    @media (max-width: 480px) {
      .page-inner {
        padding: 12px 12px 32px;
      }
      .profile-left-card {
        padding: 16px;
      }
      .card-pad {
        padding: 16px;
      }
      .profile-section {
        margin-top: 24px;
        padding-top: 20px;
      }
      .profile-right-card {
        min-height: 260px;
      }
      .card-heading {
        font-size: 1.15rem;
      }
    }
  `;
  document.head.appendChild(style);
};

const Eyebrow = ({ children }) => (
  <span className="sec-eyebrow" style={{ color: ORANGE, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.9px' }}>
    {children}
  </span>
);
const Heading = ({ children, style = {}, as: Tag = 'h2' }) => (
  <Tag className="card-heading" style={{ color: '#1a1a1a', ...style }}>{children}</Tag>
);

const Profile = () => {
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fromDashboard = searchParams.get('from') === 'dashboard';

  useEffect(() => {
    injectResponsiveStyles();
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    let found = findProvider(id, email);
    if (!found) {
      try {
        const cu = JSON.parse(localStorage.getItem('sah_current_user') || 'null');
        if (cu?.id) found = findProvider(cu.id, null);
      } catch { }
    }
    if (!found) found = SEED_PROVIDERS.find(p => p.id === 'khan');
    setProfile(found);
    setLoading(false);
  }, [searchParams]);

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({ title: profile?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleBack = () => {
    if (fromDashboard) {
      navigate('/client-dashboard');
    } else {
      navigate('/');
    }
  };

  if (loading) return (
    <>
      <Header />
      <main style={{ padding: '4rem', textAlign: 'center' }}>
        <div className="loading">Loading profile...</div>
      </main>
      <Footer />
    </>
  );

  if (!profile) return (
    <>
      <Header />
      <main style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Profile not found</h2>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </main>
      <Footer />
    </>
  );

  const tier = profile.listingPlan || profile.tier || 'free';

  const ratingStars = (rating) => {
    if (!rating) return '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  };

  return (
    <>
      {fromDashboard ? (
        <header style={{
          position: 'sticky', top: 0, zIndex: 1000,
          height: '68px', background: '#5a5a5a',
          boxShadow: '0 2px 12px rgba(0,0,0,0.22)',
          display: 'flex', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{
            maxWidth: 1280, margin: '0 auto', padding: '0 32px',
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <button
                onClick={handleBack}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.88)',
                  fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                  padding: '6px 0', fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}
              >
                <i className="fas fa-arrow-left" /> Back to Dashboard
              </button>
              <span style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.28)', margin: '0 16px' }} />
              <div style={{ textDecoration: 'none' }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: '1.02rem', color: '#fff', display: 'block' }}>SA Homeschooling</span>
                <span style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.68)', fontWeight: 500, letterSpacing: '0.45px', display: 'block' }}>Education Services Directory</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '7px 16px', borderRadius: 6,
                border: '1.5px solid rgba(255,255,255,0.55)', background: 'transparent',
                color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}>
                <i className="fas fa-user-circle" />
                {profile?.name || 'Provider'}
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('sah_current_user');
                  navigate('/');
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '7px 18px', borderRadius: 6,
                  border: 'none', background: ORANGE,
                  color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}
              >
                <i className="fas fa-right-from-bracket" />
                Log Out
              </button>
            </div>
          </div>
        </header>
      ) : (
        <Header />
      )}

      <main className="page-wrap" id="profilePage" data-tier={tier} style={{ display: 'block' }}>
        {/*
          .page-inner owns ALL outer spacing.
          No inline padding here — CSS class handles it.
        */}
        <div className="page-inner">

          {/* ════════════════════════════════════
              HERO — two-column
          ════════════════════════════════════ */}
          <div className="profile-hero-grid profile-section-block">

            {/* Left: About + Services */}
            <div className="profile-left-card">

              <div className="profile-section no-border">
                <Eyebrow>About the Provider</Eyebrow>
                <Heading>About Us</Heading>
                <div className="content-body" style={{ color: '#3a3a3a', lineHeight: '1.7', margin: 0 }}>
                  <p style={{ margin: 0 }}>{profile.bio || 'This provider has not yet added a description.'}</p>
                </div>
              </div>

              <div className="profile-section">
                <Eyebrow>Services</Eyebrow>
                <Heading>What We Offer</Heading>

                {profile.tags?.length > 0 && (
                  <div className="tag-cloud" style={{ marginBottom: profile.services?.length > 0 ? '20px' : '0' }}>
                    {profile.tags.map((tag, idx) => (
                      <span key={idx} className="tag">{tag}</span>
                    ))}
                  </div>
                )}

                {profile.services?.length > 0 ? (
                  <div style={{ marginTop: profile.tags?.length > 0 ? '16px' : '0' }}>
                    {profile.services.map((service, idx) => {
                      if (typeof service === 'string') {
                        return (
                          <span
                            key={idx}
                            style={{
                              background: '#ffffff',
                              color: ORANGE,
                              border: `1.5px solid ${ORANGE}`,
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              marginRight: 8,
                              marginBottom: 8,
                              padding: '7px 16px',
                              borderRadius: '30px',
                              fontSize: '0.85rem',
                              boxShadow: '0 2px 6px rgba(194,81,10,0.08)',
                            }}
                          >
                            {service}
                          </span>
                        );
                      }
                      const svcAgeGroups = service.ageGroups || [];
                      const svcSubjects = service.subjects || '';
                      return (
                        <div
                          key={idx}
                          style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            padding: '18px 20px',
                            marginBottom: '12px',
                            border: '1px solid rgba(194, 81, 10, 0.15)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
                            transition: 'box-shadow 0.2s ease',
                            cursor: 'default',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)')}
                          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.02)')}
                        >
                          {service.title && (
                            <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.05rem', marginBottom: 6 }}>
                              {service.title}
                            </div>
                          )}
                          {service.description && (
                            <div style={{ color: '#555', fontSize: '0.9rem', marginBottom: 12, lineHeight: '1.6' }}>
                              {service.description}
                            </div>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {svcSubjects && svcSubjects.split(',').map((s, i) => s.trim() && (
                              <span
                                key={i}
                                style={{
                                  background: '#f5f0ea',
                                  color: ORANGE,
                                  border: `1px solid ${ORANGE}`,
                                  fontWeight: 500,
                                  fontSize: '0.8rem',
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                }}
                              >
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                          {svcAgeGroups.length > 0 && (
                            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', color: '#777', fontWeight: 500 }}>Ages:</span>
                              {svcAgeGroups.map((age, i) => (
                                <span
                                  key={i}
                                  style={{
                                    background: ORANGE,
                                    color: '#fff',
                                    fontSize: '0.8rem',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontWeight: 600,
                                  }}
                                >
                                  {age}
                                </span>
                              ))}
                            </div>
                          )}
                          {service.deliveryMode && (
                            <div style={{ marginTop: 10, fontSize: '0.8rem', color: '#666' }}>
                              <i className="fas fa-laptop-house" style={{ marginRight: 6, color: ORANGE }} />
                              {service.deliveryMode}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  !profile.tags?.length && (
                    <p className="no-services-msg">No services listed yet.</p>
                  )
                )}

                {profile.ageGroups?.length > 0 && (
                  <div className="age-groups-section">
                    <Eyebrow>Age Groups / Grades</Eyebrow>
                    <div className="grade-pills">
                      {profile.ageGroups.map((age, idx) => (
                        <div key={idx}>{age}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Profile summary */}
            <div
              className="profile-right-card"
              style={{ backgroundImage: profile.image ? `url(${profile.image})` : 'none' }}
            >
              <div className="profile-right-overlay" />
              <div className="profile-right-content">
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '16px' }}>
                  <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.50)', color: '#fff' }} onClick={shareProfile}>
                    <i className="fas fa-share-alt"></i> Share
                  </button>
                </div>
                <div className="avatar-lg" id="profileAvatar" style={{ marginBottom: '16px' }}>
                  {profile.image
                    ? <img src={profile.image} alt={profile.name} />
                    : profile.photo
                      ? <img src={profile.photo} alt={profile.name} />
                      : <i className="fas fa-user avatar-placeholder"></i>}
                </div>
                <div className="badge-row" id="badgeRow" style={{ marginBottom: '8px' }}>
                  {tier === 'featured' && <span className="badge badge-featured"><i className="fas fa-star"></i> Featured Partner</span>}
                  {(tier === 'pro' || tier === 'featured') && <span className="badge badge-verified"><i className="fas fa-check"></i> Verified</span>}
                </div>
                <h1 className="profile-name" style={{ color: '#fff', marginBottom: '4px' }}>{profile.name}</h1>
                <p className="profile-tagline" style={{ color: 'rgba(255,255,255,0.78)', marginBottom: '8px' }}>{profile.tagline || profile.primaryCategory || ''}</p>
                {profile.startingPrice && profile.startingPrice !== 'Contact' && (
                  <div className="price-badge" style={{ background: ORANGE, color: '#fff', border: 'none', marginBottom: '12px' }}>
                    <i className="fas fa-tag"></i> From {profile.startingPrice || profile.priceFrom}
                  </div>
                )}
                <div className="meta-strip" style={{ marginBottom: '12px' }}>
                  <div className="meta-item" style={{ color: 'rgba(255,255,255,0.82)' }}><i className="fas fa-tag" style={{ color: ORANGE }}></i><strong>{profile.primaryCategory || profile.category || 'Provider'}</strong></div>
                  <div className="meta-item" style={{ color: 'rgba(255,255,255,0.82)' }}><i className="fas fa-map-marker-alt" style={{ color: ORANGE }}></i><span>{profile.city ? `${profile.city}, ${profile.province}` : profile.location || 'South Africa'}</span></div>
                  <div className="meta-item" style={{ color: 'rgba(255,255,255,0.82)' }}><i className="fas fa-laptop-house" style={{ color: ORANGE }}></i><span>{profile.deliveryMode || profile.delivery || 'Online'}</span></div>
                </div>
                {(tier === 'pro' || tier === 'featured') && profile.reviews?.average > 0 && (
                  <div className="rating-bar">
                    <div className="rating-big" style={{ color: ORANGE }}>{profile.reviews.average}</div>
                    <div>
                      <div className="rating-stars" style={{ color: ORANGE }}>{ratingStars(profile.reviews.average)}</div>
                      <div className="rating-sub" style={{ color: 'rgba(255,255,255,0.68)' }}>Based on {profile.reviews.count} verified reviews</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* end .profile-hero-grid */}

          {/* ════════════════════════════════════
              CREDENTIALS + AVAILABILITY
          ════════════════════════════════════ */}
          <div className="profile-two-col profile-section-block">
            <div className="card" style={S.card}>
              <div className="card-pad">
                <Eyebrow>Credentials</Eyebrow>
                <Heading>Qualifications</Heading>
                <ul className="qual-list">
                  {profile.degrees && <li><i className="fas fa-graduation-cap" style={{ color: ORANGE }}></i> {profile.degrees}</li>}
                  {profile.certifications && <li><i className="fas fa-certificate" style={{ color: ORANGE }}></i> {profile.certifications}</li>}
                  {profile.memberships && <li><i className="fas fa-check-circle" style={{ color: ORANGE }}></i> {profile.memberships}</li>}
                  {profile.clearance && <li><i className="fas fa-shield-alt" style={{ color: ORANGE }}></i> {profile.clearance}</li>}
                  {!profile.degrees && !profile.certifications && !profile.memberships && !profile.clearance && (
                    <li style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No qualifications listed yet.</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="card" style={S.card}>
              <div className="card-pad">
                <Eyebrow>Schedule</Eyebrow>
                <Heading as="h3" style={{ fontSize: '1rem' }}>Availability</Heading>
                <div className="avail-grid" id="availGrid">
                  {DAYS_OF_WEEK.map(day => {
                    const active = (profile.availabilityDays || []).includes(day);
                    return (
                      <div key={day} className={`avail-pill ${active ? 'on' : ''}`} style={active
                        ? { background: ORANGE, color: '#fff', fontWeight: 700, border: 'none' }
                        : { background: '#d6d0c8', color: '#aaa', border: '1px solid #c0bab2' }
                      }>
                        {day}
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#777', margin: 0 }}>
                  {profile.availabilityNotes || 'Contact for availability'}
                </p>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════
              REVIEWS
          ════════════════════════════════════ */}
          {(tier === 'pro' || tier === 'featured') && profile.reviews?.items?.length > 0 && (
            <div className="card paid-only profile-section-block" style={S.card}>
              <div className="card-pad">
                <Eyebrow>Testimonials</Eyebrow>
                <Heading>Parent Reviews</Heading>
                {profile.reviews.items.map((review, idx) => (
                  <div key={idx} className="review-card" style={{ background: '#f5f1eb' }}>
                    <div className="review-header">
                      <span className="reviewer-name" style={{ color: '#1a1a1a' }}>{review.reviewer}</span>
                      <span className="review-stars" style={{ color: ORANGE }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <div className="review-text">"{review.text}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════
              CONTACT SECTION
          ════════════════════════════════════ */}
          <div id="contactSection">

            {/* Upgrade prompt — free tier */}
            {tier === 'free' && (
              <div className="card profile-section-block" id="upgradeCard" style={S.card}>
                <div className="card-pad" style={{ textAlign: 'center' }}>
                  <i className="fas fa-lock" style={{ fontSize: '1.4rem', color: ORANGE, marginBottom: '10px' }}></i>
                  <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '14px' }}>
                    Upgrade to <strong style={{ color: ORANGE }}>Trusted Provider</strong> to show your phone, WhatsApp and website to families.
                  </p>
                  <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                    <i className="fas fa-arrow-up"></i> Upgrade Plan
                  </Link>
                </div>
              </div>
            )}

            {(tier === 'pro' || tier === 'featured') ? (
              <div className="contact-two-col">

                {/* ── Left: Enquiry form ── */}
                <div className="card contact-form-card" style={S.card}>
                  <div className="card-pad">
                    <Eyebrow>Get in Touch</Eyebrow>
                    <Heading as="h3" style={{ fontSize: '1rem' }}>Send an Enquiry</Heading>
                    <div className="form-group">
                      <div className="form-row">
                        <div className="field">
                          <label>First name</label>
                          <input type="text" placeholder="Sarah" />
                        </div>
                        <div className="field">
                          <label>Last name</label>
                          <input type="text" placeholder="Smith" />
                        </div>
                      </div>
                      <div className="field">
                        <label>Email</label>
                        <input type="email" placeholder="sarah@email.com" />
                      </div>
                      <div className="field">
                        <label>Phone</label>
                        <input type="tel" placeholder="082 000 0000" />
                      </div>
                      <div className="field">
                        <label>Subject</label>
                        <select>
                          <option>General enquiry</option>
                          <option>Pricing &amp; availability</option>
                          <option>Trial lesson</option>
                          <option>Curriculum question</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Message</label>
                        <textarea placeholder="Hi, I'd like to know more about..."></textarea>
                      </div>
                      <button className="btn btn-primary btn-block" onClick={() => alert('Enquiry sent! (Demo)')}>
                        <i className="fas fa-paper-plane"></i> Send Enquiry
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Right: Contact details + Location ── */}
                <div className="contact-right-stack">

                  {/* Contact Details */}
                  <div className="card paid-only" style={S.card}>
                    <div className="card-pad">
                      <Eyebrow>Direct Contact</Eyebrow>
                      <Heading as="h3" style={{ fontSize: '1rem' }}>Contact Details</Heading>
                      <div className="dc-item">
                        <div className="dc-icon"><i className="fas fa-phone" style={{ color: ORANGE }}></i></div>
                        <div className="dc-meta">
                          <div className="dc-label">Phone</div>
                          <div className="dc-value">{profile.phone || '—'}</div>
                        </div>
                      </div>
                      <div className="dc-item dc-whatsapp">
                        <div className="dc-icon wa"><i className="fab fa-whatsapp"></i></div>
                        <div className="dc-meta">
                          <div className="dc-label">WhatsApp</div>
                          <div className="dc-value">{profile.whatsapp || profile.phone || '—'}</div>
                        </div>
                      </div>
                      <div className="dc-item">
                        <div className="dc-icon"><i className="fas fa-envelope" style={{ color: ORANGE }}></i></div>
                        <div className="dc-meta">
                          <div className="dc-label">Email</div>
                          <div className="dc-value">{profile.contactEmail || profile.email || 'Contact for details'}</div>
                        </div>
                      </div>
                      {(profile.website || profile.social) && (
                        <div className="dc-item">
                          <div className="dc-icon"><i className="fas fa-globe" style={{ color: ORANGE }}></i></div>
                          <div className="dc-meta">
                            <div className="dc-label">Website</div>
                            <div className="dc-value">
                              <a href={profile.website || profile.social} target="_blank" rel="noopener noreferrer" style={{ color: ORANGE }}>{profile.website || profile.social}</a>
                            </div>
                          </div>
                        </div>
                      )}
                      {profile.facebook && (
                        <div className="dc-item">
                          <div className="dc-icon"><i className="fab fa-facebook" style={{ color: '#1877f2' }}></i></div>
                          <div className="dc-meta">
                            <div className="dc-label">Facebook</div>
                            <div className="dc-value">
                              <a href={profile.facebook} target="_blank" rel="noopener noreferrer" style={{ color: ORANGE }}>{profile.facebook}</a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Location card ──
                      Same .card-pad as every other card (24px).
                      Content uses .location-body → .location-place
                      (icon + name + badge) separated from the
                      delivery line by a subtle border.             */}
                  <div className="card location-card" style={S.card}>
                    <div className="card-pad">
                      <Eyebrow>Location</Eyebrow>
                      <Heading as="h3" style={{ fontSize: '1rem' }}>Where We Operate</Heading>

                      <div className="location-body">

                        {/* Row 1: pin icon + place name + service-area badge */}
                        <div className="location-place">
                          <i className="fas fa-map-marker-alt" style={{ color: ORANGE, flexShrink: 0 }}></i>
                          <span className="location-place-name">
                            {profile.city
                              ? `${profile.city}, ${profile.province}`
                              : profile.location || 'South Africa'}
                          </span>
                          <span className="location-badge">
                            {profile.serviceAreaType === 'national'
                              ? 'National'
                              : profile.serviceAreaType === 'local'
                                ? `Local (${profile.radius} km radius)`
                                : 'Online only'}
                          </span>
                        </div>

                        {/* Row 2: delivery mode note */}
                        <p className="location-delivery">
                          <i className="fas fa-laptop" style={{ color: ORANGE, flexShrink: 0 }}></i>
                          {(profile.deliveryMode || profile.delivery || '').includes('Online')
                            ? 'Online sessions available nationwide'
                            : 'In-person sessions available'}
                        </p>

                      </div>
                    </div>
                  </div>

                </div>{/* end .contact-right-stack */}
              </div>
            ) : (
              /* Free tier — enquiry form only, full-width */
              <div className="card" style={S.card}>
                <div className="card-pad">
                  <Eyebrow>Get in Touch</Eyebrow>
                  <Heading as="h3" style={{ fontSize: '1rem' }}>Send an Enquiry</Heading>
                  <div className="form-group">
                    <div className="form-row">
                      <div className="field">
                        <label>First name</label>
                        <input type="text" placeholder="Sarah" />
                      </div>
                      <div className="field">
                        <label>Last name</label>
                        <input type="text" placeholder="Smith" />
                      </div>
                    </div>
                    <div className="field">
                      <label>Email</label>
                      <input type="email" placeholder="sarah@email.com" />
                    </div>
                    <div className="field">
                      <label>Phone</label>
                      <input type="tel" placeholder="082 000 0000" />
                    </div>
                    <div className="field">
                      <label>Subject</label>
                      <select>
                        <option>General enquiry</option>
                        <option>Pricing &amp; availability</option>
                        <option>Trial lesson</option>
                        <option>Curriculum question</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Message</label>
                      <textarea placeholder="Hi, I'd like to know more about..."></textarea>
                    </div>
                    <button className="btn btn-primary btn-block" onClick={() => alert('Enquiry sent! (Demo)')}>
                      <i className="fas fa-paper-plane"></i> Send Enquiry
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>{/* end #contactSection */}
        </div>{/* end .page-inner */}
      </main>
      <Footer />
    </>
  );
};

export default Profile;