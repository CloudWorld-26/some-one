/* ===== DYNAMIC VIEWPORT HEIGHT ===== */
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', vh + 'px');
}
setVH();
window.addEventListener('resize', setVH);
if (window.visualViewport) window.visualViewport.addEventListener('resize', setVH);

/* ===== PARTICLE CANVAS ===== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function createParticle(x, y, type = 'star') {
  return {
    x: x ?? Math.random() * canvas.width,
    y: y ?? Math.random() * canvas.height,
    size: type === 'star' ? Math.random() * 1.8 + 0.4 : Math.random() * 3.5 + 1,
    speedX: (Math.random() - 0.5) * (type === 'burst' ? 7 : 0.4),
    speedY: type === 'star' ? (Math.random() - 0.5) * 0.3 : (type === 'burst' ? (Math.random() - 0.5) * 7 : -Math.random() * 1.5 - 0.5),
    opacity: Math.random(),
    opacityDir: Math.random() > 0.5 ? 0.006 : -0.006,
    color: type === 'star'
      ? `hsl(${Math.random() * 40 + 25}, 80%, ${Math.random() * 30 + 58}%)`
      : `hsl(${Math.random() * 50 + 330}, 85%, 72%)`,
    type, life: 1,
    decay: type === 'burst' ? Math.random() * 0.022 + 0.008 : 0,
  };
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 130; i++) particles.push(createParticle());
}
initParticles();

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.life > 0);
  while (particles.filter(p => p.type === 'star').length < 130) particles.push(createParticle());
  particles.forEach(p => {
    p.x += p.speedX; p.y += p.speedY;
    p.opacity += p.opacityDir;
    if (p.opacity >= 1 || p.opacity <= 0.08) p.opacityDir *= -1;
    if (p.decay) p.life -= p.decay;
    if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.opacity * p.life);
    ctx.fillStyle = p.color;
    if (p.type !== 'star') { ctx.shadowBlur = 10; ctx.shadowColor = p.color; }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ===== FLOATING ELEMENTS ===== */
const floatingLayer = document.getElementById('floatingLayer');
const floatSymbols = ['💕', '🥰', '✨', '💖', '💝', '💗', '⭐', '🥰', '💛', '✦'];
let floatInterval = null;

function spawnFloatEl() {
  const el = document.createElement('span');
  el.className = 'float-el';
  el.textContent = floatSymbols[Math.floor(Math.random() * floatSymbols.length)];
  el.style.left = Math.random() * 100 + 'vw';
  const dur = Math.random() * 7 + 8;
  el.style.animationDuration = dur + 's';
  el.style.fontSize = (Math.random() * 0.9 + 0.7) + 'rem';
  floatingLayer.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000);
}

function startFloating() {
  if (floatInterval) return;
  floatInterval = setInterval(spawnFloatEl, 650);
}

/* ===== SCREEN MANAGER ===== */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const s = document.getElementById(id);
  s.classList.add('active');
  s.scrollTop = 0;
}

/* ===== OPENING SEQUENCE ===== */
function runOpeningSequence() {
  setTimeout(() => document.getElementById('crownDeco').classList.add('show'), 500);
  setTimeout(() => document.getElementById('nameReveal').classList.add('show'), 700);
  setTimeout(() => document.getElementById('dividerLine').classList.add('show'), 1600);
  setTimeout(() => document.getElementById('subtitleReveal').classList.add('show'), 2000);
  setTimeout(() => document.getElementById('giftBoxWrap').classList.add('show'), 3100);
}

/* ===== GIFT OPEN ===== */
let giftOpened = false;

