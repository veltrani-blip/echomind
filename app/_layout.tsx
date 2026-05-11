import { Stack } from "expo-router";
import { Platform } from "react-native";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {Platform.OS === "web" && <SpeedInsights />}
    </>
  );
}
