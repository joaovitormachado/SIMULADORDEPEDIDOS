// ==========================================
// SIMULADOR DE PEDIDOS HERBALIFE - SUPABASE
// Dados 100% da tabela "produtos" do Supabase
// SEM cálculos, SEM impostos, SEM conversões
// ==========================================

const SUPABASE_URL = 'https://jrbzvtbpzqjehakaqscz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JyHOGdaA9cNU9H_l4DErSA_lmTiupe5';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let ufAtual = "SP";
let carrinho = [];
let termoBusca = "";
let todosProdutos = []; // Cache de todos os produtos do Supabase
let produtosDoEstado = []; // Filtrado pelo estado selecionado

const FAIXAS = [
    { pv: 0,    label: "25%", key: "preco_25" },
    { pv: 500,  label: "35%", key: "preco_35" },
    { pv: 1000, label: "42%", key: "preco_42" },
    { pv: 2000, label: "50%", key: "preco_50" }
];

// ==========================================
// UTILITÁRIOS
// ==========================================

function fmt(v) {
    if (!v && v !== 0) return "R$ 0,00";
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    await carregarDadosSupabase();
    popularUFs();
    configurarEventos();
    filtrarProdutosPorEstado();
    renderProdutos();
    atualizarCarrinho();
});

async function carregarDadosSupabase() {
    try {
        console.log("🚀 Buscando produtos no Supabase...");
        const { data, error } = await supabase
            .from('produtos')
            .select('*');

        if (error) throw error;

        todosProdutos = data;
        console.log(`✅ ${todosProdutos.length} registros carregados do Supabase.`);

        // DEBUG/VALIDAÇÃO OBRIGATÓRIA: GO + SKU 534K
        validarPrecos("GO", "534K");
        validarPrecos("ES", "534K");

    } catch (err) {
        console.error("❌ Erro Supabase:", err.message);
        alert("Erro ao conectar com o banco de dados. Verifique sua conexão.");
    }
}

function validarPrecos(uf, sku) {
    const item = todosProdutos.find(i => i.estado === uf && i.sku === sku);
    if (item) {
        console.log(`🔍 VALIDAÇÃO ${uf} + SKU ${sku}:`, {
            "25%": item.preco_25,
            "35%": item.preco_35,
            "42%": item.preco_42,
            "50%": item.preco_50
        });
    } else {
        console.warn(`⚠️ Item ${sku} não encontrado para o estado ${uf} para validação.`);
    }
}

function popularUFs() {
    const select = document.getElementById('ufSelector');
    if (!select || todosProdutos.length === 0) return;

    const estados = [...new Set(todosProdutos.map(i => i.estado))].sort();

    select.innerHTML = ''; // Limpa antes de popular
    estados.forEach(uf => {
        const opt = document.createElement('option');
        opt.value = uf;
        opt.textContent = `Estado de Entrega: ${uf}`;
        if (uf === ufAtual) opt.selected = true;
        select.appendChild(opt);
    });
}

function filtrarProdutosPorEstado() {
    produtosDoEstado = todosProdutos.filter(i => i.estado === ufAtual);
    console.log(`📦 Estado ${ufAtual}: ${produtosDoEstado.length} produtos carregados.`);
}

function configurarEventos() {
    document.getElementById('ufSelector').addEventListener('change', (e) => {
        ufAtual = e.target.value;
        filtrarProdutosPorEstado();
        renderProdutos();
        atualizarCarrinho();
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
        if (confirm("Deseja limpar todo o seu pedido?")) {
            carrinho = [];
            atualizarCarrinho();
            renderProdutos();
        }
    });
}

function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    drawer.classList.toggle('active');
    overlay.style.display = drawer.classList.contains('active') ? 'block' : 'none';
}

function getFaixaAtiva() {
    const totalPV = carrinho.reduce((acc, item) => acc + (item.pv * item.qtd), 0);
    let faixa = FAIXAS[0];
    for (let f of FAIXAS) {
        if (totalPV >= f.pv) faixa = f;
    }
    return faixa;
}

// ==========================================
// RENDERIZAÇÃO
// ==========================================

function renderProdutos() {
    const container = document.getElementById('listaProdutos');
    container.innerHTML = '';

    const faixaAtiva = getFaixaAtiva();

    produtosDoEstado.forEach((item, index) => {
        if (termoBusca) {
            const termo = termoBusca.toLowerCase();
            if (!item.nome.toLowerCase().includes(termo) && !item.sku.toLowerCase().includes(termo)) {
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
            <span class="sku-tag">SKU: ${item.sku}</span>
            <strong class="product-name">${item.nome}</strong>
            <div class="product-pv">${Number(item.pv).toFixed(2)} PV</div>
            
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

    atualizarProgresso();
}

// Global para o onclick
window.adicionarAoCarrinho = function(itemId) {
    const itemOrig = todosProdutos.find(p => p.id === itemId);
    const inputQty = document.getElementById(`qty-${itemId}`);
    const qty = parseInt(inputQty.value) || 1;

    const indexExistente = carrinho.findIndex(c => c.id === itemId);

    if (indexExistente > -1) {
        carrinho[indexExistente].qtd += qty;
    } else {
        carrinho.push({
            id: itemId,
            sku: itemOrig.sku,
            nome: itemOrig.nome,
            pv: Number(itemOrig.pv),
            itemBanco: itemOrig,
            qtd: qty
        });
    }

    inputQty.value = 1;
    atualizarCarrinho();
    renderProdutos();
};

window.removerDoCarrinho = function(itemId) {
    carrinho = carrinho.filter(i => i.id !== itemId);
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
        
        // Sempre busca o preço do estado atual
        const itemNoEstado = todosProdutos.find(p => p.estado === ufAtual && p.sku === item.sku) || item.itemBanco;
        const valorUnitario = itemNoEstado[faixa.key];
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
