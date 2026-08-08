/**
 * showroom.js
 * Vue Showroom : hero animé, filtres par pilote et grille de cartes « affiche ».
 * Chaque carte porte la couleur de son propriétaire via la variable CSS --pc.
 */

import { reveal, countUp, levelClass, esc, reducedMotion } from './ui.js';

let allRackets = [];
let activeOwner = 'all';
let owners = [];

export function initShowroom(profilesData, rankingData = []) {
    allRackets = [];
    owners = [];

    profilesData.forEach(profile => {
        owners.push({ name: profile.name, color: profile.color, count: profile.rackets.length });
        profile.rackets.forEach(r => {
            allRackets.push({ ...r, ownerName: profile.name, ownerColor: profile.color });
        });
    });

    renderHeroStats(rankingData);
    renderFilters();
    renderGrid();
}

/* ------------------------------------------------------------------- HERO */
function renderHeroStats(rankingData) {
    const host = document.getElementById('hero-stats');
    if (!host) return;

    const points = rankingData.map(p => p.points || 0);
    const bestPoints = points.length ? Math.max(...points) : 0;
    const priceValues = allRackets
        .map(r => parseFloat(String(r.price).replace(/[^\d,.]/g, '').replace(',', '.')))
        .filter(v => !isNaN(v));
    const maxPrice = priceValues.length ? Math.round(Math.max(...priceValues)) : 0;

    const tiles = [
        { val: allRackets.length, label: 'Raquettes' },
        { val: owners.length, label: 'Pilotes' },
        { val: bestPoints, label: 'Meilleur score' },
        { val: maxPrice, label: 'Pièce maîtresse', suffix: ' €' }
    ];

    host.innerHTML = tiles
        .map(t => `<div class="hero-stat"><b data-count="${t.val}" data-suffix="${t.suffix || ''}">0</b><span>${t.label}</span></div>`)
        .join('');

    host.querySelectorAll('[data-count]').forEach(el => {
        countUp(el, Number(el.dataset.count), { suffix: el.dataset.suffix });
    });
}

/* ---------------------------------------------------------------- FILTRES */
function renderFilters() {
    const host = document.getElementById('sr-filters');
    if (!host) return;

    const chips = [
        `<button class="filter-btn active" data-owner="all">Tout le garage</button>`,
        ...owners.map(o => `
            <button class="filter-btn" data-owner="${esc(o.name)}" style="--pc:${o.color}">
                <i class="chip-dot"></i>${esc(o.name)}
            </button>`)
    ];

    host.innerHTML = chips.join('');

    host.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.owner === activeOwner) return;
            activeOwner = btn.dataset.owner;
            host.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (navigator.vibrate) navigator.vibrate(8);
            renderGrid();
        });
    });
}

/* ------------------------------------------------------------------ GRILLE */
function renderGrid() {
    const feed = document.getElementById('sr-feed');
    const counter = document.getElementById('sr-count');
    if (!feed) return;

    const list = activeOwner === 'all'
        ? allRackets
        : allRackets.filter(r => r.ownerName === activeOwner);

    if (counter) {
        counter.innerHTML = `<b>${list.length}</b> raquette${list.length > 1 ? 's' : ''} affichée${list.length > 1 ? 's' : ''}`;
    }

    feed.innerHTML = '';

    if (!list.length) {
        feed.innerHTML = `<div class="empty-state"><span class="emoji">🎾</span>Aucune raquette pour ce pilote.</div>`;
        return;
    }

    list.forEach((racket, index) => {
        const card = buildCard(racket, index);
        feed.appendChild(card);
        reveal(card, index);
        setupTilt(card);
        setupAngles(card, racket);
    });

    animateGaugesOnScroll(feed);
}

