// ==========================================
// 1. VARIÁVEIS GLOBAIS E ESTADO
// ==========================================
let ufAtual = "SP";
let carrinho = [];
let termoBusca = "";

const FAIXAS = [
    { pv: 0, label: "25%", index: 1 },
    { pv: 500, label: "35%", index: 2 },
    { pv: 1000, label: "42%", index: 3 },
    { pv: 2000, label: "50%", index: 4 }
];

// ==========================================
// 2. BASE DE DADOS (ITENS E PREÇOS)
// ==========================================
// itensComuns possui: sku, nome, pv, pvc (Preço Sugerido Consumidor)
var itensComuns = [
    {sku:'534K',nome:'Protein Ice Cream Chocolate',pv:59.8,pvc:473},
    {sku:'535K',nome:'Protein Ice Cream Baunilha',pv:59.8,pvc:473},
    {sku:'447K',nome:'Shake Pistache',pv:25.75,pvc:246},
    {sku:'249K',nome:'Shake Frapê de Abacaxi',pv:25.75,pvc:246},
    {sku:'295K',nome:'Shake Cookies & Cream',pv:25.75,pvc:246},
    {sku:'023K',nome:'Shake Café Cremoso',pv:25.75,pvc:246},
    {sku:'0940',nome:'Shake Doce de Leite',pv:25.75,pvc:246},
    {sku:'3144',nome:'Shake Chocolate Sensation',pv:25.75,pvc:246},
    {sku:'0951',nome:'Shake Baunilha Cremoso',pv:25.75,pvc:246},
    {sku:'0953',nome:'Shake Morango Cremoso',pv:25.75,pvc:246},
    {sku:'326K',nome:'Shake Banana Caramelizada',pv:25.75,pvc:246},
    {sku:'439K',nome:'Shake Torta de Limão',pv:25.75,pvc:246},
    {sku:'0930',nome:'Shake Coco',pv:25.75,pvc:246},
    {sku:'2122',nome:'Shake Doce de Leite Econ.',pv:102,pvc:786},
    {sku:'387K',nome:'Shake Choc. Sensation Econ.',pv:96.9,pvc:786},
    {sku:'2129',nome:'Shake Baunilha Econ.',pv:102,pvc:786},
    {sku:'1446',nome:'Shake Morango Econ.',pv:102,pvc:786},
    {sku:'1445',nome:'CR7 Drive',pv:26.75,pvc:243},
    {sku:'0948',nome:'Shake Sachê Baunilha',pv:9.55,pvc:87},
    {sku:'0020',nome:'Xtra-Cal',pv:11,pvc:109},
    {sku:'448K',nome:'Sopa Frango com Legumes',pv:9.35,pvc:87},
    {sku:'445K',nome:'Sopa Creme de Cebola',pv:9.35,pvc:87},
    {sku:'190K',nome:'Liftoff Amora Intenso',pv:20.2,pvc:196},
    {sku:'371K',nome:'Liftoff Abacaxi',pv:20.2,pvc:196},
    {sku:'317K',nome:'Liftoff Limão Siciliano',pv:20.2,pvc:196},
    {sku:'060K',nome:'Herbal Concentrate 51g',pv:21.45,pvc:222},
    {sku:'057K',nome:'N-R-G Original 100g',pv:24.45,pvc:252},
    {sku:'0031',nome:'Barras Limão Citrus',pv:10.4,pvc:110},
    {sku:'214K',nome:'Barras Vanilla Almond',pv:10.4,pvc:110},
    {sku:'325K',nome:'Creatina Premium 150g',pv:18.45,pvc:181},
    {sku:'318K',nome:'Shape Control',pv:35.35,pvc:338},
    {sku:'1923',nome:'Beauty Booster',pv:27.8,pvc:301},
    {sku:'395K',nome:'Nutri Soup Frango',pv:25.75,pvc:246},
    {sku:'058K',nome:'N-R-G Original 60g',pv:15.85,pvc:159},
    {sku:'056K',nome:'N-R-G Guaraná 100g',pv:24.45,pvc:252},
    {sku:'0246',nome:'Pó de Proteína 480g',pv:39.25,pvc:401},
    {sku:'062K',nome:'Herbal Conc. Laranja 102g',pv:37.6,pvc:364},
    {sku:'306B',nome:'NutreV pack 10 unidades',pv:80.9,pvc:790},
    {sku:'1639',nome:'NutreV',pv:7.4,pvc:79},
    {sku:'497K',nome:'Fiber Conc. Immune',pv:20.3,pvc:206},
    {sku:'040K',nome:'Protein Crunch',pv:12.3,pvc:112},
    {sku:'146K',nome:'Glutamina',pv:9.1,pvc:80},
    {sku:'0242',nome:'Pó de Proteína 240g',pv:19.3,pvc:221},
    {sku:'004K',nome:'Herbal Conc. Original Econ.',pv:138.05,pvc:1072},
    {sku:'063K',nome:'Herbal Concentrate Limão 51g',pv:21.45,pvc:222},
    {sku:'0927',nome:'Fiber Powder',pv:24.65,pvc:243},
    {sku:'191K',nome:'Whey Protein Baunilha',pv:24.55,pvc:256},
    {sku:'061K',nome:'Herbal Concentrate Canela 102g',pv:37.6,pvc:364},
    {sku:'003K',nome:'N-R-G Guaraná Econ.',pv:84.8,pvc:668},
    {sku:'147K',nome:'Whey Protein 3W',pv:24.55,pvc:256},
    {sku:'223K',nome:'OnActive Drink',pv:19.45,pvc:176},
    {sku:'1417',nome:'H24 Tri-Core Protein',pv:46.8,pvc:467},
    {sku:'0931',nome:'Nutri Soup Creme Verde',pv:25.75,pvc:246},
    {sku:'148K',nome:'BCAA 5:1:1',pv:25.85,pvc:264},
    {sku:'496K',nome:'Fiber Concentrate Uva',pv:20.3,pvc:206},
    {sku:'498K',nome:'Fiber Concentrate Manga',pv:20.3,pvc:206},
    {sku:'059K',nome:'Herbal Conc. Original 102g',pv:37.6,pvc:364},
    {sku:'0065',nome:'Herbalifeline',pv:27.7,pvc:281},
    {sku:'3122',nome:'Multivitaminas e Minerais',pv:10.75,pvc:122},
    {sku:'0411',nome:'Sabonete Barra',pv:2.05,pvc:21},
    {sku:'0431',nome:'Creme Hidratante',pv:8.2,pvc:82},
    {sku:'0766',nome:'Cleanser Facial',pv:13.7,pvc:182},
    {sku:'0770',nome:'Gel Firmador Olhos',pv:21.7,pvc:282},
    {sku:'0773',nome:'Máscara Purificante Argila',pv:13.8,pvc:185},
    {sku:'0768',nome:'Sérum Facial',pv:30.9,pvc:397},
    {sku:'0408',nome:'Sabonete Líquido Mãos',pv:7.2,pvc:71},
    {sku:'0563',nome:'Desodorante Soft Green',pv:2.7,pvc:30}
];

