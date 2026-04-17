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

  /* ── Gallery Drag Scroll ────────────────────────────────── */
  let galleryMoved = false; // shared with modal click handler
  const gallery = document.getElementById('workGallery');
  if (gallery) {
    let isDown = false, startX = 0, scrollLeft = 0;

    gallery.addEventListener('mousedown', e => {
      isDown = true; galleryMoved = false;
      gallery.classList.add('dragging');
      startX = e.pageX - gallery.getBoundingClientRect().left;
      scrollLeft = gallery.scrollLeft;
    });
    document.addEventListener('mouseup', () => {
      isDown = false;
      gallery.classList.remove('dragging');
    });
    gallery.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - gallery.getBoundingClientRect().left;
      const walk = (x - startX) * 1.4;
      if (Math.abs(walk) > 4) galleryMoved = true;
      gallery.scrollLeft = scrollLeft - walk;
    });

    const itemW = () => (gallery.querySelector('.cs-gallery-item')?.offsetWidth || 255) + 12;
    document.getElementById('galleryPrev')?.addEventListener('click', () => {
      gallery.scrollBy({ left: -itemW() * 2, behavior: 'smooth' });
    });
    document.getElementById('galleryNext')?.addEventListener('click', () => {
      gallery.scrollBy({ left: itemW() * 2, behavior: 'smooth' });
    });
  }

  /* ── Work Modal ─────────────────────────────────────────── */
  const modal         = document.getElementById('workModal');
  const modalClient   = document.getElementById('workModalClient');
  const modalDesc     = document.getElementById('workModalDesc');
  const modalVideoWrap= document.getElementById('workModalVideo');
  const modalClose    = document.getElementById('workModalClose');
  const modalBackdrop = document.getElementById('workModalBackdrop');

  function buildEmbed(platform, videoId) {
    if (!platform || !videoId) return '';
    if (platform === 'youtube') {
      return `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&showinfo=0&iv_load_policy=3&disablekb=1" frameborder="0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    }
    if (platform === 'tiktok') {
      return `<iframe src="https://www.tiktok.com/embed/v2/${videoId}" frameborder="0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    }
    return '';
  }

  function openModal(client, desc, platform, videoId) {
    if (!modal) return;
    modalClient.textContent = client || '';
    modalDesc.textContent   = desc   || '';
    // Switch portrait layout for TikTok
    modal.classList.toggle('is-tiktok', platform === 'tiktok');
    if (modalVideoWrap) {
      const embed = buildEmbed(platform, videoId);
      modalVideoWrap.innerHTML = embed ||
        '<div class="work-modal__video-placeholder"><span class="work-modal__video-note">Video coming soon</span></div>';
    }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.classList.remove('is-tiktok');
    document.body.style.overflow = '';
    if (modalVideoWrap) modalVideoWrap.innerHTML = ''; // stop video
  }

  // Gallery tile + testimonial vtcard clicks (delegated to handle dynamically injected tiles)
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.cs-gallery-item[data-client]');
    if (item) {
      if (galleryMoved) { galleryMoved = false; return; }
      openModal(item.dataset.client, item.dataset.desc, item.dataset.videoPlatform, item.dataset.videoId);
      return;
    }
    const card = e.target.closest('.vtcard[data-video-platform]');
    if (card) {
      openModal(card.dataset.client, card.dataset.desc, card.dataset.videoPlatform, card.dataset.videoId);
    }
  });

  modalClose?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ── Case Study Modal ───────────────────────────────────── */
  const CASE_STUDIES = {
    'yi-zun-noodle': {
      cat: "F&B · Halal Chinese",
      name: "Yi Zun Noodle",
      tag: "From zero TikTok presence to viral Chinese-Muslim founder story.",
      image: "images/case%20study/Yi%20Zun.png",
      challenge: "Mdm Aishah was unsure how social media could help her business. They were only posting occasional static photos, with little to no videos, and no TikTok presence.",
      did: "We showcased Mdm Aishah's journey as an F&B founder, highlighting her strong Chinese-Muslim culture. The storytelling earned free media coverage from The Smart Local and Mothership SG.",
      metrics: [
        { num: "175K<span>–</span>245K", label: "Organic views on viral posts", hero: true },
        { num: "1,650<span>+</span>", label: "New TikTok followers in a month" },
        { num: "32K<span>–</span>70K", label: "Views per post, no boost" }
      ],
      note: "Timeline: <strong>3 months</strong> · Organic + free press coverage",
      videos: [
        { id: "QoT4f02STs0", label: "Founder Story · 175K views", client: "Yi Zun Noodle", desc: "Founder story video featuring Mdm Aishah and her journey from Qinghai to Singapore — deeply personal storytelling that built real connection with their growing audience." },
        { id: "rFt_YgT9x20", label: "Client Testimonial", client: "Yi Zun Noodle", desc: "Founder testimonial with Mdm Aishah sharing how her first video went viral and changed her business." },
        { id: "BgSUKdBC_uI", label: "BTS + Context", client: "Yi Zun Noodle", desc: "Behind-the-scenes look at the Yi Zun brand work — part of the Content Hearts showreel." }
      ]
    },
    'seoul-restaurant-group': {
      cat: "F&B · Korean Steakhouse",
      name: "Seoul Restaurant Group",
      tag: "Two restaurants. Two distinct identities. One cohesive social playbook.",
      image: "images/case%20study/Seoul%20&%20So.png",
      challenge: "Rhee approached us looking for an agency who could bring his brands' vision to life. He runs two restaurants — Seoul Restaurant and Seoul & So — with very different brand directions and vibes that needed careful execution.",
      did: "We translated each restaurant's unique brand identity into social content and built a dedicated social media brand guide and visual tone for each.",
      metrics: [
        { num: "2,355<span>+</span>", label: "New Seoul & So followers in <2 months", hero: true },
        { num: "20K<span>–</span>60K", label: "Views per post, no boost" },
        { num: "2", label: "Distinct brand guides built" }
      ],
      note: "Timeline: <strong>2 months</strong> · New brand launch from zero",
      videos: [
        { id: "8Ozc9R9AN1s", label: "Launch Ad · 57K views", client: "Seoul & So", desc: "AI-enhanced launch ad creative for Seoul & So at the National Gallery Singapore. Bold visuals, sharp cuts, and a brand voice that's impossible to ignore." },
        { id: "sPFUpjZxyvE", label: "Atmosphere Piece · 58K views", client: "Seoul & So", desc: "A cinematic walk through Seoul & So — capturing the warmth, aesthetic, and energy of the space." },
        { id: "BgSUKdBC_uI", label: "Seoul Restaurant · 55K views", client: "Seoul Restaurant", desc: "Brand content for Seoul Restaurant — traditional Korean BBQ storytelling that sits distinct from Seoul & So's modern tone." }
      ]
    },
    'annies-pantry': {
      cat: "Premium Pet Food",
      name: "Annie's Pantry",
      tag: "Ad creatives that outperformed the industry benchmark by nearly 5×.",
      image: "images/case%20study/Annie's%20Pantry.png",
      challenge: "Vincent and Eric came with two specific asks: highly converting ad creatives that sat inside their premium brand world, with a strict visual and tonal guide to adhere to.",
      did: "We built a social media brand guide aligned to their premium positioning and produced a library of paid-ready creatives optimised for conversion.",
      metrics: [
        { num: "12.12<span>×</span>", label: "Average Purchase ROAS (industry std: 2.5×)", hero: true },
        { num: "20<span>×+</span>", label: "Highest performing creative ROAS" },
        { num: "1<span>st</span>", label: "Month to hit target KPIs" }
      ],
      note: "Timeline: <strong>1 month</strong> · Paid social + brand guide",
      videos: [
        { id: "b4CFDly1ulE", label: "Ad Creative · 20× ROAS", client: "Annie's Pantry", desc: "Premium pet food ad creative — on-brand storytelling designed to convert at scale while respecting their strict visual guidelines." },
        { id: "UIdBLEUy148", label: "Organic Content", client: "Annie's Pantry", desc: "Organic social content that supports the paid creative — maintaining brand consistency across the funnel." },
        { id: "BgSUKdBC_uI", label: "Brand Story", client: "Annie's Pantry", desc: "Brand storytelling video positioning Annie's Pantry as the premium handcrafted pet food choice." }
      ]
    },
    'moneyowl': {
      cat: "Financial Education",
      name: "MoneyOwl",
      tag: "Making financial literacy go viral in 48 hours.",
      image: "images/case%20study/MoneyOwl.png",
      challenge: "MoneyOwl is a financial enterprise with a social mission and a lean team. They needed a partner to turn abstract financial topics into content that actually held attention.",
      did: "We translated sensitive, abstract financial literacy topics into formats the general public engages with — driving record-breaking organic reach and deep watch time.",
      metrics: [
        { num: "183K", label: "Organic views on one post in 48 hours", hero: true },
        { num: "260K", label: "Top post views (TikTok)" },
        { num: "2K<span>+</span>", label: "Likes, comments, saves & shares on a single post" }
      ],
      note: "Timeline: <strong>1 month</strong> · 5–6-digit views sustained across IG & TikTok",
      videos: [
        { id: "KzkTCeR8lqg", label: "Street Series · 260K views", client: "MoneyOwl", desc: "Street interview series asking the public candid questions about their financial knowledge — relatable, engaging content that made personal finance feel approachable." },
        { id: "BgSUKdBC_uI", label: "Educational Series", client: "MoneyOwl", desc: "Financial education content tailored for the general public — explaining investing and budgeting with real-life framing." },
        { id: "sPFUpjZxyvE", label: "Budgeting · 75K views", client: "MoneyOwl", desc: "Budgeting explainer video — one of the posts that hit 183K organic views in 48 hours." }
      ]
    },
    'axiom-education': {
      cat: "Education · JC & IB",
      name: "Axiom Education",
      tag: "Content that students actually relate to — and enrollments that follow.",
      image: "images/case%20study/Axiom.webp",
      challenge: "When Ashley from Axiom engaged us, they were struggling with their previous agency — lots of ideas, no clarity on what worked. They needed to lift engagement, build brand familiarity, and promote their holiday program.",
      did: "We shaped a content voice that spoke directly to JC and IB students, producing educational and brand content they relate to and enjoy.",
      metrics: [
        { num: "200<span>%+</span>", label: "Enrollment rate lift vs previous year", hero: true },
        { num: "459.4<span>%</span>", label: "Post views increase (to 22K)" },
        { num: "693<span>%</span>", label: "Profile views increase" }
      ],
      note: "Timeline: <strong>10 months</strong> · Follower growth on TikTok: +5,100%",
      videos: [
        { id: "BgSUKdBC_uI", label: "Academic Explainer · 23K views", client: "Axiom Education", desc: "A-Level explainer content — making dense academic topics engaging for JC and IB students." },
        { id: "KzkTCeR8lqg", label: "Tutor Interviews · 20K views", client: "Axiom Education", desc: "Tutor interview series that humanises the brand and makes Axiom feel approachable to prospective students and parents." },
        { id: "sPFUpjZxyvE", label: "Brand BTS", client: "Axiom Education", desc: "Behind-the-scenes of the Axiom brand refresh — the work that powered a 200%+ enrollment lift." }
      ]
    },
    'supergreen': {
      cat: "F&B · Healthy Food",
      name: "Supergreen",
      tag: "From \"just another salad shop\" to your friendly balanced meal of choice.",
      image: "images/case%20study/supergreen.avif",
      challenge: "Shao Rong was unsure how social media could help his business. They were posting occasional static photos with little video content and no TikTok presence.",
      did: "We repositioned Supergreen from a generic salad shop into a friendly balanced-meal destination — humanising the brand with their staff and a dash of humour.",
      metrics: [
        { num: "5<span>×</span>", label: "Total organic views vs before", hero: true },
        { num: "91K", label: "Total post views in a month" },
        { num: "10K<span>–</span>40K", label: "Views per post, no boost" }
      ],
      note: "Timeline: <strong>3 months</strong> · Total sales increased since engaging",
      videos: [
        { id: "BgSUKdBC_uI", label: "Recipe Video · 38K views", client: "Supergreen", desc: "A viral recipe video that recast Supergreen as a fun, approachable balanced meal option — not just another salad shop." },
        { id: "sPFUpjZxyvE", label: "Staff Series", client: "Supergreen", desc: "Staff-led content humanising the brand — making Supergreen feel warm and personable rather than transactional." },
        { id: "b4CFDly1ulE", label: "Menu Highlight", client: "Supergreen", desc: "Menu highlight video positioning Supergreen as the go-to balanced meal choice in the CBD." }
      ]
    },
    'the-write-connection': {
      cat: "Education · English Language",
      name: "The Write Connection",
      tag: "Teaching an existing marketing team how to do social — then watching leads climb.",
      image: "images/case%20study/The%20Write%20Connection.png",
      challenge: "TWC already had an in-house marketing department, but the team was not adept in social media. They had been doing mostly static posts and needed a real social strategy.",
      did: "We ran the strategy, produced the content, and upskilled their team along the way — so they could eventually produce the strategy in-house.",
      metrics: [
        { num: "150<span>%+</span>", label: "Lead increase — same ad spend as previous year", hero: true },
        { num: "102.2<span>%</span>", label: "Follower growth vs before" },
        { num: "52.8<span>%</span>", label: "Post views increase (86K total)" }
      ],
      note: "Timeline: <strong>2 months</strong> · Plus internal team upskilling",
      videos: [
        { id: "BgSUKdBC_uI", label: "Parent Series", client: "The Write Connection", desc: "Parent-focused content that generated leads — a confession format addressing the real anxieties parents have around their children's education." },
        { id: "KzkTCeR8lqg", label: "Student Stories", client: "The Write Connection", desc: "Student-led content showing real classroom stories — content that made TWC feel human and warm rather than transactional." },
        { id: "sPFUpjZxyvE", label: "Myth-Busting Series", client: "The Write Connection", desc: "Myth-busting series addressing common misconceptions about learning English — educational and shareable content." }
      ]
    },
    'esperto-paintworks': {
      cat: "Home Services · Painting",
      name: "Esperto Paintworks",
      tag: "Positioning a painting company as <em>the</em> expert — not another before/after account.",
      image: "images/case%20study/Esperto.jpg",
      challenge: "Rainie and Shaune had been with another social agency but were unsatisfied with one-dimensional before/after videos that gave no real context.",
      did: "We solidified Esperto's positioning as the expert in painting services — educational, storytelling content that kept them top-of-mind for anyone searching for a painter in Singapore.",
      metrics: [
        { num: "10K<span>–</span>75K", label: "Organic views on multiple viral posts", hero: true },
        { num: "64<span>%</span>", label: "Accounts engaged lift (to 1,243)" },
        { num: "0<span>$</span>", label: "Boost spend on viral posts" }
      ],
      note: "Timeline: <strong><6 months</strong> · Steady leads through DMs, no paid spend",
      videos: [
        { id: "BgSUKdBC_uI", label: "Painter Interview · 75K views", client: "Esperto Paintworks", desc: "'Interview with our painter' series — humanising the trade and giving painting work real context beyond before/after shots." },
        { id: "j8GZ1MowBrE", label: "Expert Series · 49K views", client: "Esperto Paintworks", desc: "Educational content on common wall problems — chalky walls, mouldy walls — that positioned Esperto as the real expert." },
        { id: "sPFUpjZxyvE", label: "Storytelling · 46K views", client: "Esperto Paintworks", desc: "Before/after with real storytelling — context, problem, solution — rather than just the finished wall." }
      ]
    },
    'style-degree': {
      cat: "Lifestyle · Home Essentials",
      name: "Style Degree",
      tag: "Putting the humans back in a brand that was missing them.",
      image: "images/case%20study/Styledegree.png",
      challenge: "Sheryun and Chuan An already had a big following, but creator-produced content lacked consistency and the humans behind the brand were missing — making it hard for people to connect.",
      did: "We rolled out a social media brand guide for consistency, and brought the founders into the BTS content to humanise the brand.",
      metrics: [
        { num: "10K<span>–</span>30K", label: "Organic views per viral post", hero: true },
        { num: "91.3K", label: "Existing followers now engaging deeper" },
        { num: "1", label: "New brand guide shipped" }
      ],
      note: "Timeline: <strong><3 months</strong> · Consistent look + humanised storytelling",
      videos: [
        { id: "UIdBLEUy148", label: "CNY Feature · 17K views", client: "Style Degree", desc: "Art-directed CNY collection feature for the ClarityTwist jars — visually elevated, seasonally relevant, drove both engagement and sales." },
        { id: "BgSUKdBC_uI", label: "Founder BTS", client: "Style Degree", desc: "Founder BTS video with Sheryun and Chuan An — putting the humans behind the brand front and centre." },
        { id: "b4CFDly1ulE", label: "Pop-up Feature · 11K views", client: "Style Degree", desc: "March Pop-up brand activation content — showcasing the Style Degree retail presence and community." }
      ]
    },
    'iyla-collective': {
      cat: "Beauty & Skincare",
      name: "IYLA Collective",
      tag: "Re-shooting international brand content for a Singapore audience.",
      image: "images/case%20study/Iyla.png",
      challenge: "Yi Ying needed branded content for the Singapore market. Her portfolio brands came from Australia and Europe — and a lot of their existing marketing videos weren't a fit for local audiences.",
      did: "We built a premium library of creative assets (paid + organic), all on-brand and catered to Singapore, and supported successful product launches and a rebrand along the way.",
      metrics: [
        { num: "51.1<span>%</span>", label: "Reach improvement vs before", hero: true },
        { num: "3<span>+</span>", label: "Successful product launches supported" },
        { num: "1", label: "Full rebrand executed" }
      ],
      note: "Timeline: <strong><8 months</strong> · Increased sales + engagement across the portfolio",
      videos: [
        { id: "GOm_QQtFgMA", label: "Brand Launch · 56K views", client: "IYLA Collective", desc: "Brand launch lifestyle video featuring tween models in a vibrant, on-brand shoot that introduced the label with confidence and personality." },
        { id: "SCW975TQxXU", label: "Anniversary Film · 12K views", client: "IYLA Collective", desc: "Anniversary video art-directed and shot entirely in-house at the Content Hearts studio — reflecting the brand's growth and identity." },
        { id: "BgSUKdBC_uI", label: "Product Hero · 9.7K views", client: "IYLA Collective", desc: "Product hero shot tailored for the Singapore market — on-brand asset built for both organic and paid use." }
      ]
    }
  };

  function esc(str) {
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  function renderCaseStudy(cs) {
    const metricsHtml = cs.metrics.map(m =>
      `<div class="case-modal__metric${m.hero ? ' case-modal__metric--hero' : ''}">
         <div class="case-modal__metricNum">${m.num}</div>
         <div class="case-modal__metricLabel">${esc(m.label)}</div>
       </div>`
    ).join('');

    const videosHtml = cs.videos.map(v =>
      `<div class="cs-gallery-item" data-client="${esc(v.client)}" data-desc="${esc(v.desc)}" data-video-platform="youtube" data-video-id="${v.id}">
         <img src="https://img.youtube.com/vi/${v.id}/maxresdefault.jpg" alt="${esc(v.label)}" onerror="this.src='https://img.youtube.com/vi/${v.id}/hqdefault.jpg'">
         <div class="cs-gallery-item__overlay"><span class="cs-gallery-item__client">${esc(v.label)}</span></div>
       </div>`
    ).join('');

    return `
      <div class="case-modal__hero">
        <img src="${cs.image}" alt="${esc(cs.name)}">
        <div class="case-modal__heroText">
          <span class="case-modal__cat">${esc(cs.cat)}</span>
          <h2 class="case-modal__name">${esc(cs.name)}</h2>
          <p class="case-modal__tag">${cs.tag}</p>
        </div>
      </div>
      <div class="case-modal__content">
        <div class="case-modal__storyGrid">
          <div class="case-modal__storyBlock">
            <h3>The challenge</h3>
            <p>${esc(cs.challenge)}</p>
          </div>
          <div class="case-modal__storyBlock">
            <h3>What we did</h3>
            <p>${esc(cs.did)}</p>
          </div>
        </div>
        <div class="case-modal__metrics">${metricsHtml}</div>
        <div class="case-modal__note">${cs.note}</div>
        <h3 class="case-modal__videosTitle">Video samples</h3>
        <div class="case-modal__videos">${videosHtml}</div>
        <div class="case-modal__cta">
          <a href="contact.html" class="btn btn--dark">Work with us</a>
        </div>
      </div>
    `;
  }

  const caseModal     = document.getElementById('caseModal');
  const caseModalBody = document.getElementById('caseModalBody');
  const caseModalClose= document.getElementById('caseModalClose');
  const caseModalBd   = document.getElementById('caseModalBackdrop');

  function openCaseModal(id) {
    const cs = CASE_STUDIES[id];
    if (!cs || !caseModal) return;
    caseModalBody.innerHTML = renderCaseStudy(cs);
    caseModalBody.scrollTop = 0;
    caseModal.classList.add('open');
    caseModal.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }
  function closeCaseModal() {
    if (!caseModal) return;
    caseModal.classList.remove('open');
    if (caseModalBody) caseModalBody.innerHTML = '';
    if (!modal || !modal.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('.case-tile[data-case-id]').forEach(tile => {
    tile.addEventListener('click', () => openCaseModal(tile.dataset.caseId));
  });
  caseModalClose?.addEventListener('click', closeCaseModal);
  caseModalBd?.addEventListener('click', closeCaseModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && caseModal?.classList.contains('open') && !modal?.classList.contains('open')) {
      closeCaseModal();
    }
  });

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
