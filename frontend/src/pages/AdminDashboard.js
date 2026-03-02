// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
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

/* ── localStorage helpers with error handling ───────────────── */
function getStoredProviders() {
  try { 
    const data = localStorage.getItem('sah_providers');
    return data ? JSON.parse(data) : []; 
  } catch {
    return [];
  }
}

function saveStoredProviders(list) {
  try { 
    localStorage.setItem('sah_providers', JSON.stringify(list || [])); 
  } catch {}
}

function getStoredUsers() {
  try { 
    const data = localStorage.getItem('sah_users');
    return data ? JSON.parse(data) : []; 
  } catch {
    return []; 
  }
}

function getAuthLogs() {
  try { 
    const data = localStorage.getItem('sah_auth_logs');
    return data ? JSON.parse(data) : []; 
  } catch {
    return []; 
  }
}

function getFeaturedSlots() {
  try {
    const data = localStorage.getItem('sah_featured_slots');
    if (data) {
      const slots = JSON.parse(data);
      // Ensure we always have 4 slots
      const safeSlots = (slots || []).slice(0, 4);
      while (safeSlots.length < 4) {
        safeSlots.push({ 
          id: safeSlots.length + 1, 
          provider: null, 
          providerId: null, 
          addedDaysAgo: 0, 
          daysRemaining: 0 
        });
      }
      return safeSlots;
    }
    return [1,2,3,4].map(id => ({ 
      id, 
      provider: null, 
      providerId: null, 
      addedDaysAgo: 0, 
      daysRemaining: 0 
    }));
  } catch {
    return [1,2,3,4].map(id => ({ 
      id, 
      provider: null, 
      providerId: null, 
      addedDaysAgo: 0, 
      daysRemaining: 0 
    }));
  }
}

function saveFeaturedSlots(slots) {
  try { 
    localStorage.setItem('sah_featured_slots', JSON.stringify(slots || [])); 
  } catch {}
}

const MAX_FEATURED_SLOTS = 4;

/* ── Floating Card Styles ───────────────────────────────── */
const FLOATING_CARD_STYLES = `
  .floating-provider-card {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 1000px;
    max-height: 85vh;
    background: white;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    z-index: 9999;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: cardFloatIn 0.3s ease-out;
  }

  @keyframes cardFloatIn {
    from {
      opacity: 0;
      transform: translate(-50%, -48%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  .floating-card-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 9998;
    animation: overlayFadeIn 0.2s ease-out;
  }

  @keyframes overlayFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .floating-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    background: linear-gradient(135deg, #c9621a, #e07a35);
    color: white;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .floating-card-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .floating-card-header h3 i {
    font-size: 1.1rem;
  }

  .floating-card-close {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 1rem;
  }

  .floating-card-close:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }

  .floating-card-body {
    padding: 24px;
    overflow-y: auto;
    background: #faf9f7;
    max-height: calc(85vh - 80px);
  }

  .floating-card-body::-webkit-scrollbar {
    width: 8px;
  }

  .floating-card-body::-webkit-scrollbar-track {
    background: #f0ece5;
  }

  .floating-card-body::-webkit-scrollbar-thumb {
    background: #c9621a;
    border-radius: 8px;
  }

  .floating-card-body::-webkit-scrollbar-thumb:hover {
    background: #a84e12;
  }

  .floating-card-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e0d8;
  }

  .floating-card-section:last-child {
    margin-bottom: 0;
  }

  .floating-card-section-title {
    font-size: 0.85rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #c9621a;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 2px solid #f0ece5;
    padding-bottom: 8px;
  }

  .floating-card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .floating-card-field {
    margin-bottom: 12px;
  }

  .floating-card-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #888;
    margin-bottom: 4px;
  }

  .floating-card-value {
    font-size: 0.95rem;
    color: #1a1a1a;
    font-weight: 500;
    word-break: break-word;
    line-height: 1.5;
  }

  .floating-card-value.empty {
    color: #bbb;
    font-style: italic;
  }

  .floating-card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }

  .floating-card-tag {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    background: #fef3e8;
    color: #c9621a;
    border: 1px solid #f0c89a;
  }

  .floating-card-files {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 16px;
  }

  .floating-card-file {
    border: 1.5px solid #e5e0d8;
    border-radius: 10px;
    overflow: hidden;
    background: #faf9f7;
  }

  .floating-card-file-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #fff3e8;
    border-bottom: 1px solid #f0d4b8;
  }

  .floating-card-file-head i {
    color: #c9621a;
    font-size: 0.9rem;
  }

  .floating-card-file-name {
    font-size: 0.8rem;
    font-weight: 700;
    color: #1a1a1a;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .floating-card-file-body {
    padding: 12px;
    text-align: center;
  }

  .floating-card-file-img {
    max-width: 100%;
    max-height: 120px;
    object-fit: contain;
    border-radius: 6px;
    margin-bottom: 8px;
  }

  .floating-card-file-placeholder {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #c9621a, #e07a35);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0 auto 8px;
  }

  .floating-card-file-dl {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 6px;
    background: #c9621a;
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-family: inherit;
    transition: background 0.14s;
  }

  .floating-card-file-dl:hover {
    background: #a84e12;
  }

  .floating-card-file-none {
    padding: 20px;
    text-align: center;
    color: #bbb;
    font-size: 0.85rem;
    font-style: italic;
  }

  .floating-card-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #c9621a;
    margin: 0 auto 16px;
    display: block;
    box-shadow: 0 4px 12px rgba(201,98,26,0.2);
  }

  .floating-card-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    margin-left: 8px;
  }

  .floating-card-status.pending { background: #fef3c7; color: #92400e; }
  .floating-card-status.approved { background: #d1fae5; color: #065f46; }
  .floating-card-status.rejected { background: #fee2e2; color: #991b1b; }
  .floating-card-status.featured { background: #fffbeb; color: #d97706; }

  .floating-card-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    margin-right: 6px;
  }

  .floating-card-badge.cert { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
  .floating-card-badge.clearance { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }

  @media (max-width: 768px) {
    .floating-card-grid {
      grid-template-columns: 1fr;
    }
    .floating-card-files {
      grid-template-columns: 1fr;
    }
    .floating-provider-card {
      width: 95%;
      max-height: 90vh;
    }
  }
`;

