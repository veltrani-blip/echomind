import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { MediaStream, RTCView } from "react-native-webrtc";

import type { SessionState } from "@/types/session";
import type { IntakeData } from "@/types/user";
import { audioManager } from "../../services/audioManager";
import { startRealtimeVoice } from "../../services/realtimeClient";

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

  const pcRef = useRef<any>(null);
  const webAudioRef = useRef<any>(null);
  const ambientRef = useRef<Audio.Sound | null>(null);
  const timeLeftRef = useRef(600);
  const scale = useSharedValue(1);

  // Web: cria elemento <audio> para tocar o stream remoto da IA
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const audio = document.createElement("audio");
    audio.autoplay = true;
    webAudioRef.current = audio;
    return () => { audio.srcObject = null; };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || !remoteStream || !webAudioRef.current) return;
    webAudioRef.current.srcObject = remoteStream;
    webAudioRef.current.play().catch(() => {});
  }, [remoteStream]);

  // FIX: libera o microfone ao montar — garante que não há sessão de áudio aberta
  useEffect(() => {
    releaseMic();
    return () => {
      // FIX: libera o microfone ao desmontar a tela
      releaseMic();
      stopAmbient();
    };
  }, []);

  // FIX: função centralizada para liberar o microfone
  const releaseMic = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
      });
    } catch {}
  };

  // FIX: função para ativar o microfone — só chamada ao iniciar sessão
  const activateMic = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) throw new Error("Permissão de microfone negada");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false, // não fica ativo em background
      });
    } catch (err) {
      console.warn("⚠️ Erro ao ativar microfone:", err);
      throw err;
    }
  };

  const startAnimation = useCallback((mode: SessionState) => {
    if (mode === "idle" || mode === "paused") {
      scale.value = withTiming(1, { duration: 400 });
      return;
    }
    const duration = mode === "listening" ? 1200 : 1800;
    scale.value = withRepeat(
      withTiming(1.3, { duration, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
  }, [scale]);

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

  // ─── Áudio ambiente ────────────────────────────────────────────────
  const startAmbient = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/rain.mp3"),
        { shouldPlay: true, isLooping: true, volume: 0.12 }
      );
      ambientRef.current = sound;
    } catch (err) {
      console.warn("⚠️ Áudio ambiente não carregou:", err);
    }
  };

  const pauseAmbient = async () => {
    try { await ambientRef.current?.setStatusAsync({ shouldPlay: false }); }
    catch {}
  };

  const resumeAmbient = async () => {
    try { await ambientRef.current?.setStatusAsync({ shouldPlay: true }); }
    catch {}
  };

  const stopAmbient = async () => {
    const sound = ambientRef.current;
    if (!sound) return;
    try {
      let step = 0;
      const fade = setInterval(async () => {
        step++;
        const vol = Math.max(0, 0.12 - (0.12 / 15) * step);
        try { await sound.setVolumeAsync(vol); } catch {}
        if (step >= 15) {
          clearInterval(fade);
          try { await sound.stopAsync(); await sound.unloadAsync(); } catch {}
          ambientRef.current = null;
        }
      }, 100);
    } catch { ambientRef.current = null; }
  };

  // ─── Timer ─────────────────────────────────────────────────────────
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

  // ─── Encerrar completamente e ir para feedback ──────────────────────
  const handleEnd = useCallback(async () => {
    console.log("🏁 SESSÃO ENCERRADA");
    setIsActive(false);
    setIsPaused(false);
    setState("idle");
    startAnimation("idle");
    audioManager.stop();
    stopAmbient();

    // FIX: fecha o peer connection e libera o microfone
    if (pcRef.current) {
      try {
        const senders = pcRef.current.getSenders?.() ?? [];
        senders.forEach((sender: any) => {
          if (sender?.track) {
            sender.track.stop(); // FIX: para a track de áudio explicitamente
            sender.track.enabled = false;
          }
        });
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }

    setRemoteStream(null);

    // FIX: libera o microfone antes de navegar
    await releaseMic();

    router.replace({
      pathname: "/(session)/feedback",
      params: { intake: intakeRaw ?? "" },
    });
  }, [startAnimation, intakeRaw, router]);

  const handleStop = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // ─── Pausar ────────────────────────────────────────────────────────
  const handlePause = async () => {
    console.log("⏸️ PAUSADO");
    setIsPaused(true);
    setState("paused");
    startAnimation("paused");
    pauseAmbient();

    // FIX: desativa as tracks de áudio ao pausar
    if (pcRef.current) {
      try {
        const senders = pcRef.current.getSenders?.() ?? [];
        senders.forEach((sender: any) => {
          if (sender?.track) sender.track.enabled = false;
        });
      } catch {}
    }
  };

  // ─── Retomar ───────────────────────────────────────────────────────
  const handleResume = async () => {
    console.log("▶️ RETOMADO");
    setIsPaused(false);
    setState("listening");
    startAnimation("listening");
    resumeAmbient();

    if (pcRef.current) {
      try {
        const senders = pcRef.current.getSenders?.() ?? [];
        senders.forEach((sender: any) => {
          if (sender?.track) sender.track.enabled = true;
        });
      } catch {}
    }
  };

  // ─── Iniciar ───────────────────────────────────────────────────────
  const handleStart = async () => {
    try {
      console.log("🚀 START VOICE");
      setTimeLeft(600);
      timeLeftRef.current = 600;
      setIsActive(true);
      setIsPaused(false);
      setState("listening");
      startAnimation("listening");

      // FIX: ativa o microfone SOMENTE aqui, ao iniciar a sessão
      await activateMic();

      audioManager.start();
      await startAmbient();

      const pc = await startRealtimeVoice(setRemoteStream, intake);
      pcRef.current = pc;

      console.log("✅ VOICE CONNECTED");
    } catch (err) {
      console.error("❌ erro start:", err);
      handleStop();
    }
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

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

      {remoteStream && Platform.OS !== "web" && (
        <RTCView streamURL={remoteStream.toURL()} style={styles.hiddenPlayer} />
      )}

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
  hiddenPlayer: { width: 1, height: 1, position: "absolute" },
  activeButtons: {
    flexDirection: "row",
    gap: 12,
  },
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