// Corrected version of script.js

// Global state with improved mobile detection
const state = {
  isScrolling: false,
  isMobile: () => window.innerWidth < 992 && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  vantaEffect: null,
  preloaderDone: false
};

// Initialize everything with proper error handling
function init() {
  try {
    initPreloader();
    initSmoothScroll();
    initHeader();
    initHeroAnimations();
    initSplitting();
    initStatsCounter();
    initTestimonialsCarousel();
    initHorizontalScroll();
    initFormInputs();
    initWorkItems();
    initSectionAnimations();
    initDetailedAnimations();
    
    // Better resize handling
    window.addEventListener('resize', handleResize);
    
    // Cleanup on beforeunload
    window.addEventListener('beforeunload', cleanup);
  } catch (error) {
    console.error('Initialization error:', error);
    // Fallback to non-animated experience
    document.body.classList.remove('loading');
  }
}

// Improved preloader with better sequencing
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const tl = gsap.timeline({
    onComplete: () => {
      state.preloaderDone = true;
      cleanupPreloader();
    }
  });

  tl.from(preloader.querySelectorAll('.char'), {
    y: '100%',
    opacity: 0,
    duration: 0.8,
    stagger: 0.05,
    ease: 'power3.out'
  })
  .from(preloader.querySelector('.preloader-caption'), {
    opacity: 0,
    duration: 0.5
  }, '-=0.5')
  .to(preloader.querySelector('.preloader-progress-bar'), {
    width: '100%',
    duration: 1.5,
    ease: 'power4.inOut'
  }, '-=0.5')
  .to(preloader, {
    opacity: 0,
    duration: 1,
    ease: 'power3.inOut'
  });
}

function cleanupPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Enhanced smooth scroll integration
function initSmoothScroll() {
  try {
    const scroll = new LocomotiveScroll({
      el: document.querySelector('.smooth-scroll-wrapper'),
      smooth: true,
      getDirection: true,
      smartphone: {
        smooth: !state.isMobile()
      },
      tablet: {
        smooth: !state.isMobile() 
      }
    });

    scroll.on('scroll', (args) => {
      state.isScrolling = args.direction === 'down';
      ScrollTrigger.update();
    });

    ScrollTrigger.scrollerProxy('.smooth-scroll-wrapper', {
      scrollTop(value) {
        return arguments.length ? scroll.scrollTo(value, 0, 0) : scroll.scroll.instance.scroll.y;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight
        };
      },
      pinType: document.querySelector('.smooth-scroll-wrapper').style.transform ? 'transform' : 'fixed'
    });

    ScrollTrigger.addEventListener('refresh', () => scroll.update());
    ScrollTrigger.refresh();

    return scroll;
  } catch (error) {
    console.error('Smooth scroll init failed:', error);
    return null;
  }
}

