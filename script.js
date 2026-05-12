// ==========================================
// SIMULADOR DE PEDIDOS - SUPABASE PRO
// Fonte única: Tabela "produtos" no Supabase
// Lógica: Seleção Manual de Desconto
// ==========================================

const SUPABASE_URL = 'https://jrbzvtbpzqjehakaqscz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JyHOGdaA9cNU9H_l4DErSA_lmTiupe5';

const supabaseHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
};

// Estado Global
let ufAtual = "SP";
let carrinho = [];
let termoBusca = "";
let cacheEstados = {};
let estadosDisponiveis = [];

// Faixa selecionada (default 25%)
let faixaManual = { perc: 25, label: "25%", key: "preco_25" };
let isPrimeiroPedido = true;
let isSupervisorQualificado = false;
let faixaAntesPrimeiroPedido = { ...faixaManual }; // Para restaurar depois
let temSaldoMensal = false;
let saldoPontos = 0;

const FAIXAS = [
    { perc: 25, label: "25%", key: "preco_25" },
    { perc: 35, label: "35%", key: "preco_35" },
    { perc: 42, label: "42%", key: "preco_42" },
    { perc: 50, label: "50%", key: "preco_50" }
];

function getFaixaPorPV(pv, maxPerc = 50) {
    if (pv >= 2000 && maxPerc >= 50) return FAIXAS[3]; // 50%
    if (pv >= 1000 && maxPerc >= 42) return FAIXAS[2]; // 42%
    if (pv >= 500 && maxPerc >= 35) return FAIXAS[1];  // 35%
    return FAIXAS[0];                 // 25%
}

const ESTADOS_BR = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

function normalizarTexto(texto) {
    if (!texto) return "";
    return texto.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, "");
}

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar Login
    const logado = sessionStorage.getItem('simulador_login');
    if (logado === 'true') {
        exibirApp(true);
    } else {
        exibirApp(false);
    }

    estadosDisponiveis = ESTADOS_BR;
    popularUFs();
    if (!estadosDisponiveis.includes(ufAtual)) ufAtual = estadosDisponiveis[0];
    
    await inicializarSistema();
    configurarEventos();
});

async function inicializarSistema() {
    try {
        await carregarProdutosPorEstado(ufAtual);
        atualizarCarrinho();
    } catch (err) {
        exibirErro("Falha ao inicializar: " + err.message);
    } finally {
        mostrarLoading(false);
    }
}

