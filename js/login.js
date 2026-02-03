/**
 * Login page: redirect if already logged in; otherwise handle form submit.
 */
(function () {
  var session = getSession();
  if (session) {
    window.location.href = session.role === 'admin' ? '../admin/dashboard.html' : 'dashboard.html';
    return;
  }

  /** Sends user to the correct dashboard after login. */
  function goToDashboard(role) {
    window.location.href = role === 'admin' ? '../admin/dashboard.html' : 'dashboard.html';
  }

  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var errEl = document.getElementById('loginError');

    API.getUserByEmail(email)
      .then(function (user) {
        if (!user || user.password !== password) {
          errEl.textContent = 'Wrong email or password.';
          errEl.classList.remove('d-none');
          return;
        }
        setSession(user);
        goToDashboard(user.role);
      })
      .catch(function () {
        errEl.textContent = 'Could not reach the server. Is JSON Server running? (npm run server)';
        errEl.classList.remove('d-none');
      });
  });
})();
