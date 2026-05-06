var DIST_NOME = '', DIST_ID = '', carrinho = {};
var FAIXAS = [
    { label: '25%', min: 0, target: 500 },
    { label: '35%', min: 500, target: 1000 },
    { label: '42%', min: 1000, target: 2000 },
    { label: '50%', min: 2000, target: null }
];

var PRODUTOS = {};

// === FUNÇÕES DE LÓGICA CORE ===

function entrar() {
    var n = document.getElementById('inp-name').value.trim();
    if (!n) { alert('Por favor, informe seu nome.'); return; }
    DIST_NOME = n;
    DIST_ID = document.getElementById('inp-id').value.trim();
    document.getElementById('header-distribuidor').textContent = DIST_NOME + (DIST_ID ? ' — ID: ' + DIST_ID : '');
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
}

function getFaixaIdx(pvTotal) {
    for (var i = FAIXAS.length - 1; i >= 0; i--) {
        if (pvTotal >= FAIXAS[i].min) return i;
    }
    return 0;
}

function getTotal() {
    var t = 0;
    Object.keys(carrinho).forEach(function (k) {
        var it = carrinho[k];
        t += it.preco * it.qty;
    });
    return t;
}

function getTotalPV() {
    var t = 0;
    Object.keys(carrinho).forEach(function (k) {
        var it = carrinho[k];
        t += (it.pvPerUnit || 0) * it.qty;
    });
    return t;
}

function onEstado() {
    var sel = document.getElementById('sel-estado');
    var busca = document.getElementById('inp-busca');
    var badge = document.getElementById('uf-badge');
    if (sel.value) {
        busca.disabled = false;
        carrinho = {};
        badge.textContent = '🏠 CD · ' + sel.selectedOptions[0].text;
        renderCarrinho();
    } else {
        busca.disabled = true;
        badge.textContent = '🏠 CD · Selecione o Estado';
    }
    renderProdutos();
}

function renderProdutos() {
    var estado = document.getElementById('sel-estado').value;
    var area = document.getElementById('produtos-area');
    if (!estado) {
        area.innerHTML = '<div class="empty-state"><div class="empty-icon">📍</div><p><strong>Selecione o estado de entrega</strong></p></div>';
        return;
    }

    var lista = PRODUTOS[estado] || [];
    var busca = document.getElementById('inp-busca').value.toLowerCase().trim();
    if (busca) {
        lista = lista.filter(function (p) {
            return p.nome.toLowerCase().includes(busca) || p.sku.toLowerCase().includes(busca);
        });
    }

    if (!lista.length) {
        area.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>Nenhum produto encontrado.</p></div>';
        return;
    }

    var totalPV = getTotalPV();
    var fi = getFaixaIdx(totalPV);
    var html = '<div class="products-grid">';

    lista.forEach(function (p) {
        var inCart = carrinho[p.sku] ? carrinho[p.sku].qty : 0;
        var hasPvc = p.pvc != null;
        
        html += '<div class="product-card">';
        html +=   '<div class="product-header">';
        html +=     '<div>';
        html +=       '<div class="product-name">' + p.nome + '</div>';
        html +=       '<div class="product-sku">SKU: ' + p.sku + '</div>';
        if (p.pv != null) {
            html +=   '<div class="pv-tag">PV: ' + p.pv.toFixed(2).replace('.', ',') + ' pts</div>';
        }
        html +=     '</div>';
        html +=   '</div>';
        
        html +=   '<div class="price-bands' + (hasPvc ? ' has-pvc' : '') + '">';
        
        if (hasPvc) {
            html += '<div class="price-band pvc">';
            html +=   '<div class="price-band-label">P. Consumidor</div>';
            html +=   '<div class="price-band-value">R$ ' + p.pvc.toFixed(2).replace('.', ',') + '</div>';
            html += '</div>';
        }

        FAIXAS.forEach(function (f, i) {
            html += '<div class="price-band' + (i === fi ? ' active' : '') + '">';
            html +=   '<div class="price-band-label">' + f.label + '</div>';
            html +=   '<div class="price-band-value">R$ ' + p.p[i].toFixed(2).replace('.', ',') + '</div>';
            html += '</div>';
        });
        
        html +=   '</div>';
        
        html +=   '<div class="cart-row">';
        html +=     '<div class="qty-control">';
        html +=       '<button class="qty-btn" onclick="addQty(\'' + p.sku + '\',' + fi + ',-1)">−</button>';
        html +=       '<input class="qty-input" type="number" min="0" value="' + inCart + '" onchange="setQty(\'' + p.sku + '\',' + fi + ',this.value)">';
        html +=       '<button class="qty-btn" onclick="addQty(\'' + p.sku + '\',' + fi + ',1)">+</button>';
        html +=     '</div>';
        html +=     '<span style="font-size:.78rem;color:#6b7280;margin-left:6px">× R$ ' + p.p[fi].toFixed(2).replace('.', ',') + '</span>';
        html +=   '</div>';
        html += '</div>';
    });

    html += '</div>';
    area.innerHTML = html;
}

