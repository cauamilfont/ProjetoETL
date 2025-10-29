const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const caminhoBronze = path.resolve(__dirname, '../dados/bronze/SINASC_2022_BRASIL_bruto.csv');
const caminhoSilver = path.resolve(__dirname, '../dados/silver/nascimentos_2022_limpos.csv');

const dadosTransformados = [];

// --- Funções de Limpeza Aprimoradas ---
function decodificarSexo(codigo) {
  const sexos = { '1': 'Masculino', '2': 'Feminino' };
  return sexos[codigo] || 'Ignorado';
}

function decodificarEscolaridade(codigo) {
  const escolaridade = {
    '0': 'Nenhuma', '1': 'Fundamental I', '2': 'Fundamental II',
    '3': 'Médio', '4': 'Superior', '5': 'Pós-graduação'
  };
  return escolaridade[codigo] || 'Ignorado';
}

function decodificarEstadoCivil(codigo) {
  const estadoCivil = {
    '1': 'Solteira', '2': 'Casada', '3': 'Viúva',
    '4': 'Separada', '5': 'União consensual'
  };
  return estadoCivil[codigo] || 'Ignorado';
}

function decodificarParto(codigo) {
  const partos = { '1': 'Vaginal', '2': 'Cesáreo' };
  return partos[codigo] || 'Ignorado';
}

function decodificarRacaCor(codigo) {
  const racas = {
    '1': 'Branca', '2': 'Preta', '3': 'Amarela',
    '4': 'Parda', '5': 'Indígena'
  };
  return racas[codigo] || 'Ignorado';
}

function formatarData(dataStr) {
  if (!dataStr || dataStr.length !== 8 || dataStr === '00000000') return null;
  const dia = dataStr.substring(0, 2);
  const mes = dataStr.substring(2, 4);
  const ano = dataStr.substring(4, 8);
  return `${ano}-${mes}-${dia}`;
}

function paraNumero(valorStr) {
  if (!valorStr || valorStr.trim() === '') return null;
  const numero = parseInt(valorStr, 10);
  return isNaN(numero) ? null : numero;
}

function classificarPeso(peso) {
  if (!peso) return 'DESCONHECIDO';
  if (peso < 2500) return 'BAIXO_PESO';
  if (peso >= 2500 && peso <= 4000) return 'PESO_NORMAL';
  return 'ALTO_PESO';
}

function classificarIdadeMae(idade) {
  if (!idade) return 'DESCONHECIDO';
  if (idade < 20) return 'ADOLESCENTE';
  if (idade >= 20 && idade <= 34) return 'ADULTO_JOVEM';
  if (idade >= 35 && idade <= 39) return 'ADULTO';
  return 'IDOSA';
}

console.log('--- INICIANDO CAMADA SILVER ---');
console.log('Lendo dados da Camada Bronze...');

// Criar pasta silver se não existir
fs.mkdirSync(path.dirname(caminhoSilver), { recursive: true });

let linhasLidas = 0;
let linhasProcessadas = 0;

fs.createReadStream(caminhoBronze)
  .pipe(csv.parse({ headers: true, delimiter: ';' }))
  .on('error', (error) => console.error('Erro ao ler CSV da Bronze:', error))
  .on('data', (linha) => {
    linhasLidas++;
    
    if (linhasLidas % 100000 === 0) {
      console.log(`📖 ${linhasLidas.toLocaleString()} linhas lidas...`);
    }

    // Transformação completa dos dados
    const linhaSilver = {
      // Identificação
      codigo_municipio_nascimento: linha.CODMUNNASC,
      codigo_municipio_residencia: linha.CODMUNRES,
      uf_residencia: linha.CODMUNRES ? linha.CODMUNRES.substring(0, 2) : null,
      
      // Data e hora
      data_nascimento: formatarData(linha.DTNASC),
      hora_nascimento: linha.HORANASC,
      
      // Características do bebê
      sexo: decodificarSexo(linha.SEXO),
      peso_gramas: paraNumero(linha.PESO),
      classificacao_peso: classificarPeso(paraNumero(linha.PESO)),
      apgar1: paraNumero(linha.APGAR1),
      apgar5: paraNumero(linha.APGAR5),
      raca_cor: decodificarRacaCor(linha.RACACOR),
      
      // Informações da mãe
      idade_mae: paraNumero(linha.IDADEMAE),
      classificacao_idade_mae: classificarIdadeMae(paraNumero(linha.IDADEMAE)),
      estado_civil_mae: decodificarEstadoCivil(linha.ESTCIVMAE),
      escolaridade_mae: decodificarEscolaridade(linha.ESCMAE),
      raca_cor_mae: decodificarRacaCor(linha.RACACORMAE),
      
      // Gestação e parto
      tipo_parto: decodificarParto(linha.PARTO),
      semanas_gestacao: paraNumero(linha.SEMAGESTAC),
      numero_consultas_prenatal: paraNumero(linha.CONSULTAS),
      
      // Histórico reprodutivo
      qtd_filhos_vivos: paraNumero(linha.QTDFILVIVO),
      qtd_filhos_mortos: paraNumero(linha.QTDFILMORT),
      qtd_gestacoes: paraNumero(linha.QTDGESTANT)
    };
    
    dadosTransformados.push(linhaSilver);
    linhasProcessadas++;
  })
  .on('end', () => {
    console.log(`✅ Total de ${linhasLidas.toLocaleString()} linhas lidas.`);
    console.log(`✅ ${linhasProcessadas.toLocaleString()} linhas transformadas.`);
    
    console.log('💾 Salvando dados limpos na Camada Silver...');
    
    csv.writeToPath(caminhoSilver, dadosTransformados, { headers: true })
       .on('finish', () => {
         console.log(`📁 Dados limpos salvos em: ${caminhoSilver}`);
         console.log('--- CAMADA SILVER CONCLUÍDA ---');
       })
       .on('error', (err) => console.error('❌ Erro ao salvar CSV Silver:', err));
  });