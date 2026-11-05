"use client";

import { useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  PhoneCall,
  Radio,
  Sliders,
  ShieldCheck,
  Headphones,
  Signal,
  CheckCircle2,
} from "lucide-react";
import { useVoiceCall, VoiceParticipant } from "@/hooks/useVoiceCall";

interface VoiceRoomWidgetProps {
  roomName: string;
  defaultMembers: VoiceParticipant[];
  currentUsername?: string;
  currentUserAvatar?: string;
}

export function VoiceRoomWidget({
  roomName,
  defaultMembers,
  currentUsername = "Vous",
  currentUserAvatar = "/avatars/avatar-default.svg",
}: VoiceRoomWidgetProps) {
  const {
    isInCall,
    isConnecting,
    isMuted,
    isDeafened,
    isSpeaking,
    audioLevel,
    participants,
    callDuration,
    joinCall,
    leaveCall,
    toggleMute,
    toggleDeafen,
    setParticipantVolume,
    toggleParticipantMute,
  } = useVoiceCall(defaultMembers);

  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="p-4 sm:p-5 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col gap-4 shadow-lg transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isInCall ? "bg-primary animate-pulse" : "bg-on-surface-variant/40"
            }`}
          />
          <div className="flex flex-col">
            <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Salon Vocal WebRTC</span>
              <span className="text-on-surface-variant font-normal">• {roomName}</span>
            </h3>
            <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
              <Signal className="w-3 h-3 text-primary" />
              <span>Europe (Frankfurt RTC-04)</span>
              <span className="text-primary font-mono font-bold">• 18ms</span>
            </span>
          </div>
        </div>

        {isInCall ? (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono text-[11px] font-bold">
              {callDuration}
            </span>
            <button
              onClick={leaveCall}
              className="px-3 py-1.5 rounded-xl bg-error/20 hover:bg-error text-error hover:text-white text-xs font-display font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Quitter</span>
            </button>
          </div>
        ) : (
          <button
            onClick={joinCall}
            disabled={isConnecting}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary text-xs font-display font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(78,222,163,0.3)] hover:shadow-[0_0_20px_rgba(78,222,163,0.5)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{isConnecting ? "Connexion..." : "Rejoindre le Vocal"}</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {isInCall ? (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          {/* Controls Strip (Mic, Deafen, Sound Wave, Settings) */}
          <div className="p-3 bg-surface-container rounded-xl border border-surface-container-high flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Mic Toggle Button */}
              <button
                onClick={toggleMute}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-display font-bold cursor-pointer ${
                  isMuted
                    ? "bg-error/20 text-error border-error/40 hover:bg-error/30"
                    : "bg-surface-container-high text-primary border-primary/40 hover:bg-primary/20"
                }`}
                title={isMuted ? "Réactiver le micro" : "Couper le micro"}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isMuted ? "Micro Muet" : "Micro Actif"}</span>
              </button>

              {/* Deafen Toggle Button */}
              <button
                onClick={toggleDeafen}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-display font-bold cursor-pointer ${
                  isDeafened
                    ? "bg-error/20 text-error border-error/40 hover:bg-error/30"
                    : "bg-surface-container-high text-tertiary border-tertiary/40 hover:bg-tertiary/20"
                }`}
                title={isDeafened ? "Réactiver le son" : "Mettre en sourdine"}
              >
                {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isDeafened ? "En sourdine" : "Son Ouvert"}</span>
              </button>
            </div>

            {/* Live Audio Input Level / Wave Visualizer */}
            <div className="flex items-center gap-2 flex-1 max-w-xs min-w-[140px]">
              <span className="text-[10px] font-mono text-on-surface-variant shrink-0">
                Entrée :
              </span>
              <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden p-0.5 border border-surface-container-high">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    isMuted
                      ? "bg-error/40 w-0"
                      : isSpeaking
                      ? "bg-primary shadow-[0_0_8px_rgba(78,222,163,0.8)]"
                      : "bg-primary/40"
                  }`}
                  style={{ width: isMuted ? "0%" : `${Math.max(5, audioLevel)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-primary font-bold w-7 text-right">
                {isMuted ? "0%" : `${audioLevel}%`}
              </span>
            </div>

            {/* Settings button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Réglages</span>
            </button>
          </div>

          {/* Quick Settings Drawer if opened */}
          {showSettings && (
            <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-high flex flex-col gap-2 text-xs animate-in fade-in duration-150">
              <span className="font-display font-bold text-white text-[11px] uppercase tracking-wider">
                Périphériques Audio Détectés
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-on-surface-variant text-[11px]">
                <div className="p-2 bg-surface rounded-lg border border-surface-container-high flex items-center justify-between">
                  <span>Microphone par défaut (WebRTC)</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="p-2 bg-surface rounded-lg border border-surface-container-high flex items-center justify-between">
                  <span>Haut-parleurs / Casque stéréo</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
            </div>
          )}

          {/* Connected Participants Voice Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Current User Card */}
            <div
              className={`p-3 rounded-xl bg-surface-container border transition-all flex items-center justify-between ${
                isSpeaking && !isMuted
                  ? "border-primary shadow-[0_0_15px_rgba(78,222,163,0.25)] ring-1 ring-primary/40"
                  : "border-surface-container-high"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={currentUserAvatar}
                    alt={currentUsername}
                    onError={(e) => {
                      e.currentTarget.src = "/avatars/avatar-default.svg";
                    }}
                    className={`w-9 h-9 rounded-xl object-cover bg-surface transition-all ${
                      isSpeaking && !isMuted ? "ring-2 ring-primary ring-offset-2 ring-offset-surface" : ""
                    }`}
                  />
                  {isSpeaking && !isMuted && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-semibold text-xs text-white">
                      @{currentUsername}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono font-bold">
                      Vous
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono ${
                      isMuted
                        ? "text-error"
                        : isSpeaking
                        ? "text-primary font-bold animate-pulse"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {isMuted ? "Micro coupé" : isSpeaking ? "En train de parler..." : "En écoute"}
                  </span>
                </div>
              </div>

              <div className="text-right">
                {isMuted ? (
                  <MicOff className="w-4 h-4 text-error" />
                ) : (
                  <Mic className="w-4 h-4 text-primary" />
                )}
              </div>
            </div>

            {/* Other Squad Members */}
            {participants.map((player) => (
              <div
                key={player.id || player.username}
                className={`p-3 rounded-xl bg-surface-container border transition-all flex items-center justify-between ${
                  player.isSpeaking && !player.isMuted
                    ? "border-primary shadow-[0_0_15px_rgba(78,222,163,0.25)] ring-1 ring-primary/40"
                    : "border-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={player.avatarUrl || "/avatars/avatar-default.svg"}
                      alt={player.username}
                      onError={(e) => {
                        e.currentTarget.src = "/avatars/avatar-default.svg";
                      }}
                      className={`w-9 h-9 rounded-xl object-cover bg-surface transition-all ${
                        player.isSpeaking && !player.isMuted
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-surface"
                          : ""
                      }`}
                    />
                    {player.isSpeaking && !player.isMuted && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-semibold text-xs text-white">
                      @{player.username}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        player.isMuted
                          ? "text-error"
                          : player.isSpeaking
                          ? "text-primary font-bold animate-pulse"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {player.isMuted
                        ? "Micro coupé"
                        : player.isSpeaking
                        ? "Parle..."
                        : "Connecté"}
                    </span>
                  </div>
                </div>

                {/* Individual Volume & Mute */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleParticipantMute(player.id)}
                    className="p-1 rounded text-on-surface-variant hover:text-white transition-colors cursor-pointer"
                    title={player.isMuted ? "Rétablir le son" : "Muter ce joueur"}
                  >
                    {player.isMuted ? (
                      <VolumeX className="w-3.5 h-3.5 text-error" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={player.volume}
                    onChange={(e) => setParticipantVolume(player.id, Number(e.target.value))}
                    className="w-14 sm:w-16 accent-primary cursor-pointer h-1.5 bg-surface-container-high rounded-lg"
                    title={`Volume : ${player.volume}%`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Standby State: Preview of members in room */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-surface-container rounded-xl border border-surface-container-high text-xs text-on-surface-variant">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img
                src={currentUserAvatar}
                alt={currentUsername}
                className="w-7 h-7 rounded-full border-2 border-surface object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/avatars/avatar-default.svg";
                }}
              />
              {participants.slice(0, 3).map((p) => (
                <img
                  key={p.id}
                  src={p.avatarUrl}
                  alt={p.username}
                  className="w-7 h-7 rounded-full border-2 border-surface object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/avatars/avatar-default.svg";
                  }}
                />
              ))}
            </div>
            <span>
              {participants.length + 1} joueurs dans ce salon prêts pour le chat vocal
            </span>
          </div>

          <span className="text-[11px] font-mono text-primary flex items-center gap-1">
            <Headphones className="w-3.5 h-3.5" />
            Audio Spatial 3D & Suppresseur de bruit IA
          </span>
        </div>
      )}
    </div>
  );
}

