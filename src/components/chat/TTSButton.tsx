import { Pause, Play, Volume2 } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Button } from "../ui/Button";

interface TTSButtonProps {
  text: string;
  className?: string;
}

export const TTSButton: React.FC<TTSButtonProps> = ({ text, className = "" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsSupported('speechSynthesis' in window);
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    // Create utterance
    const newUtterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech settings
    newUtterance.rate = 0.9;
    newUtterance.pitch = 1;
    newUtterance.volume = 0.8;

    // Event handlers
    newUtterance.onstart = () => setIsPlaying(true);
    newUtterance.onend = () => setIsPlaying(false);
    newUtterance.onerror = () => setIsPlaying(false);
    newUtterance.onpause = () => setIsPlaying(false);

    setUtterance(newUtterance);

    return () => {
      // Cleanup: stop any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text, isSupported]);

  const handleTogglePlayback = () => {
    if (!isSupported || !utterance) return;

    if (isPlaying) {
      // Stop current playback
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      // Start playback
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isSupported) {
    return null; // Don't render if TTS is not supported
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={isPlaying ? Pause : Volume2}
      onClick={handleTogglePlayback}
      className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${className}`}
      title={isPlaying ? "Stop reading" : "Read aloud"}
    />
  );
};