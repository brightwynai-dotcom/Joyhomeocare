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
const track    = document.getElementById('testimonialsTrack');
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');
const dotsWrap = document.getElementById('carouselDots');

// Duplicate cards for seamless infinite loop
if (track) {
  const originalCards = Array.from(track.querySelectorAll('.testimonial-card'));
  originalCards.forEach(card => {
    const clone = card.cloneNode(true);
    track.appendChild(clone);
  });
}

let currentSlide  = 0;
let autoPlayTimer = null;
const cards       = track.querySelectorAll('.testimonial-card');
const CARD_COUNT  = cards.length;

// Determine how many cards are visible at once based on viewport
function visibleCount() {
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640)  return 2;
  return 1;
}

function cardWidth() {
  if (!cards[0]) return 0;
  const rect = cards[0].getBoundingClientRect();
  const gap  = 28;
  return rect.width + gap;
}

function maxSlide() {
  return Math.max(0, CARD_COUNT - visibleCount());
}

// Build dots
function buildDots() {
  dotsWrap.innerHTML = '';
  const total = maxSlide() + 1;
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === currentSlide ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  }
}

function updateDots() {
  const dots = dotsWrap.querySelectorAll('.carousel-dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

function goTo(idx) {
  currentSlide = Math.max(0, Math.min(idx, maxSlide()));
  track.style.transform = `translateX(-${currentSlide * cardWidth()}px)`;
  updateDots();
}

function next() { goTo(currentSlide >= maxSlide() ? 0 : currentSlide + 1); }
function prev() { goTo(currentSlide <= 0 ? maxSlide() : currentSlide - 1); }

prevBtn.addEventListener('click', () => { resetAutoPlay(); prev(); });
nextBtn.addEventListener('click', () => { resetAutoPlay(); next(); });

function startAutoPlay() {
  autoPlayTimer = setInterval(next, 4000);
}
function resetAutoPlay() {
  clearInterval(autoPlayTimer);
  startAutoPlay();
}

// Swipe / touch support
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { resetAutoPlay(); diff > 0 ? next() : prev(); }
});

buildDots();
// startAutoPlay(); // Disabled - using CSS auto-scroll animation
window.addEventListener('resize', () => { buildDots(); goTo(0); });
// Re-init after fonts/images settle
window.addEventListener('load', () => { buildDots(); goTo(0); });

