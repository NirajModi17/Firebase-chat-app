import { initializeApp } from "firebase/app";
import {getReactNativePersistence,initializeAuth} from "firebase/auth"
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
// import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {getFirestore,collection} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBkt3IW-J0bMoDjT6Ask7ktUWeyfsT09-0",
  authDomain: "fir-chat-d1bf6.firebaseapp.com",
  projectId: "fir-chat-d1bf6",
  storageBucket: "fir-chat-d1bf6.appspot.com",
  messagingSenderId: "573515603133",
  appId: "1:573515603133:web:9251443ae908aa7b0a2bd4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app,{
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export const userRef = collection(db, 'user');
export const roomRef = collection(db, 'rooms');