import './style.css';
// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registrado: ', registration);
            })
            .catch(registrationError => {
                console.log('SW falhou: ', registrationError);
            });
    });
}

// === CONFIGURAÇÃO ===
// Sistema de autenticação removido - agora é uma aplicação simples

// Elementos DOM
const rendaInput = document.getElementById('renda');
const rendaExtraInput = document.getElementById('renda-extra');
const calcularBtn = document.getElementById('calcular');
const resultsSection = document.getElementById('results');

// Elementos de resultado
const dizimoValor = document.getElementById('dizimo-valor');
const ofertaValor = document.getElementById('oferta-valor');
const primiciasValor = document.getElementById('primicias-valor');
const semeaduraValor = document.getElementById('semeadura-valor');
const totalContribuicoes = document.getElementById('total-contribuicoes');
const rendaRestante = document.getElementById('renda-restante');
const percentualTotal = document.getElementById('percentual-total');
const totalSection = document.querySelector('.total-section');

// Configurações de cálculo
const CONFIG = {
    DIZIMO_PERCENTUAL: 0.10, // 10%
    OFERTA_PERCENTUAL: 0.05, // 5%
    PRIMICIAS_PERCENTUAL: 0.02, // 2% (primeiros frutos)
    SEMEADURA_PERCENTUAL: 0.03 // 3% (investimento espiritual)
};

// Formatação de moeda brasileira
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

// Formatação de percentual
function formatarPercentual(valor) {
    return `${(valor * 100).toFixed(1)}%`;
}

// Validação de entrada
function validarEntrada(valor) {
    const num = parseFloat(valor);
    return !isNaN(num) && num >= 0;
}

// NOVAS REGRAS DE CÁLCULO
function calcularContribuicoes(rendaMensal, rendaExtra = 0) {
    const rendaTotal = rendaMensal + rendaExtra;
    if (rendaTotal <= 0) {
        throw new Error('A renda deve ser maior que zero');
    }
    // 1. Primícias
    const primicias = rendaTotal / 30;
    // 2. Dízimo
    const dizimo = (rendaTotal - primicias) * 0.10;
    // 3. Oferta
    const oferta = rendaTotal * 0.01;
    // 4. Semeadura
    const semeadura = rendaTotal * 0.01;
    const totalContribuicoes = dizimo + oferta + primicias + semeadura;
    const rendaRestante = rendaTotal - totalContribuicoes;
    const percentualTotal = (totalContribuicoes / rendaTotal) * 100;
    return {
        dizimo,
        oferta,
        primicias,
        semeadura,
        totalContribuicoes,
        rendaRestante,
        percentualTotal,
        rendaTotal
    };
}

// Chart.js - Gráfico de Barras
import Chart from 'chart.js/auto';

let chartContribuicoes = null;

function atualizarGrafico(resultados) {
    const canvas = document.getElementById('chartContribuicoes');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = {
        labels: ['Dízimo', 'Oferta', 'Primícias', 'Semeadura'],
        datasets: [{
            label: 'Valor (R$)',
            data: [resultados.dizimo, resultados.oferta, resultados.primicias, resultados.semeadura],
            backgroundColor: [
                'rgba(34,197,94,0.85)',   // verde principal
                'rgba(16,185,129,0.80)',  // verde claro
                'rgba(132,204,22,0.80)',  // verde amarelado
                'rgba(22,163,74,0.75)'    // verde escuro
            ],
            borderRadius: 12,
            borderSkipped: false,
            maxBarThickness: 48
        }]
    };
    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return 'R$ ' + context.parsed.y.toLocaleString('pt-BR', {minimumFractionDigits: 2});
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { weight: 600 } }
            },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(100,116,139,0.08)' },
                ticks: {
                    color: '#64748b',
                    font: { weight: 600 },
                    callback: function(value) {
                        return 'R$ ' + value.toLocaleString('pt-BR', {maximumFractionDigits: 0});
                    }
                }
            }
        }
    };
    if (chartContribuicoes) {
        chartContribuicoes.data = data;
        chartContribuicoes.options = options;
        chartContribuicoes.update();
    } else {
        chartContribuicoes = new Chart(ctx, {
            type: 'bar',
            data,
            options
        });
    }
}

