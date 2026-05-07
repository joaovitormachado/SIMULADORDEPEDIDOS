// ==========================================
// SIMULADOR DE PEDIDOS HERBALIFE
// Dados 100% do JSON oficial: tabelas_estados_herbalife.json
// SEM cálculos, SEM impostos, SEM conversões
// ==========================================

let ufAtual = "SP";
let carrinho = [];
let termoBusca = "";
let dadosJSON = []; // Array completo do JSON
let produtosDoEstado = []; // Filtrado pelo estado selecionado

const FAIXAS = [
    { pv: 0,    label: "25%", key: "25%" },
    { pv: 500,  label: "35%", key: "35%" },
    { pv: 1000, label: "42%", key: "42%" },
    { pv: 2000, label: "50%", key: "50%" }
];

// ==========================================
// UTILITÁRIOS
// ==========================================

/** Converte string BR "357,73" para número 357.73 */
function brToNum(str) {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    return parseFloat(String(str).replace(/\./g, '').replace(',', '.')) || 0;
}

/** Formata número para moeda BR */
function fmt(v) {
    if (!v && v !== 0) return "R$ 0,00";
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Extrai o SKU real do início do campo nome (ex: "534K Protein..." → "534K") */
function extrairSKU(nome) {
    if (!nome) return "";
    const match = nome.match(/^(\d{3,4}[A-Z]?)\s/);
    if (match) return match[1];
    // Caso especial: nome que já é o SKU (ex: "Fiber Concentrate Manga" com sku "498K")
    return "";
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    await carregarJSON();
    popularUFs();
    configurarEventos();
    filtrarProdutosPorEstado();
    renderProdutos();
    atualizarCarrinho();
});

async function carregarJSON() {
    try {
        const resp = await fetch('tabelas_estados_herbalife.json');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        dadosJSON = await resp.json();
        console.log(`✅ JSON carregado: ${dadosJSON.length} registros`);

        // DEBUG OBRIGATÓRIO: Validar GO + 534K
        const goItems = dadosJSON.filter(i => i.estado === "GO");
        const go534 = goItems.find(i => i.nome && i.nome.startsWith("534K"));
        if (go534) {
            console.log("🔍 VALIDAÇÃO GO + 534K:", {
                "25%": go534["25%"],
                "35%": go534["35%"],
                "42%": go534["42%"],
                "50%": go534["50%"]
            });
        }

        // DEBUG OBRIGATÓRIO: Validar ES + 534K
        const esItems = dadosJSON.filter(i => i.estado === "ES");
        const es534 = esItems.find(i => i.nome && i.nome.startsWith("534K"));
        if (es534) {
            console.log("🔍 VALIDAÇÃO ES + 534K:", {
                "25%": es534["25%"],
                "35%": es534["35%"],
                "42%": es534["42%"],
                "50%": es534["50%"]
            });
        }

    } catch (err) {
        console.error("❌ Erro ao carregar JSON:", err);
    }
}

function popularUFs() {
    const select = document.getElementById('ufSelector');
    if (!select || dadosJSON.length === 0) return;

    // Extrair estados únicos do JSON
    const estados = [...new Set(dadosJSON.map(i => i.estado))].sort();

    estados.forEach(uf => {
        const opt = document.createElement('option');
        opt.value = uf;
        opt.textContent = `Estado de Entrega: ${uf}`;
        if (uf === ufAtual) opt.selected = true;
        select.appendChild(opt);
    });

    // Se o estado padrão não existe no JSON, usar o primeiro
    if (!estados.includes(ufAtual) && estados.length > 0) {
        ufAtual = estados[0];
        select.value = ufAtual;
    }
}

