import { auth, db } from './firebase.js';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import '../style.css';
import './menu-mobile.js';
import Chart from 'chart.js/auto';

const userInfoDiv = document.getElementById('user-info');
const btnSair = document.querySelector('.navbar-login');
const tabelaBody = document.querySelector('#tabela-tributos tbody');
const graficoCanvas = document.getElementById('grafico-tributos');

if (btnSair) {
  btnSair.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = '/login.html';
  });
}

function formatarMoeda(valor) {
  return valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';
}
function formatarData(timestamp) {
  if (!timestamp) return '-';
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return data.toLocaleDateString('pt-BR');
}

function preencherTotaisDashboard(totais) {
  const totaisDiv = document.getElementById('dashboard-totais');
  if (!totaisDiv) return;
  totaisDiv.innerHTML = `
    <div class="dashboard-totais-item"><span class="dashboard-totais-label">Dízimo</span><span class="dashboard-totais-value">${formatarMoeda(totais.dizimo)}</span></div>
    <div class="dashboard-totais-item"><span class="dashboard-totais-label">Oferta</span><span class="dashboard-totais-value">${formatarMoeda(totais.oferta)}</span></div>
    <div class="dashboard-totais-item"><span class="dashboard-totais-label">Primícias</span><span class="dashboard-totais-value">${formatarMoeda(totais.primicias)}</span></div>
    <div class="dashboard-totais-item"><span class="dashboard-totais-label">Semeadura</span><span class="dashboard-totais-value">${formatarMoeda(totais.semeadura)}</span></div>
  `;
}

let graficoTributos = null;
function gerarGraficoTributos(totais) {
  if (!graficoCanvas) return;
  const data = {
    labels: ['Dízimo', 'Oferta', 'Primícias', 'Semeadura'],
    datasets: [{
      data: [totais.dizimo, totais.oferta, totais.primicias, totais.semeadura],
      backgroundColor: [
        'rgba(34,197,94,0.85)',
        'rgba(16,185,129,0.80)',
        'rgba(132,204,22,0.80)',
        'rgba(22,163,74,0.75)'
      ],
      borderRadius: 12,
      borderSkipped: false
    }]
  };
  if (graficoTributos) {
    graficoTributos.data = data;
    graficoTributos.update();
  } else {
    graficoTributos = new Chart(graficoCanvas, {
      type: 'pie',
      data,
      options: {
        plugins: {
          legend: { display: true, position: 'bottom' }
        }
      }
    });
  }
}

async function carregarTributos(uid) {
  const tributosRef = collection(db, 'tributos');
  const q = query(tributosRef, where('uid', '==', uid));
  const querySnapshot = await getDocs(q);
  let totais = { dizimo: 0, oferta: 0, primicias: 0, semeadura: 0 };
  tabelaBody.innerHTML = '';
  const linhas = [];
  querySnapshot.forEach((doc) => {
    const t = doc.data();
    totais.dizimo += t.dizimo || 0;
    totais.oferta += t.oferta || 0;
    totais.primicias += t.primicias || 0;
    totais.semeadura += t.semeadura || 0;
    linhas.push(`
      <tr>
        <td>${formatarData(t.criadoEm)}</td>
        <td>${formatarMoeda(t.dizimo)}</td>
        <td>${formatarMoeda(t.oferta)}</td>
        <td>${formatarMoeda(t.primicias)}</td>
        <td>${formatarMoeda(t.semeadura)}</td>
        <td>${formatarMoeda(t.totalContribuicoes)}</td>
      </tr>
    `);
  });
  tabelaBody.innerHTML = linhas.join('');
  gerarGraficoTributos(totais);
  preencherTotaisDashboard(totais);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (userInfoDiv) userInfoDiv.innerHTML = '<p>Você não está logado. <a href="/login.html">Entrar</a></p>';
    return;
  }
  // Busca dados do Firestore
  const docRef = doc(db, 'usuarios', user.uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const dados = docSnap.data();
    if (userInfoDiv) {
      userInfoDiv.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
          <div>
            <strong>Nome:</strong> ${dados.nome}<br>
            <strong>E-mail:</strong> ${dados.email}
          </div>
        </div>
      `;
    }
  } else {
    if (userInfoDiv) userInfoDiv.innerHTML = '<p>Dados do usuário não encontrados.</p>';
  }
  // Carregar tributos do usuário
  await carregarTributos(user.uid);
}); 