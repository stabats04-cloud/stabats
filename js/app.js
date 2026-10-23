/**
 * Minimalist Pure White Loader with Logo Opacity Breathing & Gaussian Blur Transition
 */
function initPageLoader() {
  if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  if (window.scrollY > 0) {
    window.scrollTo(0, 0);
  }

  const loader = document.getElementById('stabats-loader');
  const root = document.getElementById('stabats-page-root');
  if (!loader) return;

  if (window.__stabatsLoaderInitialized) return;
  window.__stabatsLoaderInitialized = true;

  let revealed = false;
  const minDisplayTime = 750; // Breathing logo clearly perceivable on reload
  const startTime = (window.performance && performance.now) ? performance.now() : Date.now();

  function triggerReveal() {
    if (revealed) return;
    revealed = true;

    if (window.scrollY > 0) {
      window.scrollTo(0, 0);
    }

    if (root) {
      root.classList.remove('is-blurred');
      root.classList.add('is-revealed');
    }

    loader.classList.add('loader-fade-out');

    setTimeout(() => {
      loader.style.display = 'none';
      if (root) {
        root.style.filter = 'none';
        root.style.transform = 'none';
        root.style.willChange = 'auto';
      }
      document.documentElement.classList.add('page-loaded');
      document.body.classList.add('page-loaded');
    }, 500);
  }

  function scheduleReveal() {
    const now = (window.performance && performance.now) ? performance.now() : Date.now();
    const elapsed = now - startTime;
    const remaining = Math.max(0, minDisplayTime - elapsed);
    setTimeout(triggerReveal, remaining);
  }

  if (document.readyState === 'complete') {
    scheduleReveal();
  } else {
    window.addEventListener('load', scheduleReveal);
  }

  // Fallback
  setTimeout(triggerReveal, 1600);

  // bfcache recovery
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      window.scrollTo(0, 0);
      triggerReveal();
    }
  });
}

// Immediately initialize loader lifecycle
if (typeof window !== 'undefined') {
  initPageLoader();
}

function initApp() {
  initPageLoader();
  initSmartScrollNavbar();
  initServicesDropdown();
  initMobileNav();
  initWaterRipplesOnButtons();
  initContactPage();
  initFloatingElements();
  initSmoothAnchorLinks();
  initTimelineScrollEffect();
  initWhyStabatsReveal();
  initStickyStackedCards();
  initScrollReelLeadership();
  initTextGradientScroll();
  initAppleFluidInteractions();
  initFooterModals();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/* ==========================================================================
   1. Smart Auto-Hiding Navbar on Scroll (Hide on Down, Unhide on Up)
   ========================================================================== */
function initSmartScrollNavbar() {
  const wrapper = document.getElementById('navbar-notch-wrapper') || 
                  document.querySelector('.navbar-notch-wrapper') || 
                  document.querySelector('.fixed.top-0.left-0.right-0.z-50');
  if (!wrapper) return;

  wrapper.classList.add('navbar-notch-wrapper');

  let lastScrollY = Math.max(0, window.scrollY || 0);
  let ticking = false;
  const scrollThreshold = 6; // Snappy threshold for immediate responsiveness
  let accumulatedDelta = 0;

  function updateNavbar() {
    const currentScrollY = Math.max(0, window.scrollY || 0);
    const delta = currentScrollY - lastScrollY;

    // Scrolled state for elevated shadow and border transition
    if (currentScrollY > 20) {
      wrapper.classList.add('nav-scrolled');
    } else {
      wrapper.classList.remove('nav-scrolled');
    }

    // At top of page: always reveal
    if (currentScrollY <= 20) {
      wrapper.classList.remove('nav-hidden');
      wrapper.classList.add('nav-visible');
      accumulatedDelta = 0;
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }

    // If dropdown or mobile menu is open, keep navbar visible
    const dropdown = document.getElementById('services-dropdown');
    const isDropdownOpen = dropdown && dropdown.classList.contains('is-open');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const isMobileOpen = mobileDrawer && (mobileDrawer.classList.contains('drawer-open') || !mobileDrawer.classList.contains('hidden'));

    if (isDropdownOpen || isMobileOpen) {
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }

    // Accumulate scroll in same direction
    if ((delta > 0 && accumulatedDelta < 0) || (delta < 0 && accumulatedDelta > 0)) {
      accumulatedDelta = delta;
    } else {
      accumulatedDelta += delta;
    }

    // Scroll Down -> Hide navbar
    if (accumulatedDelta > scrollThreshold && currentScrollY > 60) {
      wrapper.classList.add('nav-hidden');
      wrapper.classList.remove('nav-visible');
      
      // Auto-close dropdown if hovering had left it open
      if (dropdown && dropdown.style.opacity === '1') {
        dropdown.classList.remove('is-open');
        dropdown.style.opacity = '0';
        dropdown.style.pointerEvents = 'none';
        const trigger = document.getElementById('services-menu-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        const chevron = document.getElementById('services-chevron');
        if (chevron) chevron.classList.remove('rotate-180');
      }
    } 
    // Scroll Up -> Unhide navbar
    else if (accumulatedDelta < -scrollThreshold) {
      wrapper.classList.remove('nav-hidden');
      wrapper.classList.add('nav-visible');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });
}


/* ==========================================================================
   2. Services Mega-Menu Dropdown Logic (Smooth Slide from Behind Navbar)
   ========================================================================== */
function initServicesDropdown() {
  const trigger = document.getElementById('services-menu-trigger');
  const dropdown = document.getElementById('services-dropdown');
  const chevron = document.getElementById('services-chevron');
  const navbar = document.getElementById('water-navbar');
  if (!trigger || !dropdown) return;

  let closeTimeout;

  function openDropdown() {
    clearTimeout(closeTimeout);
    dropdown.classList.add('is-open');
    dropdown.style.opacity = '1';
    dropdown.style.transform = 'translate(-50%, 0)';
    dropdown.style.pointerEvents = 'auto';
    trigger.setAttribute('aria-expanded', 'true');
    if (chevron) chevron.classList.add('rotate-180');
  }

  function closeDropdown() {
    clearTimeout(closeTimeout);
    closeTimeout = setTimeout(() => {
      dropdown.classList.remove('is-open');
      dropdown.style.opacity = '0';
      dropdown.style.transform = 'translate(-50%, -24px)';
      dropdown.style.pointerEvents = 'none';
      trigger.setAttribute('aria-expanded', 'false');
      if (chevron) chevron.classList.remove('rotate-180');
    }, 280);
  }

  // Hover triggers
  trigger.addEventListener('mouseenter', openDropdown);
  trigger.addEventListener('mouseleave', closeDropdown);

  dropdown.addEventListener('mouseenter', openDropdown);
  dropdown.addEventListener('mouseleave', closeDropdown);

  // Keep dropdown open when moving cursor through navbar towards dropdown
  if (navbar) {
    navbar.addEventListener('mouseenter', () => {
      if (dropdown.classList.contains('is-open')) {
        clearTimeout(closeTimeout);
      }
    });
  }

  // Click toggle behavior
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    if (dropdown.classList.contains('is-open')) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  // Close when pressing Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdown();
  });

  // Close if clicking outside
  document.addEventListener('click', (e) => {
    if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });
}

/* ==========================================================================
   3. Mobile Navigation Drawer & Accordion
   ========================================================================== */
