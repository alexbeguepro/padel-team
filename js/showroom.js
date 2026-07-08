/**
 * showroom.js
 * Gère la logique d'affichage du catalogue Showroom sous forme de défilement vertical.
 * Effet 3D Tilt individuel, angles alternatifs par raquette et animation des jauges au scroll.
 */

let allRackets = [];

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

    renderShowroomFeed();
}

function renderShowroomFeed() {
    const feed = document.getElementById('sr-feed');
    if (!feed) return;
    feed.innerHTML = '';

    allRackets.forEach((racket, index) => {
        const row = document.createElement('div');
        row.className = 'sr-racket-row';
        row.id = `racket-row-${index}`;
        row.style.setProperty('--glow-color', racket.ownerColor);

        // Indicateurs d'angles (uniquement s'il y a plusieurs images)
        let angleIndicatorsHTML = '';
        if (racket.images && racket.images.length > 1) {
            angleIndicatorsHTML = `<div class="sr-angle-indicators" id="sr-angles-${index}">`;
            racket.images.forEach((imgSrc, imgIdx) => {
                const activeClass = imgIdx === 0 ? 'active' : '';
                angleIndicatorsHTML += `<div class="sr-angle-dot ${activeClass}" title="Angle ${imgIdx + 1}" data-index="${imgIdx}"></div>`;
            });
            angleIndicatorsHTML += `</div>`;
        }

        // Caractéristiques techniques (specs)
        const specs = racket.specs || {};
        const weight = specs.weight || '-';
        const shape = specs.shape || '-';
        const foam = specs.foam || '-';
        const surface = specs.surface || '-';

        // Télémétrie (Jauges circulaires)
        let telemetryHTML = '';
        if (racket.stats) {
            for (const [key, val] of Object.entries(racket.stats)) {
                const formattedVal = val < 10 ? '0' + val : val;
                // Circonférence d'un cercle r=28 : 176
                const offset = 176 - (val * 17.6);
                telemetryHTML += `
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
        }

        row.innerHTML = `
            <!-- Zone Showcase de gauche (Image de la raquette) -->
            <div class="sr-showcase" id="sr-showcase-${index}">
                <div class="sr-glow-backdrop"></div>
                <div class="sr-racket-wrapper" id="sr-racket-wrap-${index}">
                    <img id="sr-img-${index}" src="${racket.images[0]}" alt="${racket.name}" loading="lazy">
                </div>
                ${angleIndicatorsHTML}
            </div>

            <!-- Zone de droite (Détails & Performance) -->
            <div class="sr-details">
                <div class="sr-header">
                    <div class="sr-meta">
                        <span class="sr-owner-tag" style="border-left-color: ${racket.ownerColor};">
                            <span class="sr-owner-dot" style="background: ${racket.ownerColor};"></span>
                            ${racket.ownerName.toUpperCase()}
                        </span>
                        <span class="sr-level-tag">${racket.level.toUpperCase()}</span>
                    </div>
                    <h2 class="sr-title">${racket.name}</h2>
                    <div class="sr-price">${racket.price.replace('€', ' EUR')}</div>
                </div>

                <p class="sr-description">${racket.description}</p>

                <div class="sr-specs-grid">
                    <div class="sr-spec-card">
                        <span class="sr-spec-label">Poids</span>
                        <span class="sr-spec-value">${weight}</span>
                    </div>
                    <div class="sr-spec-card">
                        <span class="sr-spec-label">Forme</span>
                        <span class="sr-spec-value">${shape}</span>
                    </div>
                    <div class="sr-spec-card">
                        <span class="sr-spec-label">Mousse</span>
                        <span class="sr-spec-value">${foam}</span>
                    </div>
                    <div class="sr-spec-card">
                        <span class="sr-spec-label">Surface</span>
                        <span class="sr-spec-value">${surface}</span>
                    </div>
                </div>

                <div class="sr-telemetry">
                    <h3 class="sr-telemetry-title">TÉLÉMÉTRIE DE PERFORMANCE</h3>
                    <div class="sr-telemetry-grid">
                        ${telemetryHTML}
                    </div>
                </div>

                <div class="sr-actions">
                    <a href="${racket.url || '#'}" target="_blank" class="sr-buy-btn">
                        Acheter la Raquette
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </a>
                </div>
            </div>
        `;

        feed.appendChild(row);

        // Attachement du Tilt 3D individuel
        setupRowTilt(index);

        // Attachement du changement d'angles
        setupRowAngles(index, racket);

        // Animation d'entrée au défilement (scrollObserver)
        import('./ui.js').then(module => {
            if (module.scrollObserver) {
                module.scrollObserver.observe(row);
            }
        });
    });

    // Animation progressive des jauges au scroll
    setupGaugesObserver();
}

function setupRowTilt(index) {
    const wrapper = document.getElementById(`sr-racket-wrap-${index}`);
    const racketImg = document.getElementById(`sr-img-${index}`);
    if (!wrapper || !racketImg) return;

    wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateY = ((x - centerX) / centerX) * 20; 
        const rotateX = ((centerY - y) / centerY) * 20; 
        
        racketImg.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    });

    wrapper.addEventListener('mouseleave', () => {
        racketImg.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    });
}

function setupRowAngles(index, racket) {
    const dots = document.querySelectorAll(`#sr-angles-${index} .sr-angle-dot`);
    const imgEl = document.getElementById(`sr-img-${index}`);
    if (!dots.length || !imgEl) return;

    dots.forEach(dot => {
        const switchFunc = () => {
            const imgIdx = parseInt(dot.getAttribute('data-index'));
            if (dot.classList.contains('active')) return;

            if (navigator.vibrate) navigator.vibrate(5);

            // Animation de flip
            imgEl.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
            imgEl.style.transform = 'rotateY(90deg) scale(0.9)';
            imgEl.style.opacity = '0.3';
            
            setTimeout(() => {
                imgEl.src = racket.images[imgIdx];
                imgEl.style.transform = 'rotateY(-90deg) scale(0.9)';
                
                void imgEl.offsetWidth; // Reflow
                
                imgEl.style.transform = 'rotateY(0deg) scale(1)';
                imgEl.style.opacity = '1';
                
                dots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
                
                setTimeout(() => {
                    imgEl.style.transition = 'transform 0.1s ease, filter 0.5s ease';
                }, 250);
            }, 200);
        };

        dot.onclick = switchFunc;
        dot.onmouseenter = switchFunc;
    });
}

function setupGaugesObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fills = entry.target.querySelectorAll('.sr-gauge-fill');
                fills.forEach(fill => {
                    const targetOffset = fill.getAttribute('data-offset');
                    fill.style.strokeDashoffset = targetOffset;
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.sr-racket-row').forEach(row => {
        observer.observe(row);
    });
}
