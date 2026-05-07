// Reescreve precos.js sem BOM e com var
const fs = require('fs');
let content = fs.readFileSync('precos.js', 'utf8');
// Remove BOM se existir
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
    console.log("BOM removido!");
}
// Troca const por var
content = content.replace(/^const precosPorEstado/, 'var precosPorEstado');
fs.writeFileSync('precos.js', content, { encoding: 'utf8' });
console.log("precos.js corrigido com sucesso!");
