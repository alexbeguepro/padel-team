/**
 * profile.js
 * Gère l'affichage de la galerie des joueurs (Pilotes).
 */

export function initProfile(rankingData, profilesData) {
    const container = document.getElementById('profile-container');
    if (!container) return;

    container.innerHTML = ''; // Reset

    // Fusionner les données
    const players = rankingData.map(rankData => {
        // Find matching profile for color and rackets
        const prof = profilesData.find(p => p.name.toLowerCase() === rankData.name.toLowerCase() || p.name.toLowerCase() === rankData.firstName.toLowerCase());
        
        return {
            ...rankData,
            color: prof ? prof.color : '#00f0ff',
            racketCount: prof && prof.rackets ? prof.rackets.length : 0,
            racketsList: prof && prof.rackets ? prof.rackets : []
        };
    });

    // Sort by points (rank)
    players.sort((a, b) => b.points - a.points);

    players.forEach((player, index) => {
        const card = document.createElement('div');
        card.className = 'card player-card';
        // Passons la couleur personnalisée dans une variable CSS locale
        card.style.setProperty('--glow-color', player.color);

        // Position
        const pos = index + 1;
        let posDisplay = pos;
        if (pos === 1) posDisplay = '🥇 1er';
        else if (pos === 2) posDisplay = '🥈 2ème';
        else if (pos === 3) posDisplay = '🥉 3ème';

        card.innerHTML = `
            <div class="player-avatar-large" style="background: ${player.color}20; border-color: ${player.color}50;">
                <span style="color: ${player.color};">${player.firstName.substring(0, 1)}${player.lastName.substring(0, 1)}</span>
            </div>
            
            <div class="card-info-header" style="justify-content: center; text-align: center; margin-top: 20px;">
                <div>
                    <h2 class="card-title">${player.firstName} ${player.lastName}</h2>
                    <div class="card-status" style="justify-content: center;">
                        <span class="status-dot" style="background: var(--glow-color);"></span>
                        Active
                    </div>
                </div>
            </div>

            <div class="profile-stats" style="margin-top: 30px;">
                <div class="p-stat"><span>Rank</span><strong style="color: var(--glow-color);">${posDisplay}</strong></div>
                <div class="p-stat"><span>Points</span><strong>${player.points}</strong></div>
                <div class="p-stat"><span>Rackets</span><strong>${player.racketCount}</strong></div>
            </div>
            
        `;

        card.onclick = () => {
            if (navigator.vibrate) navigator.vibrate(15);
            openPlayerModal(player);
        };

        // Effets 3D Tilt
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });

        container.appendChild(card);
        setTimeout(() => { card.classList.add('visible'); }, index * 100);
    });
}

window.openPlayerModal = function(player) {
    const modal = document.getElementById('player-modal');
    modal.style.display = 'flex';
    
    // Header
    const header = document.getElementById('pm-header');
    header.innerHTML = `
        <div class="player-avatar-large" style="width: 80px; height: 80px; font-size: 2rem; background: ${player.color}20; border-color: ${player.color}; box-shadow: 0 0 15px ${player.color}; margin-top: 0;">
            <span style="color: ${player.color};">${player.firstName.substring(0, 1)}${player.lastName.substring(0, 1)}</span>
        </div>
        <div>
            <h2 style="font-size: 1.8rem; margin: 0; color: #fff;">${player.firstName} ${player.lastName}</h2>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 5px;">POINTS: <strong style="color: ${player.color};">${player.points}</strong> &nbsp;|&nbsp; RACKETS: <strong style="color: ${player.color};">${player.racketCount}</strong></div>
        </div>
    `;

    // Chart.js Performance History
    const canvas = document.getElementById('pm-chart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if (window.pmChartInstance) {
        window.pmChartInstance.destroy();
    }

    const historyDates = player.history.map(h => {
        const d = new Date(h.date);
        return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    });
    const historyPoints = player.history.map(h => h.points);

    window.pmChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historyDates,
            datasets: [{
                label: 'Points',
                data: historyPoints,
                borderColor: player.color,
                backgroundColor: player.color + '20', /* transparent fill */
                borderWidth: 3,
                tension: 0.4, /* smooth curves */
                pointBackgroundColor: player.color,
                pointBorderColor: '#111',
                pointRadius: 5,
                pointHoverRadius: 8,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#888' },
                    beginAtZero: true
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#888', maxRotation: 45, minRotation: 45 }
                }
            }
        }
    });

    // Arsenal Horizontal scroll
    const arsenalContainer = document.getElementById('pm-arsenal');
    arsenalContainer.innerHTML = '';
    
    if (player.racketsList && player.racketsList.length > 0) {
        player.racketsList.forEach(r => {
            const rCard = document.createElement('div');
            rCard.className = 'mini-racket-card';
            rCard.style.setProperty('--glow-color', player.color);
            rCard.innerHTML = `
                <div class="mini-racket-img">
                    <img src="${r.images[0]}" alt="${r.name}">
                </div>
                <div class="mini-racket-title">${r.name}</div>
            `;
            arsenalContainer.appendChild(rCard);
        });
    } else {
        arsenalContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Aucune raquette dans le garage.</p>';
    }
}

window.closePlayerModal = function() {
    document.getElementById('player-modal').style.display = 'none';
}
