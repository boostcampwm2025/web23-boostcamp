import { useState, useCallback, useEffect } from "react";

export const useMediaPermissions = () => {
  // 비디오와 오디오 스트림을 완전히 분리하여 관리
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const [videoDeviceId, setVideoDeviceId] = useState<string | null>(null);
  const [audioDeviceId, setAudioDeviceId] = useState<string | null>(null);

  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [mediaError, setMediaError] = useState<Error | null>(null);

  /** 장치 목록 가져오기 */
  const getMediaDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setVideoDevices(
        devices.filter((devices) => devices.kind === "videoinput"),
      );
      setAudioDevices(
        devices.filter((devices) => devices.kind === "audioinput"),
      );
    } catch (error) {
      setMediaError(error as Error);
    }
  }, []);

  /** 비디오 권한 및 스트림 요청 */
  const requestVideo = useCallback(
    async (deviceId?: string) => {
      try {
        if (videoStream) {
          videoStream.getTracks().forEach((track) => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
        });
        setVideoStream(stream);

        const track = stream.getVideoTracks()[0];
        setVideoDeviceId(track.getSettings().deviceId || null);
        setIsVideoEnabled(track.enabled);

        await getMediaDevices();

        return stream;
      } catch (error) {
        setMediaError(error as Error);
        return null;
      }
    },
    [videoStream, getMediaDevices],
  );

  /** 오디오 권한 및 스트림 요청 */
  const requestAudio = useCallback(
    async (deviceId?: string) => {
      try {
        if (audioStream) {
          audioStream.getTracks().forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        });

        setAudioStream(stream);

        const track = stream.getAudioTracks()[0];
        setAudioDeviceId(track.getSettings().deviceId || null);
        setIsAudioEnabled(track.enabled);

        await getMediaDevices();

        return stream;
      } catch (error) {
        setMediaError(error as Error);
        return null;
      }
    },
    [audioStream, getMediaDevices],
  );

  /**  통합 권한 요청 (초기 설정용) */
  const requestPermissions = useCallback(
    async (options?: { video?: boolean; audio?: boolean }) => {
      const { video = true, audio = true } = options || {};

      let videoStream = null;
      let audioStream = null;

      if (video) {
        videoStream = await requestVideo();
      }

      if (audio) {
        audioStream = await requestAudio();
      }

      return { videoStream, audioStream };
    },
    [requestVideo, requestAudio],
  );

  /** 스트림 종료 (전체 또는 개별) */
  const stopMediaStream = useCallback(() => {
    videoStream?.getTracks().forEach((track) => track.stop());
    audioStream?.getTracks().forEach((track) => track.stop());
    setVideoStream(null);
    setAudioStream(null);
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
  }, [videoStream, audioStream]);

  // 트랙 상태 감시 (시스템에 의한 종료 대응)
  useEffect(() => {
    const handleVideoEnded = () => setIsVideoEnabled(false);
    const handleAudioEnded = () => setIsAudioEnabled(false);

    const videoTrack = videoStream?.getVideoTracks()[0];
    const audioTrack = audioStream?.getAudioTracks()[0];

    videoTrack?.addEventListener("ended", handleVideoEnded);
    audioTrack?.addEventListener("ended", handleAudioEnded);

    return () => {
      videoTrack?.removeEventListener("ended", handleVideoEnded);
      audioTrack?.removeEventListener("ended", handleAudioEnded);
    };
  }, [videoStream, audioStream]);

  const toggleVideo = useCallback(
    (enabled: boolean) => {
      videoStream
        ?.getVideoTracks()
        .forEach((track) => (track.enabled = enabled));
      setIsVideoEnabled(enabled);
    },
    [videoStream],
  );

  const toggleAudio = useCallback(
    (enabled: boolean) => {
      audioStream
        ?.getAudioTracks()
        .forEach((track) => (track.enabled = enabled));
      setIsAudioEnabled(enabled);
    },
    [audioStream],
  );

  return {
    videoStream,
    audioStream,
    requestPermissions,
    requestVideo,
    requestAudio,
    stopMediaStream,
    toggleVideo,
    toggleAudio,
    videoDeviceId,
    audioDeviceId,
    isVideoEnabled,
    isAudioEnabled,
    videoDevices,
    audioDevices,
    getMediaDevices,
    mediaError,
    hasVideoPermission: !!videoStream,
    hasAudioPermission: !!audioStream,
  };
};
