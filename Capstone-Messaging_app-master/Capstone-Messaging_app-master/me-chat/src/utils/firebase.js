// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider, getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
     apiKey: "AIzaSyBlqMNghe8VNLfZsHDr8jvz7vddkwtMngA",
     authDomain: "mechat-a6a22.firebaseapp.com",
     projectId: "mechat-a6a22",
     storageBucket: "mechat-a6a22.appspot.com",
     messagingSenderId: "417646874006",
     appId: "1:417646874006:web:da8c80b8e94037272221b7",
     measurementId: "G-38VPBCTYQK"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const providerGoogle = new GoogleAuthProvider()
const providerFacebook = new FacebookAuthProvider();
const providerGithub = new GithubAuthProvider();

export { db, auth, storage, providerGoogle, providerFacebook, providerGithub }