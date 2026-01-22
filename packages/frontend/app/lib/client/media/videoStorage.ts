const DB_CONFIG = {
  name: "SimulationStorage",
  version: 1,
  store: "media",
  key: "latest_recording",
} as const;

export interface MediaRecord {
  id: string;
  blob: Blob;
  type: "video" | "audio";
  updatedAt: number;
}

/**
 * IndexedDB 연결 및 초기화 (내부 전용)
 */
const getDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_CONFIG.store)) {
        db.createObjectStore(DB_CONFIG.store, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("IDB 열기 실패");
  });
};

/**
 * 미디어(비디오/오디오) Blob 저장
 */
export const saveMedia = async (blob: Blob, type: "video" | "audio") => {
  const db = await getDB();
  const transaction = db.transaction(DB_CONFIG.store, "readwrite");
  const store = transaction.objectStore(DB_CONFIG.store);

  store.put({
    id: DB_CONFIG.key,
    blob,
    type,
    updatedAt: Date.now(),
  });
};

/**
 * 녹화된 비디오 Blob 저장 (하위 호환성 유지)
 */
export const saveRecordedVideo = async (blob: Blob) => {
  return saveMedia(blob, "video");
};

export const getLatestMedia = async () => {
  const db = await getDB();
  return new Promise<Blob | null>((resolve) => {
    const transaction = db.transaction(DB_CONFIG.store, "readonly");
    const request = transaction.objectStore(DB_CONFIG.store).get(DB_CONFIG.key);

    request.onsuccess = () => resolve(request.result?.blob || null);
    request.onerror = () => resolve(null);
  });
};

/**
 * 최신 비디오 조회 (하위 호환성 유지)
 */
export const fetchLatestVideo = async () => {
  return getLatestMedia();
};
