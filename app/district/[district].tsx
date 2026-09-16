import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { spotsService } from "../../services/supabase/spots";
import { Spot } from "../../services/supabase/types";
import SpotCard from "../../components/SpotCard";
import BackButton from "../../components/BackButton";
import { Colors, Typography } from "../../constants/Theme";
import { t } from "../../constants/Translations";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DistrictListScreen() {
  const insets = useSafeAreaInsets();
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
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <View style={styles.navRow}>
          <BackButton />
        </View>
        <Text style={styles.title}>{district}</Text>
        <Text style={styles.subtitle}>
          {spots.length} {t.spots}
        </Text>
      </View>
      <FlatList
        data={spots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SpotCard spot={item} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
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
});
