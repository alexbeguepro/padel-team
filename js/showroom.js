/**
 * showroom.js
 * Gère la logique interactive et animée de la vue Showroom.
 * Effet 3D Tilt, transitions fluides, jauges télémétriques animées,
 * gestion du clavier et swipe tactile.
 */

let allRackets = [];
let currentIndex = 0;
let mouseMoveHandler = null;

export function initShowroom(profilesData) {
    allRackets = [];
    profilesData.forEach(profile => {
        profile.rackets.forEach(r => {
            allRackets.push({
                ...r,
                ownerName: profile.name,
                ownerColor: profile.color
            });
        });
    });

    if (allRackets.length === 0) return;

    renderCarousel();
    loadRacket(0);
    setupEvents();
    updateCarouselActive();
}

function loadRacket(index) {
    const racket = allRackets[index];
    if (!racket) return;

    // Textes basiques
    document.getElementById('sr-title').innerText = racket.name;
    document.getElementById('sr-level').innerText = racket.level.toUpperCase();
    document.getElementById('sr-price').innerText = racket.price.replace('€', ' EUR');
    document.getElementById('sr-desc').innerText = racket.description;

    // Caractéristiques techniques (specs)
    document.getElementById('sr-spec-weight').innerText = racket.specs.weight || '-';
    document.getElementById('sr-spec-shape').innerText = racket.specs.shape || '-';
    document.getElementById('sr-spec-foam').innerText = racket.specs.foam || '-';
    document.getElementById('sr-spec-surface').innerText = racket.specs.surface || '-';

    // Propriétaire / Joueur
    const ownerBadge = document.getElementById('sr-owner-badge');
    if (ownerBadge) {
        ownerBadge.innerHTML = `<span class="sr-owner-dot" style="background: ${racket.ownerColor};"></span> ${racket.ownerName.toUpperCase()}`;
    }

    // Lien d'achat
    const buyLink = document.getElementById('sr-buy-link');
    if (buyLink) buyLink.href = racket.url || '#';

    // Couleur dynamique (CSS Variable locale pour la vue showroom)
    const showroomSection = document.getElementById('showroom-view');
    if (showroomSection) {
        showroomSection.style.setProperty('--glow-color', racket.ownerColor);
    }

    // Filigrane de marque en arrière-plan
    const watermark = document.getElementById('sr-watermark');
    if (watermark) {
        const brandName = racket.name.split(' ')[0] || 'PADEL';
        watermark.innerText = brandName.toUpperCase();
    }

    // Image active de la raquette
    const activeImg = document.getElementById('sr-active-img');
    if (activeImg) {
        activeImg.src = racket.images && racket.images.length > 0 ? racket.images[0] : 'https://placehold.co/400x400/0a0a0a/333333?text=NO+IMAGE';
    }

    // Angles / Galerie (Miniatures)
    renderAngles(racket);

    // Télémétrie (Jauges circulaires)
    renderTelemetry(racket);

    // Initialisation du Tilt 3D
    setup3DTilt();
}

function renderAngles(racket) {
    const container = document.getElementById('sr-angles');
    if (!container) return;
    container.innerHTML = '';

    if (racket.images && racket.images.length > 1) {
        racket.images.forEach((imgSrc, idx) => {
            const dot = document.createElement('div');
            dot.className = idx === 0 ? 'sr-angle-dot active' : 'sr-angle-dot';
            dot.title = `Angle ${idx + 1}`;
            
            // Clic ou Survol pour changer l'angle avec animation de rotation
            const switchFunc = () => setRacketAngle(imgSrc, idx);
            dot.onclick = switchFunc;
            dot.onmouseenter = switchFunc;
            
            container.appendChild(dot);
        });
    }
}

