
// Validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^(\+212|0)[5-7]\d{8}$/.test(phone.replace(/\s/g, ''));
}

function validateSignupData(formData) {
    if (formData.fullName.length < 3) {
        showAlert("Le nom doit contenir au moins 3 caractères", "error");
        return false;
    }
    
    if (!validateEmail(formData.email)) {
        showAlert("Format d'email invalide", "error");
        return false;
    }
    
    if (!validatePhone(formData.phone)) {
        showAlert("Numéro de téléphone invalide (ex: +212 6XX XXX XXX)", "error");
        return false;
    }
    
    if (formData.password.length < 8) {
        showAlert("Le mot de passe doit contenir au moins 8 caractères", "error");
        return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
        showAlert("Les mots de passe ne correspondent pas", "error");
        return false;
    }
    
    return true;
}

// Alertes
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    
    // Vérifier si le message contient du HTML
    if (message.includes('<') && message.includes('>')) {
        alertDiv.innerHTML = message;
    } else {
        alertDiv.textContent = message;
    }
    
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    const colors = {
        'success': 'linear-gradient(135deg, #27ae60, #219653)',
        'error': 'linear-gradient(135deg, #e74c3c, #c0392b)',
        'info': 'linear-gradient(135deg, #3498db, #2980b9)',
        'warning': 'linear-gradient(135deg, #f39c12, #d68910)'
    };
    
    alertDiv.style.background = colors[type] || colors.info;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(alertDiv);
        }, 300);
    }, 4000);
}

// Formatage de date
function formatDate(dateString) {
    if (!dateString) return 'Jamais';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })}`;
        } else if (diffDays === 1) {
            return `Hier à ${date.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })}`;
        } else if (diffDays < 7) {
            return `Il y a ${diffDays} jours`;
        } else {
            return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    } catch (e) {
        return dateString || 'Date inconnue';
    }
}

// ========== GESTION UTILISATEURS ==========

// Sauvegarder utilisateur
function saveUserToStorage(userData) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUserIndex = users.findIndex(user => user.email === userData.email);
    
    if (existingUserIndex > -1) {
        users[existingUserIndex] = userData;
    } else {
        users.push(userData);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('userEmail', userData.email);
}

// Mettre à jour utilisateur
function updateUserInStorage(updatedUser) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.id === updatedUser.id);
    
    if (userIndex > -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Authentifier utilisateur
function authenticateUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(user => user.email === email && user.password === password);
}

// ========== FORMULAIRES ==========

// Inscription
document.getElementById('signupForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
    
    if (!validateSignupData(formData)) return;
    
    const userData = {
        id: Date.now(),
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null,
        requests: [],
        preferences: {
            notifications: true,
            smsAlerts: true,
            language: 'fr'
        }
    };
    
    saveUserToStorage(userData);
    showAlert('Inscription réussie ! Redirection...', 'success');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
});

// Connexion
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const user = authenticateUser(email, password);
    
    if (user) {
        user.lastLogin = new Date().toISOString();
        updateUserInStorage(user);
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('currentUserId', user.id);
        
        showAlert('Connexion réussie !', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        showAlert(' Email ou mot de passe incorrect', 'error');
    }
});

// Profil
document.getElementById('profileForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('editName').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        address: document.getElementById('editAddress').value.trim()
    };
    
    if (!formData.name || !formData.email) {
        showAlert('Le nom et l\'email sont requis', 'error');
        return;
    }
    
    if (!validateEmail(formData.email)) {
        showAlert('Email invalide', 'error');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    currentUser.name = formData.name;
    currentUser.email = formData.email;
    currentUser.phone = formData.phone;
    currentUser.address = formData.address;
    currentUser.updatedAt = new Date().toISOString();
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserInStorage(currentUser);
    
    updateProfileDisplay(currentUser);
    showAlert('Profil mis à jour avec succès !', 'success');
    updateLastModifiedDate();
});

// Contact
document.getElementById('contactForm')?.addEventListener('submit', function(e){
    e.preventDefault();
    
    const message = document.getElementById('contactMessage').value;
    
    if(!message.trim()){
        showAlert("Veuillez écrire un message", "error");
        return;
    }
    
    showAlert("Message envoyé ! Nous vous répondrons sous 24h.", "success");
    document.getElementById('contactForm').reset();
});

// ========== PROFIL UTILISATEUR ==========

// Charger les données du profil
function loadProfileData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser || Object.keys(currentUser).length === 0) {
        showAlert('Veuillez vous reconnecter', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    updateProfileDisplay(currentUser);
    updateProfileDates(currentUser);
    populateEditForm(currentUser);
}

// Mettre à jour l'affichage du profil
function updateProfileDisplay(userData) {
    // Header
    const profileNameElement = document.getElementById('profileName');
    const profileEmailElement = document.getElementById('profileEmail');
    const userNameElements = document.querySelectorAll('#userName');
    
    if (profileNameElement) profileNameElement.textContent = userData.name || 'Utilisateur';
    if (profileEmailElement) profileEmailElement.textContent = userData.email || 'Non spécifié';
    
    userNameElements.forEach(element => {
        if (userData.name) {
            const firstName = userData.name.split(' ')[0];
            element.textContent = firstName;
        }
    });
    
    // Informations
    const elements = {
        'profileNameDisplay': userData.name || 'Non spécifié',
        'profilePhone': userData.phone || 'Non spécifié',
        'profileAddress': userData.address || 'Non spécifiée'
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
    
    // ID Client
    generateClientId(userData);
}

// Générer ID client
function generateClientId(userData) {
    if (!userData.createdAt) return;
    
    try {
        const date = new Date(userData.createdAt);
        const year = date.getFullYear();
        const idNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const clientId = `CLT-${year}-${idNumber}`;
        
        const clientIdElements = document.querySelectorAll('.info-value');
        clientIdElements.forEach(element => {
            if (element.previousElementSibling?.textContent.includes('ID Client')) {
                element.textContent = clientId;
            }
        });
        
        if (userData) {
            userData.clientId = clientId;
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }
    } catch (e) {
        console.log('Error generating client ID:', e);
    }
}

// Mettre à jour les dates
function updateProfileDates(userData) {
    const elements = {
        'profileJoinDate': userData.createdAt,
        'profileLastLogin': userData.lastLogin
    };
    
    Object.entries(elements).forEach(([id, date]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = formatDate(date);
    });
}

// Pré-remplir formulaire
function populateEditForm(userData) {
    const fields = {
        'editName': userData.name || '',
        'editEmail': userData.email || '',
        'editPhone': userData.phone || '',
        'editAddress': userData.address || ''
    };
    
    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
    });
}

// Mettre à jour dernière modification
function updateLastModifiedDate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const elements = document.querySelectorAll('.info-value');
    elements.forEach(element => {
        if (element.previousElementSibling?.textContent.includes('Dernière connexion') ||
            element.previousElementSibling?.textContent.includes('Dernière modification')) {
            element.textContent = `Aujourd'hui à ${timeString}`;
        }
    });
}

// ========== NAVIGATION ==========

