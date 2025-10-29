const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '../dados');
const bronzeDir = path.resolve(baseDir, 'bronze');
const silverDir = path.resolve(baseDir, 'silver');
const goldDir = path.resolve(baseDir, 'gold');

console.log('--- PREPARANDO CAMADA BRONZE ---');

// Criar estrutura de pastas
fs.mkdirSync(bronzeDir, { recursive: true });
fs.mkdirSync(silverDir, { recursive: true });
fs.mkdirSync(goldDir, { recursive: true });

console.log('📁 Estrutura de pastas criada:');
console.log(`   ✅ ${bronzeDir}`);
console.log(`   ✅ ${silverDir}`);
console.log(`   ✅ ${goldDir}`);

// Verificar se o arquivo bronze existe
const arquivoBronze = path.resolve(bronzeDir, 'SINASC_2022_BRASIL_bruto.csv');

if (fs.existsSync(arquivoBronze)) {
    const stats = fs.statSync(arquivoBronze);
    console.log(`\n✅ Arquivo bronze encontrado: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log('🎯 Pronto para executar as transformações!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('   1. Execute: node scripts/2_transform_silver.js');
    console.log('   2. Execute: node scripts/3_aggregate_gold.js');
} else {
    console.log('\n❌ Arquivo bronze NÃO encontrado.');
    console.log('📋 COMO RESOLVER:');
    console.log('   1. Baixe o arquivo SINASC_2022_BRASIL_bruto.csv do DataSUS');
    console.log('   2. Salve na pasta: ' + bronzeDir);
    console.log('   3. Execute este script novamente');
}

console.log('\n--- PREPARAÇÃO BRONZE CONCLUÍDA ---');