import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { spotsService } from "../../services/supabase/spots";
import { Spot } from "../../services/supabase/types";
import SpotCard from "../../components/SpotCard";
import { Colors, Typography } from "../../constants/theme";

export default function DistrictListScreen() {
  const { district } = useLocalSearchParams();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpots();
  }, [district]);

  async function loadSpots() {
    try {
      setLoading(true);
      const data = await spotsService.getByDistrict(district as string);
      setSpots(data);
    } catch (error) {
      console.error("Error loading spots:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{district}</Text>
        <Text style={styles.subtitle}>{spots.length} spots</Text>
      </View>
      <FlatList
        data={spots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SpotCard spot={item} />}
        contentContainerStyle={styles.listContent}
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
    paddingTop: 60,
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
});
