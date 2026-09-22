import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { spotsService } from "../services/supabase/spots";
import { Spot } from "../services/supabase/types";
import { getCategoryIcon } from "../constants/CategoryIcons";
import { CATEGORY_LABELS } from "../constants/Categories";
import ErrorMessage from "../components/ErrorMessage";
import { Colors, Typography, BorderRadius, Spacing } from "../constants/Theme";
import { t } from "../constants/Translations";

type MapStyleElement = {
  featureType?: string;
  elementType?: string;
  stylers: object[];
};

const BARCELONA_REGION = {
  latitude: 41.3874,
  longitude: 2.1686,
  latitudeDelta: 0.35,
  longitudeDelta: 0.35,
};

const DARK_MAP_STYLE: MapStyleElement[] = [
  { elementType: "geometry", stylers: [{ color: "#1C1B1B" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8B947A" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#131313" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2A2A2A" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#212121" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6B7355" }],
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2A2A2A" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1C1B1B" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#353534" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2A2A2A" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#101508" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3D452F" }],
  },
];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { latitude, longitude } = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
  }>();

  const userRegion = useMemo(() => {
    const lat = parseFloat(String(latitude));
    const lon = parseFloat(String(longitude));
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
    return {
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [latitude, longitude]);

  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const spotsRegion = useMemo(() => {
    if (spots.length === 0) return null;

    const latMin = Math.min(...spots.map((s) => s.latitude));
    const latMax = Math.max(...spots.map((s) => s.latitude));
    const lonMin = Math.min(...spots.map((s) => s.longitude));
    const lonMax = Math.max(...spots.map((s) => s.longitude));

    return {
      latitude: (latMin + latMax) / 2,
      longitude: (lonMin + lonMax) / 2,
      latitudeDelta: Math.max(latMax - latMin, 0.05) * 1.3,
      longitudeDelta: Math.max(lonMax - lonMin, 0.05) * 1.3,
    };
  }, [spots]);

  useEffect(() => {
    loadSpots();
  }, []);

  async function loadSpots() {
    try {
      setError(null);
      const data = await spotsService.getAllForMap();
      setSpots(data);
    } catch (error: any) {
      console.error("Error loading map spots:", error);
      setError(error?.message || t.errorLoadingSpots);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {error ? (
        <ErrorMessage message={error} onRetry={loadSpots} />
      ) : (
        <>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={spotsRegion || BARCELONA_REGION}
            //customMapStyle={DARK_MAP_STYLE}
            showsUserLocation={!!userRegion}
            showsMyLocationButton={false}
            toolbarEnabled={false}
          >
            {spots.map((spot) => (
              <Marker
                key={spot.id}
                coordinate={{
                  latitude: spot.latitude,
                  longitude: spot.longitude,
                }}
                title={spot.name}
                description={CATEGORY_LABELS[spot.category] || spot.category}
                onCalloutPress={() => router.push(`/spot/${spot.id}`)}
              >
                <View style={styles.markerPin}>
                  <Ionicons
                    name={getCategoryIcon(spot.category)}
                    size={16}
                    color={Colors.onPrimary}
                  />
                </View>
              </Marker>
            ))}
          </MapView>

          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.primary} />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>{t.mapTitle}</Text>
              <Text style={styles.headerSubtitle}>
                {spots.length} {t.spots}
              </Text>
            </View>
          </View>

          {loading && (
            <View style={[styles.loadingChip, { top: insets.top + 72 }]}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>{t.loadingMap}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: Spacing.horizontalPadding,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  headerTitleWrap: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: BorderRadius.tag,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  headerTitle: {
    ...Typography.industrialLabel,
    color: Colors.primary,
  },
  headerSubtitle: {
    ...Typography.industrialLabel,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.onPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingChip: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: BorderRadius.tag,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingText: {
    ...Typography.industrialLabel,
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
