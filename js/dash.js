/**
 * User "My Tasks" page: list user's tasks, create/edit/delete, change status. Requires role "user".
 */
(function () {
  var session = requireAuth(['user']);
  if (!session) return;

  var userId = Number(session.id);
  if (!userId || isNaN(userId)) {
    alert('Invalid session. Please sign in again.');
    clearSession();
    window.location.href = 'login.html';
    return;
  }

  var tbody = document.getElementById('tasksBody');
  var tasksCount = document.getElementById('tasksCount');
  var allTasks = [];
  var editingId = null;
  var modalEl = document.getElementById('taskModal');
  var modal = typeof bootstrap !== 'undefined' ? new bootstrap.Modal(modalEl) : null;

  /** Finds a task in allTasks by id; returns null if not found or not owned by this user. */
  function findTask(id) {
    for (var i = 0; i < allTasks.length; i++) {
      if (allTasks[i].id == id && allTasks[i].userId == userId) return allTasks[i];
    }
    return null;
  }

  /** Formats a date string for display. */
  function formatDate(str) {
    return str ? new Date(str).toLocaleDateString('en-GB') : '-';
  }

  /** Escapes text for safe display in HTML. */
  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  /** Renders the tasks table and updates the count. */
  function render(tasks) {
    if (tasks.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No tasks yet. Create one.</td></tr>';
    } else {
      var html = '';
      for (var i = 0; i < tasks.length; i++) {
        var t = tasks[i];
        var desc = t.description ? '<div class="text-muted small">' + escapeHtml(t.description) + '</div>' : '';
        var sel = function (s) { return t.status === s ? ' selected' : ''; };
        html += '<tr>' +
          '<td class="ps-4"><div class="fw-semibold">' + escapeHtml(t.title) + '</div>' + desc + '</td>' +
          '<td><select class="form-select form-select-sm status-select" style="width:auto;min-width:130px" data-id="' + t.id + '">' +
          '<option value="pending"' + sel('pending') + '>Pending</option>' +
          '<option value="in progress"' + sel('in progress') + '>In Progress</option>' +
          '<option value="completed"' + sel('completed') + '>Completed</option>' +
          '</select></td>' +
          '<td>' + formatDate(t.createdAt) + '</td>' +
          '<td class="text-end pe-4">' +
          '<button type="button" class="btn btn-sm text-primary btn-edit" data-id="' + t.id + '"><i class="bi bi-pencil"></i></button> ' +
          '<button type="button" class="btn btn-sm text-danger btn-delete" data-id="' + t.id + '"><i class="bi bi-trash"></i></button>' +
          '</td></tr>';
      }
      tbody.innerHTML = html;
    }
    tasksCount.textContent = tasks.length + ' task(s)';
  }

  /** Loads this user's tasks and renders the table. */
  function loadTasks() {
    API.getTasks(userId)
      .then(function (tasks) {
        allTasks = tasks;
        render(allTasks);
      })
      .catch(function () {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Error loading tasks. Is JSON Server running? (npm run server)</td></tr>';
      });
  }

  /** Updates task status when user changes the dropdown. */
  function changeStatus(id, status) {
    var task = findTask(id);
    if (!task) return;
    var payload = { id: task.id, title: task.title, description: task.description, status: status, userId: task.userId, createdAt: task.createdAt };
    API.putTask(task.id, payload)
      .then(function () {
        task.status = status;
        render(allTasks);
      })
      .catch(function () { alert('Error updating status'); });
  }

  /** Opens the modal (new or edit). */
  function showModal() {
    if (modal) modal.show();
    else { modalEl.classList.add('show'); modalEl.style.display = 'block'; }
  }

  /** Hides the modal. */
  function hideModal() {
    if (modal) modal.hide();
    else { modalEl.classList.remove('show'); modalEl.style.display = 'none'; }
  }

  /** "New Task" button: clear form and open modal. */
  document.getElementById('btnNewTask').addEventListener('click', function () {
    editingId = null;
    document.getElementById('taskModalTitle').textContent = 'New Task';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskStatus').value = 'pending';
    showModal();
  });

  /** Opens the edit modal with the given task's data. */
  function openEdit(id) {
    var task = findTask(id);
    if (!task) return;
    editingId = task.id;
    document.getElementById('taskModalTitle').textContent = 'Edit Task';
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskStatus').value = task.status;
    showModal();
  }

  /** Save button: create new task or update the one being edited. */
  document.getElementById('btnSaveTask').addEventListener('click', function () {
    var title = document.getElementById('taskTitle').value.trim();
    if (!title) { alert('Please enter a title'); return; }
    var description = document.getElementById('taskDescription').value.trim();
    var status = document.getElementById('taskStatus').value;

    if (editingId) {
      var task = findTask(editingId);
      if (!task) return;
      var payload = { id: task.id, title: title, description: description, status: status, userId: task.userId, createdAt: task.createdAt };
      API.putTask(task.id, payload)
        .then(function () {
          hideModal();
          loadTasks();
        })
        .catch(function () { alert('Error saving'); });
    } else {
      API.postTask({
        title: title,
        description: description,
        status: status,
        userId: userId,
        createdAt: new Date().toISOString()
      })
        .then(function () {
          hideModal();
          loadTasks();
        })
        .catch(function () { alert('Error saving'); });
    }
  });

  /** Deletes a task after confirmation. */
  function deleteTask(id) {
    var task = findTask(id);
    if (!task) return;
    if (!confirm('Delete this task?')) return;
    API.deleteTask(task.id)
      .then(function () {
        var next = [];
        for (var i = 0; i < allTasks.length; i++) {
          if (allTasks[i].id != id) next.push(allTasks[i]);
        }
        allTasks = next;
        render(allTasks);
      })
      .catch(function () { alert('Error deleting task'); });
  }

  document.addEventListener('click', function (e) {
    var editBtn = e.target.closest ? e.target.closest('.btn-edit') : null;
    var deleteBtn = e.target.closest ? e.target.closest('.btn-delete') : null;
    if (editBtn && tbody.contains(editBtn)) {
      e.preventDefault();
      var id = editBtn.getAttribute('data-id');
      if (id) openEdit(id);
      return;
    }
    if (deleteBtn && tbody.contains(deleteBtn)) {
      e.preventDefault();
      var id = deleteBtn.getAttribute('data-id');
      if (id) deleteTask(id);
    }
  });

  document.addEventListener('change', function (e) {
    if (!e.target || !e.target.classList || !e.target.classList.contains('status-select')) return;
    if (!tbody.contains(e.target)) return;
    var id = e.target.getAttribute('data-id');
    var status = e.target.value;
    if (id) changeStatus(id, status);
  });

  loadTasks();
})();
