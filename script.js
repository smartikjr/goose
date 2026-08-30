/* ==============================
   GOOSE POKER CLUB — SCRIPT
   ============================== */

// ===== CAPABILITY GATES =====
const isDesktop = window.innerWidth > 900 && matchMedia('(pointer: fine)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = !!(window.gsap && window.ScrollTrigger);
if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

// ===== PRELOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('hidden');
  }, 1800);
});

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursorTrail');
let mx = 0, my = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

function animateTrail() {
  tx += (mx - tx) * 0.15;
  ty += (my - ty) * 0.15;
  trail.style.left = tx + 'px';
  trail.style.top = ty + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();

document.querySelectorAll('a, button, .game-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '20px';
    cursor.style.height = '20px';
    trail.style.transform = 'translate(-50%,-50%) scale(1.5)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '12px';
    cursor.style.height = '12px';
    trail.style.transform = 'translate(-50%,-50%) scale(1)';
  });
});

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
  document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
});

burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mm-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ===== BACK TO TOP =====
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== REVEAL ON SCROLL =====
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ===== COUNTDOWN — next tournament from weekly schedule =====
const schedule = [
  { day: 1, hour: 19, name: 'GOOSE CLASSIC (Пн)' },
  { day: 2, hour: 19, name: 'GOOSE HUNTER (Вт)' },
  { day: 3, hour: 19, name: 'GOOSE CLASSIC (Ср)' },
  { day: 4, hour: 19, name: 'MYSTERY BOUNTY (Чт)' },
  { day: 5, hour: 19, name: 'GOOSE DEEPSTACK (Пт)' },
  { day: 6, hour: 17, name: 'WIN THE BUTTON (Сб)' },
  { day: 0, hour: 17, name: 'GOOSE BATTERY (Вс)' },
];

function getNextTournament() {
  const now = new Date();
  let bestTime = null;
  let bestName = '';
  for (const s of schedule) {
    const t = new Date(now);
    const daysUntil = (s.day - now.getDay() + 7) % 7;
    t.setDate(now.getDate() + daysUntil);
    t.setHours(s.hour, 0, 0, 0);
    if (t <= now) t.setDate(t.getDate() + 7);
    if (!bestTime || t < bestTime) { bestTime = t; bestName = s.name; }
  }
  return { time: bestTime, name: bestName };
}

