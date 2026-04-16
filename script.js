/* ============================================================
   CONTENT HEARTS — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ── Scroll Nav ─────────────────────────────────────────── */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile Menu ────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Fade-Up Animations ─────────────────────────────────── */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    fadeEls.forEach(el => observer.observe(el));
  }

  /* ── Count-Up Numbers ───────────────────────────────────── */
  const countEls = document.querySelectorAll('[data-count]');
  if (countEls.length) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el      = entry.target;
          const target  = parseFloat(el.dataset.count);
          const suffix  = el.dataset.suffix || '';
          const isFloat = target % 1 !== 0;
          const duration = 1800;
          const start = performance.now();

          const animate = (now) => {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            const value    = target * eased;
            el.textContent = (isFloat ? value.toFixed(1) : Math.round(value)) + suffix;
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
          countObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    countEls.forEach(el => countObserver.observe(el));
  }

  /* ── FAQ Accordion ──────────────────────────────────────── */
  document.querySelectorAll('.faq__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item   = trigger.closest('.faq__item');
      const body   = item.querySelector('.faq__body');
      const isOpen = trigger.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq__trigger.open').forEach(t => {
        t.classList.remove('open');
        t.closest('.faq__item').querySelector('.faq__body').style.maxHeight = '0';
      });

      // Open clicked if not already open
      if (!isOpen) {
        trigger.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

})();
