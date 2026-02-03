/** localStorage key for the current session. */
var AUTH_KEY = 'crudtask_session';

/** Returns the logged-in user object or null. */
function getSession() {
  var data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

/** Saves user as logged in (id, email, name, role only). */
function setSession(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }));
}

/** Clears the session (log out). */
function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

/** Redirects to the login page (path depends on admin vs user). */
function redirectToLogin() {
  window.location.href = (window.location.pathname || '').toLowerCase().indexOf('admin') !== -1
    ? '../html/login.html'
    : 'login.html';
}

/**
 * Ensures the user is logged in and has one of the allowed roles.
 * Allowed roles: e.g. ['user'] or ['admin'].
 * Returns session object or null; redirects if not allowed.
 */
function requireAuth(allowedRoles) {
  var session = getSession();
  if (!session) {
    redirectToLogin();
    return null;
  }
  if (allowedRoles && allowedRoles.indexOf(session.role) === -1) {
    var isAdmin = session.role === 'admin';
    window.location.href = isAdmin ? '../admin/dashboard.html' : (location.pathname.indexOf('admin') !== -1 ? '../html/dashboard.html' : 'dashboard.html');
    return null;
  }
  return session;
}

/** Returns base path for links (empty or '../'). */
function getBase() {
  return (window.location.pathname || '').toLowerCase().indexOf('admin') !== -1 ? '../' : '';
}
