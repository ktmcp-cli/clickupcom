import axios from 'axios';
import { getConfig } from './config.js';

function getBaseURL() {
  const configuredUrl = getConfig('baseUrl');
  return configuredUrl || 'https://polls.apiblueprint.org';
}

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };

  const apiKey = getConfig('apiKey');
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return headers;
}

async function request(endpoint, method = 'GET', data = null) {
  const baseURL = getBaseURL();
  try {
    const config = {
      method,
      url: `${baseURL}${endpoint}`,
      headers: getHeaders()
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw new Error(`API Error: ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Request failed: ${error.message}`);
  }
}

// ============================================================
// API Methods
// ============================================================

/**
 * List All Questions
 */
export async function list_All_Questions(params = {}) {
  const endpoint = '/questions';
  return await request(endpoint, 'GET', params);
}

/**
 * Create a New Question
 */
export async function create_a_New_Question(params = {}) {
  const endpoint = '/questions';
  return await request(endpoint, 'POST', params);
}

