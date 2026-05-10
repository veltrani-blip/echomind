import type { IntakeData } from "@/types/user";

type SetRemoteStream = (stream: MediaStream | null) => void;

const REALTIME_MODEL = "gpt-4o-realtime-preview-2024-12-17";
const SESSION_URL =
  process.env.EXPO_PUBLIC_SESSION_URL ?? "http://localhost:3001/session";

async function getEphemeralKey(intake: IntakeData | null): Promise<string> {
  const response = await fetch(SESSION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intake }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha ao criar sessao (${response.status}): ${text}`);
  }
  const data = await response.json();
  const secret = data?.client_secret?.value;
  if (!secret) throw new Error("client_secret.value ausente");
  return secret;
}

export async function startRealtimeVoice(
  setRemoteStream: SetRemoteStream,
  intake: IntakeData | null = null
): Promise<RTCPeerConnection> {
  let pc: RTCPeerConnection | null = null;
  let localStream: MediaStream | null = null;

  try {
    console.log("START REALTIME (web)");
    const ephemeralKey = await getEphemeralKey(intake);

    pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.addTransceiver("audio", { direction: "sendrecv" });

    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    if (!localStream.getAudioTracks().length)
      throw new Error("Nenhum audio capturado");

    localStream.getTracks().forEach((t) => pc!.addTrack(t, localStream!));

    pc.ontrack = (event) => {
      const stream = event.streams[0] ?? null;
      if (!stream) { console.warn("ontrack sem stream"); return; }
      setRemoteStream(stream);
    };

    pc.onconnectionstatechange = () =>
      console.log("connectionState:", pc?.connectionState);
    pc.oniceconnectionstatechange = () =>
      console.log("iceConnectionState:", pc?.iceConnectionState);

    const dc = pc.createDataChannel("oai-events");
    dc.onopen = () => {
      console.log("DataChannel aberto (web)");
      dc.send(
        JSON.stringify({
          type: "response.create",
          response: { modalities: ["audio", "text"], max_output_tokens: 600 },
        })
      );
    };
    dc.onmessage = (e) => console.log("DC msg:", e.data);
    dc.onerror = (e) => console.error("DC erro:", e);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await new Promise<void>((resolve) => {
      if (pc!.iceGatheringState === "complete") { resolve(); return; }
      const h = () => {
        if (pc!.iceGatheringState === "complete") {
          pc!.removeEventListener("icegatheringstatechange", h);
          resolve();
        }
      };
      pc!.addEventListener("icegatheringstatechange", h);
      setTimeout(resolve, 3000);
    });

    const finalSdp = pc.localDescription?.sdp;
    if (!finalSdp) throw new Error("SDP local ausente apos ICE gathering");

    const aiRes = await fetch(
      `https://api.openai.com/v1/realtime?model=${REALTIME_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
        body: finalSdp,
      }
    );
    if (!aiRes.ok) {
      const text = await aiRes.text();
      throw new Error(`Erro OpenAI (${aiRes.status}): ${text}`);
    }
    const answerSdp = await aiRes.text();

    await pc.setRemoteDescription(
      new RTCSessionDescription({ type: "answer", sdp: answerSdp })
    );

    console.log("CONECTADO (web)");
    return pc;
  } catch (error) {
    console.error("ERRO startRealtimeVoice (web):", error);
    localStream?.getTracks().forEach((t) => t.stop());
    try { pc?.close(); } catch {}
    setRemoteStream(null);
    throw error;
  }
}
