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

/* --- Smooth scroll --- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    const off = nav.offsetHeight + 8;
    window.scrollTo({ top: t.offsetTop - off, behavior: 'smooth' });
  });
});

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
