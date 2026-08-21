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
hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(open));
  // Animate hamburger → X
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

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

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
