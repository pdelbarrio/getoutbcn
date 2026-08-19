import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Typography, Spacing } from "../constants/Theme";
import { t } from "../constants/Translations";
import AnimatedButton from "./AnimatedButton";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

/**
 * Component de missatge d'error reutilitzable amb botó de reintentar opcional
 */
export default function ErrorMessage({
  message,
  onRetry,
  retryText = t.retry,
}: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <AnimatedButton style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>{retryText}</Text>
        </AnimatedButton>
      )}
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
  errorText: {
    ...Typography.bodyMain,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    ...Typography.bodyHighlight,
    color: Colors.onPrimary,
    fontWeight: "700",
  },
});
