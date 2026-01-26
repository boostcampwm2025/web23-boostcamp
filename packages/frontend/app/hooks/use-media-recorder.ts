import { useCallback, useRef, useState, useEffect } from "react";

import { saveVideo, saveAudio } from "@/app/lib/client/media-storage";

const VIDEO_MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp9,flac",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];
const AUDIO_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm;codecs=flac",
  "audio/ogg;codecs=opus",
  "audio/webm",
  "audio/ogg",
];
const VIDEO_BLOB_TYPE = "video/webm";
const AUDIO_BLOB_TYPE = "audio/webm";

type MediaType = "video" | "audio";

interface IMediaRecorderConfig {
  mimeCandidates: string[];
  blobTypeFallback: string;
  saveFunction: (blob: Blob) => Promise<void>;
}

const MEDIA_CONFIGS: Record<MediaType, IMediaRecorderConfig> = {
  video: {
    mimeCandidates: VIDEO_MIME_CANDIDATES,
    blobTypeFallback: VIDEO_BLOB_TYPE,
    saveFunction: saveVideo,
  },
  audio: {
    mimeCandidates: AUDIO_MIME_CANDIDATES,
    blobTypeFallback: AUDIO_BLOB_TYPE,
    saveFunction: saveAudio,
  },
};

const pickMimeType = (candidates: string[], fallback: string) => {
  if (typeof MediaRecorder === "undefined") return fallback;
  const found = candidates.find((mime) => MediaRecorder.isTypeSupported(mime));
  return found || fallback;
};

const createMediaRecorder = (
  mediaStream: MediaStream,
  mimeType: string,
  errorContext: string,
) => {
  try {
    return new MediaRecorder(mediaStream, { mimeType });
  } catch {
    try {
      return new MediaRecorder(mediaStream);
    } catch (error) {
      console.error(`${errorContext}용 MediaRecorder 생성 실패:`, error);
      return null;
    }
  }
};

const startMediaRecorderSafely = (
  mediaRecorder: MediaRecorder,
  errorContext: string,
  setIsRecording: (value: boolean) => void,
) => {
  try {
    mediaRecorder.start();
    setIsRecording(true);
    return true;
  } catch (error) {
    console.error(`${errorContext} MediaRecorder 시작 실패:`, error);
    return false;
  }
};

const stopMediaRecorderSafely = async (
  mediaRecorder: MediaRecorder | null,
  chunksRef: { current: BlobPart[] },
  blobType: string,
  saveFunction: (blob: Blob) => Promise<void>,
  setIsRecording: (value: boolean) => void,
  setLastBlob: (blob: Blob | null) => void,
  errorContext: string,
) => {
  return new Promise<Blob | null>((resolve) => {
    if (!mediaRecorder) {
      resolve(null);
      return;
    }

    mediaRecorder.onstop = async () => {
      console.log(`${errorContext} MediaRecorder onstop 이벤트 처리 시작`);
      const blob = new Blob(chunksRef.current, {
        type: blobType,
      });
      try {
        await saveFunction(blob);
      } catch (error) {
        console.error(`${errorContext} 저장 실패:`, error);
      }
      chunksRef.current = [];
      setIsRecording(false);
      setLastBlob(blob);
      resolve(blob);
    };

    try {
      console.log("mediaRecorder state:", mediaRecorder.state);
      mediaRecorder.stop();
    } catch (error) {
      console.warn("MediaRecorder 중지 중 오류", error);
      resolve(null);
    }
  });
};

