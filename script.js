// ==========================================
// SIMULADOR DE PEDIDOS HERBALIFE - SUPABASE PRO
// Fonte única: Tabela "produtos" no Supabase
// ==========================================

const SUPABASE_URL = 'https://jrbzvtbpzqjehakaqscz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYnp2dGJwenFqZWhha2Fxc2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTYzNDAsImV4cCI6MjA5MzY5MjM0MH0.JNQLHC4HruE0jXedJO7i_b2qn_zKvHZBvIqbD_hX3Zk';
let supabase;

// Estado Global
let ufAtual = "SP";
let carrinho = [];
let termoBusca = "";
let cacheEstados = {}; // { "GO": [...produtos], "ES": [...] }
let estadosDisponiveis = [];

const FAIXAS = [
    { pv: 0,    label: "25%", key: "preco_25" },
    { pv: 500,  label: "35%", key: "preco_35" },
    { pv: 1000, label: "42%", key: "preco_42" },
    { pv: 2000, label: "50%", key: "preco_50" }
];

// ==========================================
// INICIALIZAÇÃO
// ==========================================

// Lista fixa de estados para evitar query pesada no Supabase
const ESTADOS_BR = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!window.supabase) throw new Error("SDK do Supabase não carregou. Verifique sua conexão ou desative bloqueadores de anúncio.");
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch(err) {
        alert("Erro fatal no carregamento: " + err.message);
        return;
    }

    // TESTE DIAGNÓSTICO SOLICITADO
    console.log('--- SUPABASE DIAGNOSTIC TEST INICIADO ---');
    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .limit(5);

        console.log('SUPABASE DATA:', data);
        console.log('SUPABASE ERROR:', error);
    } catch (e) {
        console.error('SUPABASE CATCH EXCEPTION:', e);
    }
    console.log('-----------------------------------------');

    estadosDisponiveis = ESTADOS_BR;
    popularUFs();
    // 1. Garante que ufAtual existe, se não, pega o primeiro
    if (!estadosDisponiveis.includes(ufAtual)) ufAtual = estadosDisponiveis[0];
    
    await inicializarSistema();
    configurarEventos();
});

async function inicializarSistema() {
    try {
        // Carregar estado inicial
        await carregarProdutosPorEstado(ufAtual);
        atualizarCarrinho();
    } catch (err) {
        exibirErro("Falha ao inicializar: " + err.message);
    } finally {
        mostrarLoading(false);
    }
}

async function carregarProdutosPorEstado(uf) {
    // Se já estiver no cache, não busca de novo
    if (cacheEstados[uf]) {
        console.log(`⚡ Usando cache para o estado: ${uf}`);
        renderProdutos();
        return;
    }

    try {
        mostrarLoading(true);
        console.log(`🌐 Buscando dados no Supabase para: ${uf}...`);
        
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .eq('estado', uf);

        console.log("RAW SUPABASE RESPOSTA PARA " + uf + ":", { data, error });

        if (error) throw error;

        cacheEstados[uf] = data || [];
        console.log(`✅ Dados carregados para ${uf}:`, cacheEstados[uf]);

        // Validação Obrigatória conforme solicitado
        validarEstadoEspecifico(uf, cacheEstados[uf]);

        renderProdutos();
    } catch (err) {
        console.error("ERRO SUPABASE DETALHADO:", err);
        exibirErro(`Erro ao carregar produtos de ${uf}: ` + err.message);
    } finally {
        mostrarLoading(false);
    }
}

function validarEstadoEspecifico(uf, produtos) {
    const item534 = produtos.find(p => p.sku === "534K");
    if (item534) {
        console.log(`📊 VALIDAÇÃO ${uf} + SKU 534K:`, {
            "Consumidor": item534.preco_consumidor,
            "25%": item534.preco_25,
            "35%": item534.preco_35,
            "42%": item534.preco_42,
            "50%": item534.preco_50
        });
    }
}

// ==========================================
// EVENTOS E UI
// ==========================================

function popularUFs() {
    const select = document.getElementById('ufSelector');
    if (!select) return;
    
    select.innerHTML = '';
    estadosDisponiveis.forEach(uf => {
        const opt = document.createElement('option');
        opt.value = uf;
        opt.textContent = `Estado de Entrega: ${uf}`;
        if (uf === ufAtual) opt.selected = true;
        select.appendChild(opt);
    });
}

