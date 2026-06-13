// Mobile nav toggle
const hamburger = document.getElementById('navHamburger');
const drawer    = document.getElementById('mobileDrawer');
const closeBtn  = document.getElementById('drawerClose');

if (hamburger && drawer && closeBtn) {
  hamburger.addEventListener('click', () => {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
  });

  closeBtn.addEventListener('click', () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
  });

  // Close on link click
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    });
  });
}
