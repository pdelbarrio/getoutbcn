import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, BorderRadius, Spacing } from '../constants/Theme';

type DistrictButtonProps = {
  district: string;
};

export default function DistrictButton({ district }: DistrictButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/district/${encodeURIComponent(district)}`);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.7}>
      <Text style={styles.text}>{district}</Text>
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
    marginHorizontal: Spacing.horizontalPadding,
    marginVertical: 8,
  },
  text: {
    ...Typography.bodyHighlight,
    color: Colors.textSecondary,
  },
});
