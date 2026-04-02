/**
 * ui.js
 * Gère tout ce qui est transversal à l'interface (Thème, Splash screen, modales de base)
 */

export function initUI() {
    initTheme();

    // Fade out splash screen
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 600); // match transition duration
        }
    }, 1200); // Temps d'affichage initial simulant le chargement
}

// --- THEME TOGGLE ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Attache l'événement au bouton (car app.js n'expose plus les fonctions globalement via onClick)
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}
window.toggleTheme = toggleTheme;

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

// --- UTILS ---
export const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            scrollObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
});
