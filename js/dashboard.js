import { auth, db } from './firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import '../style.css';
import './menu-mobile.js';

const userInfoDiv = document.getElementById('user-info');
const btnCalculadora = document.getElementById('btn-ir-calculadora');
const btnSair = document.querySelector('.navbar-login');

btnCalculadora.addEventListener('click', () => {
  window.location.href = '/';
});

if (btnSair) {
  btnSair.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = '/login.html';
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    userInfoDiv.innerHTML = '<p>Você não está logado. <a href="/login.html">Entrar</a></p>';
    return;
  }
  // Busca dados do Firestore
  const docRef = doc(db, 'usuarios', user.uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const dados = docSnap.data();
    userInfoDiv.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
        <div>
          <strong>Nome:</strong> ${dados.nome}<br>
          <strong>E-mail:</strong> ${dados.email}
        </div>
      </div>
    `;
  } else {
    userInfoDiv.innerHTML = '<p>Dados do usuário não encontrados.</p>';
  }
}); 