function configurarEventos() {
    document.getElementById('ufSelector').addEventListener('change', async (e) => {
        ufAtual = e.target.value;
        await carregarProdutosPorEstado(ufAtual);
        atualizarCarrinho(); // Recalcula preços do carrinho para o novo estado
    });

    let timeoutBusca;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(timeoutBusca);
        timeoutBusca = setTimeout(() => {
            termoBusca = e.target.value.toLowerCase();
            renderProdutos();
        }, 300);
    });

    document.getElementById('cartFloatBtn').addEventListener('click', toggleCart);
    document.getElementById('closeCart').addEventListener('click', toggleCart);
    document.getElementById('cartOverlay').addEventListener('click', toggleCart);
    document.getElementById('addMoreProducts').addEventListener('click', toggleCart);
    
    document.getElementById('limparCarrinho').addEventListener('click', () => {
        if(confirm("Deseja limpar todo o seu pedido?")) {
            carrinho = [];
            atualizarCarrinho();
            renderProdutos();
        }
    });
}

function mostrarLoading(show) {
    const container = document.getElementById('listaProdutos');
    if (show) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                <div class="loading-spinner"></div>
                <p style="margin-top: 1rem;">Buscando preços oficiais no banco...</p>
            </div>
        `;
    }
}

function exibirErro(msg) {
    const container = document.getElementById('listaProdutos');
    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem; background: #fff1f1; border: 1px solid #ffa3a3; border-radius: 12px; color: #d32f2f;">
            <p>⚠️ ${msg}</p>
            <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">Tentar Novamente</button>
        </div>
    `;
    console.error(msg);
}

function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    drawer.classList.toggle('active');
    overlay.style.display = drawer.classList.contains('active') ? 'block' : 'none';
}

// ==========================================
// RENDERIZAÇÃO
// ==========================================

function getFaixaAtiva() {
    const totalPV = carrinho.reduce((acc, item) => acc + (item.pv * item.qtd), 0);
    let faixa = FAIXAS[0];
    for (let f of FAIXAS) {
        if (totalPV >= f.pv) faixa = f;
    }
    return faixa;
}

function renderProdutos() {
    const container = document.getElementById('listaProdutos');
    const produtos = cacheEstados[ufAtual] || [];
    
    if (produtos.length === 0 && !termoBusca) return;

    container.innerHTML = '';
    const faixaAtiva = getFaixaAtiva();

    produtos.forEach((item) => {
        const nomeSeguro = item.nome || "Produto sem nome";
        const skuSeguro = item.sku || "N/A";

        if (termoBusca) {
            if (!nomeSeguro.toLowerCase().includes(termoBusca) && !skuSeguro.toLowerCase().includes(termoBusca)) {
                return;
            }
        }

        const card = document.createElement('div');
        card.className = 'product-card';
        
        const is25 = faixaAtiva.key === "preco_25" ? 'active' : '';
        const is35 = faixaAtiva.key === "preco_35" ? 'active' : '';
        const is42 = faixaAtiva.key === "preco_42" ? 'active' : '';
        const is50 = faixaAtiva.key === "preco_50" ? 'active' : '';

        card.innerHTML = `
            <span class="sku-tag">SKU: ${skuSeguro}</span>
            <strong class="product-name">${nomeSeguro}</strong>
            <div class="product-pv">${Number(item.pv || 0).toFixed(2)} PV</div>

            
            <div class="price-table">
                <div class="price-col">
                    <span class="price-label">Cons.</span>
                    <span class="price-value">${fmt(item.preco_consumidor)}</span>
                </div>
                <div class="price-col ${is25}">
                    <span class="price-label">25%</span>
                    <span class="price-value">${fmt(item.preco_25)}</span>
                </div>
                <div class="price-col ${is35}">
                    <span class="price-label">35%</span>
                    <span class="price-value">${fmt(item.preco_35)}</span>
                </div>
                <div class="price-col ${is42}">
                    <span class="price-label">42%</span>
                    <span class="price-value">${fmt(item.preco_42)}</span>
                </div>
                <div class="price-col ${is50}">
                    <span class="price-label">50%</span>
                    <span class="price-value">${fmt(item.preco_50)}</span>
                </div>
            </div>

            <div class="card-actions">
                <input type="number" value="1" min="1" class="qty-input" id="qty-${item.id}">
                <button class="add-btn" onclick="adicionarAoCarrinho(${item.id})">Adicionar</button>
            </div>
        `;
        container.appendChild(card);
    });
}

