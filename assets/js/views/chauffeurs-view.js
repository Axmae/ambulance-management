// assets/js/views/chauffeurs-view.js

import { translate } from '../modules/i18n.js';
import { readEntityList, createEntity, updateEntity, deleteEntity, readEntity } from '../modules/data-store.js';

const ENTITY_NAME = 'chauffeurs';
const CONTENT_AREA = document.getElementById('content-area');

/* -----------------------------------------
   A. Rendu de la LISTE des chauffeurs
------------------------------------------*/
function renderChauffeurList(chauffeurs = []) {
    CONTENT_AREA.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 data-i18n-key="chauffeurs_list">${translate('chauffeurs_list')}</h2>
            <button class="btn btn-primary" id="create-chauffeur-btn" data-i18n-key="create_chauffeur">
                ${translate('create_chauffeur')}
            </button>
        </div>

        <div class="mb-3">
            <input type="text" class="form-control" id="search-input"
                placeholder="${translate('search_by_name') || 'Rechercher...'}">
        </div>

        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th data-sort-key="nom">${translate('nom_label')}</th>
                        <th data-sort-key="prenom">${translate('prenom_label')}</th>
                        <th data-sort-key="statut">${translate('statut_label')}</th>
                        <th>${translate('actions') || 'Actions'}</th>
                    </tr>
                </thead>
                <tbody id="chauffeur-table-body">
                    ${ chauffeurs.map(c => `
                        <tr>
                            <td>${escapeHtml(c.nom)}</td>
                            <td>${escapeHtml(c.prenom)}</td>
                            <td>
                                <span class="badge bg-${c.statut === 'Actif' ? 'success' : 'secondary'}">
                                    ${c.statut}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-warning edit-btn" data-id="${c.id}">✏️</button>
                                <button class="btn btn-sm btn-danger delete-btn" data-id="${c.id}">🗑️</button>
                            </td>
                        </tr>
                    `).join('') }
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('create-chauffeur-btn').onclick = renderCreateForm;
    document.querySelectorAll('.edit-btn').forEach(btn =>
        btn.onclick = (e) => renderEditForm(e.target.dataset.id)
    );
    document.querySelectorAll('.delete-btn').forEach(btn =>
        btn.onclick = (e) => handleDelete(e.target.dataset.id)
    );
}

/* -----------------------------------------
   B. Formulaire CREATE / UPDATE
------------------------------------------*/
function renderChauffeurForm(chauffeur = {}) {
    const isEdit = Boolean(chauffeur.id);
    const titleKey = isEdit ? 'edit_chauffeur' : 'create_chauffeur';

    CONTENT_AREA.innerHTML = `
        <h2 data-i18n-key="${titleKey}">${translate(titleKey)}</h2>

        <form id="chauffeur-form" data-id="${chauffeur.id || ''}">
            <div class="mb-3">
                <label class="form-label" data-i18n-key="nom_label">${translate('nom_label')}</label>
                <input type="text" class="form-control" id="nom" value="${chauffeur.nom || ''}" required>
            </div>

            <div class="mb-3">
                <label class="form-label" data-i18n-key="prenom_label">${translate('prenom_label')}</label>
                <input type="text" class="form-control" id="prenom" value="${chauffeur.prenom || ''}" required>
            </div>

            <div class="mb-3">
                <label class="form-label" data-i18n-key="statut_label">${translate('statut_label')}</label>
                <select class="form-select" id="statut" required>
                    ${["Actif", "En Pause", "Congé"].map(s => `
                        <option value="${s}" ${chauffeur.statut === s ? "selected" : ""}>${s}</option>
                    `).join('')}
                </select>
            </div>

            <button type="submit" class="btn btn-success" data-i18n-key="save_btn">${translate('save_btn')}</button>
            <button type="button" class="btn btn-secondary" id="back-btn">${translate('back_btn') || "Retour"}</button>
        </form>
    `;

    document.getElementById('chauffeur-form').onsubmit = handleFormSubmit;
    document.getElementById('back-btn').onclick = initChauffeursView;
}

function renderCreateForm() {
    renderChauffeurForm({});
}

async function renderEditForm(id) {
    const chauffeur = await readEntity(ENTITY_NAME, id);
    if (!chauffeur) return alert('Chauffeur introuvable.');
    renderChauffeurForm(chauffeur);
}

/* -----------------------------------------
   C. Gestion CRUD
------------------------------------------*/
async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const data = {
        nom: form.querySelector('#nom').value.trim(),
        prenom: form.querySelector('#prenom').value.trim(),
        statut: form.querySelector('#statut').value
    };

    if (!data.nom || !data.prenom) {
        return alert('Veuillez remplir tous les champs.');
    }

    const id = form.dataset.id;
    let result;

    if (id) {
        result = await updateEntity(ENTITY_NAME, id, data);
        alert(`Chauffeur mis à jour !`);
    } else {
        result = await createEntity(ENTITY_NAME, data);
        alert(`Chauffeur créé !`);
    }

    initChauffeursView();
}

async function handleDelete(id) {
    if (!confirm("Supprimer ce chauffeur ?")) return;

    const ok = await deleteEntity(ENTITY_NAME, id);
    if (!ok) return alert("Erreur lors de la suppression.");

    alert("Chauffeur supprimé.");
    initChauffeursView();
}

/* -----------------------------------------
   D. Initialisation
------------------------------------------*/
export async function initChauffeursView() {
    const list = await readEntityList(ENTITY_NAME);
    renderChauffeurList(list);
}

/* -----------------------------------------
   Utilitaire anti-XSS (important)
------------------------------------------*/
function escapeHtml(str = "") {
    return str.replace(/[&<>"']/g, m => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[m]));
}
