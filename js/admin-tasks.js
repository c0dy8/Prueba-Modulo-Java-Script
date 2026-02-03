/**
 * Admin "All Tasks" page: list all tasks, edit/delete/change status. Requires role "admin".
 */
(function () {
  var session = requireAuth(['admin']);
  if (!session) return;

  var tbody = document.getElementById('tasksBody');
  var tasksCount = document.getElementById('tasksCount');
  var allTasks = [];
  var editingId = null;
  var modalEl = document.getElementById('taskModal');
  var modal = typeof bootstrap !== 'undefined' ? new bootstrap.Modal(modalEl) : null;

  document.getElementById('btnLogout').addEventListener('click', function () {
    clearSession();
    window.location.href = '../html/login.html';
  });

  /** Finds a task in allTasks by id (string or number). */
  function findTask(id) {
    for (var i = 0; i < allTasks.length; i++) {
      if (allTasks[i].id == id) return allTasks[i];
    }
    return null;
  }

  /** Formats a date string for display (e.g. DD/MM/YYYY). */
  function formatDate(str) {
    return str ? new Date(str).toLocaleDateString('en-GB') : '-';
  }

  /** Escapes text for safe display in HTML. */
  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  /** Builds one table row HTML for a task. */
  function rowHtml(t) {
    var desc = t.description ? '<div class="text-muted small">' + escapeHtml(t.description) + '</div>' : '';
    var sel = function (status) { return t.status === status ? ' selected' : ''; };
    return '<tr>' +
      '<td class="ps-4"><div class="fw-semibold">' + escapeHtml(t.title) + '</div>' + desc + '</td>' +
      '<td>' + t.userId + '</td>' +
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

  /** Renders the tasks table and updates the count. */
  function render(tasks) {
    if (tasks.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No tasks.</td></tr>';
    } else {
      var html = '';
      for (var i = 0; i < tasks.length; i++) html += rowHtml(tasks[i]);
      tbody.innerHTML = html;
    }
    tasksCount.textContent = tasks.length + ' task(s)';
  }

  /** Loads all tasks from the server and renders the table. */
  function loadTasks() {
    API.getTasks(null)
      .then(function (tasks) {
        allTasks = tasks;
        render(allTasks);
      })
      .catch(function () {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Error loading. Is JSON Server running? (npm run server)</td></tr>';
      });
  }

  /** Updates task status when admin changes the dropdown. */
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

  /** Opens the edit modal with the given task's data. */
  function openEdit(id) {
    var task = findTask(id);
    if (!task) return;
    editingId = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskStatus').value = task.status;
    if (modal) modal.show();
    else { modalEl.classList.add('show'); modalEl.style.display = 'block'; }
  }

  /** Saves the edited task (from modal form) to the server. */
  function saveTask() {
    var title = document.getElementById('taskTitle').value.trim();
    if (!title) { alert('Please enter a title'); return; }
    var task = findTask(editingId);
    if (!task) return;
    var payload = {
      id: task.id,
      title: title,
      description: document.getElementById('taskDescription').value.trim(),
      status: document.getElementById('taskStatus').value,
      userId: task.userId,
      createdAt: task.createdAt
    };
    API.putTask(task.id, payload)
      .then(function () {
        if (modal) modal.hide();
        else { modalEl.classList.remove('show'); modalEl.style.display = 'none'; }
        loadTasks();
      })
      .catch(function () { alert('Error saving'); });
  }

  /** Deletes a task after confirmation. */
  function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    API.deleteTask(id)
      .then(function () {
        var next = [];
        for (var i = 0; i < allTasks.length; i++) {
          if (allTasks[i].id != id) next.push(allTasks[i]);
        }
        allTasks = next;
        render(allTasks);
      })
      .catch(function () { alert('Error deleting'); });
  }

  document.getElementById('btnSaveTask').addEventListener('click', saveTask);

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