function updateCountdown() {
  const { time, name } = getNextTournament();
  const diff = time - new Date();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('cd-d').textContent = String(d).padStart(2, '0');
  document.getElementById('cd-h').textContent = String(h).padStart(2, '0');
  document.getElementById('cd-m').textContent = String(m).padStart(2, '0');
  document.getElementById('cd-s').textContent = String(s).padStart(2, '0');
  const label = document.getElementById('countdownLabel');
  if (label) label.textContent = `До ${name}:`;
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ===== LEVEL BUTTONS =====
document.querySelectorAll('.level-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ===== FORM =====
document.getElementById('signupForm').addEventListener('submit', e => {
  e.preventDefault();
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('formSuccess').style.display = 'block';
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== PARALLAX HERO CARDS =====
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const showcase = document.querySelector('.hero-cards-showcase');
  if (showcase) showcase.style.transform = `translateY(calc(-50% + ${y * 0.15}px))`;
});

/* ==============================
   PREMIUM 3D / GSAP LAYER
   ============================== */

// ===== HERO — premium goose-flock backdrop (canvas, replaces Vanta) =====
// A handful of large, slow, monochrome goose silhouettes with soft depth
// (far birds smaller/blurred/dim, near birds bigger/sharper/warmer) instead
// of Vanta's colorful confetti-triangle birds.
function initGooseFlock() {
  if (!isDesktop || reduceMotion || !window.matchMedia('(min-width: 901px)').matches) return;
  const canvas = document.getElementById('gooseFlock');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const host = canvas.parentElement;

  const FAR_COLOR = [0x4c, 0x43, 0x36];   // lighter charcoal, still reads as silhouette
  const NEAR_COLOR = [0xd0, 0xa0, 0x48];  // warm gold, closer to brand gold
  function lerpColor(t) {
    const c = FAR_COLOR.map((v, i) => Math.round(v + (NEAR_COLOR[i] - v) * t));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }

  let w = 0, h = 0;
  function resize() {
    const rect = host.getBoundingClientRect();
    w = rect.width; h = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = 7;
  const birds = [];
  for (let i = 0; i < COUNT; i++) {
    const depth = Math.random();
    birds.push({
      x: Math.random() * 1.3 - 0.15,
      y: 0.08 + Math.random() * 0.55,
      depth,
      size: 38 + depth * 96,
      speed: 0.00018 + depth * 0.00034,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: 0.018 + Math.random() * 0.01,
      bobPhase: Math.random() * Math.PI * 2
    });
  }
  birds.sort((a, b) => a.depth - b.depth);

  function drawGoose(x, y, size, flap, color, alpha) {
    const s = size / 40;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.translate(x, y);
    ctx.scale(s, s);

    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(9, -1);
    ctx.quadraticCurveTo(14, -10, 12, -17);
    ctx.quadraticCurveTo(11, -20, 14, -21);
    ctx.quadraticCurveTo(17, -20, 15, -16);
    ctx.quadraticCurveTo(17, -12, 12, -2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(14, -20, 3, 2.6, 0.4, 0, Math.PI * 2);
    ctx.fill();

    const lift = flap * 9;
    [-1, 1].forEach(dir => {
      ctx.beginPath();
      ctx.moveTo(dir * 2, -2);
      ctx.quadraticCurveTo(dir * 20, -6 - lift, dir * 34, 2 - lift * 0.6);
      ctx.quadraticCurveTo(dir * 18, 3, dir * 2, 1);
      ctx.closePath();
      ctx.fill();
    });

    ctx.restore();
  }

  let paused = false;
  let raf;
  function animate() {
    raf = requestAnimationFrame(animate);
    if (paused) return;
    ctx.clearRect(0, 0, w, h);
    birds.forEach(b => {
      b.x += b.speed;
      if (b.x > 1.2) b.x = -0.2;
      b.wingPhase += b.wingSpeed;
      const flap = Math.sin(b.wingPhase);
      const bob = Math.sin(b.wingPhase * 0.5 + b.bobPhase) * 5 * b.depth;
      const px = b.x * w;
      const py = b.y * h + bob;
      const alpha = 0.22 + b.depth * 0.4;
      const blurPx = b.depth < 0.4 ? (0.4 - b.depth) * 4 : 0;
      ctx.filter = blurPx > 0 ? `blur(${blurPx.toFixed(1)}px)` : 'none';
      drawGoose(px, py, b.size, flap, lerpColor(b.depth), alpha);
    });
    ctx.filter = 'none';
  }
  animate();

  document.addEventListener('visibilitychange', () => { paused = document.hidden; });
  new IntersectionObserver(entries => {
    entries.forEach(entry => { paused = !entry.isIntersecting; });
  }, { threshold: 0.05 }).observe(host);
}

// ===== 3D POINTER TILT =====
function initTilt(selector, maxTilt) {
  if (!isDesktop || reduceMotion) return;
  document.querySelectorAll(selector).forEach(card => {
    card.classList.add('tilt-card');
    let raf;
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * -maxTilt;
      const ry = (px - 0.5) * maxTilt;
      cancelAnimationFrame(raf);
      card.style.transition = 'transform 0.1s linear';
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) scale(1.02)`;
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      card.style.transition = 'transform 0.5s cubic-bezier(.2,.8,.2,1)';
      card.style.transform = '';
    });
  });
}

// ===== SECTION DIVIDERS — feather draw-in =====
function initDividers() {
  const feathers = document.querySelectorAll('.divider-feather');
  if (!feathers.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  feathers.forEach(f => io.observe(f));
}

// ===== TOURNAMENTS — magnetic pointer spotlight =====
// A soft radial glow that tracks the cursor inside each week-day card, tinted
// orange (gold on the Sunday main-event card via --wd-glow-rgb). Desktop-only:
// on touch/mobile this never attaches, so the card's --wd-glow-o custom
// property just sits at its CSS initial value of 0 and the gradient stays
// fully transparent — nothing to render, nothing to fall back to.
function initWeekGlow() {
  if (!isDesktop || reduceMotion) return;
  document.querySelectorAll('.week-day').forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--wd-glow-x', px + '%');
      card.style.setProperty('--wd-glow-y', py + '%');
    });
    card.addEventListener('pointerenter', () => {
      card.style.setProperty('--wd-glow-o', '0.16');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--wd-glow-o', '0');
    });
  });
}

// ===== TOURNAMENTS — weekly cascade with Fri/Sun highlight =====
function initWeekCascade() {
  if (!hasGSAP || reduceMotion) return;
  const days = gsap.utils.toArray('.week-day');
  if (!days.length) return;
  // .week-day already carries a CSS transition on transform/box-shadow (for hover);
  // suspend it during the scripted entrance so GSAP isn't fighting a second animation engine.
  // No rotateX here on purpose: a 3D tilt during a *staggered* entrance means every
  // card in the row sits at a slightly different rotation/offset while settling,
  // which reads as "misaligned buttons" for the ~1s the cascade is still playing.
  gsap.set(days, { opacity: 0, y: 40, transition: 'none' });

  ScrollTrigger.batch('.week-day', {
    start: 'top 88%',
    once: true,
    onEnter: batch => {
      gsap.to(batch, {
        opacity: 1, y: 0,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power2.out',
        onComplete: () => {
          batch.forEach(el => {
            if (el.classList.contains('wd-featured') || el.classList.contains('wd-main-event')) {
              gsap.fromTo(el,
                { boxShadow: '0 0 0 rgba(245,130,10,0)' },
                {
                  boxShadow: '0 0 45px rgba(245,130,10,0.35)', duration: 0.6, yoyo: true, repeat: 1,
                  onComplete: () => { el.style.transition = ''; }
                }
              );
            } else {
              el.style.transition = '';
            }
          });
        }
      });
    }
  });
}

// ===== GALLERY — horizontal scroll (desktop only) =====
function initGalleryScroll() {
  if (!hasGSAP || !isDesktop) return;
  const grid = document.querySelector('.atm-grid');
  const pinWrap = document.querySelector('.gallery-pin');
  if (!grid || !pinWrap) return;
  grid.classList.add('gallery-horizontal');
  // .atm-grid also carries the generic .reveal class (transition: transform 0.7s);
  // that would fight the scrub-driven x transform, so hand transform fully to GSAP.
  grid.style.transition = 'none';

  requestAnimationFrame(() => {
    const scrollDistance = grid.scrollWidth - pinWrap.clientWidth;
    if (scrollDistance <= 0) return;
    gsap.to(grid, {
      x: -scrollDistance,
      ease: 'none',
      scrollTrigger: {
        trigger: pinWrap,
        start: 'top top+=80',
        end: () => '+=' + scrollDistance,
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true
      }
    });
  });
}

// ===== HERO → ABOUT — scroll-scattered pocket 2s =====
// The fanned pair in the hero flies apart across the page width as the hero
// scrolls out of view, each card with its own rotation/scale/depth so it
// reads as a deliberate scatter rather than noise. Scrubbed 1:1 to scroll,
// so scrolling back up re-collects the cards exactly.
function initHeroCardScatter() {
  if (!hasGSAP || !isDesktop || reduceMotion) return;
  const sc1 = document.querySelector('.showcase-card.sc1');
  const sc2 = document.querySelector('.showcase-card.sc2');
  const hero = document.getElementById('hero');
  if (!sc1 || !sc2 || !hero) return;

  // Base state mirrors the resting CSS transform exactly (translate(-50%,-50%)
  // rotate(...) translate(...)) so there's no jump when GSAP takes over the
  // transform at scroll position 0.
  gsap.set(sc1, { xPercent: -50, yPercent: -50, x: -46, y: 10, rotation: -9, scale: 1, opacity: 1, willChange: 'transform, opacity' });
  gsap.set(sc2, { xPercent: -50, yPercent: -50, x: 30, y: -6, rotation: 10, scale: 1, opacity: 1, willChange: 'transform, opacity' });

  gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true
    }
  })
  // Spades card — flies further into the distance: smaller, more rotated, dimmer.
  .to(sc1, {
    x: () => -(window.innerWidth * 0.52),
    y: -70,
    rotation: -68,
    scale: 0.58,
    opacity: 0.12,
    ease: 'power1.inOut'
  }, 0)
  // Hearts card — swoops past closer: bigger, dominant, fades a touch later.
  .to(sc2, {
    x: () => window.innerWidth * 0.42,
    y: 50,
    rotation: 58,
    scale: 1.28,
    opacity: 0.2,
    ease: 'power1.inOut'
  }, 0);
}

// ===== ABOUT — "ALL IN" triangular acrylic prism, rotated by scroll =====
// Hand-built triangular prism (3 quads for the edges + 2 triangle caps) so
// each face gets its own material: a canvas-textured front (goose + ALL IN),
// a plain dark back, and warm-emissive edge faces for that acrylic-bevel
// glow when the thickness comes into view mid-rotation.
function initAllInChip() {
  const container = document.getElementById('allInChip');
  if (!container) return;
  if (!isDesktop || reduceMotion || !hasGSAP || !window.THREE) return;

  const width = container.clientWidth || 240;
  const height = container.clientHeight || 210;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
  camera.position.set(0, 0.05, 6.4);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  container.classList.add('js-active');

  // Triangle in local units (apex up), matched by the canvas texture below.
  const A = { x: 0, y: 1.15 };
  const B = { x: -1.05, y: -0.68 };
  const C = { x: 1.05, y: -0.68 };
  const minX = -1.05, maxX = 1.05, minY = -0.68, maxY = 1.15;
  const halfDepth = 0.15;

  // ---- Front-face canvas texture: dark ground, gold/orange bevel, goose, ALL IN ----
  const cw = 512, ch = Math.round(512 * (maxY - minY) / (maxX - minX));
  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d');
  const pA = [cw * 0.5, 0], pB = [0, ch], pC = [cw, ch];
  const centroid = [(pA[0] + pB[0] + pC[0]) / 3, (pA[1] + pB[1] + pC[1]) / 3];
  const moveToward = (p, t, d) => {
    const dx = t[0] - p[0], dy = t[1] - p[1], len = Math.hypot(dx, dy) || 1;
    return [p[0] + (dx / len) * d, p[1] + (dy / len) * d];
  };

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pA[0], pA[1]); ctx.lineTo(pB[0], pB[1]); ctx.lineTo(pC[0], pC[1]); ctx.closePath();
  ctx.clip();
  const bgGrad = ctx.createRadialGradient(cw * 0.5, ch * 0.35, 20, cw * 0.5, ch * 0.55, ch * 0.8);
  bgGrad.addColorStop(0, '#201a12');
  bgGrad.addColorStop(1, '#0a0806');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();

  const [iA, iB, iC] = [moveToward(pA, centroid, 22), moveToward(pB, centroid, 16), moveToward(pC, centroid, 16)];
  const borderGrad = ctx.createLinearGradient(0, 0, cw, ch);
  borderGrad.addColorStop(0, '#F0C040');
  borderGrad.addColorStop(1, '#F5820A');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(iA[0], iA[1]); ctx.lineTo(iB[0], iB[1]); ctx.lineTo(iC[0], iC[1]); ctx.closePath();
  ctx.stroke();

  const [hA, hB, hC] = [moveToward(iA, centroid, 10), moveToward(iB, centroid, 10), moveToward(iC, centroid, 10)];
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(hA[0], hA[1]); ctx.lineTo(hB[0], hB[1]); ctx.lineTo(hC[0], hC[1]); ctx.closePath();
  ctx.stroke();

  ctx.save();
  ctx.translate(cw * 0.5, ch * 0.42);
  ctx.strokeStyle = '#F0C040';
  ctx.fillStyle = '#F0C040';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.ellipse(-4, 14, 20, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, 8);
  ctx.quadraticCurveTo(16, -8, 7, -22);
  ctx.quadraticCurveTo(20, -16, 12, -30);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(12, -30, 5.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(16, -32); ctx.lineTo(28, -36); ctx.lineTo(18, -24); ctx.closePath(); ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#F0C040';
  ctx.font = '700 34px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ALL IN', cw * 0.5, ch * 0.78);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  // ---- Geometry: two triangle caps + three edge quads, built by hand ----
  const frontUV = (p) => [(p.x - minX) / (maxX - minX), (p.y - minY) / (maxY - minY)];
  function triFace(p1, p2, p3, z, withUV) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      p1.x, p1.y, z, p2.x, p2.y, z, p3.x, p3.y, z
    ]), 3));
    if (withUV) {
      const [u1, v1] = frontUV(p1), [u2, v2] = frontUV(p2), [u3, v3] = frontUV(p3);
      geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([u1, v1, u2, v2, u3, v3]), 2));
    }
    geo.computeVertexNormals();
    return geo;
  }
  function sideFace(p1, p2, hd) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      p1.x, p1.y, hd,  p2.x, p2.y, hd,  p2.x, p2.y, -hd,
      p1.x, p1.y, hd,  p2.x, p2.y, -hd, p1.x, p1.y, -hd
    ]), 3));
    geo.computeVertexNormals();
    return geo;
  }

  const group = new THREE.Group();
  const frontMat = new THREE.MeshPhysicalMaterial({
    map: texture, roughness: 0.38, metalness: 0.08,
    clearcoat: 0.6, clearcoatRoughness: 0.25, side: THREE.DoubleSide
  });
  group.add(new THREE.Mesh(triFace(A, B, C, halfDepth, true), frontMat));

  const backMat = new THREE.MeshStandardMaterial({ color: 0x120f0a, roughness: 0.6, metalness: 0.1, side: THREE.DoubleSide });
  group.add(new THREE.Mesh(triFace(A, B, C, -halfDepth, false), backMat));

  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0x2a2013, roughness: 0.45, metalness: 0.35,
    emissive: 0xF5820A, emissiveIntensity: 0.22, side: THREE.DoubleSide
  });
  [[A, B], [B, C], [C, A]].forEach(([p1, p2]) => {
    group.add(new THREE.Mesh(sideFace(p1, p2, halfDepth), edgeMat));
  });
  scene.add(group);

  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(2.5, 3, 4);
  scene.add(key);
  const warm = new THREE.DirectionalLight(0xffb066, 1.0);
  warm.position.set(-3, -1.5, 2.5);
  scene.add(warm);
  scene.add(new THREE.AmbientLight(0x40301c, 1.15));

  gsap.set(group.rotation, { y: -0.35, x: 0.04 });

  let paused = false;
  function animate() {
    requestAnimationFrame(animate);
    if (paused) return;
    group.rotation.y += 0.006;
    group.rotation.x = 0.04 + Math.sin(Date.now() * 0.0007) * 0.05;
    renderer.render(scene, camera);
  }
  animate();

  document.addEventListener('visibilitychange', () => { paused = document.hidden; });
  new IntersectionObserver(entries => {
    entries.forEach(entry => { paused = !entry.isIntersecting; });
  }, { threshold: 0.05 }).observe(container);

  window.addEventListener('resize', () => {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

// ===== INIT PREMIUM LAYER =====
initGooseFlock();
initHeroCardScatter();
initAllInChip();
initTilt('.week-day', 8);
initWeekGlow();
initTilt('.bonus-card', 8);
initDividers();
initWeekCascade();
initGalleryScroll();

window.addEventListener('load', () => {
  if (hasGSAP) setTimeout(() => ScrollTrigger.refresh(), 2000);
});
