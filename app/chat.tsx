import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function Chat() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    try {
      const response = await fetch("http://192.168.1.9:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
          sessionId: "user-session-1",
        }),
      });

      if (!response.ok) {
        throw new Error("Erro HTTP");
      }

      const data = await response.json();

      const botMessage: Message = {
        role: "assistant",
        text: data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Erro ao conectar com o servidor.",
        },
      ]);
    }
  }

  function leaveSession() {
    router.replace("/home");
  }

  function endSession() {
    router.push("/feedback");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      <View style={styles.sessionBar}>
        <TouchableOpacity style={styles.smallButton} onPress={leaveSession}>
          <Text style={styles.smallText}>Sair</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Echomind</Text>

        <TouchableOpacity style={styles.smallButton} onPress={endSession}>
          <Text style={styles.smallText}>Encerrar</Text>
        </TouchableOpacity>
      </View>

      {/* CHAT */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              styles.messageBubble,
              msg.role === "user"
                ? styles.userBubble
                : styles.botBubble,
            ]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* INPUT */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="#6B7280"
          onSubmitEditing={sendMessage}
        />

        <TouchableOpacity style={styles.button} onPress={sendMessage}>
          <Text style={styles.buttonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0F14",
    padding: 16,
  },

  sessionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  headerTitle: {
    color: "#E6E8EE",
    fontSize: 16,
    fontWeight: "500",
  },

  smallButton: {
    backgroundColor: "#1F2430",
    padding: 10,
    borderRadius: 8,
  },

  smallText: {
    color: "#E6E8EE",
  },

  chatArea: {
    flex: 1,
  },

  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#6C63FF",
  },

  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#1F2430",
  },

  messageText: {
    color: "#fff",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "#1F2430",
    padding: 14,
    borderRadius: 12,
    color: "#fff",
  },

  button: {
    backgroundColor: "#6C63FF",
    padding: 14,
    borderRadius: 12,
    marginLeft: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
});