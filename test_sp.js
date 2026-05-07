const SUPABASE_URL = 'https://jrbzvtbpzqjehakaqscz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JyHOGdaA9cNU9H_l4DErSA_lmTiupe5';

async function checarEstados() {
    console.log("Verificando se SP existe e quais estados têm dados...");
    try {
        const responseSP = await fetch(`${SUPABASE_URL}/rest/v1/produtos?estado=eq.SP&select=id&limit=1`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const dataSP = await responseSP.json();
        console.log(`Quantidade de produtos em SP: ${dataSP.length}`);

        const responseTotal = await fetch(`${SUPABASE_URL}/rest/v1/produtos?select=estado&limit=100`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const dataTotal = await responseTotal.json();
        const estadosEncontrados = [...new Set(dataTotal.map(i => i.estado))];
        console.log(`Estados encontrados nas primeiras 100 linhas: ${estadosEncontrados.join(", ")}`);
    } catch (e) {
        console.error("Erro:", e);
    }
}

checarEstados();