function showSection(sectionId) {
    // Cacher toutes les sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Afficher la section demandée
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Mettre à jour les boutons actifs
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn => 
        btn.textContent.includes(getButtonText(sectionId))
    );
    if (activeBtn) activeBtn.classList.add('active');
    
    // Charger les données spécifiques de la section
    switch(sectionId) {
        case 'home':
            updateDashboardDisplay();
            break;
        case 'history':
            initializeHistory();
            break;
        case 'profile':
            loadProfileData();
            break;
    }
}

function getButtonText(sectionId) {
    const map = {
        'home': 'Accueil',
        'services': 'Services',
        'history': 'Historique',
        'profile': 'Profil',
        'contact': 'Contact'
    };
    return map[sectionId] || '';
}

// ========== SERVICES ==========

let currentRequestType = null;

// Ouvrir le formulaire de demande
function openRequestForm(type) {
    currentRequestType = type;
    
    const titles = {
        'urgent': 'DEMANDE D\'URGENCE VITALE',
        'transport': 'DEMANDE DE TRANSPORT MÉDICAL',
        'doctor': 'DEMANDE DE MÉDECIN À DOMICILE'
    };
    
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = titles[type] || 'DEMANDE DE SERVICE';
    
    const formContent = document.getElementById('formContent');
    if (formContent) formContent.innerHTML = generateFormByType(type);
    
    const modal = document.getElementById('requestModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    initializeFormEvents();
    prefillAddress();
    
    // Focus sur le premier champ
    setTimeout(() => {
        const firstInput = formContent.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
    }, 100);
}

// Fermer le formulaire
function closeRequestForm() {
    const modal = document.getElementById('requestModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    currentRequestType = null;
    
    const requestForm = document.getElementById('requestForm');
    if (requestForm) requestForm.reset();
    
    const formContent = document.getElementById('formContent');
    if (formContent) formContent.innerHTML = '';
}

// Générer le formulaire selon le type
function generateFormByType(type) {
    const forms = {
        'urgent': generateUrgentForm(),
        'transport': generateTransportForm(),
        'doctor': generateDoctorForm()
    };
    
    return forms[type] || '<p>Type de service non reconnu</p>';
}

// Formulaire pour Urgence Vitale
function generateUrgentForm() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    return `
        <div class="form-group">
            <label class="required">Numéro de contact</label>
            <input type="tel" id="emergencyPhone" placeholder="+212 6XX XXX XXX" required>
        </div>
        
        <div class="form-group">
            <label class="required">Adresse de l'urgence</label>
            <textarea id="emergencyAddress" rows="3" placeholder="Adresse complète de l'urgence..." required></textarea>
        </div>
        
        <div class="form-group">
            <label class="required">Type de problème</label>
            <select id="problemType" required>
                <option value="">Sélectionnez le type de problème</option>
                <option value="accident">Accident de la route</option>
                <option value="heart">Problème cardiaque</option>
                <option value="stroke">AVC / Accident vasculaire</option>
                <option value="breathing">Difficultés respiratoires</option>
                <option value="bleeding">Hémorragie / Saignement</option>
                <option value="fall">Chute / Traumatisme</option>
                <option value="burn">Brûlure</option>
                <option value="poisoning">Intoxication / Empoisonnement</option>
                <option value="other">Autre urgence</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Description détaillée</label>
            <textarea id="emergencyDescription" rows="4" placeholder="Décrivez la situation en détail..." maxlength="500"></textarea>
            <div class="char-counter" id="descCounter">0/500 caractères</div>
        </div>
        
        <div class="form-group">
            <label>Nombre de personnes concernées</label>
            <input type="number" id="affectedPeople" min="1" max="10" value="1">
        </div>
        
        <div class="form-group">
            <label>Niveau d'urgence</label>
            <div class="urgency-level">
                <div class="urgency-option">
                    <input type="radio" id="urgency-high" name="urgency" value="high" checked>
                    <label for="urgency-high">Très urgent</label>
                </div>
                <div class="urgency-option">
                    <input type="radio" id="urgency-medium" name="urgency" value="medium">
                    <label for="urgency-medium">Urgent</label>
                </div>
                <div class="urgency-option">
                    <input type="radio" id="urgency-low" name="urgency" value="low">
                    <label for="urgency-low">Peu urgent</label>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label>Hôpital préféré (optionnel)</label>
            <input type="text" id="preferredHospital" placeholder="Nom de l'hôpital...">
        </div>
    `;
}

// Formulaire pour Transport Médical
function generateTransportForm() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    const maxDate = tomorrow.toISOString().split('T')[0];
    
    return `
        <div class="form-group">
            <div class="use-saved-address">
                <input type="checkbox" id="useSavedPickup">
                <label for="useSavedPickup">Utiliser mon adresse enregistrée</label>
            </div>
            <label class="required">Adresse de prise en charge</label>
            <textarea id="pickupAddress" rows="3" placeholder="Adresse de départ..." required></textarea>
        </div>
        
        <div class="form-group">
            <label class="required">Destination</label>
            <select id="destinationType" required>
                <option value="">Type de destination</option>
                <option value="hospital">Hôpital</option>
                <option value="clinic">Clinique</option>
                <option value="center">Centre de spécialité</option>
                <option value="home">Domicile</option>
                <option value="other">Autre</option>
            </select>
            <input type="text" id="destinationDetails" placeholder="Nom de l'établissement..." style="margin-top: 0.5rem;">
        </div>
        
        <div class="form-group">
            <label class="required">Date et heure souhaitées</label>
            <div class="time-input" style="display: flex; gap: 10px;">
                <input type="date" id="transportDate" min="${today}" max="${maxDate}" required style="flex: 1;">
                <input type="time" id="transportTime" required style="flex: 1;">
            </div>
        </div>
        
        <div class="form-group">
            <label class="required">Type de patient</label>
            <select id="patientType" required>
                <option value="">Sélectionnez le type de patient</option>
                <option value="adult">Adulte</option>
                <option value="elderly">Personne à mobilité réduite</option>
                <option value="child">Enfant</option>
                <option value="pregnant">Femme enceinte</option>
                <option value="disabled">Personne handicapée</option>
                <option value="bedridden">Patient alité</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Équipement médical requis</label>
            <div class="equipment-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px;">
                <div class="equipment-checkbox" style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="equip-oxygen" value="oxygène">
                    <label for="equip-oxygen" style="font-size: 14px;">Oxygène</label>
                </div>
                <div class="equipment-checkbox" style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="equip-stretcher" value="brancard">
                    <label for="equip-stretcher" style="font-size: 14px;">Brancard</label>
                </div>
                <div class="equipment-checkbox" style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="equip-wheelchair" value="fauteuil">
                    <label for="equip-wheelchair" style="font-size: 14px;">Fauteuil roulant</label>
                </div>
                <div class="equipment-checkbox" style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="equip-monitor" value="monitoring">
                    <label for="equip-monitor" style="font-size: 14px;">Monitoring</label>
                </div>
                <div class="equipment-checkbox" style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="equip-drip" value="perfusion">
                    <label for="equip-drip" style="font-size: 14px;">Perfusion</label>
                </div>
                <div class="equipment-checkbox" style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="equip-none" value="aucun">
                    <label for="equip-none" style="font-size: 14px;">Aucun équipement</label>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label>Informations supplémentaires</label>
            <textarea id="transportNotes" rows="3" placeholder="Informations sur l'état du patient, besoins spécifiques..."></textarea>
        </div>
    `;
}

