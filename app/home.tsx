import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Echomind</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/session")}
      >
        <Text style={styles.text}>Iniciar Sessão</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/chat")}
      >
        <Text style={styles.text}>Abrir Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "white",
    fontSize: 26,
    marginBottom: 40,
  },

  button: {
    backgroundColor: "#ff4d6d",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    width: 200,
    alignItems: "center",
  },

  text: {
    color: "white",
    fontSize: 18,
  },
});