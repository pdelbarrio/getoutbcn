import { View, FlatList, StyleSheet, Text, ActivityIndicator, RefreshControl } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { spotsService } from "../../../services/supabase/spots";
import SpotCard from "../../../components/SpotCard";
import BackButton from "../../../components/BackButton";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ErrorMessage from "../../../components/ErrorMessage";
import { Colors, Typography } from "../../../constants/Theme";
import { t } from "../../../constants/Translations";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePaginatedSpots } from "../../../hooks/usePaginatedSpots";

export default function CategoryDistrictListScreen() {
  const insets = useSafeAreaInsets();
  const { category, district } = useLocalSearchParams();
  const categoryKey = (category as string) || "";
  const districtKey = (district as string) || "";
  const key = `${categoryKey}|${districtKey}`;

  const {
    items,
    count,
    loading,
    loadingMore,
    refreshing,
    error,
    loadMore,
    refresh,
  } = usePaginatedSpots(key, (from, to) =>
    spotsService.getByCategoryAndDistrict(categoryKey, districtKey, from, to),
  );

  if (loading) {
    return <LoadingSpinner message={t.loading} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <View style={styles.navRow}>
          <BackButton />
        </View>
        <Text style={styles.title}>
          {category} × {district}
        </Text>
        <Text style={styles.subtitle}>
          {count ?? items.length} {t.spots}
        </Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SpotCard spot={item} />}
        contentContainerStyle={[
          styles.listContent,
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
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t.noSpotsInSearch}</Text>
        }
      />
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
  title: {
    ...Typography.titleLGMobile,
    color: Colors.primary,
    textTransform: "uppercase",
  },
  subtitle: {
    ...Typography.bodyMain,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
  footerLoader: {
    paddingVertical: 16,
  },
  emptyText: {
    ...Typography.bodyMain,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
});