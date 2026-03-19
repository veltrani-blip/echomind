import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import InCallManager from "react-native-incall-manager";
import { MediaStream, RTCView } from "react-native-webrtc";

import { startRealtimeVoice } from "../services/realtimeClient";

export default function VoiceSession() {
  const [isActive, setIsActive] = useState(false);
  const [state, setState] = useState<"idle" | "listening" | "speaking">("idle");
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // ⏱ TIMER
  const [timeLeft, setTimeLeft] = useState(600); // 10 min

  const pcRef = useRef<any>(null);

  const scale = useSharedValue(1);

  // animação
  const startAnimation = (mode: "idle" | "listening" | "speaking") => {
    let duration = 2000;

    if (mode === "listening") duration = 1200;
    if (mode === "speaking") duration = 1800;

    scale.value = withRepeat(
      withTiming(1.3, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.85,
  }));

  const getColor = () => {
    if (state === "listening") return "#00D4FF";
    if (state === "speaking") return "#6C63FF";
    return "#444";
  };

  // ⏱ CONTROLE DO TIMER
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleStop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // 🔥 START
  const handleStart = async () => {
    try {
      console.log("🚀 START VOICE");

      setTimeLeft(600); // reset timer

      setIsActive(true);
      setState("listening");
      startAnimation("listening");

      InCallManager.start({ media: "audio" });
      InCallManager.setSpeakerphoneOn(true);

      const pc = await startRealtimeVoice(setRemoteStream);
      pcRef.current = pc;

      console.log("✅ VOICE CONNECTED");
    } catch (err) {
      console.error("❌ erro start:", err);
    }
  };

  // 🔥 STOP
  const handleStop = () => {
    console.log("🛑 STOP VOICE");

    setIsActive(false);
    setState("idle");
    startAnimation("idle");

    InCallManager.stop();

    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }

    setRemoteStream(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Echomind</Text>

      {/* ⏱ TIMER UI */}
      <Text style={{ color: "#fff", marginBottom: 10 }}>
        {Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, "0")}
      </Text>

      <Text style={styles.subtitle}>
        {state === "idle" && "Pronto para ouvir"}
        {state === "listening" && "Estou ouvindo..."}
        {state === "speaking" && "Respondendo..."}
      </Text>

      {/* ORB */}
      <View style={styles.orbContainer}>
        <Animated.View
          style={[
            styles.orb,
            { backgroundColor: getColor() },
            animatedStyle,
          ]}
        />
      </View>

      {/* 🔊 PLAYER INVISÍVEL */}
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={{ width: 1, height: 1 }}
        />
      )}

      {/* BOTÃO */}
      {!isActive ? (
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Iniciar conversa</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#FF4D4D" }]}
          onPress={handleStop}
        >
          <Text style={styles.buttonText}>Encerrar</Text>
        </TouchableOpacity>
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

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 6,
  },

  subtitle: {
    color: "#aaa",
    marginBottom: 40,
  },

  orbContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
  },

  orb: {
    width: 180,
    height: 180,
    borderRadius: 90,
    shadowColor: "#6C63FF",
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },

  button: {
    backgroundColor: "#6C63FF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});