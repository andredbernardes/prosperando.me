import { auth, db, checkFirestoreConnection, reconnectFirestore } from './firebase.js';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, enableNetwork } from 'firebase/firestore';

// Função para cadastrar usuário
async function cadastrarUsuario(nome, email, senha, cidade = '', estado = '') {
  if (!nome) throw new Error('Informe seu nome completo.');
  if (!email) throw new Error('Informe um e-mail válido.');
  if (!senha || senha.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');
  
  try {
    // Verifica conectividade com Firestore
    const isConnected = await checkFirestoreConnection();
    if (!isConnected) {
      console.log('Tentando reconectar com Firestore...');
      await reconnectFirestore();
    }

    // Cria o usuário no Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;
    
    // Atualiza o perfil do usuário
    await updateProfile(user, { displayName: nome });

    // Salva dados adicionais no Firestore
    try {
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome,
        email,
        cidade,
        estado,
        criadoEm: new Date().toISOString(),
        ultimaAtualizacao: new Date().toISOString()
      });
    } catch (firestoreError) {
      console.error('Erro ao salvar no Firestore:', firestoreError);
      if (firestoreError.code === 'permission-denied') {
        console.warn('Permissão negada no Firestore. Verifique as regras de segurança.');
      }
    }
    
    return user;
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      throw new Error('Este e-mail já está cadastrado.');
    } else if (err.code === 'auth/invalid-email') {
      throw new Error('E-mail inválido.');
    } else if (err.code === 'auth/weak-password') {
      throw new Error('A senha é muito fraca.');
    } else if (err.code === 'auth/network-request-failed') {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    } else if (err.code === 'auth/too-many-requests') {
      throw new Error('Muitas tentativas. Aguarde um momento e tente novamente.');
    } else {
      console.error('Erro detalhado:', err);
      throw new Error('Erro ao cadastrar: ' + (err.message || err));
    }
  }
}

const form = document.getElementById('form-cadastro');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('cadastro-nome').value.trim();
    const email = document.getElementById('cadastro-email').value.trim().toLowerCase();
    const senha = document.getElementById('cadastro-senha').value;
    const cidade = document.getElementById('cadastro-cidade').value.trim();
    const estado = document.getElementById('cadastro-estado').value.trim();
    const btn = form.querySelector('button[type="submit"]');
    const msg = form.querySelector('.form-msg') || (() => {
      const m = document.createElement('div');
      m.className = 'form-msg';
      m.style.color = 'red';
      m.style.margin = '1rem 0';
      form.insertBefore(m, btn);
      return m;
    })();
    
    btn.disabled = true;
    btn.textContent = 'Cadastrando...';
    msg.textContent = '';
    
    try {
      await cadastrarUsuario(nome, email, senha, cidade, estado);
      msg.style.color = 'green';
      msg.textContent = 'Cadastro realizado com sucesso! Redirecionando...';
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1200);
    } catch (err) {
      msg.style.color = 'red';
      msg.textContent = err.message;
      console.error('Erro no cadastro:', err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Cadastrar';
    }
  });
} 