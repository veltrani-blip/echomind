import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MoodCheck() {
  const router = useRouter();

  function selectMood(mood: string) {
    router.push("/home");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Como você está se sentindo hoje?</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => selectMood("feliz")}
      >
        <Text style={styles.text}>🙂 Feliz</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => selectMood("ansioso")}
      >
        <Text style={styles.text}>😟 Ansioso</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => selectMood("triste")}
      >
        <Text style={styles.text}>😔 Triste</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 30,
    justifyContent: "center",
  },

  title: {
    color: "white",
    fontSize: 22,
    marginBottom: 30,
  },

  button: {
    backgroundColor: "#1e293b",
    padding: 18,
    borderRadius: 10,
    marginBottom: 12,
  },

  text: {
    color: "white",
    fontSize: 18,
  },
});