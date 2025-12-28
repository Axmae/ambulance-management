(function () {
    // 1. État global des données (Base de données locale)
    let state = {
        ambulances: [
            { id: 'AMB-101', driver: 'Youssef', status: 'active', location: 'Casablanca' },
            { id: 'AMB-102', driver: 'Fatima', status: 'idle', location: 'Rabat' }
        ],
        drivers: [
            { id: 'DRV-01', name: 'Ahmed Karim', phone: '0612345678', status: 'active' }
        ],
        incidents: [
            { id: 'INC-01', type: 'Accident', severity: 'Haute', status: 'open', location: 'Tanger' }
        ]
    };

    const main = document.getElementById('mainContent');

    /* ===================== GESTION DU CALENDRIER (RESTRICTION) ===================== */
    function initCalendarRestriction() {
        const datePicker = document.getElementById('datePicker');
        if (datePicker) {
            // Récupère la date d'aujourd'hui au format YYYY-MM-DD
            const today = new Date().toISOString().split('T')[0];
            
            // Empêche la sélection de dates futures
            datePicker.setAttribute('max', today);
            
            // Définit la valeur par défaut sur aujourd'hui
            datePicker.value = today;
        }
    }

    /* ===================== NAVIGATION SPA ===================== */
    window.navigateTo = function(page) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === page));
        
        if (page === 'Dashboard') renderDashboard();
        else if (page === 'Ambulances') renderTablePage('Ambulances', state.ambulances, ['ID', 'Chauffeur', 'Statut', 'Ville']);
        else if (page === 'Drivers') renderTablePage('Chauffeurs', state.drivers, ['ID', 'Nom', 'Téléphone', 'Statut']);
        else if (page === 'Incidents') renderTablePage('Incidents', state.incidents, ['ID', 'Type', 'Gravité', 'Statut', 'Ville']);
        else if (page === 'Settings') renderSettings();
    };

    /* ===================== RENDU DASHBOARD ===================== */
    function renderDashboard() {
        main.innerHTML = `
            <div class="stats">
                <div class="card"><h3>${state.ambulances.length}</h3><p>Ambulances</p></div>
                <div class="card"><h3>${state.drivers.length}</h3><p>Chauffeurs</p></div>
                <div class="card" style="border-left:5px solid #dc2626"><h3>${state.incidents.length}</h3><p>Incidents</p></div>
            </div>

            <div class="dashboard-grid">
                <div class="card">
                    <h3>📈 Activité Hebdomadaire</h3>
                    <div class="bar-chart">
                        <div class="bar" style="height:60%"><span>12</span><label>Lun</label></div>
                        <div class="bar" style="height:85%"><span>18</span><label>Mar</label></div>
                        <div class="bar" style="height:45%"><span>9</span><label>Mer</label></div>
                        <div class="bar" style="height:90%"><span>22</span><label>Jeu</label></div>
                    </div>
                </div>

                <div class="card">
                    <h3>➕ Ajouter Rapide</h3>
                    <div style="display:flex; gap:8px; margin-bottom:15px;">
                        <button class="btn-select" onclick="setupForm('ambulance')">Amb</button>
                        <button class="btn-select" onclick="setupForm('driver')">Chauff</button>
                        <button class="btn-select" onclick="setupForm('incident')">Incid</button>
                    </div>
                    <form id="dynForm" class="data-form" onsubmit="handleDataAdd(event)">
                        <h4 id="fTitle">Saisie</h4>
                        <div id="fInputs"></div>
                        <button type="submit" class="btn-save">Enregistrer</button>
                    </form>
                </div>
            </div>`;
    }

    /* ===================== GESTION DES FORMULAIRES ===================== */
    window.setupForm = function(type) {
        const form = document.getElementById('dynForm');
        const container = document.getElementById('fInputs');
        form.style.display = 'flex';
        form.dataset.type = type;
        document.getElementById('fTitle').textContent = "Nouveau: " + type;
        
        if(type === 'ambulance') {
            container.innerHTML = `<input id="v1" placeholder="ID (AMB-001)" required><input id="v2" placeholder="Chauffeur" required><select id="v3"><option value="active">Active</option><option value="idle">Idle</option></select><input id="v4" placeholder="Ville" required>`;
        } else if(type === 'driver') {
            container.innerHTML = `<input id="v1" placeholder="ID Chauffeur" required><input id="v2" placeholder="Nom Complet" required><input id="v3" placeholder="Téléphone" required><select id="v4"><option value="active">Disponible</option><option value="idle">Repos</option></select>`;
        } else {
            container.innerHTML = `<input id="v1" placeholder="Type d'incident" required><select id="v2"><option>Basse</option><option>Moyenne</option><option>Haute</option></select><input id="v3" placeholder="Ville" required><input type="hidden" id="v4" value="open">`;
        }
    };

    window.handleDataAdd = function(e) {
        e.preventDefault();
        const type = e.target.dataset.type;
        const v = [
            document.getElementById('v1').value, 
            document.getElementById('v2').value, 
            document.getElementById('v3').value, 
            document.getElementById('v4').value
        ];
        
        if(type === 'ambulance') state.ambulances.push({id:v[0], drv:v[1], st:v[2], loc:v[3]});
        else if(type === 'driver') state.drivers.push({id:v[0], nm:v[1], ph:v[2], st:v[3]});
        else state.incidents.push({id:'INC-'+Date.now().toString().slice(-3), ty:v[0], sev:v[1], st:v[3], loc:v[2]});
        
        toast("Enregistré avec succès !");
        renderDashboard();
    };

    /* ===================== RENDU DES PAGES ET UTILITAIRES ===================== */
    function renderTablePage(title, data, headers) {
        main.innerHTML = `
            <section class="card">
                <h2>${title}</h2>
                <table class="table">
                    <thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
                    <tbody>
                        ${data.map(item=>`
                            <tr>${Object.values(item).map(val=>`<td>${val==='active'||val==='open'?`<span class="badge active">${val}</span>`:val}</td>`).join('')}</tr>
                        `).join('')}
                    </tbody>
                </table>
            </section>`;
    }

    function renderSettings() {
        main.innerHTML = `
            <section class="card">
                <h2>⚙️ Paramètres</h2>
                <p>Thème de l'interface :</p>
                <div style="margin-top:15px; display:flex; gap:10px;">
                    <button class="btn-select" onclick="setTheme('light')">☀️ Mode Clair</button>
                    <button class="btn-select" onclick="setTheme('dark')">🌙 Mode Sombre</button>
                </div>
            </section>`;
    }

    window.setTheme = function(t) { 
        document.body.dataset.theme = t; 
        localStorage.setItem('theme', t); 
        toast("Thème " + t + " appliqué"); 
    };

    function toast(m) { 
        const t=document.createElement('div'); 
        t.style.cssText="position:fixed;bottom:20px;right:20px;background:#dc2626;color:white;padding:12px 20px;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:9999;"; 
        t.textContent=m; 
        document.body.appendChild(t); 
        setTimeout(()=>t.remove(), 2500); 
    }

    /* ===================== INITIALISATION ===================== */
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => navigateTo(l.dataset.page)));
    
    document.getElementById('menuBtn').onclick = () => document.getElementById('sidebar').classList.toggle('hidden');
    
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Applique le thème sauvegardé
    setTheme(localStorage.getItem('theme') || 'light');
    
    // Initialise la restriction du calendrier
    initCalendarRestriction();
    
    // Affiche la page par défaut
    navigateTo('Dashboard');
})();