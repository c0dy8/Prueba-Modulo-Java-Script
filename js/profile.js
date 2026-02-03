/**
 * Profile page: show user name/email and logout. Requires role "user".
 */
(function () {
  var session = requireAuth(['user']);
  if (!session) return;

  var name = session.name || 'User';
  var email = session.email || '';

  document.getElementById('profileName').textContent = name;
  document.getElementById('profileEmail').textContent = email;
  document.getElementById('avatarImg').src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random';
  document.getElementById('infoName').textContent = name;
  document.getElementById('infoEmail').textContent = email;

  document.getElementById('btnLogout').addEventListener('click', function () {
    clearSession();
    window.location.href = 'login.html';
  });
})();
