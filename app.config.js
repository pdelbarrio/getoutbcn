const withGoogleMapsApiKey = require('./plugins/withGoogleMapsApiKey');

module.exports = ({ config }) => {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    return withGoogleMapsApiKey(
        {
            ...config,
            name: "getoutbcn",
            slug: "getoutbcn",
            version: "1.0.0",
            orientation: "portrait",
            scheme: "getoutbcn",
            icon: "./assets/icon.png",
            userInterfaceStyle: "light",
            splash: {
                image: "./assets/splash-icon.png",
                resizeMode: "contain",
                backgroundColor: "#ffffff"
            },
            ios: {
                supportsTablet: true
            },
            android: {
                adaptiveIcon: {
                    foregroundImage: "./assets/adaptive-icon.png",
                    backgroundColor: "#ffffff"
                },
                edgeToEdgeEnabled: true,
                predictiveBackGestureEnabled: false,
                package: "com.getoutbcn.app",
                permissions: [
                    "ACCESS_COARSE_LOCATION",
                    "ACCESS_FINE_LOCATION",
                    "INTERNET",
                    "READ_EXTERNAL_STORAGE",
                    "READ_MEDIA_IMAGES",
                    "READ_MEDIA_VIDEO",
                    "RECORD_AUDIO",
                    "SYSTEM_ALERT_WINDOW",
                    "VIBRATE",
                    "WRITE_EXTERNAL_STORAGE"
                ]
            },
            web: {
                favicon: "./assets/favicon.png"
            },
            plugins: [
                "expo-router",
                [
                    "expo-web-browser",
                    {
                        experimentalLauncherActivity: false
                    }
                ],
                [
                    "expo-build-properties",
                    {
                        android: {
                            newArchEnabled: true,
                        },
                        ios: {
                            newArchEnabled: true,
                        },
                    },
                ],
            ],
            extra: {
                supabaseUrl: supabaseUrl,
                supabaseAnonKey: supabaseAnonKey,
                googleMapsApiKey: apiKey,
                router: {},
                eas: {
                    projectId: "bfdf96a2-6eed-4f5b-b9f8-8193a068e973"
                }
            }
        },
        apiKey
    );
};