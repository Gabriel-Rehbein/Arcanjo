// ===============================
// CONFIGURAÇÃO SUPABASE
// ===============================
const SUPABASE_URL = 'https://ufadmcuylkplkyjmqypx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmYWRtY3V5bGtwbGt5am1xeXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDExOTQsImV4cCI6MjA4ODkxNzE5NH0.csadEk-Ka8eEJibVUbiA_Bbeh5EwmlwVYjPO29SuCbg';

// ===============================
// CLIENTE SUPABASE REST
// ===============================
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  buildHeaders(extraHeaders = {}) {
    return {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      ...extraHeaders
    };
  }

  buildFilterQuery(filters = {}) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, `eq.${value}`);
      }
    }

    return params.toString();
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      let errorMessage = `Erro HTTP ${response.status}`;

      try {
        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage =
            errorData.message ||
            errorData.error_description ||
            errorData.details ||
            JSON.stringify(errorData);
        } else {
          errorMessage = await response.text();
        }
      } catch {
        errorMessage = `Erro HTTP ${response.status}`;
      }

      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return true;
    }

    if (contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  }

  async query(table, method = 'GET', data = null, filters = {}, options = {}) {
    const filterQuery = this.buildFilterQuery(filters);
    let endpoint = `${this.url}/rest/v1/${table}`;

    if (filterQuery) {
      endpoint += `?${filterQuery}`;
    }

    const headers = this.buildHeaders({
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation'
    });

    const fetchOptions = {
      method,
      headers
    };

    if (data !== null && method !== 'GET' && method !== 'DELETE') {
      fetchOptions.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, fetchOptions);
    return await this.handleResponse(response);
  }

  async select(table, filters = {}, select = '*', extraQuery = '') {
    const params = new URLSearchParams();
    params.set('select', select);

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, `eq.${value}`);
      }
    }

    let endpoint = `${this.url}/rest/v1/${table}?${params.toString()}`;

    if (extraQuery) {
      endpoint += `&${extraQuery}`;
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      })
    });

    return await this.handleResponse(response);
  }

  async insert(table, data) {
    const payload = Array.isArray(data) ? data : [data];

    return await this.query(table, 'POST', payload, {}, {
      prefer: 'return=representation'
    });
  }

  async update(table, id, data) {
    const endpoint = `${this.url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`;

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      }),
      body: JSON.stringify(data)
    });

    return await this.handleResponse(response);
  }

  async updateByFilter(table, filters = {}, data = {}) {
    const filterQuery = this.buildFilterQuery(filters);
    let endpoint = `${this.url}/rest/v1/${table}`;

    if (filterQuery) {
      endpoint += `?${filterQuery}`;
    }

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      }),
      body: JSON.stringify(data)
    });

    return await this.handleResponse(response);
  }

  async delete(table, id) {
    const endpoint = `${this.url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`;

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      })
    });

    return await this.handleResponse(response);
  }

  async deleteByFilter(table, filters = {}) {
    const filterQuery = this.buildFilterQuery(filters);
    let endpoint = `${this.url}/rest/v1/${table}`;

    if (filterQuery) {
      endpoint += `?${filterQuery}`;
    }

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      })
    });

    return await this.handleResponse(response);
  }

  // ===============================
  // STORAGE
  // ===============================
  async uploadFile(bucket, path, file) {
    const endpoint = `${this.url}/storage/v1/object/${bucket}/${path}`;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: formData
    });

    return await this.handleResponse(response);
  }

  async deleteFile(bucket, path) {
    const endpoint = `${this.url}/storage/v1/object/${bucket}/${path}`;

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: this.buildHeaders()
    });

    return await this.handleResponse(response);
  }

  async listFiles(bucket, path = '') {
    const endpoint = `${this.url}/storage/v1/object/list/${bucket}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.buildHeaders({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        prefix: path
      })
    });

    return await this.handleResponse(response);
  }

  getFileUrl(bucket, path) {
    return `${this.url}/storage/v1/object/public/${bucket}/${path}`;
  }
}

// ===============================
// INSTÂNCIA GLOBAL
// ===============================
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===============================
// PROJECTS
// ===============================
async function getPublicProjects() {
  const endpoint =
    `${SUPABASE_URL}/rest/v1/projects` +
    `?select=*` +
    `&is_public=eq.true` +
    `&order=created_at.desc`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    }
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
}

async function getProjectsByUser(userId) {
  const endpoint =
    `${SUPABASE_URL}/rest/v1/projects` +
    `?select=*` +
    `&user_id=eq.${encodeURIComponent(userId)}` +
    `&order=created_at.desc`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    }
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
}

async function getProjectById(projectId) {
  const endpoint =
    `${SUPABASE_URL}/rest/v1/projects` +
    `?select=*` +
    `&id=eq.${encodeURIComponent(projectId)}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    }
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  return data[0] || null;
}

async function createProject(project) {
  const payload = [
    {
      ...project,
      created_at: project.created_at || new Date().toISOString(),
      updated_at: project.updated_at || new Date().toISOString()
    }
  ];

  const response = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  return data[0] || null;
}

async function updateProject(projectId, updates) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/projects?id=eq.${encodeURIComponent(projectId)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString()
      })
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  return data[0] || null;
}

async function deleteProjectFromDb(projectId) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/projects?id=eq.${encodeURIComponent(projectId)}`,
    {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      }
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return true;
}