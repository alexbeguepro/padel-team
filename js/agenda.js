import { saveAgendaData } from './api.js';

let currentPlayer = '';

export function initAgenda(agendaData, profilesData) {
    console.log("👉 initAgenda called with data:", agendaData?.length, "players");
    const agendaBtn = document.getElementById('btn-agenda');
    const agendaSidebar = document.getElementById('agenda-sidebar');
    const closeBtn = document.getElementById('close-agenda');
    const agendaContent = document.getElementById('agenda-content');
    const playerSelect = document.getElementById('agenda-player-select');

    if (!agendaBtn || !agendaSidebar || !agendaContent || !playerSelect) {
        console.error("❌ Agenda DOM missing !");
        return;
    }

    // Peupler le sélecteur de joueurs
    if (playerSelect.options.length <= 1) {
        agendaData.forEach(player => {
            const option = document.createElement('option');
            option.value = player.name;
            option.innerText = player.name;
            playerSelect.appendChild(option);
        });
    }

    playerSelect.addEventListener('change', (e) => {
        e.stopPropagation(); // Prevents document click from closing sidebar
        currentPlayer = e.target.value;
        renderAgenda(agendaData, profilesData, agendaContent);
    });

    // Toggle Sidebar
    agendaBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        agendaSidebar.classList.add('open');
        renderAgenda(agendaData, profilesData, agendaContent);
    });

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Just in case
        agendaSidebar.classList.remove('open');
    });

    // Fermer en cliquant à l'extérieur
    document.addEventListener('click', (e) => {
        if (!agendaSidebar.contains(e.target) && e.target !== agendaBtn && !agendaBtn.contains(e.target) && agendaSidebar.classList.contains('open')) {
            agendaSidebar.classList.remove('open');
        }
    });
}

function renderAgenda(agendaData, profilesData, container) {
    const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    container.innerHTML = '';

    jours.forEach(jour => {
        const dayBlock = document.createElement('div');
        dayBlock.className = 'agenda-day';
        
        const title = document.createElement('h3');
        title.innerText = jour.toUpperCase();
        dayBlock.appendChild(title);

        const playersList = document.createElement('div');
        playersList.className = 'agenda-players';

        let availableCount = 0;

        agendaData.forEach(playerAgenda => {
            const isAvailable = playerAgenda.availability[jour];
            const isMe = playerAgenda.name === currentPlayer;
            
            const profile = profilesData.find(p => p.name === playerAgenda.name);
            const color = profile ? profile.color : '#888';

            const playerDot = document.createElement('div');
            playerDot.className = `player-dot ${isAvailable ? 'available' : 'unavailable'}`;
            if (isMe) playerDot.classList.add('interactive');
            
            playerDot.innerText = playerAgenda.name.charAt(0);
            
            if (isAvailable) {
                playerDot.style.backgroundColor = color;
                playerDot.style.borderColor = color;
                playerDot.style.color = '#fff';
                playerDot.title = `${playerAgenda.name} est DISPONIBLE`;
                availableCount++;
            } else {
                playerDot.style.borderColor = '#444';
                playerDot.style.color = '#444';
                playerDot.title = `${playerAgenda.name} n'est pas dispo`;
            }

            // Click pour toggler si c'est "moi"
            if (isMe) {
                playerDot.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevents document click from closing sidebar
                    playerAgenda.availability[jour] = !playerAgenda.availability[jour];
                    showSaveStatus();
                    saveAgendaData(agendaData);
                    renderAgenda(agendaData, profilesData, container);
                });
            }

            playersList.appendChild(playerDot);
        });

        if (availableCount >= 4) {
            dayBlock.classList.add('match-possible');
            const alertTag = document.createElement('div');
            alertTag.className = 'match-alert';
            alertTag.innerHTML = `🔥 MATCH POSSIBLE (${availableCount} Joueurs)`;
            dayBlock.appendChild(alertTag);
        }

        dayBlock.appendChild(playersList);
        container.appendChild(dayBlock);
    });
}

function showSaveStatus() {
    const status = document.getElementById('agenda-save-status');
    if (!status) return;
    status.innerText = "Enregistré localement ✓";
    status.classList.add('show');
    setTimeout(() => {
        status.classList.remove('show');
    }, 2000);
}
