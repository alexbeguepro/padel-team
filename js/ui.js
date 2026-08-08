/**
 * ui.js
 * Tout ce qui est transversal : thème, splash, header, révélations au scroll,
 * et les petites primitives visuelles réutilisées par les vues (sparkline,
 * compteurs animés, badges de niveau, initiales).
 */

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initUI() {
    initTheme();
    initSplash();
    initHeaderScroll();
}

/* ------------------------------------------------------------------ THEME */
function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    applyTheme(saved);

    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#06070c' : '#eef1f7');

    const iconLight = document.getElementById('theme-icon-light');
    const iconDark = document.getElementById('theme-icon-dark');
    if (iconLight && iconDark) {
        // En thème sombre on propose de passer au clair (icône soleil), et inversement.
        iconLight.style.display = theme === 'dark' ? 'block' : 'none';
        iconDark.style.display = theme === 'dark' ? 'none' : 'block';
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
    if (navigator.vibrate) navigator.vibrate(8);
}

/* ------------------------------------------------------------------ SPLASH */
function initSplash() {
    const splash = document.getElementById('splash-screen');
    if (!splash) return;

    const hide = () => {
        splash.classList.add('is-gone');
        setTimeout(() => { splash.style.display = 'none'; }, 800);
    };

    setTimeout(hide, reducedMotion ? 200 : 1250);
}

/* ------------------------------------------------- HEADER + BARRE DE SCROLL */
function initHeaderScroll() {
    const topbar = document.getElementById('topbar');
    const bar = document.getElementById('scroll-bar');
    let ticking = false;

    const update = () => {
        const y = window.scrollY;
        if (topbar) topbar.classList.toggle('is-scrolled', y > 12);

        if (bar) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = max > 0 ? `${Math.min(100, (y / max) * 100)}%` : '0%';
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });

    update();
}

/* -------------------------------------------------- RÉVÉLATION AU DÉFILEMENT */
export const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target);
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

/**
 * Marque un élément comme « à révéler » avec un décalage optionnel.
 */
export function reveal(el, index = 0) {
    el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min(index, 8) * 60}ms`;
    scrollObserver.observe(el);
}

/* ---------------------------------------------------------------- COMPTEURS */
/**
 * Anime un nombre de 0 jusqu'à `value` quand l'élément entre à l'écran.
 */
export function countUp(el, value, { duration = 1100, suffix = '' } = {}) {
    if (reducedMotion || value === 0) {
        el.textContent = formatNum(value) + suffix;
        return;
    }

    const run = () => {
        const start = performance.now();
        const step = (now) => {
            const p = Math.min(1, (now - start) / duration);
            // easeOutExpo
            const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
            el.textContent = formatNum(Math.round(value * eased)) + suffix;
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                run();
                io.disconnect();
            }
        });
    }, { threshold: 0.4 });

    el.textContent = '0' + suffix;
    io.observe(el);
}

export function formatNum(n) {
    return new Intl.NumberFormat('fr-FR').format(n);
}

/* --------------------------------------------------------------- SPARKLINE */
/**
 * Construit une sparkline SVG (aire + ligne + point final) à partir d'une
 * série de valeurs. La couleur est héritée via la variable CSS --pc.
 */
export function sparkline(values, { width = 120, height = 34, dot = true } = {}) {
    const pts = (values || []).filter(v => typeof v === 'number');
    if (pts.length < 2) return '';

    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const flat = max === min;
    const span = max - min || 1;
    const pad = 3;
    const innerH = height - pad * 2;

    const coords = pts.map((v, i) => {
        const x = (i / (pts.length - 1)) * width;
        // Une série constante est tracée à mi-hauteur plutôt que collée en bas.
        const ratio = flat ? 0.5 : (v - min) / span;
        return [x, pad + innerH - ratio * innerH];
    });

    const line = coords
        .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
        .join(' ');

    const area = `${line} L${width},${height} L0,${height} Z`;
    const [lx, ly] = coords[coords.length - 1];

    return `
        <svg class="spark" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
            <path class="area" d="${area}" />
            <path class="line" d="${line}" vector-effect="non-scaling-stroke" />
            ${dot ? `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="2.6" />` : ''}
        </svg>
    `;
}

/* ------------------------------------------------------------------ DIVERS */
/** Initiales d'un joueur, ex. « Alex Begue » → « AB ». */
export function initials(first = '', last = '') {
    return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

/** Traduit un libellé de niveau libre en classe de couleur cohérente. */
export function levelClass(level = '') {
    const l = level.toLowerCase();
    if (l.includes('expert')) return 'lvl-expert';
    if (l.includes('avanc')) return 'lvl-avance';
    if (l.includes('inter')) return 'lvl-inter';
    return 'lvl-debutant';
}

/** Variation entre les deux derniers relevés d'un historique. */
export function pointsDelta(history = []) {
    if (history.length < 2) return 0;
    return history[history.length - 1].points - history[history.length - 2].points;
}

/** Rend un badge de variation (▲ / ▼ / =). */
export function deltaChip(delta, unit = 'pts') {
    if (!delta) return `<span class="delta">= 0</span>`;
    const up = delta > 0;
    const arrow = up ? '▲' : '▼';
    return `<span class="delta ${up ? 'up' : 'down'}">${arrow} ${up ? '+' : ''}${delta} ${unit}</span>`;
}

/** Échappe le texte injecté dans le HTML. */
export function esc(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
