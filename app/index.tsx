import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { spotsService } from "../services/supabase/spots";
import { Spot } from "../services/supabase/types";
import { useAuth } from "../contexts/AuthContext";
import CategoryRow from "../components/CategoryRow";
import DistrictRow from "../components/DistrictRow";
import SearchButton from "../components/SearchButton";
import RandomSpotCard from "../components/RandomSpotCard";
import NearbySpotCard from "../components/NearbySpotCard";
import { Colors, Typography, BorderRadius } from "../constants/Theme";
import { t } from "../constants/Translations";
import * as Location from "expo-location";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [randomSpot, setRandomSpot] = useState<Spot | null>(null);
  const [nearbySpot, setNearbySpot] = useState<Spot | null>(null);
  const [nearbyDistance, setNearbyDistance] = useState<number | undefined>(
    undefined,
  );
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    loadRandomSpot();
    getUserLocation();
  }, []);

  async function loadRandomSpot() {
    try {
      const spot = await spotsService.getRandom();
      setRandomSpot(spot);
    } catch (error) {
      console.error("Error loading random spot:", error);
    }
  }

  async function getUserLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Location permission not granted");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Load nearby spot once we have location
      loadNearbySpot(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error("Error getting user location:", error);
    }
  }

  async function loadNearbySpot(userLat: number, userLon: number) {
    try {
      const nearest = await spotsService.getNearest(userLat, userLon);

      if (nearest) {
        setNearbySpot(nearest.spot);
        setNearbyDistance(nearest.distance);
      }
    } catch (error) {
      console.error("Error loading nearby spot:", error);
    }
  }

  function handleSearch() {
    if (selectedCategory && selectedDistrict) {
      router.push(`/search/${selectedCategory}/${selectedDistrict}`);
    } else if (selectedCategory) {
      router.push(`/category/${selectedCategory}`);
    } else if (selectedDistrict) {
      router.push(`/district/${selectedDistrict}`);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo2.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.authButtons}>
            {!user ? (
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.loginButtonText}>{t.login}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.userButtons}>
                <TouchableOpacity
                  style={styles.addSpotButton}
                  onPress={() => router.push("/add-spot")}
                >
                  <Text style={styles.addSpotButtonText}>{t.addSpot}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => router.push("/favorites")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="bookmark-outline"
                    size={20}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => router.push("/profile")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={24}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <CategoryRow
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <DistrictRow
          selectedDistrict={selectedDistrict}
          onSelect={setSelectedDistrict}
        />

        <SearchButton
          onPress={handleSearch}
          disabled={!selectedCategory && !selectedDistrict}
        />

        {nearbySpot && (
          <View style={styles.nearbySection}>
            <NearbySpotCard spot={nearbySpot} distance={nearbyDistance} />
            <TouchableOpacity
              style={styles.seeAllNearbyButton}
              onPress={() => router.push("/nearby")}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllNearbyText}>{t.seeAllNearby}</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.onPrimary} />
            </TouchableOpacity>
          </View>
        )}

        {randomSpot && <RandomSpotCard spot={randomSpot} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.primary,
    textTransform: "uppercase",
  },
  authButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.button,
  },
  loginButtonText: {
    color: Colors.onPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  userButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addSpotButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.button,
  },
  addSpotButtonText: {
    color: Colors.onPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  iconButton: {
    width: 36,
    height: 36,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  nearbySection: {
    marginBottom: 16,
  },
  seeAllNearbyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: BorderRadius.button,
  },
  seeAllNearbyText: {
    ...Typography.industrialLabel,
    fontSize: 12,
    color: Colors.onPrimary,
  },
  logo: {
    width: 200,
    height: 70,
    resizeMode: "contain",
  },
});
