import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC2eidbroZENs2OlQR_PwFR0ZaUdVNPOFw",
  authDomain: "smarthousingp.firebaseapp.com",
  projectId: "smarthousingp",
  storageBucket: "smarthousingp.firebasestorage.app",
  messagingSenderId: "896353650328",
  appId: "1:896353650328:web:f336d842ab9fb0c584f2ed",
  measurementId: "G-SVDD24LGR3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Firebase Analytics no está disponible:', error);
  }
}

export { analytics };
export default app;