// Atualizar interface com resultados
function atualizarInterface(resultados) {
    // Atualizar valores individuais
    if (dizimoValor) dizimoValor.textContent = formatarMoeda(resultados.dizimo);
    if (ofertaValor) ofertaValor.textContent = formatarMoeda(resultados.oferta);
    if (primiciasValor) primiciasValor.textContent = formatarMoeda(resultados.primicias);
    if (semeaduraValor) semeaduraValor.textContent = formatarMoeda(resultados.semeadura);

    // Atualizar percentuais e descrições
    const dizimoPercent = document.querySelector('.dizimo .result-percent');
    const dizimoDesc = document.querySelector('.dizimo .result-description');
    const ofertaPercent = document.querySelector('.oferta .result-percent');
    const ofertaDesc = document.querySelector('.oferta .result-description');
    const primiciasPercent = document.querySelector('.primicias .result-percent');
    const primiciasDesc = document.querySelector('.primicias .result-description');
    const semeaduraPercent = document.querySelector('.semeadura .result-percent');
    const semeaduraDesc = document.querySelector('.semeadura .result-description');

    if (dizimoPercent) dizimoPercent.textContent = '10% da renda (após primícias)';
    if (dizimoDesc) dizimoDesc.textContent = 'Dízimo sobre a renda líquida das primícias';
    if (ofertaPercent) ofertaPercent.textContent = '1% da renda';
    if (ofertaDesc) ofertaDesc.textContent = 'Oferta voluntária (mínimo de 1%)';
    if (primiciasPercent) primiciasPercent.textContent = '1/30 da renda';
    if (primiciasDesc) primiciasDesc.textContent = 'Primícias: um dia de trabalho';
    if (semeaduraPercent) semeaduraPercent.textContent = '1% da renda';
    if (semeaduraDesc) semeaduraDesc.textContent = 'Semeadura (mínimo de 1%)';

    // Atualizar totais
    if (totalContribuicoes) totalContribuicoes.textContent = formatarMoeda(resultados.totalContribuicoes);
    if (rendaRestante) rendaRestante.textContent = formatarMoeda(resultados.rendaRestante);
    if (percentualTotal) percentualTotal.textContent = formatarPercentual(resultados.percentualTotal / 100);

    // Mostrar seção de resultados com animação
    if (resultsSection) resultsSection.style.display = 'block';

    // Adicionar animação aos cards
    const cards = document.querySelectorAll('.result-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'fadeInUp 0.6s ease-out';
        }, index * 100);
    });
    atualizarGrafico(resultados);

    // Mostrar gráfico
    const chartSection = document.getElementById('chart-section');
    if (chartSection) chartSection.style.display = 'block';
    if (totalSection) totalSection.style.display = 'block';
}

// Limpar interface
function limparInterface() {
    if (resultsSection) resultsSection.style.display = 'none';
    if (rendaInput) rendaInput.value = '';
    if (rendaExtraInput) rendaExtraInput.value = '';
    if (rendaInput) rendaInput.focus();
}

// Mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.textContent = mensagem;
    
    // Estilos da notificação
    Object.assign(notificacao.style, {
        position: 'fixed',
        top: '20px',
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
    
    // Cores baseadas no tipo
    const cores = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    notificacao.style.backgroundColor = cores[tipo] || cores.info;
    
    // Adicionar ao DOM
    document.body.appendChild(notificacao);
    
    // Animar entrada
    setTimeout(() => {
        notificacao.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notificacao);
        }, 300);
    }, 3000);
}

// Event listener para o botão calcular
if (calcularBtn) {
    calcularBtn.addEventListener('click', () => {
        try {
            const rendaMensal = parseFloat(rendaInput.value) || 0;
            const rendaExtra = parseFloat(rendaExtraInput.value) || 0;
            
            // Validação
            if (!validarEntrada(rendaMensal) && !validarEntrada(rendaExtra)) {
                mostrarNotificacao('Por favor, insira um valor válido para a renda.', 'error');
                return;
            }
            
            if (rendaMensal + rendaExtra <= 0) {
                mostrarNotificacao('A renda total deve ser maior que zero.', 'error');
                return;
            }
            
            // Calcular
            const resultados = calcularContribuicoes(rendaMensal, rendaExtra);
            
            // Atualizar interface
            atualizarInterface(resultados);
            
            // Notificação de sucesso
            mostrarNotificacao('Cálculos realizados com sucesso!', 'success');
            
            // Salvar no localStorage
            localStorage.setItem('ultimoCalculo', JSON.stringify({
                rendaMensal,
                rendaExtra,
                resultados,
                timestamp: Date.now()
            }));
            
        } catch (error) {
            console.error('Erro no cálculo:', error);
            mostrarNotificacao(error.message || 'Erro ao calcular as contribuições.', 'error');
        }
    });
}

// Event listeners para Enter nos inputs
if (rendaInput && rendaExtraInput && calcularBtn) {
    [rendaInput, rendaExtraInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                calcularBtn.click();
            }
        });
    });
}

