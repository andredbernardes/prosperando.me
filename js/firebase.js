// Configuração do Firebase
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBlzFowpGSpZSH22Jp_cD514qiPaDIBy8c",
  authDomain: "prosperando-me.firebaseapp.com",
  projectId: "prosperando-me",
  storageBucket: "prosperando-me.firebasestorage.app",
  messagingSenderId: "144968054411",
  appId: "1:144968054411:web:4bc39f7c038517d6b2068e",
  measurementId: "G-612QDW2C7S"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

// Configurações adicionais para melhorar a estabilidade da conexão
const firestoreSettings = {
  cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
  experimentalForceLongPolling: true, // Força polling longo para melhor compatibilidade
  useFetchStreams: false // Desabilita streams para evitar problemas de conexão
};

// Aplica configurações ao Firestore
import { enableNetwork, disableNetwork } from "firebase/firestore";

// Função para verificar conectividade
export async function checkFirestoreConnection() {
  try {
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.error('Erro ao conectar com Firestore:', error);
    return false;
  }
}

// Função para reconectar
export async function reconnectFirestore() {
  try {
    await disableNetwork(db);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.error('Erro ao reconectar com Firestore:', error);
    return false;
  }
}

export { app, auth, db, firestoreSettings, messaging, getToken, onMessage }; 