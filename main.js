// ─────────────────────────────────────────────────────────────
// main.js — Mathilde Climbs
// Modules: Nav, Parallax, Scroll Reveal, Testimonial Carousel
// ─────────────────────────────────────────────────────────────

// ─── Logger ──────────────────────────────────────────────────
// Centralised logger so every module tags its output with a
// consistent prefix.  Set DEBUG = false to silence in production.
const DEBUG = true;

const log = {
  info:  (...args) => { if (DEBUG) console.log  ('%c[Mathilde]', 'color:#c45a3c;font-weight:600', ...args); },
  warn:  (...args) => { if (DEBUG) console.warn ('%c[Mathilde]', 'color:#e6a817;font-weight:600', ...args); },
  error: (...args) => { if (DEBUG) console.error('%c[Mathilde]', 'color:#e04040;font-weight:600', ...args); },
  group: (label)   => { if (DEBUG) console.group('%c[Mathilde] ' + label, 'color:#c45a3c;font-weight:600'); },
  groupEnd:        ()  => { if (DEBUG) console.groupEnd(); }
};


// ─── Loader ──────────────────────────────────────────────────
(function initLoader() {
  const loader = document.getElementById('loader');
  const heroBg = document.querySelector('.hero-bg');

  if (!loader || !heroBg) {
    log.warn('initLoader — loader or hero-bg not found, skipping.');
    return;
  }

  log.group('Loader');

  // Check if there's a full-quality image to upgrade to
  const fullSrc = heroBg.dataset.srcFull;
  
  if (!fullSrc) {
    log.warn('No data-src-full on hero-bg — hiding loader immediately.');
    loader.classList.add('done');
    log.groupEnd();
    return;
  }

  // Pull the preview image URL out of the inline style
  const previewMatch = heroBg.style.backgroundImage.match(/url\(['"]?(.+?)['"]?\)/);
  
  if (!previewMatch) {
    log.warn('No preview background-image URL found on hero-bg — hiding loader immediately.');
    loader.classList.add('done');
    log.groupEnd();
    return;
  }

  log.info('Preview image:', previewMatch[1]);
  log.info('Full-quality image:', fullSrc);

  // Wait for the preview to load, then dismiss the loader
  const preview = new Image();
  preview.onload = () => {
    log.info('Preview loaded — dismissing loader.');
    loader.classList.add('done');
    
    // Now upgrade to full quality in the background
    const full = new Image();
    full.onload = () => {
      log.info('Full-quality image loaded — upgrading hero.');
      heroBg.style.backgroundImage = `url('${fullSrc}')`;
      delete heroBg.dataset.srcFull; // Clean up
    };
    full.onerror = () => {
      log.warn('Full-quality image failed to load — staying with preview.');
    };
    full.src = fullSrc;
  };
  
  preview.onerror = () => {
    log.warn('Preview image failed to load — hiding loader anyway.');
    loader.classList.add('done');
  };

  preview.src = previewMatch[1];
  log.groupEnd();
})();


// ─── Lazy Loading ────────────────────────────────────────────
(function initLazyLoad() {
  const lazyImages = document.querySelectorAll('[data-src]');

  log.group('Lazy Loading');
  log.info(`Found ${lazyImages.length} lazy-loadable element(s).`);

  if (lazyImages.length === 0) {
    log.warn('No [data-src] elements — observer not created.');
    log.groupEnd();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target.dataset.src) {
        const el = entry.target;
        const src = el.dataset.src;
        
        log.info('Loading:', src);
        
        // Preload the image
        const img = new Image();
        img.onload = () => {
          el.style.backgroundImage = `url('${src}')`;
          el.classList.add('loaded');
          delete el.dataset.src; // Clean up
          log.info('Loaded:', src);
        };
        img.onerror = () => {
          log.error('Failed to load:', src);
          el.classList.add('error');
        };
        img.src = src;
        
        observer.unobserve(el); // Stop watching once triggered
      }
    });
  }, {
    rootMargin: '200px' // Start loading 200px before element enters viewport
  });

  lazyImages.forEach(el => observer.observe(el));
  log.info('IntersectionObserver attached. Root margin: 200px');
  log.groupEnd();
})();


