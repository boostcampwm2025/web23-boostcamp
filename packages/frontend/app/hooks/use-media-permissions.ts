/**
 * 카메라/마이크 권한 요청 및 미디어 스트림의 생명주기(생성/해제)를 관리하는 커스텀 훅
 */

import { useState, useCallback } from "react";

export const useMediaPermissions = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const requestPermissions = useCallback(
    async (options?: { video?: boolean; audio?: boolean }) => {
      try {
        const {video = true , audio = true} = options || {};
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: video,
          audio: audio,
        });
        setStream(mediaStream);
        return mediaStream;
      } catch (error) {
        console.error("Error accessing media devices.", error);
        return error;
      }
    },
    [],
  );

  const stopMediaStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // 카메라 트랙 비활성화
  const pauseVideoRecording = useCallback(() => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = false;
      });
    }
  }, [stream]);

  // 카메라 트랙 활성화
  const resumeVideoRecording = useCallback(() => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = true;
      });
    }
  }, [stream]);

  // 마이크 트랙 음소거/활성화
  const toggleMicTrack = useCallback(
    (enabled: boolean) => {
      if (stream) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = enabled;
        });
      }
    },
    [stream],
  );

  return {
    stream,
    requestPermissions,
    stopMediaStream,
    pauseVideoRecording,
    resumeVideoRecording,
    toggleMicTrack,
  };
};