function buildCard(racket, index) {
    const card = document.createElement('article');
    card.className = 'sr-card';
    card.style.setProperty('--pc', racket.ownerColor);

    const { brand, model } = splitName(racket.name);
    const specs = racket.specs || {};

    const angles = (racket.images && racket.images.length > 1)
        ? `<div class="sr-angles">${racket.images
            .map((_, i) => `<button class="sr-angle-dot ${i === 0 ? 'active' : ''}" data-index="${i}"
                     aria-label="Angle ${i + 1}"></button>`)
            .join('')}</div>`
        : '';

    const specRows = [
        ['Poids', specs.weight],
        ['Forme', specs.shape],
        ['Mousse', specs.foam],
        ['Surface', specs.surface]
    ].map(([label, value]) => `
        <div class="sr-spec">
            <dt>${label}</dt>
            <dd>${esc(value || '—')}</dd>
        </div>`).join('');

    const gauges = Object.entries(racket.stats || {}).map(([key, val]) => {
        const offset = 176 - (Number(val) * 17.6);
        return `
            <div class="sr-gauge">
                <div class="sr-gauge-ring">
                    <svg viewBox="0 0 70 70" aria-hidden="true">
                        <circle class="sr-gauge-bg" cx="35" cy="35" r="28" />
                        <circle class="sr-gauge-fill" cx="35" cy="35" r="28" data-offset="${offset}" />
                    </svg>
                    <span class="sr-gauge-val">${String(val).padStart(2, '0')}</span>
                </div>
                <span class="sr-gauge-label">${esc(key)}</span>
            </div>`;
    }).join('');

    card.innerHTML = `
        <div class="sr-stage">
            <span class="chip sr-owner"><i class="chip-dot"></i>${esc(racket.ownerName)}</span>
            <span class="sr-price">${esc(racket.price)}</span>
            <div class="sr-glow" aria-hidden="true"></div>
            <div class="sr-frame">
                <img src="${esc(racket.images[0])}" alt="${esc(racket.name)}"
                     loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async">
            </div>
            ${angles}
        </div>

        <div class="sr-body">
            <div class="sr-head">
                <div>
                    ${brand ? `<span class="sr-brand">${esc(brand)}</span>` : ''}
                    <h3 class="sr-title">${esc(model)}</h3>
                </div>
                <span class="chip chip-level ${levelClass(racket.level)}">${esc(racket.level)}</span>
            </div>

            <p class="sr-desc">${esc(racket.description || '')}</p>

            <dl class="sr-specs">${specRows}</dl>

            <div class="sr-telemetry">
                <h4 class="sr-telemetry-title">Télémétrie</h4>
                <div class="sr-gauges">${gauges}</div>
            </div>

            <div class="sr-actions">
                <a class="btn-ghost" href="${esc(racket.url || '#')}" target="_blank" rel="noopener noreferrer">
                    Voir l'offre
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </a>
            </div>
        </div>
    `;

    return card;
}

/**
 * « Babolat Counter Viper 2025 » → marque « Babolat », modèle « Counter Viper 2025 ».
 * Si le nom tient en un seul mot, on garde tout dans le modèle.
 */
function splitName(name = '') {
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2) return { brand: '', model: name };
    return { brand: parts[0], model: parts.slice(1).join(' ') };
}

/* ------------------------------------------------------------ INTERACTIONS */
function setupTilt(card) {
    if (reducedMotion) return;

    const frame = card.querySelector('.sr-frame');
    const img = card.querySelector('.sr-frame img');
    if (!frame || !img) return;

    frame.addEventListener('mousemove', (e) => {
        const rect = frame.getBoundingClientRect();
        const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * 26;
        const rotateX = (0.5 - (e.clientY - rect.top) / rect.height) * 26;
        img.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });

    frame.addEventListener('mouseleave', () => {
        img.style.transform = '';
    });
}

function setupAngles(card, racket) {
    const dots = card.querySelectorAll('.sr-angle-dot');
    const img = card.querySelector('.sr-frame img');
    if (!dots.length || !img) return;

    const switchTo = (dot) => {
        if (dot.classList.contains('active')) return;
        const idx = Number(dot.dataset.index);

        if (navigator.vibrate) navigator.vibrate(5);
        dots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');

        if (reducedMotion) {
            img.src = racket.images[idx];
            return;
        }

        img.style.opacity = '0';
        img.style.transform = 'rotateY(38deg) scale(.92)';

        setTimeout(() => {
            img.src = racket.images[idx];
            img.style.transform = 'rotateY(-38deg) scale(.92)';
            void img.offsetWidth; // reflow pour rejouer la transition
            img.style.transform = '';
            img.style.opacity = '1';
        }, 180);
    };

    dots.forEach(dot => {
        dot.addEventListener('click', () => switchTo(dot));
        dot.addEventListener('mouseenter', () => switchTo(dot));
    });
}

/** Les jauges se remplissent quand la carte entre dans le viewport. */
function animateGaugesOnScroll(root) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.querySelectorAll('.sr-gauge-fill').forEach(fill => {
                fill.style.strokeDashoffset = fill.dataset.offset;
            });
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.2 });

    root.querySelectorAll('.sr-card').forEach(card => observer.observe(card));
}
