// frontend/src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const injectHead = () => {
  if (document.getElementById('sah-login-fonts')) return;
  const fonts = document.createElement('link');
  fonts.id = 'sah-login-fonts';
  fonts.rel = 'stylesheet';
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
    --border: rgba(0,0,0,0.10); --header-h: 68px;
    --shadow-md: 0 4px 20px rgba(0,0,0,0.10);
    --radius: 8px; --radius-lg: 12px;
  }
  .sah-login-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .sah-login-wrap { font-family: 'DM Sans', sans-serif; background: var(--card-white); min-height: 100vh; display: flex; flex-direction: column; -webkit-font-smoothing: antialiased; }
  .sah-lhdr { position: sticky; top: 0; z-index: 100; height: var(--header-h); background: #5a5a5a; box-shadow: 0 2px 12px rgba(0,0,0,0.22); display: flex; align-items: center; flex-shrink: 0; }
  .sah-lhdr-inner { max-width: 1280px; margin: 0 auto; padding: 0 32px; width: 100%; display: flex; align-items: center; justify-content: space-between; }
  .sah-lhdr-left { display: flex; align-items: center; gap: 0; }
  .sah-lhdr-back { display: inline-flex; align-items: center; gap: 8px; background: none; border: none; color: rgba(255,255,255,0.88); font-size: 0.88rem; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; padding: 6px 0; text-decoration: none; white-space: nowrap; }
  .sah-lhdr-back:hover { color: #fff; }
  .sah-lhdr-div { width: 1px; height: 28px; background: rgba(255,255,255,0.28); margin: 0 16px; }
  .sah-lhdr-brand { text-decoration: none; }
  .sah-lhdr-brand-name { font-family: 'Playfair Display', serif; font-weight: 800; font-size: 1.02rem; color: #fff; display: block; }
  .sah-lhdr-brand-tag { font-size: 0.66rem; color: rgba(255,255,255,0.68); font-weight: 500; letter-spacing: 0.45px; display: block; }
  .sah-lhdr-right { display: flex; align-items: center; gap: 10px; }
  .sah-lhdr-solid { padding: 7px 18px; border-radius: 6px; background: var(--accent); color: #fff; font-weight: 700; font-size: 0.86rem; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; transition: background 0.15s; }
  .sah-lhdr-solid:hover { background: var(--accent-dark); }
  .sah-login-main { flex: 1; display: flex; align-items: stretch; overflow: hidden; }
  .sah-login-left { flex: 0 0 48%; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; min-width: 0; }
  .sah-login-left-bg { position: absolute; inset: 0; z-index: 0; background-image: url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop&q=80'); background-size: cover; background-position: center 30%; }
  .sah-login-left-bg::after { content: ''; position: absolute; inset: 0; background: linear-gradient(160deg, rgba(10,10,10,0.55) 0%, rgba(30,20,10,0.82) 100%); }
  .sah-login-left-content { position: relative; z-index: 2; padding: 40px 36px; }
  .sah-login-left-title { font-family: 'Playfair Display', serif; font-size: clamp(1.7rem, 2.6vw, 2.6rem); font-weight: 900; color: #fff; line-height: 1.08; margin-bottom: 16px; }
  .sah-login-left-title em { font-style: italic; color: var(--accent-light); }
  .sah-login-left-desc { font-size: 0.88rem; color: rgba(255,255,255,0.75); line-height: 1.7; max-width: 340px; margin-bottom: 28px; }
  .sah-login-left-perks { display: flex; flex-direction: column; gap: 10px; }
  .sah-login-left-perk { display: flex; align-items: center; gap: 11px; font-size: 0.84rem; font-weight: 600; color: rgba(255,255,255,0.88); }
  .sah-login-left-perk i { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: var(--accent-light); flex-shrink: 0; }
  .sah-login-right { flex: 1; min-width: 0; background: var(--card-white); display: flex; flex-direction: column; justify-content: center; padding: 32px 48px; overflow-y: auto; }
  .sah-login-heading { font-family: 'Playfair Display', serif; font-size: 1.9rem; font-weight: 800; color: var(--dark); margin-bottom: 3px; line-height: 1.15; }
  .sah-login-sub { color: var(--muted); font-size: 0.88rem; margin-bottom: 18px; }
  .sah-login-alert { display: none; padding: 11px 16px; border-radius: 8px; font-weight: 600; font-size: 0.86rem; margin-bottom: 16px; border: 1px solid transparent; }
  .sah-login-alert.error { background: #fee9e9; color: #a00c2c; border-color: #f5b3b3; }
  .sah-login-alert.success { background: #e6f7ec; color: #0d7d6c; border-color: #a3e0b5; }
  .sah-login-alert.show { display: flex; align-items: center; gap: 8px; }
  .sah-login-card { background: var(--card-gray); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); overflow: hidden; }
  .sah-login-card-head { background: #5a5a5a; padding: 18px 24px 14px; }
  .sah-login-card-head h3 { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px; }
  .sah-login-card-head p { font-size: 0.78rem; color: rgba(255,255,255,0.65); margin-top: 2px; }
  .sah-login-card-body { padding: 18px 22px 16px; }
  .sah-lfield { margin-bottom: 11px; }
  .sah-lfield label { display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.6px; color: var(--mid); margin-bottom: 5px; }
  .sah-lfield label i { color: var(--accent); font-size: 0.72rem; }
  .sah-lfield label span { color: var(--accent); font-size: 1rem; }
  .sah-lfield input { width: 100%; padding: 10px 13px; border: 1.5px solid rgba(0,0,0,0.12); border-radius: var(--radius); background: var(--card-white); font-family: 'DM Sans', sans-serif; font-size: 0.91rem; color: var(--dark); outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
  .sah-lfield input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,98,26,0.15); }
  .sah-lfield input.error { border-color: #dc2626; background: #fff8f8; }
  .sah-field-err { margin-top: 4px; font-size: 0.73rem; color: #dc2626; display: flex; align-items: center; gap: 4px; }
  .sah-pw-wrap { position: relative; }
  .sah-pw-wrap input { padding-right: 42px; }
  .sah-pw-toggle { position: absolute; right: 0; top: 0; bottom: 0; width: 42px; background: none; border: none; cursor: pointer; color: var(--muted); font-size: 0.85rem; display: flex; align-items: center; justify-content: center; transition: color 0.15s; }
  .sah-pw-toggle:hover { color: var(--accent); }
  .sah-login-extras { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .sah-remember { display: flex; align-items: center; gap: 7px; font-size: 0.82rem; color: var(--mid); cursor: pointer; user-select: none; }
  .sah-remember input { accent-color: var(--accent); width: 14px; height: 14px; }
  .sah-forgot { background: none; border: none; color: var(--accent); font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 0; }
  .sah-forgot:hover { text-decoration: underline; }
  .sah-login-submit-wrap { display: flex; flex-direction: column; gap: 8px; }
  .sah-login-btn { width: 100%; padding: 12px; background: var(--accent); color: #fff; border: none; border-radius: var(--radius); font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px; transition: background 0.15s, transform 0.15s; }
  .sah-login-btn:hover:not(:disabled) { background: var(--accent-dark); transform: translateY(-1px); }
  .sah-login-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
  .sah-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .sah-secure-note { text-align: center; font-size: 0.73rem; color: var(--muted); display: flex; align-items: center; justify-content: center; gap: 5px; }
  .sah-secure-note i { color: #10b981; }
  .sah-login-divider { text-align: center; margin: 14px 0 10px; font-size: 0.78rem; color: var(--muted); position: relative; }
  .sah-login-divider::before, .sah-login-divider::after { content: ''; position: absolute; top: 50%; width: 40%; height: 1px; background: rgba(0,0,0,0.10); }
  .sah-login-divider::before { left: 0; }
  .sah-login-divider::after { right: 0; }
  .sah-login-prompt { text-align: center; font-size: 0.86rem; color: var(--mid); margin-bottom: 10px; }
  .sah-login-prompt a { color: var(--accent); font-weight: 600; text-decoration: none; }
  .sah-login-prompt a:hover { text-decoration: underline; }
  @media (max-width: 768px) { .sah-login-left { display: none; } .sah-login-right { padding: 24px 20px; } }
`;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification } = useNotification();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [remember,     setRemember]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert,        setAlert]        = useState({ msg: '', type: '' });
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);

  useEffect(() => {
    injectHead();
    if (!document.getElementById('sah-login-styles')) {
      const s = document.createElement('style');
      s.id = 'sah-login-styles'; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ msg: '', type: '' });
    if (!validate()) return;

    setLoading(true);
    const trimmedEmail = email.trim().toLowerCase();

    try {
      // ── Admin shortcut ──
      if (trimmedEmail === 'admin@sahomeschooling.co.za' && password === 'admin123') {
        const adminData = { role: 'admin', email: trimmedEmail, name: 'Admin', id: 'admin1' };
        localStorage.setItem('sah_current_user', JSON.stringify(adminData));
        localStorage.setItem('sah_user', JSON.stringify(adminData));
        login(adminData); // pass object directly
        setAlert({ msg: 'Admin login successful! Redirecting...', type: 'success' });
        showNotification?.('Admin login successful!', 'success');
        setTimeout(() => navigate('/admin-dashboard'), 1000);
        return;
      }

      // ── Demo seed provider ──
      if (trimmedEmail === 'contact@khanacademy.org.za') {
        const userData = { role: 'client', email: trimmedEmail, id: 'khan', name: 'Khan Academy SA', plan: 'free' };
        localStorage.setItem('sah_current_user', JSON.stringify(userData));
        localStorage.setItem('sah_user', JSON.stringify(userData));
        login(userData);
        setAlert({ msg: 'Login successful! Redirecting...', type: 'success' });
        setTimeout(() => navigate('/client-dashboard'), 1000);
        return;
      }

      // ── Use AuthContext login (email + password) ──
      const result = await login(trimmedEmail, password);

      if (result && result.success) {
        const userData = result.user;
        setAlert({ msg: result.message || 'Login successful! Redirecting...', type: 'success' });
        showNotification?.(result.message || 'Welcome back!', 'success');

        const isAdmin = (userData.role || '').toLowerCase() === 'admin';
        setTimeout(() => navigate(isAdmin ? '/admin-dashboard' : '/client-dashboard'), 1000);
      } else {
        setAlert({
          msg: result?.error || 'Invalid email or password. Please try again.',
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setAlert({ msg: 'An unexpected error occurred. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sah-login-wrap">

      <header className="sah-lhdr">
        <div className="sah-lhdr-inner">
          <div className="sah-lhdr-left">
            <button className="sah-lhdr-back" onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left" /> Back to Directory
            </button>
            <div className="sah-lhdr-div" />
            <Link to="/" className="sah-lhdr-brand">
              <span className="sah-lhdr-brand-name">SA Homeschooling</span>
              <span className="sah-lhdr-brand-tag">Education Services Directory</span>
            </Link>
          </div>
          <div className="sah-lhdr-right">
            <Link to="/register" className="sah-lhdr-solid">Register</Link>
          </div>
        </div>
      </header>

      <main className="sah-login-main">
        <div className="sah-login-left">
          <div className="sah-login-left-bg" />
          <div className="sah-login-left-content">
            <h2 className="sah-login-left-title">
              South Africa's<br /><em>Homeschooling</em><br />Directory
            </h2>
            <p className="sah-login-left-desc">
              Connect with verified tutors, therapists, curriculum providers and education specialists nationwide.
            </p>
            <div className="sah-login-left-perks">
              {[
                ['fa-shield-alt', 'All providers manually verified'],
                ['fa-lock',       'Secure & private enquiries'],
                ['fa-star',       '4.9 average provider rating'],
                ['fa-map-marker-alt', 'Nationwide coverage across all 9 provinces'],
              ].map(([icon, text]) => (
                <div key={text} className="sah-login-left-perk">
                  <i className={`fas ${icon}`} />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sah-login-right">
          <h1 className="sah-login-heading">Welcome Back</h1>
          <p className="sah-login-sub">Sign in to your SA Homeschooling Directory account</p>

          {alert.msg && (
            <div className={`sah-login-alert show ${alert.type}`}>
              <i className={`fas ${alert.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
              {' '}{alert.msg}
            </div>
          )}

          <div className="sah-login-card">
            <div className="sah-login-card-head">
              <h3><i className="fas fa-lock" /> Sign in with your credentials</h3>
              <p>Access your provider dashboard and manage your listings</p>
            </div>

            <div className="sah-login-card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="sah-lfield">
                  <label><i className="fas fa-envelope" /> Email Address <span>*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                    placeholder="you@example.co.za"
                    className={errors.email ? 'error' : ''}
                    autoFocus
                  />
                  {errors.email && <div className="sah-field-err"><i className="fas fa-circle-exclamation" /> {errors.email}</div>}
                </div>

                <div className="sah-lfield">
                  <label><i className="fas fa-lock" /> Password <span>*</span></label>
                  <div className="sah-pw-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                      placeholder="Your password"
                      className={errors.password ? 'error' : ''}
                    />
                    <button type="button" className="sah-pw-toggle" onClick={() => setShowPassword(s => !s)}>
                      <i className={`far fa-eye${showPassword ? '-slash' : ''}`} />
                    </button>
                  </div>
                  {errors.password && <div className="sah-field-err"><i className="fas fa-circle-exclamation" /> {errors.password}</div>}
                </div>

                <div className="sah-login-extras">
                  <label className="sah-remember">
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                    Remember me
                  </label>
                  <button type="button" className="sah-forgot">Forgot password?</button>
                </div>

                <div className="sah-login-submit-wrap">
                  <button type="submit" className="sah-login-btn" disabled={loading}>
                    {loading ? <span className="sah-spinner" /> : <i className="fas fa-arrow-right-to-bracket" />}
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                  <div className="sah-secure-note">
                    <i className="fas fa-shield-heart" /> Secure · Encrypted · Verified educators
                  </div>
                </div>
              </form>

              <div className="sah-login-divider">or</div>

              <p className="sah-login-prompt">
                New to the community? <Link to="/register">Create a free account</Link> — it's free
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;