function openGift() {
  if (giftOpened) return;
  giftOpened = true;
  document.querySelector('.gift-lid').classList.add('open');
  tryPlayBgMusic();
  const cx = canvas.width / 2, cy = canvas.height / 2;
  for (let i = 0; i < 80; i++) {
    const p = createParticle(cx + (Math.random() - 0.5) * 50, cy + (Math.random() - 0.5) * 50, 'burst');
    p.size = Math.random() * 5 + 2;
    particles.push(p);
  }
  const burst = document.createElement('div');
  burst.className = 'burst-overlay';
  document.body.appendChild(burst);
  setTimeout(() => burst.classList.add('flash'), 40);
  setTimeout(() => { burst.style.transition = 'opacity 1.3s ease'; burst.style.opacity = '0'; }, 380);
  setTimeout(() => burst.remove(), 1800);
  startFloating();
  setTimeout(() => {
    showScreen('messageScreen');
    setTimeout(runMessageReveal, 500);
  }, 1300);
}

const giftBoxEl = document.getElementById('giftBox');
giftBoxEl.addEventListener('click', openGift);
giftBoxEl.addEventListener('touchend', e => { e.preventDefault(); e.stopPropagation(); openGift(); }, { passive: false });

/* ===== MESSAGE REVEAL ===== */
function runMessageReveal() {
  const lines = document.querySelectorAll('.msg-line');
  lines.forEach((line, i) => {
    setTimeout(() => {
      line.classList.add('visible');
      for (let j = 0; j < 5; j++) {
        const p = createParticle(Math.random() * canvas.width, Math.random() * canvas.height, 'burst');
        p.speedY = -Math.random() * 1.2; p.decay = 0.007;
        particles.push(p);
      }
    }, i * 1500);
  });
  setTimeout(() => {
    document.getElementById('heartCta').classList.add('show');
  }, lines.length * 1500 + 600);
}

/* ===== HEART CTA ===== */
document.getElementById('heartCtaBtn').addEventListener('click', goToMemories);
document.getElementById('heartCtaBtn').addEventListener('touchend', e => {
  e.preventDefault(); goToMemories();
}, { passive: false });

function goToMemories() {
  for (let i = 0; i < 50; i++) {
    const p = createParticle(canvas.width / 2, canvas.height / 2, 'burst');
    p.size = Math.random() * 5 + 2;
    particles.push(p);
  }
  setTimeout(() => {
    showScreen('memoriesScreen');
    setTimeout(runMemoriesReveal, 400);
  }, 300);
}

/* ===== MEMORIES REVEAL ===== */
function runMemoriesReveal() {
  document.querySelector('.mem-title').classList.add('show');
  document.querySelector('.mem-sub').classList.add('show');
  const cards = document.querySelectorAll('.frame-card');
  const dotsWrap = document.getElementById('stripDots');
  dotsWrap.innerHTML = '';
  cards.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'strip-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => scrollToFrame(i));
    dotsWrap.appendChild(d);
  });
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add('show'), 150 + i * 120);
  });
  setTimeout(() => {
    document.getElementById('memoriesEndTrigger').classList.add('show');
  }, 150 + cards.length * 120 + 300);
  const strip = document.getElementById('filmStrip');
  strip.addEventListener('scroll', () => {
    const stripMid = strip.scrollLeft + strip.offsetWidth / 2;
    let closest = 0, minDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs((card.offsetLeft + card.offsetWidth / 2) - stripMid);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    document.querySelectorAll('.strip-dot').forEach((d, i) => d.classList.toggle('active', i === closest));
  }, { passive: true });
  let isDragging = false, dragStartX = 0, scrollStart = 0;
  strip.addEventListener('mousedown', e => {
    isDragging = true; dragStartX = e.pageX; scrollStart = strip.scrollLeft;
    strip.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    strip.scrollLeft = scrollStart - (e.pageX - dragStartX);
  });
  window.addEventListener('mouseup', () => { isDragging = false; strip.style.cursor = 'grab'; });
  /* Snap first card to center on init */
  setTimeout(() => scrollToFrame(0), 50);
}