/* ---- Scroll to Top Button ---- */
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

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
/* ---- Interactive Testimonials Carousel & Reading Mode ---- */
document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("testimonialsTrack");
  const wrap = document.querySelector(".testimonials-track-wrap");
  const overlay = document.getElementById("readingOverlay");
  if (!track || !wrap) return;

  const originalCards = Array.from(track.children);
  let currentIndex = 0;
  let isPaused = false;
  let readingModeActive = false;
  let autoScrollTimer;
  let activeCard = null;
  let activeClone = null;

  function getCardWidth() {
    if (!originalCards[0]) return 0;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.getPropertyValue('column-gap') || style.getPropertyValue('gap')) || 0;
    return originalCards[0].offsetWidth + gap;
  }

  // 1. Clone cards for infinite scroll
  originalCards.forEach(card => {
    let clone = card.cloneNode(true);
    clone.classList.add('clone');
    track.appendChild(clone);
  });
  originalCards.forEach(card => {
    let clone = card.cloneNode(true);
    clone.classList.add('clone');
    track.appendChild(clone);
  });

  const allCards = Array.from(track.children);
  const totalCards = allCards.length;

  // 2. Auto-scroll logic
  function advanceCarousel() {
    if (isPaused || readingModeActive) return;
    
    currentIndex++;
    const step = getCardWidth();
    track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = `translateX(-${currentIndex * step}px)`;

    // If we've reached the second set of clones, silently snap back to the start
    if (currentIndex >= originalCards.length * 2) {
      setTimeout(() => {
        if (readingModeActive) return; // safety
        track.style.transition = 'none';
        currentIndex = originalCards.length;
        track.style.transform = `translateX(-${currentIndex * step}px)`;
      }, 600);
    }
  }

  function startAutoScroll() {
    stopAutoScroll();
    autoScrollTimer = setInterval(advanceCarousel, 6000); 
  }

  function stopAutoScroll() {
    clearInterval(autoScrollTimer);
  }

  // 3. Hover and Touch pause
  wrap.addEventListener('mouseenter', () => { isPaused = true; });
  wrap.addEventListener('mouseleave', () => { isPaused = false; });
  wrap.addEventListener('touchstart', () => { isPaused = true; }, {passive: true});
  wrap.addEventListener('touchend', () => { 
    isPaused = false; 
    if (!readingModeActive) startAutoScroll(); 
  });

  // 4. Reading Mode Interaction with Clone (Escapes overflow:hidden)
  function exitReadingMode() {
    if (!activeCard || !activeClone) return;
    
    // Animate clone back to original position
    const rect = activeCard.getBoundingClientRect();
    activeClone.style.top = `${rect.top}px`;
    activeClone.style.left = `${rect.left}px`;
    activeClone.style.transform = 'translate(0, 0) scale(1)';
    activeClone.style.maxHeight = `${rect.height}px`; // animate back
    
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Unlock page scroll
    
    // After transition, clean up
    setTimeout(() => {
      if (activeClone && activeClone.parentNode) {
        activeClone.parentNode.removeChild(activeClone);
      }
      if (activeCard) {
        activeCard.style.opacity = '1';
      }
      activeClone = null;
      activeCard = null;
      readingModeActive = false;
      startAutoScroll();
    }, 400); // match transition duration
  }

  allCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (readingModeActive) {
        exitReadingMode();
        return;
      }

      readingModeActive = true;
      activeCard = card;
      stopAutoScroll();

      const rect = card.getBoundingClientRect();
      
      // Create a floating clone
      activeClone = card.cloneNode(true);
      activeClone.classList.add('reading-active');
      activeClone.style.position = 'fixed';
      activeClone.style.top = `${rect.top}px`;
      activeClone.style.left = `${rect.left}px`;
      activeClone.style.width = `${rect.width}px`;
      activeClone.style.height = 'auto'; // allow it to grow if needed
      activeClone.style.maxHeight = `${rect.height}px`; // start at original height
      activeClone.style.margin = '0';
      activeClone.style.zIndex = '10001';
      activeClone.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      activeClone.style.background = '#ffffff';
      activeClone.style.backdropFilter = 'none';
      activeClone.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
      activeClone.style.overflowY = 'hidden'; // hide scrollbar during transition
      
      document.body.appendChild(activeClone);
      
      // Hide original
      card.style.opacity = '0';
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock page scroll
      
      // Force reflow
      activeClone.offsetHeight;
      
      // Animate to center of viewport
      activeClone.style.top = '50%';
      activeClone.style.left = '50%';
      activeClone.style.transform = 'translate(-50%, -50%) scale(1.05)';
      activeClone.style.maxHeight = '85vh'; // expand to fit text, but limit to screen
      
      // Show scrollbar safely after transition ends
      setTimeout(() => {
        if (activeClone) activeClone.style.overflowY = 'auto';
      }, 400);
      
      // Clicking the clone also closes it
      activeClone.addEventListener('click', exitReadingMode);
    });
  });

  if (overlay) {
    overlay.addEventListener('click', exitReadingMode);
  }

  // 5. Handle Swipe/Drag for mobile users
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    if (readingModeActive) return;
    startX = e.touches[0].clientX;
    isDragging = true;
    track.style.transition = 'none';
  }, {passive: true});

  track.addEventListener('touchmove', (e) => {
    if (!isDragging || readingModeActive) return;
    currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    const step = getCardWidth();
    const baseTranslate = -(currentIndex * step);
    track.style.transform = `translateX(${baseTranslate + diffX}px)`;
  }, {passive: true});

  track.addEventListener('touchend', (e) => {
    if (!isDragging || readingModeActive) return;
    isDragging = false;
    const diffX = currentX - startX;
    const step = getCardWidth();
    
    if (Math.abs(diffX) > 50) {
      if (diffX < 0) {
        currentIndex++; 
      } else {
        currentIndex--; 
      }
    }
    
    if (currentIndex < 0) currentIndex = totalCards - 1;
    
    track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = `translateX(-${currentIndex * step}px)`;
  });

  // Re-adjust on window resize to prevent drifting
  window.addEventListener('resize', () => {
    if (readingModeActive) exitReadingMode(); // safely exit on resize to avoid broken clone math
    const step = getCardWidth();
    track.style.transition = 'none';
    track.style.transform = `translateX(-${currentIndex * step}px)`;
  }, {passive: true});

  // Start the engine
  const initialStep = getCardWidth();
  currentIndex = originalCards.length;
  track.style.transition = 'none';
  track.style.transform = `translateX(-${currentIndex * initialStep}px)`;
  
  setTimeout(startAutoScroll, 100);
});