/* ==========================================================================
   3. Mobile Navigation Drawer & Accordion (Fluid Apple-Grade Transitions)
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('mobile-drawer-close');
  const servicesAccordionBtn = document.getElementById('mobile-services-accordion-btn');
  const servicesAccordionContent = document.getElementById('mobile-services-content');
  const servicesAccordionChevron = document.getElementById('mobile-services-chevron');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (toggleBtn && drawer) {
    // Ensure clean initial state
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('drawer-closed');
    drawer.setAttribute('aria-hidden', 'true');

    let isAnimating = false;

    const openDrawer = () => {
      if (isAnimating) return;
      isAnimating = true;

      // 1. Unhide container
      drawer.classList.remove('hidden');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // 2. Force layout reflow so drawer-closed state is established before animating
      void drawer.offsetWidth;

      // 3. Trigger fluid opening transitions
      drawer.classList.remove('drawer-closed');
      drawer.classList.add('drawer-open');

      // 4. Staggered link entrance animation (Signature iOS fluid cascade)
      const links = drawer.querySelectorAll('.mobile-nav-link, #mobile-services-accordion-btn');
      links.forEach((link, idx) => {
        link.style.opacity = '0';
        link.style.transform = 'translateX(14px)';
        link.style.transition = `opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 25 + 70}ms, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 25 + 70}ms`;
        requestAnimationFrame(() => {
          link.style.opacity = '1';
          link.style.transform = 'translateX(0)';
        });
      });

      setTimeout(() => {
        isAnimating = false;
      }, 380);
    };

    const closeDrawer = () => {
      if (isAnimating) return;
      isAnimating = true;

      drawer.classList.remove('drawer-open');
      drawer.classList.add('drawer-closed');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      // Reset links inline styles
      const links = drawer.querySelectorAll('.mobile-nav-link, #mobile-services-accordion-btn');
      links.forEach(link => {
        link.style.transition = '';
        link.style.opacity = '';
        link.style.transform = '';
      });

      // Hide container after slide animation settles
      setTimeout(() => {
        if (drawer.classList.contains('drawer-closed')) {
          drawer.classList.add('hidden');
        }
        isAnimating = false;
      }, 380);
    };

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (drawer.classList.contains('drawer-open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDrawer();
      });
    }

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });

    drawer.addEventListener('click', (e) => {
      const panel = drawer.querySelector('.mobile-drawer-panel') || drawer.firstElementChild;
      if (panel && !panel.contains(e.target)) {
        closeDrawer();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('drawer-open')) {
        closeDrawer();
      }
    });
  }

  // Fluid Accordion for Services in Mobile Menu
  if (servicesAccordionBtn && servicesAccordionContent) {
    servicesAccordionContent.classList.remove('hidden');
    servicesAccordionContent.classList.add('accordion-closed');

    servicesAccordionBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = servicesAccordionContent.classList.contains('accordion-open');
      if (isOpen) {
        servicesAccordionContent.classList.remove('accordion-open');
        servicesAccordionContent.classList.add('accordion-closed');
        if (servicesAccordionChevron) {
          servicesAccordionChevron.classList.remove('rotate-180');
        }
      } else {
        servicesAccordionContent.classList.remove('accordion-closed');
        servicesAccordionContent.classList.add('accordion-open');
        if (servicesAccordionChevron) {
          servicesAccordionChevron.classList.add('rotate-180');
        }
      }
    });
  }
}

/* ==========================================================================
   4. Water Droplet Button Click Effect (Tactile Feedback)
   ========================================================================== */
function initWaterRipplesOnButtons() {
  const buttons = document.querySelectorAll('.water-ripple-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.className = 'absolute rounded-full bg-white/40 pointer-events-none animate-ping';
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

/* ==========================================================================
   11. Text Gradient Scroll Component (Framer Motion & Tailwind Scroll Ideology)
   Dynamically shifts gradient and reveals text as the user scrolls
   ========================================================================== */
function initTextGradientScroll() {
  const scrollElements = document.querySelectorAll('.text-gradient-scroll');
  const headingElements = document.querySelectorAll('[data-text-gradient-heading]');

  if (!scrollElements.length && !headingElements.length) return;

  // 1. Split text in paragraphs into word spans
  scrollElements.forEach(el => {
    if (el.dataset.initialized) return;
    el.dataset.initialized = 'true';

    const rawText = el.textContent.trim();
    const words = rawText.split(/\s+/);

    el.innerHTML = words.map((word, i) => {
      return `<span class="scroll-word" data-word-idx="${i}">${word}</span>`;
    }).join(' ');
  });

  // 2. Dynamic Scroll Engine
  function updateTextGradients() {
    const vh = window.innerHeight;

    // A. Animate word-by-word gradient color transition
    scrollElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const spans = el.querySelectorAll('.scroll-word');
      const totalWords = spans.length;
      if (!totalWords) return;

      // Enter window at 85% from top, fully illuminated by 35% from top
      const start = vh * 0.88;
      const end = vh * 0.32;
      const progress = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);
      const activeWordCount = Math.floor(progress * totalWords);

      spans.forEach((span, idx) => {
        if (idx <= activeWordCount) {
          span.classList.add('is-active');
        } else {
          span.classList.remove('is-active');
        }
      });
    });

    // B. Animate heading gradient shift
    headingElements.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      const start = vh;
      const end = -rect.height;
      const progress = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);
      heading.style.backgroundPosition = `${progress * 100}% center`;
    });
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateTextGradients();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  
  // Initial frame
  requestAnimationFrame(updateTextGradients);
}
/* ==========================================================================
   7. Smooth Floating Background Elements & Mouse Parallax Motion Engine
   ========================================================================== */
function initFloatingElements() {
  const elements = document.querySelectorAll('[data-float-speed]');
  if (!elements.length) return;

  elements.forEach((el) => {
    el.style.willChange = 'transform';
  });

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let rafId = null;

  function renderFloat() {
    if (window.scrollY > window.innerHeight * 1.1) {
      rafId = null;
      return;
    }

    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;

    const diff = Math.abs(targetX - currentX) + Math.abs(targetY - currentY);

    elements.forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-float-speed') || '20');
      const x = (currentX * speed).toFixed(2);
      const y = (currentY * speed).toFixed(2);
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    if (diff > 0.001) {
      rafId = requestAnimationFrame(renderFloat);
    } else {
      rafId = null;
    }
  }

  function startFloat() {
    if (!rafId && window.scrollY <= window.innerHeight * 1.1) {
      rafId = requestAnimationFrame(renderFloat);
    }
  }

  window.addEventListener('mousemove', (e) => {
    if (window.scrollY > window.innerHeight * 1.1) return;
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    startFloat();
  }, { passive: true });

  startFloat();
}

/* ==========================================================================
   5. Contact / Discovery Form & Parallel Google Sheets Submission (for get-in-touch.html)
   ========================================================================== */
/**
 * GOOGLE SHEETS WEBHOOK CONFIGURATION
 * --------------------------------------------------------------------------
 * Directly saves submissions into your Google Sheet without needing Google Forms
 * or entry IDs. Follow the instructions to paste your Web App URL.
 */
const GOOGLE_SHEET_CONFIG = {
  // Google Apps Script Web App URL:
  webhookUrl: "https://script.google.com/macros/s/AKfycbxqUE_KfvrliZfOnTAxwF3AOOgWhOsNgKV3WS1rLtJU8ycyF8XJduoIISzpsJWJYeTw/exec"
};

/**
 * Dispatches inquiry data directly to Google Sheets asynchronously in parallel
 * utilizing mode: 'no-cors' so requests succeed cleanly without CORS blockages.
 */
