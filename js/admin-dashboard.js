/**
 * Admin dashboard: show admin name, logout, and task counts (total, pending, in progress, completed). Requires role "admin".
 */
(function () {
  var session = requireAuth(['admin']);
  if (!session) return;

  document.getElementById('adminName').textContent = session.name || 'Admin';

  document.getElementById('btnLogout').addEventListener('click', function () {
    clearSession();
    window.location.href = '../html/login.html';
  });

  /** Loads all tasks and fills the four stat boxes. */
  function loadStats() {
    API.getTasks(null)
      .then(function (tasks) {
        var total = tasks.length;
        var pending = 0, inProgress = 0, completed = 0;
        for (var i = 0; i < tasks.length; i++) {
          var s = tasks[i].status;
          if (s === 'pending') pending++;
          else if (s === 'in progress') inProgress++;
          else if (s === 'completed') completed++;
        }
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('inProgressTasks').textContent = inProgress;
        document.getElementById('completedTasks').textContent = completed;
      })
      .catch(function () {
        document.getElementById('totalTasks').textContent = '-';
        document.getElementById('pendingTasks').textContent = '-';
        document.getElementById('inProgressTasks').textContent = '-';
        document.getElementById('completedTasks').textContent = '-';
      });
  }

  loadStats();
})();