async function carregarProdutosPorEstado(uf) {
    if (cacheEstados[uf]) {
        renderProdutos();
        return;
    }

    try {
        mostrarLoading(true);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/produtos?estado=eq.${uf}&select=*`, {
            headers: supabaseHeaders
        });

        if (!res.ok) throw new Error(`Erro na API: ${res.status}`);

        const data = await res.json();
        cacheEstados[uf] = data || [];
        renderProdutos();
    } catch (err) {
        exibirErro(`Erro ao carregar produtos de ${uf}: ` + err.message);
    } finally {
        mostrarLoading(false);
    }
}

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
    // Evento Troca de Estado
    document.getElementById('ufSelector').addEventListener('change', async (e) => {
        ufAtual = e.target.value;
        await carregarProdutosPorEstado(ufAtual);
        atualizarCarrinho();
    });

    // Evento Busca
    let timeoutBusca;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(timeoutBusca);
        timeoutBusca = setTimeout(() => {
            termoBusca = normalizarTexto(e.target.value);
            renderProdutos();
        }, 300);
    });

    // Faixas de Desconto
    document.querySelectorAll('.discount-badge').forEach(badge => {
        badge.addEventListener('click', () => {
            const perc = badge.getAttribute('data-faixa');
            selecionarFaixa(perc);
        });
    });


    // Eventos Carrinho
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

    // Eventos Toggle Primeiro Pedido
    document.getElementById('orderSim').addEventListener('click', () => alternarPrimeiroPedido(true));
    document.getElementById('orderNao').addEventListener('click', () => alternarPrimeiroPedido(false));

    // Eventos Toggle Supervisor
    const btnSupSim = document.getElementById('isSupervisorSim');
    const btnSupNao = document.getElementById('isSupervisorNao');
    if (btnSupSim) btnSupSim.addEventListener('click', () => alternarSupervisor(true));
    if (btnSupNao) btnSupNao.addEventListener('click', () => alternarSupervisor(false));

    // Eventos Saldo de Pontos
    document.getElementById('saldoSim').addEventListener('click', () => alternarSaldo(true));
    document.getElementById('saldoNao').addEventListener('click', () => alternarSaldo(false));
    document.getElementById('inputSaldo').addEventListener('input', (e) => {
        saldoPontos = parseFloat(e.target.value) || 0;
        atualizarCarrinho();
    });
}

function alternarPrimeiroPedido(ativo) {
    isPrimeiroPedido = ativo;
    
    const card = document.getElementById('primeiroPedidoCard');
    const btnSim = document.getElementById('orderSim');
    const btnNao = document.getElementById('orderNao');
    const badgeCont = document.getElementById('primeiroPedidoBadgeCont');

    const supervisorCard = document.getElementById('supervisorCard');
    const saldoCard = document.getElementById('saldoPontosCard');
    const campoSaldo = document.getElementById('campoSaldoCard');

    if (ativo) {
        btnSim.classList.add('active');
        btnNao.classList.remove('active');
        card.classList.add('active');
        badgeCont.innerHTML = `<span class="supervisor-badge">✅ Progressão automática ativa</span>`;
        
        // Esconder Supervisor e Saldos
        if (supervisorCard) supervisorCard.style.display = 'none';
        saldoCard.style.display = 'none';
        campoSaldo.style.display = 'none';

        atualizarCarrinho();
    } else {
        btnSim.classList.remove('active');
        btnNao.classList.add('active');
        card.classList.remove('active');
        badgeCont.innerHTML = '';
        
        // Mostrar Supervisor e Saldos
        if (supervisorCard) supervisorCard.style.display = 'flex';
        
        saldoCard.style.display = 'flex';
        if (temSaldoMensal) campoSaldo.style.display = 'block';

        atualizarCarrinho();
    }
}

function alternarSupervisor(ativo) {
    isSupervisorQualificado = ativo;
    const btnSim = document.getElementById('isSupervisorSim');
    const btnNao = document.getElementById('isSupervisorNao');
    const badgeCont = document.getElementById('supervisorBadgeCont');
    
    const saldoCard = document.getElementById('saldoPontosCard');
    const campoSaldo = document.getElementById('campoSaldoCard');

    if (ativo) {
        btnSim.classList.add('active');
        btnNao.classList.remove('active');
        badgeCont.innerHTML = `<span class="supervisor-badge">✅ Supervisor • 50% ativo</span>`;
    } else {
        btnSim.classList.remove('active');
        btnNao.classList.add('active');
        badgeCont.innerHTML = '';
    }
    atualizarCarrinho();
}

function alternarSaldo(ativo) {
    temSaldoMensal = ativo;
    const btnSim = document.getElementById('saldoSim');
    const btnNao = document.getElementById('saldoNao');
    const campoSaldo = document.getElementById('campoSaldoCard');
    const inputSaldo = document.getElementById('inputSaldo');

    if (ativo) {
        btnSim.classList.add('active');
        btnNao.classList.remove('active');
        campoSaldo.style.display = 'block';
    } else {
        btnSim.classList.remove('active');
        btnNao.classList.add('active');
        campoSaldo.style.display = 'none';
        saldoPontos = 0;
        inputSaldo.value = '';
    }
    atualizarCarrinho();
}

function selecionarFaixa(perc, forcar = false) {
    const isManualAllowed = !isPrimeiroPedido && !isSupervisorQualificado;
    if (!isManualAllowed && !forcar) {
        // Ignora o clique se a escolha manual não for permitida
        return;
    }
    
    // Check if trying to select 50% when not allowed
    if (perc.toString() === "50" && !isPrimeiroPedido && !isSupervisorQualificado && !forcar) {
        return;
    }

    // Atualizar UI das badges de desconto
    document.querySelectorAll('.discount-badge').forEach(badge => {
        const badgePerc = badge.getAttribute('data-faixa');
        badge.classList.toggle('active', badgePerc === perc.toString());
        
        if (isPrimeiroPedido) {
            badge.classList.toggle('disabled', badgePerc !== "25");
            badge.classList.toggle('locked', badgePerc === "25");
        } else {
            badge.classList.remove('disabled');
            badge.classList.remove('locked');
        }
    });

    // Atualizar estado global (Busca no array de FAIXAS pelo percentual)
    const faixaEncontrada = FAIXAS.find(f => f.perc.toString() === perc.toString());
    if (faixaEncontrada) {
        faixaManual = faixaEncontrada;
    }
    
    // Atualizar UI das badges de desconto manualmente selecionadas
    document.querySelectorAll('.discount-badge').forEach(badge => {
        const badgePerc = badge.getAttribute('data-faixa');
        badge.classList.toggle('active', badgePerc === perc.toString());
    });
    
    // Re-renderizar com os preços manuais (não chama atualizarCarrinho para não sobrescrever com o automático imediatamente, mas precisamos atualizar os preços do carrinho)
    // Na verdade, o mais fácil é recalcular o carrinho passando a faixa forçada
    renderProdutos();
    atualizarPrecosCarrinhoForcado(faixaEncontrada);
}

function atualizarPrecosCarrinhoForcado(faixa) {
    const container = document.getElementById('itensCarrinho');
    if (!container) return;
    container.innerHTML = '';
    
    let totalReal = 0;
    let totalPV = 0;
    const produtosEstado = cacheEstados[ufAtual];

    carrinho.forEach((item) => {
        const prodOriginal = produtosEstado.find(p => p.sku === item.sku);
        if (!prodOriginal) return;

        const precoUnitario = Number(prodOriginal[faixa.key]);
        const subtotalItem = precoUnitario * item.qtd;
        const pvItem = item.pv * item.qtd;
        
        totalReal += subtotalItem;
        totalPV += pvItem;

        const row = document.createElement('div');
        row.style.cssText = "padding: 1rem; padding-right: 40px; border-bottom: 1px solid var(--border); position: relative; word-break: break-word;";
        row.innerHTML = `
            <div style="font-weight: 700; font-size: 0.9rem; padding-right: 25px;">${item.nome}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin: 4px 0;">
                ${item.qtd} un x ${fmt(precoUnitario)} (${faixa.label}) | <strong>${pvItem.toFixed(2)} PV</strong>
            </div>
            <div style="font-weight: 800; color: var(--primary);">${fmt(subtotalItem)}</div>
            <button onclick="removerDoCarrinho(${item.id})" style="position:absolute; right: 10px; top: 15px; border:none; background:none; cursor:pointer; font-size: 1.1rem;">🗑️</button>
        `;
        container.appendChild(row);
    });

    const elSubtotal = document.getElementById('resumoSubtotal');
    const elDesconto = document.getElementById('resumoDesconto');
    const elTotal = document.getElementById('resumoTotal');

    if (elSubtotal) elSubtotal.textContent = fmt(totalReal);
    if (elDesconto) elDesconto.textContent = faixa.label;
    if (elTotal) elTotal.textContent = fmt(totalReal);
}

function renderProdutos() {
    const container = document.getElementById('listaProdutos');
    const produtos = cacheEstados[ufAtual] || [];
    container.innerHTML = '';

    produtos.forEach((item) => {
        const nome = item.nome || "Produto";
        const sku = item.sku || "N/A";

        if (termoBusca) {
            const nomeNorm = normalizarTexto(nome);
            const skuNorm = normalizarTexto(sku);
            if (!nomeNorm.includes(termoBusca) && !skuNorm.includes(termoBusca)) return;
        }

        const card = document.createElement('div');
        card.className = 'product-card';
        
        const is25 = (faixaManual.perc === 25 ? 'active' : '') + (isPrimeiroPedido ? ' locked' : '');
        const is35 = (faixaManual.perc === 35 ? 'active' : '') + (isPrimeiroPedido ? ' disabled' : '');
        const is42 = (faixaManual.perc === 42 ? 'active' : '') + (isPrimeiroPedido ? ' disabled' : '');
        const is50 = (faixaManual.perc === 50 ? 'active' : '') + (isPrimeiroPedido ? ' disabled' : '');

        card.innerHTML = `
            <span class="sku-tag">SKU: ${sku}</span>
            <strong class="product-name">${nome}</strong>
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
    const qty = parseInt(document.getElementById(`qty-${id}`).value) || 1;

    // No carrinho, não salvamos o preço fixo. 
    // O preço será determinado dinamicamente pelo PV total no atualizarCarrinho()
    const indexExistente = carrinho.findIndex(c => c.sku === itemBanco.sku);
    
    if (indexExistente > -1) {
        carrinho[indexExistente].qtd += qty;
    } else {
        carrinho.push({
            id: Date.now() + Math.random(),
            sku: itemBanco.sku,
            nome: itemBanco.nome,
            pv: Number(itemBanco.pv),
            qtd: qty,
            ipi: itemBanco.ipi || itemBanco.valor_ipi || 0,
            icms_st: itemBanco.icms_st || itemBanco.st_valor || 0
        });
    }
    
    document.getElementById(`qty-${id}`).value = 1; 
    atualizarCarrinho();
};

window.removerDoCarrinho = function(id) {
    carrinho = carrinho.filter(i => i.id !== id);
    atualizarCarrinho();
};

function atualizarCarrinho() {
    const container = document.getElementById('itensCarrinho');
    if (!container) return;
    container.innerHTML = '';

    // 1. Calcular PV acumulado de todos os itens para definir a faixa
    let pvAcumulado = 0;
    carrinho.forEach(item => pvAcumulado += item.pv * item.qtd);

    // 2. Determinar a faixa ativa
    let faixaAtiva;
    const isManualAllowed = !isPrimeiroPedido && !isSupervisorQualificado;

    if (isPrimeiroPedido) {
        // Primeiro pedido: progressão normal até 50%
        faixaAtiva = getFaixaPorPV(pvAcumulado, 50);
        faixaManual = faixaAtiva;
    } else if (isSupervisorQualificado) {
        // Supervisor: travado em 50%
        faixaAtiva = FAIXAS[3]; // 50%
        faixaManual = faixaAtiva;
    } else {
        // Não supervisor e não primeiro pedido (Manual)
        faixaAtiva = faixaManual;
        // Bloqueia 50% no manual se cair aqui indevidamente
        if (faixaAtiva.perc === 50) {
            faixaAtiva = FAIXAS[2]; // força 42%
            faixaManual = faixaAtiva;
        }
    }


    // 3. Sincronizar estado global e botões
    faixaManual = faixaAtiva;
    atualizarUIBotoesDesconto();

    // 4. Renderizar itens e calcular totais financeiros
    let totalReal = 0;
    let totalPV = 0;
    const produtosEstado = cacheEstados[ufAtual];

    carrinho.forEach((item) => {
        // Busca o preço ATUALIZADO para o produto na faixa determinada
        const prodOriginal = produtosEstado.find(p => p.sku === item.sku);
        if (!prodOriginal) return;

        const precoUnitario = Number(prodOriginal[faixaAtiva.key]);
        const subtotalItem = precoUnitario * item.qtd;
        const pvItem = item.pv * item.qtd;
        
        totalReal += subtotalItem;
        totalPV += pvItem;

        const row = document.createElement('div');
        row.style.cssText = "padding: 1rem; padding-right: 40px; border-bottom: 1px solid var(--border); position: relative; word-break: break-word;";
        row.innerHTML = `
            <div style="font-weight: 700; font-size: 0.9rem; padding-right: 25px;">${item.nome}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin: 4px 0;">
                ${item.qtd} un x ${fmt(precoUnitario)} (${faixaAtiva.label}) | <strong>${pvItem.toFixed(2)} PV</strong>
            </div>
            <div style="font-weight: 800; color: var(--primary);">${fmt(subtotalItem)}</div>
            <button onclick="removerDoCarrinho(${item.id})" style="position:absolute; right: 10px; top: 15px; border:none; background:none; cursor:pointer; font-size: 1.1rem;">🗑️</button>
        `;
        container.appendChild(row);
    });

    // 5. Atualização da Interface de Resumo
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = carrinho.reduce((a, b) => a + b.qtd, 0);

    const elSubtotal = document.getElementById('resumoSubtotal');
    const elPV = document.getElementById('resumoPV');
    const elDesconto = document.getElementById('resumoDesconto');
    const elTotal = document.getElementById('resumoTotal');

    if (elSubtotal) elSubtotal.textContent = fmt(totalReal);
    if (elPV) elPV.textContent = totalPV.toFixed(2);
    if (elDesconto) elDesconto.textContent = faixaAtiva.label;
    if (elTotal) elTotal.textContent = fmt(totalReal);

    // 7. Atualizar Previsão de Pontos
    const rowPrevisao = document.getElementById('rowPrevisaoTotal');
    const elSaldoInformado = document.getElementById('resumoSaldoInformado');
    const elPrevisaoTotal = document.getElementById('resumoPrevisao');

    if (temSaldoMensal) {
        rowPrevisao.style.display = 'block';
        elSaldoInformado.textContent = `${saldoPontos.toFixed(2)} PV`;
        elPrevisaoTotal.textContent = `${(saldoPontos + totalPV).toFixed(2)} PV`;
    } else {
        rowPrevisao.style.display = 'none';
    }

    // 8. Atualizar grade de produtos na tela principal
    renderProdutos();
}

function atualizarUIBotoesDesconto() {
    const isManualAllowed = !isPrimeiroPedido && !isSupervisorQualificado;
    const discountCard = document.querySelector('.discount-selector-card');
    
    if (discountCard) {
        if (!isManualAllowed) {
            discountCard.classList.add('auto-mode');
        } else {
            discountCard.classList.remove('auto-mode');
        }
    }

    const titleEl = document.getElementById('discountSectionTitle');
    if (titleEl) {
        if (!isPrimeiroPedido && !isSupervisorQualificado) {
            titleEl.style.display = 'block';
        } else {
            titleEl.style.display = 'none';
        }
    }

    const podeTer50 = isPrimeiroPedido || isSupervisorQualificado;

    document.querySelectorAll('.discount-badge').forEach(badge => {
        const f = badge.getAttribute('data-faixa');
        const fPerc = parseInt(f);
        const isThisActive = (fPerc === faixaManual.perc);
        
        badge.classList.toggle('active', isThisActive);
        
        let isDisabled = false;
        
        if (!isManualAllowed) {
            isDisabled = !isThisActive;
        }
        
        // Bloqueio extra para 50% se não pode ter 50%
        if (fPerc === 50 && !podeTer50) {
            isDisabled = true;
        }

        badge.classList.toggle('disabled', isDisabled);
    });
}

function fmt(v) {
    return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function mostrarLoading(show) {
    const container = document.getElementById('listaProdutos');
    if (show) {
        container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;"><div class="loading-spinner"></div></div>`;
    }
}

function exibirErro(msg) {
    const container = document.getElementById('listaProdutos');
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:red;">${msg}</div>`;
}

function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    drawer.classList.toggle('active');
    overlay.style.display = drawer.classList.contains('active') ? 'block' : 'none';
}

window.gerarPDF = async function() {
    if (carrinho.length === 0) {
        alert("Adicione produtos ao carrinho antes de gerar o PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.style.display = 'flex';
        loading.querySelector('span').textContent = 'Gerando arquivo PDF...';
    }

    const dataHora = new Date().toLocaleString('pt-BR');
    const totalPV = carrinho.reduce((sum, item) => sum + (item.pv * item.qtd), 0);
    const totalReal = carrinho.reduce((sum, item) => {
        const prodOriginal = cacheEstados[ufAtual].find(p => p.sku === item.sku);
        const preco = prodOriginal ? Number(prodOriginal[faixaManual.key]) : 0;
        return sum + (preco * item.qtd);
    }, 0);

    // Criar o container temporário para a captura
    let printArea = document.getElementById('printArea');
    if (!printArea) {
        printArea = document.createElement('div');
        printArea.id = 'printArea';
        document.body.appendChild(printArea);
    }
    
    // Estilo para garantir captura perfeita
    printArea.style.cssText = "position: absolute; left: 0; top: 0; width: 800px; background: white; padding: 40px; z-index: -9999; color: #1e293b; font-family: 'Inter', sans-serif; visibility: visible;";

    printArea.innerHTML = `
        <div style="border: 2px solid #78be20; padding: 30px; border-radius: 16px; background: #fff;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px;">
                <div>
                    <h1 style="color: #78be20; margin: 0; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Simulador de Pedidos</h1>
                    <p style="font-size: 12px; color: #64748b; margin-top: 5px; font-weight: 600;">Pedido de Consultor</p>
                </div>
                <div style="text-align: right; font-size: 12px; color: #64748b; line-height: 1.6;">
                    <div>Emitido em: <strong>${dataHora}</strong></div>
                    <div>Estado de Entrega: <strong>${ufAtual}</strong></div>
                </div>
            </div>

            <h2 style="font-size: 18px; margin-bottom: 20px; color: #1e293b; font-weight: 700; border-left: 5px solid #78be20; padding-left: 15px;">Detalhes do Pedido</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
                <thead>
                    <tr style="background: #f8fafc; text-align: left;">
                        <th style="padding: 12px; border-bottom: 2px solid #e2e8f0;">Produto</th>
                        <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: center;">Qtd</th>
                        <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: right;">Unitário</th>
                        <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${carrinho.map(item => {
                        const prodOriginal = cacheEstados[ufAtual].find(p => p.sku === item.sku);
                        const preco = prodOriginal ? Number(prodOriginal[faixaManual.key]) : 0;
                        return `
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">
                                    <div style="font-weight: 700; color: #1e293b;">${item.nome}</div>
                                    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">SKU: ${item.sku}</div>
                                </td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: 600;">${item.qtd}</td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right;">${fmt(preco)}</td>
                                <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #78be20;">${fmt(preco * item.qtd)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>

            <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
                <div style="width: 320px; background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
                        <span style="color: #64748b;">Subtotal:</span>
                        <span style="font-weight: 600; color: #1e293b;">${fmt(totalReal)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
                        <span style="color: #64748b;">Total PV:</span>
                        <strong style="color: #78be20;">${totalPV.toFixed(2)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-top: 1px dashed #cbd5e1; padding-top: 10px; font-size: 14px;">
                        <span style="color: #64748b;">Desconto Ativo:</span>
                        <span style="font-weight: 800; color: #1e293b;">${faixaManual.label}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 24px; font-weight: 800; color: #78be20; border-top: 3px solid #78be20; padding-top: 10px;">
                        <span>TOTAL:</span>
                        <span>${fmt(totalReal)}</span>
                    </div>
                </div>
            </div>

            ${temSaldoMensal ? `
            <div style="margin-top: -20px; margin-bottom: 40px; padding: 20px; background: #fff; border: 2px dashed #78be20; border-radius: 12px; text-align: center;">
                <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Seu saldo total previsto de pontos de volume após a efetivação deste pedido é de:</div>
                <div style="font-size: 24px; font-weight: 800; color: #78be20;">${(saldoPontos + totalPV).toFixed(2)} PV</div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 5px;">(Saldo Anterior: ${saldoPontos.toFixed(2)} PV + Pedido Atual: ${totalPV.toFixed(2)} PV)</div>
            </div>
            ` : ''}

            <div style="text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 20px;">
                Simulador de Pedidos | Este documento é um resumo informativo oficial do simulador.
            </div>
        </div>
    `;

    try {
        // Pequeno delay para garantir renderização do CSS no printArea
        await new Promise(r => setTimeout(r, 500));

        const canvas = await html2canvas(printArea, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`pedido-simulador-${ufAtual}-${Date.now()}.pdf`);

        if (loading) loading.style.display = 'none';
        printArea.innerHTML = '';
        printArea.style.visibility = 'hidden';
    } catch (err) {
        console.error("Erro ao gerar PDF:", err);
        alert("Ocorreu um erro ao gerar o arquivo PDF. Tente novamente.");
        if (loading) loading.style.display = 'none';
    }
};

window.gerarListaPrecosPDF = async function() {
    const produtos = cacheEstados[ufAtual] || [];
    if (produtos.length === 0) {
        alert("Ainda não há produtos carregados para este estado.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.style.display = 'flex';
        loading.querySelector('span').textContent = 'Gerando Lista de Preços...';
    }

    const dataHora = new Date().toLocaleString('pt-BR');

    let printArea = document.getElementById('printAreaLista');
    if (!printArea) {
        printArea = document.createElement('div');
        printArea.id = 'printAreaLista';
        document.body.appendChild(printArea);
    }
    
    printArea.style.cssText = "position: absolute; left: 0; top: 0; width: 1000px; background: white; padding: 40px; z-index: -9999; color: #1e293b; font-family: 'Inter', sans-serif; visibility: visible;";

    printArea.innerHTML = `
        <div style="border: 2px solid #78be20; padding: 30px; border-radius: 16px; background: #fff;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px;">
                <div>
                    <h1 style="color: #78be20; margin: 0; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Lista de Preços</h1>
                    <p style="font-size: 14px; color: #64748b; margin-top: 5px; font-weight: 600;">Simulador de Pedidos Herbalife</p>
                </div>
                <div style="text-align: right; font-size: 12px; color: #64748b; line-height: 1.6;">
                    <div>Emitido em: <strong>${dataHora}</strong></div>
                    <div>Estado Base: <strong>${ufAtual}</strong></div>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px;">
                <thead>
                    <tr style="background: #f8fafc; text-align: left;">
                        <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; width: 35%;">Produto</th>
                        <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; text-align: center;">SKU</th>
                        <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; text-align: center;">PV</th>
                        <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; text-align: right;">Consumidor</th>
                        <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; text-align: right; color: #64748b;">25%</th>
                        <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; text-align: right; color: #64748b;">35%</th>
                        <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; text-align: right; color: #64748b;">42%</th>
                        <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; text-align: right; color: #78be20;">50%</th>
                    </tr>
                </thead>
                <tbody>
                    ${produtos.map(item => `
                        <tr>
                            <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b;">${item.nome}</td>
                            <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #64748b; font-size: 11px;">${item.sku}</td>
                            <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: 700;">${Number(item.pv || 0).toFixed(2)}</td>
                            <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700;">${fmt(item.preco_consumidor)}</td>
                            <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; text-align: right;">${fmt(item.preco_25)}</td>
                            <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; text-align: right;">${fmt(item.preco_35)}</td>
                            <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; text-align: right;">${fmt(item.preco_42)}</td>
                            <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #78be20;">${fmt(item.preco_50)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                Tabela de Preços Oficial | Documento gerado automaticamente pelo Simulador de Pedidos.
            </div>
        </div>
    `;

    try {
        await new Promise(r => setTimeout(r, 500));

        const canvas = await html2canvas(printArea, {
            scale: 1.5,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`lista-precos-${ufAtual}-${Date.now()}.pdf`);

        if (loading) loading.style.display = 'none';
        printArea.innerHTML = '';
        printArea.style.visibility = 'hidden';
    } catch (err) {
        console.error("Erro ao gerar PDF da Lista:", err);
        alert("Ocorreu um erro ao gerar a Lista de Preços em PDF. Tente novamente.");
        if (loading) loading.style.display = 'none';
    }
};

// ==========================================
// LÓGICA DE LOGIN FAKE
// ==========================================

window.handleLogin = function(e) {
    e.preventDefault();
    
    const loading = document.getElementById('loadingOverlay');
    loading.style.display = 'flex';

    // Simular carregamento premium
    setTimeout(() => {
        sessionStorage.setItem('simulador_login', 'true');
        loading.style.display = 'none';
        exibirApp(true);
    }, 1500);
};

window.handleLogout = function() {
    if (confirm("Deseja realmente sair do sistema?")) {
        // 1. Limpar Caches Locais Completamente
        localStorage.clear();
        sessionStorage.clear();
        
        // 2. Resetar Estados Globais
        carrinho = [];
        faixaManual = FAIXAS[0];
        isSupervisorQualificado = false;
        
        // 3. Resetar Interface e Toggles (Isso já limpa o PV e zera as respostas)
        alternarSaldo(false);
        alternarSupervisor(false);
        alternarPrimeiroPedido(true);
        
        // 4. Limpar Buscas
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            renderProdutos(); // Remove os filtros de texto
        }
        
        // 5. Atualizar carrinho vazio e UI
        atualizarCarrinho();

        // 6. Voltar para a Tela de Login
        exibirApp(false);
    }
};

function exibirApp(mostrar) {
    const login = document.getElementById('loginScreen');
    const app = document.getElementById('appContainer');

    if (mostrar) {
        login.classList.add('hidden');
        app.style.display = 'block';
        // Remove display after animation
        setTimeout(() => {
            if (sessionStorage.getItem('simulador_login') === 'true') {
                login.style.display = 'none';
            }
        }, 500);
    } else {
        login.classList.remove('hidden');
        login.style.display = 'flex';
        app.style.display = 'none';
    }
}