// Formulaire pour Médecin à Domicile
function generateDoctorForm() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    const maxDate = tomorrow.toISOString().split('T')[0];
    
    return `
        <div class="form-group">
            <div class="use-saved-address">
                <input type="checkbox" id="useSavedConsultation">
                <label for="useSavedConsultation">Utiliser mon adresse enregistrée</label>
            </div>
            <label class="required">Adresse de consultation</label>
            <textarea id="consultationAddress" rows="3" placeholder="Adresse où le médecin doit se rendre..." required></textarea>
        </div>
        
        <div class="form-group">
            <label class="required">Disponibilité</label>
            <div class="time-input" style="display: flex; gap: 10px;">
                <input type="date" id="consultationDate" min="${today}" max="${maxDate}" required style="flex: 1;">
                <input type="time" id="consultationTime" required style="flex: 1;">
            </div>
        </div>
        
        <div class="form-group">
            <label class="required">Type de consultation</label>
            <select id="consultationType" required>
                <option value="">Type de consultation</option>
                <option value="general">Médecin généraliste</option>
                <option value="pediatric">Pédiatre</option>
                <option value="geriatric">Gériatre</option>
                <option value="cardiology">Cardiologue</option>
                <option value="emergency">Médecin d'urgence</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Symptômes principaux</label>
            <div class="symptoms-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px;">
                <div class="symptom-checkbox" style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="symptom-fever" value="fièvre">
                    <label for="symptom-fever" style="font-size: 14px;">Fièvre</label>
                </div>
                <div class="symptom-checkbox" style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="symptom-cough" value="toux">
                    <label for="symptom-cough" style="font-size: 14px;">Toux</label>
                </div>
                <div class="symptom-checkbox" style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="symptom-pain" value="douleurs">
                    <label for="symptom-pain" style="font-size: 14px;">Douleurs</label>
                </div>
                <div class="symptom-checkbox" style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="symptom-nausea" value="nausées">
                    <label for="symptom-nausea" style="font-size: 14px;">Nausées</label>
                </div>
                <div class="symptom-checkbox" style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="symptom-fatigue" value="fatigue">
                    <label for="symptom-fatigue" style="font-size: 14px;">Fatigue</label>
                </div>
                <div class="symptom-checkbox" style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="symptom-breathing" value="respiration">
                    <label for="symptom-breathing" style="font-size: 14px;">Respiration</label>
                </div>
                <div class="symptom-checkbox" style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="symptom-digestive" value="digestif">
                    <label for="symptom-digestive" style="font-size: 14px;">Digestif</label>
                </div>
                <div class="symptom-checkbox" style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="symptom-other" value="autre">
                    <label for="symptom-other" style="font-size: 14px;">Autre</label>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label>Nombre de patients</label>
            <input type="number" id="patientCount" min="1" max="5" value="1">
        </div>
        
        <div class="form-group">
            <label>Description des symptômes</label>
            <textarea id="symptomDescription" rows="4" placeholder="Décrivez les symptômes en détail..." maxlength="500"></textarea>
            <div class="char-counter" id="symptomCounter">0/500 caractères</div>
        </div>
        
        <div class="form-group">
            <label>Médicaments actuels (optionnel)</label>
            <textarea id="currentMedication" rows="2" placeholder="Liste des médicaments pris actuellement..."></textarea>
        </div>
        
        <div class="form-group">
            <label>Antécédents médicaux (optionnel)</label>
            <textarea id="medicalHistory" rows="2" placeholder="Maladies chroniques, allergies..."></textarea>
        </div>
    `;
}

// Initialiser les événements du formulaire
function initializeFormEvents() {
    // Compteur de caractères
    const descTextarea = document.getElementById('emergencyDescription') || 
                        document.getElementById('symptomDescription');
    const counterDiv = document.getElementById('descCounter') || 
                      document.getElementById('symptomCounter');
    
    if (descTextarea && counterDiv) {
        descTextarea.addEventListener('input', function() {
            const length = this.value.length;
            counterDiv.textContent = `${length}/500 caractères`;
            
            if (length > 450) {
                counterDiv.style.color = '#f39c12';
            } else if (length > 500) {
                counterDiv.style.color = '#e74c3c';
            } else {
                counterDiv.style.color = '#95a5a6';
            }
        });
    }
    
    // Utiliser l'adresse enregistrée
    const useSavedCheckbox = document.getElementById('useSavedPickup') || 
                            document.getElementById('useSavedConsultation');
    const addressTextarea = document.getElementById('pickupAddress') || 
                           document.getElementById('consultationAddress');
    
    if (useSavedCheckbox && addressTextarea) {
        useSavedCheckbox.addEventListener('change', function() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (this.checked && currentUser.address) {
                addressTextarea.value = currentUser.address;
                addressTextarea.readOnly = true;
            } else {
                addressTextarea.value = '';
                addressTextarea.readOnly = false;
            }
        });
    }
    
    // Validation en temps réel
    const form = document.getElementById('requestForm');
    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    }
    
    // Définir la date minimale sur aujourd'hui
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        const today = new Date().toISOString().split('T')[0];
        if (!input.min) {
            input.min = today;
        }
    });
}

// Pré-remplir l'adresse
function prefillAddress() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (currentUser.address) {
        const addressFields = [
            'emergencyAddress',
            'pickupAddress',
            'consultationAddress'
        ];
        
        addressFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = currentUser.address;
            }
        });
        
        const phoneField = document.getElementById('emergencyPhone');
        if (phoneField && currentUser.phone) {
            phoneField.value = currentUser.phone;
        }
    }
}

// Validation d'un champ
function validateField(field) {
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    
    // Supprimer l'ancien message d'erreur
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    if (field.classList) {
        field.classList.remove('error');
    }
    
    // Validation selon le type de champ
    let isValid = true;
    let errorMessage = '';
    
    if (isRequired && !value) {
        isValid = false;
        errorMessage = 'Ce champ est requis';
    } else if (field.type === 'tel' && value && !validatePhone(value)) {
        isValid = false;
        errorMessage = 'Numéro de téléphone invalide';
    } else if (field.type === 'email' && value && !validateEmail(value)) {
        isValid = false;
        errorMessage = 'Email invalide';
    } else if (field.type === 'number' && field.min && parseInt(value) < parseInt(field.min)) {
        isValid = false;
        errorMessage = `La valeur minimum est ${field.min}`;
    } else if (field.type === 'number' && field.max && parseInt(value) > parseInt(field.max)) {
        isValid = false;
        errorMessage = `La valeur maximum est ${field.max}`;
    }
    
    if (!isValid && field.parentNode) {
        if (field.classList) {
            field.classList.add('error');
        }
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = 'color: #e74c3c; font-size: 0.85rem; margin-top: 0.3rem;';
        errorDiv.innerHTML = ` ${errorMessage}`;
        field.parentNode.appendChild(errorDiv);
    }
    
    return isValid;
}

