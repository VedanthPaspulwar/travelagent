import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Mail, Lock, Eye, EyeOff, Loader2, Plane, Check } from 'lucide-react';
import './Login.css';

// ── Destination slides ──────────────────────────────────────────────
const SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1920&auto=format&fit=crop',
    title: 'Swiss Alps',
    subtitle: 'Alpine Grandeur',
  },
  {
    src: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=1920&auto=format&fit=crop',
    title: 'Skógafoss, Iceland',
    subtitle: 'Waterfall Wonder',
  },
  {
    src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop',
    title: 'Grossglockner, Austria',
    subtitle: 'Alpine Road',
  },
  {
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop',
    title: 'Maldives',
    subtitle: 'Tropical Paradise',
  },
  {
    src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1920&auto=format&fit=crop',
    title: 'Hallstatt Lake',
    subtitle: 'Lakeside Village',
  },
  {
    src: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1920&auto=format&fit=crop',
    title: 'Sahara Dunes',
    subtitle: 'Desert Majesty',
  },
];

const SLIDE_INTERVAL = 6000;

// ── Particles config ────────────────────────────────────────────────
const PARTICLE_COUNT = 30;

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 2,
    duration: Math.random() * 12 + 10,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.4 + 0.1,
  }));
}

// ── Google SVG icon (inline to avoid external dependency) ───────────
function GoogleIcon() {
  return (
    <svg className="login-google-icon" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ── Facebook icon ───────────────────────────────────────────────────
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.017 1.793-4.682 4.533-4.682 1.313 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.928-1.956 1.88v2.255h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Login Component
// ══════════════════════════════════════════════════════════════════════
export default function Login() {
  const navigate = useNavigate();

  // ── Slideshow state ─────────────────────────────────────────────
  const [activeSlide, setActiveSlide] = useState(0);
  const [imgErrors, setImgErrors] = useState(() => new Set());
  const intervalRef = useRef(null);
  const pausedRef = useRef(false);

  // ── Particles ───────────────────────────────────────────────────
  const [particles] = useState(generateParticles);
  const [reducedMotion, setReducedMotion] = useState(false);

  // ── Form state ──────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ── Loading / Success ───────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ── Reduced motion detection ────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Slideshow timer ─────────────────────────────────────────────
  const startSlideshow = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setActiveSlide((prev) => (prev + 1) % SLIDES.length);
      }
    }, SLIDE_INTERVAL);
  }, []);

  useEffect(() => {
    startSlideshow();
    return () => clearInterval(intervalRef.current);
  }, [startSlideshow]);

  const goToSlide = (index) => {
    setActiveSlide(index);
    startSlideshow(); // reset timer on manual navigation
  };

  const pauseSlideshow = () => { pausedRef.current = true; };
  const resumeSlideshow = () => { pausedRef.current = false; };

  // ── Validation ──────────────────────────────────────────────────
  const validateEmail = (value) => {
    if (!value.trim()) return 'Email is required';
    // Standard email pattern
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  // ── Submit handler ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setErrors({ email: emailErr, password: passErr });
    setTouched({ email: true, password: true });

    if (emailErr || passErr) return;

    setIsLoading(true);

    // Simulated auth delay (replace with real API call later)
    await new Promise((r) => setTimeout(r, 2000));

    setIsLoading(false);
    setIsSuccess(true);

    // Navigate to the existing app after showing success
    setTimeout(() => {
      navigate('/');
    }, 2200);
  };

  // ── Image error handler ────────────────────────────────────────
  const handleImgError = (index) => {
    setImgErrors((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="login-page">
      {/* Background Slideshow */}
      <div className="login-slideshow" aria-hidden="true">
        {SLIDES.map((slide, i) => (
          <div key={i} className={`login-slide ${i === activeSlide ? 'active' : ''}`}>
            {imgErrors.has(i) ? (
              <div className="login-slide-fallback" />
            ) : (
              <img
                src={slide.src}
                alt={slide.title}
                loading={i === 0 ? 'eager' : 'lazy'}
                onError={() => handleImgError(i)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Overlays */}
      <div className="login-overlay" aria-hidden="true" />
      <div className="login-vignette" aria-hidden="true" />

      {/* Particles */}
      {!reducedMotion && (
        <div className="login-particles" aria-hidden="true">
          {particles.map((p) => (
            <div
              key={p.id}
              className="login-particle"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* Destination caption */}
      <div className="login-caption">
        <div className="login-caption-title">{SLIDES[activeSlide].title}</div>
        <div className="login-caption-sub">{SLIDES[activeSlide].subtitle}</div>
      </div>

      {/* Slideshow dots */}
      <div className="login-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`login-dot ${i === activeSlide ? 'active' : ''}`}
            onClick={() => goToSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="login-content">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="login-card">
            {/* Logo */}
            <div className="login-logo">
              <div className="login-logo-icon">
                <Compass size={22} />
              </div>
              <span className="login-logo-text">TravelPilot</span>
            </div>

            {/* Header */}
            <div className="login-header">
              <h1>Welcome Back, Explorer</h1>
              <p>Your trip. Managed by AI.</p>
            </div>

            {/* Form */}
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="login-input-group">
                <input
                  id="login-email"
                  type="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={touched.email && errors.email ? 'error' : ''}
                  autoComplete="email"
                  aria-label="Email address"
                />
                <div className="login-input-icon">
                  <Mail size={18} />
                </div>
                <span className="login-floating-label">Email address</span>
                {touched.email && errors.email && (
                  <div className="login-error-text">{errors.email}</div>
                )}
              </div>

              {/* Password */}
              <div className="login-input-group">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={touched.password && errors.password ? 'error' : ''}
                  autoComplete="current-password"
                  aria-label="Password"
                />
                <div className="login-input-icon">
                  <Lock size={18} />
                </div>
                <span className="login-floating-label">Password</span>
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {touched.password && errors.password && (
                  <div className="login-error-text">{errors.password}</div>
                )}
              </div>

              {/* Options row */}
              <div className="login-options">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <button type="button" className="login-forgot">
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="login-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Preparing your journey...</span>
                  </>
                ) : (
                  <>
                    <span>Start Journey</span>
                    <Plane size={18} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="login-divider">
                <span>or continue with</span>
              </div>

              {/* Social buttons */}
              <div className="login-socials">
                <button type="button" className="login-social-btn">
                  <GoogleIcon />
                  Google
                </button>
                <button type="button" className="login-social-btn">
                  <FacebookIcon />
                  Facebook
                </button>
              </div>

              {/* Sign up */}
              <div className="login-signup">
                Don&apos;t have an account?{' '}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Sign up
                </a>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            className="login-success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
            >
              <div className="login-success-check">
                <Check size={40} strokeWidth={3} />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="login-success-title">Bon Voyage!</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="login-success-sub">Redirecting to your dashboard...</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
