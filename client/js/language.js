// ========== GESTION GLOBALE DE LA LANGUE ==========

let currentLanguage = 'fr';

// Charger la langue sauvegardée
function loadSavedLanguage() {
    const savedLanguage = localStorage.getItem('userLanguage');
    const userPreferences = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (savedLanguage) {
        return savedLanguage;
    } else if (userPreferences?.preferences?.language) {
        return userPreferences.preferences.language;
    } else {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('ar')) return 'ar';
        if (browserLang.startsWith('en')) return 'en';
        return 'fr';
    }
}

// Changer la langue
function changeLanguage(lang) {
    if (lang === currentLanguage) return;
    
    if (!translations[lang]) {
        console.error('Language not supported:', lang);
        return;
    }
    
    const confirmMessage = getTranslation(currentLanguage, 'confirmLanguage');
    
    if (confirm(confirmMessage)) {
        currentLanguage = lang;
        localStorage.setItem('userLanguage', lang);
        updateUserLanguagePreference(lang);
        applyTranslationsToAllPages(lang);
        updateTextDirection(lang);
        showAlert(getTranslation(lang, 'languageChanged'), 'success');
        
        setTimeout(() => {
            location.reload();
        }, 1000);
    } else {
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) languageSelect.value = currentLanguage;
    }
}

// Obtenir une traduction
function getTranslation(lang, key) {
    return translations[lang]?.[key] || translations.fr[key] || key;
}

// Mettre à jour la préférence de langue
function updateUserLanguagePreference(lang) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (currentUser && Object.keys(currentUser).length > 0) {
        if (!currentUser.preferences) currentUser.preferences = {};
        currentUser.preferences.language = lang;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateLanguageInUsersList(currentUser.id, lang);
    }
}

function updateLanguageInUsersList(userId, lang) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.id == userId);
    
    if (userIndex > -1) {
        if (!users[userIndex].preferences) users[userIndex].preferences = {};
        users[userIndex].preferences.language = lang;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Appliquer les traductions à toutes les pages
function applyTranslationsToAllPages(lang) {
    const translation = translations[lang];
    translateCommonElements(translation);
    
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        translateHomePage(translation);
    } else if (path.includes('login.html')) {
        translateLoginPage(translation);
    } else if (path.includes('signup.html')) {
        translateSignupPage(translation);
    } else if (path.includes('dashboard.html')) {
        translateDashboardPage(translation);
    }
}

// Traduire les éléments communs
function translateCommonElements(translation) {
    const elements = {
        'header h1': translation.siteTitle,
        '.tagline': translation.siteTagline,
        'footer p:first-child': translation.copyright,
        'footer p:last-child': translation.certified
    };
    
    Object.entries(elements).forEach(([selector, text]) => {
        const element = document.querySelector(selector);
        if (element && !element.querySelector('.logo')) {
            element.textContent = text;
        }
    });
    
    // Boutons communs
    document.querySelectorAll('.btn-back').forEach(btn => {
        if (btn.textContent.includes('←')) btn.textContent = translation.back;
    });
}

// Traduire la page d'accueil
function translateHomePage(translation) {
    const elements = {
        '.hero h2': translation.heroTitle,
        '.hero p': translation.heroDescription,
        '.btn-urgent': translation.urgentButton,
        '.btn-secondary': translation.createAccount,
        '.btn-info': translation.loginButton,
        '.services h2': translation.servicesTitle,
        '.contact-info h2': translation.contactTitle
    };
    
    Object.entries(elements).forEach(([selector, text]) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = text;
    });
    
    // Services
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length >= 3) {
        const services = [
            {
                title: translation.emergencyService,
                desc: translation.emergencyDesc,
                button: translation.emergencyButton
            },
            {
                title: translation.transportService,
                desc: translation.transportDesc,
                button: translation.transportButton
            },
            {
                title: translation.doctorService,
                desc: translation.doctorDesc,
                button: translation.doctorButton
            }
        ];
        
        serviceCards.forEach((card, index) => {
            card.querySelector('h3').textContent = services[index].title;
            card.querySelector('p').textContent = services[index].desc;
            card.querySelector('.btn-service').textContent = services[index].button;
        });
    }
}

// Traduire la page login
function translateLoginPage(translation) {
    const elements = {
        '.login-container h2': translation.loginTitle,
        '.subtitle': translation.loginSubtitle,
        'label[for="loginEmail"]': translation.emailLabel,
        'label[for="loginPassword"]': translation.passwordLabel,
        '#loginEmail': translation.emailPlaceholder,
        '#loginPassword': translation.passwordPlaceholder,
        '.forgot-password': translation.forgotPassword,
        '.btn-login': translation.loginSubmit,
        '.divider span': translation.or,
        '.register-link': `${translation.noAccount} <a href="signup.html">${translation.createAccountLink}</a>`
    };
    
    Object.entries(elements).forEach(([selector, text]) => {
        const element = document.querySelector(selector);
        if (element) {
            if (selector.includes('label[') || selector.includes('.register-link')) {
                element.innerHTML = text;
            } else if (selector.startsWith('#')) {
                element.placeholder = text;
            } else {
                element.textContent = text;
            }
        }
    });
    
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) googleBtn.innerHTML = `<span>G</span> ${translation.googleLogin}`;
}

