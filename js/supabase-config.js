// Configuração Supabase
const SUPABASE_URL = 'https://ufadmcuylkplkyjmqypx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmYWRtY3V5bGtwbGt5am1xeXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDExOTQsImV4cCI6MjA4ODkxNzE5NH0.csadEk-Ka8eEJibVUbiA_Bbeh5EwmlwVYjPO29SuCbg';

// Cliente Supabase simples (REST API)
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async query(table, method = 'GET', data = null, filters = {}) {
    let endpoint = `${this.url}/rest/v1/${table}`;
    
    // Adicionar filtros à query
    const filterEntries = Object.entries(filters);
    if (filterEntries.length > 0) {
      const filterStr = filterEntries.map(([k, v]) => `${k}=eq.${v}`).join('&');
      endpoint += `?${filterStr}`;
    }

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro na requisição');
    }

    return await response.json();
  }

  async insert(table, data) {
    return this.query(table, 'POST', data);
  }

  async select(table, filters = {}) {
    return this.query(table, 'GET', null, filters);
  }

  async update(table, id, data) {
    const endpoint = `${this.url}/rest/v1/${table}?id=eq.${id}`;
    const options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(endpoint, options);
    return response.json();
  }

  async delete(table, id) {
    const endpoint = `${this.url}/rest/v1/${table}?id=eq.${id}`;
    const options = {
      method: 'DELETE',
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
      },
    };
    const response = await fetch(endpoint, options);
    return response.ok;
  }
}

// Instância global do Supabase
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
