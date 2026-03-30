/**
 * api.js
 * Gère le chargement des données depuis les fichiers JSON locaux.
 */

export async function loadData() {
    try {
        const [racketsRes, rankingRes] = await Promise.all([
            fetch('./data/rackets.json'),
            fetch('./data/ranking.json')
        ]);

        if (!racketsRes.ok || !rankingRes.ok) {
            throw new Error(`Erreur réseau: Rackets(${racketsRes.status}) Ranking(${rankingRes.status})`);
        }

        const profilesData = await racketsRes.json();
        const rankingData = await rankingRes.json();

        return { profilesData, rankingData };
    } catch (error) {
        console.error("Impossible de charger les données :", error);
        return { profilesData: [], rankingData: [] };
    }
}
