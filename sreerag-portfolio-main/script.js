/* ==========================================================================
   SREERAG RAJEEVAN — PORTFOLIO ENGINE
   121-Frame Canvas Scroll Animation + Dynamic Sections Integration
   ========================================================================== */

(() => {
  // ---------------------------------------------------------------------------
  // 1. PRESERVED SCROLL ANIMATION ENGINE
  // ---------------------------------------------------------------------------
  const TOTAL_FRAMES = 121;          // sree.0001.webp ... sree.0121.webp in /tempp
  const FOLDER = 'tempp';
  // Bump when the frame images change. Frames are cached for a year (see _headers),
  // so a new number is what makes returning visitors download the new ones.
  const FRAME_VERSION = '2';
  const FRAME_W = 1916;              // full frame size; every set is laid out against this
  const FRAME_H = 1080;
  // Portrait phones get tempp/m/: every 2nd frame, cropped to the slice they can see.
  // Keep CROP_X / CROP_W identical to scripts/make-mobile-frames.py.
  const CROP_X = 470;
  const CROP_W = 850;
  const MAX_IN_FLIGHT = 6;           // frame downloads running at once
  const BLEND_STEPS = 6;             // positions drawn between two frames (cross-fade smoothness)

  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const LERP_FACTOR = isTouch ? 0.28 : 0.12;

  const mq = (q) => (window.matchMedia ? window.matchMedia(q) : { matches: false });
  // Other phones and tablets use the full frames but only every 2nd one.
  const isLightDevice = window.matchMedia
    ? mq('(max-width: 768px), (pointer: coarse)').matches
    : isTouch;
  // Visitors who ask their system to reduce motion get one still frame (the last,
  // front-facing portrait) instead of a scroll-scrubbed animation.
  const prefersReducedMotion = mq('(prefers-reduced-motion: reduce)').matches;
  // Must match the media attributes on the hero <link rel="preload"> tags in index.html.
  const PHONE_PORTRAIT_QUERY = '(max-width: 768px) and (max-aspect-ratio: 78/100)';

  const canvas = document.getElementById('canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  function makeSet(isPhone) {
    const step = isPhone || isLightDevice ? 2 : 1;
    return {
      isPhone,
      step,
      count: prefersReducedMotion ? 1 : Math.ceil(TOTAL_FRAMES / step),
      images: [],
      order: null,
      next: 0
    };
  }
  const sets = { full: makeSet(false), phone: makeSet(true) };
  let activeSet = null;
  let inFlight = 0;

  let currentFrame = 0;
  let targetFrame = 0;
  let progress = 0;
  let lastRenderedIndex = -1;
  let needsRedraw = true;
  let lastCanvasW = 0;
  let lastCanvasH = 0;
  let cachedHeroTrackHeight = 1000;
  let rafId = 0;
  let lastLoopTime = 0;

  // Map a frame index to its file: sree.0001.webp ... sree.0121.webp
  function getFrameUrl(set, index) {
    const fileNumber = prefersReducedMotion ? TOTAL_FRAMES : index * set.step + 1;
    const num = String(fileNumber).padStart(4, '0');
    return `${FOLDER}/${set.isPhone ? 'm/' : ''}sree.${num}.webp?v=${FRAME_VERSION}`;
  }

  // Start the render loop if it is asleep. The loop stops itself when the
  // animation has settled, so an idle page does no per-frame work.
  function requestLoop() {
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  // Download order: last frame, then every 16th, 8th, 4th, 2nd and finally the
  // rest. After the first handful of files the whole scroll range already has a
  // picture close to the right one, so scrolling early shows a slightly coarse
  // animation instead of a frozen frame.
  function buildOrder(count) {
    const seen = new Set();
    const order = [];
    const add = (i) => {
      if (i >= 0 && i < count && !seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    };
    add(0);
    add(count - 1);
    for (const stride of [16, 8, 4, 2, 1]) {
      for (let i = 0; i < count; i += stride) add(i);
    }
    return order;
  }

  function loadFrame(set, i) {
    if (set.images[i]) return;
    inFlight++;
    const img = new Image();
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      inFlight--;
      pump();
    };
    img.onload = () => {
      // Redraw if this frame is the one on screen, or fills a gap next to it
      const near = set === activeSet && Math.abs(Math.round(currentFrame) - i) <= 2;
      if (near || (set === activeSet && lastRenderedIndex < 0)) {
        needsRedraw = true;
        requestLoop();
      }
      done();
    };
    img.onerror = done;
    img.src = getFrameUrl(set, i);
    set.images[i] = img;
  }

  // Keep MAX_IN_FLIGHT downloads going for the active set until every frame is requested.
  function pump() {
    const set = activeSet;
    if (!set) return;
    while (inFlight < MAX_IN_FLIGHT && set.next < set.order.length) {
      loadFrame(set, set.order[set.next++]);
    }
  }

  // Phones held upright use the cropped set; everything else uses the full frames.
  // Called on start and on resize, so rotating a phone switches sets.
  function chooseSet() {
    return mq(PHONE_PORTRAIT_QUERY).matches ? sets.phone : sets.full;
  }

  function activateSet() {
    if (!canvas || !ctx) return;
    const next = chooseSet();
    if (next === activeSet) return;
    const prev = activeSet;
    activeSet = next;
    if (!next.order) next.order = buildOrder(next.count);
    if (prev && prev.count > 1 && next.count > 1) {
      // Keep the same scroll position when the frame count changes
      currentFrame = (currentFrame / (prev.count - 1)) * (next.count - 1);
    }
    targetFrame = progress * (next.count - 1);
    lastRenderedIndex = -1;
    needsRedraw = true;
    pump();
    requestLoop();
  }

  // Find exact or nearest loaded image in the active set
  function getBestImage(targetIndex) {
    const set = activeSet;
    const count = set.count;
    const target = Math.max(0, Math.min(count - 1, targetIndex));
    const ok = (i) => set.images[i] && set.images[i].complete && set.images[i].naturalWidth > 0;
    if (ok(target)) return set.images[target];
    // Nearest loaded frame in either direction
    for (let d = 1; d < count; d++) {
      if (target - d >= 0 && ok(target - d)) return set.images[target - d];
      if (target + d < count && ok(target + d)) return set.images[target + d];
    }
    return null;
  }

  // Resize canvas according to full window dimensions and devicePixelRatio
  function resizeCanvas() {
    if (!canvas || !ctx) return;
    activateSet();
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (Math.abs(w - lastCanvasW) < 2 && Math.abs(h - lastCanvasH) < 2) return;
    lastCanvasW = w;
    lastCanvasH = h;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const heroTrack = document.getElementById('hero');
    if (heroTrack) {
      cachedHeroTrackHeight = Math.max(10, heroTrack.offsetHeight - window.innerHeight);
    }

    needsRedraw = true;
    requestLoop();
  }

  // Scale and center the frame inside the canvas (full cinematic cover with face centering).
  // The phone set holds only a slice of the frame, so it is drawn at the slice's
  // position within the full-frame layout and the picture comes out identical.
  function drawCover(img, alpha = 1) {
    if (!canvas || !ctx || !img) return;
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = FRAME_W;
    const ih = FRAME_H;
    if (!img.naturalWidth || !cw || !ch) return;

    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;

    // On mobile portrait, align horizontally with face center (x ≈ 44% of the spare width)
    const isMobile = (cw / ch) < 1.0;
    const sx = isMobile ? (cw - sw) * 0.44 : (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    const offsetX = activeSet.isPhone ? CROP_X : 0;
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight,
      sx + offsetX * scale, sy, img.naturalWidth * scale, sh);
    ctx.globalAlpha = 1;
  }

  // Fast layout-free scroll animation calculator
  function updateScrollAnimation() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const span = cachedHeroTrackHeight || (window.innerHeight * 1.2);
    progress = Math.max(0, Math.min(1, scrollY / span));
    targetFrame = progress * (activeSet.count - 1);
    requestLoop();
  }


  // Physics animation loop: runs only while the frame is still easing toward
  // its target, then sleeps until a scroll, resize or newly loaded frame wakes it.
  function loop() {
    rafId = 0;

    // Ease by elapsed time, not per screen refresh: a slow or 30 fps device catches
    // up in the same time as a 60 fps one instead of lagging behind the scroll.
    const now = performance.now();
    const dt = lastLoopTime ? Math.min(100, now - lastLoopTime) : 16.7;
    lastLoopTime = now;
    const ease = 1 - Math.pow(1 - LERP_FACTOR, dt / 16.7);

    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.001) {
      currentFrame += diff * ease;
    } else {
      currentFrame = targetFrame;
    }

    // Position in steps of 1/BLEND_STEPS frame. Between two frames the next one is
    // faded over the previous, so slow scrolling glides instead of snapping.
    const pos = Math.round(currentFrame * BLEND_STEPS) / BLEND_STEPS;
    if (pos !== lastRenderedIndex || needsRedraw) {
      const lo = Math.floor(pos);
      const frac = pos - lo;
      const exact = (i) => {
        const im = activeSet.images[i];
        return im && im.complete && im.naturalWidth > 0 ? im : null;
      };
      const imgLo = exact(lo);
      const imgHi = frac > 0 ? exact(lo + 1) : null;
      if (imgLo && imgHi) {
        drawCover(imgLo);
        drawCover(imgHi, frac);
        lastRenderedIndex = pos;
        needsRedraw = false;
      } else {
        const img = getBestImage(Math.round(pos));
        if (img) {
          drawCover(img);
          lastRenderedIndex = pos;
          needsRedraw = false;
        }
      }
    }

    if (Math.abs(targetFrame - currentFrame) > 0.001) {
      requestLoop();
    } else {
      lastLoopTime = 0; // loop is going to sleep; the next wake-up starts a fresh clock
    }
  }

  // Start downloading right away (not after window "load") so the frames are
  // arriving while the rest of the page is still loading.
  activateSet();

  // ---------------------------------------------------------------------------
  // 2. NAVBAR SCROLL EFFECT & MOBILE NAVIGATION DRAWER
  // ---------------------------------------------------------------------------
  const nav = document.getElementById('main-nav');
  function handleNavScroll() {
    if (!nav) return;
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const menuIconBars = document.querySelector('.menu-icon-bars');
  const menuIconClose = document.querySelector('.menu-icon-close');

  // Single place that opens/closes the drawer and keeps every ARIA state in sync
  // (the drawer used to stay aria-hidden="true" even while open).
  function setMobileNavOpen(isOpen) {
    if (!mobileDrawer) return;
    mobileDrawer.classList.toggle('open', isOpen);
    mobileDrawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    // While closed the links must be unreachable by keyboard and screen readers too
    mobileDrawer.inert = !isOpen;
    if (mobileToggleBtn) {
      mobileToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (menuIconBars) menuIconBars.style.display = isOpen ? 'none' : 'block';
      if (menuIconClose) menuIconClose.style.display = isOpen ? 'block' : 'none';
    }
  }

  window.closeMobileNav = function() {
    setMobileNavOpen(false);
  };

  window.toggleMobileNav = function() {
    setMobileNavOpen(!(mobileDrawer && mobileDrawer.classList.contains('open')));
  };

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileNav();
    });
  }

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  document.addEventListener('click', (e) => {
    if (mobileDrawer && mobileDrawer.classList.contains('open')) {
      if (!mobileDrawer.contains(e.target) && !mobileToggleBtn.contains(e.target)) {
        closeMobileNav();
      }
    }
  });

  // ---------------------------------------------------------------------------
  // 4. DATA POPULATION FROM portfolioData (Sections 3, 4, 5, 6)
  // ---------------------------------------------------------------------------
  // Escape text before it goes into innerHTML templates or attribute values
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  }

  // Delegated activation for custom "buttons" (<div role="button">): mouse click plus
  // Enter / Space from the keyboard, the way a native <button> behaves.
  function onActivate(container, selector, handler) {
    container.addEventListener('click', (e) => {
      const el = e.target.closest(selector);
      if (el && container.contains(el)) handler(el);
    });
    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = e.target.closest(selector);
      if (!el || e.target !== el) return; // ignore keys pressed inside a nested control
      e.preventDefault();
      handler(el);
    });
  }

  function populateContent() {
    const data = window.portfolioData;
    if (!data) return;

    // A. Experience Timeline (Section 3)
    const timelineList = document.getElementById('timeline-list');
    if (timelineList && data.experience && data.experience.items) {
      timelineList.innerHTML = data.experience.items.map(item => `
        <div class="timeline-card ${item.isCurrent ? 'current' : ''}">
          <div class="timeline-studio">
            <span class="studio-name">${item.studio}</span>
            ${item.isCurrent ? '<span class="studio-badge-current">Present Role</span>' : ''}
          </div>
          <div class="timeline-role-info">
            <div class="timeline-role">${item.role}</div>
            <div class="timeline-desc">${item.description || ''}</div>
          </div>
          <div class="timeline-meta">
            <div class="timeline-period">${item.period}</div>
            <div class="timeline-location">${item.location}</div>
          </div>
        </div>
      `).join('');
    }

    // B. Projects Filter Pills & Grid (Section 4)
    const pillsContainer = document.getElementById('filter-pills-container');
    const projectsGrid = document.getElementById('projects-grid');

    const projectsStatus = document.getElementById('projects-status');

    if (pillsContainer && data.projects && data.projects.studios) {
      pillsContainer.innerHTML = data.projects.studios.map((studio, idx) => `
        <button type="button" class="filter-pill ${idx === 0 ? 'active' : ''}" data-studio="${esc(studio)}" aria-pressed="${idx === 0 ? 'true' : 'false'}">
          ${esc(studio)}
        </button>
      `).join('');

      pillsContainer.addEventListener('click', (e) => {
        const target = e.target.closest('.filter-pill');
        if (!target) return;
        document.querySelectorAll('.filter-pill').forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-pressed', 'false');
        });
        target.classList.add('active');
        target.setAttribute('aria-pressed', 'true');
        const count = renderProjectsGrid(target.dataset.studio);
        // Tell screen-reader users what the filter did
        if (projectsStatus) {
          const noun = count === 1 ? 'project' : 'projects';
          projectsStatus.textContent = target.dataset.studio === 'All'
            ? `Showing all ${count} ${noun}`
            : `Showing ${count} ${noun} from ${target.dataset.studio}`;
        }
      });
    }

    // Show a first batch of posters and let visitors expand the rest. The count
    // fills whole rows: 3 columns above 1080px, 2 columns below.
    const moreWrap = document.getElementById('projects-more');
    const moreBtn = document.getElementById('projects-more-btn');
    const wideGrid = window.matchMedia ? window.matchMedia('(min-width: 1081px)') : { matches: true };
    let showAllProjects = false;
    let currentStudio = 'All';

    function renderProjectsGrid(selectedStudio = 'All') {
      if (selectedStudio !== currentStudio) {
        currentStudio = selectedStudio;
        showAllProjects = false;
      }
      if (!projectsGrid || !data.projects || !data.projects.items) return 0;
      const clean = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const filterKey = clean(selectedStudio);

      const filtered = selectedStudio === 'All' 
        ? data.projects.items 
        : data.projects.items.filter(p => {
            const pKey = clean(p.studio);
            if (filterKey === 'mpcfilm' || filterKey === 'mpc') {
              return pKey.includes('mpc') || pKey.includes('technicolor');
            }
            return pKey.includes(filterKey) || filterKey.includes(pKey);
          });

      const limit = wideGrid.matches ? 9 : 8;
      const visible = showAllProjects ? filtered : filtered.slice(0, limit);
      if (moreWrap && moreBtn) {
        const hasMore = filtered.length > limit;
        moreWrap.hidden = !hasMore;
        moreBtn.textContent = showAllProjects ? 'Show fewer' : `Show all ${filtered.length} titles`;
        moreBtn.setAttribute('aria-expanded', showAllProjects ? 'true' : 'false');
      }

      projectsGrid.innerHTML = visible.map(item => `
        <div class="project-poster-card ${item.isWIP ? 'wip-card' : ''}" role="button" tabindex="0" data-project-id="${esc(item.id)}" aria-label="${esc(item.title)}, ${esc(item.studio)}, ${esc(item.year)}. Open details" title="Click to view breakdown: ${esc(item.title)}">
          <img src="${esc(item.poster)}" alt="${esc(item.title)} Poster" class="poster-media" loading="lazy">
          ${item.isWIP ? `
            <div class="wip-ribbon">
              <span class="pulse-dot"></span>
              <span>Work in Progress</span>
            </div>
          ` : ''}
          <div class="poster-overlay">
            <div class="poster-studio">${esc(item.studio)}</div>
            <h3 class="poster-title">${esc(item.title)}</h3>
            <div class="poster-genre">${esc(item.genre)} (${esc(item.year)})</div>
            <div class="poster-contrib">${esc(item.contribution)}</div>
          </div>
        </div>
      `).join('');

      return filtered.length;
    }
    renderProjectsGrid('All');
    if (moreBtn) {
      moreBtn.addEventListener('click', () => {
        showAllProjects = !showAllProjects;
        renderProjectsGrid(currentStudio);
        if (!showAllProjects && projectsGrid) projectsGrid.scrollIntoView({ block: 'start' });
      });
    }

    // One delegated handler for the whole grid: survives re-rendering when the
    // filter changes, and gives the cards Enter / Space keyboard activation.
    if (projectsGrid) {
      onActivate(projectsGrid, '.project-poster-card', (card) => {
        openProjectModal(card.dataset.projectId);
      });
    }

    // B2. AI Works (Section 5)
    const aiGrid = document.getElementById('ai-works-grid');
    if (aiGrid && data.aiWorks && data.aiWorks.items) {
      aiGrid.innerHTML = data.aiWorks.items.map(item => `
        <div class="ai-video-card" role="button" tabindex="0" data-ai-id="${esc(item.id)}" aria-label="Play AI reel: ${esc(item.title)}" title="Click to view AI reel: ${esc(item.title)}">
          <video class="ai-video-media" src="${esc(item.videoUrl)}" poster="${esc(item.thumbnail)}" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video>
          <div class="play-circle-btn" aria-hidden="true">
            <svg viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20"/></svg>
          </div>
          <div class="ai-video-overlay">
            <h3 class="ai-video-title">${esc(item.title)}</h3>
            <div class="ai-video-tools">${esc(item.tools)}</div>
          </div>
        </div>
      `).join('');

      onActivate(aiGrid, '.ai-video-card', (card) => openAIModal(card.dataset.aiId));

      // Silent preview on mouse hover (devices that can hover) and on keyboard focus.
      // Not played for people who prefer reduced motion, and not started by a tap on a
      // touch screen: tapping opens the full video instead, and these files are 8-20 MB.
      const canHover = window.matchMedia ? window.matchMedia('(hover: hover)').matches : true;
      aiGrid.querySelectorAll('.ai-video-card').forEach((card) => {
        const video = card.querySelector('video');
        if (!video) return;
        const play = () => {
          if (prefersReducedMotion) return;
          const p = video.play();
          if (p && p.catch) p.catch(() => {});
        };
        const stop = () => video.pause();
        card.addEventListener('mouseenter', () => { if (canHover) play(); });
        card.addEventListener('mouseleave', stop);
        card.addEventListener('focus', () => { if (card.matches(':focus-visible')) play(); });
        card.addEventListener('blur', stop);
      });
    }

    // C. Tools Pills (Section 6)
    const vfxWrap = document.getElementById('tools-vfx-wrap');
    const aiWrap = document.getElementById('tools-ai-wrap');

    if (vfxWrap && data.tools && data.tools.vfx) {
      vfxWrap.innerHTML = data.tools.vfx.map(tool => `
        <span class="tool-pill">${tool}</span>
      `).join('');
    }
    if (aiWrap && data.tools && data.tools.ai) {
      aiWrap.innerHTML = data.tools.ai.map(tool => `
        <span class="tool-pill">${tool}</span>
      `).join('');
    }

    // Update Copyright Year
    const yearElem = document.getElementById('current-year');
    if (yearElem) {
      yearElem.textContent = new Date().getFullYear();
    }
  }

  // ---------------------------------------------------------------------------
  // 5. MODAL SYSTEM (Breakdowns & Showreel)
  // ---------------------------------------------------------------------------
  const modal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalTitle = document.getElementById('modal-project-title');
  const modalContrib = document.getElementById('modal-project-contrib');
  const modalMeta = document.getElementById('modal-project-meta');
  const modalDesc = document.getElementById('modal-project-desc');
  const modalMedia = document.getElementById('modal-media-container');

  window.openProjectModal = function(projectId) {
    const data = window.portfolioData;
    if (!data || !data.projects) return;
    const project = data.projects.items.find(p => p.id === projectId);
    if (!project) return;

    modalTitle.textContent = project.title;
    modalContrib.textContent = project.contribution;
    modalMeta.textContent = `${project.studio} • ${project.year} • ${project.genre}`;
    modalDesc.textContent = project.description;

    modalMedia.classList.remove('video-mode');
    modalMedia.innerHTML = `
      <img src="${project.poster}" alt="${project.title} Poster" class="modal-poster-img">
    `;

    openModal();
  };

  window.openAIModal = function(aiId) {
    const data = window.portfolioData;
    if (!data || !data.aiWorks) return;
    const item = data.aiWorks.items.find(i => i.id === aiId);
    if (!item) return;

    modalTitle.textContent = item.title;
    modalContrib.textContent = `Generative AI • ${item.tools}`;
    modalMeta.textContent = 'Creative AI Reel • @pixelmind_by_sree';
    modalDesc.innerHTML = `
      ${item.description}
      <div style="margin-top: 20px;">
        <a href="${data.aiWorks.instagramUrl}" target="_blank" rel="noopener noreferrer" class="pill-btn-white" style="display: inline-flex; padding: 11px 24px; font-size: 0.82rem;">
          <span>Watch Reel on Instagram (${data.aiWorks.instagramHandle})</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-left: 8px;"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
        </a>
      </div>
    `;

    modalMedia.classList.add('video-mode');
    if (item.videoUrl) {
      modalMedia.innerHTML = `
        <video controls autoplay loop playsinline src="${item.videoUrl}" poster="${item.thumbnail}" style="width: 100%; height: 100%; object-fit: contain; background: #000; border-radius: 12px;"></video>
      `;
    } else {
      modalMedia.innerHTML = `
        <img src="${item.thumbnail}" alt="${item.title} Preview" style="width: 100%; height: 100%; object-fit: contain; background: #000;">
      `;
    }

    openModal();
  };

  window.openShowreelModal = function() {
    // Pause inline reel if it is playing
    const inlineVid = document.getElementById('vfx-inline-reel');
    if (inlineVid && !inlineVid.paused) {
      inlineVid.pause();
    }

    modalTitle.textContent = 'Sreerag Rajeevan — VFX Showreel 2024';
    modalContrib.textContent = 'Senior Matchmove & Rotoanimation Artist';
    modalMeta.textContent = 'Hollywood Feature Films & Prestige Episodic • 3DEqualizer & Autodesk Maya';
    modalDesc.innerHTML = `
      High-precision 3D camera reconstruction, anamorphic distortion solve pipelines, live-action plate stabilization, and digital double body tracking across major Hollywood blockbuster features and prestige series. Solves executed with sub-pixel precision for world-class studios including DNEG and Outpost VFX.
    `;

    modalMedia.classList.add('video-mode');
    modalMedia.innerHTML = `
      <video controls autoplay playsinline src="showreel/sreerag_showreel_2024.mp4" poster="public/assets/videos/showreel-poster.svg" style="width: 100%; height: 100%; object-fit: contain; background: #000; border-radius: 12px;"></video>
    `;

    openModal();
  };

  window.openBreakdownModal = function(type) {
    // Matchmove and rotoanimation are both featured in the 2024 showreel
    openShowreelModal();
  };

  // --- Modal focus management -------------------------------------------------
  // Everything outside the dialog is made inert while it is open, so Tab and screen
  // readers cannot wander into the page behind it. Focus moves into the dialog on
  // open and returns to whatever opened it on close.
  const modalDialog = modal ? modal.querySelector('.modal-dialog') : null;
  // Every top-level part of the page except the dialog itself (navigation, hero,
  // main content, skip link, canvas). Scripts and the dialog are left alone.
  const pageRegions = () => document.querySelectorAll('body > :not(#project-modal):not(script):not(noscript)');
  let focusBeforeModal = null;

  function getModalFocusables() {
    if (!modal) return [];
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])';
    return Array.from(modal.querySelectorAll(selector)).filter((el) => el.getClientRects().length > 0);
  }

  // Fallback for browsers without `inert`: keep Tab inside the dialog
  function trapModalFocus(e) {
    const focusables = getModalFocusables();
    if (!focusables.length) {
      e.preventDefault();
      if (modalDialog) modalDialog.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (!modal.contains(active)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && (active === first || active === modalDialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openModal() {
    if (!modal) return;
    focusBeforeModal = document.activeElement;
    modal.inert = false;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    pageRegions().forEach((el) => { el.inert = true; });
    // The element that had focus is now inert, so focus drops to <body>. The dialog is
    // still `visibility: hidden` on the very first frame of its fade-in and refuses
    // focus, so retry on each animation frame until it takes (normally the 1st-2nd).
    focusModalStart();
  }

  function focusModalStart(attempt = 0) {
    requestAnimationFrame(() => {
      if (!modal || !modal.classList.contains('open')) return;
      (modalCloseBtn || modalDialog).focus({ preventScroll: true });
      if (!modal.contains(document.activeElement) && attempt < 30) {
        focusModalStart(attempt + 1);
      }
    });
  }

  window.closeModal = function() {
    if (!modal) return;
    const wasOpen = modal.classList.contains('open');
    modal.classList.remove('open');
    document.body.style.overflow = '';
    pageRegions().forEach((el) => { el.inert = false; });
    if (wasOpen && focusBeforeModal && document.contains(focusBeforeModal)) {
      focusBeforeModal.focus({ preventScroll: true });
    }
    focusBeforeModal = null;
    // Focus has already moved back to the page; now take the hidden dialog out of reach
    modal.inert = true;
    if (modalMedia) {
      const vids = modalMedia.querySelectorAll('video');
      vids.forEach(v => {
        try {
          v.pause();
          v.currentTime = 0;
        } catch (e) {}
      });
      modalMedia.innerHTML = '';
    }
  };

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
  window.addEventListener('keydown', (e) => {
    const modalOpen = modal && modal.classList.contains('open');
    if (e.key === 'Escape') {
      if (modalOpen) {
        closeModal();
      } else if (mobileDrawer && mobileDrawer.classList.contains('open')) {
        closeMobileNav();
        if (mobileToggleBtn) mobileToggleBtn.focus();
      }
    } else if (e.key === 'Tab' && modalOpen) {
      trapModalFocus(e);
    }
  });

  // Top right corner play button directly launches 2024 VFX Showreel modal
  // The hero "Watch Showreel" button does the same
  ['open-reel-btn', 'hero-reel-btn'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openShowreelModal();
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 5B. INLINE SHOWREEL PLAYER (Section 2: Matchmove & Rotoanim Showcase)
  // ---------------------------------------------------------------------------
  const inlineReelVideo = document.getElementById('vfx-inline-reel');
  const showreelOverlay = document.getElementById('showreel-custom-overlay');
  const showreelPlayBtn = document.getElementById('showreel-play-btn');

  if (inlineReelVideo && showreelOverlay) {
    const playInlineReel = (e) => {
      if (e) e.stopPropagation();
      showreelOverlay.classList.add('hidden');
      inlineReelVideo.play().catch(err => {
        console.warn('Playback error or blocked by browser policy:', err);
      });
    };

    if (showreelPlayBtn) {
      showreelPlayBtn.addEventListener('click', playInlineReel);
    }
    showreelOverlay.addEventListener('click', playInlineReel);

    inlineReelVideo.addEventListener('play', () => {
      showreelOverlay.classList.add('hidden');
    });

    inlineReelVideo.addEventListener('pause', () => {
      if (inlineReelVideo.currentTime === 0 || inlineReelVideo.ended) {
        showreelOverlay.classList.remove('hidden');
      }
    });

    inlineReelVideo.addEventListener('ended', () => {
      showreelOverlay.classList.remove('hidden');
    });
  }

  // ---------------------------------------------------------------------------
  // 6. CONTACT FORM SUBMISSION & CLIENT ROUTING
  // ---------------------------------------------------------------------------
  const TARGET_EMAIL = 'sreeragmalappattam@gmail.com';

  function buildEmailDraft(name, email, message) {
    const subject = name
      ? `Project Collaboration Inquiry — ${name}`
      : 'Project Collaboration Inquiry — VFX / Matchmove';

    const bodyLines = [
      'Hi Sreerag,',
      '',
      'I would like to connect regarding a project / collaboration opportunity:',
      '',
      '--- CLIENT DETAILS ---',
      `Name: ${name || 'Not provided'}`,
      `Email: ${email || 'Not provided'}`,
      '',
      '--- PROJECT REQUIREMENTS ---',
      message || '(Write additional shot requirements, plate count, or turnaround dates here)',
      '',
      '---',
      'Sent via Sreerag Rajeevan VFX Portfolio'
    ];

    const body = bodyLines.join('\n');

    return {
      subject,
      body,
      mailtoUrl: `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      gmailUrl: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(TARGET_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      outlookUrl: `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(TARGET_EMAIL)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    };
  }

  window.handleSendVia = function(client) {
    const name = document.getElementById('form-name')?.value.trim() || '';
    const email = document.getElementById('form-email')?.value.trim() || '';
    const message = document.getElementById('form-message')?.value.trim() || '';

    const draft = buildEmailDraft(name, email, message);

    if (client === 'gmail') {
      window.open(draft.gmailUrl, '_blank', 'noopener,noreferrer');
    } else if (client === 'outlook') {
      window.open(draft.outlookUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = draft.mailtoUrl;
    }
  };

  // --- Contact form -----------------------------------------------------------
  // Set contact.formEndpoint in src/data/portfolio.js (Formspree, Web3Forms, or any
  // endpoint that accepts a JSON POST) and the form sends the message for real.
  // With no endpoint configured it falls back to opening an email draft.
  const contactConfig = (window.portfolioData && window.portfolioData.contact) || {};
  const FORM_ENDPOINT = String(contactConfig.formEndpoint || '').trim();
  const FORM_ACCESS_KEY = String(contactConfig.formAccessKey || '').trim();
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  // Show a result message under the button. `withFallbackLinks` adds direct contact links.
  function setFormStatus(text, kind, withFallbackLinks) {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.classList.remove('is-success', 'is-error');
    if (kind) formStatus.classList.add(`is-${kind}`);
    if (withFallbackLinks) {
      const link = document.createElement('a');
      link.href = `mailto:${TARGET_EMAIL}`;
      link.textContent = TARGET_EMAIL;
      formStatus.append(' Please email ', link, ' directly or use WhatsApp below.');
    }
  }

  async function postToFormEndpoint(name, email, message) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const payload = {
        name,
        email,
        message,
        subject: `Portfolio enquiry from ${name}`,
        from_name: 'Sreerag Rajeevan Portfolio'
      };
      if (FORM_ACCESS_KEY) payload.access_key = FORM_ACCESS_KEY;

      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      let body = null;
      try { body = await res.json(); } catch (err) { /* some services reply without JSON */ }
      if (!res.ok || (body && (body.success === false || body.ok === false))) {
        throw new Error((body && (body.message || body.error)) || `HTTP ${res.status}`);
      }
    } finally {
      clearTimeout(timer);
    }
  }

  async function onContactSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    const name = document.getElementById('form-name')?.value.trim() || '';
    const email = document.getElementById('form-email')?.value.trim() || '';
    const message = document.getElementById('form-message')?.value.trim() || '';
    const trap = document.getElementById('form-website')?.value || '';

    // Spam trap filled in: a bot. Pretend it worked and send nothing.
    if (trap) {
      setFormStatus('Thanks! Your message has been sent.', 'success');
      contactForm.reset();
      return;
    }

    // No form service configured yet: open an email draft instead
    if (!FORM_ENDPOINT) {
      setFormStatus('Opening your email app with a draft. Press send there to deliver it.', 'success');
      window.location.href = buildEmailDraft(name, email, message).mailtoUrl;
      return;
    }

    const originalLabel = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = 'Sending...';
    }
    setFormStatus('Sending your message...', null);

    try {
      await postToFormEndpoint(name, email, message);
      contactForm.reset();
      setFormStatus(`Thanks, ${name}! Your message was sent. You will get a reply at ${email}.`, 'success');
    } catch (err) {
      console.warn('Contact form failed:', err);
      setFormStatus('Sorry, your message did not go through.', 'error', true);
    } finally {
      if (btn) {
        btn.innerHTML = originalLabel;
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
      }
    }
  }

  if (contactForm) {
    contactForm.addEventListener('submit', onContactSubmit);
  }

  // ---------------------------------------------------------------------------
  // 7. INITIALIZATION & EVENT LISTENERS
  // ---------------------------------------------------------------------------
  const onScrollOrTouch = () => {
    updateScrollAnimation();
    handleNavScroll();
  };

  window.addEventListener('scroll', onScrollOrTouch, { passive: true });


  window.addEventListener('resize', () => {
    resizeCanvas();
    updateScrollAnimation();
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      resizeCanvas();
      updateScrollAnimation();
    }, 150);
  });

  // Init sequence
  populateContent();
  resizeCanvas();
  updateScrollAnimation();
  requestLoop();
})();
