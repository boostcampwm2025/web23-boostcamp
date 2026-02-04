import { useCallback, useState, useRef, useEffect } from "react";

import {
  saveAudio as saveAudioToDB,
  getLatestAudio,
  deleteAudio as deleteAudioFromDB,
} from "@/app/lib/client/media-storage";

export interface IAudioStorageState {
  blob: Blob | null;
  metadata: {
    size: number;
    type: string;
    lastModified: number;
    url?: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

export interface IAudioStorageActions {
  saveAudio: (blob: Blob) => Promise<void>;
  loadAudio: () => Promise<Blob | null>;
  deleteAudio: () => Promise<void>;
  getAudioUrl: () => string | null;
}

const initialState: IAudioStorageState = {
  blob: null,
  metadata: null,
  isLoading: false,
  error: null,
};

export const useAudioRecording = (): IAudioStorageState &
  IAudioStorageActions => {
  const [state, setState] = useState<IAudioStorageState>(initialState);
  const urlRef = useRef<string | null>(null);

  const createMetadata = useCallback((blob: Blob) => {
    return {
      size: blob.size,
      type: blob.type,
      lastModified: Date.now(),
    };
  }, []);

  const createObjectUrl = useCallback((blob: Blob | null) => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }

    if (!blob) return null;

    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    return url;
  }, []);

  const getErrorMessage = useCallback((error: unknown, action: string) => {
    return error instanceof Error ? error.message : `Failed to ${action} audio`;
  }, []);

  const saveAudio = useCallback(
    async (blob: Blob) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await saveAudioToDB(blob);
        const metadata = createMetadata(blob);
        const url = createObjectUrl(blob);

        setState({
          blob,
          metadata: { ...metadata, url: url || undefined },
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage = getErrorMessage(error, "save");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [createMetadata, createObjectUrl, getErrorMessage],
  );

  const loadAudio = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const blob = await getLatestAudio();
      if (blob) {
        const metadata = createMetadata(blob);
        const url = createObjectUrl(blob);

        setState({
          blob,
          metadata: { ...metadata, url: url || undefined },
          isLoading: false,
          error: null,
        });
        return blob;
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
        return null;
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, "load");
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, [createMetadata, createObjectUrl, getErrorMessage]);

  const deleteAudio = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      createObjectUrl(null);
      await deleteAudioFromDB();
      setState(initialState);
    } catch (error) {
      const errorMessage = getErrorMessage(error, "delete");
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, [createObjectUrl, getErrorMessage]);

  const getAudioUrl = useCallback(() => {
    return state.metadata?.url || null;
  }, [state.metadata?.url]);

  useEffect(() => {
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, []);

  return {
    ...state,
    saveAudio,
    loadAudio,
    deleteAudio,
    getAudioUrl,
  };
};
