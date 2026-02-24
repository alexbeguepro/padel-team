// ===============================================
// MOTEUR D'AFFICHAGE (RICHARD MILLE STYLE)
// ===============================================
const filterBar = document.getElementById('filter-bar');
const racketContainer = document.getElementById('racket-container');

// Observer pour l'apparition au Scroll
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            scrollObserver.unobserve(entry.target); // Ne jouer qu'une fois
        }
    });
}, {
    threshold: 0.1, // Déclenche quand 10% de la carte est visible
    rootMargin: "0px 0px -50px 0px" // Décale légèrement vers le haut
});

function init() {
    initTheme();
    renderFilters();
    filterRackets('all');
    renderRanking();
}

// --- THEME TOGGLE ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const iconLight = document.getElementById('theme-icon-light');
    const iconDark = document.getElementById('theme-icon-dark');
    if (iconLight && iconDark) {
        if (theme === 'dark') {
            iconLight.style.display = 'block';
            iconDark.style.display = 'none';
        } else {
            iconLight.style.display = 'none';
            iconDark.style.display = 'block';
        }
    }
}

// --- NAVIGATION ---
function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    // Show target
    const target = document.getElementById(viewName + '-view');
    target.style.display = 'block';
    // Trigger reflow to restart CSS animation
    target.classList.remove('active');
    void target.offsetWidth;
    target.classList.add('active');

    document.getElementById('nav-' + viewName).classList.add('active');

    // Toggle filters visibility
    const filterWrapper = document.getElementById('garage-filters');
    if (filterWrapper) {
        filterWrapper.style.display = (viewName === 'garage') ? 'block' : 'none';
    }

    // Ré-observer les cartes si on revient sur le garage
    if (viewName === 'garage') {
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('visible');
            scrollObserver.observe(card);
        });
    }
}

// --- RENDERING CLASSEMENT ---
function renderRanking() {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    list.innerHTML = '';

    rankingData.sort((a, b) => {
        if (a.nationalRank === null) return 1;
        if (b.nationalRank === null) return -1;
        return a.nationalRank - b.nationalRank;
    });

    rankingData.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';

        const rankDisplay = player.nationalRank ? `#${player.nationalRank}` : 'NC';

        // Récupération de la couleur du joueur pour l'accent visuel (ligne verticale)
        const profile = profilesData.find(p => p.name === player.name);
        const colorHex = profile ? profile.color : 'var(--text-muted)';
        item.style.setProperty('--rank-color', colorHex);

        item.innerHTML = `
            <div class="rank-num">${rankDisplay.replace('#', '')}</div>
            <div class="rank-name">${player.name}</div>
            <div class="rank-points">${player.points} pts</div>
        `;
        list.appendChild(item);
    });
}

function renderFilters() {
    profilesData.forEach((profile, index) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.onclick = () => filterRackets(index);
        btn.innerHTML = `
            <span class="filter-dot" style="background: ${profile.color};"></span>
            ${profile.name}
        `;
        filterBar.appendChild(btn);
    });
}

function filterRackets(targetIndex) {
    document.querySelectorAll('.filter-btn').forEach((btn, idx) => {
        const isTarget = (targetIndex === 'all' && idx === 0) || (idx === targetIndex + 1);

        if (isTarget) {
            btn.classList.add('active');
            if (targetIndex !== 'all') {
                const color = profilesData[targetIndex].color;
                // Juste une légère indication colorée au lieu de la grosse bordure
                btn.style.color = 'var(--text-main)';
            }
        } else {
            btn.classList.remove('active');
            btn.style.color = '';
        }
    });

    let racketsToShow = [];
    if (targetIndex === 'all') {
        profilesData.forEach(profile => {
            profile.rackets.forEach(r => {
                r.ownerName = profile.name;
                r.ownerColor = profile.color;
                racketsToShow.push(r);
            });
        });
    } else {
        const profile = profilesData[targetIndex];
        racketsToShow = profile.rackets.map(r => {
            r.ownerName = profile.name;
            r.ownerColor = profile.color;
            return r;
        });
    }

    // Reset Observer before displaying new items
    scrollObserver.disconnect();
    displayRackets(racketsToShow);
}

