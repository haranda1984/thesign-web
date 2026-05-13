'use strict';

/* --- NAV scroll + botón arriba --- */
const nav = document.getElementById('nav');
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
  backTop?.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

/* --- Burger --- */
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');
burger?.addEventListener('click', () => {
  const open = burger.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  mobileNav.classList.toggle('open', open);
  mobileNav.setAttribute('aria-hidden', !open);
});
document.querySelectorAll('.m-link').forEach(l => {
  l.addEventListener('click', () => {
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', true);
  });
});

/* --- Snap scroll por secciones --- */
const sections = () => [...document.querySelectorAll('section[id]')];

function getSnapY(el) {
  const navH = nav.offsetHeight;
  const secH = el.offsetHeight;
  const vH   = window.innerHeight;
  // Centrar si la sección cabe en pantalla, sino alinear al top bajo el nav
  return secH < vH
    ? Math.max(0, el.offsetTop - navH - Math.max(0, (vH - navH - secH) / 2))
    : Math.max(0, el.offsetTop - navH);
}

let isSnapping = false;

function snapTo(el) {
  window.scrollTo({ top: getSnapY(el), behavior: 'smooth' });
}

// Links de navegación
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    isSnapping = true;
    snapTo(t);
    setTimeout(() => { isSnapping = false; }, 900);
  });
});

// Snap al cruzar el punto medio entre secciones (sin resorte al soltar)
let snapTimer = null;

// Retorna la sección a la que hay que snapear, o null si no aplica.
// Solo snaps cuando el scroll sobrepasa el punto medio entre dos snap-points.
function snapTarget() {
  const y  = window.scrollY;
  const ys = sections().map(getSnapY);
  const ss = sections();

  // Encontrar entre qué dos snap-points estamos
  for (let i = 0; i < ys.length - 1; i++) {
    const lo = ys[i];
    const hi = ys[i + 1];

    if (y > lo && y < hi) {
      const mid = (lo + hi) / 2;
      // Solo snap si ya cruzamos el punto medio (≥50% del camino al siguiente)
      if (y >= mid) return ss[i + 1];
      // Antes del punto medio → scroll libre, sin resorte
      return null;
    }
  }
  return null;
}

window.addEventListener('scroll', () => {
  if (isSnapping) return;
  clearTimeout(snapTimer);
  snapTimer = setTimeout(() => {
    const target = snapTarget();
    if (!target) return;
    isSnapping = true;
    snapTo(target);
    setTimeout(() => { isSnapping = false; }, 800);
  }, 150);
}, { passive: true });

/* --- Reveal on scroll --- */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.fade-up, .fade-right, .fade-left').forEach(el => observer.observe(el));

/* --- Counter --- */
function runCounter(el) {
  const target = +el.dataset.target;
  const dur = 1600;
  const start = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);
  const tick = now => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.floor(ease(p) * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

const cObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { runCounter(e.target); cObs.unobserve(e.target); } });
}, { threshold: 0.7 });
document.querySelectorAll('.cn[data-target]').forEach(el => cObs.observe(el));

/* --- Contact form --- */
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
form?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Enviando…';
  status.textContent = '';
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: new FormData(form)
    });
    const data = await res.json();
    if (data.success) {
      status.style.color = '#4ade80';
      status.textContent = '✓ Mensaje enviado. Te contactamos pronto.';
      form.reset();
    } else {
      status.style.color = 'var(--red)';
      status.textContent = '✗ Error al enviar. Intenta por WhatsApp.';
    }
  } catch {
    status.style.color = 'var(--red)';
    status.textContent = '✗ Sin conexión. Intenta por WhatsApp.';
  }
  btn.disabled = false;
  btn.textContent = 'Enviar mensaje →';
  setTimeout(() => status.textContent = '', 6000);
});
