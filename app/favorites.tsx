import { useEffect } from "react";
import { View, FlatList, Text, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
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
import { usePaginatedSpots } from "../hooks/usePaginatedSpots";

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const userKey = user?.id ?? "no-auth";

  const {
    items,
    loading,
    loadingMore,
    refreshing,
    error,
    loadMore,
    refresh,
  } = usePaginatedSpots(userKey, (from, to) => {
    if (!user) return Promise.resolve({ data: [] as Spot[], count: null });
    return favoritesService.getSpotsByUserId(user.id, from, to);
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading]);

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
        <ErrorMessage message={error} onRetry={refresh} />
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t.noFavorites}</Text>
          <Text style={styles.emptySubtext}>{t.noFavoritesSubtext}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SpotCard spot={item} />}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 20 },
          ]}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={Colors.primary}
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={Colors.primary}
                style={styles.footerLoader}
              />
            ) : null
          }
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
  footerLoader: {
    paddingVertical: 16,
  },
});