import '../style.css';
import './menu-mobile.js';
import Chart from 'chart.js/auto';
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

// Seletores dos novos botões e modal
const btnPagar = document.getElementById('btn-pagar');
const btnComprovante = document.getElementById('btn-comprovante');
const modalPagamento = document.getElementById('modal-pagamento');
const modalClose = document.getElementById('modal-close');
const modalBackdrop = document.getElementById('modal-backdrop');
const btnSalvarTributo = document.getElementById('btn-salvar-tributo');
let usuarioLogado = null;
let ultimoResultado = null;

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

// Tabela de oferta baseada em faixas salariais
const TABELA_OFERTA = [
    { min: 0, max: 1518, valor: 2.00 },
    { min: 1518.01, max: 3035.99, valor: 3.00 },
    { min: 3036, max: 6072, valor: 5.00 },
    { min: 7590, max: 10626, valor: 10.00 },
    { min: 12144, max: 15180, valor: 20.00 },
    { min: 16698, max: 30360, valor: 50.00 },
    { min: 31878, max: 75900, valor: 100.00 },
    { min: 77418, max: 151800, valor: 500.00 }
];

// Função para calcular oferta baseada na tabela de faixas
function calcularOferta(rendaTotal) {
    // Verificar se está acima de 100 salários (R$ 151.800,00)
    if (rendaTotal > 151800) {
        return {
            valor: null,
            mensagem: "Valor especial",
            tipo: "especial"
        };
    }
    
    // Encontrar a faixa correspondente à renda
    const faixa = TABELA_OFERTA.find(item => 
        rendaTotal >= item.min && rendaTotal <= item.max
    );
    
    if (faixa) {
        return {
            valor: faixa.valor,
            mensagem: `Com base no piso salarial`,
            tipo: "normal"
        };
    }
    
    // Caso não encontre faixa (deve ser entre 6072.01 e 7589.99, ou 10626.01 e 12143.99, etc.)
    // Usar a faixa anterior mais próxima
    const faixaAnterior = TABELA_OFERTA.filter(item => item.max < rendaTotal)
        .sort((a, b) => b.max - a.max)[0];
    
    if (faixaAnterior) {
        return {
            valor: faixaAnterior.valor,
            mensagem: `Valor fixo por visita à igreja`,
            tipo: "normal"
        };
    }
    
    // Fallback para rendas muito baixas
    return {
        valor: 2.00,
        mensagem: `Valor fixo por visita à igreja`,
        tipo: "normal"
    };
}

