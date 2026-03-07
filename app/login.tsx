import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Login() {
  const router = useRouter();

  function handleLogin() {
    router.push("/chat");
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity
        style={{
          backgroundColor: "#ff4d6d",
          padding: 20,
          borderRadius: 10
        }}
        onPress={handleLogin}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}