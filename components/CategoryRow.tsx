import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  AppState,
} from "react-native";
import Animated, {
  scrollTo,
  useAnimatedRef,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import { Colors, Typography, BorderRadius } from "../constants/Theme";
import { CATEGORIES, CATEGORY_LABELS } from "../constants/Categories";

// Cuántas veces se repite la lista para crear el bucle infinito sin saltos
const REPEAT = 12;
// Velocidad del auto-scroll en píxeles por segundo (hacia la izquierda)
const SPEED = 36;
// Tiempo de pausa tras una interacción antes de reanudar el scroll
const RESUME_DELAY_MS = 1800;

// Props no cubiertas por el tipado de AnimatedScrollViewProps (mejoran los taps):
// no retardar/cancelar el toque aunque la lista se esté moviendo.
const SCROLL_TOUCH_PROPS = {
  delaysContentTouches: false,
  canCancelContentTouches: false,
  keyboardShouldPersistTaps: "always",
} as const;

interface CategoryRowProps {
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryRow({
  selectedCategory,
  onSelect,
}: CategoryRowProps) {
  const listRef = useAnimatedRef<Animated.ScrollView>();
  const progress = useSharedValue(0);
  const paused = useSharedValue(true);
  const loopWidth = useSharedValue(0);
  const startOffset = useSharedValue(0);

  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);
  const [contentWidth, setContentWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  const items = useMemo(
    () => Array.from({ length: REPEAT }, () => CATEGORIES).flat(),
    [],
  );

  // Una vez medidas las dimensiones, configurar el bucle y arrancar el scroll
  useEffect(() => {
    if (contentWidth > 0 && viewportWidth > 0 && contentWidth > viewportWidth) {
      const seq = contentWidth / REPEAT;
      const maxStart = contentWidth - viewportWidth - seq;
      const start = Math.min(seq * 2, maxStart);
      loopWidth.value = seq;
      startOffset.value = start;
      progress.value = 0;
      paused.value = false;
    }
  }, [contentWidth, viewportWidth, loopWidth, startOffset, progress, paused]);

  // Limpiar el temporizador al desmontar o al volver al primer plano
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        clearResumeTimer();
        paused.value = false;
      }
    });
    return () => {
      sub.remove();
      clearResumeTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearResumeTimer = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  // Cualquier pausa SIEMPRE va emparejada con una reanudación programada,
  // así la fila nunca puede quedarse colgada en pausa.
  const pauseAndScheduleResume = () => {
    paused.value = true;
    clearResumeTimer();
    resumeTimeoutRef.current = setTimeout(() => {
      paused.value = false;
    }, RESUME_DELAY_MS);
  };

  // Auto-scroll fluido en el UI thread (una vez por frame)
  useFrameCallback((info) => {
    if (paused.value || loopWidth.value <= 0) return;
    const dtSec = Math.min((info.timeSincePreviousFrame ?? 16) / 1000, 0.05);
    progress.value += SPEED * dtSec;
    const local = progress.value % loopWidth.value;
    scrollTo(listRef, startOffset.value + local, 0, false);
  });

  // Tras un scroll manual, re-sincronizar el progreso con el offset real.
  // Solo durante arrastro del dedo; el scroll programático no debe re-sincronizar.
  const syncProgressFromOffset = (offsetX: number) => {
    if (loopWidth.value > 0) {
      const local = (offsetX - startOffset.value) % loopWidth.value;
      progress.value = local < 0 ? local + loopWidth.value : local;
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (draggingRef.current) {
      syncProgressFromOffset(event.nativeEvent.contentOffset.x);
    }
  };

  const handleSelect = (category: string) => {
    if (selectedCategory === category) {
      onSelect(null);
    } else {
      onSelect(category);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={listRef}
        horizontal
        {...SCROLL_TOUCH_PROPS}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onContentSizeChange={setContentWidth}
        onLayout={(e) => setViewportWidth(e.nativeEvent.layout.width)}
        onScroll={handleScroll}
        onTouchStart={() => {
          paused.value = true;
        }}
        onTouchEnd={pauseAndScheduleResume}
        onTouchCancel={pauseAndScheduleResume}
        onScrollBeginDrag={() => {
          draggingRef.current = true;
          paused.value = true;
        }}
        onScrollEndDrag={(e) => {
          draggingRef.current = false;
          syncProgressFromOffset(e.nativeEvent.contentOffset.x);
          pauseAndScheduleResume();
        }}
        onMomentumScrollEnd={(e) => {
          syncProgressFromOffset(e.nativeEvent.contentOffset.x);
          pauseAndScheduleResume();
        }}
      >
        {items.map((item, index) => {
          const isSelected = selectedCategory === item;
          return (
            <Pressable
              key={`${item}-${index}`}
              style={[
                styles.categoryItem,
                isSelected && styles.categoryItemSelected,
              ]}
              onPressIn={() => {
                paused.value = true;
              }}
              onPressOut={pauseAndScheduleResume}
              onPress={() => handleSelect(item)}
              hitSlop={6}
              android_ripple={undefined}
            >
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextSelected,
                ]}
              >
                {CATEGORY_LABELS[item]?.toUpperCase() || item.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </Animated.ScrollView>
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
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.tag,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 48,
    marginRight: 12,
  },
  categoryItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    ...Typography.industrialLabel,
    color: Colors.textPrimary,
  },
  categoryTextSelected: {
    color: Colors.onPrimary,
  },
});