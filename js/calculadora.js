import '../style.css';
import './menu-mobile.js';
import Chart from 'chart.js/auto';

// Elementos DOM
const rendaInput = document.getElementById('renda');
const rendaExtraInput = document.getElementById('renda-extra');
const calcularBtn = document.getElementById('calcular');
const resultsSection = document.getElementById('results');
const dizimoValor = document.getElementById('dizimo-valor');
const ofertaValor = document.getElementById('oferta-valor');
const primiciasValor = document.getElementById('primicias-valor');
const semeaduraValor = document.getElementById('semeadura-valor');
const totalContribuicoes = document.getElementById('total-contribuicoes');
const rendaRestante = document.getElementById('renda-restante');
const percentualTotal = document.getElementById('percentual-total');
const totalSection = document.querySelector('.total-section');

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}
function formatarPercentual(valor) {
    return `${(valor * 100).toFixed(1)}%`;
}
function validarEntrada(valor) {
    const num = parseFloat(valor);
    return !isNaN(num) && num >= 0;
}
function calcularContribuicoes(rendaMensal, rendaExtra = 0) {
    const rendaTotal = rendaMensal + rendaExtra;
    if (rendaTotal <= 0) {
        throw new Error('A renda deve ser maior que zero');
    }
    const primicias = rendaTotal / 30;
    const dizimo = (rendaTotal - primicias) * 0.10;
    const oferta = rendaTotal * 0.01;
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
let chartContribuicoes = null;
function atualizarGrafico(resultados) {
    const ctx = document.getElementById('chartContribuicoes').getContext('2d');
    const data = {
        labels: ['Dízimo', 'Oferta', 'Primícias', 'Semeadura'],
        datasets: [{
            label: 'Valor (R$)',
            data: [resultados.dizimo, resultados.oferta, resultados.primicias, resultados.semeadura],
            backgroundColor: [
                'rgba(34,197,94,0.85)',
                'rgba(16,185,129,0.80)',
                'rgba(132,204,22,0.80)',
                'rgba(22,163,74,0.75)'
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
function atualizarInterface(resultados) {
    dizimoValor.textContent = formatarMoeda(resultados.dizimo);
    ofertaValor.textContent = formatarMoeda(resultados.oferta);
    primiciasValor.textContent = formatarMoeda(resultados.primicias);
    semeaduraValor.textContent = formatarMoeda(resultados.semeadura);
    document.querySelector('.dizimo .result-percent').textContent = '10% da renda (após primícias)';
    document.querySelector('.dizimo .result-description').textContent = 'Dízimo sobre a renda líquida das primícias';
    document.querySelector('.oferta .result-percent').textContent = '1% da renda';
    document.querySelector('.oferta .result-description').textContent = 'Oferta voluntária (mínimo de 1%)';
    document.querySelector('.primicias .result-percent').textContent = '1/30 da renda';
    document.querySelector('.primicias .result-description').textContent = 'Primícias: um dia de trabalho';
    document.querySelector('.semeadura .result-percent').textContent = '1% da renda';
    document.querySelector('.semeadura .result-description').textContent = 'Semeadura (mínimo de 1%)';
    totalContribuicoes.textContent = formatarMoeda(resultados.totalContribuicoes);
    rendaRestante.textContent = formatarMoeda(resultados.rendaRestante);
    percentualTotal.textContent = formatarPercentual(resultados.percentualTotal / 100);
    resultsSection.style.display = 'block';
    const cards = document.querySelectorAll('.result-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'fadeInUp 0.6s ease-out';
        }, index * 100);
    });
    atualizarGrafico(resultados);
    const chartSection = document.getElementById('chart-section');
    if (chartSection) chartSection.style.display = 'block';
    if (totalSection) totalSection.style.display = 'block';
}
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.textContent = mensagem;
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
calcularBtn.addEventListener('click', () => {
    try {
        const rendaMensal = parseFloat(rendaInput.value) || 0;
        const rendaExtra = parseFloat(rendaExtraInput.value) || 0;
        if (!validarEntrada(rendaMensal) && !validarEntrada(rendaExtra)) {
            mostrarNotificacao('Por favor, insira um valor válido para a renda.', 'error');
            return;
        }
        if (rendaMensal + rendaExtra <= 0) {
            mostrarNotificacao('A renda total deve ser maior que zero.', 'error');
            return;
        }
        const resultados = calcularContribuicoes(rendaMensal, rendaExtra);
        atualizarInterface(resultados);
        mostrarNotificacao('Cálculos realizados com sucesso!', 'success');
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
[rendaInput, rendaExtraInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calcularBtn.click();
        }
    });
});
function carregarUltimoCalculo() {
    const ultimoCalculo = localStorage.getItem('ultimoCalculo');
    if (ultimoCalculo) {
        try {
            const dados = JSON.parse(ultimoCalculo);
            const agora = Date.now();
            const umDia = 24 * 60 * 60 * 1000;
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
function limparCampos() {
    rendaInput.value = '';
    rendaExtraInput.value = '';
    localStorage.removeItem('inputsDizimo');
    localStorage.removeItem('ultimoCalculo');
    if (resultsSection) resultsSection.style.display = 'none';
    const chartSection = document.getElementById('chart-section');
    if (chartSection) chartSection.style.display = 'none';
    if (totalContribuicoes) totalContribuicoes.textContent = 'R$ 0,00';
    if (rendaRestante) rendaRestante.textContent = 'R$ 0,00';
    if (percentualTotal) percentualTotal.textContent = '0%';
    rendaInput.focus();
    verificarInputsEVizualizacao();
}
const limparBtn = document.getElementById('limpar');
if (limparBtn) {
    limparBtn.addEventListener('click', limparCampos);
}
function verificarInputsEVizualizacao() {
    const renda = rendaInput.value.trim();
    const rendaExtra = rendaExtraInput.value.trim();
    if ((!renda || renda === '0') && (!rendaExtra || rendaExtra === '0')) {
        const chartSection = document.getElementById('chart-section');
        if (chartSection) chartSection.style.display = 'none';
        if (resultsSection) resultsSection.style.display = 'none';
        if (totalContribuicoes) totalContribuicoes.textContent = 'R$ 0,00';
        if (rendaRestante) rendaRestante.textContent = 'R$ 0,00';
        if (percentualTotal) percentualTotal.textContent = '0%';
    }
}
rendaInput.addEventListener('input', verificarInputsEVizualizacao);
rendaExtraInput.addEventListener('input', verificarInputsEVizualizacao);
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
rendaInput.addEventListener('input', salvarInputs);
rendaExtraInput.addEventListener('input', salvarInputs);
restaurarInputs();
document.addEventListener('DOMContentLoaded', () => {
    carregarUltimoCalculo();
    rendaInput.focus();
    calcularBtn.addEventListener('click', () => {
        const textoOriginal = calcularBtn.textContent;
        calcularBtn.textContent = 'Calculando...';
        calcularBtn.disabled = true;
        setTimeout(() => {
            calcularBtn.textContent = textoOriginal;
            calcularBtn.disabled = false;
        }, 1000);
    });
    const tooltips = [
        { element: rendaInput, text: 'Sua renda mensal fixa (salário, aposentadoria, etc.)' },
        { element: rendaExtraInput, text: 'Renda extra (freelance, bônus, vendas, etc.)' }
    ];
    tooltips.forEach(({ element, text }) => {
        element.title = text;
    });
    const chartSection = document.getElementById('chart-section');
    if (chartSection) chartSection.style.display = 'none';
}); 