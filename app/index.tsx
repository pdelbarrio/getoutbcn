import { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { spotsService } from "../services/supabase/spots";
import { Spot } from "../services/supabase/types";
import CategoryRow from "../components/CategoryRow";
import DistrictRow from "../components/DistrictRow";
import SearchButton from "../components/SearchButton";
import RandomSpotCard from "../components/RandomSpotCard";
import { Colors } from "../constants/Theme";

export default function HomeScreen() {
  const router = useRouter();
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
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.primary,
    textTransform: "uppercase",
  },
});