function setRacketAngle(imageSrc, dotIndex) {
    const imgEl = document.getElementById('sr-active-img');
    const dots = document.querySelectorAll('.sr-angle-dot');
    if (!imgEl) return;
    
    // Détecter si on clique sur le point déjà actif
    if (dots[dotIndex] && dots[dotIndex].classList.contains('active')) return;

    if (navigator.vibrate) navigator.vibrate(5);

    // Animation de rotation (effet de flip)
    imgEl.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
    imgEl.style.transform = 'rotateY(90deg) scale(0.9)';
    imgEl.style.opacity = '0.3';
    
    setTimeout(() => {
        imgEl.src = imageSrc;
        imgEl.style.transform = 'rotateY(-90deg) scale(0.9)';
        
        void imgEl.offsetWidth; // Reflow
        
        imgEl.style.transform = 'rotateY(0deg) scale(1)';
        imgEl.style.opacity = '1';
        
        dots.forEach((dot, idx) => {
            if (idx === dotIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });
        
        // Rétablir la transition rapide pour le Tilt 3D après animation
        setTimeout(() => {
            imgEl.style.transition = 'transform 0.1s ease, filter 0.5s ease';
        }, 250);
    }, 200);
}

function renderTelemetry(racket) {
    const statsContainer = document.getElementById('sr-telemetry-stats');
    if (!statsContainer) return;
    statsContainer.innerHTML = '';

    // Affiche les 6 statistiques du joueur sous forme de jauges
    for (const [key, val] of Object.entries(racket.stats)) {
        const formattedVal = val < 10 ? '0' + val : val;
        // Circonférence d'un cercle r=28 : 2 * Math.PI * 28 = 175.92
        // On arrondit à 176 pour la simplicité.
        const offset = 176 - (val * 17.6);
        
        statsContainer.innerHTML += `
            <div class="sr-telemetry-item">
                <div class="sr-gauge-container">
                    <svg class="sr-gauge-svg" viewBox="0 0 70 70">
                        <circle class="sr-gauge-bg" cx="35" cy="35" r="28" />
                        <circle class="sr-gauge-fill" cx="35" cy="35" r="28" style="stroke-dasharray: 176; stroke-dashoffset: 176;" data-offset="${offset}" />
                    </svg>
                    <div class="sr-gauge-val">${formattedVal}</div>
                </div>
                <span class="sr-telemetry-label">${key}</span>
            </div>
        `;
    }

    // Animation progressive des jauges
    requestAnimationFrame(() => {
        setTimeout(() => {
            document.querySelectorAll('#sr-telemetry-stats .sr-gauge-fill').forEach(fill => {
                const targetOffset = fill.getAttribute('data-offset');
                fill.style.strokeDashoffset = targetOffset;
            });
        }, 100);
    });
}

function renderCarousel() {
    const track = document.getElementById('sr-carousel');
    if (!track) return;
    track.innerHTML = '';
    
    allRackets.forEach((racket, index) => {
        const item = document.createElement('div');
        item.className = 'sr-carousel-item';
        item.dataset.index = index;
        item.style.setProperty('--glow-color', racket.ownerColor);
        
        item.innerHTML = `
            <div class="sr-carousel-img">
                <img src="${racket.images[0]}" alt="${racket.name}" loading="lazy">
            </div>
            <div class="sr-carousel-title">${racket.name}</div>
        `;
        
        item.addEventListener('click', () => {
            changeRacket(index);
        });
        
        track.appendChild(item);
    });
}

function changeRacket(nextIndex) {
    if (nextIndex === currentIndex) return;
    
    const wrap = document.getElementById('sr-racket-wrap');
    if (!wrap) return;

    if (navigator.vibrate) navigator.vibrate(10);

    // Déterminer la direction de transition (Suivant ou Précédent)
    const isNext = (nextIndex > currentIndex && !(currentIndex === 0 && nextIndex === allRackets.length - 1)) || (currentIndex === allRackets.length - 1 && nextIndex === 0);
    const outClass = isNext ? 'transition-out' : 'transition-in';
    const inClass = isNext ? 'transition-in' : 'transition-out';

    wrap.classList.add(outClass);

    setTimeout(() => {
        currentIndex = nextIndex;
        loadRacket(nextIndex);
        
        // Reset classes et prépare la raquette depuis le côté opposé
        wrap.className = 'sr-racket-wrapper';
        wrap.classList.add(inClass);
        
        void wrap.offsetWidth; // Déclencher le reflow
        
        // Glisser vers la position centrale
        wrap.classList.remove(inClass);
        updateCarouselActive();
    }, 250);
}

function navigateRacket(direction) {
    let nextIndex = currentIndex;
    if (direction === 'next') {
        nextIndex = (currentIndex + 1) % allRackets.length;
    } else {
        nextIndex = (currentIndex - 1 + allRackets.length) % allRackets.length;
    }
    changeRacket(nextIndex);
}

function updateCarouselActive() {
    const items = document.querySelectorAll('.sr-carousel-item');
    items.forEach((item, index) => {
        if (index === currentIndex) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            item.classList.remove('active');
        }
    });
}

function setup3DTilt() {
    const racketImg = document.querySelector('#sr-racket-wrap img');
    const wrapper = document.getElementById('sr-racket-wrap');
    if (!racketImg || !wrapper) return;

    // Supprimer les anciens écouteurs pour éviter le cumul
    if (mouseMoveHandler) {
        wrapper.removeEventListener('mousemove', mouseMoveHandler);
    }

    mouseMoveHandler = (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculer l'angle de rotation (amplitude de 20 degrés max)
        const rotateY = ((x - centerX) / centerX) * 20; 
        const rotateX = ((centerY - y) / centerY) * 20; 
        
        racketImg.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
        
        // Décalage du halo lumineux de fond
        const glow = document.getElementById('sr-glow');
        if (glow) {
            const glowX = ((x - centerX) / centerX) * 20;
            const glowY = ((y - centerY) / centerY) * 20;
            glow.style.transform = `translate(${glowX}px, ${glowY}px)`;
        }
    };

    function resetTilt() {
        racketImg.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        const glow = document.getElementById('sr-glow');
        if (glow) {
            glow.style.transform = 'translate(0px, 0px)';
        }
    }

    wrapper.addEventListener('mousemove', mouseMoveHandler);
    wrapper.addEventListener('mouseleave', resetTilt);
}

function setupSwipe() {
    const wrapper = document.getElementById('sr-racket-wrap');
    if (!wrapper) return;
    
    let startX = 0;
    let endX = 0;
    
    wrapper.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });
    
    wrapper.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 60) {
            if (diff > 0) {
                navigateRacket('next');
            } else {
                navigateRacket('prev');
            }
        }
    }, { passive: true });
}

function setupEvents() {
    const prevBtn = document.getElementById('sr-prev');
    const nextBtn = document.getElementById('sr-next');
    
    if (prevBtn) prevBtn.onclick = () => navigateRacket('prev');
    if (nextBtn) nextBtn.onclick = () => navigateRacket('next');

    // Événements clavier (Flèches gauche / droite)
    window.addEventListener('keydown', (e) => {
        const showroomView = document.getElementById('showroom-view');
        if (showroomView && showroomView.style.display !== 'none') {
            if (e.key === 'ArrowLeft') {
                navigateRacket('prev');
            } else if (e.key === 'ArrowRight') {
                navigateRacket('next');
            }
        }
    });

    setupSwipe();
}
