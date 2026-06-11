/* ===================================================
   Joy Homoeo Care ΓÇô script.js
   =================================================== */

/* ---- Trigger hero load animations ---- */
document.addEventListener('DOMContentLoaded', () => {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    // Small delay so CSS is parsed before class is added
    requestAnimationFrame(() => heroContent.classList.add('loaded'));
  }
});


/* ---- Sticky Header ---- */
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ---- Hamburger / Mobile Nav ---- */
const hamburger  = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');

function openMenu() {
  mobileNav.classList.add('open');
  hamburger.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  mobileNav.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger && mobileClose && mobileNav) {
  hamburger.addEventListener('click', openMenu);
  mobileClose.addEventListener('click', closeMenu);
}

// Close on any link click
document.querySelectorAll('.mobile-link, .mobile-nav .btn').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

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

if (track && prevBtn && nextBtn && dotsWrap) {
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

  function startAutoPlay() {
    autoPlayTimer = setInterval(next, 4000);
  }
  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  prevBtn.addEventListener('click', () => { resetAutoPlay(); prev(); });
  nextBtn.addEventListener('click', () => { resetAutoPlay(); next(); });

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { resetAutoPlay(); diff > 0 ? next() : prev(); }
  });

  buildDots();
  startAutoPlay();
  window.addEventListener('resize', () => { buildDots(); goTo(0); });
  window.addEventListener('load', () => { buildDots(); goTo(0); });
}

/* ---- Appointment Form Validation + Toast ---- */
const form      = document.getElementById('appointmentForm');
const toast     = document.getElementById('toast');
const toastMsg  = document.getElementById('toastMsg');
const submitBtn = document.getElementById('submitBtn');

if (form && toast && toastMsg && submitBtn) {
  function setMinDate() {
    const dateInput = document.getElementById('preferredDate');
    if(!dateInput) return;
    const today = new Date();
    const yyyy  = today.getFullYear();
    const mm    = String(today.getMonth() + 1).padStart(2, '0');
    const dd    = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }
  setMinDate();

  function showError(groupId, show) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.classList.toggle('error', show);
  }

  function validateField(groupId, condition) {
    showError(groupId, !condition);
    return condition;
  }

  function showToast(msg, isSuccess = true) {
    toastMsg.textContent = msg;
    const icon = toast.querySelector('.toast-icon');
    if(icon) icon.textContent = isSuccess ? 'Γ£à' : 'ΓÜá∩╕Å';
    toast.style.background = isSuccess ? 'var(--green-dark)' : '#c0392b';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4500);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name      = document.getElementById('patientName').value.trim();
    const phone     = document.getElementById('patientPhone').value.trim();
    const condition = document.getElementById('patientCondition').value;
    const date      = document.getElementById('preferredDate').value;

    const phoneRegex = /^[6-9]\d{9}$/;

    let valid = true;
    valid = validateField('fg-name', name.length >= 2) && valid;
    valid = validateField('fg-phone', phoneRegex.test(phone.replace(/\s/g, ''))) && valid;
    valid = validateField('fg-condition', condition !== '') && valid;
    valid = validateField('fg-date', date !== '') && valid;

    // Live clear errors on input
    ['patientName', 'patientPhone', 'patientCondition', 'preferredDate'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        const fg = document.getElementById(id).closest('.form-group');
        if (fg) fg.classList.remove('error');
      }, { once: true });
    });

    if (!valid) {
      showToast('Please fill in all required fields correctly.', false);
      return;
    }

    // Simulate submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'ΓÅ│  Sending...';

    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Γ£à &nbsp;Confirm Appointment Request';
      showToast(`Thank you, ${name}! Your appointment request has been received. We will call you on ${phone} to confirm.`);
    }, 1400);
  });
}

// Clear individual errors on input change
['patientName', 'patientPhone', 'patientCondition', 'preferredDate'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    const eventType = (el.tagName === 'SELECT') ? 'change' : 'input';
    el.addEventListener(eventType, () => {
      const fg = el.closest('.form-group');
      if (fg) fg.classList.remove('error');
    });
  }
});

/* ---- Scroll to Top Button ---- */
const scrollTopBtn = document.getElementById('scrollTop');

if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  });

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

/* ---- Area of Expertise Accordion ---- */
const accordionItems = document.querySelectorAll('.accordion-item');

accordionItems.forEach(item => {
  const header = item.querySelector('.accordion-header');
  header.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all items
    accordionItems.forEach(i => i.classList.remove('open'));

    // Open clicked item if it was closed
    if (!isOpen) {
      item.classList.add('open');
    }
  });
});

/* ---- Number Counter Animation ---- */
const countElements = document.querySelectorAll('.count-num');
const countObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'));
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 2000; // 2 seconds
      const frameRate = 30; // ms per frame
      const totalFrames = duration / frameRate;
      let currentFrame = 0;

      const counter = setInterval(() => {
        currentFrame++;
        const progress = currentFrame / totalFrames;
        const currentCount = Math.floor(target * progress);

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

countElements.forEach(el => countObserver.observe(el));
