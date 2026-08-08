/**
 * ranking.js
 * Vue Classement : tuiles de synthèse, podium des trois premiers et
 * liste détaillée avec tendance (sparkline) et variation depuis le dernier relevé.
 */

import { reveal, countUp, sparkline, initials, pointsDelta, deltaChip, formatNum, esc } from './ui.js';
import { openPlayerModal } from './profile.js';

const MEDALS = ['🥇', '🥈', '🥉'];

export function renderRanking(players) {
    renderSummary(players);
    renderPodium(players.slice(0, 3));
    renderList(players.slice(3));
}

/* ------------------------------------------------------------- SYNTHÈSE */
function renderSummary(players) {
    const host = document.getElementById('fun-facts-dash');
    if (!host) return;

    const ranked = players.filter(p => p.nationalRank !== null && p.nationalRank !== undefined);
    const bestRank = ranked.length ? Math.min(...ranked.map(p => p.nationalRank)) : null;

    const scoring = players.filter(p => p.points > 0);
    const totalPoints = players.reduce((sum, p) => sum + (p.points || 0), 0);
    const avgPoints = scoring.length ? Math.round(totalPoints / scoring.length) : 0;
    const monthDelta = players.reduce((sum, p) => sum + pointsDelta(p.history), 0);

    const tiles = [
        { label: "Meilleur rang de l'équipe", value: bestRank, prefix: '#' },
        { label: 'Points cumulés', value: totalPoints },
        { label: 'Moyenne par pilote', value: avgPoints },
        { label: 'Gagnés ce relevé', value: monthDelta, signed: true, unit: 'pts' }
    ];

    host.innerHTML = tiles.map(t => {
        if (t.value === null) {
            return tile(t.label, '<span class="stat-tile-val">—</span>');
        }
        if (t.signed) {
            const cls = t.value > 0 ? 'up' : t.value < 0 ? 'down' : '';
            const sign = t.value > 0 ? '+' : '';
            return tile(t.label,
                `<span class="stat-tile-val ${cls}" style="${cls ? `color:var(--${cls})` : ''}">${sign}${formatNum(t.value)}<small>${t.unit}</small></span>`);
        }
        return tile(t.label,
            `<span class="stat-tile-val">${t.prefix || ''}<i data-count="${t.value}"></i></span>`);
    }).join('');

    host.querySelectorAll('[data-count]').forEach(el => {
        el.style.fontStyle = 'normal';
        countUp(el, Number(el.dataset.count));
    });

    host.querySelectorAll('.stat-tile').forEach((el, i) => reveal(el, i));
}

function tile(label, valueHTML) {
    return `<div class="stat-tile"><span class="stat-tile-label">${label}</span>${valueHTML}</div>`;
}

/* --------------------------------------------------------------- PODIUM */
function renderPodium(top3) {
    const host = document.getElementById('podium');
    if (!host) return;

    host.innerHTML = top3.map((player, i) => {
        const delta = pointsDelta(player.history);
        const series = player.history.slice(-14).map(h => h.points);

        return `
            <article class="podium-card p${i + 1}" style="--pc:${player.color}" data-player="${esc(player.name)}"
                     tabindex="0" role="button" aria-label="Voir le profil de ${esc(player.firstName)} ${esc(player.lastName)}">
                <span class="podium-medal" aria-hidden="true">${MEDALS[i]}</span>
                <div class="avatar">${initials(player.firstName, player.lastName)}</div>
                <div class="podium-body">
                    <h3 class="podium-name">${esc(player.firstName)} ${esc(player.lastName)}</h3>
                    <p class="podium-rank">Rang national ${player.nationalRank ? formatNum(player.nationalRank) : 'NC'}</p>
                    <p class="podium-pts"><i data-count="${player.points}" style="font-style:normal"></i><small>pts</small></p>
                    ${deltaChip(delta)}
                </div>
                <div class="podium-spark">${sparkline(series, { width: 160, height: 38 })}</div>
            </article>`;
    }).join('');

    host.querySelectorAll('[data-count]').forEach(el => countUp(el, Number(el.dataset.count)));
    host.querySelectorAll('.podium-card').forEach((card, i) => {
        reveal(card, i);
        bindOpen(card, top3);
    });
}

/* ---------------------------------------------------------------- LISTE */
function renderList(rest) {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    if (!rest.length) {
        list.innerHTML = '';
        return;
    }

    list.innerHTML = rest.map(player => {
        const delta = pointsDelta(player.history);
        const series = player.history.slice(-14).map(h => h.points);

        return `
            <article class="rk-row" style="--pc:${player.color}" data-player="${esc(player.name)}"
                     tabindex="0" role="button" aria-label="Voir le profil de ${esc(player.firstName)} ${esc(player.lastName)}">
                <div class="rk-pos">${player.position}</div>
                <div class="avatar">${initials(player.firstName, player.lastName)}</div>
                <div>
                    <div class="rk-name">${esc(player.firstName)} ${esc(player.lastName)}</div>
                    <div class="rk-sub">Rang ${player.nationalRank ? formatNum(player.nationalRank) : 'NC'}</div>
                </div>
                <div class="rk-spark">${sparkline(series, { width: 120, height: 34 })}</div>
                <div class="rk-delta-cell">${deltaChip(delta)}</div>
                <div class="rk-pts">${formatNum(player.points)}<small>pts</small></div>
            </article>`;
    }).join('');

    list.querySelectorAll('.rk-row').forEach((row, i) => {
        reveal(row, i);
        bindOpen(row, rest);
    });
}

/* ----------------------------------------------------------------- UTILS */
function bindOpen(el, pool) {
    const player = pool.find(p => p.name === el.dataset.player);
    if (!player) return;

    const open = () => {
        if (navigator.vibrate) navigator.vibrate(12);
        openPlayerModal(player);
    };

    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
        }
    });
}
