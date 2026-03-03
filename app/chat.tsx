import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

  export default function Chat() {
  const params = useLocalSearchParams();
  const token = params?.token as string;
  const [messages, setMessages] = useState([
    { id: "1", from: "bot", text: "Olá! Como posso te ajudar hoje?" },
  ]);
  const [input, setInput] = useState("");

  async function getAIResponse(userText: string) {
    try {
      const res = await fetch("http://192.168.1.6:3001/chat", {
  method: "POST",
 headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`
 },
  body: JSON.stringify({ message: userText }),
});
 const data = await res.json();
 return data.reply; 

 
    } catch (e) {
      console.log("ERRO:", e);
      return "Erro ao conectar com a IA.";
    }
  }

  async function sendMessage() {
    if (!input) return;

    const userText = input;
    const userMessage = { id: Date.now().toString(), from: "user", text: userText };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const aiText = await getAIResponse(userText);
    const botMessage = { id: (Date.now() + 1).toString(), from: "bot", text: aiText };

    setMessages((prev) => [...prev, botMessage]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.message, item.from === "user" ? styles.user : styles.bot]}>
              <Text style={styles.text}>{item.text}</Text>
            </View>
          )}
        />

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Digite aqui..."
            placeholderTextColor="#aaa"
          />

          <TouchableOpacity onPress={sendMessage} style={styles.button}>
            <MaterialIcons name="send" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => console.log("Microfone clicado")}
            style={[styles.button, { marginLeft: 10, backgroundColor: "#444" }]}
          >
            <MaterialIcons name="mic" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f", padding: 16, paddingTop: 50 },
  message: { padding: 10, marginVertical: 6, borderRadius: 8, maxWidth: "80%" },
  user: { backgroundColor: "#4f46e5", alignSelf: "flex-end" },
  bot: { backgroundColor: "#333", alignSelf: "flex-start" },
  text: { color: "#fff" },
  inputArea: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: { flex: 1, backgroundColor: "#222", color: "#fff", padding: 10, borderRadius: 6 },
  button: { backgroundColor: "#4f46e5", padding: 10, borderRadius: 6 },
});