async function submitToGoogleSheet(data) {
  if (!GOOGLE_SHEET_CONFIG.webhookUrl) {
    console.info('[Google Sheets Integration] Notice: GOOGLE_SHEET_CONFIG.webhookUrl is empty. Paste your Google Apps Script Web App URL in js/app.js to record responses to your sheet.');
    return;
  }

  try {
    const payload = new URLSearchParams({
      timestamp: new Date().toLocaleString(),
      firstName: data.firstName || '',
      lastName:  data.lastName || '',
      phone:     data.phone || '',
      email:     data.email || '',
      service:   data.service || '',
      message:   data.message || ''
    });

    await fetch(GOOGLE_SHEET_CONFIG.webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: payload.toString()
    });

    console.info('[Google Sheets Integration] Entry successfully posted to Google Sheet.');
  } catch (err) {
    console.error('[Google Sheets Integration] Submission error:', err);
  }
}

function initContactPage() {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('contact-alert');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-2"></i> Sending Inquiry...';
    }

    // Extract user input values
    const formData = new FormData(form);
    const data = {
      firstName: (formData.get('firstName') || '').toString().trim(),
      lastName:  (formData.get('lastName') || '').toString().trim(),
      phone:     (formData.get('phone') || '').toString().trim(),
      email:     (formData.get('email') || '').toString().trim(),
      service:   (formData.get('service') || '').toString().trim(),
      message:   (formData.get('message') || '').toString().trim()
    };

    // Parallel dispatch to Google Sheet
    const sheetSubmissionPromise = submitToGoogleSheet(data);

    // Wait for dispatch or minimum 700ms smooth UI feedback
    await Promise.allSettled([
      sheetSubmissionPromise,
      new Promise((resolve) => setTimeout(resolve, 700))
    ]);

    // Display success notification
    if (alertBox) {
      alertBox.classList.remove('hidden');
      alertBox.classList.add('flex');
    }

    // Reset form fields
    form.reset();

    // Reset custom dropdown label and selection state
    const serviceLabel = document.getElementById('service-dropdown-label');
    if (serviceLabel) {
      serviceLabel.textContent = 'Services';
      serviceLabel.classList.remove('text-slate-900', 'font-medium');
      serviceLabel.classList.add('text-slate-400');
    }
    document.querySelectorAll('.service-option').forEach((opt) => opt.removeAttribute('data-selected'));

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>Message Transmitted Successfully</span> <i class="fa-solid fa-check ml-2"></i>';
      setTimeout(() => {
        btn.innerHTML = '<span>Submit</span>';
      }, 4000);
    }
  });
}

/* ==========================================================================
   6. Native Anchor Click Smooth Navigation (Non-blocking, 100% Native Scrolling)
   ========================================================================== */
function initSmoothAnchorLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#' && targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

/* ==========================================================================
   8. Dynamic Vertical Scroll Timeline Progress Line & Milestone Reveals
   ========================================================================== */
function initTimelineScrollEffect() {
  const timeline = document.getElementById('about-timeline');
  const progressLine = document.getElementById('timeline-progress-line');
  const bgTrack = document.getElementById('timeline-bg-track');
  const nodes = document.querySelectorAll('.timeline-node');
  const rows = document.querySelectorAll('.timeline-step-row');
  if (!timeline || !progressLine || nodes.length === 0) return;

  let ticking = false;

  function updateTimeline() {
    const timelineRect = timeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Read trigger point: positioned in lower-middle viewport for earlier, snappier reveal
    const triggerY = windowHeight * 0.72;

    const firstNode = nodes[0];
    const lastNode = nodes[nodes.length - 1];

    const firstNodeRect = firstNode.getBoundingClientRect();
    const lastNodeRect = lastNode.getBoundingClientRect();

    const firstNodeCenterInTimeline = (firstNodeRect.top + firstNodeRect.height / 2) - timelineRect.top;
    const lastNodeCenterInTimeline = (lastNodeRect.top + lastNodeRect.height / 2) - timelineRect.top;
    const totalSpan = lastNodeCenterInTimeline - firstNodeCenterInTimeline;

    // Anchor background track cleanly from first node to last node
    if (bgTrack) {
      bgTrack.style.top = `${firstNodeCenterInTimeline}px`;
      bgTrack.style.height = `${Math.max(0, totalSpan)}px`;
    }

    // Anchor progress line starting at first node center
    progressLine.style.top = `${firstNodeCenterInTimeline}px`;

    // Viewport coordinates of first and last nodes
    const firstNodeScreenY = firstNodeRect.top + firstNodeRect.height / 2;
    const lastNodeScreenY = lastNodeRect.top + lastNodeRect.height / 2;
    const screenSpan = lastNodeScreenY - firstNodeScreenY;

    let progress = 0;
    if (screenSpan > 0) {
      if (triggerY <= firstNodeScreenY) {
        progress = 0;
      } else if (triggerY >= lastNodeScreenY) {
        progress = 1;
      } else {
        progress = (triggerY - firstNodeScreenY) / screenSpan;
      }
    }
    progress = Math.max(0, Math.min(1, progress));

    const currentLineHeight = progress * totalSpan;
    progressLine.style.height = `${currentLineHeight.toFixed(1)}px`;

    // Current line tip position in viewport coordinates
    const currentLineTipScreenY = firstNodeScreenY + (progress * screenSpan);

    // Reveal each milestone sequentially as the line touches its node (with smooth anticipatory trigger)
    nodes.forEach((node, index) => {
      const nodeRect = node.getBoundingClientRect();
      const nodeCenterScreenY = nodeRect.top + nodeRect.height / 2;
      const row = rows[index];

      // Trigger node and row as the line approaches / reaches this milestone node
      if (currentLineTipScreenY >= nodeCenterScreenY - 40) {
        node.classList.add('is-active');
        if (row) row.classList.add('is-visible');
      } else {
        node.classList.remove('is-active');
        if (row) row.classList.remove('is-visible');
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateTimeline);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateTimeline);
      ticking = true;
    }
  }, { passive: true });

  // Initial runs
  updateTimeline();
  window.addEventListener('load', updateTimeline);
  setTimeout(updateTimeline, 200);
}

/* ==========================================================================
   9. Why Stabats Scroll Reveal Cards (Slide in from Right on Scroll)
   ========================================================================== */
function initWhyStabatsReveal() {
  const cards = document.querySelectorAll('.why-reveal-card');
  if (!cards.length) return;

  function checkCards() {
    const windowHeight = window.innerHeight;
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      // If card enters the bottom 92% of viewport
      if (rect.top <= windowHeight * 0.92 && rect.bottom >= -100) {
        card.classList.add('is-revealed');
      }
    });
  }

  window.addEventListener('scroll', checkCards, { passive: true });
  window.addEventListener('resize', checkCards, { passive: true });
  checkCards();
  window.addEventListener('load', checkCards);
  setTimeout(checkCards, 200);
}

/* ==========================================================================
   10. Images Scrolling Animation - Sticky Stacked Cards Methodology
   ========================================================================== */