// precosPorEstado agora vem do arquivo externo precos.js carregado no HTML

// ==========================================
// 3. LÓGICA DE INICIALIZAÇÃO E EVENTOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    popularUFs();
    configurarEventos();
    renderProdutos();
    atualizarCarrinho();
});

function popularUFs() {
    const select = document.getElementById('ufSelector');
    if (!select) return;
    
    // Lista de estados disponíveis na nova planilha
    const estados = Object.keys(window.precosPorEstado || {}).sort();
    
    if (estados.length === 0) {
        console.error("Erro: Base de preços não carregada.");
        return;
    }

    estados.forEach(uf => {
        const opt = document.createElement('option');
        opt.value = uf;
        opt.textContent = `Estado de Entrega: ${uf}`;
        if(uf === "SP") opt.selected = true;
        select.appendChild(opt);
    });
}

function configurarEventos() {
    // UF Selector
    document.getElementById('ufSelector').addEventListener('change', (e) => {
        ufAtual = e.target.value;
        renderProdutos();
        atualizarCarrinho();
    });

    // Search Bar com Debounce
    let timeoutBusca;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(timeoutBusca);
        timeoutBusca = setTimeout(() => {
            termoBusca = e.target.value.toLowerCase();
            renderProdutos();
        }, 300);
    });

    // Cart Drawer Controls
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

function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    drawer.classList.toggle('active');
    overlay.style.display = drawer.classList.contains('active') ? 'block' : 'none';
}

// ==========================================
// 4. LÓGICA DE CÁLCULO E RENDERIZAÇÃO
// ==========================================

function getFaixaAtiva() {
    const totalPV = carrinho.reduce((acc, item) => acc + (item.pv * item.qtd), 0);
    let faixa = FAIXAS[0];
    for (let f of FAIXAS) {
        if (totalPV >= f.pv) faixa = f;
    }
    return faixa;
}

