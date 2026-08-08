require('dotenv/config');
console.log('API Key:', process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY);

const config = require('./app.config.js');
console.log('Config loaded:', config);