// GetOutBCN Theme - Dark Mode Industrial

export const Colors = {
  // Backgrounds
  background: "#131313",
  surface: "#101508",
  surfaceLow: "#1C1B1B",
  surfaceHigh: "#2A2A2A",
  surfaceHighest: "#353534",

  // Accent (Verde Tóxico)
  primary: "#A9F900",
  primaryDim: "#94DB00",
  onPrimary: "#121F00",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#C1CAAD",
  textMuted: "#8B947A",

  // Status
  error: "#FF4D4D",
  warning: "#FFCC00",
};

export const Typography = {
  titleXL: { fontSize: 48, fontWeight: "900" as const },
  titleLG: { fontSize: 32, fontWeight: "800" as const },
  titleLGMobile: { fontSize: 24, fontWeight: "800" as const },
  bodyMain: { fontSize: 16, fontWeight: "400" as const },
  bodyHighlight: { fontSize: 18, fontWeight: "500" as const },
  industrialLabel: {
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 0.1,
    textTransform: "uppercase" as const,
  },
};

export const Spacing = {
  horizontalPadding: 16,
  verticalPadding: 12,
  cardPadding: 12,
  fieldSpacing: 16,
};

export const BorderRadius = {
  card: 12,
  button: 12,
  tag: 20,
};