window.adicionarAoCarrinho = function(id) {
    const produtos = cacheEstados[ufAtual];
    const itemBanco = produtos.find(p => p.id === id);
    const inputQty = document.getElementById(`qty-${id}`);
    const qty = parseInt(inputQty.value) || 1;

    const indexExistente = carrinho.findIndex(c => c.sku === itemBanco.sku);
    
    if (indexExistente > -1) {
        carrinho[indexExistente].qtd += qty;
    } else {
        carrinho.push({
            id: id,
            sku: itemBanco.sku,
            nome: itemBanco.nome,
            pv: Number(itemBanco.pv),
            qtd: qty
        });
    }
    
    inputQty.value = 1; 
    atualizarCarrinho();
    renderProdutos();
};

window.removerDoCarrinho = function(id) {
    carrinho = carrinho.filter(i => i.id !== id);
    atualizarCarrinho();
    renderProdutos();
};

function atualizarCarrinho() {
    const container = document.getElementById('itensCarrinho');
    container.innerHTML = '';
    
    let totalPV = 0;
    let totalReal = 0;
    const faixa = getFaixaAtiva();

    carrinho.forEach(item => {
        const vPV = item.pv * item.qtd;
        
        // Sempre busca o preço do produto para o estado selecionado no momento
        const produtosEstado = cacheEstados[ufAtual] || [];
        const itemEstado = produtosEstado.find(p => p.sku === item.sku);
        
        const valorUnitario = itemEstado ? itemEstado[faixa.key] : 0;
        const valorTotalItem = valorUnitario * item.qtd;
        
        totalPV += vPV;
        totalReal += valorTotalItem;

        const row = document.createElement('div');
        row.style.cssText = "padding: 1rem; border-bottom: 1px solid var(--border); position: relative;";
        row.innerHTML = `
            <div style="font-weight: 700; font-size: 0.9rem; padding-right: 25px;">${item.nome}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin: 4px 0;">
                ${item.qtd} un x ${fmt(valorUnitario)} | <strong>${vPV.toFixed(2)} PV</strong>
            </div>
            <div style="font-weight: 800; color: var(--primary);">${fmt(valorTotalItem)}</div>
            <button onclick="removerDoCarrinho(${item.id})" style="position:absolute; right: 10px; top: 15px; border:none; background:none; cursor:pointer; font-size: 1.1rem;">🗑️</button>
        `;
        container.appendChild(row);
    });

    document.getElementById('cartBadge').textContent = carrinho.reduce((a, b) => a + b.qtd, 0);
    document.getElementById('pvAtual').textContent = totalPV.toFixed(2);
    document.getElementById('resumoPV').textContent = totalPV.toFixed(2);
    document.getElementById('resumoSubtotal').textContent = fmt(totalReal);
    document.getElementById('resumoDesconto').textContent = faixa.label;
    document.getElementById('resumoTotal').textContent = fmt(totalReal);
}

function atualizarProgresso() {
    const totalPV = carrinho.reduce((acc, item) => acc + (item.pv * item.qtd), 0);
    let target = 500;
    let prox = "35%";
    
    if (totalPV >= 500 && totalPV < 1000) { target = 1000; prox = "42%"; }
    else if (totalPV >= 1000 && totalPV < 2000) { target = 2000; prox = "50%"; }
    else if (totalPV >= 2000) { target = 2000; prox = "MAX"; }

    const perc = Math.min((totalPV / target) * 100, 100);
    document.getElementById('progressBar').style.width = perc + "%";
    
    const texto = totalPV >= 2000 
        ? "Parabéns! Você atingiu o desconto máximo de 50%!" 
        : `Faltam ${(target - totalPV).toFixed(2)} PV para atingir ${prox}`;
    document.getElementById('proximoNivel').textContent = texto;
}

function fmt(v) {
    if (!v && v !== 0) return "R$ 0,00";
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
