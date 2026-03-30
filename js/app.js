/**
 * app.js
 * Chef d'orchestre : Importe les données via l'API et initialise les autres modules UI.
 */

import { loadData } from './api.js';
import { initUI } from './ui.js';
import { initGarage } from './garage.js';
import { renderRanking } from './ranking.js';

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
}

// --- NAVIGATION GENERALE ---
function setupNavigation() {
    const navGarage = document.getElementById('nav-garage');
    const navRanking = document.getElementById('nav-ranking');

    if (navGarage) navGarage.addEventListener('click', () => switchView('garage'));
    if (navRanking) navRanking.addEventListener('click', () => switchView('ranking'));
}

function switchView(viewName) {
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
}

// Start
document.addEventListener('DOMContentLoaded', bootstrap);
