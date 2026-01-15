import { useCallback, useRef, useState, useEffect } from 'react';
import { saveVideo, saveAudio } from '@/app/lib/media/mediaStorage';

export const useMediaRecorder = (stream?: MediaStream | null) => {
  const mediaRecorderRefVideo = useRef<MediaRecorder | null>(null);
  const mediaRecorderRefAudio = useRef<MediaRecorder | null>(null);
  const chunksRefVideo = useRef<BlobPart[]>([]);
  const chunksRefAudio = useRef<BlobPart[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);

  const startVideoRecording = useCallback(() => {
    if (!stream) {
      console.warn('비디오 녹음용 스트림이 없습니다.');
      return;
    }

    chunksRefVideo.current = [];
    try {
      let mr: MediaRecorder | null = null;
      try {
        mr = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
      } catch (e) {
        try {
          mr = new MediaRecorder(stream as MediaStream);
        } catch (err) {
          console.error('비디오용 MediaRecorder 생성 실패:', err);
          mr = null;
        }
      }

      if (!mr) {
        console.warn('비디오용 MediaRecorder를 생성할 수 없습니다.');
        return;
      }

      mediaRecorderRefVideo.current = mr;
      mr.ondataavailable = (e) => {
        chunksRefVideo.current.push(e.data);
      };

      try {
        mr.start();
        setIsRecording(true);
      } catch (err) {
        console.error('비디오 MediaRecorder 시작 실패:', err);
      }
    } catch (outer) {
      console.error('비디오 녹화 시작 중 예외 발생:', outer);
    }
  }, [stream]);

  const stopVideoRecording = useCallback<() => Promise<Blob | null>>(async () => {
    return new Promise<Blob | null>((resolve) => {
      const mr = mediaRecorderRefVideo.current;
      if (!mr) {
        resolve(null);
        return;
      }

      mr.onstop = async () => {
        const videoBlob = new Blob(chunksRefVideo.current, { type: 'video/webm' });
        try {
          await saveVideo(videoBlob);
        } catch (err) {
          console.error('비디오 저장 실패:', err);
        }
        chunksRefVideo.current = [];
        setIsRecording(false);
        setLastBlob(videoBlob);
        // 참조 정리
        mediaRecorderRefVideo.current = null;
        resolve(videoBlob);
      };

      try {
        mr.stop();
      } catch (err) {
        console.warn('MediaRecorder 중지 중 오류', err);
        resolve(null);
      }
    });
  }, []);

  const startAudioRecording = useCallback(() => {
    if (!stream) {
      console.warn('오디오 녹음용 스트림이 없습니다.');
      return;
    }

    // 비디오 레코더와 충돌을 피하기 위해 오디오 전용 MediaStream 생성
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks || audioTracks.length === 0) {
      console.warn('스트림에 오디오 트랙이 없습니다.');
      return;
    }

    // 이전 오디오 스트림이 있으면 중지
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }

    const audioStream = new MediaStream(audioTracks.map((t) => (t.clone ? t.clone() : t)));
    audioStreamRef.current = audioStream;

    chunksRefAudio.current = [];
    try {
      let mr: MediaRecorder | null = null;
      try {
        mr = new MediaRecorder(audioStream, { mimeType: 'audio/webm;codecs=opus' });
      } catch (e) {
        try {
          mr = new MediaRecorder(audioStream as MediaStream);
        } catch (err) {
          console.error('오디오용 MediaRecorder 생성 실패:', err);
          mr = null;
        }
      }

      if (!mr) {
        console.warn('오디오용 MediaRecorder를 생성할 수 없습니다.');
        return;
      }

      mediaRecorderRefAudio.current = mr;
      mr.ondataavailable = (e) => {
        chunksRefAudio.current.push(e.data);
      };

      try {
        mr.start();
        setIsRecording(true);
      } catch (err) {
        console.error('오디오 MediaRecorder 시작 실패:', err);
      }
    } catch (outer) {
      console.error('오디오 녹화 시작 중 예외 발생:', outer);
    }
  }, [stream]);

  const stopAudioRecording = useCallback<() => Promise<Blob | null>>(async () => {
    return new Promise<Blob | null>((resolve) => {
      const mr = mediaRecorderRefAudio.current;
      if (!mr) {
        resolve(null);
        return;
      }

      mr.onstop = async () => {
        const audioBlob = new Blob(chunksRefAudio.current, { type: 'audio/webm' });
        try {
          await saveAudio(audioBlob);
        } catch (err) {
          console.error('오디오 저장 실패:', err);
        }
        chunksRefAudio.current = [];
        setIsRecording(false);
        setLastBlob(audioBlob);
        // clear reference after handling
        mediaRecorderRefAudio.current = null;
        try {
          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((t) => t.stop());
            audioStreamRef.current = null;
          }
        } catch (_) {}
        resolve(audioBlob);
      };

      try {
        mr.stop();
      } catch (err) {
        console.warn('MediaRecorder 중지 중 오류', err);
        resolve(null);
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      try {
        if (mediaRecorderRefVideo.current && mediaRecorderRefVideo.current.state !== 'inactive') {
          mediaRecorderRefVideo.current.stop();
        }
      } catch (_) {}
      try {
        if (mediaRecorderRefAudio.current && mediaRecorderRefAudio.current.state !== 'inactive') {
          mediaRecorderRefAudio.current.stop();
        }
      } catch (_) {}
      mediaRecorderRefVideo.current = null;
      mediaRecorderRefAudio.current = null;
      chunksRefVideo.current = [];
      chunksRefAudio.current = [];
      try {
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((t) => t.stop());
          audioStreamRef.current = null;
        }
      } catch (_) {}
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
