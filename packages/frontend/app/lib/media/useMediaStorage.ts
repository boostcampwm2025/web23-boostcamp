import { useState, useCallback } from 'react';
import { saveVideo, saveAudio, getLatestVideo, getLatestAudio } from './mediaStorage';

export const useMediaStorage = () => {
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 비디오 저장
  const saveVideoMedia = useCallback(async (blob: Blob) => {
    setIsLoading(true);
    try {
      await saveVideo(blob);
      setMediaBlob(blob);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 오디오 저장
  const saveAudioMedia = useCallback(async (blob: Blob) => {
    setIsLoading(true);
    try {
      await saveAudio(blob);
      setMediaBlob(blob);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 비디오 조회
  const loadVideo = useCallback(async () => {
    setIsLoading(true);
    try {
      const blob = await getLatestVideo();
      setMediaBlob(blob);
      return blob;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 오디오 조회
  const loadAudio = useCallback(async () => {
    setIsLoading(true);
    try {
      const blob = await getLatestAudio();
      setMediaBlob(blob);
      return blob;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mediaBlob, saveVideoMedia, saveAudioMedia, loadVideo, loadAudio, isLoading };
};
