// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Dịch vụ lưu trữ dựa trên IndexedDB — gần như không giới hạn dung lượng (thay thế localStorage/sessionStorage).
// [VI] Thực thi một bước trong luồng xử lý.
 * Dùng cache in-memory để đọc đồng bộ; mọi thao tác ghi đều được lưu bền vững xuống IndexedDB.
// [VI] Thực thi một bước trong luồng xử lý.
 */

// [VI] Khai báo biến/hằng số.
const DB_NAME = 'VietTuneDB';
// [VI] Khai báo biến/hằng số.
const DB_VERSION = 1;
// [VI] Khai báo biến/hằng số.
const STORE_NAME = 'kv';
// [VI] Khai báo biến/hằng số.
const SESSION_PREFIX = 'session_';

// [VI] Thực thi một bước trong luồng xử lý.
/** Giá trị lớn hơn ngưỡng này sẽ không giữ trong bộ nhớ để tránh OOM (vd: localRecordings dạng base64). */
// [VI] Khai báo biến/hằng số.
const MAX_CACHE_VALUE_SIZE = 200 * 1024; // 200KB

// [VI] Thực thi một bước trong luồng xử lý.
/** Số lượng phần tử cache tối đa để tránh tăng bộ nhớ không kiểm soát. */
// [VI] Khai báo biến/hằng số.
const MAX_CACHE_KEYS = 200;

// [VI] Thực thi một bước trong luồng xử lý.
/** Các key quan trọng cho auth phải có trong cache sau hydrate để getItem đồng bộ hoạt động khi khởi tạo app. */
// [VI] Khai báo biến/hằng số.
const AUTH_KEYS = ['user', 'access_token'];

// [VI] Khai báo biến/hằng số.
let db: IDBDatabase | null = null;
// [VI] Khai báo biến/hằng số.
const cache = new Map<string, string>();