/**
 * Retorna o preço exato da tabela via SKU
 * @param {string} sku - SKU do produto
 * @param {string} uf - UF atual
 * @param {number} idxFaixa - 0=Cons, 1=25%, 2=35%, 3=42%, 4=50%
 */
function getPrecoTabela(sku, uf, idxFaixa) {
    if (!window.precosPorEstado || !window.precosPorEstado[uf]) return 0;
    const precosItem = window.precosPorEstado[uf][sku];
    if (!precosItem) return 0;
    return precosItem[idxFaixa] || 0;
}

function renderProdutos() {
    const container = document.getElementById('listaProdutos');
    container.innerHTML = '';
    
    const faixaAtiva = getFaixaAtiva();

    itensComuns.forEach((item, index) => {
        // Filtro de busca
        if (termoBusca && !item.nome.toLowerCase().includes(termoBusca) && !item.sku.toLowerCase().includes(termoBusca)) {
            return;
        }

        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Valores extraídos diretamente da tabela por SKU
        const pCons = getPrecoTabela(item.sku, ufAtual, 0);
        const p25 = getPrecoTabela(item.sku, ufAtual, 1);
        const p35 = getPrecoTabela(item.sku, ufAtual, 2);
        const p42 = getPrecoTabela(item.sku, ufAtual, 3);
        const p50 = getPrecoTabela(item.sku, ufAtual, 4);

        // Só mostra o card se houver preço para o estado (evita itens inexistentes na planilha da UF)
        if (pCons === 0) return;

        card.innerHTML = `
            <span class="sku-tag">SKU: ${item.sku}</span>
            <strong class="product-name">${item.nome}</strong>
            <div class="product-pv">${item.pv.toFixed(2)} PV</div>
            
            <div class="price-table">
                <div class="price-col">
                    <span class="price-label">Cons.</span>
                    <span class="price-value">${fmt(pCons)}</span>
                </div>
                <div class="price-col ${faixaAtiva.index === 1 ? 'active' : ''}">
                    <span class="price-label">25%</span>
                    <span class="price-value">${fmt(p25)}</span>
                </div>
                <div class="price-col ${faixaAtiva.index === 2 ? 'active' : ''}">
                    <span class="price-label">35%</span>
                    <span class="price-value">${fmt(p35)}</span>
                </div>
                <div class="price-col ${faixaAtiva.index === 3 ? 'active' : ''}">
                    <span class="price-label">42%</span>
                    <span class="price-value">${fmt(p42)}</span>
                </div>
                <div class="price-col ${faixaAtiva.index === 4 ? 'active' : ''}">
                    <span class="price-label">50%</span>
                    <span class="price-value">${fmt(p50)}</span>
                </div>
            </div>

            <div class="card-actions">
                <input type="number" value="1" min="1" class="qty-input" id="qty-${item.sku}">
                <button class="add-btn" onclick="adicionarAoCarrinho(${index})">Adicionar</button>
            </div>
        `;
        container.appendChild(card);
    });

    atualizarProgresso();
}

function adicionarAoCarrinho(idx) {
    const itemOrig = itensComuns[idx];
    const inputQty = document.getElementById(`qty-${itemOrig.sku}`);
    const qty = parseInt(inputQty.value) || 1;
    
    const indexExistente = carrinho.findIndex(c => c.sku === itemOrig.sku);
    
    if (indexExistente > -1) {
        carrinho[indexExistente].qtd += qty;
    } else {
        carrinho.push({
            sku: itemOrig.sku,
            nome: itemOrig.nome,
            pv: itemOrig.pv,
            idxOriginal: idx,
            qtd: qty
        });
    }
    
    inputQty.value = 1; 
    atualizarCarrinho();
    renderProdutos(); 
}

function removerDoCarrinho(sku) {
    carrinho = carrinho.filter(i => i.sku !== sku);
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
        const valorUnitario = getPrecoTabela(item.sku, ufAtual, faixa.index);
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
            <button onclick="removerDoCarrinho('${item.sku}')" style="position:absolute; right: 10px; top: 15px; border:none; background:none; cursor:pointer; font-size: 1.1rem;">🗑️</button>
        `;
        container.appendChild(row);
    });

    // Atualizar UI
    document.getElementById('cartBadge').textContent = carrinho.reduce((a, b) => a + b.qtd, 0);
    document.getElementById('pvAtual').textContent = totalPV.toFixed(2);
    document.getElementById('resumoPV').textContent = totalPV.toFixed(2);
    document.getElementById('resumoSubtotal').textContent = fmt(totalReal); // Agora o subtotal é a soma direta da tabela
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
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
