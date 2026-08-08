require('dotenv/config');

module.exports = ({ config }) => ({
    ...config,
    name: "getoutbcn",
    slug: "getoutbcn",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "getoutbcn",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
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
        package: "com.getoutbcn.app"
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
                    googleMaps: {
                        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
                    }
                }
            }
        ]
    ],
    extra: {
        router: {},
        eas: {
            projectId: "bfdf96a2-6eed-4f5b-b9f8-8193a068e973"
        }
    }
});