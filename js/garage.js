/**
 * garage.js
 * Gère la grille principale des raquettes, le filtrage et l'ouverture de la modale
 */
import { scrollObserver } from './ui.js';

let currentProfilesData = [];
const filterBar = document.getElementById('filter-bar');
const racketContainer = document.getElementById('racket-container');
const modalOverlay = document.getElementById('modal');
const compareModal = document.getElementById('compare-modal');
const floatingCompareBtn = document.getElementById('floating-compare-btn');

let currentOwnerFilter = 'all';
let selectedForCompare = [];

// eSport 3D Tilt Logic
function handleCardTilt(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xPct = x / rect.width;
    const yPct = y / rect.height;
    
    // Rotation amplitude (15 degrees)
    const rotateY = (xPct - 0.5) * 30; 
    const rotateX = (0.5 - yPct) * 30;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
}

function resetCardTilt(e) {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
}

export function initGarage(profilesData) {
    currentProfilesData = profilesData;
    renderFilters();
    filterByOwner('all');
    setupModalEvents();
    setupAdvancedFilters();
}

function setupAdvancedFilters() {
    const searchInput = document.getElementById('search-input');
    const brandFilter = document.getElementById('brand-filter');
    const levelFilter = document.getElementById('level-filter');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (brandFilter) brandFilter.addEventListener('change', applyFilters);
    if (levelFilter) levelFilter.addEventListener('change', applyFilters);
}

function renderFilters() {
    if (!filterBar) return;

    // Bouton de Favoris (Wishlist) en premier (sous forme de bouton dynamique)
    const favBtn = document.createElement('button');
    favBtn.className = 'filter-btn';
    favBtn.onclick = () => filterByOwner('favorites');
    favBtn.innerHTML = `
        <span style="display:inline-block; margin-right:5px; color:#ff3366;">♥</span> 
        Wishlist
    `;
    filterBar.appendChild(favBtn);

    // On conserve le bouton "Tout" (déjà présent dans le HTML) et on ajoute les autres
    currentProfilesData.forEach((profile, index) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.onclick = () => filterByOwner(index);
        btn.innerHTML = `
            <span class="filter-dot" style="background: ${profile.color};"></span>
            ${profile.name}
        `;
        filterBar.appendChild(btn);
    });
}

// Conserve l'état du filtre propriétaire cliqué
window.filterByOwner = function (targetIndex) {
    currentOwnerFilter = targetIndex;

    // Mise à jour visuelle des boutons
    // Note: The HTML has 'Btn-All' as the first child of filterBar. Then we prepend FavBtn, then Owners.
    // Order visually is: Btn-All (0), FavBtn (1), Owners (2+).
    // Let's just reset all and target dynamically.
    document.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.classList.remove('active');
        btn.style.color = '';
        
        if (targetIndex === 'all' && btn.id === 'btn-all') {
            btn.classList.add('active');
        } else if (targetIndex === 'favorites' && btn.innerHTML.includes('Wishlist')) {
            btn.classList.add('active');
            btn.style.color = '#ff3366';
        } else if (typeof targetIndex === 'number' && btn.innerHTML.includes(currentProfilesData[targetIndex].name)) {
            btn.classList.add('active');
            btn.style.color = 'var(--text-main)';
        }
    });

    applyFilters();
}

