import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSXNOxxyQpGLtePiClwVPnJRrE3H4Jxx4",
  authDomain: "pinnacle-84da2.firebaseapp.com",
  projectId: "pinnacle-84da2",
  storageBucket: "pinnacle-84da2.firebasestorage.app",
  messagingSenderId: "11506799489",
  appId: "1:11506799489:web:ad3ce1caf164fadda7ce80",
  measurementId: "G-PTYWDBX528"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Safely initialize analytics (checking environment support to prevent SSR/local node issues)
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported: boolean) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn('Analytics not supported or disabled in this environment:', e);
      }
    }
  }).catch(() => {});
}
