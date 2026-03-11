/* ============================================================
   AYARA — Shared i18n + Language Switcher
   Included on all pages except the landing page (which uses main.js)
   OakDev & AI AB © 2026
   ============================================================ */
'use strict';

let currentLang  = 'en';
let translations = {};
const RTL_LANGS  = ['ar', 'fa', 'ur'];
const LANG_META  = {
  en: { flag: '🇬🇧', code: 'EN' },
  ar: { flag: '🇸🇦', code: 'AR' },
  fa: { flag: '🇮🇷', code: 'FA' },
  ur: { flag: '🇵🇰', code: 'UR' },
  tr: { flag: '🇹🇷', code: 'TR' },
  id: { flag: '🇮🇩', code: 'ID' },
  fr: { flag: '🇫🇷', code: 'FR' },
  az: { flag: '🇦🇿', code: 'AZ' },
};

function get(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
}

const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ─── Stars / Particles (shared) ───────────────────────── */
(function initStars() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkStar() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.012 + 0.004,
      phase: Math.random() * Math.PI * 2,
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
      ctx.fillStyle = s.sat ? `hsla(${s.hue},${s.sat}%,75%,${a})` : `rgba(255,255,255,${a})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize(); populate(); draw();
  new ResizeObserver(() => { resize(); populate(); }).observe(document.body);
})();

/* ─── Nav Hamburger (shared) ────────────────────────────── */
(function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger) return;

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
})();

/* ─── Scroll Animations (shared) ───────────────────────── */
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

  [...document.querySelectorAll('.animate-on-scroll')].forEach(el => obs.observe(el));
})();

/* ─── Language Switcher ─────────────────────────────────── */
(function initLang() {
  const btn      = document.getElementById('langBtn');
  const dropdown = document.getElementById('langDropdown');
  const flagEl   = document.getElementById('langFlag');
  const codeEl   = document.getElementById('langCode');
  if (!btn) return;

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

  const saved       = localStorage.getItem('ayara_lang');
  const browserLang = (navigator.language || 'en').slice(0, 2).toLowerCase();
  const preferred   = saved || (LANG_META[browserLang] ? browserLang : 'en');
  setLanguage(preferred);

  async function setLanguage(lang) {
    if (!LANG_META[lang]) lang = 'en';
    currentLang = lang;
    localStorage.setItem('ayara_lang', lang);

    const meta = LANG_META[lang];
    flagEl.textContent = meta.flag;
    codeEl.textContent = meta.code;

    $$('[data-lang]', dropdown).forEach(o => {
      o.classList.toggle('active', o.dataset.lang === lang);
      o.setAttribute('aria-selected', o.dataset.lang === lang);
    });

    const isRTL = RTL_LANGS.includes(lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    await loadTranslations(lang);
    applyTranslations();
  }

  async function loadTranslations(lang) {
    try {
      const res = await fetch(`/locales/${lang}.json`);
      if (!res.ok) throw new Error();
      translations = await res.json();
    } catch {
      if (lang !== 'en') {
        try {
          const res = await fetch('/locales/en.json');
          translations = await res.json();
        } catch { translations = {}; }
      } else { translations = {}; }
    }
  }

  function applyTranslations() {
    $$('[data-i18n]').forEach(el => {
      const val = get(translations, el.dataset.i18n);
      if (val !== null) el.textContent = val;
    });
    $$('[data-i18n-html]').forEach(el => {
      const val = get(translations, el.dataset.i18nHtml);
      if (val !== null) el.innerHTML = val;
    });
    $$('[data-i18n-placeholder]').forEach(el => {
      const val = get(translations, el.dataset.i18nPlaceholder);
      if (val !== null) el.placeholder = val;
    });
  }
})();
