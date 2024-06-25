import {
  DB_URI, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL, ORIGIN, PORT,
  PRIVATE_KEY,
  PUBLIC_KEY,
} from 'src/settings';

export default {
  server: {
    port: PORT,
  },
  db: {
    uri: DB_URI,
  },
  googleOAuth: {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUrl: GOOGLE_REDIRECT_URL,
  },
  saltWorkFactor: 10,
  accessTokenTtl: '15m',
  refreshTokenTtl: '1y',
  privateKey: PRIVATE_KEY,
  publicKey: PUBLIC_KEY,
  origin: ORIGIN,
};
