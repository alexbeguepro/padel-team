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
            racketCount: prof && prof.rackets ? prof.rackets.length : 0
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
            
            <div class="card-action-overlay">
                <button class="btn-stats" onclick="alert('Statistiques détaillées de ${player.firstName} disponibles bientôt !')" style="background: linear-gradient(90deg, ${player.color}80, ${player.color}); color: #111;">VIEW PROFILE</button>
            </div>
        `;

        card.onclick = () => {
            // Un clic sur la carte ou sur le bouton
            if (navigator.vibrate) navigator.vibrate(15);
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
