const DB_CONFIG = {
  name: "SimulationStorage",
  version: 1,
  store: "media",
  keys: {
    video: "latest_video",
    audio: "latest_audio",
  },
} as const;

export interface MediaRecord {
  id: string;
  blob: Blob;
  type: 'video' | 'audio';
  updatedAt: number;
}

/**
 * IndexedDB 연결 및 초기화
 */
const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
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
export const saveMedia = async (blob: Blob, type: 'video' | 'audio'): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction(DB_CONFIG.store, "readwrite");
  const store = transaction.objectStore(DB_CONFIG.store);

  const key = type === 'video' ? DB_CONFIG.keys.video : DB_CONFIG.keys.audio;

  store.put({
    id: key,
    blob,
    type,
    updatedAt: Date.now(),
  });
};

/**
 * 비디오 저장
 */
export const saveVideo = async (blob: Blob): Promise<void> => {
  return saveMedia(blob, 'video');
};

/**
 * 오디오 저장
 */
export const saveAudio = async (blob: Blob): Promise<void> => {
  return saveMedia(blob, 'audio');
};

export const getLatestMedia = async (type: 'video' | 'audio'): Promise<Blob | null> => {
  const db = await getDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(DB_CONFIG.store, "readonly");
    const key = type === 'video' ? DB_CONFIG.keys.video : DB_CONFIG.keys.audio;
    const request = transaction.objectStore(DB_CONFIG.store).get(key);

    request.onsuccess = () => resolve(request.result?.blob || null);
    request.onerror = () => resolve(null);
  });
};

/**
 * 비디오 조회
 */
export const getLatestVideo = async (): Promise<Blob | null> => {
  return getLatestMedia('video');
};

/**
 * 오디오 조회
 */
export const getLatestAudio = async (): Promise<Blob | null> => {
  return getLatestMedia('audio');
};
