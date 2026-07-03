/* Custom JS for Cartoon Surprise Website */

// --- STATE MANAGEMENT ---
let currentPageId = 'page-home';
const transitionOverlay = document.getElementById('paint-transition');
const splashPath = document.getElementById('splash-path');
const particlesContainer = document.getElementById('particles-container');

// --- THEME STICKERS DATA ---
const themeStickers = {
  'page-home': ['❤️', '💙', '💛', '⭐', '✨', '☁️', '⚡', '🎈', '🍭'],
  'page-hug': ['🧸', '💖', '💕', '☁️', '⭐', '🤗', '🐻', '🌈'],
  'page-kiss': ['💋', '❤️', '😘', '✨', '💖', '🍭', '🎀', '🎈'],
  'page-flower': ['🌸', '🦋', '🌼', '🌺', '☁️', '⭐', '🌿', '🌱', '🎈']
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  // Generate initial home background stickers
  generateBackgroundStickers('page-home');
  
  // Set up Sparkle Canvas cursor trail
  initSparkleCanvas();
  
  // Create entrance animation effect on title chars
  triggerTitleReveal();
  
  // Initialize image file pickers and default loading error fallbacks
  initImagePickers();
});

// --- GRAFFITI TITLE REVEAL ANIMATION ---
function triggerTitleReveal() {
  const chars = document.querySelectorAll('.graffiti-title .char');
  chars.forEach((char, index) => {
    char.style.opacity = '0';
    char.style.transform = 'scale(0.3) rotate(-30deg)';
    setTimeout(() => {
      char.style.transition = 'opacity 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      char.style.opacity = '1';
      char.style.transform = 'scale(1) rotate(0deg)';
    }, index * 40);
  });
}

// --- DYNAMIC BACKGROUND FLOATING STICKERS ---
function generateBackgroundStickers(pageId) {
  // Clear existing stickers
  particlesContainer.innerHTML = '';
  
  const stickers = themeStickers[pageId] || themeStickers['page-home'];
  const stickerCount = window.innerWidth < 768 ? 15 : 30; // Fewer stickers on mobile
  
  for (let i = 0; i < stickerCount; i++) {
    const sticker = document.createElement('div');
    sticker.className = 'floating-sticker';
    sticker.innerText = stickers[Math.floor(Math.random() * stickers.length)];
    
    // Randomize positioning
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    sticker.style.left = `${left}%`;
    sticker.style.top = `${top}%`;
    
    // Randomize size
    const size = Math.random() * 1.5 + 1.2; // 1.2rem - 2.7rem
    sticker.style.fontSize = `${size}rem`;
    
    // Randomize rotation
    const rotation = Math.random() * 360;
    
    // Randomize floating animation properties
    const duration = Math.random() * 10 + 10; // 10s - 20s
    const delay = Math.random() * -20; // negative delay so they start immediately at different points
    
    sticker.style.transform = `rotate(${rotation}deg)`;
    sticker.style.animation = `floatRandom ${duration}s infinite ease-in-out alternate`;
    sticker.style.animationDelay = `${delay}s`;
    
    // Add custom offset variables for different trajectories
    sticker.style.setProperty('--dx', `${Math.random() * 40 - 20}px`);
    sticker.style.setProperty('--dy', `${Math.random() * 40 - 20}px`);
    
    particlesContainer.appendChild(sticker);
  }
}

// --- PAGE NAVIGATION WITH PAINT SPLAT TRANSITION ---
function navigateToPage(targetPageId, color) {
  if (targetPageId === currentPageId) return;
  
  // Set paint splat fill color
  splashPath.setAttribute('fill', color);
  
  // Add animating class to slide & scale the paint splatter in
  transitionOverlay.classList.add('animating');
  
  // Spawn a click burst explosion at the transition start point
  const rect = transitionOverlay.getBoundingClientRect();
  createExplosion(rect.width / 2, rect.height / 2, color, 40);
  
  // Step 2: Swap pages halfway through the transition
  setTimeout(() => {
    // Hide current page
    const currentPage = document.getElementById(currentPageId);
    if (currentPage) {
      currentPage.classList.remove('active');
    }
    
    // Show target page
    const targetPage = document.getElementById(targetPageId);
    if (targetPage) {
      targetPage.classList.add('active');
      
      // If we are showing a subpage, trigger header animate
      const subTitle = targetPage.querySelector('.page-title');
      if (subTitle) {
        const subChars = subTitle.querySelectorAll('.char');
        subChars.forEach((ch, idx) => {
          ch.style.opacity = '0';
          ch.style.transform = 'scale(0.2) rotate(15deg)';
          setTimeout(() => {
            ch.style.transition = 'opacity 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            ch.style.opacity = '1';
            ch.style.transform = 'scale(1) rotate(0deg)';
          }, idx * 30);
        });
      }
    }
    
    // Update active page state
    currentPageId = targetPageId;
    
    // Re-generate page-specific stickers
    generateBackgroundStickers(currentPageId);
    
    // Scroll window to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    
  }, 450); // Matches midpoint of CSS transition scale speed
  
  // Step 3: Remove animating class to slide the paint splatter out
  setTimeout(() => {
    transitionOverlay.classList.remove('animating');
  }, 900); // Matches full cycle of transition animation
}

// --- SPARKLE & POP CONFETTI CANVAS ---
let canvas, ctx;
let particles = [];
const maxParticles = 120;
const colors = ['#ff4b82', '#00bfff', '#ffd700', '#9b51e0', '#2ecc71', '#ff9f43', '#ff6b6b', '#54a0ff'];

