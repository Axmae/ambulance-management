// assets/js/views/dashboard-view.js

import { translate } from '../modules/i18n.js';
import { getAppData } from '../modules/data-store.js';

const CONTENT_AREA = document.getElementById('content-area');

// Stockage global des graphiques pour les détruire proprement
let activeCharts = [];

// -----------------------------------------------------------------------------
// 1. ANALYSE DES DONNÉES
// -----------------------------------------------------------------------------

async function getDashboardStats(data) {
    if (!data) return null;

    const totalAmbulances = data.ambulances?.length || 0;
    const availableAmbulances = data.ambulances?.filter(a => a.statut === 'Disponible').length || 0;
    const totalInterventions = data.interventions?.length || 0;

    return {
        kpis: [
            { labelKey: 'total_ambulances', value: totalAmbulances, icon: '🚑' },
            { labelKey: 'ambulances_dispo', value: availableAmbulances, icon: '✅' },
            { labelKey: 'total_interventions', value: totalInterventions, icon: '🚨' }
        ],

        emergencyTypes: {
            labels: ['Accident', 'Maladie', 'Transfert'],
            counts: [45, 30, 25]
        },

        weeklyInterventions: {
            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            counts: [12, 18, 10, 25, 30, 20, 15]
        }
    };
}

// -----------------------------------------------------------------------------
// 2. RENDU HTML + GRAPHIQUES
// -----------------------------------------------------------------------------

function renderKPIs(kpis) {
    return kpis.map(kpi => `
        <div class="col-md-4 col-sm-6 mb-4">
            <div class="card shadow-sm h-100 border-start border-primary border-5">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col me-2">
                            <div class="text-xs fw-bold text-primary mb-1" data-i18n-key="${kpi.labelKey}">
                                ${translate(kpi.labelKey) || kpi.labelKey}
                            </div>
                            <div class="h5 fw-bold">${kpi.value}</div>
                        </div>
                        <div class="col-auto">
                            <i class="h2">${kpi.icon}</i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderChart(canvasId, type, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');

    if (typeof Chart === 'undefined') {
        console.error("Chart.js est manquant.");
        return null;
    }

    // Détruire un graphique déjà existant sur ce canvas
    const oldChart = activeCharts.find(c => c.id === canvasId);
    if (oldChart) {
        oldChart.chart.destroy();
        activeCharts = activeCharts.filter(c => c.id !== canvasId);
    }

    const chart = new Chart(ctx, { type, data, options });
    activeCharts.push({ id: canvasId, chart });

    return chart;
}

function drawCharts(stats) {
    renderChart('chartPieTypes', 'pie', {
        labels: stats.emergencyTypes.labels,
        datasets: [{
            data: stats.emergencyTypes.counts,
            backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
            hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf']
        }]
    });

    renderChart('chartLineWeekly', 'line', {
        labels: stats.weeklyInterventions.labels,
        datasets: [{
            label: translate('interventions_weekly'),
            data: stats.weeklyInterventions.counts,
            borderWidth: 3,
            borderColor: '#4e73df',
            pointRadius: 4,
            fill: false
        }]
    });
}

// -----------------------------------------------------------------------------
// 3. INITIALISATION DU DASHBOARD
// -----------------------------------------------------------------------------

export async function initDashboardView() {
    CONTENT_AREA.innerHTML = ''; // Nettoyage 

    const data = await getAppData();
    const stats = await getDashboardStats(data);

    if (!stats) {
        CONTENT_AREA.innerHTML = `<p class="text-danger">Erreur : données indisponibles.</p>`;
        return;
    }

    CONTENT_AREA.innerHTML = `
        <h2 data-i18n-key="dashboard">${translate('dashboard')}</h2>

        <div class="row mb-4">
            <div class="col-md-6">
                <select class="form-select" id="time-filter">
                    <option value="week">${translate('filter_week')}</option>
                    <option value="month">${translate('filter_month')}</option>
                    <option value="year">${translate('filter_year')}</option>
                </select>
            </div>
        </div>

        <div class="row">${renderKPIs(stats.kpis)}</div>

        <div class="row">
            <div class="col-lg-6 mb-4">
                <div class="card shadow mb-4">
                    <div class="card-header py-3"><h6 class="m-0 fw-bold text-primary">Types d’interventions</h6></div>
                    <div class="card-body"><canvas id="chartPieTypes"></canvas></div>
                </div>
            </div>

            <div class="col-lg-6 mb-4">
                <div class="card shadow mb-4">
                    <div class="card-header py-3"><h6 class="m-0 fw-bold text-primary">Interventions / semaine</h6></div>
                    <div class="card-body"><canvas id="chartLineWeekly"></canvas></div>
                </div>
            </div>
        </div>
    `;

    drawCharts(stats);

    document.getElementById('time-filter').addEventListener('change', e => {
        console.log("Filtre :", e.target.value);
        // → future mise à jour dynamique des graphiques
    });
}
