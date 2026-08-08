import { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { spotsService } from "../services/supabase/spots";
import { Spot } from "../services/supabase/types";
import { useAuth } from "../contexts/AuthContext";
import CategoryRow from "../components/CategoryRow";
import DistrictRow from "../components/DistrictRow";
import SearchButton from "../components/SearchButton";
import RandomSpotCard from "../components/RandomSpotCard";
import { Colors, Typography, BorderRadius } from "../constants/Theme";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [randomSpot, setRandomSpot] = useState<Spot | null>(null);

  useEffect(() => {
    loadRandomSpot();
  }, []);

  async function loadRandomSpot() {
    try {
      const spot = await spotsService.getRandom();
      setRandomSpot(spot);
    } catch (error) {
      console.error("Error loading random spot:", error);
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>GetOutBCN</Text>
          
          <View style={styles.authButtons}>
            {!user ? (
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.userButtons}>
                <TouchableOpacity
                  style={styles.addSpotButton}
                  onPress={() => router.push("/add-spot")}
                >
                  <Text style={styles.addSpotButtonText}>Añadir spot</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={() => router.push("/profile")}
                >
                  <Text style={styles.profileButtonText}>Perfil</Text>
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
  profileButton: {
    backgroundColor: Colors.surfaceHigh,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  profileButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
});
