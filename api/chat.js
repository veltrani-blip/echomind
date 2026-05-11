const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Detecção de crise ────────────────────────────────────────────────────────
function detectCrisis(text) {
  const msg = String(text || "").toLowerCase();
  return (
    msg.includes("quero morrer") ||
    msg.includes("suicidio") ||
    msg.includes("suicídio") ||
    msg.includes("acabar com minha vida") ||
    msg.includes("não aguento mais viver") ||
    msg.includes("nao aguento mais viver")
  );
}

function crisisResponse() {
  return `Eu sinto muito que você esteja passando por um momento tão difícil.\n\nVocê não precisa enfrentar isso sozinho.\n\nNo Brasil você pode ligar gratuitamente para o CVV — 188. Eles oferecem apoio emocional 24 horas.`;
}

// ── Detecção de emoção ───────────────────────────────────────────────────────
function detectEmotion(text) {
  const msg = text.toLowerCase();
  if (msg.includes("ansioso") || msg.includes("ansiedade") || msg.includes("nervoso"))
    return "anxiety";
  if (msg.includes("triste") || msg.includes("deprimido") || msg.includes("desanimado"))
    return "sadness";
  if (msg.includes("sozinho") || msg.includes("ninguém"))
    return "loneliness";
  if (msg.includes("cansado") || msg.includes("exausto"))
    return "exhaustion";
  return "neutral";
}

// ── Handler ──────────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { message, sessionId } = req.body ?? {};

  if (!message)
    return res.status(400).json({ error: "message é obrigatório" });

  if (detectCrisis(message))
    return res.json({ reply: crisisResponse(), emotion: "crisis" });

  const emotion = detectEmotion(message);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é Echomind, uma assistente emocional empática que conversa de forma acolhedora. Respostas curtas, no máximo 3 frases.",
        },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply, emotion, sessionId });
  } catch (error) {
    console.error("Erro OpenAI chat:", error);
    res.status(500).json({ error: "Erro ao gerar resposta" });
  }
};
