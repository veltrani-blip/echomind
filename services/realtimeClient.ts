import {
  mediaDevices,
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc";

const REALTIME_MODEL = "gpt-4o-realtime-preview-2024-12-17";
const SESSION_URL = "http://192.168.1.9:3001/session";

type SetRemoteStream = (stream: MediaStream | null) => void;

async function getEphemeralKey(): Promise<string> {
  const response = await fetch(SESSION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Falha ao criar sessão realtime (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  const secret = data?.client_secret?.value;

  if (!secret) {
    throw new Error("client_secret.value não veio no /session");
  }

  return secret;
}

function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
}

async function getMicrophoneStream(): Promise<MediaStream> {
  const stream = await mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });

  if (!stream.getAudioTracks().length) {
    throw new Error("Nenhum áudio capturado");
  }

  return stream;
}

async function postOfferToOpenAI(
  ephemeralKey: string,
  localSdp: string
): Promise<string> {
  const response = await fetch(
    `https://api.openai.com/v1/realtime?model=${REALTIME_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        "Content-Type": "application/sdp",
      },
      body: localSdp,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro OpenAI (${response.status}): ${errorText}`);
  }

  return await response.text();
}

export async function startRealtimeVoice(
  setRemoteStream: SetRemoteStream
): Promise<RTCPeerConnection> {
  let pc: RTCPeerConnection | null = null;
  let localStream: MediaStream | null = null;

  try {
    console.log("🚀 START REALTIME");

    const ephemeralKey = await getEphemeralKey();
    pc = createPeerConnection();

    localStream = await getMicrophoneStream();
    localStream.getTracks().forEach((track) => {
      pc!.addTrack(track, localStream!);
    });

    (pc as any).ontrack = (event: any) => {
      console.log("🔊 AUDIO RECEBIDO");

      const stream = event?.streams?.[0];

      if (!stream) {
        console.log("⚠️ sem stream remoto");
        return;
      }

      setRemoteStream(stream);
    };

    (pc as any).onconnectionstatechange = () => {
      console.log("🔗", pc?.connectionState);
    };

    (pc as any).oniceconnectionstatechange = () => {
      console.log("🧊", pc?.iceConnectionState);
    };

    const dc = pc.createDataChannel("oai-events");

    (dc as any).onopen = () => {
      console.log("📨 DC aberto");

      dc.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["audio", "text"],
            voice: "verse",
            instructions: `
Você é a Echomind, uma terapeuta emocional guiada.

OBJETIVO:
Conduzir sessões de 10 minutos com estrutura clara.

ESTRUTURA DA SESSÃO:

1. ABERTURA
- Cumprimente o paciente pelo nome
- Crie segurança emocional
- Pergunte como ele está se sentindo hoje

2. EXPLORAÇÃO
- Aprofunde com perguntas abertas
- Identifique emoção principal
- Evite respostas genéricas

3. VALIDAÇÃO
- Valide o sentimento com empatia
- Mostre compreensão real

4. INTERVENÇÃO
- Sugira 1 exercício (respiração, reflexão ou reframe)
- Explique de forma simples

5. FECHAMENTO
- Reforce progresso
- Deixe uma pergunta para reflexão

REGRAS:
- Nunca seja genérica
- Nunca responda curto demais
- Sempre conduza a conversa
- Fale em português do Brasil
- Seja humana, natural e acolhedora
`,
            temperature: 0.7,
            max_output_tokens: 500,
          },
        })
      );
    };

    (dc as any).onmessage = (event: any) => {
      console.log("📩", event?.data);
    };

    (dc as any).onclose = () => {
      console.log("📪 DC fechado");
    };

    (dc as any).onerror = (error: any) => {
      console.error("❌ DC erro", error);
    };

    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
    });

    await pc.setLocalDescription(offer);

    if (!offer.sdp) {
      throw new Error("Offer SDP não gerada");
    }

    const answerSdp = await postOfferToOpenAI(ephemeralKey, offer.sdp);

    await pc.setRemoteDescription(
      new RTCSessionDescription({
        type: "answer",
        sdp: answerSdp,
      })
    );

    console.log("✅ CONECTADO");

    return pc;
  } catch (error) {
    console.error("❌ ERRO", error);

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (pc) {
      try {
        pc.close();
      } catch {}
    }

    setRemoteStream(null);
    throw error;
  }
}