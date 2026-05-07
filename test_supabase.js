const SUPABASE_URL = 'https://jrbzvtbpzqjehakaqscz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JyHOGdaA9cNU9H_l4DErSA_lmTiupe5';

async function testarConexao() {
    console.log("Testando conexão REST...");
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/produtos?select=*&limit=1`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        
        const text = await response.text();
        console.log("STATUS:", response.status);
        console.log("RESPOSTA:", text);
    } catch (e) {
        console.error("Erro na requisição:", e);
    }
}

testarConexao();
