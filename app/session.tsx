import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Session() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Vamos conversar um pouco sobre como você está se sentindo.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/chat")}
      >
        <Text style={styles.text}>Começar conversa</Text>
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

  title: {
    color: "white",
    fontSize: 22,
    marginBottom: 40,
  },

  button: {
    backgroundColor: "#ff4d6d",
    padding: 18,
    borderRadius: 10,
  },

  text: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
});