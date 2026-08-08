import 'dotenv/config';

export default ({ config }) => ({
    ...config,
    plugins: [
        ...config.plugins,
        [
            "expo-build-properties",
            {
                android: {
                    googleMaps: {
                        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                    },
                },
            },
        ],
    ],
});