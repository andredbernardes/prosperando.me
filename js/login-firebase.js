import { auth } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

const form = document.getElementById('form-login');
const msg = document.getElementById('login-msg');

// Se já estiver logado, redireciona para dashboard
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = '/dashboard.html';
  }
});

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const senha = document.getElementById('login-senha').value;
    if (!email || !senha) {
      msg.textContent = 'Preencha todos os campos.';
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      window.location.href = '/dashboard.html';
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg.textContent = 'E-mail ou senha incorretos.';
      } else if (err.code === 'auth/invalid-email') {
        msg.textContent = 'E-mail inválido.';
      } else if (err.code === 'auth/too-many-requests') {
        msg.textContent = 'Muitas tentativas. Aguarde um momento e tente novamente.';
      } else if (err.code === 'auth/user-disabled') {
        msg.textContent = 'Esta conta foi desabilitada.';
      } else {
        msg.textContent = 'Erro ao fazer login. Tente novamente.';
      }
    }
  });
} 