// assets/js/modules/i18n.js

export const translations = {
    fr: {
        'app_title': 'Gestion d\'Ambulances',
        'login_btn': 'Se Connecter',
        'logout_btn': 'Déconnexion',
        'dashboard': 'Tableau de Bord',
        'ambulances_list': 'Ambulances',
        'create_ambulance': 'Ajouter une Ambulance',
        'matricule_label': 'Matricule',
        'model_label': 'Modèle',
        'status_label': 'Statut',
        'save_btn': 'Enregistrer',
        'required_field': 'Ce champ est obligatoire.'
    },
    en: {
        'app_title': 'Ambulance Management',
        'login_btn': 'Login',
        'logout_btn': 'Logout',
        'dashboard': 'Dashboard',
        'ambulances_list': 'Ambulances',
        'create_ambulance': 'Add Ambulance',
        'matricule_label': 'Registration Plate',
        'model_label': 'Model',
        'status_label': 'Status',
        'save_btn': 'Save',
        'required_field': 'This field is required.'
    },
    ar: {
        'app_title': 'إدارة سيارات الإسعاف',
        'login_btn': 'تسجيل الدخول',
        'logout_btn': 'تسجيل الخروج',
        'dashboard': 'لوحة القيادة',
        'ambulances_list': 'سيارات الإسعاف',
        'create_ambulance': 'إضافة سيارة إسعاف',
        'matricule_label': 'الرقم التسلسلي',
        'model_label': 'الموديل',
        'status_label': 'الحالة',
        'save_btn': 'حفظ',
        'required_field': 'هذا الحقل إجباري.'
    }
};

export let currentLang = localStorage.getItem('appLanguage') || 'fr';

export function translate(key) {
    return translations[currentLang][key] || key;
}

export function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLanguage', lang);
    
    const dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.getAttribute('data-i18n-key');
        el.textContent = translate(key);
    });
    
    document.title = translate('app_title');

    window.dispatchEvent(new CustomEvent('langChange', { detail: { lang } }));
}

// Initialisation au chargement
applyLanguage(currentLang);
