import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Aquí van las credenciales de Firebase para la aplicación
const firebaseConfig = {
  apiKey: "AIzaSyDZZf-G8bC9wWT53wIQsL9-I0Vg6XZOesU",
  authDomain: "prototipognc.firebaseapp.com",
  projectId: "prototipognc",
  storageBucket: "prototipognc.firebasestorage.app",
  messagingSenderId: "1073745870226",
  appId: "1:1073745870226:web:b6ff7ab128a12a0b48954b",
  measurementId: "G-81PMSQ0LDV",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
// Inicializar la Autenticación y exportarla
export const auth = getAuth(app);
