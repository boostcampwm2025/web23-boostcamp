"use client";

const DB_CONFIG = {
  name: "SimulationStorage",
  version: 1,
  store: "media",
  keys: {
    video: "latest_video",
    audio: "latest_audio",
  },
} as const;

const buildInterviewKey = (type: "video" | "audio", interviewId: string) => {
  return `${type}:${interviewId}`;
};

/**
 * IndexedDB 연결 및 초기화
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
export const saveMedia = async (
  blob: Blob,
  type: "video" | "audio",
  interviewId?: string,
) => {
  const db = await getDB();
  const transaction = db.transaction(DB_CONFIG.store, "readwrite");
  const store = transaction.objectStore(DB_CONFIG.store);

  const key = type === "video" ? DB_CONFIG.keys.video : DB_CONFIG.keys.audio;

  store.put({
    id: key,
    blob,
    type,
    updatedAt: Date.now(),
    interviewId: interviewId ?? null,
  });

  if (interviewId) {
    store.put({
      id: buildInterviewKey(type, interviewId),
      blob,
      type,
      updatedAt: Date.now(),
      interviewId,
    });
  }
};

/**
 * 비디오 저장
 */
export const saveVideo = async (blob: Blob, interviewId?: string) => {
  return saveMedia(blob, "video", interviewId);
};

/**
 * 오디오 저장
 */
export const saveAudio = async (blob: Blob, interviewId?: string) => {
  return saveMedia(blob, "audio", interviewId);
};

export const getLatestMedia = async (type: "video" | "audio") => {
  const db = await getDB();
  return new Promise<Blob | null>((resolve) => {
    const transaction = db.transaction(DB_CONFIG.store, "readonly");
    const key = type === "video" ? DB_CONFIG.keys.video : DB_CONFIG.keys.audio;
    const request = transaction.objectStore(DB_CONFIG.store).get(key);

    request.onsuccess = () => resolve(request.result?.blob || null);
    request.onerror = () => resolve(null);
  });
};

/**
 * 비디오 조회
 */
export const getLatestVideo = async () => {
  return getLatestMedia("video");
};

/**
 * 오디오 조회
 */
export const getLatestAudio = async () => {
  return getLatestMedia("audio");
};

export const getMediaByInterviewId = async (
  type: "video" | "audio",
  interviewId: string,
) => {
  const db = await getDB();
  return new Promise<Blob | null>((resolve) => {
    const transaction = db.transaction(DB_CONFIG.store, "readonly");
    const key = buildInterviewKey(type, interviewId);
    const request = transaction.objectStore(DB_CONFIG.store).get(key);

    request.onsuccess = () => resolve(request.result?.blob || null);
    request.onerror = () => resolve(null);
  });
};

export const getVideoByInterviewId = async (interviewId: string) => {
  return getMediaByInterviewId("video", interviewId);
};

/**
 * 미디어 삭제
 */
export const deleteMedia = async (type: "video" | "audio") => {
  const db = await getDB();
  const transaction = db.transaction(DB_CONFIG.store, "readwrite");
  const store = transaction.objectStore(DB_CONFIG.store);
  const key = type === "video" ? DB_CONFIG.keys.video : DB_CONFIG.keys.audio;
  store.delete(key);
};

/**
 * 비디오 삭제
 */
export const deleteVideo = async () => {
  return deleteMedia("video");
};

/**
 * 오디오 삭제
 */
export const deleteAudio = async () => {
  return deleteMedia("audio");
};
