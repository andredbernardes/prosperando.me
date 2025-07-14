import { auth, db } from './firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const form = document.getElementById('perfil-form');
const msgDiv = document.getElementById('perfil-msg');
const nomeInput = document.getElementById('perfil-nome');
const telefoneInput = document.getElementById('perfil-telefone');
const emailInput = document.getElementById('perfil-email');
const igrejaInput = document.getElementById('perfil-igreja');
const celulaInput = document.getElementById('perfil-celula');
const cidadeInput = document.getElementById('perfil-cidade');
const estadoInput = document.getElementById('perfil-estado');
const pastorInput = document.getElementById('perfil-pastor');
const entradaInput = document.getElementById('perfil-entrada');
const batismoInput = document.getElementById('perfil-batismo');

function mostrarToast(mensagem, tipo = 'info') {
  const notificacao = document.createElement('div');
  notificacao.className = `notificacao notificacao-${tipo}`;
  notificacao.textContent = mensagem;
  Object.assign(notificacao.style, {
    position: 'fixed',
    top: '80px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '500',
    zIndex: '1000',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease',
    maxWidth: '300px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  });
  const cores = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  notificacao.style.backgroundColor = cores[tipo] || cores.info;
  document.body.appendChild(notificacao);
  setTimeout(() => {
    notificacao.style.transform = 'translateX(0)';
  }, 100);
  setTimeout(() => {
    notificacao.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notificacao);
    }, 300);
  }, 3000);
}

function setRadioValue(name, value) {
  const radios = document.querySelectorAll(`input[name='${name}']`);
  radios.forEach(r => { r.checked = (r.value === value); });
}
function getRadioValue(name) {
  const checked = document.querySelector(`input[name='${name}']:checked`);
  return checked ? checked.value : '';
}
function setCheckboxValues(name, values) {
  const checkboxes = document.querySelectorAll(`input[name='${name}']`);
  checkboxes.forEach(cb => { cb.checked = values && values.includes(cb.value); });
}
function getCheckboxValues(name) {
  return Array.from(document.querySelectorAll(`input[name='${name}']:checked`)).map(cb => cb.value);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    msgDiv.textContent = 'Você precisa estar logado para acessar o perfil.';
    msgDiv.style.color = '#ef4444';
    form.style.display = 'none';
    return;
  }
  try {
    const docRef = doc(db, 'usuarios', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const dados = docSnap.data();
      nomeInput.value = dados.nome || '';
      telefoneInput.value = dados.telefone || '';
      emailInput.value = user.email || '';
      igrejaInput.value = dados.igreja || '';
      celulaInput.value = dados.celula || '';
      cidadeInput.value = dados.cidade || '';
      estadoInput.value = dados.estado || '';
      pastorInput.value = dados.pastor || '';
      entradaInput.value = dados.entrada || '';
      batismoInput.value = dados.batismo || '';
      setRadioValue('lembretes', dados.lembretes || 'sim');
      setCheckboxValues('canal', dados.canal || []);
    } else {
      msgDiv.textContent = 'Dados do usuário não encontrados.';
      msgDiv.style.color = '#ef4444';
      form.style.display = 'none';
    }
  } catch (e) {
    msgDiv.textContent = 'Erro ao carregar dados do perfil.';
    msgDiv.style.color = '#ef4444';
    form.style.display = 'none';
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mostrarToast('Salvando...', 'info');
  const user = auth.currentUser;
  if (!user) {
    mostrarToast('Você precisa estar logado.', 'error');
    return;
  }
  try {
    const docRef = doc(db, 'usuarios', user.uid);
    await updateDoc(docRef, {
      nome: nomeInput.value.trim(),
      telefone: telefoneInput.value.trim(),
      igreja: igrejaInput.value.trim(),
      celula: celulaInput.value.trim(),
      cidade: cidadeInput.value.trim(),
      estado: estadoInput.value.trim().toUpperCase(),
      pastor: pastorInput.value.trim(),
      entrada: entradaInput.value,
      batismo: batismoInput.value,
      lembretes: getRadioValue('lembretes'),
      canal: getCheckboxValues('canal')
    });
    mostrarToast('Dados atualizados com sucesso!', 'success');
  } catch (e) {
    mostrarToast('Erro ao salvar alterações.', 'error');
  }
}); 