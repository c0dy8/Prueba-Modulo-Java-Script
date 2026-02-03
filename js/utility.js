/**
 * User dashboard: sidebar name/avatar and task stats (total, completed, pending). Requires role "user".
 */
(function () {
  var session = requireAuth(['user']);
  if (!session) return;

  document.getElementById('sidebarName').textContent = session.name || 'User';
  document.getElementById('sidebarAvatar').src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(session.name || 'U') + '&background=random';

  /** Loads tasks and updates the three stat numbers on the page. */
  function loadStats() {
    API.getTasks(session.id)
      .then(function (tasks) {
        var total = tasks.length;
        var completed = 0;
        var pending = 0;
        for (var i = 0; i < tasks.length; i++) {
          if (tasks[i].status === 'completed') completed++;
          else if (tasks[i].status === 'pending' || tasks[i].status === 'in progress') pending++;
        }
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
      })
      .catch(function () {
        document.getElementById('totalTasks').textContent = '-';
        document.getElementById('completedTasks').textContent = '-';
        document.getElementById('pendingTasks').textContent = '-';
      });
  }

  loadStats();
})();
