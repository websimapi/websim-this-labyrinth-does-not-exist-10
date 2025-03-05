// This is a placeholder for the actual WebsimSocket implementation
// In the real environment, this will be provided by the platform
class WebsimSocket {
  constructor() {
    this.party = {
      client: { id: 'local-client', username: 'local-user' },
      peers: { 'local-client': { username: 'local-user' } },
      subscribe: (callback) => {
        callback(this.party.peers);
        return () => {};
      }
    };
    this.onmessage = null;
    this._collections = {};
  }

  send(data) {
    console.log('Sending data:', data);
    if (this.onmessage && data.echo !== false) {
      const event = {
        data: {
          ...data,
          clientId: this.party.client.id,
          username: this.party.client.username
        }
      };
      setTimeout(() => this.onmessage(event), 0);
    }
  }

  collection(type) {
    if (!this._collections[type]) {
      this._collections[type] = new Collection(type);
    }
    return this._collections[type];
  }
}

class Collection {
  constructor(type) {
    this.type = type;
    this.records = [];
    this.subscribers = [];
    this.filters = {};
  }

  filter(filters) {
    const collection = new Collection(this.type);
    collection.records = this.records;
    collection.filters = { ...this.filters, ...filters };
    return collection;
  }

  getList() {
    return this.records
      .filter(record => {
        for (const key in this.filters) {
          if (this.filters[key] === null) {
            if (record[key] !== null && record[key] !== undefined) return false;
          } else if (record[key] !== this.filters[key]) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async create(data) {
    const record = {
      ...data,
      id: `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: this.type,
      username: 'local-user',
      created_at: new Date().toISOString()
    };
    this.records.push(record);
    this._notifySubscribers();
    return record;
  }

  async update(id, data) {
    const index = this.records.findIndex(r => r.id === id);
    if (index !== -1) {
      this.records[index] = { ...this.records[index], ...data };
      this._notifySubscribers();
      return this.records[index];
    }
    return null;
  }

  async delete(id) {
    const index = this.records.findIndex(r => r.id === id);
    if (index !== -1) {
      this.records.splice(index, 1);
      this._notifySubscribers();
      return true;
    }
    return false;
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.getList());
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  _notifySubscribers() {
    const list = this.getList();
    this.subscribers.forEach(callback => callback(list));
  }
}

// Mock websim global object for local development
if (typeof window !== 'undefined' && !window.websim) {
  window.websim = {
    chat: {
      completions: {
        create: async ({ messages }) => {
          console.log('LLM Call with messages:', messages);
          return {
            content: "This is a mock LLM response. In the real environment, this would be a response from the language model."
          };
        }
      }
    },
    imageGen: async ({ prompt, aspect_ratio }) => {
      console.log('Image generation with prompt:', prompt, 'aspect_ratio:', aspect_ratio);
      return {
        url: 'https://placehold.co/600x400/333/888?text=Generated+Image'
      };
    },
    upload: async (file) => {
      console.log('File upload:', file);
      return 'https://placehold.co/600x400/333/888?text=Uploaded+File';
    },
    getCreatedBy: async () => {
      return { username: 'creator-user' };
    }
  };
}

