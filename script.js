/* ===================================================
   Joy Homoeo Care – script.js
   =================================================== */

/* ---- Dynamic Navbar Height Tracking (zoom-safe) ----
   Sets --navbar-height on :root so hero padding and
   scroll-padding-top always match the real rendered height,
   regardless of browser zoom level or screen size.
----------------------------------------------------- */
function updateNavbarHeight() {
  const wrapper = document.querySelector('.navbar-wrapper');
  if (!wrapper) return;
  const h = wrapper.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--navbar-height', Math.ceil(h) + 'px');
}

// Run immediately, on every resize/zoom change
updateNavbarHeight();
window.addEventListener('resize', updateNavbarHeight, { passive: true });

// ResizeObserver keeps it accurate even if the bar changes height
// (e.g. when announce-bar text wraps on very small viewports)
if (typeof ResizeObserver !== 'undefined') {
  const navWrapper = document.querySelector('.navbar-wrapper');
  if (navWrapper) {
    new ResizeObserver(updateNavbarHeight).observe(navWrapper);
  }
}

/* ---- Trigger hero load animations ---- */
document.addEventListener('DOMContentLoaded', () => {
  updateNavbarHeight(); // recalculate after DOM is ready
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    requestAnimationFrame(() => heroContent.classList.add('loaded'));
  }
});


/* ---- Mobile nav toggle ---- */
const hamburger = document.getElementById('navHamburger');
const drawer    = document.getElementById('mobileDrawer');

if (hamburger && drawer) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    drawer.classList.toggle('open');
    const isOpen = drawer.classList.contains('open');
    drawer.setAttribute('aria-hidden', !isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.classList.toggle('open', isOpen);
  });

  // Close on link click
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.classList.remove('open');
    });
  });

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.classList.remove('open');
    }
  });

  // Close when clicking outside
  document.addEventListener('click', e => {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !hamburger.contains(e.target)) {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.classList.remove('open');
    }
  });
}

