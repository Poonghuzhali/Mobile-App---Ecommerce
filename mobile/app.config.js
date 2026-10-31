/** @type {import('expo/config').ExpoConfig} */
const appJson = require('./app.json');

const productionApi =
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  'https://vexo-cart-api.onrender.com/api';

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      /** Baked into release APK when EXPO_PUBLIC_API_URL is not set at build time. */
      apiUrl: productionApi.replace(/\/$/, ''),
    },
  },
};
