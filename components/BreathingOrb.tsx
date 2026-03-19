import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

type Props = {
  state: "idle" | "listening" | "speaking";
};

export default function BreathingOrb({ state }: Props) {
  const scale = useSharedValue(1);

  useEffect(() => {
    let duration = 2000;

    if (state === "listening") duration = 1200;
    if (state === "speaking") duration = 1800;

    scale.value = withRepeat(
      withTiming(1.3, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: 0.8,
    };
  });

  const getColor = () => {
    if (state === "listening") return "#00D4FF";
    if (state === "speaking") return "#6C63FF";
    return "#444";
  };

  return (
    <Animated.View
      style={[
        styles.orb,
        { backgroundColor: getColor() },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  orb: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
});