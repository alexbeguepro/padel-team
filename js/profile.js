/**
 * profile.js
 * Vue Pilotes : cartes joueurs enrichies (stats, tendance, aperçu de l'arsenal)
 * et modale de détail avec courbe de progression Chart.js.
 */

import { reveal, sparkline, initials, pointsDelta, deltaChip, formatNum, esc, levelClass } from './ui.js';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function initProfile(players) {
    const container = document.getElementById('profile-container');
    if (!container) return;

    container.innerHTML = '';

    players.forEach((player, index) => {
        const card = document.createElement('article');
        card.className = 'player-card';
        card.style.setProperty('--pc', player.color);
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Voir le profil de ${player.firstName} ${player.lastName}`);

        const delta = pointsDelta(player.history);
        const series = player.history.slice(-14).map(h => h.points);
        const medal = MEDALS[player.position] || '';

        const thumbs = player.rackets.slice(0, 3).map(r => `
            <div class="player-thumb"><img src="${esc(r.images[0])}" alt="${esc(r.name)}" loading="lazy"></div>
        `).join('');

        card.innerHTML = `
            <div class="player-top">
                <div class="avatar">${initials(player.firstName, player.lastName)}</div>
                <div class="player-id">
                    <h3 class="player-name">${esc(player.firstName)} ${esc(player.lastName)}</h3>
                    <span class="player-pos">${medal} ${ordinal(player.position)} de l'équipe</span>
                </div>
            </div>

            <div class="player-stats">
                <div class="player-stat">
                    <b>${formatNum(player.points)}</b><span>Points</span>
                </div>
                <div class="player-stat">
                    <b>${player.nationalRank ? formatNum(player.nationalRank) : '—'}</b><span>Rang nat.</span>
                </div>
                <div class="player-stat">
                    <b>${player.racketCount}</b><span>Raquettes</span>
                </div>
            </div>

            <div class="player-spark">${sparkline(series, { width: 260, height: 46 })}</div>

            <div class="player-arsenal">
                ${thumbs}
                <span class="player-more">
                    ${deltaChip(delta)}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </span>
            </div>
        `;

        const open = () => {
            if (navigator.vibrate) navigator.vibrate(12);
            openPlayerModal(player);
        };

        card.addEventListener('click', open);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
            }
        });

        container.appendChild(card);
        reveal(card, index);
    });
}

function ordinal(n) {
    return n === 1 ? '1er' : `${n}ème`;
}

/* ---------------------------------------------------------------- MODALE */
let chartInstance = null;

export function openPlayerModal(player) {
    const modal = document.getElementById('player-modal');
    const panel = document.getElementById('player-modal-content');
    if (!modal || !panel) return;

    panel.style.setProperty('--pc', player.color);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    renderModalHeader(player);
    renderModalChart(player);
    renderModalArsenal(player);
}

function renderModalHeader(player) {
    const header = document.getElementById('pm-header');
    if (!header) return;

    const delta = pointsDelta(player.history);

    header.innerHTML = `
        <div class="avatar">${initials(player.firstName, player.lastName)}</div>
        <div>
            <h2 class="pm-name" id="pm-name-label">${esc(player.firstName)} ${esc(player.lastName)}</h2>
            <div class="pm-chips">
                <span class="chip">${MEDALS[player.position] || ''} ${ordinal(player.position)} de l'équipe</span>
                <span class="chip">${formatNum(player.points)} pts</span>
                <span class="chip">Rang ${player.nationalRank ? formatNum(player.nationalRank) : 'NC'}</span>
                ${deltaChip(delta)}
            </div>
        </div>
    `;
}

function renderModalChart(player) {
    const canvas = document.getElementById('pm-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    if (chartInstance) chartInstance.destroy();

    const css = getComputedStyle(document.documentElement);
    const gridColor = css.getPropertyValue('--stroke').trim() || 'rgba(255,255,255,.09)';
    const tickColor = css.getPropertyValue('--dim').trim() || '#626a7d';

    const labels = player.history.map(h =>
        new Date(h.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }));
    const values = player.history.map(h => h.points);

    // Dégradé vertical dans la couleur du joueur
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 240);
    gradient.addColorStop(0, hexToRgba(player.color, 0.34));
    gradient.addColorStop(1, hexToRgba(player.color, 0));

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Points',
                data: values,
                borderColor: player.color,
                backgroundColor: gradient,
                borderWidth: 2.5,
                tension: 0.38,
                pointBackgroundColor: player.color,
                pointBorderColor: 'transparent',
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHitRadius: 18,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(6,7,12,.94)',
                    borderColor: player.color,
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    titleFont: { family: 'Outfit', size: 11, weight: '600' },
                    bodyFont: { family: 'Outfit', size: 14, weight: '700' },
                    callbacks: { label: (c) => `${c.parsed.y} points` }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    border: { display: false },
                    grid: { color: gridColor, drawTicks: false },
                    ticks: { color: tickColor, font: { family: 'Outfit', size: 11 }, padding: 10, maxTicksLimit: 5 }
                },
                x: {
                    border: { display: false },
                    grid: { display: false },
                    ticks: {
                        color: tickColor, font: { family: 'Outfit', size: 10 },
                        maxRotation: 0, autoSkip: true, maxTicksLimit: 7
                    }
                }
            }
        }
    });
}

function renderModalArsenal(player) {
    const host = document.getElementById('pm-arsenal');
    if (!host) return;

    if (!player.rackets.length) {
        host.innerHTML = `<p style="color:var(--muted);font-size:.9rem;">Aucune raquette dans le garage.</p>`;
        return;
    }

    host.innerHTML = player.rackets.map(r => `
        <div class="mini-racket">
            <div class="mini-racket-img">
                <img src="${esc(r.images[0])}" alt="${esc(r.name)}" loading="lazy">
            </div>
            <div class="mini-racket-name">${esc(r.name)}</div>
            <div class="mini-racket-price">${esc(r.price)}</div>
            <span class="chip chip-level ${levelClass(r.level)}" style="justify-content:center">${esc(r.level)}</span>
        </div>
    `).join('');
}

export function closePlayerModal() {
    const modal = document.getElementById('player-modal');
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

/* Fermeture : bouton, clic sur le fond, touche Échap. */
export function initPlayerModal() {
    const modal = document.getElementById('player-modal');
    const closeBtn = document.getElementById('pm-close');
    if (!modal) return;

    if (closeBtn) closeBtn.addEventListener('click', closePlayerModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePlayerModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) closePlayerModal();
    });
}

/** #RRGGBB → rgba(r,g,b,a) pour les dégradés du canvas. */
function hexToRgba(hex, alpha) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    if (!m) return `rgba(34,225,255,${alpha})`;
    return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
}
