/* ═══════════════════════════════════════════════
   INFINITY TECH — JavaScript interactions
   Owner: Sania Khatun
   ═══════════════════════════════════════════════ */

// ── Sticky nav shadow on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ── Mobile hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
    const spans = hamburger.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
}

// ── Scroll-reveal animation
const revealEls = document.querySelectorAll(
  '.service-card, .work-card, .testi-card, .hero-mini-cards .mini-card'
);
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.5s ease ${(i % 4) * 80}ms, transform 0.5s ease ${(i % 4) * 80}ms`;
  revealObserver.observe(el);
});

// ── Smooth active nav link highlight
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.style.color = '');
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.style.color = '#1d1d1f';
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ── Supabase Integration
const SUPABASE_URL = 'https://cudlrjwbuwgfrspkaapm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rtjot-jHVjzVpa_BLZnRqA_pin9A6b5';

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const quoteForm = document.getElementById('quoteForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

if (quoteForm) {
  quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!supabaseClient) {
      alert('Supabase client failed to load. Please check your internet connection.');
      return;
    }

    const formData = new FormData(quoteForm);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      service: formData.get('service'),
      message: formData.get('message'),
      created_at: new Date().toISOString()
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Submitting...</span>';
    formStatus.style.display = 'none';
    formStatus.className = 'form-status';

    try {
      const { data, error } = await supabaseClient
        .from('quote_requests')
        .insert([payload]);

      if (error) throw error;

      formStatus.className = 'form-status success';
      formStatus.innerHTML = '✓ Thank you! Your request has been sent successfully. We will be in touch shortly.';
      quoteForm.reset();
    } catch (err) {
      console.error('Supabase submission error:', err);
      formStatus.className = 'form-status error';
      formStatus.innerHTML = `⚠️ ${err.message || 'Failed to submit request. Please try again.'}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Send Request</span>';
    }
  });
}

// ── Stitch-Style Interactive Dot Grid (Full Visibility + Motion-Only Glow)
const canvas = document.getElementById('dotCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width, height;
  let dots = [];
  const spacing = 20; // Crisp micro grid spacing

  const mouse = {
    x: -1000,
    y: -1000,
    radius: 120,
    isMoving: false,
    speed: 0,
    lastX: 0,
    lastY: 0,
    idleTimer: null
  };

  const BASE_SIZE = 1.1;    // Visible across entire canvas
  const BASE_ALPHA = 0.28;  // Clean baseline visibility on dark background
  const MAX_SIZE = 2.8;     // Grows slightly on active cursor movement
  const MAX_ALPHA = 0.95;   // Bright glowing dot under motion
  const SPEED_DECAY = 0.16; // Fast fluid return to normal

  function initDots() {
    const parent = canvas.parentElement;
    width = canvas.width = parent.offsetWidth;
    height = canvas.height = parent.offsetHeight;
    dots = [];

    const cols = Math.floor(width / spacing);
    const rows = Math.floor(height / spacing);
    const offsetX = (width - (cols * spacing)) / 2;
    const offsetY = (height - (rows * spacing)) / 2;

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        dots.push({
          x: offsetX + i * spacing,
          y: offsetY + j * spacing,
          currentSize: BASE_SIZE,
          currentAlpha: BASE_ALPHA
        });
      }
    }
  }

  function drawDots() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      const dx = mouse.x - dot.x;
      const dy = mouse.y - dot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let targetSize = BASE_SIZE;
      let targetAlpha = BASE_ALPHA;

      // React only when mouse is actively moving near the dot
      if (mouse.isMoving && dist < mouse.radius) {
        const proximity = Math.pow(1 - dist / mouse.radius, 1.8);
        const motionFactor = Math.min(mouse.speed / 10, 1); // scale with movement speed
        
        targetSize = BASE_SIZE + (MAX_SIZE - BASE_SIZE) * proximity * (0.5 + 0.5 * motionFactor);
        targetAlpha = BASE_ALPHA + (MAX_ALPHA - BASE_ALPHA) * proximity;
      }

      // Fast transition back to normal
      dot.currentSize += (targetSize - dot.currentSize) * SPEED_DECAY;
      dot.currentAlpha += (targetAlpha - dot.currentAlpha) * SPEED_DECAY;

      ctx.fillStyle = `rgba(255, 255, 255, ${dot.currentAlpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.currentSize, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(drawDots);
  }

  const heroSection = document.getElementById('home') || canvas.parentElement;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const moveDist = Math.hypot(currentX - mouse.lastX, currentY - mouse.lastY);
    mouse.speed = moveDist;
    mouse.x = currentX;
    mouse.y = currentY;
    mouse.lastX = currentX;
    mouse.lastY = currentY;
    mouse.isMoving = true;

    // Reset idle timer: if mouse stops moving, return to normal state
    clearTimeout(mouse.idleTimer);
    mouse.idleTimer = setTimeout(() => {
      mouse.isMoving = false;
      mouse.speed = 0;
    }, 120); // within 120ms of stopping, return to normal
  });

  heroSection.addEventListener('mouseleave', () => {
    mouse.isMoving = false;
    mouse.speed = 0;
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('resize', initDots);
  initDots();
  drawDots();
}
