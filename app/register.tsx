import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";

export default function Register() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {

    if (!name || !email || !password) {
      Alert.alert("Preencha todos os campos");
      return;
    }

    try {

      const res = await fetch("http://192.168.1.8:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(data.error || "Erro no cadastro");
        return;
      }

      Alert.alert("Usuário criado com sucesso");

      router.push("/login");

    } catch (err) {

      Alert.alert("Erro ao conectar com o servidor");

    }
  }

  return (

    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#2b2b2b"
      }}
    >

      <TextInput
        placeholder="Nome"
        placeholderTextColor="#94a3b8"
        value={name}
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
        value={email}
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
        placeholder="Telefone"
        placeholderTextColor="#94a3b8"
        value={phone}
        onChangeText={setPhone}
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
        value={password}
        onChangeText={setPassword}
        style={{
          backgroundColor: "#1e293b",
          color: "#fff",
          borderRadius: 8,
          padding: 12,
          marginBottom: 20
        }}
      />

      <Button
        title="Criar conta"
        onPress={handleRegister}
      />

    </View>
  );

}