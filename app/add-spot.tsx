import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { spotsService } from '../services/supabase/spots';
import { Colors, Typography, BorderRadius, Spacing } from '../constants/Theme';

export default function AddSpotScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading]);

  async function handleSubmit() {
    // Validations
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Debes seleccionar una categoría');
      return;
    }
    if (!district) {
      Alert.alert('Error', 'Debes seleccionar un distrito');
      return;
    }
    if (!imageUrl.trim()) {
      Alert.alert('Error', 'Debes añadir una imagen');
      return;
    }
    if (!latitude || !longitude) {
      Alert.alert('Error', 'Debes obtener la ubicación');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Error', 'Las coordenadas no son válidas');
      return;
    }

    setLoading(true);

    try {
      const newSpot = await spotsService.create({
        name: name.trim(),
        description: description.trim(),
        website: website.trim() || undefined,
        category,
        district,
        latitude: lat,
        longitude: lng,
        image_url: imageUrl.trim(),
        created_by: user!.id,
      });

      Alert.alert('Éxito', 'Spot creado correctamente', [
        {
          text: 'Ver spot',
          onPress: () => router.replace(`/spot/${newSpot.id}`),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear el spot');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>AÑADIR SPOT</Text>

        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del spot"
          placeholderTextColor={Colors.textMuted}
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        <Text style={styles.label}>Descripción *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe el spot..."
          placeholderTextColor={Colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <Text style={styles.label}>Sitio web (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          placeholderTextColor={Colors.textMuted}
          value={website}
          onChangeText={setWebsite}
          autoCapitalize="none"
          keyboardType="url"
          editable={!loading}
        />

        <Text style={styles.label}>Categoría *</Text>
        <TextInput
          style={styles.input}
          placeholder="Live Music, Food, Shops, etc."
          placeholderTextColor={Colors.textMuted}
          value={category}
          onChangeText={setCategory}
          editable={!loading}
        />

        <Text style={styles.label}>Distrito *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ciutat Vella, Eixample, etc."
          placeholderTextColor={Colors.textMuted}
          value={district}
          onChangeText={setDistrict}
          editable={!loading}
        />

        <Text style={styles.label}>URL de imagen *</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          placeholderTextColor={Colors.textMuted}
          value={imageUrl}
          onChangeText={setImageUrl}
          autoCapitalize="none"
          keyboardType="url"
          editable={!loading}
        />

        <Text style={styles.label}>Latitud *</Text>
        <TextInput
          style={styles.input}
          placeholder="41.3874"
          placeholderTextColor={Colors.textMuted}
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="decimal-pad"
          editable={!loading}
        />

        <Text style={styles.label}>Longitud *</Text>
        <TextInput
          style={styles.input}
          placeholder="2.1686"
          placeholderTextColor={Colors.textMuted}
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="decimal-pad"
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {loading ? 'PUBLICANDO...' : 'PUBLICAR SPOT'}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.horizontalPadding * 2,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    ...Typography.titleLG,
    color: Colors.primary,
    marginBottom: 32,
    textAlign: 'center',
  },
  label: {
    ...Typography.industrialLabel,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    height: 48,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.button,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  button: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...Typography.bodyHighlight,
    color: Colors.onPrimary,
    fontWeight: '700',
  },
});