// Traduire la page signup
function translateSignupPage(translation) {
    const elements = {
        '.signup-container h2': translation.signupTitle,
        '.subtitle': translation.signupSubtitle,
        'label[for="fullName"]': translation.fullName,
        'label[for="email"]': translation.emailLabel,
        'label[for="phone"]': translation.phoneLabel,
        'label[for="password"]': translation.passwordLabel,
        'label[for="confirmPassword"]': translation.confirmPassword,
        '#fullName': translation.fullNamePlaceholder,
        '#email': translation.emailPlaceholder,
        '#phone': translation.phonePlaceholder,
        '#password': translation.passwordPlaceholder,
        '#confirmPassword': translation.confirmPlaceholder,
        '.btn-signup': translation.signupSubmit,
        '.login-link': `${translation.alreadyAccount} <a href="login.html">${translation.loginLink}</a>`
    };
    
    Object.entries(elements).forEach(([selector, text]) => {
        const element = document.querySelector(selector);
        if (element) {
            if (selector.includes('label[') || selector.includes('.login-link') || selector.includes('.terms')) {
                element.innerHTML = text;
            } else if (selector.startsWith('#')) {
                element.placeholder = text;
            } else {
                element.textContent = text;
            }
        }
    });
    
    const termsLabel = document.querySelector('.terms label');
    if (termsLabel) termsLabel.innerHTML = translation.terms;
}

// Traduire la page dashboard
function translateDashboardPage(translation) {
    // Welcome message
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) {
        const userName = welcomeMsg.querySelector('#userName')?.textContent || 'Client';
        welcomeMsg.innerHTML = `${translation.welcome}, <span id="userName">${userName}</span> !`;
    }
    
    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    const navTexts = [
        translation.navHome,
        translation.navServices,
        translation.navHistory,
        translation.navProfile,
        translation.navContact
    ];
    
    navButtons.forEach((btn, index) => {
        if (index < navTexts.length) btn.innerHTML = navTexts[index];
    });
    
    // Sections spécifiques
    translateDashboardHome(translation);
    translateDashboardServices(translation);
    translateDashboardHistory(translation);
    translateDashboardProfile(translation);
    translateDashboardContact(translation);
}

// Traduire section Accueil dashboard
function translateDashboardHome(translation) {
    const elements = {
        '#home h2': translation.dashboardTitle,
        '#home p': translation.dashboardSubtitle,
        '.recent-requests h3': translation.recentRequests
    };
    
    Object.entries(elements).forEach(([selector, text]) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = text;
    });
    
    // Boutons d'urgence
    const emergencyBtns = document.querySelectorAll('.btn-emergency .text');
    if (emergencyBtns.length >= 3) {
        emergencyBtns[0].textContent = translation.urgentVital;
        emergencyBtns[1].textContent = translation.medicalTransport;
        emergencyBtns[2].textContent = translation.homeDoctor;
    }
    
    const subtexts = document.querySelectorAll('.btn-emergency .subtext');
    if (subtexts.length >= 3) {
        subtexts[0].textContent = translation.urgentSub;
        subtexts[1].textContent = translation.transportSub;
        subtexts[2].textContent = translation.doctorSub;
    }
    
    // Tableau
    const headers = document.querySelectorAll('#home table th');
    const headerTexts = [translation.tableDate, translation.tableService, translation.tableStatus, translation.tableAction];
    headers.forEach((header, index) => {
        if (index < headerTexts.length) header.textContent = headerTexts[index];
    });
    
    document.querySelectorAll('.btn-track').forEach(btn => {
        if (btn.textContent.includes('Suivre')) btn.textContent = translation.track;
    });
    
    document.querySelectorAll('.btn-details').forEach(btn => {
        if (btn.textContent.includes('Détails')) btn.textContent = translation.details;
    });
}

