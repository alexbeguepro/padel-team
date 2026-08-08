/**
 * app.js
 * Chef d'orchestre : charge les données, initialise les vues et la navigation.
 */

import { loadData, mergePlayers } from './api.js';
import { initUI } from './ui.js';
import { renderRanking } from './ranking.js';
import { initProfile, initPlayerModal } from './profile.js';
import { initShowroom } from './showroom.js';

const VIEWS = ['showroom', 'ranking', 'profile'];

let deferredPrompt = null;
let currentView = 'showroom';

async function bootstrap() {
    initUI();
    initPlayerModal();

    const { profilesData, rankingData } = await loadData();
    const players = mergePlayers(rankingData, profilesData);

    initShowroom(profilesData, rankingData);
    renderRanking(players);
    initProfile(players);

    setupNavigation();
    setupPWAInstall();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('✅ Service Worker enregistré', reg))
                .catch(err => console.error('❌ Échec du Service Worker', err));
        });
    }
}

/* ------------------------------------------------------------ NAVIGATION */
function setupNavigation() {
    document.querySelectorAll('.nav-btn, .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate(10);
            switchView(btn.dataset.view);
        });
    });

    setupSwipe();
}

function switchView(viewName) {
    if (!VIEWS.includes(viewName) || viewName === currentView) return;
    currentView = viewName;

    document.querySelectorAll('.view-section').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active');
    });

    const target = document.getElementById(`${viewName}-view`);
    target.style.display = 'block';
    void target.offsetWidth; // reflow pour rejouer l'animation d'entrée
    target.classList.add('active');

    document.querySelectorAll('.nav-btn, .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName === 'ranking' && typeof confetti !== 'undefined'
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        confetti({
            particleCount: 70,
            spread: 62,
            startVelocity: 34,
            origin: { y: 0.12, x: 0.5 },
            colors: ['#ffd166', '#22e1ff', '#ff3ded', '#ffffff']
        });
    }
}

/** Navigation par balayage horizontal (mobile). */
function setupSwipe() {
    let startX = 0;
    let startY = 0;

    document.addEventListener('touchstart', e => {
        startX = e.changedTouches[0].screenX;
        startY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].screenX - startX;
        const dy = e.changedTouches[0].screenY - startY;

        // On ignore les gestes principalement verticaux (défilement).
        if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

        const index = VIEWS.indexOf(currentView);
        const next = dx < 0
            ? VIEWS[(index + 1) % VIEWS.length]
            : VIEWS[(index - 1 + VIEWS.length) % VIEWS.length];

        if (navigator.vibrate) navigator.vibrate(15);
        switchView(next);
    }, { passive: true });
}

/* ---------------------------------------------------------- INSTALL PWA */
function setupPWAInstall() {
    const installBtn = document.getElementById('install-btn');
    if (!installBtn) return;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (!isStandalone && isMobile) installBtn.style.display = 'grid';

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'grid';
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            installBtn.style.display = 'none';
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
        } else {
            alert("🍏 Sur iPhone/iPad : appuie sur l'icône « Partager » en bas, puis « Sur l'écran d'accueil ».\n\n🤖 Sur Android : menu ⋮ du navigateur, puis « Ajouter à l'écran d'accueil ».");
        }
    });

    window.addEventListener('appinstalled', () => {
        installBtn.style.display = 'none';
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}

window.switchView = switchView;
