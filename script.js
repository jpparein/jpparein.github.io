/* ═══════════════════════════════════════════════════════════
   SCRIPT — Jean-Philippe Parein Portfolio
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── NAVIGATION ─── */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const sections = document.querySelectorAll('.section, .hero');
  const navAnchors = document.querySelectorAll('.nav-links a');

  // Scroll state
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    nav.classList.toggle('scrolled', scrollY > 40);
    lastScroll = scrollY;
  }, { passive: true });

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile nav on link click
  navAnchors.forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Active section highlight
  const observerNav = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observerNav.observe(s));

  /* ─── SCROLL ANIMATIONS ─── */
  const animatedElements = document.querySelectorAll('[data-animate]');

  if (prefersReducedMotion) {
    animatedElements.forEach(el => el.classList.add('visible'));
  } else {
    const observerAnim = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observerAnim.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    animatedElements.forEach(el => observerAnim.observe(el));
  }

  /* ─── SMOOTH SCROLL ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  /* ─── CAROUSELS ─── */
  document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
    const viewport = wrapper.querySelector('.carousel-viewport');
    const prev = wrapper.querySelector('.carousel-prev');
    const next = wrapper.querySelector('.carousel-next');
    const dotsEl = wrapper.querySelector('.carousel-dots');

    if (!viewport || !prev || !next || !dotsEl) return;

    const isProject = viewport.id === 'games-carousel' || viewport.id === 'soft-carousel' || viewport.id === 'github-carousel';
    const isMedia = viewport.id === 'media-carousel';
    const CARDS_PER_PAGE = isProject || isMedia ? 3 : 6;
    const cardClass = isProject ? '.project-card' : isMedia ? '.media-card' : '.course-card';

    const allCards = [...viewport.querySelectorAll(cardClass)];
    allCards.reverse().forEach(card => viewport.appendChild(card));

    const cards = [...viewport.querySelectorAll(cardClass)];
    for (let i = 0; i < cards.length; i += CARDS_PER_PAGE) {
      const page = document.createElement('div');
      page.className = 'carousel-page';
      for (let j = i; j < Math.min(i + CARDS_PER_PAGE, cards.length); j++) {
        page.appendChild(cards[j]);
      }
      viewport.appendChild(page);
    }

    const pages = () => viewport.querySelectorAll('.carousel-page');

    function updateDots() {
      const p = pages();
      if (!p.length) return;
      const pageW = viewport.offsetWidth;
      const current = Math.round(viewport.scrollLeft / pageW);
      dotsEl.innerHTML = '';
      for (let i = 0; i < p.length; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === current ? ' active' : '');
        dot.setAttribute('aria-label', 'Page ' + (i + 1));
        dot.addEventListener('click', () => {
          viewport.scrollTo({ left: i * pageW, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
        dotsEl.appendChild(dot);
      }
    }

    prev.addEventListener('click', () => {
      viewport.scrollBy({ left: -viewport.offsetWidth, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    next.addEventListener('click', () => {
      viewport.scrollBy({ left: viewport.offsetWidth, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    viewport.addEventListener('scroll', updateDots, { passive: true });
    updateDots();
    window.addEventListener('resize', updateDots);
  });

  /* Contact form → mailto */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const to = 'Pareinjeanphilippe@outlook.fr';
      const name = contactForm.querySelector('#name').value.trim();
      const email = contactForm.querySelector('#email').value.trim();
      const subject = contactForm.querySelector('#subject').value.trim() || 'Message depuis le portfolio';
      const message = contactForm.querySelector('#message').value.trim();
      const body = `Nom : ${name}\nEmail : ${email}\n\n${message}`;
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

})();