function initStickyStackedCards() {
  const container = document.getElementById('sticky-cards-stack');
  const cards = document.querySelectorAll('.sticky-stack-card');
  if (!container || !cards.length) return;

  const total = cards.length;
  let ticking = false;

  function updateCardScales() {
    cards.forEach((card, i) => {
      // Methodology: targetScale = Math.max(0.7, 1 - (total - i - 1) * 0.05)
      const targetScale = Math.max(0.75, 1 - (total - i - 1) * 0.05);

      if (i === total - 1) {
        card.style.transform = 'scale(1)';
        card.style.filter = 'brightness(1)';
        return;
      }

      const nextCard = cards[i + 1];
      if (!nextCard) return;

      const cardRect = card.getBoundingClientRect();
      const nextCardRect = nextCard.getBoundingClientRect();

      // Next card approaches and overlaps this card
      const distance = nextCardRect.top - cardRect.top;
      const triggerDistance = cardRect.height * 1.05;

      if (distance < triggerDistance) {
        // Progress 0 (just entering threshold) -> 1 (fully reached sticky position)
        const progress = Math.min(1, Math.max(0, 1 - (distance / triggerDistance)));
        const currentScale = 1 - progress * (1 - targetScale);
        const brightness = 1 - (progress * 0.07);

        card.style.transform = `scale(${currentScale.toFixed(4)})`;
        card.style.filter = `brightness(${brightness.toFixed(3)})`;
      } else {
        card.style.transform = 'scale(1)';
        card.style.filter = 'brightness(1)';
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateCardScales);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateCardScales);
      ticking = true;
    }
  }, { passive: true });

  updateCardScales();
  window.addEventListener('load', updateCardScales);
  setTimeout(updateCardScales, 250);
}

/* ==========================================================================
   11. Scroll Reel Testimonials Methodology (Founding Architects & Leadership)
   ========================================================================== */
function initScrollReelLeadership() {
  const reelRoot = document.getElementById('leadership-scroll-reel');
  const leftCol = document.getElementById('reel-col-left');
  const midCol = document.getElementById('reel-col-mid');
  const rightCol = document.getElementById('reel-col-right');

  const sizerQuote = document.getElementById('reel-sizer-quote');
  const sizerAuthor = document.getElementById('reel-sizer-author');
  const sizerRole = document.getElementById('reel-sizer-role');

  const activeText = document.getElementById('reel-active-text');
  const activeQuote = document.getElementById('reel-active-quote');
  const activeAuthor = document.getElementById('reel-active-author');
  const activeRole = document.getElementById('reel-active-role');

  const currentIndexEl = document.getElementById('reel-current-index');
  const prevBtn = document.getElementById('reel-prev-btn');
  const nextBtn = document.getElementById('reel-next-btn');
  const navCards = document.querySelectorAll('.leader-nav-card');

  if (!reelRoot || !midCol) return;

  const LEADERS = [
    {
      name: "Aravindh Cherala",
      role: "Co-Founder",
      quote: "We architect systems that turn raw organizational complexity into frictionless speed and unyielding leverage.",
      image: "assets/founder-avatar.jpg",
      alt: "Portrait of Aravindh Cherala - Co-Founder"
    },
    {
      name: "Bojja Nikhilesh",
      role: "Co-Founder",
      quote: "Building software is not about accumulating features; it is about engineering clean, uncompromising leverage with zero tech debt.",
      image: "assets/founder-avatar.jpg",
      alt: "Portrait of Bojja Nikhilesh - Co-Founder"
    },
    {
      name: "Nallavelli Varun Tej Reddy",
      role: "Co-Founder",
      quote: "From bespoke workflows to full-scale enterprise architectures, our purpose is to build tools that leaders never outgrow.",
      image: "assets/founder-avatar.jpg",
      alt: "Portrait of Nallavelli Varun Tej Reddy - Co-Founder"
    },
    {
      name: "Srilamanthula Sanjay",
      role: "Chief Technology Officer (CTO)",
      quote: "True technical excellence is invisible in runtime resilience: fault-tolerant microservices, autonomous triggers, and zero-latency loops.",
      image: "assets/founder-avatar.jpg",
      alt: "Portrait of Srilamanthula Sanjay - CTO"
    }
  ];

  const count = LEADERS.length;
  const CELL = 121.33;
  const GAP = 8;
  const STEP = 3 * (CELL + GAP); // 388px
  const EXIT_MS = 240;
  const SLIDE_MS = 800;
  const STAGGER_MS = 6;
  const FEATURED_SHADOW = "0 1.008px 0.705px -0.563px rgba(0,0,0,0.18), 0 2.389px 1.672px -1.125px rgba(0,0,0,0.17), 0 4.357px 3.05px -1.688px rgba(0,0,0,0.17), 0 7.244px 5.07px -2.25px rgba(0,0,0,0.16), 0 11.698px 8.188px -2.813px rgba(0,0,0,0.15), 0 19.148px 13.404px -3.375px rgba(0,0,0,0.13), 0 32.972px 23.08px -3.938px rgba(0,0,0,0.09), 0 60px 42px -4.5px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.6)";

  let currentIndex = 0;
  let isAnimating = false;
  let timeouts = [];

  // Generate placeholder cell HTML
  function createCellHTML() {
    return `<div aria-hidden="true" class="shrink-0 rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-100 to-white blur-[1px] shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_2px_0_rgba(255,255,255,1)]" style="width: ${CELL}px; height: ${CELL}px;"></div>`;
  }

  // Generate featured portrait cell HTML
  function createFeaturedHTML(leader) {
    return `
      <div class="relative shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-900/10" style="width: ${CELL}px; height: ${CELL}px; box-shadow: ${FEATURED_SHADOW};">
        <img src="${leader.image}" alt="${leader.alt}" loading="lazy" class="absolute inset-0 h-full w-full object-cover object-center bg-white">
        <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-[2] bg-white mix-blend-saturation opacity-80"></div>
        <div aria-hidden="true" class="pointer-events-none absolute inset-0 z-[3] blur-[6px] mix-blend-overlay" style="background: linear-gradient(220.99deg, rgba(108,92,255,0) 32%, rgb(108,92,255) 41%, rgb(173,177,255) 47%, rgba(130,189,237,0.57) 54%, rgba(130,189,237,0) 65%);"></div>
      </div>
    `;
  }

  // Populate Columns
  const sideCellCount = 4 + 2 * count; // 12
  let sideHTML = '';
  for (let i = 0; i < sideCellCount; i++) {
    sideHTML += createCellHTML();
  }
  if (leftCol) leftCol.innerHTML = sideHTML;
  if (rightCol) rightCol.innerHTML = sideHTML;

  let midHTML = '';
  for (let i = 0; i < 3; i++) midHTML += createCellHTML();
  LEADERS.forEach((leader, i) => {
    midHTML += createFeaturedHTML(leader);
    if (i < count - 1) {
      midHTML += createCellHTML() + createCellHTML();
    }
  });
  for (let i = 0; i < 3; i++) midHTML += createCellHTML();
  midCol.innerHTML = midHTML;

  // Split text into animated word and character spans
  function renderCharsHTML(text, startIndex, staggerMs) {
    let idx = startIndex;
    const words = text.split(" ");
    return words.map((word, wi) => {
      const charSpans = Array.from(word).map((ch) => {
        const delay = idx * staggerMs;
        idx++;
        return `<span class="scroll-reel-char" style="animation-delay: ${delay}ms;">${ch}</span>`;
      }).join('');
      if (wi < words.length - 1) idx++;
      return `<span class="inline-block whitespace-nowrap">${charSpans}</span>${wi < words.length - 1 ? ' ' : ''}`;
    }).join('');
  }

  // Apply translations to reel columns
  function updateReelPosition(index, animate = true) {
    const centerIdx = (count - 1) / 2;
    const middleY = (centerIdx - index) * STEP;
    const sideY = -middleY;

    const transitionValue = animate ? `transform ${SLIDE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)` : 'none';

    if (midCol) {
      midCol.style.transition = transitionValue;
      midCol.style.transform = `translateY(${middleY}px)`;
    }
    if (leftCol) {
      leftCol.style.transition = transitionValue;
      leftCol.style.transform = `translateY(${sideY}px)`;
    }
    if (rightCol) {
      rightCol.style.transition = transitionValue;
      rightCol.style.transform = `translateY(${sideY}px)`;
    }
  }

  // Update text with rise animation
  function updateTextStage(leader) {
    // Sizer elements ensure layout never jumps
    if (sizerQuote) sizerQuote.textContent = leader.quote;
    if (sizerAuthor) sizerAuthor.textContent = leader.name;
    if (sizerRole) sizerRole.textContent = leader.role;

    // Active stage renders animated characters
    if (activeQuote) {
      activeQuote.innerHTML = renderCharsHTML(leader.quote, 0, STAGGER_MS);
    }
    if (activeAuthor) {
      activeAuthor.innerHTML = renderCharsHTML(leader.name, leader.quote.length + 6, STAGGER_MS);
    }
    if (activeRole) {
      activeRole.innerHTML = renderCharsHTML(leader.role, leader.quote.length + leader.name.length + 12, STAGGER_MS);
    }
  }

  // Main pagination function with circular wrapping
  function goToLeader(newIndex) {
    const targetIndex = ((newIndex % count) + count) % count;
    if (isAnimating || targetIndex === currentIndex) return;
    isAnimating = true;

    timeouts.forEach(clearTimeout);
    timeouts = [];

    // 1. Reel slide
    updateReelPosition(targetIndex, true);

    // 2. Text exit animation
    if (activeText) activeText.classList.add('scroll-reel-exit');

    // 3. Mount new text at EXIT_MS
    timeouts.push(setTimeout(() => {
      currentIndex = targetIndex;
      const leader = LEADERS[currentIndex];
      updateTextStage(leader);
      if (activeText) activeText.classList.remove('scroll-reel-exit');

      // Update index indicator
      if (currentIndexEl) {
        currentIndexEl.textContent = `0${currentIndex + 1}`;
      }

      // Update button states - keep both enabled for circular navigation
      if (prevBtn) prevBtn.disabled = false;
      if (nextBtn) nextBtn.disabled = false;

      // Update active nav cards
      navCards.forEach((card, idx) => {
        if (idx === currentIndex) {
          card.classList.add('border-blue-500/80', 'ring-2', 'ring-blue-500/20', 'shadow-md');
          card.classList.remove('border-slate-200', 'shadow-sm');
        } else {
          card.classList.remove('border-blue-500/80', 'ring-2', 'ring-blue-500/20', 'shadow-md');
          card.classList.add('border-slate-200', 'shadow-sm');
        }
      });
    }, EXIT_MS));

    // 4. Unlock interaction at SLIDE_MS
    timeouts.push(setTimeout(() => {
      isAnimating = false;
    }, SLIDE_MS));
  }

  // Dynamic Autoplay: advance slides every 3 seconds
  const AUTO_PLAY_INTERVAL = 3000;
  let autoPlayTimer = null;
  let isHovered = false;

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      if (!isHovered && !document.hidden) {
        goToLeader(currentIndex + 1);
      }
    }, AUTO_PLAY_INTERVAL);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Initial render (no slide-in) and start auto rotation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      updateReelPosition(0, false);
      updateTextStage(LEADERS[0]);
      if (prevBtn) prevBtn.disabled = false;
      if (nextBtn) nextBtn.disabled = false;
      startAutoPlay();
    });
  });

  // Pause on hover over reel and interactive cards; resume on leave
  reelRoot.addEventListener('mouseenter', () => {
    isHovered = true;
  });

  reelRoot.addEventListener('mouseleave', () => {
    isHovered = false;
    resetAutoPlay();
  });

  // Controls Event Listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToLeader(currentIndex - 1);
      resetAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToLeader(currentIndex + 1);
      resetAutoPlay();
    });
  }

  // Interactive Leader Cards
  navCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      isHovered = true;
    });
    card.addEventListener('mouseleave', () => {
      isHovered = false;
      resetAutoPlay();
    });
    card.addEventListener('click', () => {
      const targetIndex = parseInt(card.getAttribute('data-leader-index'), 10);
      if (!isNaN(targetIndex)) {
        goToLeader(targetIndex);
        resetAutoPlay();
      }
    });
  });

  // Keyboard Navigation on Region
  reelRoot.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToLeader(currentIndex + 1);
      resetAutoPlay();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToLeader(currentIndex - 1);
      resetAutoPlay();
    }
  });

  // Pause when tab hidden, resume when active
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });
}

