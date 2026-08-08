/**
 * api.js
 * Chargement des données locales et fusion classement ↔ profils.
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

/**
 * Fusionne le classement et les profils en un seul jeu de joueurs enrichis,
 * trié du meilleur au moins bon, avec sa position d'équipe.
 * Utilisé aussi bien par la vue Classement que par la vue Pilotes.
 */
export function mergePlayers(rankingData = [], profilesData = []) {
    return rankingData
        .map(player => {
            const profile = profilesData.find(p => {
                const n = p.name.toLowerCase();
                return n === String(player.name).toLowerCase()
                    || n === String(player.firstName).toLowerCase();
            });

            return {
                ...player,
                color: profile ? profile.color : '#22e1ff',
                rackets: profile && profile.rackets ? profile.rackets : [],
                racketCount: profile && profile.rackets ? profile.rackets.length : 0,
                history: Array.isArray(player.history) ? player.history : []
            };
        })
        .sort((a, b) => (b.points - a.points) || ((a.nationalRank ?? Infinity) - (b.nationalRank ?? Infinity)))
        .map((player, i) => ({ ...player, position: i + 1 }));
}
