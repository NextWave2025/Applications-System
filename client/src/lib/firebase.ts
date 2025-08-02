// Firebase configuration for NextWave application
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT || ""}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT || "",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT || ""}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Log Firebase configuration status (without exposing sensitive data)
console.log('Firebase configuration loaded:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasProjectId: !!firebaseConfig.projectId,
  hasAppId: !!firebaseConfig.appId,
  projectId: firebaseConfig.projectId
}); 