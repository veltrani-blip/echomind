import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ChatMessage = {
  role: "user" | "bot";
  type: "text" | "video";
  text?: string;
  url?: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    setMessages([
      {
        role: "bot",
        type: "text",
        text: "Olá, eu sou o Echomind. Como posso te ajudar hoje?",
      },
    ]);
  }, []);

  async function sendMessage() {
    if (!message.trim()) return;

    const currentMessage = message;

    const userMsg: ChatMessage = {
      role: "user",
      type: "text",
      text: currentMessage,
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
        }),
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        role: "bot",
        type: "text",
        text: data.reply,
  
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        role: "bot",
        type: "text",
        text: "Erro ao conectar com o servidor.",
      };

      setMessages((prev) => [...prev, errorMsg]);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg, index) => {
          if (msg.type === "video" && msg.url) {
            return (
              <View key={index} style={styles.botBubble}>
                <Video
                  source={{ uri: msg.url }}
                  style={styles.video}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={false}
                />
              </View>
            );
          }

          return (
            <View
              key={index}
              style={msg.role === "user" ? styles.userBubble : styles.botBubble}
            >
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputArea}>
<TextInput
  style={styles.input}
  value={message}
  onChangeText={setMessage}
  placeholder="Digite sua mensagem..."
  placeholderTextColor="#777"
  onSubmitEditing={sendMessage}
  returnKeyType="send"
/>
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },

  chatArea: {
    flex: 1,
  },

  chatContent: {
    padding: 20,
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#1DBF73",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: "80%",
  },

  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e4e4e4",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: "80%",
  },

  messageText: {
    fontSize: 16,
    color: "#111",
  },

  video: {
    width: 250,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#000",
  },

  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
  },

  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: "#111",
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: "#1DBF73",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  sendButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});