function initSparkleCanvas() {
  canvas = document.getElementById('sparkle-canvas');
  ctx = canvas.getContext('2d');
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Mousemove cursor trail particles
  window.addEventListener('mousemove', (e) => {
    if (particles.length < maxParticles) {
      createSparkle(e.clientX, e.clientY, 1.5);
    }
  });
  
  // Click burst particles
  window.addEventListener('click', (e) => {
    createExplosion(e.clientX, e.clientY, null, 15);
  });
  
  // Start animation frame loop
  requestAnimationFrame(animateParticles);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Particle constructor
class SparkleParticle {
  constructor(x, y, color, speedMultiplier = 1, isExplosion = false) {
    this.x = x;
    this.y = y;
    this.color = color || colors[Math.floor(Math.random() * colors.length)];
    this.size = Math.random() * (isExplosion ? 8 : 4) + 2;
    this.isExplosion = isExplosion;
    
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 2 + 1) * speedMultiplier;
    
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed + (isExplosion ? -1.5 : 0); // Explosion particles drift slightly upwards
    this.gravity = isExplosion ? 0.08 : 0.02;
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.01;
    this.spin = Math.random() * 0.2 - 0.1;
    this.angle = Math.random() * Math.PI;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.alpha -= this.decay;
    this.angle += this.spin;
    this.size *= 0.98; // shrink slightly
  }
  
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.color;
    
    // Draw star shape for sparks, circle for explosions
    if (!this.isExplosion && Math.random() > 0.4) {
      // Draw 4-point star
      ctx.beginPath();
      ctx.moveTo(0, -this.size * 1.5);
      ctx.lineTo(this.size * 0.4, -this.size * 0.4);
      ctx.lineTo(this.size * 1.5, 0);
      ctx.lineTo(this.size * 0.4, this.size * 0.4);
      ctx.lineTo(0, this.size * 1.5);
      ctx.lineTo(-this.size * 0.4, this.size * 0.4);
      ctx.lineTo(-this.size * 1.5, 0);
      ctx.lineTo(-this.size * 0.4, -this.size * 0.4);
      ctx.closePath();
      ctx.fill();
    } else {
      // Draw standard round puff
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Outline to match comic theme
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#1a1a1a';
      ctx.stroke();
    }
    
    ctx.restore();
  }
}

function createSparkle(x, y, speedMultiplier = 1) {
  particles.push(new SparkleParticle(x, y, null, speedMultiplier, false));
}

function createExplosion(x, y, customColor = null, count = 20) {
  for (let i = 0; i < count; i++) {
    particles.push(new SparkleParticle(x, y, customColor, 2.5, true));
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw();
    
    if (p.alpha <= 0 || p.size <= 0.5) {
      particles.splice(i, 1);
    }
  }
  
  requestAnimationFrame(animateParticles);
}

// --- IMAGE PICKERS & LOCAL PREVIEW LOGIC ---
let activeObjectUrls = {
  hug: null,
  kiss: null,
  flower: null
};

function initImagePickers() {
  const pagesConfig = [
    { key: 'hug', inputId: 'hug-image-input', btnId: 'choose-hug-btn', imgId: 'hug-preview-img', placeholderId: 'hug-placeholder' },
    { key: 'kiss', inputId: 'kiss-image-input', btnId: 'choose-kiss-btn', imgId: 'kiss-preview-img', placeholderId: 'kiss-placeholder' },
    { key: 'flower', inputId: 'flower-image-input', btnId: 'choose-flower-btn', imgId: 'flower-preview-img', placeholderId: 'flower-placeholder' }
  ];

  pagesConfig.forEach(config => {
    const input = document.getElementById(config.inputId);
    const btn = document.getElementById(config.btnId);
    const img = document.getElementById(config.imgId);
    const placeholder = document.getElementById(config.placeholderId);

    if (!input || !btn || !img || !placeholder) return;

    // Trigger file picker click
    btn.addEventListener('click', () => {
      input.click();
    });

    // Handle file selection
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        showComicToast('Please choose a valid image file (PNG, JPG, WEBP, etc.) 📸');
        input.value = ''; // Reset input value
        return;
      }

      // Revoke previous object URL if it exists
      if (activeObjectUrls[config.key]) {
        URL.revokeObjectURL(activeObjectUrls[config.key]);
      }

      // Generate local object URL and display it
      const objectUrl = URL.createObjectURL(file);
      activeObjectUrls[config.key] = objectUrl;

      img.src = objectUrl;
      img.style.display = 'block';
      placeholder.style.display = 'none';
    });

    // Handle fallback if default images fail to load
    img.addEventListener('load', () => {
      img.style.display = 'block';
      placeholder.style.display = 'none';
    });

    img.addEventListener('error', () => {
      img.style.display = 'none';
      placeholder.style.display = 'flex';
    });

    // Manually trigger check in case it's cached or pre-broken
    if (img.complete) {
      if (img.naturalWidth === 0) {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
      } else {
        img.style.display = 'block';
        placeholder.style.display = 'none';
      }
    }
  });
}

// --- COMIC TOAST NOTIFICATIONS ---
function showComicToast(message) {
  let container = document.getElementById('comic-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'comic-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'comic-toast';
  toast.innerHTML = `
    <span class="comic-toast-icon">⚠️</span>
    <span class="comic-toast-text">${message}</span>
  `;
  container.appendChild(toast);

  // Trigger anim
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto-remove
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