function addQty(sku, fi, delta) {
    var cur = carrinho[sku] ? carrinho[sku].qty : 0;
    setQty(sku, fi, cur + delta);
}

function setQty(sku, fi, val) {
    var v = parseInt(val) || 0;
    if (v < 0) v = 0;
    
    var estado = document.getElementById('sel-estado').value;
    var prod = PRODUTOS[estado].find(function(x){return x.sku===sku});
    if(!prod) return;

    if (v === 0) {
        delete carrinho[sku];
    } else {
        carrinho[sku] = { 
            nome: prod.nome, 
            sku: sku, 
            qty: v, 
            pvPerUnit: prod.pv || 0,
            pricesByFaixa: prod.p 
        };
    }

    // Recalcular faixa global baseada no novo PV total
    var currentTotalPV = getTotalPV();
    var newFaixaIdx = getFaixaIdx(currentTotalPV);

    // Atualizar preços de TODOS os itens no carrinho para a nova faixa
    Object.keys(carrinho).forEach(function(k) {
        var it = carrinho[k];
        it.preco = it.pricesByFaixa[newFaixaIdx];
    });

    renderCarrinho();
    renderProdutos();
}

function renderCarrinho() {
    var keys = Object.keys(carrinho);
    var sec = document.getElementById('cart-section');
    var tbody = document.getElementById('cart-tbody');
    var pvTop = document.getElementById('pv-summary-top');
    
    var total = getTotal();
    var totalPV = getTotalPV();
    var fi = getFaixaIdx(totalPV);

    if (!keys.length) {
        sec.classList.remove('visible');
        pvTop.style.display = 'none';
        tbody.innerHTML = '';
        return;
    }

    sec.classList.add('visible');
    pvTop.style.display = 'block';

    // UI de Progresso
    var currentFaixa = FAIXAS[fi];
    var nextFaixa = FAIXAS[fi + 1];
    
    document.getElementById('pv-total-display').textContent = totalPV.toFixed(2) + ' PV';
    document.getElementById('discount-badge').textContent = 'Desconto: ' + currentFaixa.label;
    
    var progress = 0;
    if (nextFaixa) {
        document.getElementById('next-tier-container').style.display = 'block';
        document.getElementById('next-tier-label').textContent = nextFaixa.label;
        document.getElementById('next-tier-goal').textContent = nextFaixa.min + ' PV';
        var missing = nextFaixa.min - totalPV;
        document.getElementById('pv-missing-display').textContent = 'Faltam ' + missing.toFixed(2) + ' PV';
        
        // Calcular progresso entre a faixa atual e a próxima
        var range = nextFaixa.min - currentFaixa.min;
        var currentInRange = totalPV - currentFaixa.min;
        progress = (currentInRange / range) * 100;
        if (progress > 100) progress = 100;
        if (progress < 0) progress = 0;
    } else {
        document.getElementById('next-tier-container').style.display = 'none';
        progress = 100;
    }
    document.getElementById('pv-progress-bar').style.width = progress + '%';

    var rows = '';
    keys.forEach(function (k) {
        var it = carrinho[k];
        rows += '<tr><td>' + it.nome + '</td><td>' + it.sku + '</td><td>' + it.qty + '</td><td>R$ ' + it.preco.toFixed(2).replace('.', ',') + '</td><td>R$ ' + (it.preco * it.qty).toFixed(2).replace('.', ',') + '</td></tr>';
    });
    tbody.innerHTML = rows;
    document.getElementById('cart-total-val').textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
    document.getElementById('faixa-label').textContent = 'Subtotal do Pedido (com ' + currentFaixa.label + ' de desconto)';
}

