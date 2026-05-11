// Vercel Serverless Function — proxy para criar sessão OpenAI Realtime.
// Roda em /api/session no mesmo domínio do frontend.

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { intake } = req.body ?? {};
  const userName = intake?.name ?? "você";
  const userMood = intake?.mood ?? null;
  const userGoal = intake?.goal ?? null;

  const systemPrompt = [
    `Você é a EchoMind, uma IA de suporte emocional acolhedora e empática.`,
    `Está conversando com ${userName}.`,
    userMood ? `O estado emocional atual do usuário é: ${userMood}.` : null,
    userGoal ? `O objetivo da sessão é: ${userGoal}.` : null,
    ``,
    `Regras de comportamento — siga sem exceção:`,
    `- Você tem memória ativa da conversa. Nunca abandone um assunto no meio.`,
    `- Se o usuário pausar, respirar fundo ou fazer silêncio, aguarde — ele ainda está no mesmo tema.`,
    `- Só mude de assunto se o usuário pedir explicitamente ou introduzir um tema novo com clareza.`,
    `- Se ouvir um ruído externo ou palavra solta, ignore e continue exatamente de onde parou.`,
    `- Após qualquer interrupção técnica ou pausa longa, retome com: "Como eu estava dizendo..." ou "Voltando ao que você trouxe...".`,
    `- Nunca inicie um assunto novo por conta própria no meio de uma linha de raciocínio.`,
    `- Respostas curtas — no máximo 3 frases. Fale como um humano, não como um relatório.`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        modalities: ["audio", "text"],
        instructions: systemPrompt,
        voice: "alloy",
        turn_detection: {
          type: "server_vad",
          threshold: 0.65,
          prefix_padding_ms: 400,
          silence_duration_ms: 1200,
          interrupt_response: false,
        },
        max_response_output_tokens: 400,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro OpenAI:", data);
      return res.status(response.status).json({ ok: false, error: data });
    }

    if (!data.client_secret) {
      return res
        .status(500)
        .json({ ok: false, error: "client_secret não retornado pela OpenAI" });
    }

    res.json({ ok: true, client_secret: data.client_secret });
  } catch (error) {
    console.error("Erro ao criar sessão realtime:", error);
    res.status(500).json({ ok: false, error: "Falha interna ao criar sessão" });
  }
};
