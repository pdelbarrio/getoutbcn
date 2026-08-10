import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { spotsService } from "../../services/supabase/spots";
import { favoritesService } from "../../services/supabase/favorites";
import { useAuth } from "../../contexts/AuthContext";
import { Spot } from "../../services/supabase/types";
import SpotDetailHeader from "../../components/SpotDetailHeader";
import SpotInfo from "../../components/SpotInfo";
import CategoryTag from "../../components/CategoryTag";
import DistrictButton from "../../components/DistrictButton";
import MapViewWrapper from "../../components/MapViewWrapper";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { Colors, Spacing } from "../../constants/Theme";

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
      setError(error.message || 'No s\'ha pogut carregar el lloc');
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
    return <LoadingSpinner message="Carregant lloc..." />;
  }

  if (error || !spot) {
    return <ErrorMessage message={error || "Lloc no trobat"} onRetry={loadSpot} />;
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

      <View style={styles.tagsContainer}>
        <CategoryTag category={spot.category} />
        <DistrictButton district={spot.district} />
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
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.horizontalPadding,
    marginTop: 12,
    gap: 12,
  },
});