function scrollToFrame(idx) {
  const cards = document.querySelectorAll('.frame-card');
  if (!cards[idx]) return;
  cards[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

/* ===== MEMORIES END BUTTON ===== */
document.getElementById('memEndBtn').addEventListener('click', goToFinal);
document.getElementById('memEndBtn').addEventListener('touchend', e => {
  e.preventDefault(); goToFinal();
}, { passive: false });

function goToFinal() {
  for (let i = 0; i < 60; i++) {
    const p = createParticle(Math.random() * canvas.width, Math.random() * canvas.height, 'burst');
    p.size = Math.random() * 4 + 2;
    particles.push(p);
  }
  setTimeout(() => {
    showScreen('finalScreen');
    setTimeout(runFinalReveal, 400);
  }, 300);
}

/* ===== FINAL REVEAL ===== */
function runFinalReveal() {
  document.getElementById('finalHeart').classList.add('show');
  setTimeout(() => document.querySelector('.final-title').classList.add('show'), 350);
  setTimeout(() => document.querySelector('.final-sub').classList.add('show'), 700);
  setTimeout(() => document.querySelector('.final-hearts-row').classList.add('show'), 1050);
  setTimeout(() => document.querySelector('.final-badge').classList.add('show'), 1350);
  setTimeout(launchConfetti, 500);
}

/* ===== CONFETTI ===== */
function launchConfetti() {
  const colors = ['#d4a843', '#f5d78e', '#e8a0b0', '#fff5ee', '#8b0000', '#f7d6df', '#ffffff'];
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.cssText = `
        left:${Math.random() * 100}vw; top:-12px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        border-radius:${Math.random() > 0.5 ? '50%' : '3px'};
        width:${Math.random() * 9 + 4}px; height:${Math.random() * 9 + 4}px;
        animation-duration:${Math.random() * 2.5 + 2}s;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }, i * 28);
  }
}

/* ===== LIGHTBOX — iOS STYLE ===== */
const images = ['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg','6.jpg','7.jpg','8.jpg'];
const captions = [
  'A beautiful memory 🌸', 'Moments like these ✨', 'Always smiling 💕',
  'Pure happiness 💖', 'Golden times 💫', 'Just you 🌹',
  'Unforgettable 💗', 'Forever cherished ⭐'
];
const dates = [
  'Memory • 01','Memory • 02','Memory • 03','Memory • 04',
  'Memory • 05','Memory • 06','Memory • 07','Memory • 08'
];

/* Preload all images */
images.forEach(src => { const img = new Image(); img.src = src; });

const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lbImg');
const lbCaption = document.getElementById('lbCaption');
const lbDate    = document.getElementById('lbDate');
const lbCounter = document.getElementById('lbCounter');
const lbBg      = document.getElementById('lbBg');
const lbHeartBtn = document.getElementById('lbHeartBtn');
const memSong   = document.getElementById('memoryMusic');
let currentIdx  = 0;
let memSongPlaying = false;
const liked = new Set();

function updateUI(idx) {
  lbCounter.textContent = `${idx + 1} / ${images.length}`;
  lbCaption.textContent = captions[idx];
  lbDate.textContent    = dates[idx];
  lbHeartBtn.textContent = liked.has(idx) ? '💖' : '🤍';
  lbHeartBtn.classList.toggle('liked', liked.has(idx));
}

function setBg(idx) {
  lbBg.style.opacity = '0';
  setTimeout(() => {
    lbBg.style.backgroundImage = `url('${images[idx]}')`;
    lbBg.style.opacity = '1';
  }, 100);
}

function goTo(idx) {
  const next = (idx + images.length) % images.length;
  if (next === currentIdx) return;
  currentIdx = next;
  lbImg.classList.add('switching');
  setBg(currentIdx);
  setTimeout(() => {
    lbImg.src = images[currentIdx];
    updateUI(currentIdx);
    lbImg.classList.remove('switching');
  }, 180);
}

function openLightbox(idx) {
  currentIdx = idx;
  lbImg.src = images[idx];
  lbBg.style.opacity = '1';
  lbBg.style.backgroundImage = `url('${images[idx]}')`;
  updateUI(idx);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (!memSongPlaying) {
    memSong.currentTime = 0;
    memSong.play().catch(() => {});
    memSongPlaying = true;
    bgMusic.pause(); musicPlaying = false;
    musicBtn.querySelector('.music-icon').textContent = '🔇';
    musicBtn.classList.add('muted');
  }
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  memSong.pause();
  memSongPlaying = false;
}

/* Heart toggle */
lbHeartBtn.addEventListener('click', () => {
  if (liked.has(currentIdx)) liked.delete(currentIdx);
  else liked.add(currentIdx);
  updateUI(currentIdx);
  for (let i = 0; i < 18; i++) {
    const p = createParticle(canvas.width / 2, canvas.height * 0.12, 'burst');
    p.size = Math.random() * 3 + 1; particles.push(p);
  }
});

/* Frame card clicks */
document.querySelectorAll('.frame-card').forEach((card, i) => {
  card.addEventListener('click', () => openLightbox(i));
  card.addEventListener('touchend', e => { e.preventDefault(); openLightbox(i); }, { passive: false });
});

/* Close button */
const lbCloseBtn = document.getElementById('lbClose');
lbCloseBtn.addEventListener('click', closeLightbox);
lbCloseBtn.addEventListener('touchend', e => { e.preventDefault(); e.stopPropagation(); closeLightbox(); }, { passive: false });

/* Keyboard */
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowRight') goTo(currentIdx + 1);
  if (e.key === 'ArrowLeft')  goTo(currentIdx - 1);
  if (e.key === 'Escape')     closeLightbox();
});

/* Swipe left/right to navigate, swipe down to close */
let lbTx = 0, lbTy = 0, lbActive = false;
lightbox.addEventListener('touchstart', e => {
  if (e.target.closest('button')) return;
  lbTx = e.touches[0].clientX;
  lbTy = e.touches[0].clientY;
  lbActive = true;
}, { passive: true });
lightbox.addEventListener('touchend', e => {
  if (!lbActive) return;
  lbActive = false;
  const dx = lbTx - e.changedTouches[0].clientX;
  const dy = lbTy - e.changedTouches[0].clientY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
    goTo(currentIdx + (dx > 0 ? 1 : -1));
  } else if (dy < -65 && Math.abs(dy) > Math.abs(dx) * 1.5) {
    closeLightbox();
  }
}, { passive: true });

/* ===== MUSIC ===== */
const musicBtn = document.getElementById('musicBtn');
const bgMusic  = document.getElementById('bgMusic');
let musicPlaying = false;

function tryPlayBgMusic() {
  if (musicPlaying) return;
  bgMusic.volume = 1;
  const playPromise = bgMusic.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      musicPlaying = true;
      musicBtn.querySelector('.music-icon').textContent = '🎵';
      musicBtn.classList.remove('muted');
    }).catch(() => {
      document.addEventListener('touchstart', function retry() {
        bgMusic.play().then(() => {
          musicPlaying = true;
          musicBtn.querySelector('.music-icon').textContent = '🎵';
          musicBtn.classList.remove('muted');
        }).catch(() => {});
        document.removeEventListener('touchstart', retry);
      }, { once: true, passive: true });
    });
  }
}

musicBtn.addEventListener('click', () => {
  if (lightbox.classList.contains('open')) {
    if (memSongPlaying) {
      memSong.pause(); memSongPlaying = false;
      musicBtn.querySelector('.music-icon').textContent = '🔇';
      musicBtn.classList.add('muted');
    } else {
      memSong.play().catch(() => {}); memSongPlaying = true;
      musicBtn.querySelector('.music-icon').textContent = '🎵';
      musicBtn.classList.remove('muted');
    }
    return;
  }
  if (musicPlaying) {
    bgMusic.pause(); musicPlaying = false;
    musicBtn.querySelector('.music-icon').textContent = '🔇';
    musicBtn.classList.add('muted');
  } else {
    bgMusic.play().catch(() => {}); musicPlaying = true;
    musicBtn.querySelector('.music-icon').textContent = '🎵';
    musicBtn.classList.remove('muted');
  }
});

/* ===== INIT ===== */
window.addEventListener('load', () => {
  showScreen('openingScreen');
  runOpeningSequence();
});