// Collecter les données du formulaire
function collectFormData() {
    const requestData = {
        id: Date.now(),
        type: currentRequestType,
        serviceName: getServiceName(currentRequestType),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('fr-FR'),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
        estimatedTime: calculateEstimatedTime(currentRequestType),
        data: {}
    };
    
    switch(currentRequestType) {
        case 'urgent':
            requestData.data = {
                phone: document.getElementById('emergencyPhone')?.value || '',
                address: document.getElementById('emergencyAddress')?.value || '',
                problemType: document.getElementById('problemType')?.value || '',
                description: document.getElementById('emergencyDescription')?.value || '',
                affectedPeople: document.getElementById('affectedPeople')?.value || 1,
                urgency: document.querySelector('input[name="urgency"]:checked')?.value || 'high',
                hospital: document.getElementById('preferredHospital')?.value || ''
            };
            break;
            
        case 'transport':
            requestData.data = {
                pickupAddress: document.getElementById('pickupAddress')?.value || '',
                destinationType: document.getElementById('destinationType')?.value || '',
                destinationDetails: document.getElementById('destinationDetails')?.value || '',
                date: document.getElementById('transportDate')?.value || '',
                time: document.getElementById('transportTime')?.value || '',
                patientType: document.getElementById('patientType')?.value || '',
                equipment: getSelectedCheckboxes('equip-'),
                notes: document.getElementById('transportNotes')?.value || ''
            };
            break;
            
        case 'doctor':
            requestData.data = {
                address: document.getElementById('consultationAddress')?.value || '',
                date: document.getElementById('consultationDate')?.value || '',
                time: document.getElementById('consultationTime')?.value || '',
                consultationType: document.getElementById('consultationType')?.value || '',
                symptoms: getSelectedCheckboxes('symptom-'),
                patientCount: document.getElementById('patientCount')?.value || 1,
                description: document.getElementById('symptomDescription')?.value || '',
                medication: document.getElementById('currentMedication')?.value || '',
                history: document.getElementById('medicalHistory')?.value || ''
            };
            break;
    }
    
    return requestData;
}

// Soumettre le formulaire de demande
document.getElementById('requestForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Valider tous les champs
    let isValid = true;
    const form = this;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showAlert('Veuillez corriger les erreurs dans le formulaire', 'error');
        return;
    }
    
    // Collecter les données
    const requestData = collectFormData();
    
    // Désactiver le bouton de soumission
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = ' Envoi en cours...';
        
        // Simuler l'envoi
        setTimeout(() => {
            // Sauvegarder la demande
            saveRequestToHistory(requestData);
            
            // Réactiver le bouton
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
            // Fermer le formulaire
            closeRequestForm();
            
            // Afficher confirmation
            showAlert(` Demande de ${requestData.serviceName} envoyée avec succès !\n\nNotre équipe vous contactera dans les plus brefs délais.`, 'success');
            
            // Mettre à jour l'affichage
            updateDashboardDisplay();
            
        }, 1500);
    }
});

// Obtenir le nom du service
function getServiceName(type) {
    const names = {
        'urgent': 'Urgence Vitale',
        'transport': 'Transport Médical',
        'doctor': 'Médecin à Domicile'
    };
    return names[type] || 'Service';
}

