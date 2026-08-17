import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, BorderRadius } from '../constants/Theme';

type TagButtonProps = {
  tag: string;
};

export default function TagButton({ tag }: TagButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/tag/${encodeURIComponent(tag)}`);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.7}>
      <Text style={styles.text}>{tag}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.surfaceHigh,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.tag,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.industrialLabel,
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
