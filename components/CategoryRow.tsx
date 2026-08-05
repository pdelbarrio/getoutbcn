import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Colors, Typography, BorderRadius } from "../constants/theme";
import { CATEGORIES } from "../constants/Categories";

interface CategoryRowProps {
  selectedCategory: string | null;
  onSelect: (category: string) => void;
}

export default function CategoryRow({
  selectedCategory,
  onSelect,
}: CategoryRowProps) {
  const scrollX = useSharedValue(0);

  useEffect(() => {
    // Auto-scroll to the left continuously
    scrollX.value = withRepeat(
      withTiming(1000, {
        duration: 20000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryItem,
                isSelected && styles.categoryItemSelected,
              ]}
              onPress={() => onSelect(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextSelected,
                ]}
              >
                {category.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    alignItems: "center",
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.tag,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 48,
  },
  categoryItemSelected: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    ...Typography.industrialLabel,
    color: Colors.textPrimary,
  },
  categoryTextSelected: {
    color: Colors.onPrimary,
  },
});
