import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { Colors, Typography, Spacing } from "../constants/Theme";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Component de càrrega reutilitzable
 */
export default function LoadingSpinner({
  message,
  fullScreen = true,
}: LoadingSpinnerProps) {
  return (
    <View style={[styles.container, !fullScreen && styles.inline]}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: Spacing.horizontalPadding * 2,
  },
  inline: {
    flex: 0,
    paddingVertical: 20,
  },
  message: {
    ...Typography.bodyMain,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: "center",
  },
});
