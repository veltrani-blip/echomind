import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Login() {
  const router = useRouter();

  function handleLogin() {
    // continua o fluxo do app
    router.push("/moodCheck");
  }

  return (
    <View style={styles.container}>

      {/* botão voltar */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Entrar no Echomind</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Continuar sem login</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9F8",
  },

  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
  },

  backText: {
    fontSize: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 40,
  },

  button: {
    backgroundColor: "#1DBF73",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 20,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});