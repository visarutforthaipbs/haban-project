// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  UserCredential,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB49YgKuHGksNw4aI4JBQ0OnSWhbnNtLVA",
  authDomain: "haban-pics.firebaseapp.com",
  projectId: "haban-pics",
  storageBucket: "haban-pics.firebasestorage.app",
  messagingSenderId: "520020633738",
  appId: "1:520020633738:web:dad2ffc99784ccd198a573",
  measurementId: "G-9ZJZPWPNX6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Configure providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Add additional Facebook permissions/scopes
facebookProvider.addScope("email");
facebookProvider.addScope("public_profile");

// Set custom parameters for better UX
facebookProvider.setCustomParameters({
  display: "popup", // Display mode: popup, page, touch, or wap
  auth_type: "rerequest", // Force re-authentication
  locale: "th_TH", // Set locale to Thai
});

// Authentication functions
export const signInWithGoogle = (): Promise<UserCredential> => {
  return signInWithPopup(auth, googleProvider);
};

export const signInWithFacebook = (): Promise<UserCredential> => {
  return signInWithPopup(auth, facebookProvider);
};

export const logoutFromFirebase = (): Promise<void> => {
  return signOut(auth);
};

export const getCurrentFirebaseUser = (): User | null => {
  return auth.currentUser;
};

export const onFirebaseAuthStateChanged = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth, analytics };