// Obtenir les cases à cocher sélectionnées
function getSelectedCheckboxes(prefix) {
    const checkboxes = document.querySelectorAll(`input[id^="${prefix}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// Calculer le temps estimé
function calculateEstimatedTime(type) {
    const times = {
        'urgent': '10-15 minutes',
        'transport': '30-45 minutes',
        'doctor': '1-2 heures'
    };
    return times[type] || 'Variable';
}

// ========== GESTION DES DEMANDES ET HISTORIQUE ==========

// Sauvegarder la demande dans l'historique
function saveRequestToHistory(requestData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.requests) {
        currentUser.requests = [];
    }
    
    // Ajouter la nouvelle demande
    currentUser.requests.unshift(requestData);
    
    // Limiter à 50 demandes maximum
    if (currentUser.requests.length > 50) {
        currentUser.requests = currentUser.requests.slice(0, 50);
    }
    
    // Sauvegarder
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Mettre à jour l'affichage
    updateDashboardDisplay();
    
    return requestData.id;
}

// Mettre à jour l'affichage du dashboard
function updateDashboardDisplay() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const requests = currentUser.requests || [];
    
    // Mettre à jour les statistiques
    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'completed').length;
    const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'in-progress').length;
    
    // Mettre à jour les cartes de statistiques
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 3) {
        statNumbers[0].textContent = totalRequests;
        statNumbers[1].textContent = completedRequests;
        statNumbers[2].textContent = pendingRequests;
    }
    
    // Mettre à jour le tableau des demandes récentes
    updateRecentRequestsTable(requests.slice(0, 5));
}

// Mettre à jour le tableau des demandes récentes
function updateRecentRequestsTable(requests) {
    const tableBody = document.querySelector('#home table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (requests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #7f8c8d; padding: 2rem;">
                    Aucune demande pour le moment
                </td>
            </tr>
        `;
        return;
    }
    
    requests.forEach(request => {
        const row = document.createElement('tr');
        
        const dateStr = request.date || 'Date inconnue';
        const timeStr = request.time || '';
        
        const statusClass = request.status === 'completed' ? 'completed' : 
                          request.status === 'in-progress' ? 'in-progress' : 'pending';
        
        row.innerHTML = `
            <td>${dateStr} ${timeStr ? `<br><small>${timeStr}</small>` : ''}</td>
            <td>${request.serviceName}</td>
            <td><span class="status ${statusClass}">${getStatusText(request.status)}</span></td>
            <td style="display: flex; gap: 5px;">
                <button class="btn-track" onclick="trackRequest(${request.id})" style="
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                ">
                    Suivre
                </button>
                <button class="btn-details" onclick="viewRequestDetails(${request.id})" style="
                    background: #2ecc71;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                ">
                    Détails
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Obtenir le texte du statut
function getStatusText(status) {
    const texts = {
        'pending': 'En attente',
        'in-progress': 'En cours',
        'completed': 'Terminé',
        'cancelled': 'Annulé'
    };
    return texts[status] || status;
}

// ========== HISTORIQUE - NOUVEAU CODE CORRIGÉ ==========

// Initialiser l'historique
function initializeHistory() {
    console.log('Initialisation de l\'historique...');
    
    // Vérifier si la section historique existe
    const historySection = document.getElementById('history');
    if (!historySection) {
        console.error('Section historique non trouvée');
        return;
    }
    
    // Nettoyer la section
    historySection.innerHTML = '';
    
    // Créer la structure de l'historique
    const historyHTML = `
        <div class="history-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
            <h2 style="color: #2c3e50; margin-bottom: 25px; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">📜</span>
                Historique des Demandes
            </h2>
            
            <!-- Filtres -->
            <div class="filter-section" style="margin-bottom: 30px;">
                <h3 style="color: #34495e; margin-bottom: 15px; font-size: 16px;">Filtrer par type :</h3>
                <div class="filter-buttons" style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="filter-btn active" onclick="filterHistory('all')" style="
                        padding: 10px 20px;
                        border: none;
                        background: #3498db;
                        color: white;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: all 0.3s;
                    ">Toutes les demandes</button>
                    <button class="filter-btn" onclick="filterHistory('urgent')" style="
                        padding: 10px 20px;
                        border: none;
                        background: #ecf0f1;
                        color: #2c3e50;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: all 0.3s;
                    ">Urgences</button>
                    <button class="filter-btn" onclick="filterHistory('transport')" style="
                        padding: 10px 20px;
                        border: none;
                        background: #ecf0f1;
                        color: #2c3e50;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: all 0.3s;
                    ">Transports</button>
                    <button class="filter-btn" onclick="filterHistory('doctor')" style="
                        padding: 10px 20px;
                        border: none;
                        background: #ecf0f1;
                        color: #2c3e50;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: all 0.3s;
                    ">Médecins</button>
                </div>
            </div>
            
            <!-- Statistiques -->
            <div class="history-stats" style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            " id="historyStats">
                <!-- Les stats seront générées ici -->
            </div>
            
            <!-- Actions de suppression -->
            <div class="delete-actions" style="
                display: flex;
                gap: 15px;
                margin-bottom: 25px;
                justify-content: flex-end;
                flex-wrap: wrap;
            ">
                <button onclick="deleteCompletedRequests()" style="
                    padding: 10px 20px;
                    border: none;
                    background: #f39c12;
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s;
                ">
                    Supprimer les terminées
                </button>
                <button onclick="deleteAllRequests()" style="
                    padding: 10px 20px;
                    border: none;
                    background: #e74c3c;
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s;
                ">
                    Tout supprimer
                </button>
            </div>
            
            <!-- Liste des demandes -->
            <div class="history-list-container">
                <div class="history-list-header" style="
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    gap: 15px;
                    padding: 15px 20px;
                    background: #f8f9fa;
                    border-radius: 10px 10px 0 0;
                    border-bottom: 2px solid #e9ecef;
                    font-weight: 600;
                    color: #495057;
                ">
                    <div>Service & Détails</div>
                    <div>Date</div>
                    <div>Statut</div>
                    <div>Actions</div>
                </div>
                <div class="history-list" id="historyList" style="
                    background: white;
                    border-radius: 0 0 10px 10px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                ">
                    <!-- Les demandes seront affichées ici -->
                </div>
            </div>
            
            <!-- Message vide -->
            <div class="history-empty" id="historyEmpty" style="
                text-align: center;
                padding: 60px 20px;
                color: #95a5a6;
                display: none;
            ">
                <div style="font-size: 60px; margin-bottom: 20px; opacity: 0.5;"></div>
                <h3 style="margin-bottom: 10px; color: #7f8c8d;">Aucune demande trouvée</h3>
                <p style="margin-bottom: 25px;">Vos demandes apparaîtront ici après envoi</p>
                <button onclick="testHistory()" style="
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #3498db, #2980b9);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 15px;
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s;
                ">
                    Charger des données de test
                </button>
            </div>
        </div>
    `;
    
    historySection.innerHTML = historyHTML;
    
    // Mettre à jour l'affichage
    updateHistoryDisplay();
}

// Mettre à jour l'affichage de l'historique
function updateHistoryDisplay() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const requests = currentUser.requests || [];
    
    // Mettre à jour les statistiques
    updateHistoryStats(requests);
    
    // Filtrer les demandes
    const activeFilter = getActiveFilter();
    const filteredRequests = filterRequests(requests, activeFilter);
    
    // Mettre à jour la liste
    updateHistoryList(filteredRequests);
}

// Mettre à jour les statistiques
function updateHistoryStats(requests) {
    const statsContainer = document.getElementById('historyStats');
    if (!statsContainer) return;
    
    const stats = {
        total: requests.length,
        urgent: requests.filter(r => r.type === 'urgent').length,
        transport: requests.filter(r => r.type === 'transport').length,
        doctor: requests.filter(r => r.type === 'doctor').length,
        completed: requests.filter(r => r.status === 'completed').length,
        pending: requests.filter(r => r.status === 'pending' || r.status === 'in-progress').length
    };
    
    statsContainer.innerHTML = `
        <div class="stat-card" style="
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(52, 152, 219, 0.2);
        ">
            <div style="font-size: 36px; font-weight: 700; margin-bottom: 8px;">${stats.total}</div>
            <div style="font-size: 14px; opacity: 0.9;">Total des demandes</div>
        </div>
        
        <div class="stat-card" style="
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(231, 76, 60, 0.2);
        ">
            <div style="font-size: 36px; font-weight: 700; margin-bottom: 8px;">${stats.urgent}</div>
            <div style="font-size: 14px; opacity: 0.9;">Urgences</div>
        </div>
        
        <div class="stat-card" style="
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(46, 204, 113, 0.2);
        ">
            <div style="font-size: 36px; font-weight: 700; margin-bottom: 8px;">${stats.transport}</div>
            <div style="font-size: 14px; opacity: 0.9;">Transports</div>
        </div>
        
        <div class="stat-card" style="
            background: linear-gradient(135deg, #9b59b6, #8e44ad);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(155, 89, 182, 0.2);
        ">
            <div style="font-size: 36px; font-weight: 700; margin-bottom: 8px;">${stats.doctor}</div>
            <div style="font-size: 14px; opacity: 0.9;">Médecins</div>
        </div>
    `;
}

// Obtenir le filtre actif
function getActiveFilter() {
    const activeBtn = document.querySelector('.filter-btn.active');
    if (!activeBtn) return 'all';
    
    const text = activeBtn.textContent.toLowerCase();
    if (text.includes('toutes')) return 'all';
    if (text.includes('urgence')) return 'urgent';
    if (text.includes('transport')) return 'transport';
    if (text.includes('médecin')) return 'doctor';
    
    return 'all';
}

// Filtrer les demandes
function filterRequests(requests, filter) {
    if (filter === 'all') return requests;
    return requests.filter(request => request.type === filter);
}

// Mettre à jour la liste d'historique
function updateHistoryList(requests) {
    const historyList = document.getElementById('historyList');
    const historyEmpty = document.getElementById('historyEmpty');
    
    if (!historyList || !historyEmpty) return;
    
    // Vider la liste
    historyList.innerHTML = '';
    
    if (requests.length === 0) {
        historyList.style.display = 'none';
        historyEmpty.style.display = 'block';
        return;
    }
    
    historyList.style.display = 'block';
    historyEmpty.style.display = 'none';
    
    requests.forEach(request => {
        const historyItem = createHistoryItem(request);
        historyList.appendChild(historyItem);
    });
}

// Créer un élément d'historique
function createHistoryItem(request) {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.style.cssText = `
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 15px;
        padding: 20px;
        border-bottom: 1px solid #eee;
        align-items: center;
        transition: all 0.3s;
    `;
    
    item.onmouseenter = function() {
        this.style.background = '#f8f9fa';
    };
    
    item.onmouseleave = function() {
        this.style.background = 'white';
    };
    
    // Icône selon le type de service
    let serviceIcon = '🚑';
    if (request.type === 'transport') serviceIcon = '🚙';
    if (request.type === 'doctor') serviceIcon = '👨‍⚕️';
    
    // Statut
    const statusClass = request.status === 'completed' ? 'completed' : 
                       request.status === 'in-progress' ? 'in-progress' : 'pending';
    const statusText = getStatusText(request.status);
    
    // Adresse abrégée
    let addressPreview = '';
    if (request.data) {
        const address = request.data.address || request.data.pickupAddress || request.data.consultationAddress || '';
        if (address) {
            addressPreview = address.length > 30 ? address.substring(0, 30) + '...' : address;
        }
    }
    
    // Date formatée
    const dateObj = request.timestamp ? new Date(request.timestamp) : new Date();
    const formattedDate = dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    const formattedTime = dateObj.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    item.innerHTML = `
        <div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 24px;">${serviceIcon}</span>
                <div>
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 4px;">${request.serviceName}</div>
                    <div style="font-size: 13px; color: #7f8c8d;">ID: #${request.id}</div>
                </div>
            </div>
            ${addressPreview ? `
                <div style="font-size: 13px; color: #666; display: flex; align-items: center; gap: 6px;">
                    <span style="color: #3498db;">📍</span>
                    ${addressPreview}
                </div>
            ` : ''}
        </div>
        
        <div>
            <div style="font-weight: 500; color: #2c3e50;">${formattedDate}</div>
            <div style="font-size: 13px; color: #7f8c8d;">${formattedTime}</div>
        </div>
        
        <div>
            <span class="status ${statusClass}" style="
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
                display: inline-block;
            ">
                ${statusText}
            </span>
        </div>
        
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button onclick="viewRequestDetails(${request.id})" style="
                background: #3498db;
                color: white;
                border: none;
                padding: 8px 14px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.3s;
            ">
                Détails
            </button>
            <button onclick="deleteRequest(${request.id})" style="
                background: #e74c3c;
                color: white;
                border: none;
                padding: 8px 14px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.3s;
            ">
                Supprimer
            </button>
        </div>
    `;
    
    return item;
}

// Filtrer l'historique
function filterHistory(filter) {
    // Mettre à jour les boutons actifs
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '#ecf0f1';
        btn.style.color = '#2c3e50';
    });
    
    // Activer le bouton cliqué
    const activeBtn = event?.target || document.querySelector(`.filter-btn:nth-child(${
        filter === 'all' ? 1 : 
        filter === 'urgent' ? 2 : 
        filter === 'transport' ? 3 : 4
    })`);
    
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = '#3498db';
        activeBtn.style.color = 'white';
    }
    
    // Mettre à jour l'affichage
    updateHistoryDisplay();
    
    // Message informatif
    const filterNames = {
        'all': 'Toutes les demandes',
        'urgent': 'Urgences médicales',
        'transport': 'Transports médicaux',
        'doctor': 'Médecins à domicile'
    };
    
    showAlert(` Filtre : ${filterNames[filter] || filter}`, 'info');
}

// ========== FONCTIONS DE SUPPRESSION ==========

// Supprimer une demande
function deleteRequest(requestId) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette demande ?\nCette action est irréversible.")) {
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (currentUser.requests && currentUser.requests.length > 0) {
        const initialLength = currentUser.requests.length;
        currentUser.requests = currentUser.requests.filter(request => request.id != requestId);
        
        if (currentUser.requests.length < initialLength) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showAlert(' Demande supprimée avec succès !', 'success');
            
            // Mettre à jour les affichages
            updateDashboardDisplay();
            updateHistoryDisplay();
        } else {
            showAlert(' Demande non trouvée', 'error');
        }
    } else {
        showAlert(' Aucune demande à supprimer', 'error');
    }
}

// Supprimer toutes les demandes
function deleteAllRequests() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const requestCount = currentUser.requests?.length || 0;
    
    if (requestCount === 0) {
        showAlert(' Aucune demande à supprimer', 'info');
        return;
    }
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer TOUTES vos demandes (${requestCount}) ?\nCette action est irréversible et supprimera tout votre historique.`)) {
        return;
    }
    
    currentUser.requests = [];
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showAlert(` ${requestCount} demande(s) supprimée(s) avec succès !`, 'success');
    
    // Mettre à jour les affichages
    updateDashboardDisplay();
    updateHistoryDisplay();
}

// Supprimer les demandes terminées
function deleteCompletedRequests() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const completedRequests = currentUser.requests?.filter(r => r.status === 'completed') || [];
    
    if (completedRequests.length === 0) {
        showAlert('Aucune demande terminée à supprimer', 'info');
        return;
    }
    
    if (!confirm(`Voulez-vous supprimer ${completedRequests.length} demande(s) terminée(s) ?`)) {
        return;
    }
    
    currentUser.requests = currentUser.requests.filter(request => request.status !== 'completed');
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showAlert(` ${completedRequests.length} demande(s) terminée(s) supprimée(s) !`, 'success');
    
    // Mettre à jour les affichages
    updateDashboardDisplay();
    updateHistoryDisplay();
}