function filtrarProdutosPorEstado() {
    // Filtra do JSON apenas os produtos do estado selecionado
    const todosDoEstado = dadosJSON.filter(i => i.estado === ufAtual);

    // Deduplica por nome (o JSON pode ter duplicatas de abas diferentes)
    // Usa o SKU real extraído do nome como chave
    const mapa = new Map();
    todosDoEstado.forEach(item => {
        const skuReal = extrairSKU(item.nome) || item.sku;
        const chave = skuReal + "_" + item.nome;
        if (!mapa.has(chave)) {
            mapa.set(chave, item);
        }
    });

    produtosDoEstado = Array.from(mapa.values());
    console.log(`📦 Estado ${ufAtual}: ${produtosDoEstado.length} produtos carregados`);
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

// ==========================================
// LÓGICA DE FAIXA DE DESCONTO
// ==========================================

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
        const skuReal = extrairSKU(item.nome) || item.sku;
        const nomeDisplay = item.nome.replace(/^\d{3,4}[A-Z]?\s+/, '');

        // Filtro de busca
        if (termoBusca) {
            const termo = termoBusca.toLowerCase();
            if (!item.nome.toLowerCase().includes(termo) && !skuReal.toLowerCase().includes(termo)) {
                return;
            }
        }

        // Ler preços EXATAMENTE do JSON, sem calcular nada
        const pCons = brToNum(item["preço_consumidor"]);
        const p25 = brToNum(item["25%"]);
        const p35 = brToNum(item["35%"]);
        const p42 = brToNum(item["42%"]);
        const p50 = brToNum(item["50%"]);
        const pv = brToNum(item.pv);

        const card = document.createElement('div');
        card.className = 'product-card';

        // Destacar a coluna ativa baseada na faixa de PV
        const is25 = faixaAtiva.key === "25%" ? 'active' : '';
        const is35 = faixaAtiva.key === "35%" ? 'active' : '';
        const is42 = faixaAtiva.key === "42%" ? 'active' : '';
        const is50 = faixaAtiva.key === "50%" ? 'active' : '';

        card.innerHTML = `
            <span class="sku-tag">SKU: ${skuReal}</span>
            <strong class="product-name">${nomeDisplay}</strong>
            <div class="product-pv">${pv.toFixed(2)} PV</div>
            
            <div class="price-table">
                <div class="price-col">
                    <span class="price-label">Cons.</span>
                    <span class="price-value">${fmt(pCons)}</span>
                </div>
                <div class="price-col ${is25}">
                    <span class="price-label">25%</span>
                    <span class="price-value">${fmt(p25)}</span>
                </div>
                <div class="price-col ${is35}">
                    <span class="price-label">35%</span>
                    <span class="price-value">${fmt(p35)}</span>
                </div>
                <div class="price-col ${is42}">
                    <span class="price-label">42%</span>
                    <span class="price-value">${fmt(p42)}</span>
                </div>
                <div class="price-col ${is50}">
                    <span class="price-label">50%</span>
                    <span class="price-value">${fmt(p50)}</span>
                </div>
            </div>

            <div class="card-actions">
                <input type="number" value="1" min="1" class="qty-input" id="qty-${index}">
                <button class="add-btn" onclick="adicionarAoCarrinho(${index})">Adicionar</button>
            </div>
        `;
        container.appendChild(card);
    });

    atualizarProgresso();
}

function adicionarAoCarrinho(idx) {
    const itemOrig = produtosDoEstado[idx];
    const inputQty = document.getElementById(`qty-${idx}`);
    const qty = parseInt(inputQty.value) || 1;

    const skuReal = extrairSKU(itemOrig.nome) || itemOrig.sku;
    const pv = brToNum(itemOrig.pv);

    const indexExistente = carrinho.findIndex(c => c.chave === (skuReal + "_" + itemOrig.nome));

    if (indexExistente > -1) {
        carrinho[indexExistente].qtd += qty;
    } else {
        carrinho.push({
            chave: skuReal + "_" + itemOrig.nome,
            sku: skuReal,
            nome: itemOrig.nome.replace(/^\d{3,4}[A-Z]?\s+/, ''),
            pv: pv,
            itemJSON: itemOrig, // Referência ao item original do JSON
            qtd: qty
        });
    }

    inputQty.value = 1;
    atualizarCarrinho();
    renderProdutos();
}

function removerDoCarrinho(chave) {
    carrinho = carrinho.filter(i => i.chave !== chave);
    atualizarCarrinho();
    renderProdutos();
}

function atualizarCarrinho() {
    const container = document.getElementById('itensCarrinho');
    container.innerHTML = '';

    let totalPV = 0;
    let totalReal = 0;

    const faixa = getFaixaAtiva();

    carrinho.forEach(item => {
        const vPV = item.pv * item.qtd;

        // Buscar preço da faixa ativa direto do JSON original
        // Precisamos re-buscar do estado atual caso tenha mudado
        const itemNoEstadoAtual = dadosJSON.find(d => 
            d.estado === ufAtual && d.nome === item.itemJSON.nome
        ) || item.itemJSON;

        const valorUnitario = brToNum(itemNoEstadoAtual[faixa.key]);
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
            <button onclick="removerDoCarrinho('${item.chave}')" style="position:absolute; right: 10px; top: 15px; border:none; background:none; cursor:pointer; font-size: 1.1rem;">🗑️</button>
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
