import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Share, Alert, Modal, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/Theme';
import { t } from '../constants/Translations';

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
  const [modalVisible, setModalVisible] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${t.shareSpot}: ${spotName}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFavorite = () => {
    if (!showFavorite) {
      Alert.alert(t.login, t.loginToSave);
      return;
    }
    onToggleFavorite();
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
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

            <Text style={styles.title}>{t.spotDetail}</Text>

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
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
});
