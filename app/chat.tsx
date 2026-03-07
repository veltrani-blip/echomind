import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  async function sendMessage() {
    try {
      const res = await fetch("http://127.0.0.1:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message
        })
      });

      const data = await res.json();
      setReply(data.reply || "Sem resposta");
    } catch (err) {
      console.log(err);
      setReply("Erro ao conectar");
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 30 }}>
      <TextInput
        placeholder="Digite aqui..."
        placeholderTextColor="#999"
        value={message}
        onChangeText={setMessage}
        style={{
          backgroundColor: "#fff",
          color: "#000",
          borderWidth: 1,
          padding: 12,
          marginBottom: 20,
          borderRadius: 8
        }}
      />

      <Button title="Enviar" onPress={sendMessage} />

      <Text style={{ marginTop: 30, fontSize: 16 }}>{reply}</Text>
    </View>
  );
}