// ─── Nav ─────────────────────────────────────────────────────
(function initNav() {
  const nav        = document.getElementById('mainNav');
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');

  if (!nav) {
    log.warn('initNav — #mainNav not found, skipping.');
    return;
  }

  log.group('Nav');
  log.info('Initialised. Scroll threshold: 60px');

  // Scroll state is driven by the shared rAF loop (see Parallax),
  // but we expose a small helper so that loop can call us.
  nav._update = function (scrollY) {
    nav.classList.toggle('scrolled', scrollY > 60);
  };

  // Mobile hamburger toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      log.info('Hamburger toggled →', isOpen ? 'open' : 'closed');
    });
    log.info('Hamburger listener attached.');
  } else {
    log.warn('Hamburger or navLinks element missing — mobile menu disabled.');
  }

  log.groupEnd();
})();


// ─── Parallax ────────────────────────────────────────────────
(function initParallax() {
  const heroBg           = document.querySelector('.hero-bg');
  const aboutImg         = document.querySelector('.about-image-wrap .img-placeholder');
  const parallaxBannerBg = document.getElementById('parallaxBanner');
  const nav              = document.getElementById('mainNav');

  log.group('Parallax');

  // Report which targets were found
  log.info('Hero bg:',            heroBg           ? 'found' : 'NOT FOUND');
  log.info('About image:',        aboutImg         ? 'found' : 'NOT FOUND');
  log.info('Parallax banner bg:', parallaxBannerBg ? 'found' : 'NOT FOUND');

  // Shared rAF loop — only one scroll listener for the whole page
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  });

  function update() {
    const scrollY = window.scrollY;

    // 1) Hand off to Nav module
    if (nav && nav._update) nav._update(scrollY);

    // 2) Hero background — 0.4× scroll speed
    if (heroBg) {
      heroBg.style.transform = `translateY(${scrollY * 0.4}px)`;
    }

    // 3) About image — gentle viewport-relative float (±18 px)
    if (aboutImg) {
      const rect     = aboutImg.getBoundingClientRect();
      const winH     = window.innerHeight;
      const progress = (rect.top - winH) / (rect.height + winH); // 1 → -1
      aboutImg.style.transform = `translateY(${progress * -36}px)`;
    }

    // 4) Parallax banner — 0.35× speed relative to its container
    if (parallaxBannerBg) {
      const rect   = parallaxBannerBg.parentElement.getBoundingClientRect();
      const offset = -rect.top;
      parallaxBannerBg.style.transform = `translateY(${offset * 0.35}px)`;
    }

    ticking = false;
  }

  // Fire once immediately so positions are correct before the user scrolls
  update();
  log.info('rAF scroll loop started. Initial update fired.');
  log.groupEnd();
})();


// ─── Scroll Reveal ───────────────────────────────────────────
(function initReveal() {
  const reveals = document.querySelectorAll('.reveal');

  log.group('Scroll Reveal');
  log.info(`Found ${reveals.length} .reveal element(s).`);

  if (reveals.length === 0) {
    log.warn('No .reveal elements — observer not created.');
    log.groupEnd();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
        entry.target.classList.add('visible');
        log.info('Revealed:', entry.target.tagName,
                 entry.target.className.replace('reveal visible', '').trim() || '(no extra class)');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
  log.info('IntersectionObserver attached to all targets.');
  log.groupEnd();
})();


// ─── Testimonial Carousel ────────────────────────────────────
(function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const dots  = document.querySelectorAll('.carousel-dots .dot');

  log.group('Carousel');

  if (!track || dots.length === 0) {
    log.warn('Track or dots not found — carousel disabled.');
    log.groupEnd();
    return;
  }

  let current = 0;
  const total = dots.length;
  let autoplayTimer = null;

  log.info(`Initialised. Slides: ${total}, autoplay interval: 5 s`);

  function goTo(index) {
    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    log.info(`Navigated to slide ${current + 1} / ${total}`);
  }

  // Dot click handlers
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = Number(dot.dataset.index);
      log.info(`Dot clicked → slide ${target + 1}`);
      goTo(target);
      restartAutoplay(); // reset timer so the click doesn't feel "interrupted"
    });
  });
  log.info('Dot click listeners attached.');

  // Autoplay
  function startAutoplay() {
    autoplayTimer = setInterval(() => goTo((current + 1) % total), 5000);
    log.info('Autoplay started.');
  }

  function restartAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    startAutoplay();
  }

  startAutoplay();
  log.groupEnd();
})();