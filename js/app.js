/**
 * app.js
 * Chef d'orchestre : Importe les données via l'API et initialise les autres modules UI.
 */

import { loadData } from './api.js';
import { initUI } from './ui.js';
import { initGarage } from './garage.js';
import { renderRanking } from './ranking.js';

let deferredPrompt;
let currentView = 'garage';

async function bootstrap() {
    // 1. Init UI transversale (Thème, Splash Screen...)
    initUI();

    // 2. Load Data
    const { profilesData, rankingData } = await loadData();

    // 3. Init Vues
    initGarage(profilesData);
    renderRanking(rankingData, profilesData);

    // 4. Setup Global Navigation
    setupNavigation();

    // 5. Setup Service Worker (PWA)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('✅ Service Worker Registered', reg))
                .catch(err => console.error('❌ Service Worker Registration failed', err));
        });
    }

    setupPWAInstall();
}

function setupPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.addEventListener('click', async () => {
                installBtn.style.display = 'none';
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('User accepted the PWA prompt');
                }
                deferredPrompt = null;
            });
        }
    });

    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        const installBtn = document.getElementById('install-btn');
        if(installBtn) installBtn.style.display = 'none';
    });
}

function setupNavigation() {
    const navGarage = document.getElementById('nav-garage');
    const navRanking = document.getElementById('nav-ranking');

    if (navGarage) navGarage.addEventListener('click', () => {
        if(navigator.vibrate) navigator.vibrate(10);
        switchView('garage');
    });
    if (navRanking) navRanking.addEventListener('click', () => {
        if(navigator.vibrate) navigator.vibrate(10);
        switchView('ranking');
    });

    // Touch Swipe Navigation
    let touchstartX = 0;
    let touchendX = 0;
    
    function checkDirection() {
        if (touchendX < touchstartX - 70) {
            // Swipe Left
            if(currentView === 'garage') {
                if(navigator.vibrate) navigator.vibrate(15);
                switchView('ranking');
            }
        }
        if (touchendX > touchstartX + 70) {
            // Swipe Right
            if(currentView === 'ranking') {
                if(navigator.vibrate) navigator.vibrate(15);
                switchView('garage');
            }
        }
    }
    
    document.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        checkDirection();
    });
}

function switchView(viewName) {
    if(currentView === viewName && !document.getElementById(viewName + '-view').style.display) {
        // Initial setup edgecase
    } else if(currentView === viewName) {
        return;
    } else {
       currentView = viewName;
    }
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    const target = document.getElementById(viewName + '-view');
    target.style.display = 'block';
    target.classList.remove('active');
    void target.offsetWidth; // Trigger reflow
    target.classList.add('active');

    document.getElementById('nav-' + viewName).classList.add('active');

    const filterWrapper = document.getElementById('garage-filters');
    if (filterWrapper) {
        filterWrapper.style.display = (viewName === 'garage') ? 'block' : 'none';
    }

    if (viewName === 'ranking' && typeof confetti !== 'undefined') {
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.1, x: 0.5 },
            colors: ['#D4AF37', '#FFDF00', '#FFFFFF']
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}

window.switchView = switchView;
