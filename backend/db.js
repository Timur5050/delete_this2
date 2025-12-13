const fs = require('fs');
const path = require('path');

// Simple file-based database for development
const DB_DIR = path.join(__dirname, 'data');
const SNAPSHOTS_FILE = path.join(DB_DIR, 'snapshots.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Ensure snapshots file exists
if (!fs.existsSync(SNAPSHOTS_FILE)) {
  fs.writeFileSync(SNAPSHOTS_FILE, JSON.stringify([], null, 2));
}

class FileDB {
  // Query method to mimic pg pool interface
  async query(sql, params = []) {
    try {
      if (sql.includes('CREATE TABLE')) {
        return { rows: [] };
      }
      
      if (sql.includes('INSERT INTO snapshots')) {
        const [name, description, data] = params;
        const snapshots = this._readSnapshots();
        const nextId = snapshots.length > 0 ? Math.max(...snapshots.map(s => s.id)) + 1 : 1;
        const newSnapshot = {
          id: nextId,
          name,
          description,
          data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        snapshots.push(newSnapshot);
        this._writeSnapshots(snapshots);
        return { rows: [newSnapshot] };
      }
      
      if (sql.includes('SELECT * FROM snapshots WHERE id')) {
        const snapshots = this._readSnapshots();
        const id = params[0];
        const snapshot = snapshots.find(s => s.id === parseInt(id));
        return { rows: snapshot ? [snapshot] : [] };
      }
      
      if (sql.includes('SELECT id, name, description, created_at FROM snapshots')) {
        const snapshots = this._readSnapshots();
        const result = snapshots.map(s => ({ 
          id: s.id, 
          name: s.name, 
          description: s.description, 
          created_at: s.created_at 
        }));
        return { rows: result };
      }
      
      return { rows: [] };
    } catch (error) {
      console.error('DB Error:', error);
      throw error;
    }
  }

  _readSnapshots() {
    try {
      const data = fs.readFileSync(SNAPSHOTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  _writeSnapshots(snapshots) {
    fs.writeFileSync(SNAPSHOTS_FILE, JSON.stringify(snapshots, null, 2));
  }
}

module.exports = new FileDB();
