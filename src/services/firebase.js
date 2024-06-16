import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
    apiKey: "AIzaSyDWS71OXXqin-luLPI-kxy3hknOAA0LpjI",
    authDomain: "gr-distribuidora-2835e.firebaseapp.com",
    projectId: "gr-distribuidora-2835e",
    storageBucket: "gr-distribuidora-2835e.appspot.com",
    messagingSenderId: "42171087830",
    appId: "1:42171087830:web:2a36702d3cf7af2794c277"
}

// const firebaseConfig = {
//     apiKey: process.env.APIKEY,
//     authDomain: process.env.AUTHDOMAIN,
//     projectId: process.env.PROJECTID,
//     storageBucket: process.env.STORAGEBUCKET,
//     messagingSenderId: process.env.MESSAGINGSENDERID,
//     appId: process.env.APPID
// }

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db }