/* ==========================================================================
   Apple Design: Fluid Interface & Motion Engine
   WWDC Designing Fluid Interfaces & emilkowalski/skills/apple-design
   ========================================================================== */

/**
 * Apple Rubber-Banding: Soft boundaries with progressive resistance (§9)
 */
function appleRubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/**
 * Apple Momentum Projection: Exponential-decay scroll projection (§6)
 */
function appleProjectMomentum(initialVelocity, decelerationRate = 0.998) {
  return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
}

/**
 * Initialize Apple Fluid Interactions across the UI:
 * 1. Zero-latency pointer-down response on touchable elements (Kill Latency - §1)
 * 2. 10px hysteresis & cancel-by-dragging-away (§10)
 * 3. Fluid micro-tilt & soft boundary rubber-banding on interactive cards (§2 & §9)
 */
function initAppleFluidInteractions() {
  // Check if reduced motion is preferred
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // 1. Tactile Pointer-Down Feedback for Buttons & Controls (§1, §10)
  const interactiveSelector = `
    button, 
    a[href].btn-interactive, 
    a.apple-pressable,
    .apple-pressable,
    .timeline-node,
    #services-menu-trigger,
    .why-reveal-card
  `;

  document.addEventListener('pointerdown', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;

    const rect = target.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    let isPressed = true;

    // Apply immediate tactile compression on pointer-down (zero latency)
    target.style.transition = 'transform 80ms cubic-bezier(0.16, 1, 0.3, 1)';
    target.style.transform = 'scale(0.972)';

    // Subtle tactile tick if supported
    if (navigator.vibrate) {
      try { navigator.vibrate(8); } catch (_) {}
    }

    function onPointerMove(moveEvent) {
      if (!isPressed) return;
      // 25px hysteresis threshold for dragging away to cancel
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const dist = Math.hypot(dx, dy);

      const isInside = (
        moveEvent.clientX >= rect.left - 15 &&
        moveEvent.clientX <= rect.right + 15 &&
        moveEvent.clientY >= rect.top - 15 &&
        moveEvent.clientY <= rect.bottom + 15
      );

      if (!isInside && dist > 25) {
        // Dragged away - softly release press state
        target.style.transition = 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)';
        target.style.transform = '';
        isPressed = false;
      } else if (isInside && !isPressed) {
        // Returned back inside hit boundary - re-engage
        target.style.transition = 'transform 80ms cubic-bezier(0.16, 1, 0.3, 1)';
        target.style.transform = 'scale(0.972)';
        isPressed = true;
      }
    }

    function onPointerEnd() {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);

      // Critically damped spring return settle (§4)
      target.style.transition = 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)';
      target.style.transform = '';
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerEnd, { once: true });
    window.addEventListener('pointercancel', onPointerEnd, { once: true });
  }, { passive: true });

  // 2. Interactive Surface Rubber-Banding on Cards (§9)
  const surfaceCards = document.querySelectorAll('.why-reveal-card, .apple-card-interactive');
  surfaceCards.forEach((card) => {
    let cardRect = null;
    let rafId = null;

    card.addEventListener('mouseenter', () => {
      cardRect = card.getBoundingClientRect();
      card.style.transition = 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 320ms cubic-bezier(0.16, 1, 0.3, 1)';
    });

    card.addEventListener('mousemove', (e) => {
      if (!cardRect) cardRect = card.getBoundingClientRect();
      const centerX = cardRect.left + cardRect.width / 2;
      const centerY = cardRect.top + cardRect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        // Apply Apple rubberband formula to dampen tilt at extremities
        const dampedX = appleRubberband(deltaX, cardRect.width, 0.45);
        const dampedY = appleRubberband(deltaY, cardRect.height, 0.45);

        const rotY = (dampedX / (cardRect.width / 2)) * 4.5;
        const rotX = -(dampedY / (cardRect.height / 2)) * 4.5;

        card.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-2px)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      // Apple critically damped spring return to natural presentation
      card.style.transition = 'transform 480ms cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = '';
      cardRect = null;
    });
  });
}

