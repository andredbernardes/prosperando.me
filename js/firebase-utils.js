// Utilitários para Firebase
import { auth, db, checkFirestoreConnection, reconnectFirestore } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, doc } from 'firebase/firestore';

// Monitor de conectividade
export class FirebaseMonitor {
  constructor() {
    this.connectionStatus = 'unknown';
    this.authStatus = 'unknown';
    this.listeners = [];
  }

  // Inicia o monitoramento
  start() {
    this.monitorAuth();
    this.monitorConnection();
    console.log('Firebase Monitor iniciado');
  }

  // Monitora o estado da autenticação
  monitorAuth() {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      this.authStatus = user ? 'authenticated' : 'unauthenticated';
      console.log('Status de autenticação:', this.authStatus, user ? user.email : 'Nenhum usuário');
      
      // Dispara evento customizado
      window.dispatchEvent(new CustomEvent('firebase-auth-changed', {
        detail: { user, status: this.authStatus }
      }));
    });

    this.listeners.push(unsubscribe);
  }

  // Monitora a conectividade
  async monitorConnection() {
    setInterval(async () => {
      try {
        const isConnected = await checkFirestoreConnection();
        const newStatus = isConnected ? 'connected' : 'disconnected';
        
        if (this.connectionStatus !== newStatus) {
          this.connectionStatus = newStatus;
          console.log('Status de conexão Firestore:', this.connectionStatus);
          
          // Dispara evento customizado
          window.dispatchEvent(new CustomEvent('firebase-connection-changed', {
            detail: { status: this.connectionStatus }
          }));

          // Se desconectado, tenta reconectar
          if (newStatus === 'disconnected') {
            console.log('Tentando reconectar...');
            await this.reconnect();
          }
        }
      } catch (error) {
        console.error('Erro ao verificar conectividade:', error);
      }
    }, 5000); // Verifica a cada 5 segundos
  }

  // Reconecta manualmente
  async reconnect() {
    try {
      await reconnectFirestore();
      this.connectionStatus = 'connected';
      console.log('Reconexão bem-sucedida');
    } catch (error) {
      console.error('Falha na reconexão:', error);
    }
  }

  // Para o monitoramento
  stop() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
    console.log('Firebase Monitor parado');
  }

  // Retorna o status atual
  getStatus() {
    return {
      auth: this.authStatus,
      connection: this.connectionStatus
    };
  }
}

// Função para testar a conectividade
export async function testFirebaseConnection() {
  try {
    console.log('Testando conectividade Firebase...');
    
    // Testa autenticação
    const authTest = auth.currentUser ? 'OK' : 'No user';
    console.log('Auth test:', authTest);
    
    // Testa Firestore
    const firestoreTest = await checkFirestoreConnection();
    console.log('Firestore test:', firestoreTest ? 'OK' : 'Failed');
    
    return {
      auth: authTest,
      firestore: firestoreTest
    };
  } catch (error) {
    console.error('Erro no teste de conectividade:', error);
    return {
      auth: 'Error',
      firestore: false,
      error: error.message
    };
  }
}

// Função para mostrar status na UI
export function showFirebaseStatus() {
  const monitor = new FirebaseMonitor();
  monitor.start();
  
  // Cria elemento de status na página
  const statusElement = document.createElement('div');
  statusElement.id = 'firebase-status';

  
  document.body.appendChild(statusElement);
  
  // Atualiza status
  function updateStatus() {
    const status = monitor.getStatus();
    const authIcon = status.auth === 'authenticated' ? '🟢' : '🔴';
    const connIcon = status.connection === 'connected' ? '🟢' : '🔴';
    
    statusElement.innerHTML = `
      Auth: ${authIcon} | Firestore: ${connIcon}
    `;
  }
  
  // Escuta mudanças
  window.addEventListener('firebase-auth-changed', updateStatus);
  window.addEventListener('firebase-connection-changed', updateStatus);
  
  // Atualiza inicial
  updateStatus();
  
  return monitor;
}

// Exporta o monitor global
export const firebaseMonitor = new FirebaseMonitor(); 