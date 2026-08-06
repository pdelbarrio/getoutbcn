import { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { favoritesService } from '../services/supabase/favorites';
import { spotsService } from '../services/supabase/spots';
import { Spot } from '../services/supabase/types';
import SpotCard from '../components/SpotCard';
import { Colors, Typography, Spacing } from '../constants/Theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [favoriteSpots, setFavoriteSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    if (user) {
      loadFavorites();
    }
  }, [user, authLoading]);

  async function loadFavorites() {
    try {
      setLoading(true);
      const favorites = await favoritesService.getByUserId(user!.id);
      const spotIds = favorites.map(f => f.spot_id);

      // Fetch all spots
      const spots = await Promise.all(
        spotIds.map(id => spotsService.getById(id))
      );

      setFavoriteSpots(spots.filter(Boolean) as Spot[]);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  if (favoriteSpots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tienes favoritos aún</Text>
        <Text style={styles.emptySubtext}>
          Explora spots y añádelos a favoritos desde el detalle
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteSpots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SpotCard spot={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.horizontalPadding * 2,
  },
  emptyText: {
    ...Typography.titleLGMobile,
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    ...Typography.bodyMain,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  list: {
    paddingVertical: 16,
  },
});
