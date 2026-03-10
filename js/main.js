/* ============================================================
   AYARA — Daily Shia Islamic Wisdom, Prayer & Reflection
   Main JavaScript
   OakDev & AI AB © 2026
   ============================================================ */

'use strict';

/* ─── State ─────────────────────────────────────────────── */
let currentLang   = 'en';
let translations  = {};
const RTL_LANGS   = ['ar', 'fa', 'ur'];
const LANG_META   = {
  en: { flag: '🇬🇧', code: 'EN' },
  ar: { flag: '🇸🇦', code: 'AR' },
  fa: { flag: '🇮🇷', code: 'FA' },
  ur: { flag: '🇵🇰', code: 'UR' },
  tr: { flag: '🇹🇷', code: 'TR' },
  id: { flag: '🇮🇩', code: 'ID' },
  fr: { flag: '🇫🇷', code: 'FR' },
  az: { flag: '🇦🇿', code: 'AZ' },
};

/* ─── Helpers ────────────────────────────────────────────── */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

function get(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
}

/* ─── Stars / Particles ──────────────────────────────────── */
(function initStars() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.012 + 0.004,
      phase: Math.random() * Math.PI * 2,
      // colour: mix between white and faint crimson/gold
      hue: Math.random() > 0.85 ? (Math.random() > 0.5 ? 340 : 42) : 0,
      sat: Math.random() > 0.85 ? 60 : 0,
    };
  }

  function populate() {
    const count = Math.min(220, Math.floor((W * H) / 5200));
    stars = Array.from({ length: count }, mkStar);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const t = performance.now() * 0.001;
    for (const s of stars) {
      const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.sat
        ? `hsla(${s.hue},${s.sat}%,75%,${a})`
        : `rgba(255,255,255,${a})`;
      ctx.fill();
    }
    animId = requestAnimationFrame(draw);
  }

  resize();
  populate();
  draw();

  const ro = new ResizeObserver(() => { resize(); populate(); });
  ro.observe(document.body);
})();