// Combine tous les filtres
function applyFilters() {
    const searchValue = document.getElementById('search-input')?.value.toLowerCase() || '';
    const brandValue = document.getElementById('brand-filter')?.value || 'all';
    const levelValue = document.getElementById('level-filter')?.value || 'all';

    let racketsToShow = [];
    
    // 1. Filtrer par propriétaire ou favoris
    if (currentOwnerFilter === 'all') {
        currentProfilesData.forEach(profile => {
            profile.rackets.forEach(r => {
                r.ownerName = profile.name;
                r.ownerColor = profile.color;
                racketsToShow.push(r);
            });
        });
    } else if (currentOwnerFilter === 'favorites') {
        let favs = [];
        try { favs = JSON.parse(localStorage.getItem('padelFavs')) || []; } catch(e){}
        currentProfilesData.forEach(profile => {
            profile.rackets.forEach(r => {
                if (favs.includes(r.name)) {
                    r.ownerName = profile.name;
                    r.ownerColor = profile.color;
                    racketsToShow.push(r);
                }
            });
        });
    } else {
        const profile = currentProfilesData[currentOwnerFilter];
        racketsToShow = profile.rackets.map(r => {
            r.ownerName = profile.name;
            r.ownerColor = profile.color;
            return r;
        });
    }

    // 2. Appliquer la recherche texte
    if (searchValue) {
        racketsToShow = racketsToShow.filter(r =>
            r.name.toLowerCase().includes(searchValue)
        );
    }

    // 3. Appliquer le filtre de marque
    if (brandValue !== 'all') {
        racketsToShow = racketsToShow.filter(r =>
            r.name.toLowerCase().includes(brandValue.toLowerCase())
        );
    }

    // 4. Appliquer le filtre de niveau
    if (levelValue !== 'all') {
        racketsToShow = racketsToShow.filter(r =>
            r.level === levelValue
        );
    }

    scrollObserver.disconnect();
    displayRackets(racketsToShow);
}

