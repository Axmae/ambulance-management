(function () {

    /* ===================== LANGUAGE ===================== */
    const dictionary = {
        fr: {
            Dashboard: "Dashboard",
            Ambulances: "Ambulances",
            Drivers: "Chauffeurs",
            Incidents: "Incidents",
            Settings: "Paramètres",
            Search: "Rechercher...",
            Edit: "Modifier",
            Delete: "Supprimer",
            Save: "Enregistrer",
            Cancel: "Annuler",
            Logout: "Déconnexion",
            ConfirmDel: "Voulez-vous vraiment supprimer cet élément ?",
            ConfirmLogout: "Voulez-vous vraiment vous déconnecter ?",
            Added: "Ajouté avec succès !",
            Theme: "Mode d'affichage"
        },
        en: {
            Dashboard: "Dashboard",
            Ambulances: "Ambulances",
            Drivers: "Drivers",
            Incidents: "Incidents",
            Settings: "Settings",
            Search: "Search...",
            Edit: "Edit",
            Delete: "Delete",
            Save: "Save",
            Cancel: "Cancel",
            Logout: "Logout",
            ConfirmDel: "Are you sure you want to delete this item?",
            ConfirmLogout: "Are you sure you want to logout?",
            Added: "Successfully added!",
            Theme: "Display Mode"
        }
    };

    let currentLanguage = localStorage.getItem("lang") || "fr";
    const translate = key => dictionary[currentLanguage][key] || key;

    window.toggleLanguage = function () {
        currentLanguage = currentLanguage === "fr" ? "en" : "fr";
        localStorage.setItem("lang", currentLanguage);
        window.navigateTo(currentPage);
    };

    /* ===================== STATE ===================== */
    const savedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const allClientRequests = savedUsers.flatMap(u => u.requests || []);

    const state = {
        ambulances: [
            { id: "AMB-101", driver: "Youssef", status: "active", location: "Casablanca" },
            { id: "AMB-102", driver: "Fatima", status: "idle", location: "Rabat" }
        ],
        drivers: [
            { id: "DRV-01", name: "Ahmed Karim", phone: "0612345678", status: "active" }
        ],
        incidents: allClientRequests.length
            ? allClientRequests
            : [{ id: "INC-01", type: "Accident", status: "open", location: "Tanger" }]
    };

    const mainContent = document.getElementById("mainContent");
    let currentPage = "Dashboard";

    /* ===================== CUSTOM ALERTS & TOASTS ===================== */
    window.showToast = function(message, type = "success") {
        const toast = document.createElement("div");
        toast.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; padding: 12px 25px; 
            background: ${type === "success" ? "#16a34a" : "#dc2626"}; 
            color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000; animation: slideIn 0.3s ease-out;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:10000; }
        .modal-box { background: var(--card-bg); color: var(--text-main); padding:25px; border-radius:12px; width:340px; text-align:center; box-shadow: 0 10px 25px rgba(0,0,0,0.2); border: 1px solid var(--border-color); }
    `;
    document.head.appendChild(style);

    /* ===================== THEME LOGIC ===================== */
    window.setTheme = function (mode) {
        document.body.dataset.theme = mode;
        localStorage.setItem("theme", mode);
        showToast(`Mode ${mode} activé`);
    };

    /* ===================== LOGOUT LOGIC ===================== */
    window.logoutAdmin = function() {
        const modal = document.createElement("div");
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-box">
                <div style="color:#dc2626; font-size:40px; margin-bottom:10px;">🚪</div>
                <h3 style="margin:0 0 15px 0;">${translate("Logout")}</h3>
                <p style="color:var(--text-muted); font-size:14px; margin-bottom:20px;">${translate("ConfirmLogout")}</p>
                <div style="display:flex; gap:10px;">
                    <button id="doLogout" class="btn-save" style="flex:1; background:#dc2626;">${translate("Logout")}</button>
                    <button id="noLogout" class="btn-select" style="flex:1;">${translate("Cancel")}</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector("#noLogout").onclick = () => modal.remove();
        modal.querySelector("#doLogout").onclick = () => {
            window.location.href = "../client/index.html";
        };
    };

    /* ===================== NAVIGATION ===================== */
    window.navigateTo = function (page) {
        currentPage = page;
        document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.page === page));

        if (page === "Dashboard") renderDashboard();
        else if (page === "Ambulances") renderTable("Ambulances", state.ambulances, ["id", "driver", "status", "location"]);
        else if (page === "Drivers") renderTable("Drivers", state.drivers, ["id", "name", "phone", "status"]);
        else if (page === "Incidents") renderTable("Incidents", state.incidents, ["id", "type", "status", "location"]);
        else if (page === "Settings") renderSettings();
    };

    /* ===================== DASHBOARD ===================== */
    function renderDashboard() {
        mainContent.innerHTML = `
            <div class="stats">
                <div class="card"><h3>${state.ambulances.length}</h3><p>${translate("Ambulances")}</p></div>
                <div class="card"><h3>${state.drivers.length}</h3><p>${translate("Drivers")}</p></div>
                <div class="card" style="border-left:5px solid #dc2626"><h3>${state.incidents.length}</h3><p>${translate("Incidents")}</p></div>
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
                    <div style="display:flex; gap:8px; margin-bottom:15px;">
                        <button class="btn-select" onclick="setupQuickForm('ambulance')">Amb</button>
                        <button class="btn-select" onclick="setupQuickForm('driver')">Chauff</button>
                        <button class="btn-select" onclick="setupQuickForm('incident')">Incid</button>
                    </div>
                    <form id="quickForm" class="data-form" style="display:none;" onsubmit="handleQuickAdd(event)">
                        <h4 id="formTitle">Saisie</h4>
                        <div id="formInputs"></div>
                        <button type="submit" class="btn-save">${translate("Save")}</button>
                    </form>
                </div>
            </div>`;
    }

    /* ===================== QUICK ADD ===================== */
    window.setupQuickForm = function (type) {
        const form = document.getElementById("quickForm");
        const inputs = document.getElementById("formInputs");
        form.style.display = "flex";
        form.dataset.type = type;
        document.getElementById("formTitle").textContent = "Nouveau: " + type.toUpperCase();

        if (type === "ambulance") {
            inputs.innerHTML = `<input id="f1" placeholder="ID" required><input id="f2" placeholder="Driver" required><select id="f3"><option value="active">Active</option><option value="idle">Idle</option></select><input id="f4" placeholder="City" required>`;
        } else if (type === "driver") {
            inputs.innerHTML = `<input id="f1" placeholder="ID" required><input id="f2" placeholder="Nom" required><input id="f3" placeholder="Tél" required><select id="f4"><option value="active">Active</option><option value="idle">Repos</option></select>`;
        } else {
            inputs.innerHTML = `<input id="f1" placeholder="Type" required><select id="f2"><option>Low</option><option>Medium</option><option>High</option></select><input id="f3" placeholder="Ville" required><input type="hidden" id="f4" value="open">`;
        }
    };

    window.handleQuickAdd = function (event) {
        event.preventDefault();
        const type = event.target.dataset.type;
        const v = ["f1", "f2", "f3", "f4"].map(id => document.getElementById(id) ? document.getElementById(id).value : "");

        if (type === "ambulance") state.ambulances.push({ id: v[0], driver: v[1], status: v[2], location: v[3] });
        else if (type === "driver") state.drivers.push({ id: v[0], name: v[1], phone: v[2], status: v[3] });
        else if (type === "incident") state.incidents.push({ id: "INC-" + Date.now().toString().slice(-4), type: v[0], status: v[3], location: v[2] });

        showToast(translate("Added"), "success");
        window.navigateTo(type.charAt(0).toUpperCase() + type.slice(1) + (type === "driver" ? "s" : "s"));
    };

    /* ===================== TABLE ===================== */
    function renderTable(title, data, keys) {
        mainContent.innerHTML = `
            <section class="card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h2>${translate(title)}</h2>
                    <input class="search-input" style="padding:8px; border-radius:5px; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main);" placeholder="${translate("Search")}" oninput="filterTable(this.value)">
                </div>
                <table class="table"><tbody id="tableBody">${data.map((row, i) => `<tr>${keys.map(k => `<td>${row[k] || ""}</td>`).join("")}<td><button class="btn-select" onclick="editRow('${title}', ${i})">${translate("Edit")}</button><button class="btn-select" style="background:#dc2626; color:white;" onclick="confirmDelete('${title}', ${i})">${translate("Delete")}</button></td></tr>`).join("")}</tbody></table>
            </section>`;
    }

    window.filterTable = (query) => {
        document.querySelectorAll("#tableBody tr").forEach(row => row.style.display = row.textContent.toLowerCase().includes(query.toLowerCase()) ? "" : "none");
    };

    /* ===================== CRUD MODALS ===================== */
    window.confirmDelete = function(type, index) {
        const modal = document.createElement("div");
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-box">
                <div style="color:#dc2626; font-size:40px; margin-bottom:10px;">⚠️</div>
                <h3 style="margin:0 0 15px 0;">${translate("Delete")}</h3>
                <p style="color:var(--text-muted); font-size:14px; margin-bottom:20px;">${translate("ConfirmDel")}</p>
                <div style="display:flex; gap:10px;">
                    <button id="doDelete" class="btn-save" style="flex:1; background:#dc2626;">${translate("Delete")}</button>
                    <button id="noDelete" class="btn-select" style="flex:1;">${translate("Cancel")}</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector("#noDelete").onclick = () => modal.remove();
        modal.querySelector("#doDelete").onclick = () => {
            state[type.toLowerCase()].splice(index, 1);
            modal.remove();
            showToast(translate("Delete") + " OK", "error");
            window.navigateTo(type);
        };
    };

    window.editRow = function (type, index) {
        const record = state[type.toLowerCase()][index];
        const modal = document.createElement("div");
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-box">
                <h3>${translate("Edit")}</h3>
                ${Object.keys(record).map(k => `
                    <label style="font-size:11px; display:block; text-align:left; margin-top:10px; color:var(--text-muted);">${k.toUpperCase()}</label>
                    <input style="width:100%; padding:8px; margin-top:4px; background:var(--bg-color); color:var(--text-main); border:1px solid var(--border-color); border-radius:4px;" value="${record[k]}" data-key="${k}">
                `).join("")}
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button id="saveEdit" class="btn-save" style="flex:1;">${translate("Save")}</button>
                    <button id="closeEdit" class="btn-select" style="flex:1;">${translate("Cancel")}</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector("#closeEdit").onclick = () => modal.remove();
        modal.querySelector("#saveEdit").onclick = () => {
            modal.querySelectorAll("input").forEach(input => record[input.dataset.key] = input.value);
            modal.remove();
            showToast(translate("Save") + " OK");
            window.navigateTo(type);
        };
    };

    /* ===================== SETTINGS & INIT ===================== */
    function renderSettings() {
        mainContent.innerHTML = `
            <section class="card">
                <h2>${translate("Settings")}</h2>
                <label style="display:block; margin-bottom:10px; font-weight:600;">${translate("Theme")}</label>
                <div style="display:flex; gap:10px; margin-bottom:20px;">
                    <button class="btn-select" onclick="setTheme('light')">☀️ Light</button>
                    <button class="btn-select" onclick="setTheme('dark')">🌙 Dark</button>
                </div>
                <hr style="border:0; border-top:1px solid var(--border-color); margin-bottom:20px;">
                <button class="btn-select" onclick="toggleLanguage()">🌐 FR / EN</button>
                <div style="margin-top:30px;">
                    <button class="btn-save" style="background:#dc2626; width:auto; padding:10px 30px;" onclick="logoutAdmin()">${translate("Logout")}</button>
                </div>
            </section>`;
    }

    document.querySelectorAll(".nav-link").forEach(link => link.onclick = () => window.navigateTo(link.dataset.page));
    
    // Initial Load
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.dataset.theme = savedTheme;
    window.navigateTo("Dashboard");

})();