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

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    lastScroll = window.scrollY;
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navAnchors.forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  function updateActiveNav() {
    const marker = window.innerHeight * 0.32;
    let activeId = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom > marker) activeId = section.id;
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + activeId);
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  /* ─── SCROLL ANIMATIONS ─── */
  const animatedElements = document.querySelectorAll('[data-animate]');
  if (prefersReducedMotion) {
    animatedElements.forEach(el => el.classList.add('visible'));
  } else {
    const observerAnim = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => entry.target.classList.add('visible'), delay);
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

  /* ─── TIMELINE TOGGLE ─── */
  const toggleBtn = document.getElementById('timeline-toggle');
  const olderBlock = document.getElementById('timeline-older');
  if (toggleBtn && olderBlock) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = olderBlock.style.display === 'none';
      olderBlock.style.display = isHidden ? '' : 'none';
      toggleBtn.textContent = isHidden ? 'Voir moins ↑' : 'Voir plus ↓';
    });
  }

  /* ─── CAROUSELS ─── */
  document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
    const viewport = wrapper.querySelector('.carousel-viewport');
    const prev = wrapper.querySelector('.carousel-prev');
    const next = wrapper.querySelector('.carousel-next');
    const dotsEl = wrapper.querySelector('.carousel-dots');

    if (!viewport || !prev || !next || !dotsEl) return;

    const sectionTitle = wrapper.previousElementSibling?.textContent?.trim() || 'Carrousel';
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', sectionTitle);
    viewport.setAttribute('tabindex', '0');

    const isFormations = viewport.id === 'course-carousel';
    const isIntervention = viewport.id.startsWith('intervention-carousel');
    let cardClass = '.project-card';
    if (isFormations) cardClass = '.course-card';
    else if (isIntervention) cardClass = '.intervention-card';
    else if (viewport.querySelector('.media-card')) cardClass = '.media-card';

    const allCards = [...viewport.querySelectorAll(cardClass)];
    allCards.reverse().forEach(card => viewport.appendChild(card));
    const cards = [...viewport.querySelectorAll(cardClass)];

    let currentPage = 0;
    let programmaticScroll = false;
    const hasSmooth = wrapper.hasAttribute('data-smooth');
    const isMobile = () => window.innerWidth <= 768;

    function getCardsPerPage() {
      if (isFormations) return isMobile() ? 2 : 6;
      if (isIntervention) return isMobile() ? 2 : 6;
      return isMobile() ? 2 : 3;
    }

    function buildPages() {
      viewport.querySelectorAll('.carousel-page').forEach(p => p.remove());
      const perPage = getCardsPerPage();
      for (let i = 0; i < cards.length; i += perPage) {
        const page = document.createElement('div');
        page.className = 'carousel-page';
        cards.slice(i, i + perPage).forEach(c => page.appendChild(c));
        viewport.appendChild(page);
      }
      currentPage = Math.min(currentPage, Math.max(0, getPages().length - 1));
      updateView();
    }

    function getPages() {
      return viewport.querySelectorAll('.carousel-page');
    }

    function updateView() {
      const p = getPages();
      if (!p.length) return;

      currentPage = Math.max(0, Math.min(currentPage, p.length - 1));
      p.forEach((pg, i) => {
        pg.setAttribute('aria-label', `Page ${i + 1} sur ${p.length}`);
        pg.setAttribute('aria-hidden', i === currentPage ? 'false' : 'true');
      });

      if (isMobile()) {
        p.forEach((pg, i) => pg.classList.toggle('active', i === currentPage));
      } else {
        programmaticScroll = true;
        viewport.scrollTo({ left: currentPage * viewport.offsetWidth, behavior: hasSmooth ? 'smooth' : 'auto' });
        setTimeout(() => { programmaticScroll = false; }, hasSmooth ? 400 : 50);
      }

      dotsEl.innerHTML = '';
      for (let i = 0; i < p.length; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === currentPage ? ' active' : '');
        dot.setAttribute('aria-label', `Afficher la page ${i + 1} sur ${p.length}`);
        if (i === currentPage) dot.setAttribute('aria-current', 'true');
        dot.addEventListener('click', () => { currentPage = i; updateView(); });
        dotsEl.appendChild(dot);
      }

      const status = document.createElement('span');
      status.className = 'carousel-status';
      status.setAttribute('aria-live', 'polite');
      status.textContent = `${currentPage + 1} / ${p.length}`;
      dotsEl.appendChild(status);

      prev.disabled = currentPage === 0;
      next.disabled = currentPage === p.length - 1;
    }

    function goTo(page) {
      const p = getPages();
      currentPage = Math.max(0, Math.min(page, p.length - 1));
      updateView();
    }

    prev.addEventListener('click', () => goTo(currentPage - 1));
    next.addEventListener('click', () => goTo(currentPage + 1));
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(currentPage - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(currentPage + 1);
      }
    });

    let touchStartX = 0;
    viewport.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goTo(currentPage + (diff > 0 ? 1 : -1));
      }
    }, { passive: true });

    if (!isMobile()) {
      viewport.addEventListener('scroll', () => {
        if (programmaticScroll) return;
        const page = Math.round(viewport.scrollLeft / viewport.offsetWidth);
        if (page !== currentPage) {
          currentPage = page;
          updateView();
        }
      }, { passive: true });
    }

    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      const crossed = (window.innerWidth <= 768 && lastWidth > 768) || (window.innerWidth > 768 && lastWidth <= 768);
      lastWidth = window.innerWidth;
      if (crossed) currentPage = 0;
      buildPages();
    });

    buildPages();
  });

  /* Copie rapide de l'adresse email */
  const copyEmail = document.getElementById('copyEmail');
  const copyStatus = document.getElementById('copyStatus');
  if (copyEmail && copyStatus) {
    copyEmail.addEventListener('click', async () => {
      const email = copyEmail.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        copyStatus.textContent = 'Adresse copiée.';
      } catch (_) {
        const field = document.createElement('textarea');
        field.value = email;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        field.remove();
        copyStatus.textContent = 'Adresse copiée.';
      }
      setTimeout(() => { copyStatus.textContent = ''; }, 2500);
    });
  }

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
