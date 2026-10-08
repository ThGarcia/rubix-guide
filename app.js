// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('SW registered'))
      .catch(err => console.log('SW error:', err));
  });
}

// Elements
const screens = document.querySelectorAll('.screen');
const navBtns = document.querySelectorAll('.nav-btn');
const headerTitle = document.getElementById('headerTitle');
const themeBtn = document.getElementById('themeBtn');
const installBanner = document.getElementById('installBanner');
const installBtn = document.getElementById('installBtn');

// Titles
const titles = {
  home: 'Rubik Guide',
  '3x3': '3x3 – Iniciante',
  '2x2': '2x2 – Iniciante',
  pyraminx: 'Pyraminx'
};

const light = './images/light.png';
const dark = './images/dark.png';

// ======================
// Navigation
// ======================
function showScreen(id) {
  screens.forEach(s => s.classList.remove('active'));
  navBtns.forEach(b => b.classList.remove('active'));

  const target = document.getElementById(id);
  if (target) target.classList.add('active');

  const btn = document.querySelector(`.nav-btn[data-screen="${id}"]`);
  if (btn) btn.classList.add('active');

  headerTitle.textContent = titles[id] || 'Rubik Guide';
  window.scrollTo(0, 0);
  localStorage.setItem('lastScreen', id);
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.screen));
});

document.querySelectorAll('.cube-card').forEach(card => {
  card.addEventListener('click', () => showScreen(card.dataset.cube));
});

document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => showScreen('home'));
});

// ======================
// Theme
// ======================
function applyTheme(theme) {
  const themeImg = themeBtn.querySelector('img');
  if (theme === 'light') {
    document.documentElement.style.setProperty('--bg', '#f8fafc');
    document.documentElement.style.setProperty('--bg-card', '#ffffff');
    document.documentElement.style.setProperty('--text', '#0f172a');
    document.documentElement.style.setProperty('--text-muted', '#64748b');
    document.documentElement.style.setProperty('--border', '#e2e8f0');
    if (themeImg) themeImg.src = light; 
  } else {
    document.documentElement.style.setProperty('--bg', '#0f172a');
    document.documentElement.style.setProperty('--bg-card', '#1e293b');
    document.documentElement.style.setProperty('--text', '#f1f5f9');
    document.documentElement.style.setProperty('--text-muted', '#94a3b8');
    document.documentElement.style.setProperty('--border', '#334155');
    if (themeImg) themeImg.src = dark;
  }
  localStorage.setItem('theme', theme);
}

themeBtn.addEventListener('click', () => {
  const current = localStorage.getItem('theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

applyTheme(localStorage.getItem('theme') || 'dark');

// ======================
// Progress 3x3
// ======================
const progressKey = 'progress3x3';

function updateProgress() {
  const steps = document.querySelectorAll('#steps-3x3 .step');
  const done = JSON.parse(localStorage.getItem(progressKey) || '[]');
  const percent = Math.round((done.length / steps.length) * 100) || 0;
  const bar = document.getElementById('progress3x3');
  if (bar) bar.style.width = percent + '%';
}

document.querySelectorAll('#steps-3x3 .step').forEach(step => {
  step.addEventListener('click', () => {
    const num = step.dataset.step;
    let done = JSON.parse(localStorage.getItem(progressKey) || '[]');
    if (done.includes(num)) {
      done = done.filter(n => n !== num);
      step.style.opacity = '1';
    } else {
      done.push(num);
      step.style.opacity = '0.7';
    }
    localStorage.setItem(progressKey, JSON.stringify(done));
    updateProgress();
  });
});

document.getElementById('resetProgress3x3')?.addEventListener('click', () => {
  localStorage.removeItem(progressKey);
  document.querySelectorAll('#steps-3x3 .step').forEach(s => s.style.opacity = '1');
  updateProgress();
});

updateProgress();
const savedDone = JSON.parse(localStorage.getItem(progressKey) || '[]');
document.querySelectorAll('#steps-3x3 .step').forEach(step => {
  if (savedDone.includes(step.dataset.step)) {
    step.style.opacity = '0.7';
  }
});

// ======================
// MODO TREINO
// ======================
const treinoState = {
  '3x3': { current: 0, total: 0 },
  '2x2': { current: 0, total: 0 },
  'pyraminx': { current: 0, total: 0 }
};

function getSteps(cube) {
  return Array.from(document.querySelectorAll(`#steps-${cube} .step`));
}

function enterTreino(cube) {
  const steps = getSteps(cube);
  if (steps.length === 0) return;

  treinoState[cube].total = steps.length;
  treinoState[cube].current = 0;

  // Esconde lista normal e mostra treino
  document.getElementById(`steps-${cube}`).classList.add('hidden');
  document.getElementById(`treino-${cube}`).classList.remove('hidden');

  // Esconde o botão de entrar no treino
  document.querySelector(`[data-treino="${cube}"]`).classList.add('hidden');

  renderTreinoStep(cube);
}

function exitTreino(cube) {
  document.getElementById(`steps-${cube}`).classList.remove('hidden');
  document.getElementById(`treino-${cube}`).classList.add('hidden');
  document.querySelector(`[data-treino="${cube}"]`).classList.remove('hidden');
}

function renderTreinoStep(cube) {
  const steps = getSteps(cube);
  const { current, total } = treinoState[cube];
  const step = steps[current];

  // Contador
  const counter = document.getElementById(`treino-counter-${cube}`);
  if (counter) counter.textContent = `Passo ${current + 1} de ${total}`;

  // Conteúdo do passo
  const container = document.getElementById(`treino-step-${cube}`);
  if (container && step) {
    container.innerHTML = step.innerHTML;
  }

  // Botões
  const prevBtn = document.getElementById(`treino-prev-${cube}`);
  const nextBtn = document.getElementById(`treino-next-${cube}`);

  if (prevBtn) prevBtn.disabled = current === 0;
  if (nextBtn) {
    nextBtn.textContent = current === total - 1 ? 'Concluir ✓' : 'Próximo →';
  }
}

function nextTreino(cube) {
  const state = treinoState[cube];
  if (state.current < state.total - 1) {
    state.current++;
    renderTreinoStep(cube);
  } else {
    // Último passo → sai do treino
    exitTreino(cube);
  }
}

function prevTreino(cube) {
  const state = treinoState[cube];
  if (state.current > 0) {
    state.current--;
    renderTreinoStep(cube);
  }
}

// Eventos dos botões de treino
document.querySelectorAll('[data-treino]').forEach(btn => {
  btn.addEventListener('click', () => {
    enterTreino(btn.dataset.treino);
  });
});

document.querySelectorAll('[data-sair-treino]').forEach(btn => {
  btn.addEventListener('click', () => {
    exitTreino(btn.dataset.sairTreino);
  });
});

// Botões Anterior / Próximo
['3x3', '2x2', 'pyraminx'].forEach(cube => {
  document.getElementById(`treino-prev-${cube}`)?.addEventListener('click', () => prevTreino(cube));
  document.getElementById(`treino-next-${cube}`)?.addEventListener('click', () => nextTreino(cube));
});

// ======================
// PWA Install
// ======================
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBanner.classList.add('show');
});

installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    installBanner.classList.remove('show');
  }
  deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
  installBanner.classList.remove('show');
});

// Restore last screen
const last = localStorage.getItem('lastScreen');
if (last && last !== 'home') {
  showScreen(last);
}
