// Versão web da tela de sessão de voz.
// Usa browser WebRTC + <audio> element em vez de RTCView + react-native-webrtc.
// O arquivo realtimeClient.web.ts é carregado automaticamente pelo Metro no web.

import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import type { SessionState } from "@/types/session";
import type { IntakeData } from "@/types/user";
import { audioManager } from "../../services/audioManager";
import { startRealtimeVoice } from "../../services/realtimeClient";

type SetRemoteStream = (stream: MediaStream | null) => void;

export default function VoiceSession() {
  const router = useRouter();
  const { intake: intakeRaw } = useLocalSearchParams<{ intake: string }>();

  const intake: IntakeData | null = (() => {
    try { return intakeRaw ? JSON.parse(intakeRaw) : null; }
    catch { return null; }
  })();

  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [state, setState] = useState<SessionState>("idle");
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const timeLeftRef = useRef(600);
  const scale = useSharedValue(1);

  // Cria o elemento <audio> para tocar o stream remoto da IA
  useEffect(() => {
    const audio = document.createElement("audio");
    audio.autoplay = true;
    audioElRef.current = audio;
    return () => { audio.srcObject = null; };
  }, []);

  // Conecta o stream remoto ao elemento de áudio
  useEffect(() => {
    if (remoteStream && audioElRef.current) {
      (audioElRef.current as any).srcObject = remoteStream;
      audioElRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  const startAnimation = useCallback(
    (mode: SessionState) => {
      if (mode === "idle" || mode === "paused") {
        scale.value = withTiming(1, { duration: 400 });
        return;
      }
      const duration = mode === "listening" ? 1200 : 1800;
      scale.value = withRepeat(
        withTiming(1.3, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    },
    [scale]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.85,
  }));

  const getColor = (): string => {
    if (state === "paused") return "#F59E0B";
    if (state === "listening") return "#00D4FF";
    if (state === "speaking") return "#6C63FF";
    return "#444";
  };

  // Timer
  useEffect(() => {
    if (!isActive || isPaused) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        timeLeftRef.current = next;
        if (next <= 0) { handleEnd(); return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const handleEnd = useCallback(async () => {
    setIsActive(false);
    setIsPaused(false);
    setState("idle");
    startAnimation("idle");
    audioManager.stop();

    if (pcRef.current) {
      try {
        pcRef.current.getSenders().forEach((sender) => {
          sender.track?.stop();
        });
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }

    setRemoteStream(null);
    if (audioElRef.current) audioElRef.current.srcObject = null;

    router.replace({
      pathname: "/(session)/feedback",
      params: { intake: intakeRaw ?? "" },
    });
  }, [startAnimation, intakeRaw, router]);

  const handleStop = useCallback(() => { handleEnd(); }, [handleEnd]);

  const handlePause = async () => {
    setIsPaused(true);
    setState("paused");
    startAnimation("paused");
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((s) => {
        if (s.track) s.track.enabled = false;
      });
    }
  };

  const handleResume = async () => {
    setIsPaused(false);
    setState("listening");
    startAnimation("listening");
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((s) => {
        if (s.track) s.track.enabled = true;
      });
    }
  };

  const handleStart = async () => {
    try {
      setTimeLeft(600);
      timeLeftRef.current = 600;
      setIsActive(true);
      setIsPaused(false);
      setState("listening");
      startAnimation("listening");
      audioManager.start();

      const pc = await startRealtimeVoice(
        setRemoteStream as SetRemoteStream,
        intake
      );
      pcRef.current = pc as unknown as RTCPeerConnection;
    } catch (err) {
      console.error("erro start (web):", err);
      handleStop();
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const displayName = intake?.name ?? "você";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Echomind</Text>
      <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

      <Text style={styles.subtitle}>
        {state === "idle" && `Olá, ${displayName}. Pronto para começar?`}
        {state === "listening" && "Estou ouvindo..."}
        {state === "speaking" && "Respondendo..."}
        {state === "paused" && "Sessão pausada"}
      </Text>

      <View style={styles.orbContainer}>
        <Animated.View
          style={[styles.orb, { backgroundColor: getColor() }, animatedStyle]}
        />
      </View>

      {!isActive ? (
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Iniciar conversa</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.activeButtons}>
          {!isPaused ? (
            <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
              <Text style={styles.buttonText}>⏸ Pausar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
              <Text style={styles.buttonText}>▶ Retomar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
            <Text style={styles.buttonText}>Encerrar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0C10",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: { color: "#fff", fontSize: 28, fontWeight: "600", marginBottom: 6 },
  timer: { color: "#fff", fontSize: 16, marginBottom: 10, fontVariant: ["tabular-nums"] },
  subtitle: { color: "#aaa", marginBottom: 40, textAlign: "center" },
  orbContainer: { justifyContent: "center", alignItems: "center", marginBottom: 60 },
  orb: {
    width: 180, height: 180, borderRadius: 90,
    shadowColor: "#6C63FF", shadowOpacity: 0.8, shadowRadius: 30, elevation: 20,
  },
  activeButtons: { flexDirection: "row", gap: 12 },
  button: {
    backgroundColor: "#6C63FF",
    paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30,
  },
  pauseButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 16, paddingHorizontal: 24, borderRadius: 30,
  },
  resumeButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16, paddingHorizontal: 24, borderRadius: 30,
  },
  stopButton: {
    backgroundColor: "#FF4D4D",
    paddingVertical: 16, paddingHorizontal: 24, borderRadius: 30,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
