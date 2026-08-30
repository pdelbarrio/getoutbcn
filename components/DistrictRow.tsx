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
import { DISTRICTS } from "../constants/Districts";

// Cuántas veces se repite la lista para crear el bucle infinito sin saltos
const REPEAT = 12;
// Velocidad del auto-scroll en píxeles por segundo (hacia la derecha)
const SPEED = 32;
// Tiempo de pausa tras una interacción antes de reanudar el scroll
const RESUME_DELAY_MS = 1800;

interface DistrictRowProps {
  selectedDistrict: string | null;
  onSelect: (district: string | null) => void;
}

export default function DistrictRow({
  selectedDistrict,
  onSelect,
}: DistrictRowProps) {
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
    () => Array.from({ length: REPEAT }, () => DISTRICTS).flat(),
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

  // Auto-scroll fluido en el UI thread (una vez por frame), en sentido contrario
  useFrameCallback((info) => {
    if (paused.value || loopWidth.value <= 0) return;
    const dtSec = Math.min((info.timeSincePreviousFrame ?? 16) / 1000, 0.05);
    progress.value += SPEED * dtSec;
    const t = progress.value % loopWidth.value;
    const local = (loopWidth.value - t) % loopWidth.value;
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

  const handleSelect = (district: string) => {
    if (selectedDistrict === district) {
      onSelect(null);
    } else {
      onSelect(district);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={listRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        canCancelContentTouches={false}
        keyboardShouldPersistTaps="always"
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
          const isSelected = selectedDistrict === item;
          return (
            <Pressable
              key={`${item}-${index}`}
              style={[
                styles.districtItem,
                isSelected && styles.districtItemSelected,
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
                  styles.districtText,
                  isSelected && styles.districtTextSelected,
                ]}
              >
                {item.toUpperCase()}
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
  districtItem: {
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