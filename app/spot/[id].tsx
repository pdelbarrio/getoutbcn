import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { spotsService } from "../../services/supabase/spots";
import { favoritesService } from "../../services/supabase/favorites";
import { useAuth } from "../../contexts/AuthContext";
import { Spot } from "../../services/supabase/types";
import ImageHeader from "../../components/ImageHeader";
import SpotInfo from "../../components/SpotInfo";
import CategoryTag from "../../components/CategoryTag";
import DistrictButton from "../../components/DistrictButton";
import MapViewWrapper from "../../components/MapViewWrapper";
import FavoriteButton from "../../components/FavoriteButton";
import { Colors, Spacing } from "../../constants/Theme";

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpot();
    if (user) checkFavorite();
  }, [id, user]);

  async function loadSpot() {
    try {
      const data = await spotsService.getById(id as string);
      setSpot(data);
    } catch (error) {
      console.error("Error loading spot:", error);
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!spot) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Spot no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ImageHeader imageUrl={spot.image_url} />

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

      {user && (
        <View style={styles.favoriteContainer}>
          <FavoriteButton isFavorite={isFavorite} onToggle={toggleFavorite} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.horizontalPadding,
    marginTop: 12,
    gap: 12,
  },
  favoriteContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
});
