require("dotenv").config()

const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

const PORT = 3000
app.get("/", (req, res) => {
  res.send("Servidor Echomind funcionando")
})
/*
Memória da conversa
*/
let conversationHistory = []

/*
IA FAKE PARA DESENVOLVIMENTO
*/
function fakeTherapyResponse(message) {

  const responses = [
    "Entendo. Pode me contar um pouco mais sobre isso?",
    "Como isso fez você se sentir no momento?",
    "O que você acha que desencadeou esse sentimento?",
    "Parece que isso foi importante para você.",
    "Vamos respirar um pouco e refletir sobre isso.",
    "Você já passou por algo parecido antes?",
    "O que você gostaria que fosse diferente nessa situação?"
  ]

  const random = Math.floor(Math.random() * responses.length)

  return responses[random]
}

app.post("/chat", async (req, res) => {

  try {

    const userMessage = req.body.message

    if (!userMessage) {
      return res.status(400).json({
        error: "Mensagem vazia"
      })
    }

    /*
    salva mensagem do usuário
    */
    conversationHistory.push({
      role: "user",
      content: userMessage
    })

    /*
    resposta da IA fake
    */
    const aiMessage = fakeTherapyResponse(userMessage)

    /*
    salva resposta da IA
    */
    conversationHistory.push({
      role: "assistant",
      content: aiMessage
    })

    res.json({
      reply: aiMessage,
      history: conversationHistory
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      error: "Erro no servidor"
    })
  }
})

app.listen(PORT, () => {

  console.log("Servidor Echomind rodando na porta 3000")

})