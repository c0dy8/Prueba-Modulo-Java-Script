/** Fetches JSON from url; throws if response is not ok. */
function fetchJson(url, options) {
  options = options || {};
  return fetch(url, options).then(function (res) {
    if (!res.ok) throw new Error('Request failed');
    return res.json();
  });
}

/** API: all server calls for users and tasks. */
var API = {
  /** Returns all users. */
  getUsers: function () {
    return fetchJson(API_BASE + '/users');
  },

  /** Returns one user by email, or null. */
  getUserByEmail: function (email) {
    return fetchJson(API_BASE + '/users?email=' + encodeURIComponent(email)).then(function (arr) {
      return arr[0] || null;
    });
  },

  /** Creates a user; returns the created user. */
  postUser: function (user) {
    return fetchJson(API_BASE + '/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
  },

  /** Returns tasks. If userId is null/undefined, returns all (admin); otherwise filters by userId. */
  getTasks: function (userId) {
    var url = (userId != null && userId !== '') ? API_BASE + '/tasks?userId=' + userId : API_BASE + '/tasks';
    return fetchJson(url);
  },

  /** Returns one task by id. */
  getTask: function (id) {
    return fetchJson(API_BASE + '/tasks/' + id);
  },

  /** Creates a task; returns the created task. */
  postTask: function (task) {
    return fetchJson(API_BASE + '/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
  },

  /** Updates a task by id with the given full task object. */
  putTask: function (id, task) {
    return fetchJson(API_BASE + '/tasks/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
  },

  /** Deletes a task by id. */
  deleteTask: function (id) {
    return fetch(API_BASE + '/tasks/' + id, { method: 'DELETE' }).then(function (res) {
      if (!res.ok) throw new Error('Delete failed');
    });
  }
};