// Carregar último cálculo salvo
function carregarUltimoCalculo() {
    const ultimoCalculo = localStorage.getItem('ultimoCalculo');
    if (ultimoCalculo) {
        try {
            const dados = JSON.parse(ultimoCalculo);
            const agora = Date.now();
            const umDia = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
            
            // Só carregar se foi calculado nas últimas 24 horas
            if (agora - dados.timestamp < umDia) {
                if (rendaInput) rendaInput.value = dados.rendaMensal;
                if (rendaExtraInput) rendaExtraInput.value = dados.rendaExtra;
                atualizarInterface(dados.resultados);
                mostrarNotificacao('Último cálculo carregado automaticamente.', 'info');
                const chartSection = document.getElementById('chart-section');
                if (chartSection) chartSection.style.display = 'block';
                if (totalSection) totalSection.style.display = 'block';
            } else {
                const chartSection = document.getElementById('chart-section');
                if (chartSection) chartSection.style.display = 'none';
                if (totalSection) totalSection.style.display = 'none';
            }
        } catch (error) {
            console.error('Erro ao carregar último cálculo:', error);
            const chartSection = document.getElementById('chart-section');
            if (chartSection) chartSection.style.display = 'none';
            if (totalSection) totalSection.style.display = 'none';
        }
    } else {
        const chartSection = document.getElementById('chart-section');
        if (chartSection) chartSection.style.display = 'none';
        if (totalSection) totalSection.style.display = 'none';
    }
}

// Função para compartilhar resultados
function compartilharResultados() {
    if (navigator.share) {
        const rendaMensal = parseFloat(rendaInput.value) || 0;
        const rendaExtra = parseFloat(rendaExtraInput.value) || 0;
        
        if (rendaMensal + rendaExtra > 0) {
            const resultados = calcularContribuicoes(rendaMensal, rendaExtra);
            
            navigator.share({
                title: 'Minhas Contribuições - Calculadora de Dízimos',
                text: `Renda: ${formatarMoeda(rendaMensal + rendaExtra)}\nDízimo: ${formatarMoeda(resultados.dizimo)}\nOferta: ${formatarMoeda(resultados.oferta)}\nTotal: ${formatarMoeda(resultados.totalContribuicoes)}`,
                url: window.location.href
            });
        }
    }
}

// Remover bloco que adiciona botão de compartilhamento dinamicamente
// if (navigator.share) {
//     const compartilharBtn = document.createElement('button');
//     compartilharBtn.className = 'btn btn-secondary';
//     compartilharBtn.innerHTML = '📤 Compartilhar';
//     compartilharBtn.style.cssText = `
//         background: linear-gradient(135deg, #10b981, #34d399);
//         margin-top: 1rem;
//     `;
//     compartilharBtn.addEventListener('click', compartilharResultados);
//     const inputCard = document.querySelector('.input-section .card');
//     inputCard.appendChild(compartilharBtn);
// }

// Função para limpar campos e esconder resultados/gráfico
function limparCampos() {
    if (rendaInput) rendaInput.value = '';
    if (rendaExtraInput) rendaExtraInput.value = '';
    localStorage.removeItem('inputsDizimo');
    localStorage.removeItem('ultimoCalculo');
    if (resultsSection) resultsSection.style.display = 'none';
    const chartSection = document.getElementById('chart-section');
    if (chartSection) chartSection.style.display = 'none';
    // Limpar valores das tags <span> do resumo
    if (totalContribuicoes) totalContribuicoes.textContent = 'R$ 0,00';
    if (rendaRestante) rendaRestante.textContent = 'R$ 0,00';
    if (percentualTotal) percentualTotal.textContent = '0%';
    if (rendaInput) rendaInput.focus();
    verificarInputsEVizualizacao();
}
// Evento para botão Limpar
const limparBtn = document.getElementById('limpar');
if (limparBtn) {
    limparBtn.addEventListener('click', limparCampos);
}
// Esconder gráfico se inputs ficarem vazios
function verificarInputsEVizualizacao() {
    const renda = rendaInput.value.trim();
    const rendaExtra = rendaExtraInput.value.trim();
    if ((!renda || renda === '0') && (!rendaExtra || rendaExtra === '0')) {
        const chartSection = document.getElementById('chart-section');
        if (chartSection) chartSection.style.display = 'none';
        if (resultsSection) resultsSection.style.display = 'none';
        // Limpar valores das tags <span> do resumo
        if (totalContribuicoes) totalContribuicoes.textContent = 'R$ 0,00';
        if (rendaRestante) rendaRestante.textContent = 'R$ 0,00';
        if (percentualTotal) percentualTotal.textContent = '0%';
    }
}
if (rendaInput) rendaInput.addEventListener('input', verificarInputsEVizualizacao);
if (rendaExtraInput) rendaExtraInput.addEventListener('input', verificarInputsEVizualizacao);

