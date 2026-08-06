import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Colors, Typography, BorderRadius } from "../constants/Theme";

interface SearchButtonProps {
  onPress: () => void;
  disabled: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function SearchButton({ onPress, disabled }: SearchButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedTouchable
      style={[styles.button, disabled && styles.buttonDisabled, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>CERCAR</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: Colors.surfaceHigh,
    opacity: 0.5,
  },
  buttonText: {
    ...Typography.industrialLabel,
    fontSize: 16,
    color: Colors.onPrimary,
    fontWeight: "700",
  },
});