function displayRackets(list) {
    racketContainer.innerHTML = '';

    if (list.length === 0) {
        racketContainer.innerHTML = `<div class="empty-state">AUCUNE DONNÉE DISPONIBLE</div>`;
        return;
    }

    list.forEach((racket, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.setProperty('--glow-color', racket.ownerColor); // Sert pour le badge owner
        card.onclick = () => openModalData(racket);

        const badge = `<div class="owner-badge">${racket.ownerName}</div>`;
        let mainImage = racket.images && racket.images.length > 0 ? racket.images[0] : 'https://placehold.co/400x400/0a0a0a/333333?text=NO+IMAGE';

        card.innerHTML = `
            ${badge}
            <div class="img-container">
                <img src="${mainImage}" alt="${racket.name}">
            </div>
            <h2>${racket.name}</h2>
            <div class="card-level">${racket.level}</div>
            <div class="card-footer">
                <span class="price-tag">${racket.price.replace('€', 'EUR')}</span>
                <span class="view-arrow">➔</span>
            </div>
        `;
        racketContainer.appendChild(card);

        // On observe l'élément pour déclencher l'animation au scroll
        scrollObserver.observe(card);
    });
}

// ===============================================
// SIDE PANEL (REMPLACE L'ANCIENNE MODALE)
// ===============================================
const modalOverlay = document.getElementById('modal');
const mainImg = document.getElementById('m-img');
const thumbsContainer = document.getElementById('m-thumbs'); // Nouveau conteneur de miniatures

function openModalData(data) {
    // Remplissage des données textuelles
    document.getElementById('m-title').innerText = data.name;
    document.getElementById('m-tag').innerText = "CALIBRE // " + data.level; // Ton horlogerie

    const tag = document.getElementById('m-tag');
    tag.style.color = data.ownerColor;

    // Injecter la couleur sur la modale pour les jauges
    modalOverlay.style.setProperty('--glow-color', data.ownerColor);

    document.getElementById('m-price').innerText = data.price.replace('€', ' EUR');
    document.getElementById('m-desc').innerText = data.description;
    document.getElementById('m-link').href = data.url;

    document.getElementById('m-weight').innerText = data.specs.weight || '-';
    document.getElementById('m-shape').innerText = data.specs.shape || '-';
    document.getElementById('m-foam').innerText = data.specs.foam || '-';
    document.getElementById('m-surface').innerText = data.specs.surface || '-';

    // Gestion de la galerie d'images
    if (data.images && data.images.length > 0) {
        mainImg.src = data.images[0];

        // Vider l'ancien conteneur
        thumbsContainer.innerHTML = '';

        // S'il y a plus d'une image, on crée les vignettes
        if (data.images.length > 1) {
            data.images.forEach((imgSrc, index) => {
                const thumb = document.createElement('img');
                thumb.src = imgSrc;
                thumb.className = index === 0 ? 'thumb-img active' : 'thumb-img';

                thumb.onclick = (e) => {
                    // Update main image
                    mainImg.src = imgSrc;

                    // Update active state on vignettes
                    document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    e.stopPropagation();
                };

                thumbsContainer.appendChild(thumb);
            });
        }
    } else {
        mainImg.src = 'https://placehold.co/600x600/0a0a0a/333333?text=NO+IMAGE';
        if (thumbsContainer) thumbsContainer.innerHTML = '';
    }

    // Gestion des jauges dynamiques (Télémétrie)
    const statsContainer = document.getElementById('m-stats');
    statsContainer.innerHTML = '';
    for (const [key, val] of Object.entries(data.stats)) {
        // Formattage 00/10 ou 08/10
        const formattedVal = val < 10 ? '0' + val : val;

        statsContainer.innerHTML += `
            <div class="stat-row">
                <span class="stat-name">${key}</span>
                <div class="stat-bar-container">
                    <div class="stat-bar-fill stat-animated" data-width="${val * 10}%"></div>
                </div>
                <span class="stat-val">${formattedVal}</span>
            </div>
        `;
    }

    // Ouverture visuelle de l'overlay (Slide in activé via CSS)
    modalOverlay.style.visibility = 'visible'; // Pré-requis CSS

    // On force un reflow puis on ajoute la classe .show
    requestAnimationFrame(() => {
        modalOverlay.classList.add('show');

        // Déclenchement de l'animation des jauges après ouverture
        setTimeout(() => {
            document.querySelectorAll('.stat-animated').forEach(bar => {
                bar.style.width = bar.getAttribute('data-width');
            });
        }, 300); // Laisse le temps au panneau de slider
    });
}

function closeModal() {
    modalOverlay.classList.remove('show');

    // Remise à zéro des jauges de statistiques (pour la prochaine ouverture)
    document.querySelectorAll('.stat-animated').forEach(bar => {
        bar.style.width = '0%';
    });

    // On attend la fin de l'animation CSS avant de cacher complètement
    setTimeout(() => {
        modalOverlay.style.visibility = 'hidden';
    }, 600); // 600ms = transition duration dans styles.css
}

window.onclick = function (event) {
    if (event.target == modalOverlay) {
        closeModal();
    }
}

// Initialisation
init();