/* ─── Navigation ─────────────────────────────────────────── */
(function initNav() {
  const nav        = document.getElementById('nav');
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    navLinks.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navLinks.addEventListener('click', e => {
    if (e.target.classList.contains('nav__link')) {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Active link on scroll
  const sections = $$('section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        $$('.nav__link').forEach(a => a.classList.remove('active'));
        const active = $(`.nav__link[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => observer.observe(s));
})();

/* ─── Scroll Animations ──────────────────────────────────── */
(function initScrollAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = +(e.target.dataset.delay || 0);
        setTimeout(() => e.target.classList.add('visible'), delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  $$('.animate-on-scroll').forEach(el => obs.observe(el));
})();

/* ─── Stat Counters ──────────────────────────────────────── */
(function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = +el.dataset.count;
      if (!end) return;
      const dur = 1600;
      const step = 16;
      const inc  = end / (dur / step);
      let cur = 0;
      const tick = () => {
        cur = Math.min(cur + inc, end);
        el.textContent = Math.round(cur).toLocaleString();
        if (cur < end) setTimeout(tick, step);
      };
      tick();
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  $$('[data-count]').forEach(el => obs.observe(el));
})();

/* ─── Language Switcher ──────────────────────────────────── */
(function initLang() {
  const btn      = document.getElementById('langBtn');
  const dropdown = document.getElementById('langDropdown');
  const flagEl   = document.getElementById('langFlag');
  const codeEl   = document.getElementById('langCode');

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', false);
  });

  dropdown.addEventListener('click', e => {
    e.stopPropagation();
    const opt = e.target.closest('[data-lang]');
    if (!opt) return;
    setLanguage(opt.dataset.lang);
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', false);
  });

  // Detect browser language
  const saved = localStorage.getItem('ayara_lang');
  const browserLang = (navigator.language || 'en').slice(0, 2).toLowerCase();
  const preferred = saved || (LANG_META[browserLang] ? browserLang : 'en');
  setLanguage(preferred);

  async function setLanguage(lang) {
    if (!LANG_META[lang]) lang = 'en';
    currentLang = lang;
    localStorage.setItem('ayara_lang', lang);

    // Update button
    const meta = LANG_META[lang];
    flagEl.textContent = meta.flag;
    codeEl.textContent = meta.code;

    // Mark active
    $$('[data-lang]', dropdown).forEach(o => {
      o.classList.toggle('active', o.dataset.lang === lang);
      o.setAttribute('aria-selected', o.dataset.lang === lang);
    });

    // RTL
    const isRTL = RTL_LANGS.includes(lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    // Load & apply
    await loadTranslations(lang);
    applyTranslations();
  }

  async function loadTranslations(lang) {
    if (lang === 'en') {
      // English is baked in as fallback — load from file too
    }
    try {
      const res = await fetch(`/locales/${lang}.json`);
      if (!res.ok) throw new Error('not found');
      translations = await res.json();
    } catch {
      if (lang !== 'en') {
        try {
          const res = await fetch('/locales/en.json');
          translations = await res.json();
        } catch { translations = {}; }
      } else {
        translations = {};
      }
    }
  }

  function applyTranslations() {
    // data-i18n (text)
    $$('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const val = get(translations, key);
      if (val !== null) el.textContent = val;
    });
    // data-i18n-html (innerHTML — allows <em>)
    $$('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      const val = get(translations, key);
      if (val !== null) el.innerHTML = val;
    });
  }
})();

/* ─── Ahl al-Bayt Carousel ───────────────────────────────── */
(function initCarousel() {
  const track = document.getElementById('masumeen-track');
  const prev  = document.getElementById('masumeen-prev');
  const next  = document.getElementById('masumeen-next');
  const dotsEl= document.getElementById('masumeen-dots');
  if (!track) return;

  const cards = $$('.masumeen-card', track);
  const total = cards.length;
  let current = 0;
  let autoTimer;

  // Build dots
  cards.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'masumeen-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  });

  function getCardWidth() {
    if (!cards[0]) return 0;
    return cards[0].offsetWidth + parseFloat(getComputedStyle(track).gap || 24);
  }

  function goTo(idx) {
    current = (idx + total) % total;
    const offset = current * getCardWidth();
    // We translate the track manually
    track.style.transform = `translateX(-${offset}px)`;
    $$('.masumeen-dot', dotsEl).forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5500);
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));

  // Touch/swipe
  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  resetAuto();

  // Re-calc on resize
  window.addEventListener('resize', () => goTo(current), { passive: true });
})();

/* ─── Live Qibla Distance ────────────────────────────────── */
(function initQibla() {
  const btn      = document.getElementById('qiblaRevealBtn');
  const distNum  = document.getElementById('qiblaDistNum');
  const distLabel= document.getElementById('qiblaDistLabel');
  const locEl    = document.getElementById('qiblaLocation');
  const needle   = document.getElementById('qiblaNeedle');
  const compass  = document.getElementById('qiblaCompass');
  if (!btn) return;

  const MECCA_LAT = 21.3891;
  const MECCA_LON = 39.8579;

  function toRad(d) { return d * Math.PI / 180; }

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  function qiblaAngle(lat, lon) {
    const φ1 = toRad(lat);
    const φ2 = toRad(MECCA_LAT);
    const Δλ = toRad(MECCA_LON - lon);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  function animateCount(el, target, duration = 1800) {
    const start = performance.now();
    const startVal = 0;
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const val = Math.round(startVal + (target - startVal) * ease);
      el.textContent = val.toLocaleString();
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      distNum.textContent = get(translations, 'qibla.not_supported') || 'Geolocation not supported';
      return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Locating…';
    distNum.textContent = '…';

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const km    = haversine(lat, lon, MECCA_LAT, MECCA_LON);
        const angle = qiblaAngle(lat, lon);

        // Animate number
        animateCount(distNum, km);
        distLabel.textContent = (get(translations, 'qibla.distance_label') || 'km from the Holy Ka\'ba');

        // Compass needle
        needle.style.transform = `rotate(${angle}deg)`;
        compass.classList.add('active');

        // Location label
        locEl.textContent = `${lat.toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`;

        btn.disabled = false;
        btn.innerHTML = '<span>🔄</span> Recalculate';
      },
      err => {
        distNum.textContent = '—';
        locEl.textContent = err.code === 1
          ? (get(translations, 'qibla.permission_denied') || 'Location access denied')
          : (get(translations, 'qibla.location_error') || 'Could not determine location');
        btn.disabled = false;
        btn.innerHTML = '<span>📍</span> ' + (get(translations, 'qibla.btn_reveal') || 'Reveal My Distance');
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  });
})();

/* ─── Cookie Consent ─────────────────────────────────────── */
(function initCookies() {
  const banner  = document.getElementById('cookieBanner');
  const accept  = document.getElementById('cookieAccept');
  const decline = document.getElementById('cookieDecline');
  if (!banner) return;

  const key = 'ayara_cookies';

  if (!localStorage.getItem(key)) {
    // Show after short delay
    setTimeout(() => banner.classList.add('visible'), 900);
  }

  accept.addEventListener('click', () => {
    localStorage.setItem(key, 'accepted');
    banner.classList.remove('visible');
  });
  decline.addEventListener('click', () => {
    localStorage.setItem(key, 'declined');
    banner.classList.remove('visible');
  });
})();
