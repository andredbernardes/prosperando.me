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
    const ctx = document.getElementById('chartContribuicoes').getContext('2d');
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
    dizimoValor.textContent = formatarMoeda(resultados.dizimo);
    ofertaValor.textContent = formatarMoeda(resultados.oferta);
    primiciasValor.textContent = formatarMoeda(resultados.primicias);
    semeaduraValor.textContent = formatarMoeda(resultados.semeadura);

    // Atualizar percentuais e descrições
    document.querySelector('.dizimo .result-percent').textContent = '10% da renda (após primícias)';
    document.querySelector('.dizimo .result-description').textContent = 'Dízimo sobre a renda líquida das primícias';
    document.querySelector('.oferta .result-percent').textContent = '1% da renda';
    document.querySelector('.oferta .result-description').textContent = 'Oferta voluntária (mínimo de 1%)';
    document.querySelector('.primicias .result-percent').textContent = '1/30 da renda';
    document.querySelector('.primicias .result-description').textContent = 'Primícias: um dia de trabalho';
    document.querySelector('.semeadura .result-percent').textContent = '1% da renda';
    document.querySelector('.semeadura .result-description').textContent = 'Semeadura (mínimo de 1%)';

    // Atualizar totais
    totalContribuicoes.textContent = formatarMoeda(resultados.totalContribuicoes);
    rendaRestante.textContent = formatarMoeda(resultados.rendaRestante);
    percentualTotal.textContent = formatarPercentual(resultados.percentualTotal / 100);

    // Mostrar seção de resultados com animação
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
    resultsSection.style.display = 'none';
    rendaInput.value = '';
    rendaExtraInput.value = '';
    rendaInput.focus();
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

// Event listeners para Enter nos inputs
[rendaInput, rendaExtraInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calcularBtn.click();
        }
    });
});

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
                rendaInput.value = dados.rendaMensal;
                rendaExtraInput.value = dados.rendaExtra;
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
    rendaInput.value = '';
    rendaExtraInput.value = '';
    localStorage.removeItem('inputsDizimo');
    localStorage.removeItem('ultimoCalculo');
    if (resultsSection) resultsSection.style.display = 'none';
    const chartSection = document.getElementById('chart-section');
    if (chartSection) chartSection.style.display = 'none';
    // Limpar valores das tags <span> do resumo
    if (totalContribuicoes) totalContribuicoes.textContent = 'R$ 0,00';
    if (rendaRestante) rendaRestante.textContent = 'R$ 0,00';
    if (percentualTotal) percentualTotal.textContent = '0%';
    rendaInput.focus();
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
rendaInput.addEventListener('input', verificarInputsEVizualizacao);
rendaExtraInput.addEventListener('input', verificarInputsEVizualizacao);

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
rendaInput.addEventListener('input', salvarInputs);
rendaExtraInput.addEventListener('input', salvarInputs);
// Restaurar ao carregar
restaurarInputs();

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Carregar último cálculo
    carregarUltimoCalculo();
    
    // Focar no primeiro input
    rendaInput.focus();
    
    // Adicionar efeito de loading ao botão
    calcularBtn.addEventListener('click', () => {
        const textoOriginal = calcularBtn.textContent;
        calcularBtn.textContent = 'Calculando...';
        calcularBtn.disabled = true;
        
        setTimeout(() => {
            calcularBtn.textContent = textoOriginal;
            calcularBtn.disabled = false;
        }, 1000);
    });
    
    // Adicionar tooltips informativos
    const tooltips = [
        { element: rendaInput, text: 'Sua renda mensal fixa (salário, aposentadoria, etc.)' },
        { element: rendaExtraInput, text: 'Renda extra (freelance, bônus, vendas, etc.)' }
    ];
    
    tooltips.forEach(({ element, text }) => {
        element.title = text;
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

console.log('Calculadora de Dízimos carregada com sucesso! 🎉'); 