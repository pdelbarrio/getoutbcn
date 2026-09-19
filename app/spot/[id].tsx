import { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Alert, Linking } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { spotsService } from "../../services/supabase/spots";
import { favoritesService } from "../../services/supabase/favorites";
import { useAuth } from "../../contexts/AuthContext";
import { Spot } from "../../services/supabase/types";
import SpotDetailHeader from "../../components/SpotDetailHeader";
import SpotInfo from "../../components/SpotInfo";
import CategoryTag from "../../components/CategoryTag";
import DistrictButton from "../../components/DistrictButton";
import TagButton from "../../components/TagButton";
import MapViewWrapper from "../../components/MapViewWrapper";
import AnimatedButton from "../../components/AnimatedButton";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { Colors, Typography, Spacing, BorderRadius } from "../../constants/Theme";
import { t } from "../../constants/Translations";

export default function SpotDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSpot();
    if (user) checkFavorite();
  }, [id, user]);

  async function loadSpot() {
    try {
      setError(null);
      const data = await spotsService.getById(id as string);
      setSpot(data);
    } catch (error: any) {
      console.error("Error loading spot:", error);
      setError(error.message || t.errorLoadingSpot);
    } finally {
      setLoading(false);
    }
  }

  async function checkFavorite() {
    try {
      const fav = await favoritesService.isFavorite(user!.id, id as string);
      setIsFavorite(fav);
    } catch (error) {
      console.error("Error checking favorite:", error);
      setIsFavorite(false);
    }
  }

  async function openDirections() {
    if (!spot) return;

    if (!spot.latitude || !spot.longitude) {
      Alert.alert(t.error, t.errorInvalidCoordinates);
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}&travelmode=walking`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert(t.error, t.errorOpenMaps);
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error opening maps:", error);
      Alert.alert(t.error, t.errorOpenMaps);
    }
  }

  async function toggleFavorite() {
    if (!user) return;

    try {
      // Llamamos a la RPC que hace todo el trabajo en el servidor
      const result = await favoritesService.toggleFavorite(id as string);

      // Actualizamos el estado visual basado en lo que devuelva la base de datos
      setIsFavorite(result === "added");
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      Alert.alert(t.error, error?.message || t.errorLoadingFavorites);
    }
  }

  if (loading) {
    return <LoadingSpinner message={t.loadingSpot} />;
  }

  if (error || !spot) {
    return <ErrorMessage message={error || t.notFound} onRetry={loadSpot} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SpotDetailHeader
        imageUrl={spot.image_url}
        spotName={spot.name}
        spotId={spot.id}
        description={spot.description}
        latitude={spot.latitude}
        longitude={spot.longitude}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        showFavorite={!!user}
      />

      <SpotInfo
        name={spot.name}
        description={spot.description}
        website={spot.website}
      />

      {spot.tags && spot.tags.length > 0 && (
        <View style={styles.userTagsContainer}>
          {spot.tags.map((tag) => (
            <View key={tag} style={styles.userTagWrapper}>
              <TagButton tag={tag} />
            </View>
          ))}
        </View>
      )}

      <View style={styles.tagsContainer}>
        <View style={styles.tagWrapper}>
          <CategoryTag category={spot.category} />
        </View>
        <View style={styles.tagWrapper}>
          <DistrictButton district={spot.district} />
        </View>
      </View>

      {spot.address && (
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>{spot.address}</Text>
        </View>
      )}

      <View style={styles.directionsContainer}>
        <AnimatedButton style={styles.directionsButton} onPress={openDirections}>
          <Ionicons name="navigate-outline" size={18} color={Colors.onPrimary} />
          <Text style={styles.directionsText}>{t.howToGetThere}</Text>
        </AnimatedButton>
      </View>

      <MapViewWrapper
        latitude={spot.latitude}
        longitude={spot.longitude}
        name={spot.name}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  userTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.horizontalPadding,
    marginTop: 12,
    gap: 8,
  },
  userTagWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.horizontalPadding,
    marginTop: 12,
    gap: 12,
  },
  tagWrapper: {
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  addressContainer: {
    paddingHorizontal: Spacing.horizontalPadding,
    marginTop: 12,
  },
  addressText: {
    ...Typography.industrialLabel,
    color: Colors.textSecondary,
  },
  directionsContainer: {
    paddingHorizontal: Spacing.horizontalPadding,
    marginTop: 12,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.button,
  },
  directionsText: {
    ...Typography.industrialLabel,
    fontSize: 14,
    color: Colors.onPrimary,
  },
});