// ========== AUTRES FONCTIONS ==========

// Voir les détails d'une demande
function viewRequestDetails(requestId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const request = currentUser.requests?.find(r => r.id == requestId);
    
    if (!request) {
        showAlert('Demande non trouvée', 'error');
        return;
    }
    
    // Formater les détails
    let details = formatRequestDetails(request);
    
    // Afficher dans une alert
    showAlert(details, 'info');
}

// Formater les détails d'une demande
function formatRequestDetails(request) {
    let details = `
        <div style="text-align: left; font-family: Arial, sans-serif;">
            <h3 style="color: #2c3e50; margin-bottom: 20px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                 Détails de la demande #${request.id}
            </h3>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="color: #3498db; margin-top: 0; margin-bottom: 15px;">Informations générales</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #555; font-weight: 600; width: 40%;">Service :</td>
                        <td style="padding: 8px 0; color: #2c3e50;">${request.serviceName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #555; font-weight: 600;">Date :</td>
                        <td style="padding: 8px 0; color: #2c3e50;">${request.date} à ${request.time}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #555; font-weight: 600;">Statut :</td>
                        <td style="padding: 8px 0;">
                            <span style="
                                padding: 4px 12px;
                                border-radius: 15px;
                                font-size: 12px;
                                font-weight: bold;
                                background: ${request.status === 'completed' ? '#27ae60' : 
                                            request.status === 'in-progress' ? '#3498db' : '#f39c12'};
                                color: white;
                            ">
                                ${getStatusText(request.status)}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #555; font-weight: 600;">Temps estimé :</td>
                        <td style="padding: 8px 0; color: #2c3e50;">${request.estimatedTime}</td>
                    </tr>
                </table>
            </div>
    `;
    
    // Ajouter les détails spécifiques
    if (request.data) {
        details += `<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">`;
        details += `<h4 style="color: #3498db; margin-top: 0; margin-bottom: 15px;"> Informations spécifiques</h4>`;
        
        switch(request.type) {
            case 'urgent':
                details += `
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #555; font-weight: 600; width: 40%;">Téléphone :</td>
                            <td style="padding: 8px 0; color: #2c3e50;">${request.data.phone || 'Non spécifié'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #555; font-weight: 600;">Adresse :</td>
                            <td style="padding: 8px 0; color: #2c3e50;">${request.data.address || 'Non spécifié'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #555; font-weight: 600;">Type de problème :</td>
                            <td style="padding: 8px 0; color: #2c3e50;">${request.data.problemType || 'Non spécifié'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #555; font-weight: 600;">Personnes concernées :</td>
                            <td style="padding: 8px 0; color: #2c3e50;">${request.data.affectedPeople || 1}</td>
                        </tr>
                    </table>
                `;
                break;
                
            case 'transport':
                details += `
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #555; font-weight: 600; width: 40%;">Adresse de départ :</td>
                            <td style="padding: 8px 0; color: #2c3e50;">${request.data.pickupAddress || 'Non spécifié'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #555; font-weight: 600;">Destination :</td>
                            <td style="padding: 8px 0; color: #2c3e50;">${request.data.destinationDetails || 'Non spécifié'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #555; font-weight: 600;">Date prévue :</td>
                            <td style="padding: 8px 0; color: #2c3e50;">${request.data.date || 'Non spécifié'} à ${request.data.time || 'Non spécifié'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #555; font-weight: 600;">Type de patient :</td>
                            <td style="padding: 8px 0; color: #2c3e50;">${request.data.patientType || 'Non spécifié'}</td>
                        </tr>
                    </table>
                `;
                break;
                
            case 'doctor':
                details += `
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #555; font-weight: 600; width: 40%;">Adresse :</td>
                            <td style="padding: 8px 0; color: #2c3e50;">${request.data.address || 'Non spécifié'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #555; font-weight: 600;">Date prévue :</td>
                            <td style="padding: 8px 0; color: #2c3e50;">${request.data.date || 'Non spécifié'} à ${request.data.time || 'Non spécifié'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #555; font-weight: 600;">Type de consultation :</td>
                            <td style="padding: 8px 0; color: #2c3e50;">${request.data.consultationType || 'Non spécifié'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #555; font-weight: 600;">Nombre de patients :</td>
                            <td style="padding: 8px 0; color: #2c3e50;">${request.data.patientCount || 1}</td>
                        </tr>
                    </table>
                `;
                break;
        }
        
        details += `</div>`;
    }
    
    // Bouton de suppression
    details += `
        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: #856404;">Actions disponibles :</strong>
                    <p style="margin: 5px 0 0 0; color: #856404; font-size: 14px;">
                        Vous pouvez suivre, noter ou supprimer cette demande.
                    </p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="trackRequest(${request.id})" style="
                        background: #3498db;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 13px;
                        font-weight: 500;
                    ">
                        Suivre
                    </button>
                    ${request.status === 'completed' ? `
                        <button onclick="reviewService(${request.id})" style="
                            background: #f39c12;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 13px;
                            font-weight: 500;
                        ">
                            Noter
                        </button>
                    ` : ''}
                    <button onclick="deleteRequest(${request.id})" style="
                        background: #e74c3c;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 13px;
                        font-weight: 500;
                    ">
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    </div>`;
    
    return details;
}

