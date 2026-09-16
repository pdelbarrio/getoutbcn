import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Modal,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { spotsService } from "../services/supabase/spots";
import { storageService } from "../services/supabase/storage";
import LoadingSpinner from "../components/LoadingSpinner";
import BackButton from "../components/BackButton";
import { Colors, Typography, BorderRadius, Spacing } from "../constants/Theme";
import { CATEGORIES, CATEGORY_LABELS } from "../constants/Categories";
import { DISTRICTS } from "../constants/Districts";
import { t } from "../constants/Translations";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddSpotScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [latitudeText, setLatitudeText] = useState("");
  const [longitudeText, setLongitudeText] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 41.3874,
    longitude: 2.1686,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading]);

  async function handlePickImage() {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(t.permissionDenied, t.galleryPermissionDenied);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert(t.error, t.errorSelectImage);
    }
  }

  async function handleGetLocation() {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(t.permissionDenied, t.locationPermissionDenied);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLatitudeText(location.coords.latitude.toFixed(6));
      setLongitudeText(location.coords.longitude.toFixed(6));
      Alert.alert(t.locationObtained, t.locationSaved);
    } catch (error: any) {
      Alert.alert(t.error, t.errorGetLocation);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenMapPicker() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setSelectedLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } else {
        // Si no hay permisos, centramos en Barcelona
        setMapRegion({
          latitude: 41.3874,
          longitude: 2.1686,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setSelectedLocation({
          latitude: 41.3874,
          longitude: 2.1686,
        });
      }

      setShowMapModal(true);
    } catch (error) {
      // Si falla, centramos en Barcelona
      setMapRegion({
        latitude: 41.3874,
        longitude: 2.1686,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setSelectedLocation({
        latitude: 41.3874,
        longitude: 2.1686,
      });
      setShowMapModal(true);
    }
  }

  function handleMapPress(event: any) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  }

  function handleConfirmLocation() {
    if (selectedLocation) {
      setLatitudeText(selectedLocation.latitude.toFixed(6));
      setLongitudeText(selectedLocation.longitude.toFixed(6));
      setShowMapModal(false);
      Alert.alert(t.locationSelected, t.locationCoordinatesSaved);
    }
  }

  function handleCancelMapSelection() {
    setShowMapModal(false);
  }

  function handleAddTag() {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;

    if (tags.length >= 3) {
      Alert.alert(t.maxTagsReached, t.maxTagsMessage);
      return;
    }

    if (tags.includes(trimmedTag)) {
      Alert.alert(t.duplicateTag, t.duplicateTagMessage);
      return;
    }

    setTags([...tags, trimmedTag]);
    setTagInput("");
  }

  function handleRemoveTag(index: number) {
    setTags(tags.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    // Validacions obligatòries
    if (!name.trim()) {
      Alert.alert(t.error, t.nameRequiredError);
      return;
    }
    if (!category) {
      Alert.alert(t.error, t.categoryRequiredError);
      return;
    }
    if (!district) {
      Alert.alert(t.error, t.districtRequiredError);
      return;
    }
    if (!imageUri) {
      Alert.alert(t.error, t.imageRequiredError);
      return;
    }

    // Parsear latitud y longitud si se proporcionaron
    let latitude: number | null = null;
    let longitude: number | null = null;

    if (latitudeText.trim() && longitudeText.trim()) {
      const lat = parseFloat(latitudeText);
      const lng = parseFloat(longitudeText);

      if (isNaN(lat) || isNaN(lng)) {
        Alert.alert(t.error, t.errorInvalidCoordinates);
        return;
      }

      latitude = lat;
      longitude = lng;
    }

    setLoading(true);
    setUploading(true);

    try {
      // Upload image to Supabase Storage
      const imageUrl = await storageService.uploadSpotImage(imageUri, user!.id);

      // Create spot with uploaded image URL
      const newSpot = await spotsService.create({
        name: name.trim() || "Sin nombre",
        description: description.trim() || "Sin descripción",
        website: website.trim() || undefined,
        category,
        district,
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
        image_url: imageUrl,
        tags: tags.length > 0 ? tags : undefined,
        address: address.trim() || undefined,
      });

      Alert.alert("Èxit", "Lloc creat correctament", [
        {
          text: "Veure lloc",
          onPress: () => router.replace(`/spot/${newSpot.id}`),
        },
      ]);
    } catch (error: any) {
      Alert.alert(t.error, error.message || t.errorCreatingSpot);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  if (authLoading) {
    return <LoadingSpinner message={t.verifyingAuth} />;
  }

  if (!user) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <View style={styles.navRow}>
          <BackButton />
        </View>
        <Text style={styles.headerTitle}>{t.addSpotTitle}</Text>
      </View>

      <View style={styles.content}>

        <Text style={styles.label}>{t.nameRequired}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.nameRequiredPlaceholder}
          placeholderTextColor={Colors.textMuted}
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        <Text style={styles.label}>{t.descriptionOptional}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t.spotDescription}
          placeholderTextColor={Colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <Text style={styles.label}>{t.website}</Text>
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

        <Text style={styles.label}>{t.categoryRequired}</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text
            style={
              category
                ? styles.pickerButtonTextSelected
                : styles.pickerButtonTextPlaceholder
            }
          >
            {category
              ? CATEGORY_LABELS[category] || category
              : t.selectCategory}
          </Text>
        </TouchableOpacity>

        {showCategoryPicker && (
          <View style={styles.pickerContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pickerScroll}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.pickerItem,
                    category === cat && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      category === cat && styles.pickerItemTextSelected,
                    ]}
                  >
                    {CATEGORY_LABELS[cat] || cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.label}>{t.districtRequired}</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowDistrictPicker(!showDistrictPicker)}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text
            style={
              district
                ? styles.pickerButtonTextSelected
                : styles.pickerButtonTextPlaceholder
            }
          >
            {district || t.selectDistrict}
          </Text>
        </TouchableOpacity>

        {showDistrictPicker && (
          <View style={styles.pickerContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pickerScroll}
            >
              {DISTRICTS.map((dist) => (
                <TouchableOpacity
                  key={dist}
                  style={[
                    styles.pickerItem,
                    district === dist && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setDistrict(dist);
                    setShowDistrictPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      district === dist && styles.pickerItemTextSelected,
                    ]}
                  >
                    {dist}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.label}>{t.imageRequired}</Text>
        <TouchableOpacity
          style={styles.imageButton}
          onPress={handlePickImage}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.imageButtonText}>
            {imageUri ? t.imageSelected : t.selectImage}
          </Text>
        </TouchableOpacity>

        {imageUri && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.imageRemoveButton}
              onPress={() => setImageUri("")}
              activeOpacity={0.7}
            >
              <Text style={styles.imageRemoveText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>{t.locationOptional}</Text>

        <View style={styles.locationButtonsContainer}>
          <TouchableOpacity
            style={[styles.locationButton, styles.locationButtonHalf]}
            onPress={handleGetLocation}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.locationButtonText}>{t.currentLocation}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.locationButton, styles.locationButtonHalf]}
            onPress={handleOpenMapPicker}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.locationButtonText}>{t.selectOnMap}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>{t.latitudeOptional}</Text>
        <TextInput
          style={styles.input}
          placeholder="41.3874"
          placeholderTextColor={Colors.textMuted}
          value={latitudeText}
          onChangeText={setLatitudeText}
          keyboardType="decimal-pad"
          editable={!loading}
        />

        <Text style={styles.label}>{t.longitudeOptional}</Text>
        <TextInput
          style={styles.input}
          placeholder="2.1686"
          placeholderTextColor={Colors.textMuted}
          value={longitudeText}
          onChangeText={setLongitudeText}
          keyboardType="decimal-pad"
          editable={!loading}
        />

        <Text style={styles.label}>{t.addressOptional}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.streetAndNumber}
          placeholderTextColor={Colors.textMuted}
          value={address}
          onChangeText={setAddress}
          editable={!loading}
        />

        <Text style={styles.label}>{t.tagsOptional}</Text>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={styles.tagInput}
            placeholder={t.addTag}
            placeholderTextColor={Colors.textMuted}
            value={tagInput}
            onChangeText={setTagInput}
            editable={!loading && tags.length < 3}
            onSubmitEditing={handleAddTag}
          />
          <TouchableOpacity
            style={[
              styles.tagAddButton,
              (loading || tags.length >= 3) && styles.tagAddButtonDisabled,
            ]}
            onPress={handleAddTag}
            disabled={loading || tags.length >= 3}
            activeOpacity={0.7}
          >
            <Text style={styles.tagAddButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveTag(index)}
                  activeOpacity={0.7}
                  style={styles.tagRemove}
                >
                  <Text style={styles.tagRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {uploading ? t.uploadingImage : loading ? t.publishing : t.publish}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showMapModal}
        animationType="slide"
        onRequestClose={handleCancelMapSelection}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.selectLocationOnMap}</Text>
            <Text style={styles.modalSubtitle}>{t.tapMapToSelect}</Text>
          </View>

          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title={t.selectedLocation}
              />
            )}
          </MapView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={handleCancelMapSelection}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonTextCancel}>{t.cancel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButtonConfirm}
              onPress={handleConfirmLocation}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonTextConfirm}>{t.confirm}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    padding: 16,
    paddingTop: 40,
  },
  navRow: {
    marginBottom: 12,
  },
  headerTitle: {
    ...Typography.titleLGMobile,
    color: Colors.primary,
    textTransform: "uppercase",
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
    textAlignVertical: "top",
  },
  pickerButton: {
    height: 48,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.button,
    paddingHorizontal: 16,
    justifyContent: "center",
    marginBottom: 8,
  },
  pickerButtonTextPlaceholder: {
    color: Colors.textMuted,
    fontSize: 16,
  },
  pickerButtonTextSelected: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  pickerContainer: {
    backgroundColor: Colors.surfaceHighest,
    borderRadius: BorderRadius.button,
    padding: 8,
    marginBottom: 16,
    maxHeight: 300,
  },
  pickerScroll: {
    flexGrow: 0,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: BorderRadius.tag,
    backgroundColor: Colors.surfaceHigh,
  },
  pickerItemSelected: {
    backgroundColor: Colors.primary,
  },
  pickerItemText: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  pickerItemTextSelected: {
    color: Colors.onPrimary,
    fontWeight: "700",
  },
  imageButton: {
    height: 48,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.button,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  imageButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 16,
    borderRadius: BorderRadius.card,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.card,
  },
  imageRemoveButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: Colors.error,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  imageRemoveText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  locationButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  locationButton: {
    height: 48,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.button,
    justifyContent: "center",
    alignItems: "center",
  },
  locationButtonHalf: {
    flex: 1,
  },
  locationButtonText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.surface,
  },
  modalTitle: {
    ...Typography.titleLGMobile,
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    ...Typography.bodyMain,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  map: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: Colors.surface,
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.button,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonTextCancel: {
    ...Typography.bodyHighlight,
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  modalButtonConfirm: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonTextConfirm: {
    ...Typography.bodyHighlight,
    color: Colors.onPrimary,
    fontWeight: "700",
  },
  tagInputContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: BorderRadius.button,
    paddingHorizontal: 16,
    marginRight: 8,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  tagAddButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    justifyContent: "center",
    alignItems: "center",
  },
  tagAddButtonDisabled: {
    opacity: 0.3,
  },
  tagAddButtonText: {
    color: Colors.onPrimary,
    fontSize: 24,
    fontWeight: "700",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceHighest,
    borderRadius: BorderRadius.tag,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: Colors.textPrimary,
    fontSize: 14,
    marginRight: 4,
  },
  tagRemove: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tagRemoveText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  button: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...Typography.bodyHighlight,
    color: Colors.onPrimary,
    fontWeight: "700",
  },
});
