// Web stub — react-native-incall-manager não existe no browser.
// O roteamento de áudio no web é gerenciado pelo próprio navegador.

class AudioManager {
  start(): void {}
  stop(): void {}
  isActive(): boolean { return false; }
}

export const audioManager = new AudioManager();

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type SendAudioToAIParams = { token: string; message?: string };
type SendAudioToAIResponse = {
  ok?: boolean;
  reply?: string;
  note?: string;
  error?: string;
};

export async function sendAudioToAI({
  token,
  message = "teste",
}: SendAudioToAIParams): Promise<SendAudioToAIResponse> {
  const response = await fetch(`${API_URL}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Erro HTTP ${response.status}`);
  return data;
}
