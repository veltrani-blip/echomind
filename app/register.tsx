import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function handleRegister() {
    const res = await fetch("http://192.168.1.6:3001/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();

    if (!res.ok) {
      Alert.alert(data.error || "Erro");
      return;
    }

    Alert.alert("Usuário criado!");
    router.push("/");
  }

  return (
    <View style={{ 
      flex: 1,
      justifyContent: "center",
      padding: 20,
     backgroundColor: "#0f172a"
    }}>

      <TextInput
        placeholder="Nome"
        placeholderTextColor="#94a3b8"
        onChangeText={setName}
        style={{
          backgroundColor: "#1e293b",
          color: "#fff",
          borderRadius: 8,
          padding: 12,
          marginBottom: 12
        }}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        onChangeText={setEmail}
        style={{
          backgroundColor: "#1e293b",
          color: "#fff",
          borderRadius: 8,
          padding: 12,
          marginBottom: 12
        }}
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        onChangeText={setPassword}
        style={{
          backgroundColor: "#1e293b",
          color: "#fff",
          borderRadius: 8,
          padding: 12,
          marginBottom: 20
        }}
      />

      <Button title="Cadastrar" onPress={handleRegister} />
    </View>
  );
}