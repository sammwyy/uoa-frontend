import {
  Download,
  Mic,
  MicOff,
  Pause,
  Play,
  Save,
  Square,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface AudioRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (audioBlob: Blob) => void;
}

type RecordingState = "idle" | "recording" | "paused" | "stopped";

// Utility function to convert audio to WAV format
const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Convert to WAV
        const wavBuffer = audioBufferToWav(audioBuffer);
        const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });

        resolve(wavBlob);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(audioBlob);
  });
};

// Convert AudioBuffer to WAV format
const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
  const length = buffer.length;
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
  const view = new DataView(arrayBuffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + length * numberOfChannels * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, length * numberOfChannels * 2, true);

  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(
        -1,
        Math.min(1, buffer.getChannelData(channel)[i])
      );
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      );
      offset += 2;
    }
  }

  return arrayBuffer;
};

export const AudioRecordModal: React.FC<AudioRecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check if media recording is supported
    setIsSupported(
      "MediaRecorder" in window &&
        "getUserMedia" in navigator.mediaDevices &&
        "AudioContext" in window
    );
  }, []);

  useEffect(() => {
    if (isOpen) {
      setRecordingState("idle");
      setRecordingTime(0);
      setAudioBlob(null);
      setAudioUrl(null);
      setError(null);
      setIsConverting(false);
    }

    return () => {
      // Cleanup on close
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Use a format that's widely supported for better conversion results
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsConverting(true);
        try {
          const blob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType,
          });

          // Convert to WAV
          const wavBlob = await convertToWav(blob);
          setAudioBlob(wavBlob);

          const url = URL.createObjectURL(wavBlob);
          setAudioUrl(url);
        } catch (conversionError) {
          setError("Failed to convert audio to WAV format.");
          console.error("WAV conversion error:", conversionError);
        } finally {
          setIsConverting(false);
        }

        // Stop all tracks to release microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms

      setRecordingState("recording");
      setRecordingTime(0);
      startTimer();
    } catch (err) {
      setError("Failed to access microphone. Please check permissions.");
      console.error("Recording error:", err);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingState("paused");
      stopTimer();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState("recording");
      startTimer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecordingState("stopped");
      stopTimer();
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const downloadAudio = () => {
    if (audioBlob && audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `recording-${Date.now()}.wav`;
      link.click();
    }
  };

  const saveAudio = () => {
    if (audioBlob) {
      onSave(audioBlob);
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const resetRecording = () => {
    setRecordingState("idle");
    setRecordingTime(0);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsConverting(false);
    stopTimer();
  };

  if (!isSupported) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto">
            <MicOff className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Audio Recording Not Supported
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your browser doesn't support audio recording or WAV conversion.
            Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Audio Recording
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Record a voice message to send
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50/80 dark:bg-red-900/20 rounded-lg border border-red-200/50 dark:border-red-700/50">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Recording Interface */}
        <div className="text-center space-y-6">
          {/* Timer */}
          <div className="text-4xl font-mono font-bold text-gray-800 dark:text-gray-200">
            {formatTime(recordingTime)}
          </div>

          {/* Recording Status */}
          <div className="flex items-center justify-center gap-2">
            {recordingState === "recording" && (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-600 dark:text-red-400 font-medium">
                  Recording...
                </span>
              </>
            )}
            {recordingState === "paused" && (
              <>
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  Paused
                </span>
              </>
            )}
            {recordingState === "stopped" && isConverting && (
              <>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-spin" />
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Processing...
                </span>
              </>
            )}
            {recordingState === "stopped" && !isConverting && (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Recording Complete
                </span>
              </>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            {recordingState === "idle" && (
              <Button
                variant="primary"
                size="lg"
                icon={Mic}
                onClick={startRecording}
                className="px-8"
              >
                Start Recording
              </Button>
            )}

            {recordingState === "recording" && (
              <>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={Pause}
                  onClick={pauseRecording}
                >
                  Pause
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  icon={Square}
                  onClick={stopRecording}
                >
                  Stop
                </Button>
              </>
            )}

            {recordingState === "paused" && (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  icon={Mic}
                  onClick={resumeRecording}
                >
                  Resume
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  icon={Square}
                  onClick={stopRecording}
                >
                  Stop
                </Button>
              </>
            )}

            {recordingState === "stopped" && !isConverting && audioUrl && (
              <>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={Play}
                  onClick={playAudio}
                >
                  Play
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={Mic}
                  onClick={resetRecording}
                >
                  Record Again
                </Button>
              </>
            )}
          </div>

          {/* Audio Player */}
          {audioUrl && !isConverting && (
            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                className="w-full"
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Format: WAV (16-bit PCM)
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {recordingState === "stopped" && audioBlob && !isConverting && (
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={downloadAudio}
              icon={Download}
              className="flex-1"
            >
              Download
            </Button>
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={saveAudio}
              icon={Save}
              className="flex-1"
            >
              Send Recording
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-lg">
          <p className="mb-1">
            <strong>Recording Tips:</strong>
          </p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Speak clearly and close to your microphone</li>
            <li>You can pause and resume recording as needed</li>
            <li>Preview your recording before sending</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
