// 2_transform_silver.js (Corrigido com Filtro)

const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

// Caminho de entrada (o novo arquivo do Brasil)
const caminhoBronze = path.resolve(__dirname, 'dados', 'bronze', 'SINASC_2022_BRASIL_bruto.csv');
// Caminho de saída (o mesmo, pois só queremos os dados limpos do CE)
const caminhoSilver = path.resolve(__dirname, 'dados', 'silver', 'nascimentos_CE_2022_limpos.csv');

const dadosTransformados = [];

// --- Funções de Limpeza (iguais a antes) ---
function decodificarSexo(codigo) {
  if (codigo === '1') return 'Masculino';
  if (codigo === '2') return 'Feminino';
  return 'Ignorado';
}
function formatarData(dataStr) {
  if (!dataStr || dataStr.length !== 8 || dataStr === '00000000') return null;
  const dia = dataStr.substring(0, 2);
  const mes = dataStr.substring(2, 4);
  const ano = dataStr.substring(4, 8);
  return `${ano}-${mes}-${dia}`;
}
function paraNumero(valorStr) {
  const numero = parseInt(valorStr, 10);
  return isNaN(numero) ? null : numero;
}

console.log('--- INICIANDO CAMADA SILVER ---');
console.log('Lendo dados da Camada Bronze (Arquivo Brasil)...');

let linhasLidas = 0;

fs.createReadStream(caminhoBronze)
  .pipe(csv.parse({ headers: true, delimiter: ';' })) // O delimitador é vírgula
  .on('error', (error) => console.error('Erro ao ler CSV da Bronze:', error))
  .on('data', (linha) => {
    linhasLidas++;
    
    // ---- NOVO PASSO: FILTRAGEM ----
    // Vamos manter apenas os registros do Ceará (CE = 23)
    // Usamos a coluna CODMUNRES (Código do Município de Residência)
    if (!linha.CODMUNRES || !linha.CODMUNRES.startsWith('23')) {
      return; // Pula esta linha, pois não é do Ceará
    }
    
    // ---- TRANSFORMAÇÃO (igual a antes) ----
    const linhaSilver = {
      data_nascimento: formatarData(linha.DTNASC),
      codigo_municipio_residencia: linha.CODMUNRES,
      sexo: decodificarSexo(linha.SEXO),
      peso_gramas: paraNumero(linha.PESO),
      idade_mae: paraNumero(linha.IDADEMAE),
      apgar1: paraNumero(linha.APGAR1),
      apgar5: paraNumero(linha.APGAR5),
      tipo_parto: linha.TIPOPARTO,
    };
    
    dadosTransformados.push(linhaSilver);
  })
  .on('end', () => {
    console.log(`Total de ${linhasLidas} linhas lidas do arquivo Brasil.`);
    console.log(`${dadosTransformados.length} linhas filtradas (só Ceará).`);
    
    console.log('Salvando dados limpos na Camada Silver...');
    csv.writeToPath(caminhoSilver, dadosTransformados, { headers: true })
       .on('finish', () => {
         console.log(`Dados limpos salvos em: ${caminhoSilver}`);
         console.log('--- CAMADA SILVER CONCLUÍDA ---');
       })
       .on('error', (err) => console.error('Erro ao salvar CSV Silver:', err));
  });