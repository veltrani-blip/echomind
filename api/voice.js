const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Vercel serverless não tem sistema de arquivos persistente.
// Retorna o áudio como base64 para o frontend tocar direto.
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { text } = req.body ?? {};

  if (!text)
    return res.status(400).json({ error: "text é obrigatório" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é Echomind, uma assistente emocional empática. Respostas curtas, no máximo 3 frases.",
        },
        { role: "user", content: text },
      ],
    });

    const reply = completion.choices[0].message.content;

    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: reply,
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    const audioBase64 = buffer.toString("base64");

    res.json({
      text: reply,
      audio: `data:audio/mpeg;base64,${audioBase64}`,
    });
  } catch (error) {
    console.error("Erro OpenAI voice:", error);
    res.status(500).json({ error: "Erro ao gerar voz" });
  }
};
