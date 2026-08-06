import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/Theme';

type SpotInfoProps = {
  name: string;
  description: string;
  website?: string;
};

export default function SpotInfo({ name, description, website }: SpotInfoProps) {
  const handleWebsitePress = () => {
    if (website) {
      Linking.openURL(website);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
      {website && (
        <TouchableOpacity onPress={handleWebsitePress}>
          <Text style={styles.website}>{website}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.horizontalPadding,
    backgroundColor: Colors.background,
  },
  name: {
    ...Typography.titleLGMobile,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    ...Typography.bodyMain,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 24,
  },
  website: {
    ...Typography.bodyHighlight,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