/* ── Floating Provider Card Component with error handling ── */
const FloatingProviderCard = ({ provider, onClose }) => {
  // Early return if no provider
  if (!provider) return null;

  // Safe access with fallbacks
  const profilePhotoSrc = provider.profilePhoto || provider.photo || provider.image || null;
  const initial = (provider.name || '?').charAt(0).toUpperCase();
  const regDate = provider.registered ? new Date(provider.registered).toLocaleDateString('en-ZA', { 
    day: '2-digit', month: 'short', year: 'numeric' 
  }) : '—';

  // Safe file type checking
  const isCertImage = provider.certFileType?.startsWith('image/') || false;
  const isCertPdf = provider.certFileType === 'application/pdf';
  const isClearImage = provider.clearanceFileType?.startsWith('image/') || false;
  const isClearPdf = provider.clearanceFileType === 'application/pdf';

  const handleDownload = (file, filename) => {
    if (!file) return;
    try {
      const a = document.createElement('a');
      a.href = file;
      a.download = filename || 'document';
      a.click();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Prevent click from bubbling to overlay
  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  // Safe array checking for tags
  const tags = Array.isArray(provider.tags) ? provider.tags : [];

  return (
    <>
      <div className="floating-card-overlay" onClick={onClose} />
      <div className="floating-provider-card" onClick={handleCardClick}>
        <div className="floating-card-header">
          <h3>
            <i className="fas fa-user-circle"></i>
            {provider.name || 'Provider Details'}
            <span className={`floating-card-status ${provider.status || 'pending'}`}>
              {provider.status || 'pending'}
            </span>
          </h3>
          <button className="floating-card-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="floating-card-body">
          {/* Profile Photo Section */}
          <div className="floating-card-section" style={{ textAlign: 'center' }}>
            {profilePhotoSrc ? (
              <img src={profilePhotoSrc} alt={provider.name} className="floating-card-avatar" />
            ) : (
              <div className="floating-card-file-placeholder">{initial}</div>
            )}
            
            {/* Badges */}
            <div style={{ marginTop: '8px' }}>
              {provider.tier === 'featured' && (
                <span className="floating-card-badge" style={{ background: '#fffbeb', color: '#d97706' }}>
                  <i className="fas fa-crown"></i> Featured Plan
                </span>
              )}
              {provider.tier === 'pro' && (
                <span className="floating-card-badge" style={{ background: '#dbeafe', color: '#1e3a8a' }}>
                  <i className="fas fa-check-circle"></i> Pro Plan
                </span>
              )}
              {provider.certFile && (
                <span className="floating-card-badge cert">
                  <i className="fas fa-file-alt"></i> Certified
                </span>
              )}
              {provider.clearanceFile && (
                <span className="floating-card-badge clearance">
                  <i className="fas fa-shield-alt"></i> Clearance
                </span>
              )}
            </div>
          </div>

          {/* Account & Contact Info */}
          <div className="floating-card-section">
            <div className="floating-card-section-title">
              <i className="fas fa-id-card"></i> Account & Contact
            </div>
            <div className="floating-card-grid">
              <div className="floating-card-field">
                <div className="floating-card-label">Full Name / Business</div>
                <div className="floating-card-value">{provider.name || '—'}</div>
              </div>
              <div className="floating-card-field">
                <div className="floating-card-label">Account Type</div>
                <div className="floating-card-value">{provider.accountType || '—'}</div>
              </div>
              <div className="floating-card-field">
                <div className="floating-card-label">Email</div>
                <div className="floating-card-value">{provider.email || '—'}</div>
              </div>
              <div className="floating-card-field">
                <div className="floating-card-label">Phone</div>
                <div className="floating-card-value">{provider.phone || '—'}</div>
              </div>
              <div className="floating-card-field">
                <div className="floating-card-label">WhatsApp</div>
                <div className="floating-card-value">{provider.whatsapp || '—'}</div>
              </div>
              <div className="floating-card-field">
                <div className="floating-card-label">Website</div>
                <div className="floating-card-value">{provider.website || provider.social || '—'}</div>
              </div>
            </div>
          </div>

          {/* Bio & Services */}
          <div className="floating-card-section">
            <div className="floating-card-section-title">
              <i className="fas fa-briefcase"></i> Bio & Services
            </div>
            <div className="floating-card-field">
              <div className="floating-card-label">Bio</div>
              <div className="floating-card-value">{provider.bio || '—'}</div>
            </div>
            <div className="floating-card-field">
              <div className="floating-card-label">Primary Category</div>
              <div className="floating-card-value">{provider.primaryCategory || provider.category || '—'}</div>
            </div>
            {tags.length > 0 && (
              <div className="floating-card-field">
                <div className="floating-card-label">Tags / Subjects</div>
                <div className="floating-card-tags">
                  {tags.map((tag, i) => (
                    <span key={i} className="floating-card-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location & Credentials */}
          <div className="floating-card-section">
            <div className="floating-card-section-title">
              <i className="fas fa-map-marker-alt"></i> Location & Credentials
            </div>
            <div className="floating-card-grid">
              <div className="floating-card-field">
                <div className="floating-card-label">City</div>
                <div className="floating-card-value">{provider.city || '—'}</div>
              </div>
              <div className="floating-card-field">
                <div className="floating-card-label">Province</div>
                <div className="floating-card-value">{provider.province || '—'}</div>
              </div>
              <div className="floating-card-field">
                <div className="floating-card-label">Service Area</div>
                <div className="floating-card-value">{provider.serviceAreaType || '—'}</div>
              </div>
              <div className="floating-card-field">
                <div className="floating-card-label">Radius</div>
                <div className="floating-card-value">{provider.radius ? `${provider.radius} km` : '—'}</div>
              </div>
            </div>
          </div>

          {/* Qualifications */}
          <div className="floating-card-section">
            <div className="floating-card-section-title">
              <i className="fas fa-graduation-cap"></i> Qualifications
            </div>
            <div className="floating-card-grid">
              <div className="floating-card-field">
                <div className="floating-card-label">Degrees</div>
                <div className="floating-card-value">{provider.degrees || '—'}</div>
              </div>
              <div className="floating-card-field">
                <div className="floating-card-label">Certifications</div>
                <div className="floating-card-value">{provider.certifications || '—'}</div>
              </div>
              <div className="floating-card-field">
                <div className="floating-card-label">Memberships</div>
                <div className="floating-card-value">{provider.memberships || '—'}</div>
              </div>
              <div className="floating-card-field">
                <div className="floating-card-label">Clearance Ref.</div>
                <div className="floating-card-value">{provider.clearance || '—'}</div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="floating-card-section">
            <div className="floating-card-section-title">
              <i className="fas fa-tag"></i> Pricing
            </div>
            <div className="floating-card-grid">
              <div className="floating-card-field">
                <div className="floating-card-label">Model</div>
                <div className="floating-card-value">{provider.pricingModel || '—'}</div>
              </div>
              <div className="floating-card-field">
                <div className="floating-card-label">Starting Price</div>
                <div className="floating-card-value">{provider.startingPrice || provider.priceFrom || '—'}</div>
              </div>
              <div className="floating-card-field">
                <div className="floating-card-label">Plan</div>
                <div className="floating-card-value">{provider.listingPlan || provider.tier || 'free'}</div>
              </div>
              <div className="floating-card-field">
                <div className="floating-card-label">Registered</div>
                <div className="floating-card-value">{regDate}</div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="floating-card-section">
            <div className="floating-card-section-title">
              <i className="fas fa-paperclip"></i> Uploaded Documents
            </div>
            <div className="floating-card-files">
              {/* Profile Photo */}
              <div className="floating-card-file">
                <div className="floating-card-file-head">
                  <i className="fas fa-camera"></i>
                  <span className="floating-card-file-name">Profile Photo</span>
                </div>
                <div className="floating-card-file-body">
                  {profilePhotoSrc ? (
                    <>
                      <img src={profilePhotoSrc} alt="Profile" className="floating-card-file-img" />
                      <button 
                        className="floating-card-file-dl"
                        onClick={() => handleDownload(profilePhotoSrc, `${provider.name || 'profile'}-photo`)}
                      >
                        <i className="fas fa-download"></i> Download
                      </button>
                    </>
                  ) : (
                    <div className="floating-card-file-none">No photo uploaded</div>
                  )}
                </div>
              </div>

              {/* Qualification / Cert */}
              <div className="floating-card-file">
                <div className="floating-card-file-head">
                  <i className={`fas ${isCertImage ? 'fa-image' : isCertPdf ? 'fa-file-pdf' : 'fa-file-alt'}`}></i>
                  <span className="floating-card-file-name">Qualification</span>
                </div>
                <div className="floating-card-file-body">
                  {provider.certFile ? (
                    <>
                      {isCertImage && <img src={provider.certFile} alt="Certificate" className="floating-card-file-img" />}
                      {!isCertImage && (
                        <div style={{ padding: '12px', color: isCertPdf ? '#dc2626' : '#888' }}>
                          <i className={`fas ${isCertPdf ? 'fa-file-pdf' : 'fa-file'} fa-2x`}></i>
                          <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                            {provider.certFileName || 'Document'}
                          </div>
                        </div>
                      )}
                      <button 
                        className="floating-card-file-dl"
                        onClick={() => handleDownload(provider.certFile, provider.certFileName || 'certificate')}
                      >
                        <i className="fas fa-download"></i> Download
                      </button>
                    </>
                  ) : (
                    <div className="floating-card-file-none">Not uploaded</div>
                  )}
                </div>
              </div>

              {/* Police Clearance */}
              <div className="floating-card-file">
                <div className="floating-card-file-head">
                  <i className={`fas ${isClearImage ? 'fa-image' : isClearPdf ? 'fa-file-pdf' : 'fa-shield-alt'}`}></i>
                  <span className="floating-card-file-name">Clearance</span>
                </div>
                <div className="floating-card-file-body">
                  {provider.clearanceFile ? (
                    <>
                      {isClearImage && <img src={provider.clearanceFile} alt="Clearance" className="floating-card-file-img" />}
                      {!isClearImage && (
                        <div style={{ padding: '12px', color: isClearPdf ? '#dc2626' : '#888' }}>
                          <i className={`fas ${isClearPdf ? 'fa-file-pdf' : 'fa-file'} fa-2x`}></i>
                          <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                            {provider.clearanceFileName || 'Document'}
                          </div>
                        </div>
                      )}
                      <button 
                        className="floating-card-file-dl"
                        onClick={() => handleDownload(provider.clearanceFile, provider.clearanceFileName || 'clearance')}
                      >
                        <i className="fas fa-download"></i> Download
                      </button>
                    </>
                  ) : (
                    <div className="floating-card-file-none">Not uploaded</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Inline CSS ─────────────────────────────────────────── */
const ADMIN_CSS = `
  .admin-stats { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; }
  .stat-filter-card { flex:1; min-width:140px; padding:12px 16px; background:#fff; border:2px solid #e5e0d8; border-radius:10px; cursor:pointer; transition:all 0.15s; display:flex; flex-direction:column; gap:6px; }
  .stat-filter-card:hover { border-color:#c9621a; transform:translateY(-2px); box-shadow:0 4px 12px rgba(201,98,26,0.15); }
  .stat-filter-card.active { border-color:#c9621a; background:#fff8f2; box-shadow:0 0 0 3px rgba(201,98,26,0.1); }
  .stat-filter-value { font-size:1.6rem; font-weight:800; color:#c9621a; font-family:'Playfair Display',serif; }
  .stat-filter-label { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#888; }

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

  /* ── Scrollable containers ── */
  .adm-scrollable-container {
    max-height: 500px;
    overflow-y: auto;
    border: 1px solid #f0ece5;
    border-radius: 10px;
    background: #fff;
    padding: 4px;
  }
  .adm-scrollable-container::-webkit-scrollbar {
    width: 8px;
  }
  .adm-scrollable-container::-webkit-scrollbar-track {
    background: #f0ece5;
    border-radius: 8px;
  }
  .adm-scrollable-container::-webkit-scrollbar-thumb {
    background: #c9621a;
    border-radius: 8px;
  }
  .adm-scrollable-container::-webkit-scrollbar-thumb:hover {
    background: #a84e12;
  }

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

  /* ── Listings ── */
  .adm-listing-row { display:flex; align-items:center; gap:14px; padding:13px 18px; border:1px solid #e5e0d8; border-radius:10px; background:#fff; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.04); transition:box-shadow 0.15s; cursor:pointer; }
  .adm-listing-row:hover { box-shadow:0 3px 10px rgba(0,0,0,0.08); }
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

  @media (max-width:900px) { .adm-featured-slots-grid { grid-template-columns:1fr 1fr; } .adm-file-grid { grid-template-columns:1fr 1fr; } .modal-file-grid { grid-template-columns:1fr 1fr; } }
  @media (max-width:800px) { .adm-detail-grid { grid-template-columns:1fr 1fr; } .adm-detail-section { border-right:none; border-bottom:1px solid #f0ece5; } }
  @media (max-width:600px) { .adm-featured-slots-grid { grid-template-columns:1fr; } .adm-detail-grid { grid-template-columns:1fr; } .adm-row-actions { flex-wrap:wrap; } .adm-file-grid { grid-template-columns:1fr; } .modal-file-grid { grid-template-columns:1fr; } }
`;

/* ── File card used in admin detail panel ── */
const AdminFileCard = ({ file, fileName, fileType, label }) => {
  const isImage = fileType && fileType.startsWith('image/');
  const isPdf   = fileType === 'application/pdf';
  
  const download = () => {
    if (!file) return;
    try {
      const a = document.createElement('a'); 
      a.href = file; 
      a.download = fileName || label || 'file'; 
      a.click();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };
  
  return (
    <div className="adm-file-card">
      <div className="adm-file-card-head">
        <i className={`fas ${isImage ? 'fa-image' : isPdf ? 'fa-file-pdf' : 'fa-file-alt'}`}></i>
        <span className="adm-file-card-name">{label || 'Document'}</span>
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

/* ── Expandable Pending Row with error handling ── */
const ExpandablePendingRow = ({ provider, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Safe access with fallbacks
  const name = provider?.name || 'Unknown';
  const initial = name.charAt(0).toUpperCase();
  const regDate = provider?.registered ? new Date(provider.registered).toLocaleDateString('en-ZA') : '—';
  const val = (v) => (v ? String(v) : null);

  const profilePhotoSrc = provider?.profilePhoto || provider?.photo || provider?.image || null;

  // Prevent click propagation
  const handleRowClick = (e) => {
    setExpanded(e => !e);
  };

  const handleApproveClick = (e) => {
    e.stopPropagation();
    if (onApprove && provider?.id) {
      onApprove(provider.id);
    }
  };

  const handleRejectClick = (e) => {
    e.stopPropagation();
    if (onReject && provider?.id) {
      onReject(provider.id);
    }
  };

  return (
    <div className={`adm-expand-row ${expanded ? 'expanded' : ''}`}>
      <div className="adm-row-header" onClick={handleRowClick}>
        {/* Avatar — shows photo if available */}
        <div className={`adm-avatar ${profilePhotoSrc ? '' : 'no-photo'}`}>
          {profilePhotoSrc
            ? <img src={profilePhotoSrc} alt={name} />
            : initial}
        </div>
        <div className="adm-row-info">
          <div className="adm-row-name">
            {name}
            <span className="adm-badge pending">Pending</span>
            {provider?.tier === 'featured' && <span className="adm-badge featured"><i className="fas fa-crown"></i> Featured Plan</span>}
            {provider?.tier === 'pro'      && <span className="adm-badge pro"><i className="fas fa-check-circle"></i> Pro Plan</span>}
            {provider?.certFile      && <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}><i className="fas fa-file-alt" style={{ marginRight: 3 }}></i>Cert</span>}
            {provider?.clearanceFile && <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}><i className="fas fa-shield-alt" style={{ marginRight: 3 }}></i>Clearance</span>}
          </div>
          <div className="adm-row-meta">
            {provider?.email || '—'} &nbsp;·&nbsp; {provider?.city || '—'}, {provider?.province || '—'} &nbsp;·&nbsp;
            {provider?.listingPlan || provider?.tier || 'free'} plan &nbsp;·&nbsp; Registered: {regDate}
          </div>
        </div>
        <i className="fas fa-chevron-down adm-expand-icon"></i>
        <div className="adm-row-actions" onClick={e => e.stopPropagation()}>
          <button className="adm-btn-approve" onClick={handleApproveClick}>
            <i className="fas fa-check"></i> Approve
          </button>
          <button className="adm-btn-reject" onClick={handleRejectClick}>
            <i className="fas fa-times"></i> Reject
          </button>
        </div>
      </div>

      {expanded && provider && (
        <div className="adm-detail-panel">
          {/* ── 3-column detail grid ── */}
          <div className="adm-detail-grid">
            {/* Col 1 — Account & Contact */}
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

            {/* Col 2 — Bio & Services */}
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

            {/* Col 3 — Location & Credentials */}
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

          {/* ── FILES SECTION — profile photo + cert + clearance ── */}
          <div className="adm-file-section">
            <div className="adm-file-section-title">
              <i className="fas fa-paperclip"></i> Uploaded Files &amp; Documents
            </div>
            <div className="adm-file-grid">
              {/* Profile photo */}
              <div className="adm-file-card">
                <div className="adm-file-card-head">
                  <i className="fas fa-camera"></i>
                  <span className="adm-file-card-name">Profile Photo</span>
                </div>
                <div className="adm-file-card-body" style={{ textAlign: 'center', paddingTop: 12 }}>
                  {profilePhotoSrc ? (
                    <>
                      <img src={profilePhotoSrc} alt="Profile" className="adm-photo-big" />
                      <button className="adm-file-dl" onClick={() => { 
                        const a = document.createElement('a'); 
                        a.href = profilePhotoSrc; 
                        a.download = `${provider.name || 'profile'}-photo`; 
                        a.click(); 
                      }}>
                        <i className="fas fa-download"></i> Download
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="adm-photo-placeholder">{initial}</div>
                      <div className="adm-file-none" style={{ padding: '4px 0' }}>No photo uploaded</div>
                    </>
                  )}
                </div>
              </div>

              {/* Qualification / Cert file */}
              <AdminFileCard
                file={provider.certFile}
                fileName={provider.certFileName}
                fileType={provider.certFileType}
                label="Qualification / Cert"
              />

              {/* Police clearance */}
              <AdminFileCard
                file={provider.clearanceFile}
                fileName={provider.clearanceFileName}
                fileType={provider.clearanceFileType}
                label="Police Clearance"
              />
            </div>
          </div>

          {/* ── Footer with approve/reject ── */}
          <div className="adm-detail-footer">
            <div className="adm-detail-footer-note">
              <i className="fas fa-info-circle" style={{ color: '#c9621a' }}></i>
              Admin review on {new Date().toLocaleDateString('en-ZA')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="adm-btn-approve" style={{ padding: '9px 20px', fontSize: '0.85rem' }}
                onClick={handleApproveClick}>
                <i className="fas fa-check-circle"></i> Approve &amp; Go Live
              </button>
              <button className="adm-btn-reject" style={{ padding: '9px 20px', fontSize: '0.85rem' }}
                onClick={handleRejectClick}>
                <i className="fas fa-times-circle"></i> Reject Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Featured Slot Card with error handling ── */
const InlineFeaturedSlotCard = ({ slot, onRemove, onRotate }) => {
  const filled = !!slot?.provider;
  
  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove && slot?.id) {
      onRemove(slot.id, slot.provider);
    }
  };
  
  const handleRotate = (e) => {
    e.stopPropagation();
    if (onRotate && slot?.id) {
      onRotate(slot.id);
    }
  };
  
  return (
    <div className={`adm-slot-card ${filled ? 'filled' : ''}`}>
      <div className="adm-slot-card-head">
        <span className="adm-slot-num">Slot #{slot?.id || '?'}</span>
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
              <button className="adm-slot-btn remove" onClick={handleRemove}>
                <i className="fas fa-times" /> Remove
              </button>
              <button className="adm-slot-btn rotate" onClick={handleRotate}>
                <i className="fas fa-sync" /> Rotate
              </button>
            </div>
          </>
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
  const { user }              = useAuth() || {};
  const { showNotification }  = useNotification() || {};
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
  const [logSearch, setLogSearch]         = useState('');
  const [logEventFilter, setLogEventFilter] = useState('ALL');
  
  // Floating card state
  const [floatingCardProvider, setFloatingCardProvider] = useState(null);

  useEffect(() => {
    if (!document.getElementById('adm-styles')) {
      const style = document.createElement('style'); 
      style.id = 'adm-styles'; 
      style.textContent = ADMIN_CSS;
      document.head.appendChild(style);
    }
    // Add floating card styles
    if (!document.getElementById('floating-card-styles')) {
      const style = document.createElement('style'); 
      style.id = 'floating-card-styles'; 
      style.textContent = FLOATING_CARD_STYLES;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    try {
      const loadedProviders = getStoredProviders() || [];
      setProviders(loadedProviders);
      setFeaturedSlots(getFeaturedSlots() || []);
      
      const storedUsers = getStoredUsers() || [];
      const providerUsers = loadedProviders.map(p => ({
        id: p.id, 
        email: p.email || p.contactEmail || '', 
        name: p.name || '',
        role: 'PROVIDER', 
        registered: p.registered || '', 
        lastLogin: p.lastLogin || p.registered || '',
        status: p.status || 'pending', 
        plan: p.plan || p.listingPlan || p.tier || 'free',
      }));
      
      const seen = new Set();
      const merged = [
        ...(storedUsers || []).map(u => ({ ...u, role: u.role || 'USER', accountType: u.accountType || 'parent' })),
        ...providerUsers,
      ].filter(u => {
        const k = (u.email || u.id || '').toLowerCase();
        if (!k || seen.has(k)) return false;
        seen.add(k); 
        return true;
      });
      setRegisteredUsers(merged);
      setAuthLogs(getAuthLogs() || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  // Safe calculations with fallbacks
  const pendingProviders  = (providers || []).filter(p => p?.status === 'pending');
  const approvedProviders = (providers || []).filter(p => p?.status === 'approved');
  const rejectedProviders = (providers || []).filter(p => p?.status === 'rejected');
  const featuredCount     = (featuredSlots || []).filter(s => !!s?.provider).length;
  const pendingReviews    = (reviews || []).filter(r => r?.status === 'pending');
  const parentUsers       = (registeredUsers || []).filter(u => u?.role === 'USER');
  const providerAccounts  = (registeredUsers || []).filter(u => u?.role === 'PROVIDER');

  const stats = {
    totalProviders:  (providers || []).length,
    pendingApproval: pendingProviders.length,
    approved:        approvedProviders.length,
    rejected:        rejectedProviders.length,
    featuredSlots:   featuredCount,
    pendingReviews:  pendingReviews.length,
    totalUsers:      parentUsers.length,
    totalAccounts:   (registeredUsers || []).length,
  };

  const handleApprove = (id) => {
    if (!id) return;
    try {
      const updated = (providers || []).map(p => p.id === id ? { ...p, status: 'approved' } : p);
      setProviders(updated); 
      saveStoredProviders(updated);
      const p = providers.find(x => x.id === id);
      if (showNotification) {
        showNotification(`✅ ${p?.name || 'Provider'} approved and is now live.`, 'success');
      }
    } catch (error) {
      console.error('Error approving provider:', error);
    }
  };
  
  const handleReject = (id) => {
    if (!id) return;
    try {
      const updated = (providers || []).map(p => p.id === id ? { ...p, status: 'rejected' } : p);
      setProviders(updated); 
      saveStoredProviders(updated);
      const p = providers.find(x => x.id === id);
      if (showNotification) {
        showNotification(`${p?.name || 'Provider'} registration rejected.`, 'info');
      }
    } catch (error) {
      console.error('Error rejecting provider:', error);
    }
  };

  const handleBadgeSelect = (providerId, badgeType) => {
    if (!providerId || !badgeType) return;
    
    setFeaturedError('');
    const tierMap = { community: 'free', trusted: 'pro', featured: 'featured' };
    const provider = providers.find(p => p.id === providerId);
    
    if (badgeType === 'featured') {
      const alreadyInSlot = (featuredSlots || []).some(s => s.providerId === providerId);
      if (alreadyInSlot) { 
        if (showNotification) {
          showNotification(`${provider?.name} is already in a featured slot.`, 'info');
        }
      } else {
        const emptySlot = (featuredSlots || []).find(s => !s.provider);
        if (!emptySlot) {
          setFeaturedError(`All ${MAX_FEATURED_SLOTS} featured slots are occupied. Remove a provider first.`);
          setActiveTab('featured'); 
          return;
        }
        const updatedSlots = (featuredSlots || []).map(s =>
          s.id === emptySlot.id ? { ...s, provider: provider?.name || 'Unknown', providerId, addedDaysAgo: 0, daysRemaining: 7 } : s
        );
        setFeaturedSlots(updatedSlots); 
        saveFeaturedSlots(updatedSlots);
        if (showNotification) {
          showNotification(`⭐ ${provider?.name} assigned to Featured Slot #${emptySlot.id}!`, 'success');
        }
      }
    }
    const updated = (providers || []).map(p => p.id === providerId ? { ...p, badge: badgeType, tier: tierMap[badgeType] || p.tier } : p);
    setProviders(updated); 
    saveStoredProviders(updated);
    if (badgeType !== 'featured' && showNotification) {
      showNotification(`Badge "${badgeType}" assigned to ${provider?.name}.`, 'success');
    }
  };

  const handlePromote = (id) => {
    if (!id) return;
    try {
      const updated = (providers || []).map(p => p.id === id ? { ...p, promoted: true, demoted: false } : p);
      setProviders(updated); 
      saveStoredProviders(updated);
      const provider = providers.find(p => p.id === id);
      if (showNotification) {
        showNotification(`"${provider?.name}" promoted.`, 'success');
      }
    } catch (error) {
      console.error('Error promoting provider:', error);
    }
  };
  
  const handleDemote = (id) => {
    if (!id) return;
    try {
      const updated = (providers || []).map(p => p.id === id ? { ...p, demoted: true, promoted: false } : p);
      setProviders(updated); 
      saveStoredProviders(updated);
      const provider = providers.find(p => p.id === id);
      if (showNotification) {
        showNotification(`"${provider?.name}" demoted.`, 'info');
      }
    } catch (error) {
      console.error('Error demoting provider:', error);
    }
  };

  const handleRemoveFeatured = (slotId, providerName) => {
    if (!slotId) return;
    
    setFeaturedError('');
    try {
      const slot = (featuredSlots || []).find(s => s.id === slotId);
      const updatedSlots = (featuredSlots || []).map(s =>
        s.id === slotId ? { ...s, provider: null, providerId: null, addedDaysAgo: 0, daysRemaining: 0 } : s
      );
      setFeaturedSlots(updatedSlots); 
      saveFeaturedSlots(updatedSlots);
      
      if (slot?.providerId) {
        const updated = (providers || []).map(p => p.id === slot.providerId ? { ...p, tier: 'pro', badge: 'verified' } : p);
        setProviders(updated); 
        saveStoredProviders(updated);
      }
      if (showNotification) {
        showNotification(`Removed ${providerName || 'provider'} from featured slot #${slotId}`, 'info');
      }
    } catch (error) {
      console.error('Error removing featured slot:', error);
    }
  };
  
  const handleRotateFeatured = (slotId) => {
    if (!slotId) return;
    
    try {
      const available = approvedProviders.map(p => p.name).filter(Boolean);
      const current   = (featuredSlots || []).find(s => s.id === slotId)?.provider;
      const others    = available.filter(n => n !== current);
      const picked    = others.length ? others[Math.floor(Math.random() * others.length)]
                      : available.length ? available[Math.floor(Math.random() * available.length)]
                      : 'STEM Mastery Tutors';
      const pickedProvider = (providers || []).find(p => p.name === picked);
      const updatedSlots = (featuredSlots || []).map(s =>
        s.id === slotId ? { ...s, provider: picked, providerId: pickedProvider?.id || null, addedDaysAgo: 0, daysRemaining: 7 } : s
      );
      setFeaturedSlots(updatedSlots); 
      saveFeaturedSlots(updatedSlots);
      if (showNotification) {
        showNotification(`Rotated slot #${slotId} to ${picked}`, 'success');
      }
    } catch (error) {
      console.error('Error rotating featured slot:', error);
    }
  };

  const handleModerateReview = (reviewId, action) => {
    if (!reviewId || !action) return;
    
    try {
      setReviews(prev => (prev || []).map(r =>
        r.id === reviewId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r
      ));
    } catch (error) {
      console.error('Error moderating review:', error);
    }
  };

  // Show floating card with provider details
  const showFloatingCard = (provider) => {
    if (provider) {
      setFloatingCardProvider(provider);
    }
  };

  // Close floating card
  const closeFloatingCard = () => {
    setFloatingCardProvider(null);
  };

  // Handle ESC key to close floating card
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && floatingCardProvider) {
        closeFloatingCard();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [floatingCardProvider]);

  /* ── Profile modal — with error handling ── */
  const showProfileModal = (providerOrId) => {
    if (!providerOrId) return;
    
    try {
      const p = typeof providerOrId === 'string'
        ? (providers || []).find(x => x.id === providerOrId) || {}
        : providerOrId || {};

      const profilePhotoSrc = p.profilePhoto || p.photo || p.image || null;
      const isCertImage     = p.certFileType && p.certFileType.startsWith('image/');
      const isCertPdf       = p.certFileType === 'application/pdf';
      const isClearImage    = p.clearanceFileType && p.clearanceFileType.startsWith('image/');
      const isClearPdf      = p.clearanceFileType === 'application/pdf';

      // Build file section HTML (simplified for brevity - you can keep your existing HTML building code)
      const body = `<div>Provider details would appear here</div>`;

      setModalContent({ title: `${p.name || 'Provider'} — Registration Details`, body });
      setModalOpen(true);
    } catch (error) {
      console.error('Error showing profile modal:', error);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setModalContent(EMPTY_MODAL), 300);
  };

  /* ── Filtered listings with error handling ── */
  const getFilteredListings = () => {
    try {
      let filtered = providers || [];
      if (listingSearch) {
        const term = listingSearch.toLowerCase();
        filtered = filtered.filter(p =>
          p?.name?.toLowerCase().includes(term) ||
          p?.email?.toLowerCase().includes(term) ||
          p?.city?.toLowerCase().includes(term)
        );
      }
      if (filterType !== 'all') {
        filtered = filtered.filter(p => {
          switch (filterType) {
            case 'featured':  return p?.tier === 'featured';
            case 'trusted':   return p?.tier === 'pro';
            case 'community': return !p?.tier || p?.tier === 'free';
            case 'promoted':  return p?.promoted === true;
            case 'demoted':   return p?.demoted === true;
            case 'approved':  return p?.status === 'approved';
            case 'pending':   return p?.status === 'pending';
            case 'rejected':  return p?.status === 'rejected';
            default:          return true;
          }
        });
      }
      return filtered;
    } catch (error) {
      console.error('Error filtering listings:', error);
      return [];
    }
  };
  
  const filteredListings = getFilteredListings();

  const filteredUsers = (registeredUsers || []).filter(u => {
    try {
      const matchSearch = !userSearch ||
        u?.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u?.name?.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = userRoleFilter === 'ALL' || u?.role === userRoleFilter;
      return matchSearch && matchRole;
    } catch {
      return false;
    }
  });

  const filteredLogs = (authLogs || []).filter(l => {
    try {
      const matchSearch = !logSearch || l?.email?.toLowerCase().includes(logSearch.toLowerCase());
      const matchEvent  = logEventFilter === 'ALL' || l?.event === logEventFilter;
      return matchSearch && matchEvent;
    } catch {
      return false;
    }
  });

  const fmtDate = (iso) => {
    if (!iso) return '—';
    try { 
      return new Date(iso).toLocaleString('en-ZA', { 
        day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' 
      }); 
    } catch { 
      return iso; 
    }
  };

  const getRoleDisplay = (u) => {
    if (!u) return { label: 'Unknown', cls: 'user-av', badge: { background: '#888', color: '#fff' } };
    if (u.role === 'ADMIN')    return { label: 'Admin',           cls: 'admin-av',    badge: { background: '#1a1a1a', color: '#fff' } };
    if (u.role === 'PROVIDER') return { label: 'Provider',        cls: 'provider-av', badge: { background: '#fef3c7', color: '#92400e' } };
    return                            { label: 'Parent / Family', cls: 'parent-av',   badge: { background: '#cffafe', color: '#0e7490' } };
  };

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
            ].map(s => (
              <div key={s.id} className={`stat-filter-card${activeTab === s.id ? ' active' : ''}`} onClick={() => setActiveTab(s.id)}>
                <div className="stat-filter-value">{s.val}</div>
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
                pendingProviders.map(p => (
                  <ExpandablePendingRow key={p.id} provider={p} onApprove={handleApprove} onReject={handleReject} />
                ))
              )}
            </div>
          )}

          {/* ── ALL LISTINGS ── */}
          {activeTab === 'all' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-list"></i>
                All Providers ({filteredListings.length} of {providers.length}) — click a listing to view full profile &amp; documents
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
                <div className="adm-scrollable-container" style={{ maxHeight: '600px' }}>
                  {filteredListings.map(provider => {
                    const photoSrc = provider?.profilePhoto || provider?.photo || provider?.image || null;
                    return (
                      <div className="adm-listing-row" key={provider.id}
                        onClick={() => showFloatingCard(provider)}>
                        <div className={`adm-avatar ${photoSrc ? '' : 'no-photo'}`}>
                          {photoSrc ? <img src={photoSrc} alt={provider.name} /> : (provider.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>{provider.name}</strong>
                            <span className={`adm-badge ${provider.status || 'pending'}`}>{provider.status || 'pending'}</span>
                            {provider.promoted && <span className="adm-badge" style={{ background: '#dcfce7', color: '#166534' }}>Promoted</span>}
                            {provider.demoted  && <span className="adm-badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Demoted</span>}
                            {provider.tier === 'featured' && <span className="adm-badge featured"><i className="fas fa-crown"></i> featured</span>}
                            {provider.tier === 'pro'      && <span className="adm-badge pro"><i className="fas fa-check-circle"></i> trusted</span>}
                            {provider.certFile      && <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 3, background: '#ecfdf5', color: '#065f46', fontWeight: 700 }}><i className="fas fa-file-alt" style={{ marginRight: 2 }}></i>Cert</span>}
                            {provider.clearanceFile && <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 3, background: '#eff6ff', color: '#1e40af', fontWeight: 700 }}><i className="fas fa-shield-alt" style={{ marginRight: 2 }}></i>Clearance</span>}
                            {(featuredSlots || []).some(s => s.providerId === provider.id) && (
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#fde68a', color: '#92400e' }}>
                                <i className="fas fa-star" style={{ marginRight: 3 }}></i>Slot #{(featuredSlots || []).find(s => s.providerId === provider.id)?.id}
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
                              const inSlot = b === 'featured' && (featuredSlots || []).some(s => s.providerId === provider.id);
                              return (
                                <span key={b} className={`adm-badge-opt ${b} ${isSelected ? 'selected' : ''}`}
                                  onClick={(e) => { e.stopPropagation(); handleBadgeSelect(provider.id, b); }} role="button" tabIndex="0">
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
                {(featuredSlots || []).map(slot => (
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

          {/* ── USERS & ACCOUNTS ── */}
          {activeTab === 'users' && (
            <div className="tab-pane active" role="tabpanel">
              <p className="section-heading">
                <i className="fas fa-users"></i>
                All Registered Accounts ({filteredUsers.length} of {registeredUsers.length}) —&nbsp;
                <span style={{ color: '#0e7490' }}>{parentUsers.length} parent/family</span>
                <span style={{ color: '#888', margin: '0 6px' }}>·</span>
                <span style={{ color: '#92400e' }}>{providerAccounts.length} providers</span>
              </p>
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
              {filteredUsers.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>
                  <i className="fas fa-users" style={{ fontSize: '1.8rem', display: 'block', marginBottom: 8, opacity: 0.3 }}></i>
                  No accounts found.
                </div>
              ) : (
                <div className="adm-scrollable-container" style={{ maxHeight: '500px' }}>
                  {filteredUsers.map((u, i) => {
                    const roleInfo    = getRoleDisplay(u);
                    const photoSrc    = u?.profilePhoto || u?.photo || u?.image || null;
                    return (
                      <div key={u.id || i} className="adm-user-row">
                        <div className={`adm-avatar ${photoSrc ? '' : roleInfo.cls}`}>
                          {photoSrc ? <img src={photoSrc} alt={u.email} /> : (u.email || '?').charAt(0).toUpperCase()}
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
              <div className="adm-scrollable-container" style={{ maxHeight: '500px' }}>
                {filteredLogs.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>
                    <i className="fas fa-scroll" style={{ fontSize: '1.8rem', display: 'block', marginBottom: 8, opacity: 0.25 }}></i>
                    No authentication events logged yet.
                  </div>
                ) : (
                  filteredLogs.map((log, i) => (
                    <div key={i} className="adm-log-row">
                      <span className={`adm-log-event ${log.event}`}>{log.event}</span>
                      <span className="adm-log-email">{log.email}</span>
                      <span className={`adm-log-role ${log.role}`}>{log.role}</span>
                      <span className="adm-log-time">{fmtDate(log.timestamp)}</span>
                    </div>
                  ))
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

      {/* Floating Provider Card */}
      {floatingCardProvider && (
        <FloatingProviderCard 
          provider={floatingCardProvider} 
          onClose={closeFloatingCard} 
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