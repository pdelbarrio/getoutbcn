import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius } from '../constants/Theme';

type CategoryTagProps = {
  category: string;
};

export default function CategoryTag({ category }: CategoryTagProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{category.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceHigh,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.tag,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.industrialLabel,
    color: Colors.primary,
  },
});
