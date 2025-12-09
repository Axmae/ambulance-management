// assets/js/views/ambulances-view.js

import { translate } from '../modules/i18n.js';
import { readEntityList, createEntity, updateEntity, deleteEntity } from '../modules/data-store.js';

const ENTITY_NAME = 'ambulances';
const CONTENT_AREA = document.getElementById('content-area');

// --- A. Liste des ambulances ---
function renderAmbulanceList(ambulances) {
    CONTENT_AREA.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 data-i18n-key="ambulances_list">${translate('ambulances_list')}</h2>
            <button class="btn btn-primary" id="create-ambulance-btn" data-i18n-key="create_ambulance">${translate('create_ambulance')}</button>
        </div>
        
        <div class="mb-3 d-flex gap-2">
            <input type="text" class="form-control" placeholder="${translate('search_placeholder')}" id="search-input">
            <select class="form-select" id="status-filter">
                <option value="">${translate('filter_by_status')}</option>
                <option value="Disponible">Disponible</option>
                <option value="En Intervention">En Intervention</option>
            </select>
        </div>

        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th data-sort-key="matricule">${translate('matricule_label')}</th>
                        <th data-sort-key="modele">${translate('model_label')}</th>
                        <th data-sort-key="statut">${translate('status_label')}</th>
                        <th>${translate('actions')}</th>
                    </tr>
                </thead>
                <tbody id="ambulance-table-body">
                    ${ambulances.map(a => `
                        <tr>
                            <td>${a.matricule}</td>
                            <td>${a.modele}</td>
                            <td><span class="badge bg-${a.statut === 'Disponible' ? 'success' : 'warning'}">${translate(a.statut)}</span></td>
                            <td>
                                <button class="btn btn-sm btn-info view-btn" data-id="${a.id}">👁️</button>
                                <button class="btn btn-sm btn-warning edit-btn" data-id="${a.id}">✏️</button>
                                <button class="btn btn-sm btn-danger delete-btn" data-id="${a.id}">🗑️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <button class="btn btn-secondary" id="export-csv-btn">Export CSV</button>
    `;

    document.getElementById('create-ambulance-btn').addEventListener('click', renderCreateForm);
    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => renderEditForm(e.target.dataset.id)));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => handleDelete(e.target.dataset.id)));
}

// --- B. Formulaire ---
function renderAmbulanceForm(ambulance = {}) {
    const isEdit = !!ambulance.id;
    const formTitleKey = isEdit ? 'edit_ambulance' : 'create_ambulance';

    CONTENT_AREA.innerHTML = `
        <h2 data-i18n-key="${formTitleKey}">${translate(formTitleKey)}</h2>
        <form id="ambulance-form" data-id="${ambulance.id || ''}">
            <div class="mb-3">
                <label for="matricule" class="form-label" data-i18n-key="matricule_label">${translate('matricule_label')}</label>
                <input type="text" class="form-control" id="matricule" value="${ambulance.matricule || ''}" required>
                <div class="invalid-feedback" id="matricule-error"></div>
            </div>

            <div class="mb-3">
                <label for="modele" class="form-label" data-i18n-key="model_label">${translate('model_label')}</label>
                <input type="text" class="form-control" id="modele" value="${ambulance.modele || ''}" required>
                <div class="invalid-feedback" id="modele-error"></div>
            </div>

            <div class="mb-3">
                <label for="statut" class="form-label" data-i18n-key="status_label">${translate('status_label')}</label>
                <select class="form-select" id="statut" required>
                    <option value="Disponible" ${ambulance.statut === 'Disponible' ? 'selected' : ''}>Disponible</option>
                    <option value="En Intervention" ${ambulance.statut === 'En Intervention' ? 'selected' : ''}>En Intervention</option>
                    <option value="Hors Service" ${ambulance.statut === 'Hors Service' ? 'selected' : ''}>Hors Service</option>
                </select>
            </div>
            
            <button type="submit" class="btn btn-success" data-i18n-key="save_btn">${translate('save_btn')}</button>
            <button type="button" class="btn btn-secondary" id="back-to-list-btn">${translate('back_btn')}</button>
        </form>
    `;

    document.getElementById('ambulance-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('back-to-list-btn').addEventListener('click', initAmbulancesView);
}

function renderCreateForm() {
    renderAmbulanceForm({});
}

async function renderEditForm(id) {
    const ambulance = await readEntity(ENTITY_NAME, id);
    if (ambulance) {
        renderAmbulanceForm(ambulance);
    } else {
        alert('Ambulance non trouvée.');
        initAmbulancesView();
    }
}

// --- C. CRUD ---
function validateForm(form) {
    let isValid = true;
    const matriculeInput = form.querySelector('#matricule');

    if (matriculeInput.value.trim() === '') {
        matriculeInput.classList.add('is-invalid');
        form.querySelector('#matricule-error').textContent = translate('required_field');
        isValid = false;
    } else {
        matriculeInput.classList.remove('is-invalid');
    }

    return isValid;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;

    if (!validateForm(form)) return;

    const ambulanceData = {
        matricule: form.querySelector('#matricule').value,
        modele: form.querySelector('#modele').value,
        statut: form.querySelector('#statut').value,
    };

    const id = form.dataset.id;
    let result;

    if (id) {
        result = await updateEntity(ENTITY_NAME, id, ambulanceData);
        alert(`Ambulance ${result.matricule} mise à jour avec succès!`);
    } else {
        result = await createEntity(ENTITY_NAME, ambulanceData);
        alert(`Ambulance ${result.matricule} créée avec succès!`);
    }

    if (result) initAmbulancesView();
}

async function handleDelete(id) {
    if (confirm(`Voulez-vous vraiment supprimer l'ambulance avec l'ID ${id} ?`)) {
        const success = await deleteEntity(ENTITY_NAME, id);

        if (success) {
            alert('Ambulance supprimée.');
            initAmbulancesView();
        } else {
            alert('Erreur lors de la suppression.');
        }
    }
}

// --- D. Initialisation ---
export async function initAmbulancesView() {
    const ambulances = await readEntityList(ENTITY_NAME);
    renderAmbulanceList(ambulances);
}
