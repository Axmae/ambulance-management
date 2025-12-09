// assets/js/app.js

import { loadSession } from './modules/auth.js';
import { applyLanguage, currentLang, translate } from './modules/i18n.js';
import { renderLoginView, setupLogoutListener } from './views/auth-view.js';

// Import des vues
import { initDashboardView } from './views/dashboard-view.js';
import { initAmbulancesView } from './views/ambulances-view.js';
import { initChauffeursView } from './views/chauffeurs-view.js';
// TODO: ajouter plus tard
// import { initInterventionsView } from './views/interventions-view.js';
// import { initHopitauxView } from './views/hopitaux-view.js';
// import { initPatientsView } from './views/patients-view.js';

const ROOT = document.getElementById('root');
const DEFAULT_VIEW = 'dashboard';
let currentView = DEFAULT_VIEW;

// -----------------------------------------------------------------------------
// 1. RENDU DU SHELL DE L'APPLICATION
// -----------------------------------------------------------------------------
function renderAppShell(userEmail) {
    ROOT.innerHTML = `
        <div id="app-container" class="d-flex flex-column min-vh-100">
            <header class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container-fluid">
                    <span class="navbar-brand">🚑 ${translate('app_title')}</span>
                    <div class="d-flex align-items-center">
                        <span class="text-white me-3 d-none d-sm-inline" id="username-display">
                            ${translate('welcome_user') || 'Bienvenue,'} ${userEmail}
                        </span>
                        <select class="form-select form-select-sm me-2" id="language-selector">
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                            <option value="ar">العربية</option>
                        </select>
                        <button class="btn btn-outline-light" id="logout-button" data-i18n-key="logout_btn">
                            ${translate('logout_btn')}
                        </button>
                    </div>
                </div>
            </header>

            <main class="d-flex flex-grow-1">
                <aside id="sidebar-menu" class="bg-light p-3" style="width: 250px; min-height: 100%;">
                    <ul class="nav nav-pills flex-column mb-auto">
                        <li><a href="#" class="nav-link link-dark" data-view="dashboard" data-i18n-key="dashboard">${translate('dashboard')}</a></li>
                        <li><a href="#" class="nav-link link-dark" data-view="ambulances" data-i18n-key="ambulances_list">${translate('ambulances_list')}</a></li>
                        <li><a href="#" class="nav-link link-dark" data-view="chauffeurs" data-i18n-key="chauffeurs_list">${translate('chauffeurs_list') || 'Chauffeurs'}</a></li>
                        <li><a href="#" class="nav-link link-dark" data-view="interventions">${translate('interventions_list') || 'Interventions'}</a></li>
                        <li><a href="#" class="nav-link link-dark" data-view="hopitaux">${translate('hopitaux_list') || 'Hôpitaux'}</a></li>
                        <li><a href="#" class="nav-link link-dark" data-view="patients">${translate('patients_list') || 'Patients'}</a></li>
                    </ul>
                </aside>

                <section id="content-area" class="p-4 flex-grow-1"></section>
            </main>
        </div>
    `;

    setupEventListeners();
    navigateTo(currentView || DEFAULT_VIEW);
}

// -----------------------------------------------------------------------------
// 2. ROUTAGE ET NAVIGATION
// -----------------------------------------------------------------------------
function navigateTo(viewName) {
    currentView = viewName;
    const contentArea = document.getElementById('content-area');

    // Activer le lien correspondant dans la sidebar
    document.querySelectorAll('#sidebar-menu .nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.view === viewName);
    });

    // Affichage d'un loader
    contentArea.innerHTML = `
        <div class="d-flex justify-content-center mt-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

    // Appeler la vue correspondante
    switch (viewName) {
        case 'dashboard': initDashboardView(); break;
        case 'ambulances': initAmbulancesView(); break;
        case 'chauffeurs': initChauffeursView(); break;
        case 'interventions':
            contentArea.innerHTML = `<h2>${translate('interventions_list') || 'Interventions'}</h2><p>Vue en construction.</p>`;
            break;
        case 'hopitaux':
            contentArea.innerHTML = `<h2>${translate('hopitaux_list') || 'Hôpitaux'}</h2><p>Vue en construction.</p>`;
            break;
        case 'patients':
            contentArea.innerHTML = `<h2>${translate('patients_list') || 'Patients transportés'}</h2><p>Vue en construction.</p>`;
            break;
        default:
            contentArea.innerHTML = `<p>Vue non trouvée.</p>`;
    }
}

// -----------------------------------------------------------------------------
// 3. ÉCOUTEURS GLOBAUX
// -----------------------------------------------------------------------------
function setupEventListeners() {
    // Navigation sidebar
    const sidebar = document.getElementById('sidebar-menu');
    if (sidebar) {
        sidebar.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-view]');
            if (link) {
                e.preventDefault();
                navigateTo(link.dataset.view);
            }
        });
    }

    // Bouton logout
    setupLogoutListener();

    // Changement de langue
    const langSelector = document.getElementById('language-selector');
    if (langSelector) {
        langSelector.value = currentLang;
        langSelector.addEventListener('change', (e) => {
            applyLanguage(e.target.value);
            const session = loadSession();
            renderAppShell(session.email); // Re-rendu complet du shell
        });
    }

    // Écoute des événements personnalisés
    window.addEventListener('loginSuccess', init);
    window.addEventListener('logoutSuccess', init);
    window.addEventListener('langChange', () => navigateTo(currentView));
}

// -----------------------------------------------------------------------------
// 4. INITIALISATION DE L'APPLICATION
// -----------------------------------------------------------------------------
function init() {
    const session = loadSession();
    if (session?.isLoggedIn) {
        renderAppShell(session.email);
    } else {
        renderLoginView();
    }
}

// Démarrage
init();
