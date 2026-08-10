import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Colors, Typography, BorderRadius } from "../constants/Theme";
import { DISTRICTS } from "../constants/Districts";

interface DistrictRowProps {
  selectedDistrict: string | null;
  onSelect: (district: string) => void;
}

export default function DistrictRow({
  selectedDistrict,
  onSelect,
}: DistrictRowProps) {
  const flatListRef = useRef<FlatList>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollPositionRef = useRef(0);
  const isUserInteractingRef = useRef(false);
  
  // Create a very large array for infinite scrolling illusion
  const infiniteDistricts = Array(200).fill(DISTRICTS).flat();

  const stopAutoScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const startAutoScroll = () => {
    stopAutoScroll();
    scrollIntervalRef.current = setInterval(() => {
      if (!isUserInteractingRef.current) {
        scrollPositionRef.current -= 1; // Scroll right
        if (scrollPositionRef.current < 0) {
          scrollPositionRef.current = 5000;
        }
        flatListRef.current?.scrollToOffset({
          offset: scrollPositionRef.current,
          animated: true,
        });
      }
    }, 35); // Slightly slower than categories
  };

  const handleUserInteraction = () => {
    isUserInteractingRef.current = true;
    stopAutoScroll();
    
    // Clear any existing resume timeout
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    
    // Resume auto-scroll after 3 seconds of no interaction
    resumeTimeoutRef.current = setTimeout(() => {
      isUserInteractingRef.current = false;
      startAutoScroll();
    }, 3000);
  };

  useEffect(() => {
    // Start at end position for right scroll
    setTimeout(() => {
      const startOffset = 5000; // Start near end
      flatListRef.current?.scrollToOffset({
        offset: startOffset,
        animated: false,
      });
      scrollPositionRef.current = startOffset;
      
      // Start auto-scroll after initial delay
      startAutoScroll();
    }, 100);

    return () => {
      stopAutoScroll();
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.x;
    const contentWidth = event.nativeEvent.contentSize.width;
    
    scrollPositionRef.current = currentOffset;
    
    // Reset to middle when approaching edges
    if (currentOffset < 500) {
      flatListRef.current?.scrollToOffset({
        offset: contentWidth / 2,
        animated: false,
      });
      scrollPositionRef.current = contentWidth / 2;
    } else if (currentOffset > contentWidth - 1000) {
      flatListRef.current?.scrollToOffset({
        offset: contentWidth / 2,
        animated: false,
      });
      scrollPositionRef.current = contentWidth / 2;
    }
  };

  const handleSelect = (district: string) => {
    handleUserInteraction();
    
    // Toggle: if already selected, deselect it
    if (selectedDistrict === district) {
      onSelect(null as any);
    } else {
      onSelect(district);
    }
  };

  const renderItem = ({ item }: { item: string; index: number }) => {
    const isSelected = selectedDistrict === item;
    return (
      <TouchableOpacity
        style={[
          styles.districtItem,
          isSelected && styles.districtItemSelected
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.districtText,
            isSelected && styles.districtTextSelected,
          ]}
        >
          {item.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={infiniteDistricts}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleUserInteraction}
        onTouchStart={handleUserInteraction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    marginVertical: 8,
    overflow: "hidden",
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  districtItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.tag,
    borderWidth: 0.5,
    borderColor: Colors.surfaceHighest,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 48,
    marginRight: 12,
  },
  districtItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  districtText: {
    ...Typography.industrialLabel,
    color: Colors.textPrimary,
  },
  districtTextSelected: {
    color: Colors.onPrimary,
  },
});
