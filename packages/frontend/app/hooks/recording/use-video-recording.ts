import { useCallback, useState, useRef, useEffect } from "react";

import {
  saveVideo as saveVideoToDB,
  getLatestVideo,
  deleteVideo as deleteVideoFromDB,
} from "@/app/lib/client/media-storage";

export interface IVideoStorageState {
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

export interface IVideoStorageActions {
  saveVideo: (blob: Blob) => Promise<void>;
  loadVideo: () => Promise<Blob | null>;
  deleteVideo: () => Promise<void>;
  getVideoUrl: () => string | null;
}

const initialState: IVideoStorageState = {
  blob: null,
  metadata: null,
  isLoading: false,
  error: null,
};

export const useVideoRecording = (): IVideoStorageState &
  IVideoStorageActions => {
  const [state, setState] = useState<IVideoStorageState>(initialState);
  const urlRef = useRef<string | null>(null);

  const createMetadata = useCallback((blob: Blob) => {
    return {
      size: blob.size,
      type: blob.type,
      lastModified: Date.now(),
    };
  }, []);

  const createObjectUrl = useCallback((blob: Blob | null): string | null => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }

    if (!blob) return null;

    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    return url;
  }, []);

  const getErrorMessage = useCallback(
    (error: unknown, action: string): string => {
      return error instanceof Error
        ? error.message
        : `Failed to ${action} video`;
    },
    [],
  );

  const saveVideo = useCallback(
    async (blob: Blob) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await saveVideoToDB(blob);
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

  const loadVideo = useCallback(async (): Promise<Blob | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const blob = await getLatestVideo();
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

  const deleteVideo = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      createObjectUrl(null);
      await deleteVideoFromDB();
      setState(initialState);
    } catch (error) {
      const errorMessage = getErrorMessage(error, "delete");
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, [createObjectUrl, getErrorMessage]);

  const getVideoUrl = useCallback(() => {
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
    saveVideo,
    loadVideo,
    deleteVideo,
    getVideoUrl,
  };
};
