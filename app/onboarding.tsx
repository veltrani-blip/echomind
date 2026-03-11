import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Onboarding() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Echomind é um espaço seguro para conversar sobre como você está se sentindo.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/moodCheck")}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    padding: 30,
  },

  text: {
    color: "white",
    fontSize: 20,
    marginBottom: 40,
  },

  button: {
    backgroundColor: "#ff4d6d",
    padding: 16,
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
});