/* ==========================================================================
   14. Footer Modal & Content Overlay Engine
   Handles popup modals for: Documentation, Architecture, Case Studies, Support,
   Privacy Policy, Terms of Service, and Cookies Settings without changing visual footer layout.
   ========================================================================== */
function initFooterModals() {
  if (document.getElementById('stabats-modal-backdrop')) return;

  // 1. Inject Modal DOM Structure
  const modalHTML = `
    <div id="stabats-modal-backdrop" class="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 opacity-0 pointer-events-none transition-all duration-300 ease-out" role="dialog" aria-modal="true" aria-hidden="true">
      <div id="stabats-modal-card" class="relative w-full max-w-2xl sm:max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform scale-95 opacity-0 transition-all duration-300 ease-out flex flex-col max-h-[90vh]">
        
        <!-- Modal Header -->
        <div class="px-5 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/80 shrink-0">
          <div class="flex items-center gap-3.5 min-w-0">
            <div id="stabats-modal-icon-container" class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center shrink-0 text-blue-600 shadow-sm">
              <i id="stabats-modal-icon" class="fa-solid fa-layer-group text-lg"></i>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h3 id="stabats-modal-title" class="text-lg sm:text-xl font-extrabold font-display text-slate-900 tracking-tight">Modal Title</h3>
              </div>
            </div>
          </div>
          <button id="stabats-modal-close-btn" class="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300/80 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all shrink-0 focus:outline-none" aria-label="Close dialog">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div id="stabats-modal-body" class="p-5 sm:p-8 overflow-y-auto space-y-6 text-sm text-slate-600 leading-relaxed max-h-[calc(90vh-140px)]">
          <!-- Injected via JavaScript -->
        </div>

        <!-- Modal Footer -->
        <div id="stabats-modal-footer" class="px-5 sm:px-8 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <span class="text-xs text-slate-400 font-medium hidden sm:inline-block">Press <kbd class="px-1.5 py-0.5 text-[10px] bg-slate-200 rounded text-slate-600 font-mono">ESC</kbd> to exit</span>
          <div id="stabats-modal-actions" class="flex items-center gap-3 ml-auto w-full sm:w-auto justify-end">
            <button id="stabats-modal-dismiss-btn" class="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-colors">Close</button>
          </div>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const backdrop = document.getElementById('stabats-modal-backdrop');
  const card = document.getElementById('stabats-modal-card');
  const closeBtn = document.getElementById('stabats-modal-close-btn');
  const dismissBtn = document.getElementById('stabats-modal-dismiss-btn');
  const iconEl = document.getElementById('stabats-modal-icon');
  const titleEl = document.getElementById('stabats-modal-title');
  const badgeEl = document.getElementById('stabats-modal-badge');
  const subtitleEl = document.getElementById('stabats-modal-subtitle');
  const bodyEl = document.getElementById('stabats-modal-body');
  const actionsEl = document.getElementById('stabats-modal-actions');

  // 2. Comprehensive Content Definitions for the 7 Requested Elements
  const modalContents = {
    'documentation': {
      title: 'System Documentation & Handover',
      badge: 'Client Ownership',
      subtitle: 'Transparent architectural blueprints, API specifications, and operational manuals',
      icon: 'fa-solid fa-book-bookmark',
      renderBody: () => `
        <div class="space-y-4">
          <div class="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-slate-700 text-xs sm:text-sm">
            <p class="font-bold text-blue-950 mb-1">Our Services Motive: Total Transparency & Zero Vendor Lock-In</p>
            <p class="text-slate-600">When Stabats builds a custom web application, CRM, ERP, or automation engine, complete documentation is delivered as a core service deliverable. We ensure your business maintains 100% intellectual property ownership and self-sufficiency.</p>
          </div>

          <div class="space-y-3.5">
            <div class="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <h4 class="font-bold text-slate-900 text-sm mb-1.5 font-display flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                1. Architectural Blueprints & Data Schemas
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed pl-3.5">
                Every custom system includes end-to-end component interaction diagrams, database ERDs, state-machine workflows, and service boundary maps. Your team gains total clarity on how data moves through every layer of your platform.
              </p>
            </div>

            <div class="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <h4 class="font-bold text-slate-900 text-sm mb-1.5 font-display flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                2. Custom API Specs & Integration Manuals
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed pl-3.5">
                Exhaustive specifications for all custom endpoints, webhooks, and third-party integrations (CRM, accounting, billing, legacy databases). This ensures your internal developers or future partners can easily extend the platform.
              </p>
            </div>

            <div class="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <h4 class="font-bold text-slate-900 text-sm mb-1.5 font-display flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                3. Deployment Guides & Infrastructure Runbooks
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed pl-3.5">
                Step-by-step cloud provisioning instructions, environment configuration guides, automated CI/CD pipeline setups, and disaster recovery procedures to safeguard continuous, uninterrupted operational uptime.
              </p>
            </div>

            <div class="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <h4 class="font-bold text-slate-900 text-sm mb-1.5 font-display flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                4. Operational & Workflow Guides
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed pl-3.5">
                Clear, user-friendly walkthroughs covering administrative dashboards, user permission hierarchies, automated triggers, and routine management flows to empower non-technical team members from day one.
              </p>
            </div>
          </div>
        </div>
      `,
      renderActions: () => `
        <button onclick="window.location.href='get-in-touch.html'" class="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all">Start Your Project</button>
      `
    },

    'architecture': {
      title: 'Enterprise Solution Architecture',
      badge: 'Scalable System Design',
      subtitle: 'Purpose-built systems designed around your exact business models',
      icon: 'fa-solid fa-network-wired',
      renderBody: () => `
        <div class="space-y-4">
          <div class="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/60 text-slate-700 text-xs sm:text-sm">
            <p class="font-bold text-blue-950 mb-1">Our Services Motive: Purpose-Built Architectural Leverage</p>
            <p class="text-slate-600">At Stabats, software architecture is never generic. We engineer custom digital foundations that map directly to your operational workflows—replacing fragmented, bloated off-the-shelf tools with high-speed digital leverage.</p>
          </div>

          <div class="space-y-3.5">
            <div class="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <h4 class="font-bold text-slate-900 text-sm mb-1.5 font-display flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                1. Custom Systems Tailored to Your Workflows
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed pl-3.5">
                We craft custom CRM, ERP, and automation architectures built specifically around your unique data structures, approval chains, and pricing matrices—ensuring the software fits your business, not the other way around.
              </p>
            </div>

            <div class="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <h4 class="font-bold text-slate-900 text-sm mb-1.5 font-display flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                2. Unified Data Loop & Zero Operational Silos
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed pl-3.5">
                Our architectures interconnect isolated departments. We bring sales, billing, inventory, fulfillment, and communications into a single bi-directional data loop with real-time sync and zero manual copy-pasting.
              </p>
            </div>

            <div class="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <h4 class="font-bold text-slate-900 text-sm mb-1.5 font-display flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                3. High-Throughput & Fault-Tolerant Scalability
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed pl-3.5">
                Engineered with modern cloud primitives, high-throughput queuing, and containerized microservices to guarantee your platform handles peak transaction spikes effortlessly with 99.99% service availability.
              </p>
            </div>

            <div class="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <h4 class="font-bold text-slate-900 text-sm mb-1.5 font-display flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                4. Bank-Grade Security & Private Data Isolation
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed pl-3.5">
                Zero-trust access policies, strict role-based access controls (RBAC), end-to-end data encryption (AES-256 / TLS 1.3), and private tenant cloud isolation to keep your proprietary business intelligence secure.
              </p>
            </div>
          </div>
        </div>
      `,
      renderActions: () => `
        <button onclick="window.location.href='get-in-touch.html'" class="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all">Schedule Architecture Consultation</button>
      `
    },

    'case-studies': {
      title: 'Client Transformations & Proven Impact',
      badge: 'Proven Outcomes',
      subtitle: 'Real-world operational ROI across custom software and automation',
      icon: 'fa-solid fa-chart-line',
      renderBody: () => `
        <div class="space-y-4">
          <div class="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-slate-700 text-xs sm:text-sm">
            <p class="font-bold text-blue-950 mb-1">Our Services Motive: Measurable Business Transformation</p>
            <p class="text-slate-600">We judge our custom engineering by real operational impact: eliminating hundreds of manual labor hours, eliminating data friction, and enabling companies to scale revenue without expanding overhead.</p>
          </div>

          <div class="space-y-3.5">
            <div class="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <h4 class="font-bold text-slate-900 text-sm mb-1.5 font-display flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                1. Omnichannel ERP & Inventory Automation
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed pl-3.5">
                Engineered a unified custom ERP for a regional logistics provider across 18 regional distribution hubs. Synchronized inventory in real time, automated freight dispatching, and achieved a <strong class="text-slate-900">4.2x faster fulfillment cycle</strong> with a <strong class="text-slate-900">31% reduction in warehouse idle time</strong>.
              </p>
            </div>

            <div class="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <h4 class="font-bold text-slate-900 text-sm mb-1.5 font-display flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                2. Tailored CRM & Automated Sales Pipeline
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed pl-3.5">
                Built a purpose-built CRM platform replacing three disconnected off-the-shelf subscriptions. Automated lead scoring, document generation, and client follow-ups—recovering <strong class="text-slate-900">25+ hours per sales representative monthly</strong> and boosting deal closure speed by <strong class="text-slate-900">38%</strong>.
              </p>
            </div>

            <div class="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <h4 class="font-bold text-slate-900 text-sm mb-1.5 font-display flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                3. Enterprise AI Automation & Workflow Robotics
              </h4>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed pl-3.5">
                Deployed intelligent trigger pipelines and autonomous task agents for a financial services firm. Automated invoice reconciliation, document extraction, and cross-system ledger sync, saving <strong class="text-slate-900">340+ hours of manual data entry every month</strong> with <strong class="text-slate-900">99.98% execution accuracy</strong>.
              </p>
            </div>
          </div>
        </div>
      `,
      renderActions: () => `
        <button onclick="window.location.href='get-in-touch.html'" class="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all">Discuss Your Business Transformation</button>
      `
    },

    'support': {
      title: 'Enterprise Engineering Support',
      badge: '24/7 Dedicated SLA',
      subtitle: 'Direct engineer-to-engineer assistance & rapid resolution',
      icon: 'fa-solid fa-headset',
      renderBody: () => `
        <div class="space-y-5">
          <div class="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-slate-700 text-xs sm:text-sm">
            <p class="font-bold text-blue-950 mb-1">Direct Senior Engineer Escalation</p>
            <p class="text-slate-600">Every client engagement includes direct escalation to the systems engineers and architects who built your solution. No call centers, no automated script deflection.</p>
          </div>

          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 font-display">SLA Response Commitments</h4>
            <div class="space-y-2.5 text-xs">
              <div class="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 animate-pulse"></span>
                  <div>
                    <span class="font-bold text-slate-900 block">Severity 1 (Critical Outage)</span>
                    <span class="text-slate-500 text-[11px]">System downtime or data loss</span>
                  </div>
                </div>
                <span class="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200">&lt; 15 mins</span>
              </div>

              <div class="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  <div>
                    <span class="font-bold text-slate-900 block">Severity 2 (High / Degraded)</span>
                    <span class="text-slate-500 text-[11px]">Performance drop or core workflow impacted</span>
                  </div>
                </div>
                <span class="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">&lt; 1 hour</span>
              </div>

              <div class="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                  <div>
                    <span class="font-bold text-slate-900 block">Severity 3 (Standard / Consultation)</span>
                    <span class="text-slate-500 text-[11px]">Feature inquiries, configuration questions</span>
                  </div>
                </div>
                <span class="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">&lt; 4 hours</span>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium">Direct Engineering Desk:</span>
              <span class="font-mono font-bold text-slate-700">Available via Client Project Dashboard</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium">Enterprise Slack Connect:</span>
              <span class="font-medium text-slate-800">Available on Enterprise SLA</span>
            </div>
          </div>
        </div>
      `,
      renderActions: () => `
        <button onclick="window.location.href='get-in-touch.html'" class="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all">Submit Support Ticket</button>
      `
    },

    'privacy-policy': {
      title: 'Privacy Policy & Data Governance',
      badge: 'GDPR & CCPA Compliant',
      subtitle: 'Enterprise data confidentiality, VPC isolation, and zero-reselling commitment',
      icon: 'fa-solid fa-shield-halved',
      renderBody: () => `
        <div class="space-y-4 text-xs sm:text-sm text-slate-600">
          <div class="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-950 font-medium text-xs flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-emerald-600"></i>
            <span>Stabats strictly does not sell, rent, monetize, or train foundation AI models on client data.</span>
          </div>

          <div>
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 font-display">1. Absolute Data Ownership</h4>
            <p class="text-xs text-slate-500 leading-relaxed">All proprietary business logic, transactional records, employee credentials, and customer datasets uploaded or processed through our software remain the exclusive intellectual property of the client.</p>
          </div>

          <div>
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 font-display">2. No AI Model Training on Customer Data</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Prompts, workflow payloads, and database documents passed to our AI automation agents are processed in stateless, ephemeral inference runs and are strictly excluded from AI foundation model training or retention.</p>
          </div>

          <div>
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 font-display">3. Cryptographic Protection & VPC Isolation</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Data in transit is shielded via TLS 1.3 with forward secrecy. Data at rest is encrypted with AES-256 with optional Customer-Managed Keys (AWS KMS / GCP Cloud KMS) in client-dedicated VPC partitions.</p>
          </div>

          <div>
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 font-display">4. GDPR / CCPA Right to Erasure</h4>
            <p class="text-xs text-slate-500 leading-relaxed">In accordance with global data protection frameworks, customers maintain complete audit access, tenant data isolation, and cryptographic data erasure rights upon project conclusion or upon request.</p>
          </div>
        </div>
      `,
      renderActions: () => `
        <button id="stabats-modal-dismiss-btn2" class="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all">I Understand</button>
      `
    },

    'terms-of-service': {
      title: 'Terms of Service',
      badge: 'Version 2026.1',
      subtitle: 'Commercial software agreements, IP assignment, and service warranties',
      icon: 'fa-solid fa-scale-balanced',
      renderBody: () => `
        <div class="space-y-4 text-xs sm:text-sm text-slate-600">
          <div>
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 font-display">1. 100% Intellectual Property Assignment</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Upon final payment of contractual project milestones, all custom software architectures, source code, database schemas, and tailored integrations engineered by Stabats transfer fully and exclusively to the client.</p>
          </div>

          <div>
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 font-display">2. 99.99% Production Uptime SLA</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Stabats platform clusters guarantee 99.99% monthly availability. In the event of unscheduled downtime exceeding SLA thresholds, automated service credits are applied to the subsequent billing statement.</p>
          </div>

          <div>
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 font-display">3. 90-Day Comprehensive Post-Launch Warranty</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Every delivered software suite is covered by a 90-day defect rectification warranty encompassing bug fixes, performance tuning, and security patching at no supplementary cost.</p>
          </div>

          <div>
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 font-display">4. Permitted Use & Security</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Clients agree not to reverse-engineer core platform infrastructure, execute unauthorized penetration testing without prior coordination, or distribute malicious traffic through Stabats API gateways.</p>
          </div>
        </div>
      `,
      renderActions: () => `
        <button id="stabats-modal-dismiss-btn3" class="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all">Accept & Close</button>
      `
    },

    'cookies-settings': {
      title: 'Cookie & Privacy Preferences',
      badge: 'Consent Manager',
      subtitle: 'Manage local storage, session cookies, and performance telemetry',
      icon: 'fa-solid fa-cookie-bite',
      renderBody: () => {
        const saved = JSON.parse(localStorage.getItem('stabats_cookie_prefs') || '{"functional":true,"performance":true,"marketing":false}');
        return `
          <div class="space-y-4">
            <p class="text-xs text-slate-500 leading-relaxed">We use essential session tokens to verify authentication and optional cookies to analyze platform performance. Choose which categories you permit below:</p>

            <div class="space-y-3">
              <!-- Strictly Necessary -->
              <div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
                <div class="min-w-0 pr-2">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="font-bold text-slate-900 text-xs">Strictly Necessary Cookies</span>
                    <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-200 text-slate-700"><i class="fa-solid fa-lock text-[8px] mr-1"></i>Always Active</span>
                  </div>
                  <p class="text-[11px] text-slate-500 leading-relaxed">Required for TLS token verification, CSRF defense, and secure session management. Cannot be disabled.</p>
                </div>
                <div class="w-10 h-6 bg-blue-600 rounded-full relative cursor-not-allowed opacity-80 shrink-0">
                  <div class="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow"></div>
                </div>
              </div>

              <!-- Functional -->
              <div class="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-xs">
                <div class="min-w-0 pr-2">
                  <span class="font-bold text-slate-900 text-xs block mb-0.5">Functional & Experience</span>
                  <p class="text-[11px] text-slate-500 leading-relaxed">Saves UI preferences, language selections, and fast dashboard cache states.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" id="cookie-toggle-functional" class="sr-only peer" ${saved.functional ? 'checked' : ''}>
                  <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <!-- Performance -->
              <div class="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-xs">
                <div class="min-w-0 pr-2">
                  <span class="font-bold text-slate-900 text-xs block mb-0.5">Performance & Latency Telemetry</span>
                  <p class="text-[11px] text-slate-500 leading-relaxed">Anonymously reports edge latency and API error rates to help us maintain &lt;18ms speeds.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" id="cookie-toggle-performance" class="sr-only peer" ${saved.performance ? 'checked' : ''}>
                  <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <!-- Marketing -->
              <div class="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-xs">
                <div class="min-w-0 pr-2">
                  <span class="font-bold text-slate-900 text-xs block mb-0.5">Product Announcements & Updates</span>
                  <p class="text-[11px] text-slate-500 leading-relaxed">Measures engagement with new feature launches and version releases.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" id="cookie-toggle-marketing" class="sr-only peer" ${saved.marketing ? 'checked' : ''}>
                  <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div id="cookie-save-feedback" class="hidden text-xs text-center font-bold text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-200">
              <i class="fa-solid fa-check mr-1.5"></i>Preferences saved to browser storage!
            </div>
          </div>
        `;
      },
      renderActions: () => `
        <button id="cookie-accept-all-btn" class="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-colors">Accept All</button>
        <button id="cookie-save-prefs-btn" class="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all">Save Preferences</button>
      `
    }
  };

  // 3. Open Modal Function (Global & Resilient)
  window.openStabatsModal = function(key) {
    let backdrop = document.getElementById('stabats-modal-backdrop');
    if (!backdrop) {
      if (typeof initFooterModals === 'function') {
        initFooterModals();
      }
      backdrop = document.getElementById('stabats-modal-backdrop');
    }
    if (!backdrop) return;

    const card = document.getElementById('stabats-modal-card');
    const iconEl = document.getElementById('stabats-modal-icon');
    const titleEl = document.getElementById('stabats-modal-title');
    const bodyEl = document.getElementById('stabats-modal-body');
    const actionsEl = document.getElementById('stabats-modal-actions');

    const normalizedKey = (key || 'documentation').toLowerCase().trim().replace(/\s+/g, '-');
    const data = modalContents[normalizedKey] 
      || modalContents[normalizedKey.replace('-policy', '')]
      || modalContents[normalizedKey.replace('-of-service', '')]
      || modalContents['documentation'];

    if (!data) return;

    if (iconEl) iconEl.className = data.icon + ' text-lg';
    if (titleEl) titleEl.textContent = data.title;
    if (bodyEl) bodyEl.innerHTML = data.renderBody();
    if (actionsEl) {
      actionsEl.innerHTML = (data.renderActions ? data.renderActions() : '') + `
        <button onclick="window.closeStabatsModal()" class="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-colors">Close</button>
      `;
    }

    // Reveal Modal instantly with guaranteed display
    backdrop.style.display = 'flex';
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    backdrop.classList.add('opacity-100', 'pointer-events-auto');
    if (card) {
      card.classList.remove('scale-95', 'opacity-0');
      card.classList.add('scale-100', 'opacity-100');
    }
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
  };

  window.closeStabatsModal = function() {
    const backdrop = document.getElementById('stabats-modal-backdrop');
    const card = document.getElementById('stabats-modal-card');
    if (!backdrop) return;

    if (card) {
      card.classList.remove('scale-100', 'opacity-100');
      card.classList.add('scale-95', 'opacity-0');
    }
    backdrop.classList.remove('opacity-100', 'pointer-events-auto');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      backdrop.style.display = 'none';
    }, 200);
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');
  };

  function openModal(key) {
    window.openStabatsModal(key);
  }

  function closeModal() {
    window.closeStabatsModal();
  }

  // Close triggers
  closeBtn.addEventListener('click', closeModal);
  dismissBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });

  // 5. Global Link Interception (Delegation)
  // Maps both explicit data-footer-modal attributes AND link text
  const linkTextMap = {
    'documentation': 'documentation',
    'architecture': 'architecture',
    'case studies': 'case-studies',
    'support': 'support',
    'privacy policy': 'privacy-policy',
    'terms of service': 'terms-of-service',
    'cookies settings': 'cookies-settings',
    'cookie settings': 'cookies-settings'
  };

  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button');
    if (!target) return;

    // Check data attribute first
    const modalKey = target.getAttribute('data-footer-modal');
    if (modalKey) {
      e.preventDefault();
      e.stopPropagation();
      openModal(modalKey);
      return;
    }

    // Check link text within footer
    if (target.closest('footer')) {
      const text = target.textContent.trim().toLowerCase();
      if (linkTextMap[text]) {
        e.preventDefault();
        e.stopPropagation();
        openModal(linkTextMap[text]);
      }
    }
  });
}
