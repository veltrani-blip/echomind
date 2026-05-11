import { Stack } from "expo-router";
import { Platform } from "react-native";

let SpeedInsights: React.ComponentType | null = null;
if (Platform.OS === "web") {
  SpeedInsights = require("@vercel/speed-insights/react").SpeedInsights;
}

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="home" />
        <Stack.Screen name="(session)" options={{ animation: "slide_from_bottom", gestureEnabled: false }} />
      </Stack>
      {SpeedInsights && <SpeedInsights />}
    </>
  );
}