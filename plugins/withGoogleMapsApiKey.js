const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withGoogleMapsApiKey(config, apiKey) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Buscar la sección <application>
    const application = androidManifest.manifest.application[0];
    if (!application) {
      throw new Error('No se encontró la sección <application> en AndroidManifest.xml');
    }

    // Asegurar que existe la sección <meta-data>
    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    // Añadir el meta-data con la API key
    application['meta-data'].push({
      $: {
        'android:name': 'com.google.android.geo.API_KEY',
        'android:value': apiKey,
      },
    });

    return config;
  });
};