// [VI] Khai báo hàm/biểu thức hàm.
function openDB(): Promise<IDBDatabase> {
// [VI] Rẽ nhánh điều kiện (if).
  if (db) return Promise.resolve(db);
// [VI] Khai báo hàm/biểu thức hàm.
  return new Promise((resolve, reject) => {
// [VI] Khai báo biến/hằng số.
    const request = indexedDB.open(DB_NAME, DB_VERSION);
// [VI] Khai báo hàm/biểu thức hàm.
    request.onerror = () => reject(request.error);
// [VI] Khai báo hàm/biểu thức hàm.
    request.onsuccess = () => {
// [VI] Thực thi một bước trong luồng xử lý.
      db = request.result;
// [VI] Thực thi một bước trong luồng xử lý.
      resolve(db);
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Khai báo hàm/biểu thức hàm.
    request.onupgradeneeded = (event) => {
// [VI] Khai báo biến/hằng số.
      const database = (event.target as IDBOpenDBRequest).result;
// [VI] Rẽ nhánh điều kiện (if).
      if (!database.objectStoreNames.contains(STORE_NAME)) {
// [VI] Thực thi một bước trong luồng xử lý.
        database.createObjectStore(STORE_NAME);
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function getStore(mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
// [VI] Khai báo hàm/biểu thức hàm.
  return openDB().then((database) => {
// [VI] Khai báo biến/hằng số.
    const tx = database.transaction(STORE_NAME, mode);
// [VI] Trả về kết quả từ hàm.
    return tx.objectStore(STORE_NAME);
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Put one key-value into IndexedDB. Used during migration to avoid holding all values in memory.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Khai báo hàm/biểu thức hàm.
function putOne(database: IDBDatabase, key: string, value: string): Promise<void> {
// [VI] Khai báo hàm/biểu thức hàm.
  return new Promise((resolve, reject) => {
// [VI] Khai báo biến/hằng số.
    const tx = database.transaction(STORE_NAME, 'readwrite');
// [VI] Khai báo biến/hằng số.
    const store = tx.objectStore(STORE_NAME);
// [VI] Thực thi một bước trong luồng xử lý.
    store.put(value, key);
// [VI] Khai báo hàm/biểu thức hàm.
    tx.oncomplete = () => resolve();
// [VI] Khai báo hàm/biểu thức hàm.
    tx.onerror = () => reject(tx.error);
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Migrate all keys from localStorage and sessionStorage into IndexedDB.
// [VI] Thực thi một bước trong luồng xử lý.
 * Processes one key at a time to avoid OOM when localRecordings or other large values exist.
// [VI] Thực thi một bước trong luồng xử lý.
 * Session keys are stored with prefix "session_" so they can be read via getItem("session_*").
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Thực thi một bước trong luồng xử lý.
async function migrateFromLegacy(): Promise<void> {
// [VI] Rẽ nhánh điều kiện (if).
  if (typeof window === 'undefined') return;

// [VI] Khai báo biến/hằng số.
  const database = await openDB();

// [VI] Thực thi một bước trong luồng xử lý.
  // Collect only keys (cheap); then process each key's value one-by-one so we never hold multiple large values.
// [VI] Khai báo biến/hằng số.
  const localKeys: string[] = [];
// [VI] Vòng lặp (for).
  for (let i = 0; i < localStorage.length; i++) {
// [VI] Khai báo biến/hằng số.
    const k = localStorage.key(i);
// [VI] Rẽ nhánh điều kiện (if).
    if (k) localKeys.push(k);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Khai báo biến/hằng số.
  const sessionKeys: string[] = [];
// [VI] Vòng lặp (for).
  for (let i = 0; i < sessionStorage.length; i++) {
// [VI] Khai báo biến/hằng số.
    const k = sessionStorage.key(i);
// [VI] Rẽ nhánh điều kiện (if).
    if (k) sessionKeys.push(k);
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Vòng lặp (for).
  for (const key of localKeys) {
// [VI] Khai báo biến/hằng số.
    const value = localStorage.getItem(key);
// [VI] Rẽ nhánh điều kiện (if).
    if (value !== null) {
// [VI] Thực thi một bước trong luồng xử lý.
      await putOne(database, key, value);
// [VI] Rẽ nhánh điều kiện (if).
      if (value.length <= MAX_CACHE_VALUE_SIZE && cache.size < MAX_CACHE_KEYS) {
// [VI] Thực thi một bước trong luồng xử lý.
        cache.set(key, value);
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Vòng lặp (for).
  for (const key of sessionKeys) {
// [VI] Khai báo biến/hằng số.
    const value = sessionStorage.getItem(key);
// [VI] Rẽ nhánh điều kiện (if).
    if (value !== null) {
// [VI] Khai báo biến/hằng số.
      const storedKey = SESSION_PREFIX + key;
// [VI] Thực thi một bước trong luồng xử lý.
      await putOne(database, storedKey, value);
// [VI] Rẽ nhánh điều kiện (if).
      if (value.length <= MAX_CACHE_VALUE_SIZE && cache.size < MAX_CACHE_KEYS) {
// [VI] Thực thi một bước trong luồng xử lý.
        cache.set(storedKey, value);
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Thực thi một bước trong luồng xử lý.
    localStorage.clear();
// [VI] Thực thi một bước trong luồng xử lý.
    sessionStorage.clear();
// [VI] Thực thi một bước trong luồng xử lý.
  } catch {
// [VI] Thực thi một bước trong luồng xử lý.
    // ignore
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Load keys from IndexedDB into the in-memory cache (for sync getItem).
// [VI] Thực thi một bước trong luồng xử lý.
 * Values larger than MAX_CACHE_VALUE_SIZE are skipped to avoid OOM (e.g. localRecordings).
// [VI] Thực thi một bước trong luồng xử lý.
 * Stops when cache has MAX_CACHE_KEYS entries to cap memory.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Thực thi một bước trong luồng xử lý.
async function loadAllIntoCache(): Promise<void> {
// [VI] Khai báo biến/hằng số.
  const database = await openDB();
// [VI] Khai báo hàm/biểu thức hàm.
  return new Promise((resolve, reject) => {
// [VI] Khai báo biến/hằng số.
    const tx = database.transaction(STORE_NAME, 'readonly');
// [VI] Khai báo biến/hằng số.
    const store = tx.objectStore(STORE_NAME);
// [VI] Khai báo biến/hằng số.
    const req = store.openCursor();
// [VI] Khai báo hàm/biểu thức hàm.
    req.onsuccess = () => {
// [VI] Khai báo biến/hằng số.
      const cursor = req.result;
// [VI] Rẽ nhánh điều kiện (if).
      if (cursor) {
// [VI] Rẽ nhánh điều kiện (if).
        if (cache.size >= MAX_CACHE_KEYS) {
// [VI] Thực thi một bước trong luồng xử lý.
          resolve();
// [VI] Thực thi một bước trong luồng xử lý.
          return;
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Khai báo biến/hằng số.
        const value = cursor.value as string;
// [VI] Rẽ nhánh điều kiện (if).
        if (typeof value === 'string' && value.length <= MAX_CACHE_VALUE_SIZE) {
// [VI] Thực thi một bước trong luồng xử lý.
          cache.set(cursor.key as string, value);
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Thực thi một bước trong luồng xử lý.
        cursor.continue();
// [VI] Thực thi một bước trong luồng xử lý.
      } else {
// [VI] Thực thi một bước trong luồng xử lý.
        resolve();
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Khai báo hàm/biểu thức hàm.
    req.onerror = () => reject(req.error);
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Ensure auth-critical keys are in cache so sync getItem("user") / getItem("access_token") work
// [VI] Thực thi một bước trong luồng xử lý.
 * after hydrate (loadAllIntoCache may stop at MAX_CACHE_KEYS and skip these).
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Thực thi một bước trong luồng xử lý.
async function ensureAuthKeysInCache(): Promise<void> {
// [VI] Khai báo biến/hằng số.
  const database = await openDB();
// [VI] Vòng lặp (for).
  for (const key of AUTH_KEYS) {
// [VI] Rẽ nhánh điều kiện (if).
    if (cache.has(key)) continue;
// [VI] Khai báo biến/hằng số.
    const value = await new Promise<string | null>((resolve, reject) => {
// [VI] Khai báo biến/hằng số.
      const tx = database.transaction(STORE_NAME, 'readonly');
// [VI] Khai báo biến/hằng số.
      const req = tx.objectStore(STORE_NAME).get(key);
// [VI] Khai báo hàm/biểu thức hàm.
      req.onsuccess = () => resolve(req.result ?? null);
// [VI] Khai báo hàm/biểu thức hàm.
      req.onerror = () => reject(req.error);
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Rẽ nhánh điều kiện (if).
    if (value !== null && value.length <= MAX_CACHE_VALUE_SIZE) {
// [VI] Thực thi một bước trong luồng xử lý.
      cache.set(key, value);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Run once before app uses storage: migrate legacy storage and hydrate cache.
// [VI] Thực thi một bước trong luồng xử lý.
 * Must be awaited before rendering the app.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function hydrate(): Promise<void> {
// [VI] Rẽ nhánh điều kiện (if).
  if (typeof window === 'undefined') return;
// [VI] Thực thi một bước trong luồng xử lý.
  await openDB();
// [VI] Thực thi một bước trong luồng xử lý.
  await migrateFromLegacy();
// [VI] Thực thi một bước trong luồng xử lý.
  await loadAllIntoCache();
// [VI] Thực thi một bước trong luồng xử lý.
  await ensureAuthKeysInCache();
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Sync get (from cache). Returns null if key is missing or not cached (e.g. large values).
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function getItem(key: string): string | null {
// [VI] Khai báo biến/hằng số.
  const v = cache.get(key);
// [VI] Trả về kết quả từ hàm.
  return v !== undefined ? v : null;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Async get: from cache or from IndexedDB. Use for large keys (e.g. localRecordings) to avoid OOM.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function getItemAsync(key: string): Promise<string | null> {
// [VI] Khai báo biến/hằng số.
  const cached = cache.get(key);
// [VI] Rẽ nhánh điều kiện (if).
  if (cached !== undefined) return Promise.resolve(cached);
// [VI] Khai báo hàm/biểu thức hàm.
  return getStore('readonly').then((store) => {
// [VI] Khai báo hàm/biểu thức hàm.
    return new Promise<string | null>((resolve, reject) => {
// [VI] Khai báo biến/hằng số.
      const req = store.get(key);
// [VI] Khai báo hàm/biểu thức hàm.
      req.onsuccess = () => resolve(req.result ?? null);
// [VI] Khai báo hàm/biểu thức hàm.
      req.onerror = () => reject(req.error);
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Evict oldest cache entries (by insertion order) until size <= MAX_CACHE_KEYS.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Khai báo hàm/biểu thức hàm.
function evictCacheIfNeeded(): void {
// [VI] Rẽ nhánh điều kiện (if).
  if (cache.size <= MAX_CACHE_KEYS) return;
// [VI] Khai báo biến/hằng số.
  const toDelete = cache.size - MAX_CACHE_KEYS;
// [VI] Khai báo biến/hằng số.
  const keys = Array.from(cache.keys());
// [VI] Vòng lặp (for).
  for (let i = 0; i < toDelete && i < keys.length; i++) {
// [VI] Thực thi một bước trong luồng xử lý.
    cache.delete(keys[i]);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Async set: updates cache immediately and persists to IndexedDB.
// [VI] Thực thi một bước trong luồng xử lý.
 * Large values are not cached to avoid OOM. Cache size is capped by MAX_CACHE_KEYS.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function setItem(key: string, value: string): Promise<void> {
// [VI] Rẽ nhánh điều kiện (if).
  if (value.length <= MAX_CACHE_VALUE_SIZE) {
// [VI] Thực thi một bước trong luồng xử lý.
    cache.set(key, value);
// [VI] Thực thi một bước trong luồng xử lý.
    evictCacheIfNeeded();
// [VI] Thực thi một bước trong luồng xử lý.
  } else {
// [VI] Thực thi một bước trong luồng xử lý.
    cache.delete(key);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Khai báo hàm/biểu thức hàm.
  return getStore('readwrite').then((store) => {
// [VI] Khai báo hàm/biểu thức hàm.
    return new Promise((resolve, reject) => {
// [VI] Khai báo biến/hằng số.
      const req = store.put(value, key);
// [VI] Khai báo hàm/biểu thức hàm.
      req.onsuccess = () => resolve();
// [VI] Khai báo hàm/biểu thức hàm.
      req.onerror = () => reject(req.error);
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Async remove: deletes from cache and IndexedDB.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function removeItem(key: string): Promise<void> {
// [VI] Thực thi một bước trong luồng xử lý.
  cache.delete(key);
// [VI] Khai báo hàm/biểu thức hàm.
  return getStore('readwrite').then((store) => {
// [VI] Khai báo hàm/biểu thức hàm.
    return new Promise((resolve, reject) => {
// [VI] Khai báo biến/hằng số.
      const req = store.delete(key);
// [VI] Khai báo hàm/biểu thức hàm.
      req.onsuccess = () => resolve();
// [VI] Khai báo hàm/biểu thức hàm.
      req.onerror = () => reject(req.error);
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Session key helpers: map session_* keys so callers can use the same key names as sessionStorage.
// [VI] Thực thi một bước trong luồng xử lý.
 * e.g. sessionGetItem("fromLogout") -> getItem("session_fromLogout")
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function sessionGetItem(key: string): string | null {
// [VI] Trả về kết quả từ hàm.
  return getItem(SESSION_PREFIX + key);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function sessionSetItem(key: string, value: string): Promise<void> {
// [VI] Trả về kết quả từ hàm.
  return setItem(SESSION_PREFIX + key, value);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function sessionRemoveItem(key: string): Promise<void> {
// [VI] Trả về kết quả từ hàm.
  return removeItem(SESSION_PREFIX + key);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const storage = {
// [VI] Thực thi một bước trong luồng xử lý.
  getItem,
// [VI] Thực thi một bước trong luồng xử lý.
  getItemAsync,
// [VI] Thực thi một bước trong luồng xử lý.
  setItem,
// [VI] Thực thi một bước trong luồng xử lý.
  removeItem,
// [VI] Thực thi một bước trong luồng xử lý.
  hydrate,
// [VI] Thực thi một bước trong luồng xử lý.
  sessionGetItem,
// [VI] Thực thi một bước trong luồng xử lý.
  sessionSetItem,
// [VI] Thực thi một bước trong luồng xử lý.
  sessionRemoveItem,
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất mặc định (export default) nội dung chính của module.
export default storage;