function calcularContribuicoes(rendaMensal, rendaExtra = 0) {
    const rendaTotal = rendaMensal + rendaExtra;
    if (rendaTotal <= 0) {
        throw new Error('A renda deve ser maior que zero');
    }
    
    const primicias = rendaTotal / 30;
    const dizimo = (rendaTotal - primicias) * 0.10;
    
    // Nova lógica para cálculo da oferta
    const ofertaInfo = calcularOferta(rendaTotal);
    const oferta = ofertaInfo.valor || 0; // Se for null, usar 0
    
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
        rendaTotal,
        ofertaInfo // Incluir informações da oferta para uso na interface
    };
}
let chartContribuicoes = null;
function atualizarGrafico(resultados) {
    const ctx = document.getElementById('chartContribuicoes').getContext('2d');
    
    // Tratar caso especial da oferta (quando é "Converse com seu sacerdote")
    const ofertaValor = resultados.ofertaInfo && resultados.ofertaInfo.tipo === "especial" ? 0 : resultados.oferta;
    
    const data = {
        labels: ['Dízimo', 'Oferta', 'Primícias', 'Semeadura'],
        datasets: [{
            label: 'Valor (R$)',
            data: [resultados.dizimo, ofertaValor, resultados.primicias, resultados.semeadura],
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
    
    // Atualizar interface da oferta baseada na nova lógica
    if (resultados.ofertaInfo.tipo === "especial") {
        ofertaValor.textContent = resultados.ofertaInfo.mensagem;
        document.querySelector('.oferta .result-percent').textContent = 'Consulte seu sacerdote';
        document.querySelector('.oferta .result-description').textContent = 'Superior a 100 salários';
    } else {
        ofertaValor.textContent = formatarMoeda(resultados.oferta);
        document.querySelector('.oferta .result-percent').textContent = 'Valor fixo por culto';
        document.querySelector('.oferta .result-description').textContent = resultados.ofertaInfo.mensagem;
    }
    
    primiciasValor.textContent = formatarMoeda(resultados.primicias);
    semeaduraValor.textContent = formatarMoeda(resultados.semeadura);
    document.querySelector('.dizimo .result-percent').textContent = '10% da renda (após primícias)';
    document.querySelector('.dizimo .result-description').textContent = 'Dízimo da renda bruta';
    document.querySelector('.primicias .result-percent').textContent = '1/30 da renda total';
    document.querySelector('.primicias .result-description').textContent = 'Primícias = 1 dia de trabalho';
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
function funcaoPagar() {
    mostrarNotificacao('Funcionalidade de pagamento ainda não implementada.', 'info');
}
function funcaoEnviarComprovante() {
    mostrarNotificacao('Funcionalidade de envio de comprovante ainda não implementada.', 'info');
}

// Função para copiar texto e mostrar notificação
function copiarParaClipboard(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        mostrarNotificacao('Chave copiada!', 'success');
    }, () => {
        mostrarNotificacao('Erro ao copiar.', 'error');
    });
}

// Eventos de clique para copiar PIX e CNPJ
const copiarPix = document.getElementById('copiar-pix');
const copiarCnpj = document.getElementById('copiar-cnpj');
if (copiarPix) {
    copiarPix.addEventListener('click', function() {
        copiarParaClipboard(copiarPix.textContent.trim());
    });
}
if (copiarCnpj) {
    copiarCnpj.addEventListener('click', function() {
        copiarParaClipboard(copiarCnpj.textContent.trim());
    });
}

// Função para mostrar/ocultar botões de ação
function atualizarBotoesAcoes(ativo) {
    if (btnPagar) btnPagar.style.display = ativo ? 'inline-flex' : 'none';
    if (btnComprovante) {
        btnComprovante.style.display = ativo ? 'inline-flex' : 'none';
        btnComprovante.disabled = true;
    }
    if (btnSalvarTributo) btnSalvarTributo.style.display = ativo && ultimoResultado ? 'inline-flex' : 'none';
}

// Mostrar modal de pagamento
function abrirModalPagamento() {
    if (modalPagamento) modalPagamento.style.display = 'flex';
    if (btnComprovante) btnComprovante.disabled = false;
}
// Fechar modal de pagamento
function fecharModalPagamento() {
    if (modalPagamento) modalPagamento.style.display = 'none';
}

// Eventos do modal
if (btnPagar) btnPagar.addEventListener('click', abrirModalPagamento);
if (modalClose) modalClose.addEventListener('click', fecharModalPagamento);
if (modalBackdrop) modalBackdrop.addEventListener('click', fecharModalPagamento);

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') fecharModalPagamento();
});

// Exibir botões após cálculo
function exibirAcoesSeCalculoValido(resultados) {
    if (resultados && resultados.totalContribuicoes > 0) {
        atualizarBotoesAcoes(true);
    } else {
        atualizarBotoesAcoes(false);
    }
}

// Geração do comprovante (screenshot)
async function gerarComprovante() {
    try {
        const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')).default;
        const area = document.querySelector('.novo-card-lateral');
        if (!area) throw new Error('Área de comprovante não encontrada.');
        const canvas = await html2canvas(area, {backgroundColor: '#fff'});
        const link = document.createElement('a');
        link.download = 'comprovante-prosperando.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        mostrarNotificacao('Erro ao gerar comprovante. Tente novamente.', 'error');
    }
}
if (btnComprovante) btnComprovante.addEventListener('click', gerarComprovante);

// Função de máscara para moeda brasileira
function aplicarMascaraMoeda(input) {
    input.addEventListener('input', function(e) {
        let valor = input.value.replace(/\D/g, '');
        valor = (parseInt(valor, 10) || 0).toString();
        while (valor.length < 3) valor = '0' + valor;
        let parteInteira = valor.slice(0, -2);
        let parteDecimal = valor.slice(-2);
        parteInteira = parteInteira.replace(/^0+/, '') || '0';
        let valorFormatado = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ',' + parteDecimal;
        input.value = 'R$ ' + valorFormatado;
    });
    // Ao focar, remove o R$ para facilitar edição
    input.addEventListener('focus', function() {
        if (input.value === '' || input.value === 'R$ 0,00') input.value = '';
    });
    // Ao sair do foco, garante formatação
    input.addEventListener('blur', function() {
        let valor = input.value.replace(/\D/g, '');
        valor = (parseInt(valor, 10) || 0).toString();
        while (valor.length < 3) valor = '0' + valor;
        let parteInteira = valor.slice(0, -2);
        let parteDecimal = valor.slice(-2);
        parteInteira = parteInteira.replace(/^0+/, '') || '0';
        let valorFormatado = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ',' + parteDecimal;
        input.value = 'R$ ' + valorFormatado;
    });
}

