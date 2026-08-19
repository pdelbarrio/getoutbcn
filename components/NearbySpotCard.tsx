import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { Spot } from "../services/supabase/types";
import { Colors, Typography, BorderRadius, Spacing } from "../constants/Theme";
import { t } from "../constants/Translations";
import AnimatedButton from "./AnimatedButton";

interface NearbySpotCardProps {
  spot: Spot;
  distance?: number; // Distance in kilometers
}

export default function NearbySpotCard({ spot, distance }: NearbySpotCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/spot/${spot.id}`);
  };

  const formatDistance = (dist?: number) => {
    if (!dist) return t.locationNotAvailable;
    if (dist < 1) return `${(dist * 1000).toFixed(0)}m`;
    return `${dist.toFixed(1)}km`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t.nearbySpot}</Text>
      <AnimatedButton style={styles.card} onPress={handlePress}>
        <Image
          source={{ uri: spot.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {spot.name}
            </Text>
            {distance !== undefined && (
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
              </View>
            )}
          </View>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{spot.category}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{spot.district}</Text>
            </View>
          </View>
        </View>
      </AnimatedButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  label: {
    ...Typography.industrialLabel,
    color: Colors.primary,
    marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: BorderRadius.card,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 160,
  },
  content: {
    padding: Spacing.cardPadding,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    ...Typography.bodyHighlight,
    color: Colors.textPrimary,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  distanceBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.tag,
  },
  distanceText: {
    ...Typography.industrialLabel,
    fontSize: 10,
    color: Colors.onPrimary,
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.surfaceHigh,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.tag,
  },
  tagText: {
    ...Typography.industrialLabel,
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
