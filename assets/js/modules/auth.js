// assets/js/modules/auth.js

const USERS = {
    'admin@app.com': { password: 'admin123', role: 'admin' },
    'user@app.com': { password: 'user123', role: 'user' }
};

export function authenticate(email, password) {
    const user = USERS[email];

    if (user && user.password === password) {
        saveSession(email, user.role);
        return true;
    }
    return false;
}

export function saveSession(email, role) {
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);

    window.dispatchEvent(new CustomEvent('loginSuccess'));
}

export function loadSession() {
    return {
        isLoggedIn: localStorage.getItem('userLoggedIn') === 'true',
        email: localStorage.getItem('userEmail'),
        role: localStorage.getItem('userRole')
    };
}

export function logout() {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');

    window.dispatchEvent(new CustomEvent('logoutSuccess'));
}
