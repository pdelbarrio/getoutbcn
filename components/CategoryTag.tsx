import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, BorderRadius, Spacing } from '../constants/Theme';

type CategoryTagProps = {
  category: string;
};

export default function CategoryTag({ category }: CategoryTagProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/category/${category}`);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.7}>
      <Text style={styles.text}>{category}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.surfaceHigh,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BorderRadius.button,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.bodyHighlight,
    color: Colors.textSecondary,
  },
});
