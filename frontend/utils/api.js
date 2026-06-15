import { getToken } from './auth.js';
import { useContext } from 'react';
import LoadingContext from '../contexts/LoadingContext';
import { startLoading, stopLoading } from './loadingService';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const pendingGetRequests = new Map();

async function fetchWithAuth(
  endpoint,
  options = {},
  requestLoading = true,
  loadingCallbacks = null
) {
  const token = getToken();
  const method = (options.method || 'GET').toUpperCase();
  const requestKey = method === 'GET' ? `${token || 'anonymous'}:${endpoint}` : null;

  if (requestKey && pendingGetRequests.has(requestKey)) {
    return pendingGetRequests.get(requestKey);
  }

  const request = executeRequest();

  if (requestKey) {
    pendingGetRequests.set(requestKey, request);
    const clearPendingRequest = () => pendingGetRequests.delete(requestKey);
    void request.then(clearPendingRequest, clearPendingRequest);
  }

  return request;

  async function executeRequest() {
    const headers = {
      ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (requestLoading) {
      if (loadingCallbacks?.startLoading) loadingCallbacks.startLoading();
      else startLoading();
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        ...options,
      });

      const contentType = response.headers.get('content-type') || '';
      const body = contentType.includes('application/json')
        ? await response.json().catch(() => ({}))
        : await response.text();

      if (!response.ok) {
        const errMessage =
          body?.message || body?.error || `Erro na requisição (${response.status})`;
        const err = new Error(errMessage);
        err.status = response.status;
        throw err;
      }

      return body;
    } finally {
      if (requestLoading) {
        if (loadingCallbacks?.stopLoading) loadingCallbacks.stopLoading();
        else stopLoading();
      }
    }
  }
}

// wrapper that uses LoadingContext when called from React components
export function useApiFetch() {
  const loading = useContext(LoadingContext);

  return async function apiFetch(endpoint, options = {}) {
    return fetchWithAuth(endpoint, options, true, loading);
  };
}

// fallback direct fetch for non-React callers
export async function apiFetch(endpoint, options = {}) {
  return fetchWithAuth(endpoint, options, true, null);
}