// Improved hero animations with resize handling
function initHeroAnimations() {
  const heroTitle = document.querySelector('.hero-title');
  if (!heroTitle) return;

  const heroSplitting = Splitting({ target: heroTitle });
  
  const tl = gsap.timeline();
  tl.from(heroSplitting[0].words, {
    y: '100%',
    opacity: 0,
    duration: 1.2,
    ease: 'power4.out',
    stagger: 0.15
  })
  .from('.hero-subtitle', {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.5')
  .from('.scroll-down-indicator', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: 'power2.out',
    onComplete: initHeroBackground
  }, '-=0.3');
}

// Vanta.js with proper cleanup
function initHeroBackground() {
  if (state.isMobile() || !document.querySelector('.hero-canvas-container')) return;

  state.vantaEffect = VANTA.WAVES({
    el: '.hero-canvas-container',
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0x7b0091,
    shininess: 30.00,
    waveHeight: 15.00,
    waveSpeed: 0.8,
    zoom: 0.8
  });

  window.addEventListener('resize', () => {
    if (state.vantaEffect) {
      state.vantaEffect.resize();
    }
  });
}

// Enhanced testimonial carousel
function initTestimonialsCarousel() {
  const container = document.querySelector('.testimonials-carousel-container');
  if (!container) return;

  const track = container.querySelector('.testimonials-carousel-track');
  const cards = track.querySelectorAll('.testimonial-card');
  const prevBtn = container.querySelector('.testimonials-prev');
  const nextBtn = container.querySelector('.testimonials-next');
  const dotsContainer = container.querySelector('.testimonials-dots');

  if (!cards.length) return;

  // Improved infinite loop setup
  const cloneFirstCard = cards[0].cloneNode(true);
  const cloneLastCard = cards[cards.length - 1].cloneNode(true);
  track.insertBefore(cloneLastCard, cards[0]);
  track.appendChild(cloneFirstCard);

  let currentIndex = 1;
  const cardWidth = cards[0].offsetWidth + 32;
  const totalCards = cards.length;
  let autoScrollInterval;
  let isAnimating = false;

  function updateDots(index) {
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === (index - 1) % totalCards);
    });
  }

  function scrollToCard(index, animate = true) {
    if (isAnimating) return;
    
    isAnimating = true;
    currentIndex = index;
    
    gsap.to(track, {
      x: -index * cardWidth,
      duration: animate ? 0.5 : 0,
      ease: 'power2.inOut',
      onComplete: () => {
        // Handle infinite loop
        if (index <= 0) {
          currentIndex = totalCards;
          gsap.set(track, { x: -currentIndex * cardWidth });
        } else if (index >= totalCards + 1) {
          currentIndex = 1;
          gsap.set(track, { x: -currentIndex * cardWidth });
        }
        isAnimating = false;
        updateDots(currentIndex - 1);
      }
    });
  }

  // Navigation controls
  nextBtn.addEventListener('click', () => {
    clearInterval(autoScrollInterval);
    scrollToCard(currentIndex + 1);
    startAutoScroll();
  });

  prevBtn.addEventListener('click', () => {
    clearInterval(autoScrollInterval);
    scrollToCard(currentIndex - 1);
    startAutoScroll();
  });

  // Dot navigation
  for (let i = 0; i < totalCards; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      clearInterval(autoScrollInterval);
      scrollToCard(i + 1);
      startAutoScroll();
    });
    dotsContainer.appendChild(dot);
  }

  // Auto-scroll with pause on hover
  function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
      scrollToCard(currentIndex + 1);
    }, 5000);
  }

  track.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
  track.addEventListener('mouseleave', startAutoScroll);

  // Initialize
  gsap.set(track, { x: -currentIndex * cardWidth });
  startAutoScroll();
}

// Enhanced form validation
function initFormInputs() {
  const form = document.getElementById('ethereal-contact-form');
  if (!form) return;

  const emailInput = form.querySelector('input[type="email"]');
  const submitBtn = form.querySelector('.form-submit-btn');
  const formStatus = form.querySelector('.form-status');

  // Email validation
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate email
    if (emailInput && !validateEmail(emailInput.value)) {
      showStatus('Please enter a valid email address', 'error');
      emailInput.focus();
      return;
    }

    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span>';
    
    showStatus('Sending your message...', 'loading');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showStatus('Message sent successfully!', 'success');
      form.reset();
      
      // Reset form labels
      form.querySelectorAll('.form-label').forEach(label => {
        if (!label.previousElementSibling.value) {
          label.classList.remove('active');
        }
      });
    } catch (error) {
      showStatus('Failed to send message. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Send Message</span>';
    }
  });

  function showStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    
    gsap.fromTo(formStatus, 
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3 }
    );
  }
}

// Proper cleanup function
function cleanup() {
  if (state.vantaEffect) {
    state.vantaEffect.destroy();
    state.vantaEffect = null;
  }
  
  // Clear all GSAP animations
  gsap.globalTimeline.getChildren().forEach(anim => anim.kill());
}

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
