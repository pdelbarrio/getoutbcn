import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Colors, Typography, BorderRadius } from "../constants/theme";
import { DISTRICTS } from "../constants/Districts";

interface DistrictRowProps {
  selectedDistrict: string | null;
  onSelect: (district: string) => void;
}

export default function DistrictRow({
  selectedDistrict,
  onSelect,
}: DistrictRowProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DISTRICTS.map((district) => {
          const isSelected = selectedDistrict === district;
          return (
            <TouchableOpacity
              key={district}
              style={[
                styles.districtItem,
                isSelected && styles.districtItemSelected,
              ]}
              onPress={() => onSelect(district)}
            >
              <Text
                style={[
                  styles.districtText,
                  isSelected && styles.districtTextSelected,
                ]}
              >
                {district.toUpperCase()}
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
  districtItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.tag,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 48,
  },
  districtItemSelected: {
    backgroundColor: Colors.primary,
  },
  districtText: {
    ...Typography.industrialLabel,
    color: Colors.textPrimary,
  },
  districtTextSelected: {
    color: Colors.onPrimary,
  },
});
