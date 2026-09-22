import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/supabase/auth";
import { profilesService } from "../services/supabase/profiles";
import AnimatedButton from "../components/AnimatedButton";
import BackButton from "../components/BackButton";
import { Colors, Typography, BorderRadius, Spacing } from "../constants/Theme";
import { t } from "../constants/Translations";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_USERNAME_LENGTH = 20;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]*$/;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading]);

  useEffect(() => {
    setUsername(profile?.username || "");
  }, [profile]);

  async function handleLogout() {
    try {
      await authService.signOut();
      router.replace("/");
    } catch (error) {
      console.error(t.errorClosingSession, error);
    }
  }

  async function handleSaveUsername() {
    if (saving || !user) return;

    const value = username.trim();

    if (value.length > MAX_USERNAME_LENGTH) {
      Alert.alert(t.error, t.nicknameTooLong);
      return;
    }

    if (!USERNAME_REGEX.test(value)) {
      Alert.alert(t.error, t.nicknameInvalidChars);
      return;
    }

    const nameToSave = value || t.nicknameAnonymous;

    setSaving(true);
    try {
      await profilesService.updateUsername(user.id, nameToSave);
      await refreshProfile();
      setUsername(nameToSave === t.nicknameAnonymous ? "" : nameToSave);
      Alert.alert(t.success, t.nicknameSaved);
    } catch (error) {
      console.error("Error saving username:", error);
      Alert.alert(t.error, String(error));
    } finally {
      setSaving(false);
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
          <Text style={styles.label}>{t.yourNickname}</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder={t.nicknamePlaceholder}
            placeholderTextColor={Colors.textMuted}
            maxLength={MAX_USERNAME_LENGTH}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.counter}>
            {username.length}/{MAX_USERNAME_LENGTH}
          </Text>
          <AnimatedButton
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveUsername}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>{t.save}</Text>
          </AnimatedButton>
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
  input: {
    ...Typography.bodyMain,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.button,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  counter: {
    ...Typography.industrialLabel,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 6,
    alignSelf: "flex-end",
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...Typography.industrialLabel,
    fontSize: 14,
    color: Colors.onPrimary,
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