// --- Persistência automática dos inputs ---
function salvarInputs() {
    localStorage.setItem('inputsDizimo', JSON.stringify({
        renda: rendaInput.value,
        rendaExtra: rendaExtraInput.value
    }));
}
function restaurarInputs() {
    const dados = localStorage.getItem('inputsDizimo');
    if (dados) {
        try {
            const { renda, rendaExtra } = JSON.parse(dados);
            if (renda !== undefined) rendaInput.value = renda;
            if (rendaExtra !== undefined) rendaExtraInput.value = rendaExtra;
        } catch {}
    }
}
// Salvar ao digitar
if (rendaInput) rendaInput.addEventListener('input', salvarInputs);
if (rendaExtraInput) rendaExtraInput.addEventListener('input', salvarInputs);
// Restaurar ao carregar
restaurarInputs();

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Carregar último cálculo
    carregarUltimoCalculo();
    
    // Focar no primeiro input
    if (rendaInput) rendaInput.focus();
    
    // Adicionar efeito de loading ao botão
    if (calcularBtn) {
        calcularBtn.addEventListener('click', () => {
            const textoOriginal = calcularBtn.textContent;
            calcularBtn.textContent = 'Calculando...';
            calcularBtn.disabled = true;
            
            setTimeout(() => {
                calcularBtn.textContent = textoOriginal;
                calcularBtn.disabled = false;
            }, 1000);
        });
    }
    
    // Adicionar tooltips informativos
    const tooltips = [
        { element: rendaInput, text: 'Sua renda mensal fixa (salário, aposentadoria, etc.)' },
        { element: rendaExtraInput, text: 'Renda extra (freelance, bônus, vendas, etc.)' }
    ];
    
    tooltips.forEach(({ element, text }) => {
        if (element) element.title = text;
    });

    // Seleção global do chartSection
    const chartSection = document.getElementById('chart-section');
    if (chartSection) chartSection.style.display = 'none';
});

// Detectar mudanças de tema
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addListener((e) => {
    document.body.classList.toggle('dark-mode', e.matches);
});

// Adicionar suporte a gestos touch para mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe para cima - mostrar resultados se escondidos
            if (resultsSection.style.display === 'none') {
                calcularBtn.click();
            }
        } else {
            // Swipe para baixo - esconder resultados
            if (resultsSection.style.display === 'block') {
                limparCampos();
            }
        }
    }
}

// Adicionar suporte a atalhos de teclado
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter para calcular
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        calcularBtn.click();
    }
    
    // Escape para limpar
    if (e.key === 'Escape') {
        limparCampos();
    }
});

// === MODAIS DE LOGIN/CADASTRO === //
function abrirModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  // Se for o modal de cadastro, aplica modal-right
  if (id === 'modal-cadastro') {
    modal.classList.add('modal-right');
  } else {
    modal.classList.remove('modal-right');
  }
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function fecharModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.style.display = 'none';
  modal.classList.remove('modal-right');
  document.body.style.overflow = '';
}
// Abrir modal ao clicar em "Entrar" (navbar ou drawer)
document.querySelectorAll('.navbar-login, .drawer-login').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    abrirModal('modal-login');
  });
});
// Fechar modal login
const closeLogin = document.getElementById('close-login');
if (closeLogin) closeLogin.onclick = () => fecharModal('modal-login');
// Fechar modal cadastro
const closeCadastro = document.getElementById('close-cadastro');
if (closeCadastro) closeCadastro.onclick = () => fecharModal('modal-cadastro');
// Remover lógica de modal de cadastro. Ajustar links para /cadastro.html
// Alternar para cadastro
const linkParaCadastro = document.getElementById('link-para-cadastro');
if (linkParaCadastro) linkParaCadastro.onclick = (e) => {
  e.preventDefault();
  window.location.href = '/cadastro.html';
};
// Alternar para login
const linkParaLogin = document.getElementById('link-para-login');
if (linkParaLogin) linkParaLogin.onclick = (e) => {
  e.preventDefault();
  fecharModal('modal-cadastro');
  abrirModal('modal-login');
};
// Fechar modal ao clicar fora do conteúdo
['modal-login','modal-cadastro'].forEach(id => {
  const modal = document.getElementById(id);
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) fecharModal(id);
    });
  }
});

