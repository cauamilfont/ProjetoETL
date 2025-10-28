// 3_aggregate_gold.js

const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const caminhoSilver = path.resolve(__dirname, 'dados', 'silver', 'nascimentos_CE_2022_limpos.csv');
const caminhoGold = path.resolve(__dirname, 'dados', 'gold', 'metricas_por_municipio_CE_2022.csv');

// Objeto para armazenar as agregações
const agregacaoPorMunicipio = {}; 

console.log('--- INICIANDO CAMADA GOLD ---');
console.log('Lendo dados limpos da Camada Silver...');

fs.createReadStream(caminhoSilver)
  .pipe(csv.parse({ headers: true }))
  .on('error', (error) => console.error(error))
  .on('data', (linha) => {

    const codigoMunicipio = linha.codigo_municipio_residencia;
    const peso = parseInt(linha.peso_gramas, 10);

    // Validação: Ignora registros sem município ou sem peso válido
    if (!codigoMunicipio || !peso || peso <= 0) {
      return; // Pula para a próxima linha
    }

    // Se é a primeira vez que vemos esse município, inicializa
    if (!agregacaoPorMunicipio[codigoMunicipio]) {
      agregacaoPorMunicipio[codigoMunicipio] = {
        soma_peso: 0,
        contagem_nascimentos: 0,
      };
    }

    // Acumula os valores
    agregacaoPorMunicipio[codigoMunicipio].soma_peso += peso;
    agregacaoPorMunicipio[codigoMunicipio].contagem_nascimentos += 1;
  })
  .on('end', () => {
    console.log('Agregação em memória concluída. Calculando médias...');

    const resultadoFinalGold = Object.keys(agregacaoPorMunicipio).map(codigo => {
      const dados = agregacaoPorMunicipio[codigo];
      const mediaPeso = dados.soma_peso / dados.contagem_nascimentos;

      return {
        codigo_municipio: codigo,
        total_nascimentos: dados.contagem_nascimentos,
        media_peso_gramas: mediaPeso.toFixed(2) 
      };
    });

    console.log('Salvando dados agregados na Camada Gold...');
    csv.writeToPath(caminhoGold, resultadoFinalGold, { headers: true })
       .on('finish', () => {
         console.log(`Dados agregados salvos em: ${caminhoGold}`);
         console.log('--- CAMADA GOLD CONCLUÍDA ---');
         console.log('--- PROJETO ETL FINALIZADO! ---');
       })
       .on('error', (err) => console.error('Erro ao salvar CSV Gold:', err));
  });