'use strict';

const elements = {
  loginView: document.getElementById('login-view'),
  workspaceView: document.getElementById('workspace-view'),
  loginForm: document.getElementById('login-form'),
  loginButton: document.getElementById('login-button'),
  loginFeedback: document.getElementById('login-feedback'),
  sessionSummary: document.getElementById('session-summary'),
  signOut: document.getElementById('sign-out'),
  eventForm: document.getElementById('event-form'),
  createButton: document.getElementById('create-button'),
  eventFeedback: document.getElementById('event-feedback'),
  eventsSummary: document.getElementById('events-summary'),
  eventList: document.getElementById('event-list'),
  auditList: document.getElementById('audit-list'),
  refreshButton: document.getElementById('refresh-button'),
};

let session = null;

async function api(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body !== undefined) headers['content-type'] = 'application/json';
  if (session) headers.authorization = `Bearer ${session.token}`;
  const response = await fetch(`/lab/api${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'request_failed');
    error.status = response.status;
    throw error;
  }
  return data;
}

function feedback(node, message, state = 'success') {
  node.textContent = message;
  node.dataset.state = state;
}

function emptyItem(message) {
  const item = document.createElement('li');
  item.className = 'empty-item';
  item.textContent = message;
  return item;
}

function renderEvents(items) {
  elements.eventList.replaceChildren();
  elements.eventsSummary.textContent = `${items.length} ${items.length === 1 ? 'event' : 'events'} visible to you`;
  if (!items.length) {
    elements.eventList.append(emptyItem('No events yet. Create one to begin.'));
    return;
  }
  for (const event of items) {
    const item = document.createElement('li');
    const title = document.createElement('span');
    title.className = 'item-title';
    title.textContent = event.title;
    const meta = document.createElement('span');
    meta.className = 'item-meta';
    meta.textContent = `${event.date} · Owner: ${event.ownerId}`;
    item.append(title, meta);
    elements.eventList.append(item);
  }
}

function renderAudit(items) {
  elements.auditList.replaceChildren();
  if (!items.length) {
    elements.auditList.append(emptyItem('No activity recorded yet.'));
    return;
  }
  const actionLabels = {
    event_created: 'Event created',
    event_conflict: 'Duplicate blocked',
    event_read_denied: 'Access denied',
  };
  for (const entry of items) {
    const item = document.createElement('li');
    const action = document.createElement('span');
    action.className = 'item-title';
    action.textContent = actionLabels[entry.action] || entry.action;
    const meta = document.createElement('span');
    meta.className = 'item-meta';
    meta.textContent = `${entry.actorId}${entry.eventId ? ` · ${entry.eventId}` : ''}`;
    item.append(action, meta);
    elements.auditList.append(item);
  }
}

async function refreshWorkspace() {
  const [events, audit] = await Promise.all([api('/events'), api('/audit')]);
  renderEvents(events.items);
  renderAudit(audit.items);
}

elements.loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  feedback(elements.loginFeedback, '');
  elements.loginButton.disabled = true;
  const form = new FormData(elements.loginForm);
  try {
    session = await api('/session', {
      method: 'POST',
      body: { identifier: form.get('identifier'), password: form.get('password') },
    });
    elements.loginView.hidden = true;
    elements.workspaceView.hidden = false;
    elements.sessionSummary.textContent = `Signed in as ${session.user.id} (${session.user.role})`;
    elements.loginForm.reset();
    await refreshWorkspace();
    document.getElementById('workspace-heading').focus();
  } catch (error) {
    if (session) {
      feedback(elements.eventFeedback, 'Could not load the workspace. Please refresh.', 'error');
    } else {
      feedback(elements.loginFeedback, error.status === 401
        ? 'Invalid demo login. Check the account and password.'
        : 'Sign-in is unavailable. Please try again.', 'error');
    }
  } finally {
    elements.loginButton.disabled = false;
  }
});

elements.eventForm.addEventListener('submit', async event => {
  event.preventDefault();
  feedback(elements.eventFeedback, '');
  elements.createButton.disabled = true;
  const form = new FormData(elements.eventForm);
  try {
    const created = await api('/events', {
      method: 'POST',
      body: { title: String(form.get('title')).trim(), date: form.get('date') },
    });
    await refreshWorkspace();
    feedback(elements.eventFeedback, `Created ${created.title} on ${created.date}.`);
    elements.eventForm.reset();
  } catch (error) {
    const message = error.status === 409
      ? 'Conflict: this account already has an event with that title and date.'
      : error.status === 422
        ? 'Check the event title and date, then try again.'
        : 'Could not save the event. Please try again.';
    feedback(elements.eventFeedback, message, 'error');
    if (error.status === 409) await refreshWorkspace().catch(() => {});
  } finally {
    elements.createButton.disabled = false;
  }
});

elements.refreshButton.addEventListener('click', async () => {
  elements.refreshButton.disabled = true;
  try {
    await refreshWorkspace();
    feedback(elements.eventFeedback, 'Event list refreshed.');
  } catch {
    feedback(elements.eventFeedback, 'Could not refresh the event list.', 'error');
  } finally {
    elements.refreshButton.disabled = false;
  }
});

elements.signOut.addEventListener('click', async () => {
  elements.signOut.disabled = true;
  try {
    await api('/logout', { method: 'POST' });
    session = null;
    elements.workspaceView.hidden = true;
    elements.loginView.hidden = false;
    elements.eventList.replaceChildren();
    elements.auditList.replaceChildren();
    elements.eventForm.reset();
    feedback(elements.eventFeedback, '');
    document.getElementById('identifier').focus();
  } catch {
    feedback(elements.eventFeedback, 'Could not sign out. Please try again.', 'error');
  } finally {
    elements.signOut.disabled = false;
  }
});
