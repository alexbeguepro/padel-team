/**
 * api.js
 * Gère le chargement des données depuis les fichiers JSON locaux.
 */

export async function loadData() {
    try {
        const [racketsRes, rankingRes, agendaRes] = await Promise.all([
            fetch('./data/rackets.json'),
            fetch('./data/ranking.json'),
            fetch('./data/agenda.json')
        ]);

        if (!racketsRes.ok || !rankingRes.ok || !agendaRes.ok) {
            throw new Error(`Erreur réseau: Rackets(${racketsRes.status}) Ranking(${rankingRes.status}) Agenda(${agendaRes.status})`);
        }

        const profilesData = await racketsRes.json();
        const rankingData = await rankingRes.json();
        const initialAgendaData = await agendaRes.json();

        // Fusionner avec les données locales (localStorage) si elles existent
        const storedAgenda = getStoredAgendaData();
        const agendaData = initialAgendaData.map(player => {
            const storedPlayer = storedAgenda.find(p => p.name === player.name);
            return storedPlayer ? { ...player, availability: { ...player.availability, ...storedPlayer.availability } } : player;
        });

        return { profilesData, rankingData, agendaData };
    } catch (error) {
        console.error("Impossible de charger les données :", error);
        return { profilesData: [], rankingData: [], agendaData: [] };
    }
}

export function saveAgendaData(agendaData) {
    localStorage.setItem('padel_agenda_v1', JSON.stringify(agendaData));
}

function getStoredAgendaData() {
    const data = localStorage.getItem('padel_agenda_v1');
    return data ? JSON.parse(data) : [];
}
