// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCGyOOdmn1R8sQKCPprDGGvTQM3kGrNVE",
  authDomain: "commonwealth-ai.firebaseapp.com",
  projectId: "commonwealth-ai",
  storageBucket: "commonwealth-ai.appspot.com",
  messagingSenderId: "787658635663",
  appId: "1:787658635663:web:12cb8654a5c7e204e1f3fa",
  measurementId: "G-BB7Y2K5CDD"
};

export { firebaseConfig };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);