// Aplicar máscara nos inputs de renda
aplicarMascaraMoeda(rendaInput);
aplicarMascaraMoeda(rendaExtraInput);

// Função para extrair valor numérico dos inputs mascarados
function extrairValorNumerico(input) {
    return parseFloat(input.value.replace(/[^\d]/g, '')) / 100 || 0;
}

// Exibe o botão Salvar Tributo apenas para usuários logados
onAuthStateChanged(auth, (user) => {
    usuarioLogado = user;
    // O botão só aparece se estiver logado E houver cálculo válido
    if (btnSalvarTributo) {
        btnSalvarTributo.style.display = (user && ultimoResultado) ? 'inline-flex' : 'none';
    }
});

// Salva o último cálculo realizado para uso no botão
function salvarUltimoResultado(resultados) {
    ultimoResultado = resultados;
    // Só mostra o botão se o usuário estiver logado e houver cálculo
    if (btnSalvarTributo) {
        btnSalvarTributo.style.display = (usuarioLogado && ultimoResultado) ? 'inline-flex' : 'none';
    }
}

// Modificar o fluxo do cálculo para guardar o último resultado
const calcularBtnOriginal = document.getElementById('calcular');
if (calcularBtnOriginal) {
    calcularBtnOriginal.addEventListener('click', () => {
        try {
            const rendaMensal = extrairValorNumerico(rendaInput);
            const rendaExtra = extrairValorNumerico(rendaExtraInput);
            if (!validarEntrada(rendaMensal) && !validarEntrada(rendaExtra)) {
                mostrarNotificacao('Por favor, insira um valor válido para a renda.', 'error');
                atualizarBotoesAcoes(false);
                return;
            }
            if (rendaMensal + rendaExtra <= 0) {
                mostrarNotificacao('A renda total deve ser maior que zero.', 'error');
                atualizarBotoesAcoes(false);
                return;
            }
            const resultados = calcularContribuicoes(rendaMensal, rendaExtra);
            atualizarInterface(resultados);
            mostrarNotificacao('Cálculos realizados com sucesso!', 'success');
            exibirAcoesSeCalculoValido(resultados);
            localStorage.setItem('ultimoCalculo', JSON.stringify({
                rendaMensal,
                rendaExtra,
                resultados,
                timestamp: Date.now()
            }));
            salvarUltimoResultado({ ...resultados, rendaMensal, rendaExtra });
        } catch (error) {
            console.error('Erro no cálculo:', error);
            mostrarNotificacao(error.message || 'Erro ao calcular as contribuições.', 'error');
            atualizarBotoesAcoes(false);
        }
    });
}

// Função para salvar tributo no Firestore
async function salvarTributoFirestore() {
    if (!usuarioLogado) {
        mostrarNotificacao('Você precisa estar logado para salvar.', 'error');
        return;
    }
    if (!ultimoResultado) {
        mostrarNotificacao('Realize um cálculo antes de salvar.', 'warning');
        return;
    }
    try {
        await addDoc(collection(db, 'tributos'), {
            ...ultimoResultado,
            uid: usuarioLogado.uid,
            criadoEm: serverTimestamp()
        });
        mostrarNotificacao('Tributo salvo com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao salvar tributo:', error);
        mostrarNotificacao('Erro ao salvar tributo. Tente novamente.', 'error');
    }
}
if (btnSalvarTributo) {
    btnSalvarTributo.addEventListener('click', salvarTributoFirestore);
}

// Inicialização: esconder botões
atualizarBotoesAcoes(false);

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
                // Verificar se o cálculo antigo tem a nova estrutura de ofertaInfo
                if (dados.resultados && !dados.resultados.ofertaInfo) {
                    // Recalcular com a nova lógica se for um cálculo antigo
                    const resultados = calcularContribuicoes(dados.rendaMensal, dados.rendaExtra);
                    dados.resultados = resultados;
                }
                
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
    ultimoResultado = null;
    if (btnSalvarTributo) btnSalvarTributo.style.display = 'none';
    atualizarBotoesAcoes(false);
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