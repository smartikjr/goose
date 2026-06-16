/* ==============================
   GOOSE POKER CLUB — SCRIPT
   ============================== */

// ===== PRELOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('hidden');
    initFloatingCards();
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

document.querySelectorAll('a, button, .game-card, .gallery-item').forEach(el => {
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

// ===== FLOATING CARDS =====
function initFloatingCards() {
  const container = document.getElementById('floatingCards');
  const symbols = ['♠', '♥', '♣', '♦', 'A', 'K', 'Q', 'J', '10'];
  for (let i = 0; i < 20; i++) {
    const card = document.createElement('div');
    card.className = 'float-card';
    card.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    card.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-duration: ${8 + Math.random() * 12}s;
      animation-delay: ${Math.random() * 8}s;
      font-size: ${1 + Math.random() * 2.5}rem;
    `;
    container.appendChild(card);
  }
}

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
  if (label) label.textContent = `⚡ До ${name}:`;
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ===== STICKER GAME =====
const stickers = [
  { icon: '😤', text: 'ГНИДА\nТы нит — и это стратегия!' },
  { icon: '👀', text: 'ПОКАЖИ КАРТУ\nЗал хочет шоу!' },
  { icon: '🔄', text: 'КРУТИТЬ ДВАЖДЫ\nДвойной шанс — двойная победа!' },
  { icon: '🎰', text: 'ALL IN\nВсе или ничего. Вперёд!' },
  { icon: '🤫', text: 'POKER FACE\nТвоё лицо — загадка. Браво!' },
  { icon: '🦆', text: 'GOOSE MODE\nТы в ударе — играй дерзко!' },
  { icon: '💀', text: 'ЯЩИК ПАНДОРЫ\nТы смелее всех за столом!' },
  { icon: '⚡', text: 'БАТАРЕЙКА\nЗаряжен на победу!' },
];

const gameCard = document.getElementById('stickerGame');
const stickerBtn = document.getElementById('stickerBtn');
let usedIndices = [];

function pickSticker() {
  if (usedIndices.length === stickers.length) usedIndices = [];
  let idx;
  do { idx = Math.floor(Math.random() * stickers.length); } while (usedIndices.includes(idx));
  usedIndices.push(idx);
  return stickers[idx];
}

function showSticker() {
  gameCard.classList.remove('flipped');
  setTimeout(() => {
    const s = pickSticker();
    document.querySelector('.result-icon').textContent = s.icon;
    document.querySelector('.result-text').textContent = s.text;
    gameCard.classList.add('flipped');
  }, 400);
}

gameCard.addEventListener('click', showSticker);
stickerBtn.addEventListener('click', showSticker);

// ===== POKER MINI GAME =====
const suits = ['♠', '♥', '♣', '♦'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function createDeck() {
  const deck = [];
  for (const s of suits) for (const r of ranks) deck.push({ rank: r, suit: s });
  return deck.sort(() => Math.random() - 0.5);
}

function isRed(suit) { return suit === '♥' || suit === '♦'; }

function renderCard(slot, card) {
  slot.innerHTML = `<span class="card-rank">${card.rank}</span><span class="card-suit">${card.suit}</span>`;
  slot.classList.add('dealt');
  slot.classList.toggle('red-card', isRed(card.suit));
  slot.classList.toggle('black-card', !isRed(card.suit));
}

function evaluateHand(cards) {
  const rankValues = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14 };
  const rv = cards.map(c => rankValues[c.rank]).sort((a, b) => a - b);
  const sv = cards.map(c => c.suit);
  const rankCount = {};
  rv.forEach(r => rankCount[r] = (rankCount[r] || 0) + 1);
  const counts = Object.values(rankCount).sort((a, b) => b - a);
  const isFlush = sv.every(s => s === sv[0]) && cards.length >= 5;
  const isStraight = rv.length >= 5 && rv[rv.length - 1] - rv[0] === rv.length - 1 && new Set(rv).size === rv.length;
  if (isFlush && isStraight && rv.includes(14)) return '🏆 Роял-флеш! Легенда!';
  if (isFlush && isStraight) return '🌟 Стрит-флеш! Невероятно!';
  if (counts[0] === 4) return '💥 Каре! Мощный удар!';
  if (counts[0] === 3 && counts[1] === 2) return '🔥 Фулл-хаус! Отлично!';
  if (isFlush) return '💧 Флеш! Красиво!';
  if (isStraight) return '📈 Стрит! Хорошая рука!';
  if (counts[0] === 3) return '🎯 Тройка! Неплохо!';
  if (counts[0] === 2 && counts[1] === 2) return '👯 Две пары!';
  if (counts[0] === 2) return '✌️ Одна пара';
  return '😤 Старшая карта — блефуй!';
}

const dealBtn = document.getElementById('dealBtn');
const resetBtn = document.getElementById('resetBtn');

dealBtn.addEventListener('click', () => {
  const deck = createDeck();
  const communitySlots = document.querySelectorAll('#communityCards .table-card-slot');
  const handSlots = document.querySelectorAll('#yourHand .hand-slot');

  communitySlots.forEach(s => { s.textContent = ''; s.className = 'table-card-slot'; });
  handSlots.forEach(s => { s.textContent = ''; s.className = 'table-card-slot hand-slot'; });
  document.getElementById('tableResult').textContent = '';

  const dealt = deck.splice(0, 7);
  const allSlots = [...communitySlots, ...handSlots];

  allSlots.forEach((slot, idx) => {
    setTimeout(() => {
      renderCard(slot, dealt[idx]);
      if (idx === allSlots.length - 1) {
        setTimeout(() => {
          document.getElementById('tableResult').textContent = evaluateHand(dealt);
          resetBtn.style.display = 'inline-flex';
          dealBtn.style.display = 'none';
        }, 400);
      }
    }, idx * 200);
  });
});

resetBtn.addEventListener('click', () => {
  document.querySelectorAll('.table-card-slot').forEach(s => {
    s.innerHTML = '';
    s.className = s.classList.contains('hand-slot') ? 'table-card-slot hand-slot' : 'table-card-slot';
  });
  document.getElementById('tableResult').textContent = '';
  resetBtn.style.display = 'none';
  dealBtn.style.display = 'inline-flex';
});

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

// ===== PARALLAX HERO =====
window.addEventListener('scroll', () => {
  const hero = document.getElementById('hero');
  const y = window.scrollY;
  hero.style.backgroundPositionY = `${y * 0.3}px`;
  const showcase = document.querySelector('.hero-cards-showcase');
  if (showcase) showcase.style.transform = `translateY(calc(-50% + ${y * 0.15}px))`;
});