/* ---- Smooth Scroll for all anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      // Use real navbar height so scroll offset is always correct at any zoom
      const navbarHeight = document.querySelector('.navbar-wrapper')?.getBoundingClientRect().height || 90;
      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---- Scroll Reveal (Intersection Observer) ---- */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Stagger sibling service cards
      const siblings = entry.target.parentElement.querySelectorAll('.reveal');
      if (siblings.length > 1 && entry.target.classList.contains('reveal')) {
        const idx = Array.from(siblings).indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 0.07}s`;
      }
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ---- Testimonials Carousel (Auto-scrolling Infinite Loop) ---- */
document.addEventListener('DOMContentLoaded', () => {
  const track    = document.getElementById('testimonialsTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('carouselDots');
  const wrap     = document.querySelector('.testimonials-track-wrap');
  const overlay  = document.getElementById('readingOverlay');

  if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

  /* ── Clone cards: structure = [real 0..n-1] [clone-A n..2n-1] [clone-B 2n..3n-1] ── */
  const originalCards = Array.from(track.querySelectorAll('.testimonial-card:not(.clone)'));
  const n = originalCards.length;

  [0, 1].forEach(() => {
    originalCards.forEach(card => {
      const cl = card.cloneNode(true);
      cl.classList.add('clone');
      cl.setAttribute('aria-hidden', 'true');
      track.appendChild(cl);
    });
  });

  // Start at index n = first of clone-A (looks like card 1, allows seamless backward to real set)
  let currentIndex     = n;
  let isPaused         = false;
  let readingModeActive = false;
  let autoScrollTimer  = null;
  let snapTimer        = null;  // cancellable snap
  let activeCard       = null;
  let activeClone      = null;

  /* ── Get card step width (card + gap) ──
     Uses offsetWidth of the first real card. Falls back to a
     viewport-based estimate if the browser hasn't laid out yet (w=0). ── */
  function getCardWidth() {
    if (!originalCards[0]) return 0;
    const gap = parseFloat(window.getComputedStyle(track).columnGap) || 24;
    const w   = originalCards[0].offsetWidth;
    if (w > 0) return w + gap;
    // Fallback: estimate from viewport until CSS calc() resolves
    const vw = window.innerWidth;
    const containerPad = vw <= 480 ? 32 : vw <= 768 ? 48 : vw <= 1024 ? 96 : 160;
    return Math.max(200, vw - containerPad) + gap;
  }

  /* ── Cancel any pending snap timer ── */
  function cancelSnap() {
    if (snapTimer !== null) { clearTimeout(snapTimer); snapTimer = null; }
  }

  /* ── Schedule a silent snap (no visible transition) ── */
  function scheduleSnap(targetIndex, delay) {
    cancelSnap();
    snapTimer = setTimeout(() => {
      snapTimer = null;
      track.style.transition = 'none';
      currentIndex = targetIndex;
      track.style.transform  = `translateX(-${currentIndex * getCardWidth()}px)`;
    }, delay);
  }

  /* ── Dots ── */
  function buildDots() {
    dotsWrap.innerHTML = '';
    originalCards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
      dot.addEventListener('click', () => {
        cancelSnap();
        resetAutoScroll();
        currentIndex = n + i;  // always land in clone-A range
        track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        track.style.transform  = `translateX(-${currentIndex * getCardWidth()}px)`;
        updateDots();
      });
      dotsWrap.appendChild(dot);
    });
  }

  function updateDots() {
    // Works for any currentIndex including negatives or > 3n
    const realIdx = ((currentIndex % n) + n) % n;
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) =>
      d.classList.toggle('active', i === realIdx));
  }

  /* ── Auto-scroll ── */
  function advanceCarousel() {
    if (isPaused || readingModeActive) return;
    cancelSnap();         // cancel any pending snap before advancing
    currentIndex++;
    const cw = getCardWidth();
    track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform  = `translateX(-${currentIndex * cw}px)`;
    updateDots();

    // Entered clone-B → snap back to matching position in clone-A after transition
    if (currentIndex >= 2 * n) {
      scheduleSnap(n, 650);
    }
  }

  function startAutoScroll()  { stopAutoScroll(); autoScrollTimer = setInterval(advanceCarousel, 5000); }
  function stopAutoScroll()   { clearInterval(autoScrollTimer); autoScrollTimer = null; }
  function resetAutoScroll()  { cancelSnap(); stopAutoScroll(); startAutoScroll(); }

  /* ── Prev / Next buttons ── */
  prevBtn.addEventListener('click', () => {
    cancelSnap();
    resetAutoScroll();
    currentIndex--;

    if (currentIndex < 0) {
      // Visually still on card 1 (real[0]).
      // 1. Instantly jump to clone-B[0] (same card, 2n index) — invisible.
      // 2. Then animate LEFT to clone-A[n-1] (2n-1 index) = last card. Correct backward motion.
      const cw = getCardWidth();
      track.style.transition = 'none';
      track.style.transform  = `translateX(-${2 * n * cw}px)`;
      void track.offsetHeight;          // force reflow so next transition fires separately
      currentIndex = 2 * n - 1;        // clone-A[n-1] = last card
    }

    track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform  = `translateX(-${currentIndex * getCardWidth()}px)`;
    updateDots();
  });

  nextBtn.addEventListener('click', () => {
    cancelSnap();
    resetAutoScroll();
    advanceCarousel();
  });

  /* ── Hover / Touch pause ── */
  if (wrap) {
    wrap.addEventListener('mouseenter', () => { isPaused = true; });
    wrap.addEventListener('mouseleave', () => { isPaused = false; });
    wrap.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
    wrap.addEventListener('touchend',   () => {
      isPaused = false;
      if (!readingModeActive) startAutoScroll();
    });
  }

  /* ── Reading Mode (click card to expand) ── */
  function exitReadingMode() {
    if (!activeCard || !activeClone) return;
    const rect = activeCard.getBoundingClientRect();
    activeClone.style.top       = `${rect.top}px`;
    activeClone.style.left      = `${rect.left}px`;
    activeClone.style.transform = 'translate(0,0) scale(1)';
    activeClone.style.maxHeight = `${rect.height}px`;
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (activeClone && activeClone.parentNode) activeClone.parentNode.removeChild(activeClone);
      if (activeCard) activeCard.style.opacity = '1';
      activeClone = activeCard = null;
      readingModeActive = false;
      startAutoScroll();
    }, 400);
  }

  Array.from(track.querySelectorAll('.testimonial-card')).forEach(card => {
    card.addEventListener('click', () => {
      if (readingModeActive) { exitReadingMode(); return; }
      readingModeActive = true;
      activeCard = card;
      stopAutoScroll();
      const rect  = card.getBoundingClientRect();
      activeClone = card.cloneNode(true);
      Object.assign(activeClone.style, {
        position: 'fixed', top: `${rect.top}px`, left: `${rect.left}px`,
        width: `${rect.width}px`, height: 'auto', maxHeight: `${rect.height}px`,
        margin: '0', zIndex: '10001',
        transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        background: '#ffffff', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        overflowY: 'hidden', borderRadius: '24px'
      });
      document.body.appendChild(activeClone);
      card.style.opacity = '0';
      if (overlay) overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      activeClone.offsetHeight; // reflow
      Object.assign(activeClone.style, {
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%) scale(1.05)',
        maxHeight: '85vh'
      });
      setTimeout(() => { if (activeClone) activeClone.style.overflowY = 'auto'; }, 400);
      activeClone.addEventListener('click', exitReadingMode);
    });
  });

  if (overlay) overlay.addEventListener('click', exitReadingMode);

  /* ── Swipe / Drag (touch) ── */
  let startX = 0, currentX = 0, isDragging = false;

  track.addEventListener('touchstart', e => {
    if (readingModeActive) return;
    startX    = e.touches[0].clientX;
    currentX  = startX;
    isDragging = true;
    cancelSnap();                       // prevent snap from firing mid-drag
    stopAutoScroll();
    track.style.transition = 'none';
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    if (!isDragging || readingModeActive) return;
    currentX = e.touches[0].clientX;
    const dragOffset = currentX - startX;
    track.style.transform = `translateX(${-(currentIndex * getCardWidth()) + dragOffset}px)`;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (!isDragging || readingModeActive) return;
    isDragging = false;
    const diff = currentX - startX;
    const cw   = getCardWidth();

    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        // Swipe left = next
        currentIndex++;
        if (currentIndex >= 2 * n) {
          // Briefly in clone-B — snap back after short transition
          scheduleSnap(n, 450);
        }
      } else {
        // Swipe right = prev
        currentIndex--;
        if (currentIndex < 0) {
          // Jump to clone-B[0] (same card) then show clone-A[n-1] (last card)
          track.style.transition = 'none';
          track.style.transform  = `translateX(-${2 * n * cw}px)`;
          void track.offsetHeight;
          currentIndex = 2 * n - 1;
        }
      }
    }

    track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform  = `translateX(-${currentIndex * cw}px)`;
    updateDots();
    startAutoScroll();
  });

  /* ── Resize: debounce + requestAnimationFrame to recalculate position ── */
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    cancelSnap();
    stopAutoScroll();
    if (readingModeActive) exitReadingMode();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      requestAnimationFrame(() => {
        track.style.transition = 'none';
        track.style.transform  = `translateX(-${currentIndex * getCardWidth()}px)`;
        startAutoScroll();
      });
    }, 150);
  }, { passive: true });

  /* ── Init: wrapped in requestAnimationFrame so CSS calc() is fully
     resolved and offsetWidth returns the correct value. ── */
  requestAnimationFrame(() => {
    track.style.transition = 'none';
    track.style.transform  = `translateX(-${currentIndex * getCardWidth()}px)`;
    buildDots();
    updateDots();
    setTimeout(startAutoScroll, 500);
  });
});


/* ---- Scroll to Top Button ---- */
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---- Subtle nav highlight on scroll ---- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('nav-active');
        } else {
          link.classList.remove('nav-active');
        }
      });
    }
  });
}, { threshold: 0.45 });

sections.forEach(sec => sectionObserver.observe(sec));

/* ===================================================
   MERGED FROM section1 — Doctor, Specialisation, Testimonials JS
   =================================================== */

/* ---- Area of Expertise Accordion (merged from section1) ---- */
(function() {
  var accordionItems = document.querySelectorAll('.expertise-accordion .accordion-item');
  accordionItems.forEach(function(item) {
    var header = item.querySelector('.accordion-header');
    if (header) {
      header.addEventListener('click', function() {
        var isOpen = item.classList.contains('open');
        // Close all items within this accordion
        accordionItems.forEach(function(i) { i.classList.remove('open'); });
        // Open clicked item if it was closed
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
})();

/* ---- Number Counter Animation (merged from section1) ---- */
(function() {
  var countElements = document.querySelectorAll('.count-num');
  if (!countElements.length) return;

  var countObserver = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-target'));
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 2000;
        var frameRate = 30;
        var totalFrames = duration / frameRate;
        var currentFrame = 0;

        var counter = setInterval(function() {
          currentFrame++;
          var progress = currentFrame / totalFrames;
          var currentCount = Math.floor(target * progress);
          el.innerText = currentCount + suffix;

          if (currentFrame >= totalFrames) {
            el.innerText = target + suffix;
            clearInterval(counter);
          }
        }, frameRate);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  countElements.forEach(function(el) { countObserver.observe(el); });
})();

/* ===================================================
   REVEAL-UP OBSERVER (for doctor section features)
   =================================================== */
(function() {
  var revealUpEls = document.querySelectorAll('.reveal-up');
  if (!revealUpEls.length) return;

  var revealUpObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealUpObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

  revealUpEls.forEach(function(el) { revealUpObserver.observe(el); });
})();

/* ---- Mobile nav close button ---- */
const closeMenuBtn = document.getElementById('closeMobileMenu');
if (closeMenuBtn && drawer) {
  closeMenuBtn.addEventListener('click', () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('open');
  });
}

