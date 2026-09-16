import { useEffect, useState } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { favoritesService } from "../services/supabase/favorites";
import { Spot } from "../services/supabase/types";
import SpotCard from "../components/SpotCard";
import LoadingSpinner from "../components/LoadingSpinner";
import BackButton from "../components/BackButton";
import ErrorMessage from "../components/ErrorMessage";
import { Colors, Typography, Spacing } from "../constants/Theme";
import { t } from "../constants/Translations";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [favoriteSpots, setFavoriteSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user) {
      loadFavorites();
    }
  }, [user, authLoading]);

  async function loadFavorites() {
    try {
      setLoading(true);
      setError(null);
      const spots = await favoritesService.getSpotsByUserId(user!.id);
      setFavoriteSpots(spots);
    } catch (error: any) {
      console.error("Error loading favorites:", error);
      setError(error.message || t.errorLoadingFavorites);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return <LoadingSpinner message={t.loadingFavorites} />;
  }

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <View style={styles.navRow}>
          <BackButton />
        </View>
        <Text style={styles.headerTitle}>{t.favorites}</Text>
      </View>

      {error ? (
        <ErrorMessage message={error} onRetry={loadFavorites} />
      ) : favoriteSpots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t.noFavorites}</Text>
          <Text style={styles.emptySubtext}>{t.noFavoritesSubtext}</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteSpots}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SpotCard spot={item} />}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 20 },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: Spacing.horizontalPadding * 2,
  },
  emptyText: {
    ...Typography.titleLGMobile,
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtext: {
    ...Typography.bodyMain,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  list: {
    paddingVertical: 16,
  },
});
