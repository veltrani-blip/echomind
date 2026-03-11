import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { useRouter } from "expo-router";

export default function Chat() {

  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  async function sendMessage() {

    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      text: input
    };

    setMessages(prev => [...prev, userMessage]);

    try {

      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: input,
          sessionId: "demo-session"
        })
      });

      const data = await response.json();

      const botMessage = {
        role: "assistant",
        text: data.reply
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {

      const errorMessage = {
        role: "assistant",
        text: "Erro ao conectar com o servidor."
      };

      setMessages(prev => [...prev, errorMessage]);

    }

    setInput("");
  }

  function leaveSession() {
    router.push("/home");
  }

  function endSession() {
    router.push("/feedback");
  }

  return (

    <View style={styles.container}>

      <View style={styles.sessionBar}>

        <TouchableOpacity
          style={styles.smallButton}
          onPress={leaveSession}
        >
          <Text style={styles.smallText}>Sair</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.smallButton}
          onPress={endSession}
        >
          <Text style={styles.smallText}>Encerrar</Text>
        </TouchableOpacity>

      </View>

      <ScrollView style={styles.chatArea}>

        {messages.map((msg, i) => (
          <Text key={i} style={styles.message}>
            {msg.role === "user" ? "Você: " : "Echomind: "}
            {msg.text}
          </Text>
        ))}

      </ScrollView>

      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Digite sua mensagem..."
        onSubmitEditing={sendMessage}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={sendMessage}
      >
        <Text style={styles.buttonText}>Enviar</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#0f172a",
    padding:20
  },

  sessionBar:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:10
  },

  smallButton:{
    backgroundColor:"#1e293b",
    padding:10,
    borderRadius:8
  },

  smallText:{
    color:"white"
  },

  chatArea:{
    flex:1,
    marginBottom:10
  },

  message:{
    color:"white",
    marginBottom:10
  },

  input:{
    backgroundColor:"white",
    padding:12,
    borderRadius:8,
    marginBottom:10
  },

  button:{
    backgroundColor:"#ff4d6d",
    padding:16,
    borderRadius:8
  },

  buttonText:{
    color:"white",
    textAlign:"center"
  }

});