// Noter un service
function reviewService(requestId) {
    const rating = prompt("Notez ce service (1 à 5 étoiles) :\n\n1 ⭐ - Très mauvais\n2 ⭐ - Mauvais\n3 ⭐ - Moyen\n4 ⭐ - Bon\n5 ⭐ - Excellent");
    
    if (rating && rating >= 1 && rating <= 5) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const requestIndex = currentUser.requests?.findIndex(r => r.id == requestId);
        
        if (requestIndex > -1) {
            currentUser.requests[requestIndex].rating = parseInt(rating);
            currentUser.requests[requestIndex].ratedAt = new Date().toISOString();
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showAlert(`Merci pour votre note de ${rating}/5 !`, 'success');
            updateHistoryDisplay();
        }
    }
}

// Suivre une demande
function trackRequest(requestId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const request = currentUser.requests?.find(r => r.id == requestId);
    
    if (!request) {
        showAlert('Demande non trouvée', 'error');
        return;
    }
    
    let trackingInfo = '';
    
    switch(request.status) {
        case 'pending':
            trackingInfo = `
                <div style="text-align: left;">
                    <strong style="color: #2c3e50; font-size: 16px;">Statut : En attente de prise en charge</strong><br><br>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 20px;"></span>
                        <span>Votre demande est en cours de traitement</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 20px;"></span>
                        <span>Notre équipe vous contactera sous peu</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 20px;"></span>
                        <span>Temps d'attente estimé : ${request.estimatedTime}</span>
                    </div>
                    <br>
                    <em style="color: #7f8c8d;">Merci de patienter...</em>
                </div>
            `;
            break;
            
        case 'in-progress':
            trackingInfo = `
                <div style="text-align: left;">
                    <strong style="color: #2c3e50; font-size: 16px;">Statut : En route vers vous</strong><br><br>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 20px; color: #27ae60;"></span>
                        <span>Demande confirmée</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 20px;"></span>
                        <span>Ambulance en route</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 20px;"></span>
                        <span>Arrivée estimée : 10-15 minutes</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 20px;"></span>
                        <span>Équipe médicale : Prête</span>
                    </div>
                    <br>
                    <em style="color: #e74c3c; font-weight: 500;">Restez à votre adresse indiquée</em>
                </div>
            `;
            break;
            
        case 'completed':
            trackingInfo = `
                <div style="text-align: left;">
                    <strong style="color: #2c3e50; font-size: 16px;">Statut : Service terminé</strong><br><br>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 20px; color: #27ae60;"></span>
                        <span>Mission accomplie</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 20px;"></span>
                        <span>Patient pris en charge</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 20px;"></span>
                        <span>${request.rating ? `Service noté : ${request.rating}/5` : 'Service pas encore noté'}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 20px;"></span>
                        <span>Détails disponibles dans l'historique</span>
                    </div>
                    <br>
                    <em style="color: #27ae60; font-weight: 500;">Merci de votre confiance !</em>
                </div>
            `;
            break;
    }
    
    showAlert(trackingInfo, 'info');
}

// ========== FONCTIONS DE TEST ==========

// Créer des données de test pour l'historique
function testHistory() {
    const testRequests = [
        {
            id: Date.now(),
            type: 'urgent',
            serviceName: 'Urgence Vitale',
            date: new Date().toLocaleDateString('fr-FR'),
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            status: 'completed',
            estimatedTime: '10-15 minutes',
            data: {
                phone: '+212 612 345 678',
                address: '123 Avenue Mohammed V, Casablanca',
                problemType: 'Problème cardiaque',
                description: 'Patient avec douleurs thoraciques',
                affectedPeople: 1,
                urgency: 'high'
            }
        },
        {
            id: Date.now() + 1,
            type: 'transport',
            serviceName: 'Transport Médical',
            date: new Date().toLocaleDateString('fr-FR'),
            time: '14:30',
            status: 'in-progress',
            estimatedTime: '30-45 minutes',
            data: {
                pickupAddress: '456 Rue Hassan II, Rabat',
                destinationDetails: 'Hôpital Ibn Sina',
                date: new Date().toLocaleDateString('fr-FR'),
                time: '15:00',
                patientType: 'Personne à mobilité réduite',
                equipment: ['brancard', 'oxygène'],
                notes: 'Patient nécessitant une surveillance continue'
            }
        },
        {
            id: Date.now() + 2,
            type: 'doctor',
            serviceName: 'Médecin à Domicile',
            date: new Date(Date.now() - 86400000).toLocaleDateString('fr-FR'), // Hier
            time: '10:00',
            status: 'pending',
            estimatedTime: '1-2 heures',
            data: {
                address: '789 Boulevard Mohammed VI, Marrakech',
                date: new Date(Date.now() + 86400000).toLocaleDateString('fr-FR'), // Demain
                time: '09:00',
                consultationType: 'Médecin généraliste',
                symptoms: ['fièvre', 'toux'],
                patientCount: 2,
                description: 'Fièvre persistante avec toux sèche'
            }
        }
    ];
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.requests) {
        currentUser.requests = [];
    }
    
    // Ajouter les demandes de test
    testRequests.forEach(req => {
        if (!currentUser.requests.some(r => r.id === req.id)) {
            currentUser.requests.unshift(req);
        }
    });
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showAlert('Données de test ajoutées à l\'historique!', 'success');
    updateHistoryDisplay();
    updateDashboardDisplay();
}

