// lib/session.js
// iron-session konfiguration

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'opstillingsblade-super-secret-key-min-32-chars!!',
  cookieName: 'opstilling_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 dage
  },
};
