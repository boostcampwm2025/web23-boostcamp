import { useState, useCallback, useRef, useEffect } from "react";

import {
  saveVideo as saveVideoToDB,
  saveAudio as saveAudioToDB,
  getLatestVideo,
  getLatestAudio,
  deleteVideo as deleteVideoFromDB,
  deleteAudio as deleteAudioFromDB,
} from "@/app/lib/client/media-storage";

export interface IMediaMetadata {
  size: number;
  type: string;
  lastModified: number;
  url?: string;
}

export interface IMediaStorageState {
  video: {
    blob: Blob | null;
    metadata: IMediaMetadata | null;
    isLoading: boolean;
    error: string | null;
  };
  audio: {
    blob: Blob | null;
    metadata: IMediaMetadata | null;
    isLoading: boolean;
    error: string | null;
  };
}

export interface IMediaStorageActions {
  // Video operations
  saveVideo: (blob: Blob) => Promise<void>;
  loadVideo: () => Promise<Blob | null>;
  clearVideo: () => Promise<void>;

  // Audio operations
  saveAudio: (blob: Blob) => Promise<void>;
  loadAudio: () => Promise<Blob | null>;
  clearAudio: () => Promise<void>;

  // Utilities
  clearAll: () => Promise<void>;
  getUsage: () => Promise<{ video: number; audio: number; total: number }>;
  cleanup: () => void;
}

const initialMediaState = {
  blob: null as Blob | null,
  metadata: null as IMediaMetadata | null,
  isLoading: false,
  error: null as string | null,
};

type MediaType = "video" | "audio";
type MediaState = typeof initialMediaState;
type MediaStatesetter = React.Dispatch<React.SetStateAction<MediaState>>;

export const useRecordingStorage = (): IMediaStorageState &
  IMediaStorageActions => {
  const videoUrlRef = useRef<string | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const [videoState, setVideoState] = useState<MediaState>(initialMediaState);
  const [audioState, setAudioState] = useState<MediaState>(initialMediaState);

  const createMetadata = useCallback((blob: Blob): IMediaMetadata => {
    return {
      size: blob.size,
      type: blob.type,
      lastModified: Date.now(),
    };
  }, []);

  const createObjectUrl = useCallback(
    (blob: Blob | null, urlRef: { current: string | null }): string | null => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
      if (!blob) return null;

      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      return url;
    },
    [],
  );

  const getErrorMessage = useCallback(
    (error: unknown, action: string): string => {
      return error instanceof Error ? error.message : `Failed to ${action}`;
    },
    [],
  );

  const handleMediaOperation = useCallback(
    async (
      type: MediaType,
      operation: (
        setState: MediaStatesetter,
      ) => Promise<{ blob: Blob | null; shouldReturn: boolean }>,
      errorAction: string,
    ): Promise<Blob | null> => {
      const setState = type === "video" ? setVideoState : setAudioState;
      const urlRef = type === "video" ? videoUrlRef : audioUrlRef;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const { blob, shouldReturn } = await operation(setState);

        if (blob) {
          const metadata = createMetadata(blob);
          createObjectUrl(blob, urlRef);

          setState({
            blob,
            metadata,
            isLoading: false,
            error: null,
          });

          return shouldReturn ? blob : null;
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
          return null;
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error, errorAction);
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

  const saveVideo = useCallback(
    async (blob: Blob) => {
      await handleMediaOperation(
        "video",
        async () => {
          await saveVideoToDB(blob);
          return { blob, shouldReturn: false };
        },
        "save video",
      );
    },
    [handleMediaOperation],
  );

  const loadVideo = useCallback(async (): Promise<Blob | null> => {
    return handleMediaOperation(
      "video",
      async () => {
        const blob = await getLatestVideo();
        return { blob, shouldReturn: true };
      },
      "load video",
    );
  }, [handleMediaOperation]);

  const clearVideo = useCallback(async () => {
    setVideoState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      createObjectUrl(null, videoUrlRef);
      await deleteVideoFromDB();
      setVideoState(initialMediaState);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to clear video";
      setVideoState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [createObjectUrl]);

  const saveAudio = useCallback(
    async (blob: Blob) => {
      await handleMediaOperation(
        "audio",
        async () => {
          await saveAudioToDB(blob);
          return { blob, shouldReturn: false };
        },
        "save audio",
      );
    },
    [handleMediaOperation],
  );

  const loadAudio = useCallback(async (): Promise<Blob | null> => {
    return handleMediaOperation(
      "audio",
      async () => {
        const blob = await getLatestAudio();
        return { blob, shouldReturn: true };
      },
      "load audio",
    );
  }, [handleMediaOperation]);

  const clearAudio = useCallback(async () => {
    setAudioState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      createObjectUrl(null, audioUrlRef);
      await deleteAudioFromDB();
      setAudioState(initialMediaState);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to clear audio";
      setAudioState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [createObjectUrl]);

  const clearAll = useCallback(async () => {
    await Promise.all([clearVideo(), clearAudio()]);
  }, [clearVideo, clearAudio]);

  const getUsage = useCallback(() => {
    const videoSize = videoState.metadata?.size || 0;
    const audioSize = audioState.metadata?.size || 0;

    return Promise.resolve({
      video: videoSize,
      audio: audioSize,
      total: videoSize + audioSize,
    });
  }, [videoState.metadata?.size, audioState.metadata?.size]);

  const cleanup = useCallback(() => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    video: videoState,
    audio: audioState,
    saveVideo,
    loadVideo,
    clearVideo,
    saveAudio,
    loadAudio,
    clearAudio,
    clearAll,
    getUsage,
    cleanup,
  };
};
