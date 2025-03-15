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

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  return signInWithPopup(auth, googleProvider);
};

// Sign in with Facebook
export const signInWithFacebook = async (): Promise<UserCredential> => {
  return signInWithPopup(auth, facebookProvider);
};

// Sign out
export const signOutFirebase = async (): Promise<void> => {
  return signOut(auth);
};

// Listen for auth state changes
export const onAuthStateChange = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentFirebaseUser = (): User | null => {
  return auth.currentUser;
};

// Get ID token
export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

export { auth, analytics };
