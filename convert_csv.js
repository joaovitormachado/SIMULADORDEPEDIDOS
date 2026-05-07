const fs = require('fs');

const csvPath = 'tabelas_estados_herbalife.csv';
if (!fs.existsSync(csvPath)) {
    console.error("Arquivo CSV não encontrado!");
    process.exit(1);
}

const data = fs.readFileSync(csvPath, 'utf8');
const lines = data.split('\n');

const result = {};

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split por vírgula respeitando aspas
    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    
    if (parts.length < 9) continue;

    const uf = parts[0].replace(/"/g, '').trim();
    const nomeCompleto = parts[2].replace(/"/g, '').trim();
    
    // Extrair SKU do início do nome (ex: "534K Protein...")
    const skuMatch = nomeCompleto.match(/^([0-9]{3,4}[A-Z]{0,1})/);
    if (!skuMatch) continue;
    const sku = skuMatch[1];
    
    try {
        const cleanNum = (str) => {
            if (!str) return 0;
            // Remove aspas, remove pontos (milhar) e troca vírgula por ponto
            return parseFloat(str.replace(/"/g, '').replace(/\./g, '').replace(',', '.'));
        };

        const prices = [
            cleanNum(parts[4]), // Consumidor
            cleanNum(parts[5]), // 25%
            cleanNum(parts[6]), // 35%
            cleanNum(parts[7]), // 42%
            cleanNum(parts[8]), // 50%
        ];

        if (!result[uf]) result[uf] = {};
        result[uf][sku] = prices;
    } catch (e) {}
}

fs.writeFileSync('precos_json.txt', JSON.stringify(result, null, 2));
console.log("Conversão concluída!");