export const useMediaRecorder = (stream?: MediaStream | null) => {
  const mediaRecorderRefVideo = useRef<MediaRecorder | null>(null);
  const mediaRecorderRefAudio = useRef<MediaRecorder | null>(null);
  const chunksRefVideo = useRef<BlobPart[]>([]);
  const chunksRefAudio = useRef<BlobPart[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const videoBlobTypeRef = useRef<string>(VIDEO_BLOB_TYPE);
  const audioBlobTypeRef = useRef<string>(AUDIO_BLOB_TYPE);

  const [isRecording, setIsRecording] = useState(false);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);

  const startVideoRecording = useCallback(() => {
    if (!stream) {
      console.warn("비디오 녹음용 스트림이 없습니다.");
      return;
    }

    chunksRefVideo.current = [];

    const mimeType = pickMimeType(
      MEDIA_CONFIGS.video.mimeCandidates,
      MEDIA_CONFIGS.video.blobTypeFallback,
    );
    videoBlobTypeRef.current =
      mimeType.split(";")[0] || MEDIA_CONFIGS.video.blobTypeFallback;

    const mediaRecorder = createMediaRecorder(stream, mimeType, "비디오");

    if (!mediaRecorder) {
      console.warn("비디오용 MediaRecorder를 생성할 수 없습니다.");
      return;
    }

    mediaRecorderRefVideo.current = mediaRecorder;
    mediaRecorder.ondataavailable = (event) => {
      chunksRefVideo.current.push(event.data);
    };

    const started = startMediaRecorderSafely(
      mediaRecorder,
      "비디오",
      setIsRecording,
    );
    if (!started) {
      mediaRecorderRefVideo.current = null;
    }
  }, [stream]);

  const stopVideoRecording = useCallback<
    () => Promise<Blob | null>
  >(async () => {
    console.log("stopVideoRecording 호출");
    const blob = await stopMediaRecorderSafely(
      mediaRecorderRefVideo.current,
      chunksRefVideo,
      videoBlobTypeRef.current,
      MEDIA_CONFIGS.video.saveFunction,
      setIsRecording,
      setLastBlob,
      "비디오",
    );
    console.log("stopVideoRecording 완료");

    mediaRecorderRefVideo.current = null;
    return blob;
  }, []);

  const startAudioRecording = useCallback(() => {
    if (!stream) {
      console.warn("오디오 녹음용 스트림이 없습니다.");
      return;
    }

    // 비디오 레코더와 충돌을 피하기 위해 오디오 전용 MediaStream 생성
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks || audioTracks.length === 0) {
      console.warn("스트림에 오디오 트랙이 없습니다.");
      return;
    }

    // 이전 오디오 스트림이 있으면 중지
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    const audioStream = new MediaStream(
      audioTracks.map((track) => (track.clone ? track.clone() : track)),
    );
    audioStreamRef.current = audioStream;

    chunksRefAudio.current = [];

    const mimeType = pickMimeType(
      MEDIA_CONFIGS.audio.mimeCandidates,
      MEDIA_CONFIGS.audio.blobTypeFallback,
    );
    audioBlobTypeRef.current =
      mimeType.split(";")[0] || MEDIA_CONFIGS.audio.blobTypeFallback;

    const mediaRecorder = createMediaRecorder(audioStream, mimeType, "오디오");

    if (!mediaRecorder) {
      console.warn("오디오용 MediaRecorder를 생성할 수 없습니다.");
      return;
    }

    mediaRecorderRefAudio.current = mediaRecorder;
    mediaRecorder.ondataavailable = (event) => {
      chunksRefAudio.current.push(event.data);
    };

    const started = startMediaRecorderSafely(
      mediaRecorder,
      "오디오",
      setIsRecording,
    );
    if (!started) {
      mediaRecorderRefAudio.current = null;
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  }, [stream]);

  const stopAudioRecording = useCallback<
    () => Promise<Blob | null>
  >(async () => {
    const blob = await stopMediaRecorderSafely(
      mediaRecorderRefAudio.current,
      chunksRefAudio,
      audioBlobTypeRef.current,
      MEDIA_CONFIGS.audio.saveFunction,
      setIsRecording,
      setLastBlob,
      "오디오",
    );

    mediaRecorderRefAudio.current = null;

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    return blob;
  }, []);

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRefVideo.current &&
        mediaRecorderRefVideo.current.state !== "inactive"
      ) {
        mediaRecorderRefVideo.current.stop();
      }
      if (
        mediaRecorderRefAudio.current &&
        mediaRecorderRefAudio.current.state !== "inactive"
      ) {
        mediaRecorderRefAudio.current.stop();
      }
      mediaRecorderRefVideo.current = null;
      mediaRecorderRefAudio.current = null;
      chunksRefVideo.current = [];
      chunksRefAudio.current = [];
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }
    };
  }, []);

  return {
    isRecording,
    lastBlob,
    startVideoRecording,
    stopVideoRecording,
    startAudioRecording,
    stopAudioRecording,
  };
};

export default useMediaRecorder;
