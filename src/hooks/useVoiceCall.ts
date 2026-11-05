"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface VoiceParticipant {
  id: string;
  username: string;
  avatarUrl: string;
  isSpeaking: boolean;
  isMuted: boolean;
  volume: number;
}

export function useVoiceCall(defaultParticipants: VoiceParticipant[] = []) {
  const [isInCall, setIsInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // 0 à 100
  const [participants, setParticipants] = useState<VoiceParticipant[]>(defaultParticipants);
  const [callDuration, setCallDuration] = useState(0);
  const [callError, setCallError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synchroniser les participants par défaut si mis à jour
  useEffect(() => {
    if (defaultParticipants.length > 0) {
      setParticipants((prev) => {
        // Conserver les états de volume/mute existants
        return defaultParticipants.map((dp) => {
          const existing = prev.find((p) => p.id === dp.id || p.username === dp.username);
          return existing ? { ...dp, volume: existing.volume, isMuted: existing.isMuted } : dp;
        });
      });
    }
  }, [defaultParticipants]);

  // Jouer un effet sonore avec l'API Web Audio native
  const playChime = useCallback((type: "join" | "leave" | "mute" | "unmute") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "join") {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "leave") {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else {
        osc.frequency.setValueAtTime(type === "mute" ? 400 : 700, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch {
      // Ignorer si bloqué par l'autoplay policy du navigateur
    }
  }, []);

  // Démarrer l'analyseur audio du micro
  const startAudioAnalysis = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calcul de la puissance moyenne (RMS)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));

        setAudioLevel(normalized);
        const speaking = normalized > 12;
        setIsSpeaking(speaking);

        animationFrameRef.current = requestAnimationFrame(checkAudio);
      };

      checkAudio();
    } catch (e) {
      console.warn("Analyse audio WebRTC non disponible:", e);
    }
  };

  // Rejoindre l'appel vocal
  const joinCall = async () => {
    setIsConnecting(true);
    setCallError(null);

    try {
      let stream: MediaStream | null = null;
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          mediaStreamRef.current = stream;
        } catch (mediaErr: any) {
          console.warn("Micro physique inaccessible ou refusé, bascule en mode simulation vocale HD:", mediaErr);
        }
      }

      if (stream) {
        startAudioAnalysis(stream);
      }

      setIsInCall(true);
      setIsConnecting(false);
      setIsMuted(false);
      setIsDeafened(false);
      setCallDuration(0);
      playChime("join");

      // Compteur de durée d'appel
      timerIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      // Simulation d'activité vocale des coéquipiers pour un environnement réaliste
      simulationIntervalRef.current = setInterval(() => {
        setParticipants((prev) =>
          prev.map((p) => {
            // Chance aléatoire de parler
            const speaks = Math.random() > 0.65;
            return {
              ...p,
              isSpeaking: p.isMuted ? false : speaks,
            };
          })
        );
      }, 3000);
    } catch (err: any) {
      setCallError("Impossible de démarrer l'appel vocal.");
      setIsConnecting(false);
    }
  };

  // Quitter l'appel vocal
  const leaveCall = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    setIsInCall(false);
    setIsSpeaking(false);
    setAudioLevel(0);
    playChime("leave");
  };

  // Mute / Unmute du microphone
  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextState;
      });
    }
    if (nextState) {
      setIsSpeaking(false);
      setAudioLevel(0);
    }
    playChime(nextState ? "mute" : "unmute");
  };

  // Mute / Unmute des haut-parleurs (Sourdine / Deafen)
  const toggleDeafen = () => {
    setIsDeafened((prev) => !prev);
  };

  // Ajuster le volume d'un coéquipier individuel
  const setParticipantVolume = (id: string, vol: number) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, volume: vol } : p))
    );
  };

  // Muter individuellement un coéquipier
  const toggleParticipantMute = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isMuted: !p.isMuted } : p))
    );
  };

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    isInCall,
    isConnecting,
    isMuted,
    isDeafened,
    isSpeaking,
    audioLevel,
    participants,
    callDuration: formatDuration(callDuration),
    callError,
    joinCall,
    leaveCall,
    toggleMute,
    toggleDeafen,
    setParticipantVolume,
    toggleParticipantMute,
  };
}

