import axios from 'axios';
import { getConfig } from './config.js';

const CLICKUP_BASE_URL = 'https://api.clickup.com/api/v2';

async function apiRequest(method, endpoint, data = null, params = null) {
  const apiKey = getConfig('apiKey');

  if (!apiKey) {
    throw new Error('No API key configured. Please run: clickupcom config set --api-key <key>');
  }

  const config = {
    method,
    url: `${CLICKUP_BASE_URL}${endpoint}`,
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json'
    }
  };

  if (params) config.params = params;
  if (data) config.data = data;

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
      throw new Error('Authentication failed. Check your API key.');
    } else if (status === 403) {
      throw new Error('Access forbidden. Check your permissions.');
    } else if (status === 404) {
      throw new Error('Resource not found.');
    } else if (status === 429) {
      throw new Error('Rate limit exceeded. Please wait before retrying.');
    } else {
      const message = data?.err || data?.ECODE || JSON.stringify(data);
      throw new Error(`API Error (${status}): ${message}`);
    }
  } else if (error.request) {
    throw new Error('No response from ClickUp API. Check your internet connection.');
  } else {
    throw error;
  }
}

// ============================================================
// TEAMS
// ============================================================

export async function getTeams() {
  const data = await apiRequest('GET', '/team');
  return data.teams || [];
}

// ============================================================
// SPACES
// ============================================================

export async function listSpaces(teamId) {
  const data = await apiRequest('GET', `/team/${teamId}/space`);
  return data.spaces || [];
}

export async function getSpace(spaceId) {
  const data = await apiRequest('GET', `/space/${spaceId}`);
  return data;
}

export async function createSpace({ teamId, name, features }) {
  const body = { name, features };
  const data = await apiRequest('POST', `/team/${teamId}/space`, body);
  return data;
}

// ============================================================
// FOLDERS
// ============================================================

export async function listFolders(spaceId) {
  const data = await apiRequest('GET', `/space/${spaceId}/folder`);
  return data.folders || [];
}

export async function createFolder({ spaceId, name }) {
  const body = { name };
  const data = await apiRequest('POST', `/space/${spaceId}/folder`, body);
  return data;
}

// ============================================================
// LISTS
// ============================================================

export async function listLists(folderId) {
  const data = await apiRequest('GET', `/folder/${folderId}/list`);
  return data.lists || [];
}

export async function getFolderlessLists(spaceId) {
  const data = await apiRequest('GET', `/space/${spaceId}/list`);
  return data.lists || [];
}

export async function createList({ folderId, name, content, dueDate, priority, status }) {
  const body = {
    name,
    content,
    due_date: dueDate,
    priority,
    status
  };
  const data = await apiRequest('POST', `/folder/${folderId}/list`, body);
  return data;
}

// ============================================================
// TASKS
// ============================================================

export async function listTasks(listId, params = {}) {
  const data = await apiRequest('GET', `/list/${listId}/task`, null, params);
  return data.tasks || [];
}

export async function getTask(taskId) {
  const data = await apiRequest('GET', `/task/${taskId}`);
  return data;
}

export async function createTask({ listId, name, description, assignees, status, priority, dueDate }) {
  const body = {
    name,
    description,
    assignees,
    status,
    priority,
    due_date: dueDate
  };
  const data = await apiRequest('POST', `/list/${listId}/task`, body);
  return data;
}

export async function updateTask(taskId, updates) {
  const data = await apiRequest('PUT', `/task/${taskId}`, updates);
  return data;
}

export async function deleteTask(taskId) {
  const data = await apiRequest('DELETE', `/task/${taskId}`);
  return data;
}

// ============================================================
// TIME TRACKING
// ============================================================

export async function getTimeEntries(teamId, params = {}) {
  const data = await apiRequest('GET', `/team/${teamId}/time_entries`, null, params);
  return data.data || [];
}

export async function startTimer(teamId, taskId, description) {
  const body = {
    tid: taskId,
    description
  };
  const data = await apiRequest('POST', `/team/${teamId}/time_entries/start`, body);
  return data.data;
}

export async function stopTimer(teamId) {
  const data = await apiRequest('POST', `/team/${teamId}/time_entries/stop`);
  return data.data;
}
