import { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
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
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { Colors, Typography, Spacing } from "../../constants/Theme";
import { t } from "../../constants/Translations";

export default function SpotDetailScreen() {
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
    }
  }

  async function toggleFavorite() {
    if (!user) return;

    try {
      if (isFavorite) {
        await favoritesService.remove(user.id, id as string);
      } else {
        await favoritesService.add(user.id, id as string);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  }

  if (loading) {
    return <LoadingSpinner message={t.loadingSpot} />;
  }

  if (error || !spot) {
    return (
      <ErrorMessage message={error || t.notFound} onRetry={loadSpot} />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SpotDetailHeader
        imageUrl={spot.image_url}
        spotName={spot.name}
        spotId={spot.id}
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
});
