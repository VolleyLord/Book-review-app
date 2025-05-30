import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {

  apiKey: "AIzaSyD6raBq287L9xf4hqEr7PtI6iBG9mqeKU0",

  authDomain: "bookreviews-a5402.firebaseapp.com",

  projectId: "bookreviews-a5402",

  storageBucket: "bookreviews-a5402.firebasestorage.app",

  messagingSenderId: "286243196511",

  appId: "1:286243196511:web:cc4141357728a8a41a55ea"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app);

// Test function to verify Firestore connection
export const testFirestoreConnection = async () => {
  try {
    const testDoc = await db.collection('test').doc('connection-test').set({
      timestamp: new Date(),
      status: 'connected'
    });
    console.log('Firestore connection successful');
    return true;
  } catch (error) {
    console.error('Firestore connection error:', error);
    return false;
  }
};


export { app, auth, db, storage };