(() => {
  'use strict';

  const gate = document.getElementById('age-gate');
  const ageCard = document.getElementById('age-card');
  const deniedCard = document.getElementById('age-denied');
  const yesButton = document.getElementById('age-yes');
  const noButton = document.getElementById('age-no');
  const site = document.getElementById('site-shell');
  const menuButton = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');
  const year = document.getElementById('year');
  const consentKey = 'vapsolo-age-confirmed';
  const consentLifetime = 30 * 24 * 60 * 60 * 1000;

  const safeStorage = {
    read(key, session = false) {
      try { return (session ? sessionStorage : localStorage).getItem(key); } catch (_) { return null; }
    },
    write(key, value, session = false) {
      try { (session ? sessionStorage : localStorage).setItem(key, value); } catch (_) { /* Storage may be unavailable. */ }
    }
  };

  function unlockSite() {
    if (!gate || !site) return;
    gate.hidden = true;
    site.removeAttribute('aria-hidden');
    site.removeAttribute('inert');
    document.body.classList.remove('is-locked');
  }

  function showGate() {
    if (!gate || !site) return;
    gate.hidden = false;
    site.setAttribute('aria-hidden', 'true');
    site.setAttribute('inert', '');
    document.body.classList.add('is-locked');
    window.setTimeout(() => yesButton?.focus(), 0);
  }

  function showDenied() {
    if (!ageCard || !deniedCard) return;
    ageCard.hidden = true;
    deniedCard.hidden = false;
    safeStorage.write('vapsolo-age-denied', '1', true);
    deniedCard.setAttribute('tabindex', '-1');
    deniedCard.focus();
  }

  const savedAt = Number(safeStorage.read(consentKey));
  const isConfirmed = Number.isFinite(savedAt) && savedAt > 0 && Date.now() - savedAt < consentLifetime;

  if (isConfirmed) {
    unlockSite();
  } else {
    showGate();
    if (safeStorage.read('vapsolo-age-denied', true) === '1') showDenied();
  }

  yesButton?.addEventListener('click', () => {
    safeStorage.write(consentKey, String(Date.now()));
    unlockSite();
    document.getElementById('contenido')?.focus({ preventScroll: true });
  });

  noButton?.addEventListener('click', showDenied);

  gate?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') event.preventDefault();
    if (event.key !== 'Tab' || gate.hidden) return;
    const focusable = [...gate.querySelectorAll('button:not([hidden]), [tabindex="0"]')].filter((element) => !element.closest('[hidden]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  menuButton?.addEventListener('click', () => {
    if (!nav) return;
    const open = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('.sr-only').textContent = open ? 'Cerrar menú' : 'Abrir menú';
  });

  nav?.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuButton?.setAttribute('aria-expanded', 'false');
      const label = menuButton?.querySelector('.sr-only');
      if (label) label.textContent = 'Abrir menú';
    });
  });

  document.querySelectorAll('.accordion details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.accordion details[open]').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });

  if (year) year.textContent = String(new Date().getFullYear());
})();
