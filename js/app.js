// ===============================================
// MOTEUR D'AFFICHAGE
// ===============================================
const filterBar = document.getElementById('filter-bar');
const racketContainer = document.getElementById('racket-container');

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
    // Trigger reflow to restart animation if needed
    target.classList.remove('active');
    void target.offsetWidth;
    target.classList.add('active');

    document.getElementById('nav-' + viewName).classList.add('active');

    // Toggle filters
    const filterWrapper = document.getElementById('garage-filters');
    if (filterWrapper) {
        filterWrapper.style.display = (viewName === 'garage') ? 'block' : 'none';
    }
}

// --- RENDERING CLASSEMENT ---
function renderRanking() {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    list.innerHTML = '';

    // Tri : Les classés d'abord (petit rank = meilleur), puis les non-classés à la fin
    rankingData.sort((a, b) => {
        if (a.nationalRank === null) return 1;
        if (b.nationalRank === null) return -1;
        return a.nationalRank - b.nationalRank;
    });

    rankingData.forEach((player, index) => {
        const item = document.createElement('div');
        // On garde une classe pour le style, basée sur l'index (1er, 2e, 3e...)
        item.className = `ranking-item rank-${index + 1}`;

        // Affichage du Rank National ou "NC"
        const rankDisplay = player.nationalRank ? `#${player.nationalRank}` : 'NC';

        // Récupération de la couleur du joueur
        const profile = profilesData.find(p => p.name === player.name);
        const colorHex = profile ? profile.color : '#ffffff';

        let r = 255, g = 255, b = 255;
        if (colorHex.startsWith('#') && colorHex.length === 7) {
            r = parseInt(colorHex.substring(1, 3), 16);
            g = parseInt(colorHex.substring(3, 5), 16);
            b = parseInt(colorHex.substring(5, 7), 16);
        }

        item.style.setProperty('--rank-color', colorHex);
        item.style.setProperty('--rank-bg', `rgba(${r}, ${g}, ${b}, 0.15)`);
        item.style.setProperty('--rank-border', `rgba(${r}, ${g}, ${b}, 0.5)`);

        item.innerHTML = `
            <div class="rank-num" style="font-size: 0.9em; width: 80px;">${rankDisplay}</div>
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
            <span class="filter-dot" style="background: ${profile.color}; box-shadow: 0 0 8px ${profile.color};"></span>
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
            if (targetIndex === 'all') {
                btn.style.boxShadow = "0 0 20px rgba(255,255,255,0.2)";
            } else {
                const color = profilesData[targetIndex].color;
                btn.style.borderColor = color;
                btn.style.boxShadow = `0 0 20px ${color}`;
            }
        } else {
            btn.classList.remove('active');
            btn.style.boxShadow = "none";
            btn.style.borderColor = "var(--border-glass)";
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
    displayRackets(racketsToShow);
}

function displayRackets(list) {
    racketContainer.innerHTML = '';

    if (list.length === 0) {
        racketContainer.innerHTML = `<div class="empty-state">🚧 Pas encore de matos ici...</div>`;
        return;
    }

    list.forEach((racket, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.setProperty('--glow-color', racket.ownerColor);
        card.onclick = () => openModalData(racket);

        const badge = `<div class="owner-badge">${racket.ownerName}</div>`;
        let mainImage = racket.images && racket.images.length > 0 ? racket.images[0] : 'https://placehold.co/300x300/1e293b/ffffff?text=NO+IMAGE';

        card.innerHTML = `
            ${badge}
            <div class="img-container">
                <img src="${mainImage}" alt="${racket.name}">
            </div>
            <h2>${racket.name}</h2>
            <div class="card-level">${racket.level}</div>
            <div class="card-footer">
                <span class="price-tag">${racket.price}</span>
                <span class="view-arrow">➔</span>
            </div>
        `;
        racketContainer.appendChild(card);

        setTimeout(() => { card.classList.add('visible'); }, index * 100);
    });
}

// ===============================================
// MODALE
// ===============================================
const modalOverlay = document.getElementById('modal');
const mainImg = document.getElementById('m-img');
const thumbsContainer = document.getElementById('m-thumbs');

function openModalData(data) {
    document.getElementById('m-title').innerText = data.name;
    document.getElementById('m-tag').innerText = "Niveau " + data.level;

    const tag = document.getElementById('m-tag');
    tag.style.background = data.ownerColor;
    tag.style.boxShadow = `0 0 20px ${data.ownerColor}`;

    document.querySelector('.modal-content').style.setProperty('--glow-color', data.ownerColor);

    document.getElementById('m-price').innerText = data.price;
    document.getElementById('m-desc').innerText = data.description;
    document.getElementById('m-link').href = data.url;

    document.getElementById('m-weight').innerText = data.specs.weight || '-';
    document.getElementById('m-shape').innerText = data.specs.shape || '-';
    document.getElementById('m-foam').innerText = data.specs.foam || '-';
    document.getElementById('m-surface').innerText = data.specs.surface || '-';

    if (data.images && data.images.length > 0) {
        mainImg.src = data.images[0];
        thumbsContainer.innerHTML = '';
        data.images.forEach(imgSrc => {
            const thumb = document.createElement('img');
            thumb.src = imgSrc;
            thumb.className = 'thumb-img';
            thumb.onclick = (e) => {
                mainImg.src = imgSrc;
                document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                e.stopPropagation();
            };
            thumbsContainer.appendChild(thumb);
        });
    } else {
        mainImg.src = 'https://placehold.co/300x300/1e293b/ffffff?text=NO+IMAGE';
        thumbsContainer.innerHTML = '';
    }

    const statsContainer = document.getElementById('m-stats');
    statsContainer.innerHTML = '';
    for (const [key, val] of Object.entries(data.stats)) {
        statsContainer.innerHTML += `
            <div class="stat-item">
                <div class="stat-label"><span>${key}</span><span>${val}/10</span></div>
                <div class="progress-bg">
                    <div class="progress-fill" style="width: ${val * 10}%; background: ${data.ownerColor}; color: ${data.ownerColor}"></div>
                </div>
            </div>`;
    }

    modalOverlay.style.display = 'flex';
    setTimeout(() => { modalOverlay.classList.add('show'); }, 10);
}

function closeModal() {
    modalOverlay.classList.remove('show');
    setTimeout(() => { modalOverlay.style.display = 'none'; }, 300);
}

window.onclick = function (event) { if (event.target == modalOverlay) closeModal(); }

init();
