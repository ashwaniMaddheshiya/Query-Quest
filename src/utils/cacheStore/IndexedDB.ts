const DB_NAME = "myDatabase";
const DB_VERSION = 1;
let db: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

export const openDb = (): Promise<IDBDatabase> => {
  if (db) {
    return Promise.resolve(db);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event: Event) => {
      console.error("Error opening IndexedDB:", (event.target as IDBOpenDBRequest)?.error);
      reject((event.target as IDBOpenDBRequest)?.error || new Error("Unknown IndexedDB error"));
    };

    request.onsuccess = (event: Event) => {
      db = (event.target as IDBOpenDBRequest)?.result as IDBDatabase;
      if (db) {
        resolve(db);
      } else {
        reject(new Error("Failed to open IndexedDB"));
      }
    };

    request.onupgradeneeded = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest)?.result as IDBDatabase;
      if (db && !db.objectStoreNames.contains("cacheStore")) {
        db.createObjectStore("cacheStore", { autoIncrement: true });
      }
    };
  });

  return dbPromise;
};

export const storeDataWithExpiry = async (
  key: string,
  data: any
): Promise<void> => {
  try {
    const db = await openDb();
    const transaction = db.transaction(["cacheStore"], "readwrite");
    const store = transaction.objectStore("cacheStore");
    const timestamp = Date.now();
    const expiry = timestamp + 3600 * 1000; // 1 hour expiry

    const item = {
      data: data,
      expiry: expiry,
    };

    await store.put(item, key);
  } catch (error) {
    console.error("Error storing data in IndexedDB:", error);
    throw error; // Propagate error for handling upstream
  }
};

export const removeExpiredData = async (): Promise<void> => {
  try {
    const db = await openDb();
    const transaction = db.transaction(["cacheStore"], "readwrite");
    const store = transaction.objectStore("cacheStore");
    const now = Date.now();

    store.openCursor().onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest)?.result as IDBCursorWithValue | null;
      if (cursor) {
        if (cursor.value.expiry && cursor.value.expiry <= now) {
          store.delete(cursor.primaryKey);
        }
        cursor.continue();
      }
    };
  } catch (error) {
    console.error("Error removing expired data from IndexedDB:", error);
    throw error; // Propagate error for handling upstream
  }
};

// Ensure periodic cleanup of expired data
setInterval(() => {
  removeExpiredData().catch((error) => {
    console.error("Error in periodic data cleanup:", error);
  });
}, 3600 * 1000); // 1 hour interval
