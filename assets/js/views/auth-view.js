// assets/js/views/auth-view.js

import { authenticate, logout } from '../modules/auth.js';
import { translate } from '../modules/i18n.js';

const ROOT = document.getElementById('root');

export function renderLoginView() {
    ROOT.innerHTML = `
        <div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div class="card p-4 shadow-lg" style="width: 400px;">
                <h3 class="card-title text-center" data-i18n-key="login_title">${translate('login_title')}</h3>
                <p class="text-center text-muted">Admin: admin@app.com / admin123</p>

                <form id="login-form">
                    <div class="mb-3">
                        <label for="email" class="form-label" data-i18n-key="email_label">${translate('email_label') || 'Email'}</label>
                        <input type="email" class="form-control" id="email" value="admin@app.com" required>
                    </div>

                    <div class="mb-3">
                        <label for="password" class="form-label" data-i18n-key="password_label">${translate('password_label')}</label>
                        <input type="password" class="form-control" id="password" value="admin123" required>
                    </div>

                    <button type="submit" class="btn btn-primary w-100" data-i18n-key="login_btn">
                        ${translate('login_btn')}
                    </button>

                    <div id="login-error-message" class="mt-3 text-danger text-center d-none"></div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorBox = document.getElementById('login-error-message');

    if (!email || !password) {
        showError('Veuillez remplir tous les champs.');
        return;
    }

    const success = authenticate(email, password);

    if (!success) {
        showError('Email ou mot de passe incorrect.');
        return;
    }

    window.dispatchEvent(new CustomEvent('loginSuccess'));
}

function showError(msg) {
    const box = document.getElementById('login-error-message');
    box.textContent = msg;
    box.classList.remove('d-none');
}

export function setupLogoutListener() {
    const btn = document.getElementById('logout-button');
    if (btn) btn.addEventListener('click', logout);
}
