import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { spotsService } from "../services/supabase/spots";
import { Spot } from "../services/supabase/types";
import { calculateDistance } from "../utils/geolocation";
import NearbySpotCard from "../components/NearbySpotCard";
import BackButton from "../components/BackButton";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { Colors, Typography } from "../constants/Theme";
import { t } from "../constants/Translations";

type NearbyItem = { spot: Spot; distance: number };

export default function NearbyScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<NearbyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNearby();
  }, []);

  async function loadNearby() {
    try {
      setError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError(t.locationPermissionDenied);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const spots = await spotsService.getNearby(
        location.coords.latitude,
        location.coords.longitude,
      );

      setItems(
        spots.map((spot) => ({
          spot,
          distance: calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            spot.latitude,
            spot.longitude,
          ),
        })),
      );
    } catch (error: any) {
      console.error("Error loading nearby spots:", error);
      setError(error?.message || t.errorLoadingSpot);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message={t.loadingNearby} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadNearby} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <View style={styles.navRow}>
          <BackButton />
        </View>
        <Text style={styles.title}>{t.nearbySpots}</Text>
        <Text style={styles.subtitle}>
          {items.length} {t.spots}
        </Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.spot.id}
        renderItem={({ item }) => (
          <NearbySpotCard spot={item.spot} distance={item.distance} />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        ListEmptyComponent={<Text style={styles.emptyText}>{t.noNearbySpots}</Text>}
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
  emptyText: {
    ...Typography.bodyMain,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
});