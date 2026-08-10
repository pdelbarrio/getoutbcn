import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/Theme';

type SpotDetailHeaderProps = {
  imageUrl: string;
  spotName: string;
  spotId: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  showFavorite: boolean;
};

export default function SpotDetailHeader({
  imageUrl,
  spotName,
  spotId,
  isFavorite,
  onToggleFavorite,
  showFavorite,
}: SpotDetailHeaderProps) {
  const router = useRouter();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mira aquest lloc a GetOutBCN: ${spotName}`,
        // URL would be here if we had deep linking
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFavorite = () => {
    if (!showFavorite) {
      Alert.alert('Inicia sessió', 'Has d\'iniciar sessió per guardar llocs');
      return;
    }
    onToggleFavorite();
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.title}>Detall del lloc</Text>

          <View style={styles.rightButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>

            {showFavorite && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleFavorite}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isFavorite ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={isFavorite ? Colors.primary : Colors.textPrimary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.surfaceHigh,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography.bodyHighlight,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 8,
  },
});
