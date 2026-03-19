import { Audio } from "expo-av";

let recording: Audio.Recording | null = null;

export async function startRecording() {

  try {

    if (recording) {
      console.log("Já existe gravação em andamento");
      return;
    }

    const permission = await Audio.requestPermissionsAsync();

    if (!permission.granted) {
      throw new Error("Permissão de microfone negada");
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    recording = new Audio.Recording();

    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    await recording.startAsync();

    console.log("🎤 Gravação iniciada");

  } catch (error) {

    console.error("Erro iniciando gravação:", error);

  }

}

export async function stopRecording() {

  try {

    if (!recording) {
      console.log("Nenhuma gravação ativa");
      return null;
    }

    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();

    console.log("🎧 Arquivo gravado:", uri);

    recording = null;

    return uri;

  } catch (error) {

    console.error("Erro parando gravação:", error);
    return null;

  }

}