// frontend/src/pages/UserRegister.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const injectHead = () => {
  if (document.getElementById('sah-ur-fonts')) return;
  const fonts = document.createElement('link');
  fonts.id = 'sah-ur-fonts'; fonts.rel = 'stylesheet';
  fonts.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@400;500;600;700&display=swap';
  document.head.appendChild(fonts);
  const fa = document.createElement('link');
  fa.rel = 'stylesheet';
  fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
  document.head.appendChild(fa);
};

const CSS = `
  :root {
    --acc:#c9621a; --acc-d:#a84e12; --acc-l:#f0dcc8;
    --dark:#3a3a3a; --mid:#555; --muted:#888;
    --card:#ede9e3; --white:#fff;
    --border:rgba(0,0,0,0.10);
    --shadow:0 16px 48px rgba(0,0,0,0.13);
    --r:8px; --r-lg:14px;
  }
  .ur-wrap { font-family:'DM Sans',sans-serif; min-height:100vh; display:flex; flex-direction:column; background:var(--card); -webkit-font-smoothing:antialiased; }
  .ur-wrap * { box-sizing:border-box; margin:0; padding:0; }

  /* Header */
  .ur-hdr { height:64px; background:#5a5a5a; display:flex; align-items:center; padding:0 32px; gap:16px; box-shadow:0 2px 12px rgba(0,0,0,0.22); }
  .ur-hdr-back { display:inline-flex; align-items:center; gap:7px; color:rgba(255,255,255,0.85); font-size:0.85rem; font-weight:600; background:none; border:none; cursor:pointer; font-family:inherit; }
  .ur-hdr-back:hover { color:#fff; }
  .ur-hdr-div { width:1px; height:26px; background:rgba(255,255,255,0.25); }
  .ur-hdr-brand { font-family:'Playfair Display',serif; font-weight:800; font-size:1rem; color:#fff; text-decoration:none; }

  /* Hero */
  .ur-hero { position:relative; overflow:hidden; min-height:180px; display:flex; align-items:center; }
  .ur-hero-bg { position:absolute; inset:0; background-image:url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&auto=format&fit=crop&q=80'); background-size:cover; background-position:center; }
  .ur-hero-bg::after { content:''; position:absolute; inset:0; background:linear-gradient(100deg,rgba(10,10,10,0.88) 0%,rgba(30,30,30,0.80) 100%); }
  .ur-hero-inner { position:relative; z-index:2; padding:40px 32px; width:100%; max-width:700px; margin:0 auto; text-align:center; }
  .ur-hero-inner h1 { font-family:'Playfair Display',serif; font-size:clamp(1.8rem,4vw,2.6rem); font-weight:900; color:#fff; line-height:1.1; margin-bottom:8px; }
  .ur-hero-inner h1 em { font-style:italic; color:var(--acc-l); }
  .ur-hero-inner p { font-size:0.88rem; color:rgba(255,255,255,0.72); margin-top:8px; line-height:1.65; }

  /* Body */
  .ur-body { flex:1; display:flex; align-items:flex-start; justify-content:center; padding:36px 24px 64px; }

  /* Wide card — holds two-column layout */
  .ur-card { background:var(--white); border-radius:var(--r-lg); box-shadow:var(--shadow); width:100%; max-width:840px; overflow:hidden; }
  .ur-card-head { background:#5a5a5a; padding:24px 36px 18px; }
  .ur-card-head h2 { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:800; color:#fff; }
  .ur-card-head p { font-size:0.82rem; color:rgba(255,255,255,0.65); margin-top:3px; }
  .ur-card-body { padding:28px 36px 36px; }

  /* Two-column grid */
  .ur-cols { display:grid; grid-template-columns:1fr 1px 1fr; gap:0 28px; align-items:start; }
  .ur-col-sep { background:rgba(0,0,0,0.07); align-self:stretch; }

  /* Fields */
  .ur-field { display:flex; flex-direction:column; gap:5px; margin-bottom:16px; }
  .ur-field label { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color:var(--mid); display:flex; align-items:center; gap:5px; }
  .ur-field label i { color:var(--acc); font-size:0.65rem; }
  .ur-field input { padding:11px 14px; border:1.5px solid var(--border); border-radius:var(--r); font-family:'DM Sans',sans-serif; font-size:0.92rem; color:var(--dark); outline:none; background:var(--card); transition:border-color 0.15s,box-shadow 0.15s; }
  .ur-field input:focus { border-color:var(--acc); box-shadow:0 0 0 3px rgba(201,98,26,0.14); }
  .ur-field input.err { border-color:#dc2626; background:#fff8f8; }
  .ur-field-err { color:#dc2626; font-size:0.74rem; font-weight:600; padding:4px 9px; background:#fff0f0; border-radius:5px; border-left:3px solid #dc2626; display:flex; align-items:center; gap:5px; }
  .ur-field-hint { font-size:0.73rem; color:var(--muted); display:flex; align-items:center; gap:4px; margin-top:2px; }
  .ur-field-hint i { color:var(--acc); font-size:0.65rem; }

  /* Password eye */
  .ur-pw { position:relative; }
  .ur-pw input { padding-right:42px; }
  .ur-pw-eye { position:absolute; right:11px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--muted); cursor:pointer; font-size:0.88rem; padding:3px; }
  .ur-pw-eye:hover { color:var(--acc); }

  /* Perks panel */
  .ur-perks { display:flex; flex-direction:column; gap:10px; background:rgba(201,98,26,0.06); border:1px solid rgba(201,98,26,0.18); border-radius:var(--r); padding:16px 18px; margin-bottom:18px; }
  .ur-perks-title { font-family:'Playfair Display',serif; font-size:0.95rem; font-weight:800; color:var(--dark); margin-bottom:2px; }
  .ur-perk { display:flex; align-items:center; gap:9px; font-size:0.84rem; color:var(--mid); }
  .ur-perk i { color:var(--acc); font-size:0.76rem; width:14px; text-align:center; flex-shrink:0; }

  /* Privacy note */
  .ur-privacy { background:rgba(0,0,0,0.03); border:1px solid rgba(0,0,0,0.07); border-radius:var(--r); padding:12px 15px; font-size:0.79rem; color:var(--muted); line-height:1.65; }

  /* Submit */
  .ur-submit { width:100%; padding:13px; background:var(--acc); color:#fff; border:none; border-radius:var(--r); font-family:'DM Sans',sans-serif; font-size:0.95rem; font-weight:700; cursor:pointer; transition:background 0.15s; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:4px; }
  .ur-submit:hover { background:var(--acc-d); }
  .ur-submit:disabled { opacity:0.65; cursor:not-allowed; }

  /* Divider */
  .ur-divider { display:flex; align-items:center; gap:12px; margin:18px 0 14px; }
  .ur-divider span { flex:1; height:1px; background:var(--border); }
  .ur-divider p { font-size:0.78rem; color:var(--muted); white-space:nowrap; }

  /* Switch */
  .ur-switch { text-align:center; font-size:0.84rem; color:var(--muted); line-height:1.8; }
  .ur-switch a { color:var(--acc); font-weight:700; text-decoration:none; }
  .ur-switch a:hover { text-decoration:underline; }

  /* Spinner */
  .ur-spin { width:16px; height:16px; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:ur-s 0.7s linear infinite; }
  @keyframes ur-s { to { transform:rotate(360deg); } }

  /* Banners */
  .ur-err-banner { background:#fff0f0; border:1.5px solid #f5b3b3; border-radius:var(--r); padding:11px 16px; color:#a00c2c; font-size:0.85rem; font-weight:600; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
  .ur-success-banner { background:#ecfdf5; border:1.5px solid #a7f3d0; border-radius:var(--r); padding:14px 18px; color:#065f46; font-size:0.9rem; font-weight:700; margin-bottom:18px; display:flex; align-items:center; gap:10px; }
  .ur-success-banner i { font-size:1.1rem; color:#16a34a; flex-shrink:0; }

  /* Success screen styles */
  .ur-success-wrap { padding:40px 36px; text-align:center; }
  .ur-success-icon { width:70px; height:70px; background:#10b981; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; color:white; font-size:2rem; }
  .ur-success-title { font-family:'Playfair Display',serif; font-size:1.8rem; font-weight:800; color:var(--dark); margin-bottom:8px; }
  .ur-success-email { font-size:1rem; color:var(--acc); font-weight:600; margin-bottom:20px; padding:8px 16px; background:var(--acc-l); border-radius:30px; display:inline-block; }
  .ur-success-msg { font-size:0.95rem; color:var(--mid); max-width:450px; margin:0 auto 30px; line-height:1.6; }
  .ur-success-steps { display:flex; flex-direction:column; gap:15px; max-width:400px; margin:0 auto 30px; }
  .ur-success-step { display:flex; align-items:flex-start; gap:15px; text-align:left; }
  .ur-success-step-num { width:28px; height:28px; background:var(--acc); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:700; flex-shrink:0; }
  .ur-success-step-text { font-size:0.88rem; color:var(--mid); }
  .ur-success-step-text strong { color:var(--dark); display:block; margin-bottom:2px; }
  .ur-success-login-btn { background:var(--acc); color:white; border:none; padding:14px 28px; border-radius:var(--r); font-size:1rem; font-weight:700; cursor:pointer; transition:background 0.15s; display:inline-flex; align-items:center; gap:8px; margin-bottom:20px; }
  .ur-success-login-btn:hover { background:var(--acc-d); }
  .ur-success-home { font-size:0.85rem; color:var(--muted); }
  .ur-success-home a { color:var(--acc); font-weight:600; text-decoration:none; }
  .ur-success-home a:hover { text-decoration:underline; }

  /* Responsive */
  @media(max-width:660px) {
    .ur-cols { grid-template-columns:1fr; }
    .ur-col-sep { display:none; }
    .ur-card-body { padding:22px 20px 28px; }
    .ur-hdr { padding:0 16px; }
    .ur-hero-inner { padding:32px 16px; }
    .ur-body { padding:24px 14px 48px; }
    .ur-success-wrap { padding:30px 20px; }
    .ur-success-title { font-size:1.5rem; }
  }
`;

