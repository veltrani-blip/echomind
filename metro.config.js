const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// No web, substitui react-native-webrtc pelo stub de browser.
// O Expo Router importa todos os arquivos de rota para montar o mapa de navegação,
// incluindo voiceSession.tsx que tem import nativo — sem esse resolver o Metro
// tentaria carregar requireNativeComponent no browser e quebraria.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "react-native-webrtc") {
    return {
      filePath: path.resolve(__dirname, "stubs/react-native-webrtc.web.js"),
      type: "sourceFile",
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
