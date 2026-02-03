/**
 * Register page: redirect if already logged in; otherwise handle form submit.
 */
(function () {
  var session = getSession();
  if (session) {
    window.location.href = session.role === 'admin' ? '../admin/dashboard.html' : 'dashboard.html';
    return;
  }

  document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('fullName').value.trim();
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var confirm = document.getElementById('confirmPassword').value;
    var errEl = document.getElementById('registerError');

    if (password !== confirm) {
      errEl.textContent = 'Passwords do not match.';
      errEl.classList.remove('d-none');
      return;
    }

    API.getUserByEmail(email)
      .then(function (existing) {
        if (existing) {
          errEl.textContent = 'An account with this email already exists.';
          errEl.classList.remove('d-none');
          return null;
        }
        return API.postUser({ name: name, email: email, password: password, role: 'user' });
      })
      .then(function (user) {
        if (!user) return;
        setSession(user);
        window.location.href = 'dashboard.html';
      })
      .catch(function () {
        errEl.textContent = 'Error registering. Is JSON Server running? (npm run server)';
        errEl.classList.remove('d-none');
      });
  });
})();
