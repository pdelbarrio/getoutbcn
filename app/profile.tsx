import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/supabase/auth';
import { Colors, Typography, BorderRadius, Spacing } from '../constants/Theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  async function handleLogout() {
    try {
      await authService.signOut();
      router.replace('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PERFIL</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>EMAIL</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>ID DE USUARIO</Text>
          <Text style={[styles.value, styles.idText]} numberOfLines={1}>
            {user.id}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.horizontalPadding * 2,
    paddingTop: 40,
  },
  title: {
    ...Typography.titleLG,
    color: Colors.primary,
    marginBottom: 32,
    textAlign: 'center',
  },
  loadingText: {
    ...Typography.bodyMain,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  infoCard: {
    backgroundColor: Colors.surfaceLow,
    padding: 20,
    borderRadius: BorderRadius.card,
    marginBottom: 16,
  },
  label: {
    ...Typography.industrialLabel,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  value: {
    ...Typography.bodyHighlight,
    color: Colors.textPrimary,
  },
  idText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  logoutButton: {
    height: 52,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutButtonText: {
    ...Typography.bodyHighlight,
    color: Colors.error,
    fontWeight: '700',
  },
});
