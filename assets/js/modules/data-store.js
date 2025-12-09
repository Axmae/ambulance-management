// assets/js/modules/data-store.js

const DATA_KEY = 'ambulance_app_data';

// Charge les données initiales depuis le fichier JSON
async function loadInitialData() {
    try {
        const response = await fetch('assets/json/initial-data.json');
        return await response.json();
    } catch (e) {
        console.error("Erreur de chargement des données initiales:", e);
        return { ambulances: [], chauffeurs: [], interventions: [], hopitaux: [], patients: [] };
    }
}

export async function getAppData() {
    let data = localStorage.getItem(DATA_KEY);
    if (!data) {
        // Si aucune donnée n'est trouvée, charger l'initialData
        const initialData = await loadInitialData();
        localStorage.setItem(DATA_KEY, JSON.stringify(initialData));
        return initialData;
    }
    return JSON.parse(data);
}

function saveAppData(data) {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    // Déclencher un événement global après une modification pour rafraîchir les vues
    window.dispatchEvent(new CustomEvent('dataChange'));
}

// Génère un ID simple (le plus grand ID + 1)
function generateNextId(list) {
    return list.length ? Math.max(...list.map(item => item.id)) + 1 : 1;
}

export async function createEntity(entityName, newEntity) {
    const data = await getAppData();
    const list = data[entityName];

    newEntity.id = generateNextId(list);
    list.push(newEntity);

    saveAppData(data);
    return newEntity;
}

export async function readEntityList(entityName, filters = {}) {
    const data = await getAppData();
    let list = data[entityName];

    // Implémentation des filtres ici
    return list;
}

export async function readEntity(entityName, id) {
    const data = await getAppData();
    return data[entityName].find(item => item.id == id);
}

export async function updateEntity(entityName, id, updatedFields) {
    const data = await getAppData();
    const index = data[entityName].findIndex(item => item.id == id);

    if (index === -1) return null;

    data[entityName][index] = { ...data[entityName][index], ...updatedFields };

    saveAppData(data);
    return data[entityName][index];
}

export async function deleteEntity(entityName, id) {
    const data = await getAppData();
    const initialLength = data[entityName].length;
    
    data[entityName] = data[entityName].filter(item => item.id != id);

    if (data[entityName].length < initialLength) {
        saveAppData(data);
        return true;
    }
    return false;
}
