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

// precosPorEstado agora deve ser tratado como [P.Consumidor, P.25, P.35, P.42, P.50] por produto
// Como os dados atuais têm 4 valores [25,35,42,50], usaremos pvc como Consumidor se não houver o 5º valor
var precosPorEstado = {
    AC: [376.50,334.10,304.42,270.51,376.50,334.10,304.42,270.51,189.04,167.75,152.85,135.82,189.04,167.75,152.85,135.82,189.04,167.75,152.85,135.82,189.04,167.75,152.85,135.82,189.04,167.75,152.85,135.82,189.04,167.75,152.85,135.82,189.04,167.75,152.85,135.82,189.04,167.75,152.85,135.82,189.04,167.75,152.85,135.82,189.04,167.75,152.85,135.82,189.04,167.75,152.85,135.82,641.58,569.34,518.76,460.97,609.71,541.05,493.00,438.07,641.58,569.34,518.76,460.97,641.58,569.34,518.76,460.97,197.75,178.91,165.72,150.65,67.52,60.86,56.20,50.88,81.39,72.22,65.81,58.48,67.18,61.46,57.45,52.87,67.18,61.46,57.45,52.87,150.86,136.19,125.92,114.19,150.86,136.19,125.92,114.19,150.86,136.19,125.92,114.19,169.28,150.22,136.88,121.63,185.24,164.38,149.78,133.09,92.32,86.17,81.87,76.94,92.32,86.17,81.87,76.94,143.95,129.66,119.65,108.21,265.02,235.17,214.28,190.41,235.72,209.17,190.59,169.36,189.04,167.75,152.85,135.82,122.84,109.01,99.32,88.26,185.24,164.38,149.78,133.09,310.59,275.62,251.13,223.15,280.43,248.85,226.75,201.48,550.70,519.80,498.17,473.45,68.19,64.05,61.15,57.84,148.86,132.10,120.37,106.96,89.35,79.29,72.25,64.20,63.18,57.61,53.71,49.25,167.97,149.05,135.82,120.69,875.70,777.09,708.06,629.17,169.28,150.22,136.88,121.63,189.75,168.39,153.43,136.34,198.86,181.89,170.01,156.44,280.43,248.85,226.75,201.48,545.18,483.79,440.81,391.70,198.86,181.89,170.01,156.44,139.43,125.88,116.40,105.56,379.50,341.58,315.04,284.71,189.04,167.75,152.85,135.82,205.70,187.76,175.20,160.85,148.86,132.10,120.37,106.96,148.86,132.10,120.37,106.96,280.43,248.85,226.75,201.48,210.65,186.93,170.33,151.35,88.83,78.83,71.82,63.82,11.91,10.89,10.18,9.36,50.86,46.52,43.48,40.01,107.90,97.34,89.94,81.49,166.81,149.97,138.18,124.70,109.99,99.17,91.59,82.93,235.10,211.47,194.92,176.02,52.61,48.12,44.97,41.37,17.84,16.32,15.26,14.05],
    AL: [366.96,334.94,312.52,286.90,366.96,334.94,312.52,286.90,184.25,168.17,156.92,144.05,184.25,168.17,156.92,144.05,184.25,168.17,156.92,144.05,184.25,168.17,156.92,144.05,184.25,168.17,156.92,144.05,184.25,168.17,156.92,144.05,184.25,168.17,156.92,144.05,184.25,168.17,156.92,144.05,184.25,168.17,156.92,144.05,184.25,168.17,156.92,144.05,184.25,168.17,156.92,144.05,625.33,570.75,532.55,488.90,594.26,542.40,506.10,464.61,625.33,570.75,532.55,488.90,625.33,570.75,532.55,488.90,196.76,182.22,172.04,160.41,65.81,60.78,57.26,53.24,80.97,73.91,68.96,63.31,65.48,61.16,58.13,54.67,65.48,61.16,58.13,54.67,150.09,138.78,130.87,121.82,150.09,138.78,130.87,121.82,150.09,138.78,130.87,121.82,162.89,148.49,138.41,126.90,178.25,162.49,151.46,138.86,91.86,87.11,83.79,80.00,91.86,87.11,83.79,80.00,138.52,127.72,120.16,111.52,258.30,235.76,219.98,201.95,229.74,209.70,195.66,179.62,184.25,168.17,156.92,144.05,118.20,107.75,100.44,92.08,178.25,162.49,151.46,138.86,298.87,272.45,253.95,232.82,269.84,245.99,229.29,210.21,536.75,513.41,497.07,478.39,66.46,63.34,61.15,58.65,145.09,132.43,123.57,113.44,87.09,79.49,74.17,68.09,60.79,56.58,53.64,50.27,161.63,147.34,137.34,125.91,842.64,768.15,716.01,656.42,162.89,148.49,138.41,126.90,184.95,168.81,157.51,144.60,184.95,168.81,157.51,144.60,191.35,178.53,169.56,159.31,269.84,245.99,229.29,210.21,524.60,478.22,445.76,408.67,191.35,178.53,169.56,159.31,135.89,125.66,118.50,110.31,377.58,348.34,327.87,304.47,184.25,168.17,156.92,144.05,200.49,186.94,177.45,166.61,145.09,132.43,123.57,113.44,145.09,132.43,123.57,113.44,269.84,245.99,229.29,210.21,209.59,191.30,178.49,163.86,88.38,80.67,75.27,69.10,11.46,10.69,10.15,9.53,52.63,49.35,47.05,44.43,106.30,98.69,93.36,87.27,164.33,152.20,143.71,134.00,108.35,100.56,95.10,88.87,231.60,214.58,202.67,189.05,50.63,47.23,44.85,42.14,18.46,17.31,16.51,15.59],
    SP: [342.65,310.62,288.20,262.58,342.65,310.62,288.20,262.58,172.04,155.96,144.71,131.84,172.04,155.96,144.71,131.84,172.04,155.96,144.71,131.84,172.04,155.96,144.71,131.84,172.04,155.96,144.71,131.84,172.04,155.96,144.71,131.84,172.04,155.96,144.71,131.84,172.04,155.96,144.71,131.84,172.04,155.96,144.71,131.84,172.04,155.96,144.71,131.84,172.04,155.96,144.71,131.84,583.89,529.32,491.12,447.46,554.88,503.02,466.72,425.23,583.89,529.32,491.12,447.46,583.89,529.32,491.12,447.46,183.75,169.21,159.04,147.41,61.45,56.42,52.90,48.88,75.61,68.54,63.60,57.94,61.14,56.82,53.79,50.33,61.14,56.82,53.79,50.33,140.15,128.84,120.92,111.87,140.15,128.84,120.92,111.87,140.15,128.84,120.92,111.87,154.06,139.66,129.58,118.06,168.59,152.83,141.80,129.19,85.78,81.03,77.71,73.91,85.78,81.03,77.71,73.91,131.01,120.21,112.65,104.01,241.19,218.64,202.86,184.83,214.52,194.47,180.44,164.40,172.04,155.96,144.71,131.84,111.79,101.34,94.03,85.67,168.59,152.83,141.80,129.19,282.66,256.24,237.75,216.61,255.21,231.36,214.66,195.58,501.18,477.84,461.50,442.83,62.06,58.93,56.74,54.24,135.48,122.82,113.95,103.82,81.32,73.72,68.40,62.32,57.50,53.29,50.34,46.97,152.86,138.58,128.58,117.15,796.96,722.47,670.33,610.74,154.06,139.66,129.58,118.06,172.69,156.55,145.25,132.34,180.98,168.16,159.19,148.94,255.21,231.36,214.66,195.58,496.15,449.78,417.32,380.22,180.98,168.16,159.19,148.94,126.89,116.66,109.49,101.31,352.59,323.34,302.87,279.48,172.04,155.96,144.71,131.84,187.20,173.65,164.16,153.32,135.48,122.82,113.95,103.82,135.48,122.82,113.95,103.82,255.21,231.36,214.66,195.58,195.70,177.41,164.61,149.97,82.53,74.81,69.41,63.24,11.24,10.47,9.94,9.32,51.23,47.95,45.65,43.03,103.47,95.87,90.54,84.45,159.96,147.83,139.34,129.64,105.48,97.68,92.22,85.99,225.45,208.43,196.52,182.90,47.88,44.48,42.11,39.39,17.97,16.82,16.02,15.10]
};

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
    Object.keys(precosPorEstado).sort().forEach(uf => {
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
 * Retorna o preço exato da tabela
 * @param {number} idxItem - Índice do item em itensComuns
 * @param {string} uf - UF atual
 * @param {number} idxFaixa - 0=Cons, 1=25%, 2=35%, 3=42%, 4=50%
 */
function getPrecoTabela(idxItem, uf, idxFaixa) {
    const precosUF = precosPorEstado[uf] || precosPorEstado["SP"];
    // Mapeamento: Cada produto tem 4 valores [25,35,42,50] na matriz atual.
    // O preço consumidor (idxFaixa 0) vem de pvc do item.
    if (idxFaixa === 0) return itensComuns[idxItem].pvc;
    
    // Na matriz atual de 4 valores: index 0 é 25%, 1 é 35%, etc.
    const baseIdx = idxItem * 4;
    return precosUF[baseIdx + (idxFaixa - 1)];
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
        
        // Valores extraídos diretamente da tabela
        const pCons = getPrecoTabela(index, ufAtual, 0);
        const p25 = getPrecoTabela(index, ufAtual, 1);
        const p35 = getPrecoTabela(index, ufAtual, 2);
        const p42 = getPrecoTabela(index, ufAtual, 3);
        const p50 = getPrecoTabela(index, ufAtual, 4);

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
        const valorUnitario = getPrecoTabela(item.idxOriginal, ufAtual, faixa.index);
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
