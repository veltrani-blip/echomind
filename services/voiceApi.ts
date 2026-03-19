const API_URL = "http://192.168.1.9:3000";

export async function sendAudioToAI() {
  try {
    console.log("📡 Enviando requisição para:", API_URL);

    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "teste celular" }),
    });

    // 🔥 VALIDA STATUS HTTP
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erro HTTP ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    console.log("✅ Resposta servidor:", data);

    return data;
  } catch (error: any) {
    console.error("❌ Falha na requisição:", error?.message || error);
    throw error;
  }
}