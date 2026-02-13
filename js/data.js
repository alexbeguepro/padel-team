// ===============================================
// DONNÉES AVEC COULEURS FLUO
// ===============================================
const profilesData = [
    {
        name: "Alex",
        color: "#F4D03F", // Jaune Néon
        rackets: [
            {
                name: "Kuikma PR Comfort Soft", level: "Débutant",
                images: ["img/kuikma_face.avif", "img/kuikma_cote.avif", "img/kuikma_poser.avif"],
                url: "https://www.decathlon.fr", price: "44,99 €",
                specs: { weight: "335g", shape: "Ronde", foam: "Soft EVA", surface: "Fibre de verre" },
                description: "Ma première raquette. Légère et tolérante.",
                stats: { "Puissance": 4, "Contrôle": 7, "Confort": 10, "Maniabilité": 10, "Effet": 3, "Tolérance": 8 }
            },
            {
                name: "Head Concord", level: "Intermédiaire",
                images: ["img/head-concord_face.webp", "img/head-concord_cote.webp", "img/head-concord_poser.webp"],
                url: "https://www.intersport.fr", price: "68,90 €",
                specs: { weight: "365g", shape: "Goutte d'eau", foam: "Power Foam", surface: "Innegra" },
                description: "Raquette polyvalente pour progresser.",
                stats: { "Puissance": 7, "Contrôle": 6, "Confort": 7, "Maniabilité": 7, "Effet": 5, "Tolérance": 8 }
            },
            {
                name: "Babolat Counter Viper 2025", level: "Expert",
                images: ["img/babolat-counter-viper_face.webp", "img/babolat-counter-viper_cote.webp"],
                url: "https://www.padelreference.com", price: "249,90 €",
                specs: { weight: "365g", shape: "Hybride", foam: "X-EVA", surface: "Carbone 3K" },
                description: "Ma raquette actuelle, une arme de précision.",
                stats: { "Puissance": 8, "Contrôle": 10, "Confort": 7, "Maniabilité": 9, "Effet": 9, "Tolérance": 8 }
            }
        ]
    },
    {
        name: "Mateo",
        color: "#00d2ff", // Cyan Néon
        rackets: [
            {
                name: "Babolat Storm", level: "Débutant",
                images: ["img/babolat-storm_face.webp", "img/babolat-storm_cote.webp"],
                url: "https://esprit-padel-shop.com/products/raquette-de-padel-babolat-storm", price: "64,90 €",
                specs: { weight: "345g", shape: "Goutte d'eau", foam: "Soft EVA", surface: "Fibre de verre" },
                description: "La raquette de Mateo. Ultra légère et tolérante.",
                stats: { "Puissance": 6, "Contrôle": 6, "Confort": 5, "Maniabilité": 6, "Effet": 4, "Tolérance": 7 }
            },
            {
                name: "Nox NextGen Pro Attack 3K", level: "Avancé",
                images: ["img/nox-nextgen_face.webp", "img/nox-nextgen_cote.webp"],
                url: "https://www.padelreference.com/fr/raquettes-de-padel/p/nox-nextgen-pro-attack-3k-nfa-series-2025", price: "129,90 €",
                specs: { weight: "360-375g", shape: "Diamant", foam: "Dure", surface: "Sablée" },
                description: "La nouvelle arme de Mateo. Puissance et spin.",
                stats: { "Puissance": 9, "Contrôle": 7, "Confort": 5, "Maniabilité": 6, "Effet": 8, "Tolérance": 6 }
            },
            {
                name: "Kuikma Hybrid Pro Coki Nieto", level: "Expert",
                images: ["img/kuikma-mat_face.avif", "img/kuikma-mat_cote.avif", "img/kuikma-mat_proche.avif"],
                url: "https://www.decathlon.fr/p/raquette-de-padel-adulte-kuikma-hybrid-pro-lucia-sainz-limited-edition-2025/_/R-p-338036?mc=8993121&c=bleu", price: "180,00 €",
                specs: { weight: "365g", shape: "Diamant", foam: "Dure", surface: "Sablée" },
                description: "La nouvelle arme de Mateo. Puissance et spin.",
                stats: { "Puissance": 8, "Contrôle": 10, "Confort": 7, "Maniabilité": 8, "Effet": 9, "Tolérance": 8 }
            }
        ]
    },
    {
        name: "Elouan",
        color: "#ff4757", // Rouge Néon
        rackets: [
            {
                name: "Joma Master Black/Green",
                level: "Débutant",
                images: ["img/joma_face.jpg", "img/joma_cote.jpg"],
                url: "https://www.padeliberico.es/fr/joma-master-negro-verde.html",
                price: "40,00 €",
                specs: { weight: "360-375g", shape: "Ronde", foam: "EVA Soft", surface: "Carbone 1K" },
                description: "Une raquette d'entrée de gamme basique. Correcte pour toucher ses premières balles, mais elle manque vite de punch et de sensations.",
                stats: { "Puissance": 4, "Contrôle": 6, "Confort": 6, "Maniabilité": 6, "Effet": 3, "Tolérance": 6 }
            },
            {
                name: "Babolat Technical Viper 2025",
                level: "Expert",
                images: ["img/babolat-technical-viper_face.webp", "img/babolat-technical-viper_cote.webp"],
                url: "https://www.padelreference.com/fr/raquettes-de-padel-babolat/p/raquette-de-padel-babolat-technical-viper-2025",
                price: "259,90 €",
                specs: { weight: "365g", shape: "Diamant", foam: "X-EVA", surface: "Carbone 12K" },
                description: "Le monstre de puissance de Juan Lebrón. Destinée aux attaquants techniques, elle offre une explosivité maximale (10/10) et une précision chirurgicale.",
                stats: { "Puissance": 10, "Contrôle": 8, "Confort": 7, "Maniabilité": 7, "Effet": 9, "Tolérance": 7 }
            }
        ]
    },
    {
        name: "Tapin",
        color: "#a55eea", // Violet Néon
        rackets: [
            {
                name: "Head Flash Pro 2023",
                level: "Débutant / Inter.",
                images: ["img/head-flash-pro_face.webp", "img/head-flash-pro_cote.webp"],
                url: "https://www.intersport.fr/raquette_de_padel_adulte_flash_pro_2023-head-p-226113~NA7/",
                price: "79,99 €",
                specs: { weight: "365g", shape: "Goutte d'eau", foam: "Power Foam", surface: "Fibre de verre" },
                description: "Une raquette puissante et polyvalente pour progresser. Son grand tamis offre une excellente tolérance.",
                stats: { "Puissance": 8, "Contrôle": 7, "Confort": 8, "Maniabilité": 8, "Effet": 5, "Tolérance": 9 }
            },
            {
                name: "Adidas Metalbone Carbon CTRL 3.4",
                level: "Avancé à expert",
                images: ["img/adidas-metalbone-ctrl_face.webp", "img/adidas-metalbone-ctrl_cote.webp"],
                url: "https://www.padelreference.com/fr/raquettes-de-padel/p/adidas-metalbone-carbon-ctrl-34-2025",
                price: "159,90 €",
                specs: { weight: "360-375g", shape: "Ronde", foam: "Soft Performance", surface: "Carbone 6K" },
                description: "L'arme de précision. Sa forme ronde et son équilibre moyen offrent un contrôle exceptionnel et une grande maniabilité.",
                stats: { "Puissance": 7, "Contrôle": 9, "Confort": 8, "Maniabilité": 8, "Effet": 8, "Tolérance": 8 }
            },
            {
                name: "Nox AT10 Pro Cup Soft 2026",
                level: "Avancé à expert",
                images: ["img/nox-at10-soft_face.webp", "img/nox-at10-soft_cote.webp"],
                url: "https://www.padelreference.com/fr/raquettes-de-padel/p/nox-at10-pro-cup-soft-2026",
                price: "199,90 €",
                specs: { weight: "360-375g", shape: "Goutte d'eau", foam: "HR3 Soft", surface: "Fibre de verre Alum" },
                description: "Un confort absolu. Son noyau plus souple offre un maximum de confort et une sortie de balle facile.",
                stats: { "Puissance": 8, "Contrôle": 9, "Confort": 8, "Maniabilité": 7, "Effet": 8, "Tolérance": 6 }
            }
        ]
    },
    {
        name: "Matthias",
        color: "#2ed573", // Vert Néon
        rackets: [
            {
                name: "Head Extreme Elite 2024",
                level: "Intermédiaire",
                images: ["img/head-extreme-elite_face.webp", "img/head-extreme-elite_cote.webp"],
                url: "https://www.padelreference.com/fr/raquettes-de-padel/p/head-extreme-elite-2024",
                price: "99,90 €",
                specs: { weight: "365g", shape: "Diamant", foam: "Power Foam", surface: "Fibre de verre" },
                description: "La raquette puissante par excellence. Sa forme diamant lui confère un équilibre en tête pour plus de poids dans les frappes.",
                stats: { "Puissance": 8, "Contrôle": 7, "Confort": 7, "Maniabilité": 6, "Effet": 5, "Tolérance": 8 }
            },
            {
                name: "Nox AT10 Genius 18K Alum 2025",
                level: "Expert",
                images: ["img/nox_at10_genius_18k_face.webp", "img/nox_at10_genius_18k_cote.webp"],
                url: "https://www.padelnuestro.com/fr/nox-at10-genius-18k-alum-by-agustin-tapia-2025-113540-p",
                price: "179,95 €",
                specs: { weight: "360-375g", shape: "Goutte d'eau", foam: "MLD Black EVA", surface: "Carbon 18K Alum" },
                description: "La raquette d'Agustin Tapia. Un bijou de technologie avec sa surface en Carbone 18K Aluminisé pour un toucher plus sec et réactif. Polyvalence absolue.",
                stats: { "Puissance": 9, "Contrôle": 10, "Confort": 7, "Maniabilité": 8, "Effet": 9, "Tolérance": 8 }
            }
        ]
    },
    {
        name: "Erwan",
        color: "#5352ed", // Indigo Néon
        rackets: [
            {
                name: "Bullpadel Sky Power",
                level: "Intermédiaire",
                images: ["img/bullpadel-sky-power_face.jpg", "img/bullpadel-sky-power_cote.jpg"],
                url: "https://www.padelreference.com",
                price: "69,90 €",
                specs: { weight: "360-370g", shape: "Diamant", foam: "Soft EVA", surface: "Polyglass" },
                description: "Une raquette avec un équilibre en tête pour une puissance optimale. Très confortable grâce à sa mousse souple.",
                stats: { "Puissance": 7, "Contrôle": 5, "Confort": 9, "Maniabilité": 5, "Effet": 5, "Tolérance": 6 }
            }
        ]
    }
];

// ===============================================
// DONNÉES CLASSEMENT JULES MARIE LEAGUE
// ===============================================
const rankingData = [
    { name: "Matthias", nationalRank: 76603, points: 13 },
    { name: "Tapin", nationalRank: 76603, points: 13 },
    { name: "Alex", nationalRank: 80194, points: 11 },
    { name: "Erwan", nationalRank: 84830, points: 9 },
    { name: "Elouan", nationalRank: 102907, points: 2 },
    { name: "Mateo", nationalRank: null, points: 0 }
];
