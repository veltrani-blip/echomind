import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Echomind</Text>
      <Text style={styles.subtitle}>Listen to your mind</Text>

      <TouchableOpacity
        style={styles.primary}
        onPress={() => router.push("/voiceSession")}
      >
        <Text style={styles.text}>🎤 Voz</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondary}
        onPress={() => router.push("/chat")}
      >
        <Text style={styles.text}>💬 Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0C10",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 8,
  },

  subtitle: {
    color: "#888",
    marginBottom: 40,
  },

  primary: {
    backgroundColor: "#6C63FF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },

  secondary: {
    backgroundColor: "#1F2430",
    padding: 20,
    borderRadius: 20,
  },

  text: {
    color: "#fff",
    fontSize: 16,
  },
});