// ========== FONCTIONS DIVERSES ==========

// Contact d'urgence
function callEmergency() {
    if(confirm("Appeler le numéro d'urgence 0522 98 76 54 ?")) {
        showAlert("Appel en cours... (simulation)", "info");
    }
}

function openWhatsApp() {
    showAlert("Ouverture de WhatsApp... (simulation)", "info");
}

function sendEmail() {
    showAlert(" Ouverture de l'application mail... (simulation)", "info");
}

// Déconnexion
function logout() {
    if(confirm("Voulez-vous vraiment vous déconnecter ?")) {
        localStorage.removeItem('isLoggedIn');
        showAlert(" À bientôt !", "info");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    }
}

// Notifications
function showNotifications() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const pendingRequests = currentUser.requests?.filter(r => r.status === 'pending') || [];
    
    let message = " Notifications :\n\n";
    
    if (pendingRequests.length > 0) {
        message += `1. Vous avez ${pendingRequests.length} demande(s) en attente\n`;
    } else {
        message += "1. Aucune demande en attente\n";
    }
    
    message += "2. Nouvelle promo disponible\n";
    message += "3. Mise à jour du service";
    
    showAlert(message, "info");
}

// Annuler l'édition
function cancelEdit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const editName = document.getElementById('editName');
    const editEmail = document.getElementById('editEmail');
    const editPhone = document.getElementById('editPhone');
    const editAddress = document.getElementById('editAddress');
    
    if (editName) editName.value = currentUser.name || '';
    if (editEmail) editEmail.value = currentUser.email || '';
    if (editPhone) editPhone.value = currentUser.phone || '';
    if (editAddress) editAddress.value = currentUser.address || '';
    
    showAlert(" Modifications annulées", "info");
}

// Connexion Google
function loginWithGoogle() {
    showAlert(" Connexion avec Google... (simulation)", "info");
    setTimeout(() => {
        showAlert("Connecté avec Google ! Redirection...", "success");
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);
    }, 1500);
}

// ========== GESTION DU MODAL ==========

// Fermer le modal en cliquant en dehors
document.addEventListener('click', function(e) {
    const modal = document.getElementById('requestModal');
    if (modal && e.target === modal) {
        closeRequestForm();
    }
});

// Fermer avec la touche Échap
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeRequestForm();
    }
});

// ========== INITIALISATION ==========

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier connexion
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Charger profil si sur dashboard
    if(window.location.pathname.includes('dashboard.html')) {
        if(!isLoggedIn) {
            showAlert("Veuillez vous connecter d'abord", "error");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } else {
            loadProfileData();
            updateDashboardDisplay();
            
            // Initialiser l'historique si on est dans la section
            if (document.getElementById('history')?.style.display === 'block') {
                initializeHistory();
            }
        }
    }
    
    // Styles pour alertes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .status {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
        }
        
        .status.pending {
            background: #f39c12;
            color: white;
        }
        
        .status.in-progress {
            background: #3498db;
            color: white;
        }
        
        .status.completed {
            background: #27ae60;
            color: white;
        }
        
        .status.cancelled {
            background: #e74c3c;
            color: white;
        }
        
        input.error, select.error, textarea.error {
            border-color: #e74c3c !important;
            box-shadow: 0 0 5px rgba(231, 76, 60, 0.5);
        }
        
        .char-counter {
            text-align: right;
            font-size: 12px;
            color: #95a5a6;
            margin-top: 5px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .form-group label.required::after {
            content: ' *';
            color: #e74c3c;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            box-sizing: border-box;
        }
        
        .form-group textarea {
            resize: vertical;
            min-height: 80px;
        }
        
        .urgency-level, .symptoms-grid, .equipment-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
        }
        
        .urgency-option, .symptom-checkbox, .equipment-checkbox {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .use-saved-address {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .time-input {
            display: flex;
            gap: 10px;
        }
        
        .time-input input {
            flex: 1;
        }
        
        .btn-track, .btn-details, .btn-review {
            padding: 8px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.3s;
        }
        
        .btn-track {
            background: #3498db;
            color: white;
        }
        
        .btn-details {
            background: #2ecc71;
            color: white;
        }
        
        .btn-review {
            background: #f39c12;
            color: white;
        }
        
        .btn-track:hover, .btn-details:hover, .btn-review:hover {
            opacity: 0.9;
            transform: translateY(-2px);
        }
        
        /* Styles pour le filtre */
        .filter-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        /* Animation de suppression */
        .deleting {
            animation: fadeOut 0.5s ease forwards;
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(-100%);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Vérifier auth state
    checkAuthState();
});

function checkAuthState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const onAuthPage = window.location.pathname.includes('login.html') || 
                      window.location.pathname.includes('signup.html');
    
    if (isLoggedIn && onAuthPage) {
        showAlert("Vous êtes déjà connecté", "info");
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);
    }
}

// Exposer les fonctions globales
window.changeProfilePicture = function() {
    showAlert("Fonctionnalité de changement de photo à venir!", "info");
};

window.changePassword = function() {
    showAlert("Fonctionnalité de changement de mot de passe à venir!", "info");
};

window.exportData = function() {
    showAlert("Fonctionnalité d'export de données à venir!", "info");
};

window.deleteAccount = function() {
    if(confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        users = users.filter(user => user.email !== currentUser.email);
        localStorage.setItem('users', JSON.stringify(users));
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('currentUserId');
        
        showAlert("Compte supprimé avec succès !", "success");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    }
};

// ========== FONCTIONS DE DEMANDE SIMPLES ==========

function requestEmergency(type) {
    const types = {
        'urgent': 'Urgence vitale',
        'transport': 'Transport médical',
        'doctor': 'Médecin à domicile'
    };
    
    if(confirm(`Voulez-vous demander un service "${types[type]}" ?\n\nUne ambulance sera envoyée à votre adresse enregistrée.`)) {
        // Créer une demande simple
        const requestData = {
            id: Date.now(),
            type: type,
            serviceName: types[type],
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('fr-FR'),
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            status: 'pending',
            estimatedTime: calculateEstimatedTime(type),
            data: {
                address: 'Adresse enregistrée'
            }
        };
        
        saveRequestToHistory(requestData);
        showAlert(`Demande "${types[type]}" envoyée !\nL'ambulance arrive dans ${calculateEstimatedTime(type)}.`, "success");
    }
}

function addToHistory(service) {
    const requestData = {
        id: Date.now(),
        type: 'other',
        serviceName: service,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('fr-FR'),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        estimatedTime: 'N/A',
        data: {}
    };
    
    saveRequestToHistory(requestData);
    console.log(`Service ajouté à l'historique : ${service}`);
}
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        // FIXED dashboard credentials
        if (email === "admin@dashboard.com" && password === "admin123") {
            window.location.href = "../dashboard/index.html";
        } else {
            alert("Invalid login or password");
        }
    });
});