function limparCarrinho() {
    carrinho = {};
    renderCarrinho();
    renderProdutos();
}

function fmt(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }

function gerarPDF() {
    var keys = Object.keys(carrinho);
    if (!keys.length) { alert('O carrinho está vazio.'); return; }
    var total = getTotal();
    var fi = getFaixaIdx(total);
    var nomeEstado = document.getElementById('sel-estado').selectedOptions[0].text;
    var linhas = keys.map(function (k) {
        var it = carrinho[k];
        return '<tr><td>' + it.nome + '</td><td>' + it.sku + '</td><td>' + it.qty + '</td><td>' + fmt(it.preco) + '</td><td>' + fmt(it.preco * it.qty) + '</td></tr>';
    }).join('');

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Pedido</title><style>body{font-family:Arial,sans-serif;padding:24px;font-size:13px}h2{color:#00a651}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{padding:8px;border:1px solid #ddd;text-align:left}th{background:#f0fdf4;color:#166534}.total{font-weight:700;font-size:1.1rem;margin-top:16px}.footer{margin-top:32px;font-size:11px;color:#888}</style></head><body>' +
        '<h2>Simulador de Pedidos Herbalife</h2>' +
        '<p><strong>Distribuidor:</strong> ' + DIST_NOME + (DIST_ID ? ' &nbsp;|&nbsp; <strong>ID:</strong> ' + DIST_ID : '') + '</p>' +
        '<p><strong>Estado de Entrega:</strong> ' + nomeEstado + ' &nbsp;|&nbsp; <strong>Faixa:</strong> ' + FAIXAS[fi].label + '</p>' +
        '<p><strong>Data:</strong> ' + new Date().toLocaleDateString('pt-BR') + '</p>' +
        '<table><thead><tr><th>Produto</th><th>SKU</th><th>Qtd</th><th>Preço Unit.</th><th>Total</th></tr></thead><tbody>' + linhas + '</tbody></table>' +
        '<p class="total">Total do Pedido: ' + fmt(total) + '</p>' +
        '<p class="footer">Este simulador é uma ferramenta de apoio. Confirme sempre os valores em myherbalife.com</p>' +
        '</body></html>';

    var w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(function() { w.print(); }, 500);
}

// === DADOS DE PRODUTOS ===

PRODUTOS.ES=[{sku:'534K',nome:'Protein Ice Cream Chocolate',pv:59.8,pvc:473,p:[354.58,314.65,286.7,254.75]},{sku:'535K',nome:'Protein Ice Cream Baunilha',pv:59.8,pvc:473,p:[354.58,314.65,286.7,254.75]},{sku:'447K',nome:'Shake Pistache',pv:25.75,pvc:246,p:[178.03,157.99,143.95,127.91]},{sku:'249K',nome:'Shake Frapê de Abacaxi',pv:25.75,pvc:246,p:[178.03,157.99,143.95,127.91]},{sku:'295K',nome:'Shake Cookies & Cream',pv:25.75,pvc:246,p:[178.03,157.99,143.95,127.91]},{sku:'023K',nome:'Shake Café Cremoso',pv:25.75,pvc:246,p:[178.03,157.99,143.95,127.91]},{sku:'0940',nome:'Shake Doce de Leite',pv:25.75,pvc:246,p:[178.03,157.99,143.95,127.91]},{sku:'3144',nome:'Shake Chocolate Sensation',pv:25.75,pvc:246,p:[178.03,157.99,143.95,127.91]},{sku:'0951',nome:'Shake Baunilha Cremoso',pv:25.75,pvc:246,p:[178.03,157.99,143.95,127.91]},{sku:'0953',nome:'Shake Morango Cremoso',pv:25.75,pvc:246,p:[178.03,157.99,143.95,127.91]},{sku:'326K',nome:'Shake Banana Caramelizada',pv:25.75,pvc:246,p:[178.03,157.99,143.95,127.91]},{sku:'439K',nome:'Shake Torta de Limão',pv:25.75,pvc:246,p:[178.03,157.99,143.95,127.91]},{sku:'0930',nome:'Shake Coco',pv:25.75,pvc:246,p:[178.03,157.99,143.95,127.91]},{sku:'2122',nome:'Shake Doce de Leite Econômica',pv:102,pvc:786,p:[604.22,536.18,488.55,434.12]},{sku:'387K',nome:'Shake Chocolate Sensation Econômica',pv:96.9,pvc:786,p:[574.2,509.55,464.29,412.56]},{sku:'2129',nome:'Shake Baunilha Cremoso Econômica',pv:102,pvc:786,p:[604.22,536.18,488.55,434.12]},{sku:'1446',nome:'Shake Morango Cremoso Econômica',pv:102,pvc:786,p:[604.22,536.18,488.55,434.12]},{sku:'1445',nome:'CR7 Drive',pv:26.75,pvc:243,p:[190.51,172.36,159.65,145.13]},{sku:'0948',nome:'Shake Sachê Baunilha (cx 7)',pv:9.55,pvc:87,p:[63.59,57.32,52.93,47.91]},{sku:'0020',nome:'Xtra-Cal',pv:11,pvc:109,p:[78.24,69.43,63.27,56.22]},{sku:'448K',nome:'Sopa Frango com Legumes',pv:9.35,pvc:87,p:[63.27,57.88,54.11,49.8]},{sku:'445K',nome:'Sopa Creme de Cebola',pv:9.35,pvc:87,p:[63.27,57.88,54.11,49.8]},{sku:'190K',nome:'Liftoff Amora Intenso',pv:20.2,pvc:196,p:[145.03,130.93,121.06,109.78]},{sku:'371K',nome:'Liftoff Abacaxi',pv:20.2,pvc:196,p:[145.03,130.93,121.06,109.78]},{sku:'317K',nome:'Liftoff Limão Siciliano',pv:20.2,pvc:196,p:[145.03,130.93,121.06,109.78]},{sku:'060K',nome:'Herbal Concentrate Original 51g',pv:21.45,pvc:222,p:[159.42,141.47,128.91,114.54]},{sku:'057K',nome:'N-R-G Original 100g',pv:24.45,pvc:252,p:[174.45,154.81,141.06,125.34]},{sku:'0031',nome:'Barras Proteína Limão (7un)',pv:10.4,pvc:110,p:[88.84,82.92,78.77,74.04]},{sku:'214K',nome:'Barras Proteína Vanilla Almond (7un)',pv:10.4,pvc:110,p:[88.84,82.92,78.77,74.04]},{sku:'325K',nome:'Creatina Premium 150g',pv:18.45,pvc:181,p:[135.57,122.11,112.68,101.91]},{sku:'318K',nome:'Shape Control',pv:35.35,pvc:338,p:[249.58,221.48,201.81,179.32]},{sku:'1923',nome:'Beauty Booster Frutas Vermelhas',pv:27.8,pvc:301,p:[221.99,196.99,179.49,159.5]},{sku:'395K',nome:'Nutri Soup Frango Com Legumes',pv:25.75,pvc:246,p:[178.03,157.99,143.95,127.91]},{sku:'058K',nome:'N-R-G Original 60g',pv:15.85,pvc:159,p:[115.68,102.66,93.54,83.12]},{sku:'056K',nome:'N-R-G Guaraná Tropical 100g',pv:24.45,pvc:252,p:[174.45,154.81,141.06,125.34]},{sku:'0246',nome:'Pó de Proteína 480g',pv:39.25,pvc:401,p:[292.51,259.57,236.51,210.16]},{sku:'062K',nome:'Herbal Concentrate Laranja 102g',pv:37.6,pvc:364,p:[264.1,234.36,213.54,189.75]},{sku:'306B',nome:'NutreV pack 10 unidades',pv:80.9,pvc:790,p:[518.63,489.53,469.16,445.88]},{sku:'1639',nome:'NutreV',pv:7.4,pvc:79,p:[64.22,60.32,57.59,54.47]},{sku:'497K',nome:'Fiber Concentrate Immune Limão/Mel',pv:20.3,pvc:206,p:[140.19,124.41,113.36,100.73]},{sku:'040K',nome:'Protein Crunch',pv:12.3,pvc:112,p:[84.15,74.67,68.04,60.46]},{sku:'146K',nome:'Glutamina',pv:9.1,pvc:80,p:[59.5,54.25,50.58,46.38]},{sku:'0242',nome:'Pó de Proteína 240g',pv:19.3,pvc:221,p:[158.18,140.37,127.91,113.66]},{sku:'004K',nome:'Herbal Concentrate Original Econômica',pv:138.05,pvc:1072,p:[824.7,731.84,666.83,592.53]},{sku:'063K',nome:'Herbal Concentrate Limão 51g',pv:21.45,pvc:222,p:[159.42,141.47,128.91,114.54]},{sku:'0927',nome:'Fiber Powder',pv:24.65,pvc:243,p:[178.7,158.58,144.5,128.4]},{sku:'191K',nome:'Whey Protein Baunilha',pv:24.55,pvc:256,p:[187.28,171.3,160.11,147.33]},{sku:'061K',nome:'Herbal Concentrate Canela 102g',pv:37.6,pvc:364,p:[264.1,234.36,213.54,189.75]},{sku:'003K',nome:'N-R-G Guaraná Tropical Econômica',pv:84.8,pvc:668,p:[513.43,455.61,415.14,368.89]},{sku:'147K',nome:'Whey Protein 3W',pv:24.55,pvc:256,p:[187.28,171.3,160.11,147.33]},{sku:'223K',nome:'OnActive Drink',pv:19.45,pvc:176,p:[131.31,118.55,109.62,99.41]},{sku:'1417',nome:'H24 Tri-Core Protein Chocolate',pv:46.8,pvc:467,p:[365.16,328.68,303.14,273.96]},{sku:'0931',nome:'Nutri Soup Creme Verde',pv:25.75,pvc:246,p:[178.03,157.99,143.95,127.91]},{sku:'148K',nome:'BCAA 5:1:1',pv:25.85,pvc:264,p:[193.72,176.82,165,151.48]},{sku:'496K',nome:'Fiber Concentrate Uva',pv:20.3,pvc:206,p:[140.19,124.41,113.36,100.73]},{sku:'498K',nome:'Fiber Concentrate Manga',pv:20.3,pvc:206,p:[140.19,124.41,113.36,100.73]},{sku:'059K',nome:'Herbal Concentrate Original 102g',pv:37.6,pvc:364,p:[264.1,234.36,213.54,189.75]},{sku:'0065',nome:'Herbalifeline',pv:27.7,pvc:281,p:[202.51,179.71,163.75,145.5]},{sku:'3122',nome:'Multivitaminas e Minerais',pv:10.75,pvc:122,p:[85.4,75.78,69.05,61.36]},{sku:'0411',nome:'Sabonete Barra Soft Green',pv:2.05,pvc:21,p:[11.22,10.26,9.58,8.82]},{sku:'0431',nome:'Creme Hidratante Soft Green',pv:8.2,pvc:82,p:[47.9,43.81,40.95,37.68]},{sku:'0766',nome:'Cleanser Facial Cítrico',pv:13.7,pvc:182,p:[106.09,95.7,88.43,80.11]},{sku:'0770',nome:'Gel Firmador Olhos',pv:21.7,pvc:282,p:[164,147.44,135.85,122.6]},{sku:'0773',nome:'Máscara Purificante Argila',pv:13.8,pvc:185,p:[108.14,97.5,90.05,81.53]},{sku:'0768',nome:'Sérum Facial Redutor Linhas',pv:30.9,pvc:397,p:[231.14,207.9,191.64,173.05]},{sku:'0408',nome:'Sabonete Líquido Mãos Soft Green',pv:7.2,pvc:71,p:[49.55,45.31,42.35,38.96]},{sku:'0563',nome:'Desodorante Soft Green',pv:2.7,pvc:30,p:[16.8,15.37,14.37,13.23]}];

PRODUTOS.SC=[{sku:'534K',nome:'Protein Ice Cream Chocolate',pv:59.8,pvc:473,p:[342.65,310.62,288.2,262.58]},{sku:'535K',nome:'Protein Ice Cream Baunilha',pv:59.8,pvc:473,p:[342.65,310.62,288.2,262.58]},{sku:'447K',nome:'Shake Pistache',pv:25.75,pvc:246,p:[172.04,155.96,144.71,131.84]},{sku:'249K',nome:'Shake Frapê de Abacaxi',pv:25.75,pvc:246,p:[172.04,155.96,144.71,131.84]},{sku:'295K',nome:'Shake Cookies & Cream',pv:25.75,pvc:246,p:[172.04,155.96,144.71,131.84]},{sku:'023K',nome:'Shake Café Cremoso',pv:25.75,pvc:246,p:[172.04,155.96,144.71,131.84]},{sku:'0940',nome:'Shake Doce de Leite',pv:25.75,pvc:246,p:[172.04,155.96,144.71,131.84]},{sku:'3144',nome:'Shake Chocolate Sensation',pv:25.75,pvc:246,p:[172.04,155.96,144.71,131.84]},{sku:'0951',nome:'Shake Baunilha Cremoso',pv:25.75,pvc:246,p:[172.04,155.96,144.71,131.84]},{sku:'0953',nome:'Shake Morango Cremoso',pv:25.75,pvc:246,p:[172.04,155.96,144.71,131.84]},{sku:'326K',nome:'Shake Banana Caramelizada',pv:25.75,pvc:246,p:[172.04,155.96,144.71,131.84]},{sku:'439K',nome:'Shake Torta de Limão',pv:25.75,pvc:246,p:[172.04,155.96,144.71,131.84]},{sku:'0930',nome:'Shake Coco',pv:25.75,pvc:246,p:[172.04,155.96,144.71,131.84]},{sku:'2122',nome:'Shake Doce de Leite Emb. Econômica',pv:102,pvc:786,p:[583.89,529.32,491.12,447.46]},{sku:'387K',nome:'Shake Chocolate Sensation Emb. Econômica',pv:96.9,pvc:786,p:[554.88,503.02,466.72,425.23]},{sku:'2129',nome:'Shake Baunilha Cremoso Emb. Econômica',pv:102,pvc:786,p:[583.89,529.32,491.12,447.46]},{sku:'1446',nome:'Shake Morango Cremoso Emb. Econômica',pv:102,pvc:786,p:[583.89,529.32,491.12,447.46]},{sku:'1445',nome:'CR7 Drive',pv:26.75,pvc:243,p:[183.75,169.21,159.04,147.41]},{sku:'0948',nome:'Shake Sachê Baunilha (cx 7 sachês)',pv:9.55,pvc:87,p:[61.45,56.42,52.9,48.88]},{sku:'0020',nome:'Xtra-Cal',pv:11,pvc:109,p:[75.61,68.54,63.6,57.94]},{sku:'448K',nome:'Sopa Instantânea Frango com Legumes',pv:9.35,pvc:87,p:[61.14,56.82,53.79,50.33]},{sku:'445K',nome:'Sopa Instantânea Creme de Cebola',pv:9.35,pvc:87,p:[61.14,56.82,53.79,50.33]},{sku:'190K',nome:'Liftoff Amora Intenso',pv:20.2,pvc:196,p:[140.15,128.84,120.92,111.87]},{sku:'371K',nome:'Liftoff Abacaxi',pv:20.2,pvc:196,p:[140.15,128.84,120.92,111.87]},{sku:'317K',nome:'Liftoff Limão Siciliano',pv:20.2,pvc:196,p:[140.15,128.84,120.92,111.87]},{sku:'060K',nome:'Herbal Concentrate Original 51g',pv:21.45,pvc:222,p:[154.06,139.66,129.58,118.06]},{sku:'057K',nome:'N-R-G Original 100g',pv:24.45,pvc:252,p:[168.59,152.83,141.8,129.19]},{sku:'0031',nome:'Barras Proteína Limão Citrus (7un)',pv:10.4,pvc:110,p:[85.78,81.03,77.71,73.91]},{sku:'214K',nome:'Barras Proteína Vanilla Almond (7un)',pv:10.4,pvc:110,p:[85.78,81.03,77.71,73.91]},{sku:'325K',nome:'Creatina Premium 150g',pv:18.45,pvc:181,p:[131.01,120.21,112.65,104.01]},{sku:'318K',nome:'Shape Control',pv:35.35,pvc:338,p:[241.19,218.64,202.86,184.83]},{sku:'1923',nome:'Beauty Booster Frutas Vermelhas',pv:27.8,pvc:301,p:[214.52,194.47,180.44,164.4]},{sku:'395K',nome:'Nutri Soup Frango Com Legumes',pv:25.75,pvc:246,p:[172.04,155.96,144.71,131.84]},{sku:'058K',nome:'N-R-G Original 60g',pv:15.85,pvc:159,p:[111.79,101.34,94.03,85.67]},{sku:'056K',nome:'N-R-G Guará Tropical 100g',pv:24.45,pvc:252,p:[168.59,152.83,141.8,129.19]},{sku:'0246',nome:'Pó de Proteína 480g',pv:39.25,pvc:401,p:[282.66,256.24,237.75,216.61]},{sku:'062K',nome:'Herbal Concentrate Laranja e Especiarias 102g',pv:37.6,pvc:364,p:[255.21,231.36,214.66,195.58]},{sku:'306B',nome:'NutreV pack 10 unidades',pv:80.9,pvc:790,p:[501.18,477.84,461.5,442.83]},{sku:'1639',nome:'NutreV',pv:7.4,pvc:79,p:[62.06,58.93,56.74,54.24]},{sku:'497K',nome:'Fiber Concentrate Immune Limão e Mel',pv:20.3,pvc:206,p:[135.48,122.82,113.95,103.82]},{sku:'040K',nome:'Protein Crunch',pv:12.3,pvc:112,p:[81.32,73.72,68.4,62.32]},{sku:'146K',nome:'Glutamina',pv:9.1,pvc:80,p:[57.5,53.29,50.34,46.97]},{sku:'0242',nome:'Pó de Proteína 240g',pv:19.3,pvc:221,p:[152.86,138.58,128.58,117.15]},{sku:'004K',nome:'Herbal Concentrate Original Emb. Econômica',pv:138.05,pvc:1072,p:[796.96,722.47,670.33,610.74]},{sku:'063K',nome:'Herbal Concentrate Limão 51g',pv:21.45,pvc:222,p:[154.06,139.66,129.58,118.06]},{sku:'0927',nome:'Fiber Powder',pv:24.65,pvc:243,p:[172.69,156.55,145.25,132.34]},{sku:'191K',nome:'Whey Protein Baunilha',pv:24.55,pvc:256,p:[180.98,168.16,159.19,148.94]},{sku:'061K',nome:'Herbal Concentrate Canela 102g',pv:37.6,pvc:364,p:[255.21,231.36,214.66,195.58]},{sku:'003K',nome:'N-R-G Guará Tropical Emb. Econômica',pv:84.8,pvc:668,p:[496.15,449.78,417.32,380.22]},{sku:'147K',nome:'Whey Protein 3W',pv:24.55,pvc:256,p:[180.98,168.16,159.19,148.94]},{sku:'223K',nome:'OnActive Drink',pv:19.45,pvc:176,p:[126.89,116.66,109.49,101.31]},{sku:'1417',nome:'H24 Tri-Core Protein Chocolate',pv:46.8,pvc:467,p:[352.59,323.34,302.87,279.48]},{sku:'0931',nome:'Nutri Soup Creme Verde',pv:25.75,pvc:246,p:[172.04,155.96,144.71,131.84]},{sku:'148K',nome:'BCAA 5:1:1',pv:25.85,pvc:264,p:[187.20,173.65,164.16,153.32]},{sku:'496K',nome:'Fiber Concentrate Uva',pv:20.3,pvc:206,p:[135.48,122.82,113.95,103.82]},{sku:'498K',nome:'Fiber Concentrate Manga',pv:20.3,pvc:206,p:[135.48,122.82,113.95,103.82]},{sku:'059K',nome:'Herbal Concentrate Original 102g',pv:37.6,pvc:364,p:[255.21,231.36,214.66,195.58]},{sku:'0065',nome:'Herbalifeline',pv:27.7,pvc:281,p:[195.7,177.41,164.61,149.97]},{sku:'3122',nome:'Multivitaminas e Minerais',pv:10.75,pvc:122,p:[82.53,74.81,69.41,63.24]},{sku:'0411',nome:'Sabonete Soft Green Chá Verde',pv:2.05,pvc:21,p:[10.84,10.07,9.53,8.91]},{sku:'0431',nome:'Creme Hidratante Soft Green Chá Verde',pv:8.2,pvc:82,p:[51.23,47.95,45.65,43.03]},{sku:'0766',nome:'Cleanser Facial Cítrico 150ml',pv:13.7,pvc:182,p:[103.47,95.87,90.54,84.45]},{sku:'0770',nome:'Gel Firmador para os Olhos 15ml',pv:21.7,pvc:282,p:[159.96,147.83,139.34,129.64]},{sku:'0773',nome:'Máscara Purificante de Argila 120ml',pv:13.8,pvc:185,p:[105.48,97.68,92.22,85.99]},{sku:'0768',nome:'Sérum Facial Redutor de Linhas 30ml',pv:30.9,pvc:397,p:[225.45,208.43,196.52,182.9]},{sku:'0408',nome:'Sabonete Líquido Soft Green Chá Verde',pv:7.2,pvc:71,p:[47.88,44.48,42.11,39.39]},{sku:'0563',nome:'Desodorante Soft Green Chá Verde',pv:2.7,pvc:30,p:[17.97,16.82,16.02,15.1]}];

// Adicione os outros estados (AC, AL, AM, AP, BA, CE, DF) seguindo o mesmo padrão de src/script.js
// Vou carregar os dados base de index.html para os estados restantes
var dadosBase = {
    GO:[{sku:'0141',nome:'F1 Baunilha 550g',p:[77.69,72.85,69.54,66.09]},{sku:'023K',nome:'F1 Baunilha 1.65kg',p:[199.9,187.46,178.98,170.08]}],
    MA:[{sku:'0141',nome:'F1 Baunilha 550g',p:[82.6,77.44,73.92,70.22]}],
    SP:[{sku:'0141',nome:'F1 Baunilha 550g',p:[65.88,61.81,59.03,56.11]}],
    RJ:[{sku:'0141',nome:'F1 Baunilha 550g',p:[72.36,67.86,64.77,61.58]}]
};
Object.assign(PRODUTOS, dadosBase);

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    var inp = document.getElementById('inp-name');
    if (inp) {
        inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') entrar(); });
        inp.focus();
    }
});
