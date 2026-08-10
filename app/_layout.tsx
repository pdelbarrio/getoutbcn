import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { Colors } from "../constants/Theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: '700',
            color: Colors.textPrimary,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      />
    </AuthProvider>
  );
}
