/**
 * ranking.js
 * Gère l'affichage de la vue classement
 */

export function renderRanking(rankingData, profilesData) {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    list.innerHTML = '';

    // Tri par position nationale (Ceux sans classement vont à la fin)
    rankingData.sort((a, b) => {
        if (a.nationalRank === null) return 1;
        if (b.nationalRank === null) return -1;
        return a.nationalRank - b.nationalRank;
    });

    rankingData.forEach((player) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';

        const rankDisplay = player.nationalRank ? `#${player.nationalRank}` : 'NC';

        // Ligne de couleur selon le profil
        const profile = profilesData.find(p => p.name === player.name);
        const colorHex = profile ? profile.color : 'var(--text-muted)';
        item.style.setProperty('--rank-color', colorHex);

        item.innerHTML = `
            <div class="rank-num">${rankDisplay.replace('#', '')}</div>
            <div class="rank-name">${player.name}</div>
            <div class="rank-points">${player.points} pts</div>
        `;

        // Plus de modale sur le clic
        
        list.appendChild(item);
    });

    renderFunFacts(rankingData, profilesData);
}

function renderFunFacts(rankingData, profilesData) {
    const dash = document.getElementById('fun-facts-dash');
    if (!dash) return;

    // 1. Moyenne de Points du Groupe
    const validPlayers = rankingData.filter(p => p.points > 0);
    const avgPoints = validPlayers.length > 0 
        ? Math.round(validPlayers.reduce((sum, p) => sum + p.points, 0) / validPlayers.length) 
        : 0;

    // 2. Meilleur Classement
    const rankedPlayers = rankingData.filter(p => p.nationalRank !== null);
    const bestRank = rankedPlayers.length > 0 
        ? Math.min(...rankedPlayers.map(p => p.nationalRank)) 
        : "N/A";

    dash.innerHTML = `
        <div class="dash-stat">
            <span class="dash-icon">🏆</span>
            <div class="dash-info">
                <span class="dash-val">#${bestRank}</span>
                <span class="dash-label">Meilleur Rang de l'Équipe</span>
            </div>
        </div>
        <div class="dash-stat" style="border-left: 1px solid var(--border-glass); padding-left: 30px;">
            <span class="dash-icon">📈</span>
            <div class="dash-info">
                <span class="dash-val">${avgPoints}</span>
                <span class="dash-label">Points Nationaux (Moyenne)</span>
            </div>
        </div>
    `;
}