function displayRackets(list) {
    if (!racketContainer) return;
    racketContainer.innerHTML = '';

    if (list.length === 0) {
        racketContainer.innerHTML = `
            <div class="empty-state">
                <span class="emoji">🎾</span>
                Oups ! Aucune raquette de cet arsenal ne correspond à ces critères.<br>
                <small style="opacity:0.6; display:block; margin-top:10px;">Essayez d'élargir la recherche ou de changer de niveau.</small>
            </div>
        `;
        return;
    }

    // Récupération des favoris existants
    let favList = [];
    try {
        favList = JSON.parse(localStorage.getItem('padelFavs')) || [];
    } catch(e) {}

    list.forEach((racket, index) => {
        const card = document.createElement('div');
        card.className = 'card animate-in';
        // Stagger effect
        card.style.animationDelay = `${index * 0.05}s`;
        
        card.style.setProperty('--glow-color', racket.ownerColor);
        card.onclick = () => {
            if (navigator.vibrate) navigator.vibrate(15);
            openModalData(racket);
        };
        
        // eSport 3D Tilt Effect
        card.addEventListener('mousemove', handleCardTilt);
        card.addEventListener('mouseleave', resetCardTilt);

        const badge = `<div class="owner-badge">${racket.ownerName}</div>`;
        let mainImage = racket.images && racket.images.length > 0 ? racket.images[0] : 'https://placehold.co/400x400/0a0a0a/333333?text=NO+IMAGE';

        // Bouton favoris (Cœur)
        const isFav = favList.includes(racket.name);
        const favBtn = document.createElement('div');
        favBtn.className = `fav-btn ${isFav ? 'liked' : ''}`;
        favBtn.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
        `;
        favBtn.onclick = (e) => toggleFavorite(e, racket.name, favBtn);

        const power = racket.stats?.Puissance || '-';
        const control = racket.stats?.Contrôle || '-';
        const spin = racket.stats?.Effet || '-';

        let brand = racket.name.split(' ')[0] || '';
        const shortName = racket.name.replace(new RegExp('^' + brand + '\\s?', 'i'), '');

        card.innerHTML = `
            ${badge}
            <div class="img-container">
                <img src="${mainImage}" alt="${racket.name}" loading="lazy">
            </div>
            
            <div class="card-info-header">
                <div>
                    <h3 class="card-brand">${brand}</h3>
                    <h2 class="card-title">${shortName || racket.name}</h2>
                    <div class="card-status">
                        <span class="status-dot" style="background: var(--glow-color);"></span>
                        Available
                    </div>
                </div>
            </div>

            <div class="card-action-overlay">
                <button class="btn-detail card-btn-detail">VIEW DETAILS</button>
                <div class="btn-row">
                    <button class="btn-equip card-btn-equip">EQUIP</button>
                    <button class="btn-stats card-btn-stats">STATS</button>
                </div>
            </div>
        `;

        card.querySelector('.card-action-overlay').onclick = (e) => e.stopPropagation();
        card.querySelector('.card-btn-detail').onclick = (e) => { e.stopPropagation(); openModalData(racket); };
        card.querySelector('.card-btn-stats').onclick = (e) => { e.stopPropagation(); openModalData(racket); };
        card.querySelector('.card-btn-equip').onclick = (e) => { e.stopPropagation(); alert('Raquette ' + racket.name + ' équipée !'); };

        // Checkbox Comparateur
        const checkboxWrap = document.createElement('div');
        checkboxWrap.className = 'card-checkbox-wrap';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'compare-checkbox';
        checkbox.checked = selectedForCompare.some(r => r.name === racket.name);
        checkbox.onchange = (e) => handleCompareToggle(e, racket);
        
        checkboxWrap.appendChild(checkbox);

        // Actions Wrapper to prevent overlap
        const actionsWrap = document.createElement('div');
        actionsWrap.className = 'card-actions';
        actionsWrap.onclick = (e) => e.stopPropagation(); // Evite d'ouvrir la modale simple depuis ces clics
        
        actionsWrap.appendChild(favBtn);
        actionsWrap.appendChild(checkboxWrap);

        card.appendChild(actionsWrap);

        racketContainer.appendChild(card);
        scrollObserver.observe(card);
    });
}

function toggleFavorite(e, racketName, btn) {
    e.stopPropagation(); // Évite d'ouvrir la modale
    let favList = [];
    try {
        favList = JSON.parse(localStorage.getItem('padelFavs')) || [];
    } catch(e) {}

    const index = favList.indexOf(racketName);
    if (index > -1) {
        favList.splice(index, 1);
        btn.classList.remove('liked');
    } else {
        favList.push(racketName);
        btn.classList.add('liked');
        
        // Petite animation de pop
        btn.style.transform = 'scale(1.3)';
        setTimeout(() => btn.style.transform = '', 200);
    }
    
    localStorage.setItem('padelFavs', JSON.stringify(favList));
    
    // Si on est sur le filtre favoris (optionnel mais UX++)
    if (currentOwnerFilter === 'favorites') {
        applyFilters(); 
    }
}

// --- LOGIQUE COMPARATEUR ---
function handleCompareToggle(e, racket) {
    if (e.target.checked) {
        if (selectedForCompare.length >= 2) {
            e.target.checked = false;
            alert("Vous ne pouvez comparer que 2 raquettes en même temps.");
            return;
        }
        selectedForCompare.push(racket);
    } else {
        selectedForCompare = selectedForCompare.filter(r => r.name !== racket.name);
    }
    updateFloatingCompareBtn();
}

function updateFloatingCompareBtn() {
    if (!floatingCompareBtn) return;
    const countSpan = document.getElementById('compare-count');
    if (countSpan) countSpan.innerText = selectedForCompare.length;

    if (selectedForCompare.length > 0) {
        floatingCompareBtn.style.display = 'block';
    } else {
        floatingCompareBtn.style.display = 'none';
        closeCompareModal();
    }
}

window.openCompareModal = function () {
    if (selectedForCompare.length !== 2) {
        alert("Veuillez sélectionner exactement 2 raquettes pour lancer la comparaison.");
        return;
    }

    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    renderCompareModal();
    compareModal.style.visibility = 'visible';
    requestAnimationFrame(() => {
        compareModal.classList.add('show');
        setTimeout(() => {
            document.querySelectorAll('.c-bar-fill').forEach(bar => {
                bar.style.width = bar.getAttribute('data-width');
            });
        }, 300);
    });
}

window.closeCompareModal = function () {
    if (!compareModal) return;
    compareModal.classList.remove('show');
    document.querySelectorAll('.c-bar-fill').forEach(bar => {
        bar.style.width = '0%';
    });
    setTimeout(() => {
        compareModal.style.visibility = 'hidden';
    }, 400);
}

function renderCompareModal() {
    const layout = document.getElementById('compare-layout');
    if (!layout) return;
    layout.innerHTML = '';

    const allStatsKeys = ["Puissance", "Contrôle", "Confort", "Maniabilité", "Effet", "Tolérance"];

    selectedForCompare.forEach(racket => {
        const col = document.createElement('div');
        col.className = 'compare-column';

        let mainImage = racket.images && racket.images.length > 0 ? racket.images[0] : 'https://placehold.co/400x400/0a0a0a/333333?text=NO+IMAGE';

        let html = `
            <img class="c-img" src="${mainImage}" alt="${racket.name}">
            <h3 class="c-name" style="color: ${racket.ownerColor}">${racket.name}</h3>
            <div style="width: 100%; max-width: 300px;">
        `;

        allStatsKeys.forEach(key => {
            const val = racket.stats[key] || 0;
            const formattedVal = val < 10 ? '0' + val : val;
            html += `
                <div class="c-stat-row">
                    <span class="c-stat-name">${key}</span>
                    <div class="c-bar-container">
                        <div class="c-bar-fill" style="background: ${racket.ownerColor}" data-width="${val * 10}%"></div>
                    </div>
                    <span class="c-val">${formattedVal}</span>
                </div>
            `;
        });

        html += `</div>`;
        col.innerHTML = html;
        layout.appendChild(col);
    });
}

// --- MODALE SIMPLE (Existante) ---
function openModalData(data) {
    document.getElementById('m-title').innerText = data.name;
    document.getElementById('m-tag').innerText = "CALIBRE // " + data.level;
    const tag = document.getElementById('m-tag');
    tag.style.color = data.ownerColor;

    modalOverlay.style.setProperty('--glow-color', data.ownerColor);
    document.getElementById('m-price').innerText = data.price.replace('€', ' EUR');
    document.getElementById('m-desc').innerText = data.description;

    const linkBtn = document.getElementById('m-link');
    if (linkBtn) linkBtn.href = data.url;

    document.getElementById('m-weight').innerText = data.specs.weight || '-';
    document.getElementById('m-shape').innerText = data.specs.shape || '-';
    document.getElementById('m-foam').innerText = data.specs.foam || '-';
    document.getElementById('m-surface').innerText = data.specs.surface || '-';

    // Images
    const mainImg = document.getElementById('m-img');
    const thumbsContainer = document.getElementById('m-thumbs');

    if (data.images && data.images.length > 0) {
        mainImg.src = data.images[0];
        thumbsContainer.innerHTML = '';

        if (data.images.length > 1) {
            data.images.forEach((imgSrc, index) => {
                const thumb = document.createElement('img');
                thumb.src = imgSrc;
                thumb.className = index === 0 ? 'thumb-img active' : 'thumb-img';

                thumb.onclick = (e) => {
                    mainImg.src = imgSrc;
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

    // Stats (Télémétrie)
    const statsContainer = document.getElementById('m-stats');
    statsContainer.innerHTML = '';
    for (const [key, val] of Object.entries(data.stats)) {
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

    // Affichage avec animation
    modalOverlay.style.visibility = 'visible';
    requestAnimationFrame(() => {
        modalOverlay.classList.add('show');
        setTimeout(() => {
            document.querySelectorAll('.stat-animated').forEach(bar => {
                bar.style.width = bar.getAttribute('data-width');
            });
        }, 300);
    });
}

function setupModalEvents() {
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }

    window.addEventListener('click', (event) => {
        if (event.target == modalOverlay) {
            closeModal();
        }
    });
}

window.closeModal = function () {
    modalOverlay.classList.remove('show');
    document.querySelectorAll('.stat-animated').forEach(bar => {
        bar.style.width = '0%';
    });
    setTimeout(() => {
        modalOverlay.style.visibility = 'hidden';
    }, 600);
}
