import InCallManager from "react-native-incall-manager";

class AudioManager {
  private active = false;

  start(): void {
    if (this.active) {
      console.log("🔊 AudioManager já estava ativo");
      return;
    }

    try {
      console.log("🔊 Iniciando roteamento de áudio");

      // Inicia modo de mídia/áudio
      InCallManager.start({ media: "audio" });

      // Força saída no alto-falante
      InCallManager.setSpeakerphoneOn(true);

      // Garante tela ativa durante a sessão
      InCallManager.setKeepScreenOn(true);

      // Desliga sensor de proximidade para não apagar tela
      InCallManager.setForceSpeakerphoneOn(true);

      this.active = true;

      console.log("✅ AudioManager iniciado");
    } catch (error) {
      console.error("❌ Erro ao iniciar AudioManager:", error);
    }
  }

  stop(): void {
    if (!this.active) {
      console.log("🔇 AudioManager já estava parado");
      return;
    }

    try {
      console.log("🔇 Encerrando roteamento de áudio");

      // Libera tela
      InCallManager.setKeepScreenOn(false);

      // Reseta speakerphone
      InCallManager.setSpeakerphoneOn(false);

      // Finaliza modo de chamada/mídia
      InCallManager.stop();

      this.active = false;

      console.log("✅ AudioManager encerrado");
    } catch (error) {
      console.error("❌ Erro ao parar AudioManager:", error);
    }
  }

  isActive(): boolean {
    return this.active;
  }
}

export const audioManager = new AudioManager();