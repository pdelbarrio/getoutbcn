import { View, Image, StyleSheet } from 'react-native';

type ImageHeaderProps = {
  imageUrl: string;
};

export default function ImageHeader({ imageUrl }: ImageHeaderProps) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: '#2A2A2A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
