import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { BorderRadius, Spacing } from '../constants/Theme';

type MapViewWrapperProps = {
  latitude: number;
  longitude: number;
  name?: string;
};

export default function MapViewWrapper({ latitude, longitude, name }: MapViewWrapperProps) {
  const region = {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={name}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginHorizontal: Spacing.horizontalPadding,
    marginVertical: 16,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});
