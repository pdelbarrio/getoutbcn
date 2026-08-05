import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { Spot } from "../services/supabase/types";
import { Colors, Typography, BorderRadius, Spacing } from "../constants/theme";

interface RandomSpotCardProps {
  spot: Spot;
}

export default function RandomSpotCard({ spot }: RandomSpotCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/spot/${spot.id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>RANDOM SPOT</Text>
      <TouchableOpacity style={styles.card} onPress={handlePress}>
        <Image
          source={{ uri: spot.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <Text style={styles.title}>{spot.name}</Text>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{spot.category}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{spot.district}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
    height: 200,
    borderRadius: BorderRadius.card,
    overflow: "hidden",
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
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: Spacing.cardPadding,
  },
  title: {
    ...Typography.bodyHighlight,
    color: Colors.textPrimary,
    fontWeight: "700",
    marginBottom: 8,
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
