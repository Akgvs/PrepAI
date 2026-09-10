import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for Web Speech API Text-To-Speech (TTS)
 * Enables the AI interviewer to audibly ask questions.
 */
export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const voiceRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    const updateVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Select natural English voice if available
      const preferred =
        voices.find((v) => v.name.includes('Google') && v.lang.startsWith('en')) ||
        voices.find((v) => v.name.includes('Natural') && v.lang.startsWith('en')) ||
        voices.find((v) => v.lang.startsWith('en'));
      voiceRef.current = preferred || voices[0] || null;
    };

    updateVoice();
    window.speechSynthesis.onvoiceschanged = updateVoice;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text, onEnd) => {
      if (!window.speechSynthesis || isMuted || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
      }
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isMuted]
  );

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return !prev;
    });
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isMuted,
    toggleMute,
    isSupported,
  };
};

export default useSpeechSynthesis;
