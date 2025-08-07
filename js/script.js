/**
 * Ethereal Studios - Optimized Main JavaScript
 * -------------------------------------------
 * Clean, modular, and performance-optimized JS for immersive experience
 */

// Configuration Constants
const CONFIG = {
  SCROLL_DURATION: 0.5,
  ANIMATION_OFFSET: 'top 80%',
  MOBILE_BREAKPOINT: 992,
  VERTEX_SHADER: `void main() { gl_Position = vec4(position, 1.0); }`,
  FRAGMENT_SHADER: `void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }`
};

// Global State
const STATE = {
  isMobile: window.innerWidth < CONFIG.MOBILE_BREAKPOINT,
  scrollPosition: 0,
  isMenuOpen: false
};

// DOM Elements
const DOM = {
  body: document.body,
  preloader: document.getElementById('preloader'),
  header: document.querySelector('.site-header'),
  menuToggle: document.querySelector('.menu-toggle'),
  navLinks: document.querySelectorAll('.nav-link'),
  heroSection: document.querySelector('.hero-section'),
  contactForm: document.getElementById('ethereal-contact-form')
};

// Core Initialization
function init() {
  initPreloader();
  initSmoothScroll();
  initNavigation();
  initHeroSection();
  initAnimations();
  initEventListeners();
  
  // Modernizr fallbacks
  if (!Modernizr.flexbox) document.body.classList.add('no-flexbox');
}

// ======================
// 1. PRELOADER
// ======================
function initPreloader() {
  if (!DOM.preloader) return;

  const timeline = gsap.timeline({
    onComplete: () => {
      gsap.to(DOM.preloader, {
        opacity: 0,
        duration: CONFIG.SCROLL_DURATION,
        onComplete: () => DOM.preloader.remove()
      });
      DOM.body.style.overflow = 'auto';
    }
  });

  timeline
    .from('.preloader-title .char', {
      y: '100%',
      opacity: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: 'power3.out'
    })
    .to('.preloader-progress-bar', {
      width: '100%',
      duration: 1.5,
      ease: 'power4.inOut'
    }, '-=0.5');
}

// ======================
// 2. SMOOTH SCROLLING
// ======================
function initSmoothScroll() {
  const scroll = new LocomotiveScroll({
    el: document.querySelector('.smooth-scroll-wrapper'),
    smooth: true,
    lerp: 0.1,
    multiplier: 0.8,
    smartphone: { smooth: !STATE.isMobile },
    tablet: { smooth: !STATE.isMobile }
  });

  scroll.on('scroll', ({ scroll }) => {
    STATE.scrollPosition = scroll.y;
    DOM.header.classList.toggle('is-scrolling', scroll.y > 100);
  });

  // GSAP ScrollTrigger integration
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.scrollerProxy('.smooth-scroll-wrapper', {
    scrollTop(value) {
      return arguments.length ? 
        scroll.scrollTo(value, { duration: 0, disableLerp: true }) : 
        scroll.scroll.instance.scroll.y;
    }
  });
}

// ======================
// 3. NAVIGATION
// ======================
function initNavigation() {
  if (!DOM.menuToggle) return;

  DOM.menuToggle.addEventListener('click', () => {
    STATE.isMenuOpen = !STATE.isMenuOpen;
    DOM.body.classList.toggle('nav-open', STATE.isMenuOpen);
    DOM.menuToggle.classList.toggle('active', STATE.isMenuOpen);
  });

  DOM.navLinks.forEach(link => {
    link.addEventListener('click', () => {
      STATE.isMenuOpen = false;
      DOM.body.classList.remove('nav-open');
      DOM.menuToggle.classList.remove('active');
    });
  });
}

// ======================
// 4. HERO SECTION
// ======================
function initHeroSection() {
  if (!DOM.heroSection) return;

  // Text animations
  const heroTimeline = gsap.timeline();
  heroTimeline
    .from('.hero-title .word', {
      y: '100%',
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power4.out'
    })
    .from('.hero-subtitle', {
      opacity: 0,
      y: 20,
      duration: 0.8
    }, '-=0.5');

  // Background animation (desktop only)
  if (!STATE.isMobile && typeof VANTA !== 'undefined') {
    VANTA.WAVES({
      el: '.hero-canvas-container',
      color: 0x7b0091,
      waveSpeed: 0.8,
      zoom: 0.8
    });
  }
}

// ======================
// 5. ANIMATIONS
// ======================
function initAnimations() {
  // Section reveal animations
  gsap.utils.toArray('.section-reveal').forEach(section => {
    gsap.from(section, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      scrollTrigger: {
        trigger: section,
        scroller: '.smooth-scroll-wrapper',
        start: CONFIG.ANIMATION_OFFSET
      }
    });
  });

  // Stats counter
  document.querySelectorAll('.stat-number').forEach(stat => {
    const target = +stat.dataset.count;
    gsap.to(stat, {
      innerText: target,
      duration: 2,
      snap: { innerText: 1 },
      scrollTrigger: {
        trigger: stat,
        start: CONFIG.ANIMATION_OFFSET
      }
    });
  });

  // Service cards hover
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { y: -10, duration: 0.3 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, duration: 0.3 });
    });
  });
}

// ======================
// 6. TESTIMONIALS CAROUSEL
// ======================
function initTestimonialsCarousel() {
  const carousel = document.querySelector('.testimonials-carousel');
  if (!carousel) return;

  new Glide(carousel, {
    type: 'carousel',
    perView: STATE.isMobile ? 1 : 2,
    gap: 40,
    autoplay: 5000,
    hoverpause: true
  }).mount();
}

// ======================
// 7. FORM HANDLING
// ======================
function initForms() {
  if (!DOM.contactForm) return;

  DOM.contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(DOM.contactForm);
    
    try {
      // Replace with actual fetch call
      const response = await mockFormSubmit(formData);
      showFormStatus('Message sent successfully!', 'success');
      DOM.contactForm.reset();
    } catch (error) {
      showFormStatus('Error sending message. Please try again.', 'error');
    }
  });

  // Input label animation
  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => {
      input.previousElementSibling.classList.add('active');
    });
    input.addEventListener('blur', () => {
      if (!input.value) input.previousElementSibling.classList.remove('active');
    });
  });
}

function showFormStatus(message, type) {
  const statusEl = document.createElement('div');
  statusEl.className = `form-status ${type}`;
  statusEl.textContent = message;
  DOM.contactForm.appendChild(statusEl);
  
  gsap.fromTo(statusEl, 
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.3 }
  );
  
  setTimeout(() => {
    gsap.to(statusEl, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => statusEl.remove()
    });
  }, 5000);
}

// ======================
// 8. EVENT LISTENERS
// ======================
function initEventListeners() {
  window.addEventListener('resize', debounce(handleResize, 250));
  window.addEventListener('scroll', throttle(handleScroll, 100));
}

function handleResize() {
  STATE.isMobile = window.innerWidth < CONFIG.MOBILE_BREAKPOINT;
}

function handleScroll() {
  // Custom scroll logic if needed
}

// ======================
// UTILITY FUNCTIONS
// ======================
function debounce(func, wait) {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
}

function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function() {
    if (!lastRan) {
      func.apply(this, arguments);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(this, arguments);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Mock function for form submission
async function mockFormSubmit(data) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ status: 'success' }), 1500);
  });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', init);
