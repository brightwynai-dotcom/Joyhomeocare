/* ===================================================
   Joy Homoeo Care – script.js
   =================================================== */

/* ---- Trigger hero load animations ---- */
document.addEventListener('DOMContentLoaded', () => {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    // Small delay so CSS is parsed before class is added
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
      const offset = 80; // header height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
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

/* ---- Testimonials Carousel ---- */
const track    = document.getElementById('testimonialsTrack');
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');
const dotsWrap = document.getElementById('carouselDots');

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
startAutoPlay();
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