// === MODAL DE RECUPERAÇÃO DE SENHA ===
const modalRecuperar = document.getElementById('modal-recuperar');
const closeRecuperar = document.getElementById('close-recuperar');
const linkRecuperarSenha = document.getElementById('link-recuperar-senha');
const linkVoltarLogin = document.getElementById('link-voltar-login');
if (linkRecuperarSenha) linkRecuperarSenha.onclick = (e) => {
  e.preventDefault();
  fecharModal('modal-login');
  abrirModal('modal-recuperar');
};
if (closeRecuperar) closeRecuperar.onclick = () => fecharModal('modal-recuperar');
if (linkVoltarLogin) linkVoltarLogin.onclick = (e) => {
  e.preventDefault();
  fecharModal('modal-recuperar');
  abrirModal('modal-login');
};
if (modalRecuperar) {
  modalRecuperar.addEventListener('click', e => {
    if (e.target === modalRecuperar) fecharModal('modal-recuperar');
  });
}
// === RECUPERAÇÃO DE SENHA ===
// Funcionalidade removida - sistema de autenticação simplificado

// === CADASTRO DE MEMBRO ===
// Funcionalidade removida - sistema de autenticação simplificado

// === LOGIN DE MEMBRO ===
// Funcionalidade removida - sistema de autenticação simplificado

// === SISTEMA DE AUTENTICAÇÃO ===
// Funcionalidades de autenticação removidas - aplicação simplificada

import { auth, db } from './js/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const protectedPages = ['/dashboard.html'];
const publicPages = ['/login.html', '/cadastro.html', '/recuperar.html'];

function renderUserDropdown(user, role) {
  const container = document.getElementById('navbar-user-container');
  if (!container) return;
  container.innerHTML = `
    <div class="navbar-user-dropdown-trigger" id="navbar-user-trigger">
      <span class="navbar-username">${user.displayName || user.email}</span>
      <span class="navbar-user-caret">▼</span>
    </div>
    <div class="navbar-user-dropdown" id="navbar-user-dropdown" style="display:none;">
      ${role === 'admin' || role === 'responsavel' ? '<a href="/membro.html" class="navbar-user-item">Área do Membro</a>' : ''}
      <a href="/perfil.html" class="navbar-user-item">Meu Perfil</a>
      <button id="navbar-logout-btn" class="navbar-user-item">Sair</button>
    </div>
  `;
  // Dropdown toggle
  const trigger = document.getElementById('navbar-user-trigger');
  const dropdown = document.getElementById('navbar-user-dropdown');
  trigger.onclick = () => {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  };
  // Fecha dropdown ao clicar fora
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) dropdown.style.display = 'none';
  });
  // Logout
  document.getElementById('navbar-logout-btn').onclick = async () => {
    await signOut(auth);
    window.location.href = '/login.html';
  };
}

function renderLoginButton() {
  const container = document.getElementById('navbar-user-container');
  if (!container) return;
  container.innerHTML = '<a href="/login.html" class="navbar-login" id="navbar-login-btn">Entrar</a>';
}

document.addEventListener('DOMContentLoaded', () => {
  const membroBtn = document.getElementById('navbar-membro-btn');
  const menu = document.querySelector('.navbar-menu');

  onAuthStateChanged(auth, async (user) => {
    const path = window.location.pathname;
    if (user) {
      // Só redireciona para dashboard se tentar acessar login/cadastro
      if (publicPages.includes(path)) {
        window.location.href = '/dashboard.html';
      }
      // Busca papel do usuário
      let role = '';
      try {
        const docSnap = await getDoc(doc(db, 'usuarios', user.uid));
        if (docSnap.exists()) {
          role = docSnap.data().role || '';
        }
      } catch {}
      renderUserDropdown(user, role);
    } else {
      // Se não logado, redireciona para login em páginas protegidas
      if (protectedPages.includes(path)) {
        window.location.href = '/login.html';
      }
      renderLoginButton();
    }
  });
});

console.log('Calculadora de Dízimos carregada com sucesso! 🎉'); 

// Drawer menu mobile (abrir/fechar)
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('navbar-burger');
  const drawer = document.getElementById('navbar-drawer');
  const closeBtn = document.getElementById('drawer-close');
  const backdrop = document.getElementById('drawer-backdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');
  if (burger && drawer && closeBtn && backdrop) {
    function openDrawer() {
      drawer.classList.add('open');
      backdrop.classList.add('show');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      backdrop.classList.remove('show');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    burger.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    drawerLinks.forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
    // Acessibilidade
    burger.setAttribute('aria-controls', 'navbar-drawer');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
  }
}); 