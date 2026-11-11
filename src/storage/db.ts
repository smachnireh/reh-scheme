import { Site } from '../types';

const DB_NAME = 'ArchaeologyCentralAsiaDB';
const DB_VERSION = 1;

interface StoragePayload {
  favorites: string[];
  notes: Record<string, string>;
  customSites: Site[];
  searchHistory: string[];
  exportedAt: string;
}

// Helpers for localStorage fallback
const LS_PREFIX = 'arca_ca_';

function getLS<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(LS_PREFIX + key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setLS<T>(key: string, val: T): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

// IndexedDB initialization
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'siteId' });
      }
      if (!db.objectStoreNames.contains('favorites')) {
        db.createObjectStore('favorites', { keyPath: 'siteId' });
      }
      if (!db.objectStoreNames.contains('customSites')) {
        db.createObjectStore('customSites', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// FAVORITES
export async function getFavorites(): Promise<string[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('favorites', 'readonly');
      const store = tx.objectStore('favorites');
      const req = store.getAll();
      req.onsuccess = () => {
        const ids = (req.result || []).map((item: { siteId: string }) => item.siteId);
        resolve(ids);
      };
      req.onerror = () => resolve(getLS<string[]>('favorites', []));
    });
  } catch {
    return getLS<string[]>('favorites', []);
  }
}

export async function toggleFavorite(siteId: string): Promise<boolean> {
  const current = await getFavorites();
  const exists = current.includes(siteId);
  const updated = exists ? current.filter(id => id !== siteId) : [...current, siteId];

  setLS('favorites', updated);

  try {
    const db = await openDatabase();
    const tx = db.transaction('favorites', 'readwrite');
    const store = tx.objectStore('favorites');
    if (exists) {
      store.delete(siteId);
    } else {
      store.put({ siteId, addedAt: Date.now() });
    }
  } catch (e) {
    console.warn('IDB write failed, fell back to localStorage', e);
  }

  return !exists;
}

// NOTES
export async function getNotes(): Promise<Record<string, string>> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('notes', 'readonly');
      const store = tx.objectStore('notes');
      const req = store.getAll();
      req.onsuccess = () => {
        const notesMap: Record<string, string> = {};
        (req.result || []).forEach((item: { siteId: string; content: string }) => {
          notesMap[item.siteId] = item.content;
        });
        resolve(notesMap);
      };
      req.onerror = () => resolve(getLS<Record<string, string>>('notes', {}));
    });
  } catch {
    return getLS<Record<string, string>>('notes', {});
  }
}

export async function saveNote(siteId: string, content: string): Promise<void> {
  const currentNotes = await getNotes();
  if (content.trim()) {
    currentNotes[siteId] = content;
  } else {
    delete currentNotes[siteId];
  }
  setLS('notes', currentNotes);

  try {
    const db = await openDatabase();
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    if (content.trim()) {
      store.put({ siteId, content, updatedAt: Date.now() });
    } else {
      store.delete(siteId);
    }
  } catch (e) {
    console.warn('IDB note save error', e);
  }
}

// CUSTOM SITES
export async function getCustomSites(): Promise<Site[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('customSites', 'readonly');
      const store = tx.objectStore('customSites');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve(getLS<Site[]>('customSites', []));
    });
  } catch {
    return getLS<Site[]>('customSites', []);
  }
}

export async function saveCustomSite(site: Site): Promise<void> {
  const current = await getCustomSites();
  const filtered = current.filter(s => s.id !== site.id);
  const updated = [...filtered, site];
  setLS('customSites', updated);

  try {
    const db = await openDatabase();
    const tx = db.transaction('customSites', 'readwrite');
    tx.objectStore('customSites').put(site);
  } catch (e) {
    console.warn('IDB save custom site error', e);
  }
}

export async function deleteCustomSite(id: string): Promise<void> {
  const current = await getCustomSites();
  const updated = current.filter(s => s.id !== id);
  setLS('customSites', updated);

  try {
    const db = await openDatabase();
    const tx = db.transaction('customSites', 'readwrite');
    tx.objectStore('customSites').delete(id);
  } catch (e) {
    console.warn('IDB delete error', e);
  }
}

// SEARCH HISTORY
export async function getSearchHistory(): Promise<string[]> {
  return getLS<string[]>('searchHistory', [
    'Тешик-Таш',
    'пещеры палеолита',
    'Кельтеминарская культура',
    'БМАК бронзовый век'
  ]);
}

export async function addSearchHistory(query: string): Promise<string[]> {
  const clean = query.trim();
  if (!clean || clean.length < 2) return getSearchHistory();
  const current = await getSearchHistory();
  const filtered = current.filter(item => item.toLowerCase() !== clean.toLowerCase());
  const updated = [clean, ...filtered].slice(0, 10);
  setLS('searchHistory', updated);
  return updated;
}

export async function clearSearchHistory(): Promise<void> {
  setLS('searchHistory', []);
}

// EXPORT USER DATA TO JSON
export async function exportUserDataAsJSON(): Promise<string> {
  const [favorites, notes, customSites, searchHistory] = await Promise.all([
    getFavorites(),
    getNotes(),
    getCustomSites(),
    getSearchHistory()
  ]);

  const payload: StoragePayload = {
    favorites,
    notes,
    customSites,
    searchHistory,
    exportedAt: new Date().toISOString()
  };

  return JSON.stringify(payload, null, 2);
}

// IMPORT USER DATA FROM JSON
export async function importUserDataFromJSON(jsonString: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const data = JSON.parse(jsonString) as Partial<StoragePayload>;
    if (!data || typeof data !== 'object') {
      throw new Error('Некорректный формат файла JSON');
    }

    if (Array.isArray(data.favorites)) {
      setLS('favorites', data.favorites);
      for (const id of data.favorites) {
        try {
          const db = await openDatabase();
          const tx = db.transaction('favorites', 'readwrite');
          tx.objectStore('favorites').put({ siteId: id, addedAt: Date.now() });
        } catch {}
      }
    }

    if (data.notes && typeof data.notes === 'object') {
      setLS('notes', data.notes);
      for (const [siteId, content] of Object.entries(data.notes)) {
        try {
          const db = await openDatabase();
          const tx = db.transaction('notes', 'readwrite');
          tx.objectStore('notes').put({ siteId, content, updatedAt: Date.now() });
        } catch {}
      }
    }

    let customCount = 0;
    if (Array.isArray(data.customSites)) {
      setLS('customSites', data.customSites);
      customCount = data.customSites.length;
      for (const site of data.customSites) {
        try {
          const db = await openDatabase();
          const tx = db.transaction('customSites', 'readwrite');
          tx.objectStore('customSites').put(site);
        } catch {}
      }
    }

    return { success: true, count: customCount };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Неизвестная ошибка при импорте';
    return { success: false, count: 0, error: message };
  }
}
