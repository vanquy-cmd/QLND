// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDFRPfUxNOAXQV2SeBXOaXfW8UhitTobo0',
  authDomain: 'fir-firestore-ce16f.firebaseapp.com',
  projectId: 'fir-firestore-ce16f',
  storageBucket: 'fir-firestore-ce16f.appspot.com',
  messagingSenderId: '841281962728',
  appId: '1:841281962728:web:f493b485489f1cd958ff5d'
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Firestore
const db = getFirestore(app);

export { db };