// Traduire section Services dashboard
function translateDashboardServices(translation) {
    const elements = {
        '#services h2': translation.servicesDashboardTitle
    };
    
    Object.entries(elements).forEach(([selector, text]) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = text;
    });
    
    const serviceDetails = document.querySelectorAll('.service-detail');
    if (serviceDetails.length >= 3) {
        const services = [
            {
                title: translation.emergencyDetailTitle,
                desc: translation.emergencyDetailDesc,
                button: translation.requestEmergency
            },
            {
                title: translation.transportDetailTitle,
                desc: translation.transportDetailDesc,
                button: translation.requestTransport
            },
            {
                title: translation.consultationDetailTitle,
                desc: translation.consultationDetailDesc,
                button: translation.requestConsultation
            }
        ];
        
        serviceDetails.forEach((detail, index) => {
            detail.querySelector('h3').textContent = services[index].title;
            detail.querySelector('.service-description').textContent = services[index].desc;
            detail.querySelector('.btn-request').textContent = services[index].button;
        });
    }
}

// Traduire section Historique dashboard
function translateDashboardHistory(translation) {
    const elements = {
        '#history h2': translation.historyTitle
    };
    
    Object.entries(elements).forEach(([selector, text]) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = text;
    });
    
    const filterBtns = document.querySelectorAll('.filter-btn');
    const filterTexts = [translation.all, translation.emergencies, translation.transports, translation.doctors];
    filterBtns.forEach((btn, index) => {
        if (index < filterTexts.length) btn.textContent = filterTexts[index];
    });
    
    document.querySelectorAll('.btn-review').forEach(btn => {
        if (btn.textContent.includes('Noter')) btn.textContent = translation.rate;
    });
}

// Traduire section Profil dashboard
function translateDashboardProfile(translation) {
    const sections = [
        { selector: '#profile h3:first-child', text: `<span>📋</span> ${translation.personalInfo}` },
        { selector: '#profile .profile-edit h3', text: `<span>✏️</span> ${translation.editInfo}` },
        { selector: '#profile .account-settings h3', text: `<span>⚙️</span> ${translation.accountSettings}` },
        { selector: '#profile .danger-zone h3', text: `<span>⚠️</span> ${translation.dangerZone}` }
    ];
    
    sections.forEach(section => {
        const element = document.querySelector(section.selector);
        if (element) element.innerHTML = section.text;
    });
    
    const labels = [
        { selector: '.info-label:nth-child(1)', text: `<span>👤</span> ${translation.fullNameLabel}` },
        { selector: '.info-label:nth-child(2)', text: `<span>📱</span> ${translation.phoneLabelForm}` },
        { selector: '.info-label:nth-child(3)', text: `<span>📍</span> ${translation.addressLabel}` }
    ];
    
    labels.forEach(label => {
        const element = document.querySelector(label.selector);
        if (element) element.innerHTML = label.text;
    });
    
    const addressTextarea = document.querySelector('#editAddress');
    if (addressTextarea) addressTextarea.placeholder = translation.addressPlaceholder;
    
    const buttons = [
        { selector: '.btn-save', text: `<span>💾</span> ${translation.saveChanges}` },
        { selector: '.btn-cancel', text: `<span>❌</span> ${translation.cancel}` }
    ];
    
    buttons.forEach(button => {
        const element = document.querySelector(button.selector);
        if (element) element.innerHTML = button.text;
    });
    
    const dangerWarning = document.querySelector('.danger-warning');
    if (dangerWarning) dangerWarning.textContent = translation.dangerWarning;
}

// Traduire section Contact dashboard
function translateDashboardContact(translation) {
    const elements = {
        '#contact h2': translation.contactDashboardTitle,
        '.contact-card:nth-child(1) h3': translation.emergency247,
        '.contact-card:nth-child(1) .btn-call': translation.callNow,
        '.contact-card:nth-child(2) h3': translation.whatsappTitle,
        '.contact-card:nth-child(2) .btn-whatsapp': translation.openWhatsapp,
        '.contact-card:nth-child(3) h3': translation.emailTitle,
        '.contact-card:nth-child(3) .btn-email': translation.sendEmail,
        '.contact-form-section h3': translation.contactFormTitle,
        '#contact .btn-send': translation.sendMessage
    };
    
    Object.entries(elements).forEach(([selector, text]) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = text;
    });
}

// Mettre à jour la direction du texte
function updateTextDirection(lang) {
    if (lang === 'ar') {
        document.body.style.direction = 'rtl';
        document.body.style.textAlign = 'right';
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
    } else {
        document.body.style.direction = 'ltr';
        document.body.style.textAlign = 'left';
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
    }
}

// Initialiser la langue
function initializeLanguage() {
    currentLanguage = loadSavedLanguage();
    
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) languageSelect.value = currentLanguage;
    
    const profileLanguageSelect = document.getElementById('profileLanguageSelect');
    if (profileLanguageSelect) profileLanguageSelect.value = currentLanguage;
    
    applyTranslationsToAllPages(currentLanguage);
    updateTextDirection(currentLanguage);
    
    return currentLanguage;
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', initializeLanguage);

// Exposer la fonction globalement
window.changeLanguage = changeLanguage;