require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 3000;

let currentSessionId = null;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor Echomind online");
});

function fakeTherapyResponse(message) {
  const text = String(message || "").toLowerCase();

  if (text.includes("ansioso") || text.includes("ansiedade")) {
    return "Entendo. Quando essa ansiedade costuma aparecer com mais força?";
  }

  if (text.includes("triste") || text.includes("tristeza")) {
    return "Sinto muito que você esteja passando por isso. Quer me contar o que aconteceu?";
  }

  if (text.includes("cansado") || text.includes("cansada")) {
    return "Parece que você está sobrecarregado. Esse cansaço é mais físico, mental ou os dois?";
  }

  if (text.includes("trabalho")) {
    return "Seu trabalho parece estar pesando bastante. O que nele mais tem te afetado?";
  }

  const responses = [
    "Entendo. Pode me contar um pouco mais sobre isso?",
    "Como isso fez você se sentir no momento?",
    "O que você acha que desencadeou esse sentimento?",
    "Parece que isso foi importante para você.",
    "Vamos respirar um pouco e refletir sobre isso.",
    "Você já passou por algo parecido antes?",
    "O que você gostaria que fosse diferente nessa situação?"
  ];

  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

app.post("/chat", (req, res) => {
  try {
    const userMessage = req.body?.message;

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({
        reply: "Mensagem vazia."
      });
    }

    db.run(
      "INSERT INTO messages (user_id, role, content) VALUES (?, ?, ?)",
      [1, "user", userMessage],
      (insertUserError) => {
        if (insertUserError) {
          console.error("Erro ao salvar mensagem do usuário:", insertUserError);
          return res.status(500).json({
            reply: "Erro ao salvar mensagem."
          });
        }

        db.all(
          "SELECT role, content FROM messages WHERE user_id = ? ORDER BY id ASC LIMIT 10",
          [1],
          (historyError, rows) => {
            if (historyError) {
              console.error("Erro ao buscar histórico:", historyError);
              return res.status(500).json({
                reply: "Erro ao buscar histórico."
              });
            }

            console.log("Histórico recente:", rows);

            const history = rows
              .map((m) => `${m.role}: ${m.content}`)
              .join("\n");

            const contextPrompt = `
Histórico da conversa:
${history}

Usuário acabou de dizer:
${userMessage}

Responda como uma terapeuta empática.
`;

            const aiMessage = fakeTherapyResponse(contextPrompt);

            
              db.run(
  "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
  [currentSessionId, "assistant", aiMessage],
  (insertAiError) => {
                if (insertAiError) {
                  console.error("Erro ao salvar resposta da IA:", insertAiError);
                  return res.status(500).json({
                    reply: "Erro ao salvar resposta."
                  });
                }

                return res.json({
                  reply: aiMessage
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error("ERRO NO /chat:", error);

    return res.status(500).json({
      reply: "Erro interno do servidor."
    });
  }
});
db.run(
  "INSERT INTO sessions DEFAULT VALUES",
  function (err) {
    if (err) {
      console.error("Erro ao criar sessão:", err);
    } else {
      currentSessionId = this.lastID;
      console.log("Sessão criada:", currentSessionId);
    }
  }
);
app.listen(PORT, () => {
  console.log(`Servidor Echomind rodando na porta ${PORT}`);
});