const API_URL = 'http://localhost:5000/api';

const UserRegister = () => {
  const navigate             = useNavigate();
  const { register }         = useAuth(); // Fixed: was registerUser, should be register
  const { showNotification } = useNotification() || {};

  const [username,   setUsername]   = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [showCf,     setShowCf]     = useState(false);
  const [errors,     setErrors]     = useState({});
  const [submitErr,  setSubmitErr]  = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); // Fixed: added registered state
  const [registeredEmail, setRegisteredEmail] = useState(''); // Fixed: added registeredEmail state

  useEffect(() => {
    injectHead();
    if (!document.getElementById('sah-ur-css')) {
      const s = document.createElement('style');
      s.id = 'sah-ur-css'; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  const validate = () => {
    const e = {};
    const uname = username?.trim() || '';
    if (!uname || uname.length < 3)    e.username = 'Username must be at least 3 characters.';
    else if (/\s/.test(uname))         e.username = 'Username cannot contain spaces.';
    else if (!/^[a-zA-Z0-9_.-]+$/.test(uname)) e.username = 'Username may only contain letters, numbers, _ . -';
    
    const userEmail = email?.trim() || '';
    if (!userEmail || !/^\S+@\S+\.\S+$/.test(userEmail)) e.email = 'Enter a valid email address.';
    
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (password !== confirm)          e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { 
      setErrors(errs); 
      return; 
    }
    
    setErrors({}); 
    setSubmitErr(''); 
    setSubmitting(true);

    try {
      // Try to use auth context register first
      const result = register
        ? await register({ 
            username: username?.trim() || '', 
            email: email?.trim() || '', 
            password: password || '' 
          })
        : null;

      if (result?.success) {
        const displayName = username?.trim() || '';
        setSuccessMsg(`Welcome, ${displayName}! Your account has been created.`);
        if (showNotification && typeof showNotification === 'function') {
          showNotification(`✅ Welcome, ${displayName}! You're registered and logged in.`, 'success');
        }
        setTimeout(() => navigate('/'), 2400);
        return;
      }

      // ── localStorage fallback ──
      const users = JSON.parse(localStorage.getItem('sah_users') || '[]');
      const emailTrimmed = email?.trim()?.toLowerCase() || '';
      const usernameTrimmed = username?.trim() || '';
      
      const emailTaken    = users.find(u => u?.email?.toLowerCase() === emailTrimmed);
      const usernameTaken = users.find(u => u?.username?.toLowerCase() === usernameTrimmed?.toLowerCase());
      
      if (emailTaken) { 
        setSubmitErr('An account with this email already exists.');              
        setSubmitting(false); 
        return; 
      }
      if (usernameTaken) { 
        setSubmitErr('That username is already taken — please choose another.'); 
        setSubmitting(false); 
        return; 
      }

      const newUser = {
        id:         'user_' + Date.now(),
        username:   usernameTrimmed,
        email:      emailTrimmed,
        role:       'USER',
        registered: new Date().toISOString(),
        lastLogin:  new Date().toISOString(),
      };
      
      users.push(newUser);
      localStorage.setItem('sah_users', JSON.stringify(users));

      // ── Auth log ──
      const logs = JSON.parse(localStorage.getItem('sah_auth_logs') || '[]');
      logs.unshift({
        userId: newUser.id, 
        username: newUser.username, 
        email: newUser.email,
        role: 'USER', 
        event: 'REGISTER', 
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('sah_auth_logs', JSON.stringify(logs.slice(0, 500)));

      // Set registered state for success screen
      setIsRegistered(true);
      setRegisteredEmail(emailTrimmed);
      
      const displayName = usernameTrimmed;
      if (showNotification && typeof showNotification === 'function') {
        showNotification(`✅ Welcome, ${displayName}! Registration successful.`, 'success');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitErr('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fe = errors;

  /* ── Confirmation / success screen ── */
  if (isRegistered) {
    return (
      <div className="ur-wrap">
        <header className="ur-hdr">
          <button className="ur-hdr-back" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left" /> Back to Directory
          </button>
          <div className="ur-hdr-div" />
          <Link to="/" className="ur-hdr-brand">SA Homeschooling</Link>
        </header>

        <div className="ur-hero">
          <div className="ur-hero-bg" />
          <div className="ur-hero-inner">
            <h1>Account <em>Created!</em></h1>
          </div>
        </div>

        <div className="ur-body">
          <div className="ur-card">
            <div className="ur-card-head" style={{ background: '#1a7a4a' }}>
              <h2><i className="fas fa-check-circle" style={{ marginRight: 9, fontSize: '1.1rem' }} /> Registration Successful</h2>
              <p>Your free account has been created</p>
            </div>
            <div className="ur-success-wrap">
              <div className="ur-success-icon">
                <i className="fas fa-check" />
              </div>
              <div className="ur-success-title">You're all set!</div>
              <div className="ur-success-email">{registeredEmail}</div>
              <p className="ur-success-msg">
                Your account has been successfully created. To access provider profiles and contact details, please log in using your email and password below.
              </p>

              <div className="ur-success-steps">
                <div className="ur-success-step">
                  <div className="ur-success-step-num">1</div>
                  <div className="ur-success-step-text">
                    <strong>Account created</strong>
                    Your details have been saved securely.
                  </div>
                </div>
                <div className="ur-success-step">
                  <div className="ur-success-step-num">2</div>
                  <div className="ur-success-step-text">
                    <strong>Log in to your account</strong>
                    Use your email and password to sign in from the homepage.
                  </div>
                </div>
                <div className="ur-success-step">
                  <div className="ur-success-step-num">3</div>
                  <div className="ur-success-step-text">
                    <strong>Browse providers</strong>
                    View full profiles, contact details and reviews.
                  </div>
                </div>
              </div>

              <button
                className="ur-success-login-btn"
                onClick={() => {
                  sessionStorage.setItem('sah_prefill_login_email', registeredEmail);
                  navigate('/');
                }}
              >
                <i className="fas fa-sign-in-alt" /> Go to Homepage &amp; Log In
              </button>
              <div className="ur-success-home">
                Are you a provider? <Link to="/register/provider">Register a service listing</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Registration form ── */
  return (
    <div className="ur-wrap">

      {/* Header */}
      <header className="ur-hdr">
        <button className="ur-hdr-back" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left" /> Back to Directory
        </button>
        <div className="ur-hdr-div" />
        <Link to="/" className="ur-hdr-brand">SA Homeschooling</Link>
      </header>

      {/* Hero — generic, not family-specific */}
      <div className="ur-hero">
        <div className="ur-hero-bg" />
        <div className="ur-hero-inner">
          <h1>Create Your <em>Free Account</em></h1>
          <p>
            Join thousands of South Africans discovering verified tutors, therapists,
            curriculum providers and enrichment services — all in one trusted directory.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="ur-body">
        <div className="ur-card">
          <div className="ur-card-head">
            <h2>
              <i className="fas fa-user-plus" style={{ marginRight: 9, color: 'var(--acc-l)', fontSize: '1.1rem' }} />
              Register Your Account
            </h2>
            <p>Free access — browse all verified provider profiles instantly</p>
          </div>

          <div className="ur-card-body">

            {successMsg && (
              <div className="ur-success-banner">
                <i className="fas fa-check-circle" />
                {successMsg}
              </div>
            )}

            {submitErr && (
              <div className="ur-err-banner">
                <i className="fas fa-exclamation-triangle" /> {submitErr}
              </div>
            )}

            {/* Two-column layout */}
            <div className="ur-cols">

              {/* ── LEFT: form fields ── */}
              <div>
                {/* Username */}
                <div className="ur-field">
                  <label><i className="fas fa-at" /> Username <span style={{ color: 'var(--acc)' }}>*</span></label>
                  <input
                    type="text" value={username}
                    placeholder="e.g. sarah_learns"
                    className={fe.username ? 'err' : ''}
                    onChange={e => { 
                      setUsername(e.target.value); 
                      setErrors(p => ({ ...p, username: '' })); 
                    }}
                  />
                  {fe.username
                    ? <div className="ur-field-err"><i className="fas fa-exclamation-circle" /> {fe.username}</div>
                    : <div className="ur-field-hint"><i className="fas fa-info-circle" /> Letters, numbers, _ . — · min. 3 characters</div>
                  }
                </div>

                {/* Email */}
                <div className="ur-field">
                  <label><i className="fas fa-envelope" /> Email Address <span style={{ color: 'var(--acc)' }}>*</span></label>
                  <input
                    type="email" value={email}
                    placeholder="you@example.co.za"
                    className={fe.email ? 'err' : ''}
                    onChange={e => { 
                      setEmail(e.target.value); 
                      setErrors(p => ({ ...p, email: '' })); 
                    }}
                  />
                  {fe.email && <div className="ur-field-err"><i className="fas fa-exclamation-circle" /> {fe.email}</div>}
                </div>

                {/* Password */}
                <div className="ur-field">
                  <label><i className="fas fa-lock" /> Password <span style={{ color: 'var(--acc)' }}>*</span></label>
                  <div className="ur-pw">
                    <input
                      type={showPw ? 'text' : 'password'} value={password}
                      placeholder="Min. 8 characters"
                      className={fe.password ? 'err' : ''}
                      onChange={e => { 
                        setPassword(e.target.value); 
                        setErrors(p => ({ ...p, password: '' })); 
                      }}
                    />
                    <button type="button" className="ur-pw-eye" onClick={() => setShowPw(s => !s)}>
                      <i className={`far fa-eye${showPw ? '-slash' : ''}`} />
                    </button>
                  </div>
                  {fe.password && <div className="ur-field-err"><i className="fas fa-exclamation-circle" /> {fe.password}</div>}
                </div>

                {/* Confirm password */}
                <div className="ur-field">
                  <label><i className="fas fa-lock" /> Confirm Password <span style={{ color: 'var(--acc)' }}>*</span></label>
                  <div className="ur-pw">
                    <input
                      type={showCf ? 'text' : 'password'} value={confirm}
                      placeholder="Repeat your password"
                      className={fe.confirm ? 'err' : ''}
                      onChange={e => { 
                        setConfirm(e.target.value); 
                        setErrors(p => ({ ...p, confirm: '' })); 
                      }}
                    />
                    <button type="button" className="ur-pw-eye" onClick={() => setShowCf(s => !s)}>
                      <i className={`far fa-eye${showCf ? '-slash' : ''}`} />
                    </button>
                  </div>
                  {fe.confirm && <div className="ur-field-err"><i className="fas fa-exclamation-circle" /> {fe.confirm}</div>}
                </div>

                <button
                  className="ur-submit"
                  onClick={handleSubmit}
                  disabled={submitting || !!successMsg}
                >
                  {submitting ? <span className="ur-spin" /> : <i className="fas fa-user-plus" />}
                  {submitting ? 'Creating Account…' : successMsg ? 'Redirecting…' : 'Create Free Account'}
                </button>

                <div className="ur-divider">
                  <span /><p>Already have an account?</p><span />
                </div>
                <div className="ur-switch">
                  <Link to="/login">Log in to your account</Link>
                  <br />
                  Are you a provider? <Link to="/register/provider">Register here</Link>
                </div>
              </div>

              {/* ── Vertical separator ── */}
              <div className="ur-col-sep" />

              {/* ── RIGHT: perks ── */}
              <div>
                <div className="ur-perks">
                  <div className="ur-perks-title">Why create an account?</div>
                  {[
                    ['fa-search',    'Browse & search all verified service providers'],
                    ['fa-envelope',  'Send direct enquiries to tutors and therapists'],
                    ['fa-heart',     'Save and compare your favourite listings'],
                    ['fa-bell',      'Get notified when new providers join your area'],
                    ['fa-star',      'Leave reviews and help other users choose'],
                    ['fa-shield-alt','All providers are manually verified for trust'],
                  ].map(([ic, txt]) => (
                    <div key={txt} className="ur-perk">
                      <i className={`fas ${ic}`} /> {txt}
                    </div>
                  ))}
                </div>

                <div className="ur-privacy">
                  <i className="fas fa-lock" style={{ color: 'var(--acc)', marginRight: 6 }} />
                  Your details are private and secure. We never share your information with
                  third parties. By registering you confirm you are 13 years or older.
                </div>
              </div>

            </div>{/* end .ur-cols */}
          </div>{/* end .ur-card-body */}
        </div>
      </div>

    </div>
  );
};

export default UserRegister;