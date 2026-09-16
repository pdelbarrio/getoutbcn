import { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/supabase/auth";
import BackButton from "../components/BackButton";
import { Colors, Typography, BorderRadius, Spacing } from "../constants/Theme";
import { t } from "../constants/Translations";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading]);

  async function handleLogout() {
    try {
      await authService.signOut();
      router.replace("/");
    } catch (error) {
      console.error(t.errorClosingSession, error);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t.loading}...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <View style={styles.navRow}>
          <BackButton />
        </View>
        <Text style={styles.headerTitle}>{t.profileTitle}</Text>
      </View>

      <View style={styles.content}>

        <View style={styles.infoCard}>
          <Text style={styles.label}>{t.emailLabel}</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>{t.userIdLabel}</Text>
          <Text style={[styles.value, styles.idText]} numberOfLines={1}>
            {user.id}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>{t.logout}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.horizontalPadding * 2,
    paddingTop: 8,
  },
  header: {
    padding: 16,
    paddingTop: 40,
  },
  navRow: {
    marginBottom: 12,
  },
  headerTitle: {
    ...Typography.titleLGMobile,
    color: Colors.primary,
    textTransform: "uppercase",
  },
  loadingText: {
    ...Typography.bodyMain,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
  infoCard: {
    backgroundColor: Colors.surfaceLow,
    padding: 20,
    borderRadius: BorderRadius.card,
    marginBottom: 16,
  },
  label: {
    ...Typography.industrialLabel,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  value: {
    ...Typography.bodyHighlight,
    color: Colors.textPrimary,
  },
  idText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  logoutButton: {
    height: 52,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.button,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutButtonText: {
    ...Typography.bodyHighlight,
    color: Colors.error,
    fontWeight: "700",
  },
});
