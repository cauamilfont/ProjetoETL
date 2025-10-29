const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const caminhoSilver = path.resolve(__dirname, '../dados/silver/nascimentos_2022_limpos.csv');
const caminhoGold = path.resolve(__dirname, '../dados/gold/metricas_analiticas_2022.csv');

const agregacoes = {
  porUF: {}
};

console.log('--- INICIANDO CAMADA GOLD ---');
console.log('Lendo dados limpos da Camada Silver...');

// Criar pasta gold se não existir
fs.mkdirSync(path.dirname(caminhoGold), { recursive: true });

let linhasProcessadas = 0;

fs.createReadStream(caminhoSilver)
  .pipe(csv.parse({ headers: true }))
  .on('error', (error) => console.error('❌ Erro:', error))
  .on('data', (linha) => {
    linhasProcessadas++;
    
    if (linhasProcessadas % 100000 === 0) {
      console.log(`📊 ${linhasProcessadas.toLocaleString()} linhas processadas...`);
    }

    const uf = linha.uf_residencia;
    const classificacaoPeso = linha.classificacao_peso;
    const tipoParto = linha.tipo_parto;
    const classificacaoIdadeMae = linha.classificacao_idade_mae;
    const peso = parseInt(linha.peso_gramas, 10);
    const apgar5 = parseInt(linha.apgar5, 10);

    // Validação básica
    if (!uf || !peso || peso <= 0) return;

    // Agregação por UF
    if (!agregacoes.porUF[uf]) {
      agregacoes.porUF[uf] = {
        total_nascimentos: 0,
        soma_peso: 0,
        nascimentos_baixo_peso: 0,
        partos_cesarea: 0,
        maes_adolescentes: 0,
        soma_apgar5: 0,
        count_apgar5: 0
      };
    }

    agregacoes.porUF[uf].total_nascimentos += 1;
    agregacoes.porUF[uf].soma_peso += peso;
    
    if (classificacaoPeso === 'BAIXO_PESO') {
      agregacoes.porUF[uf].nascimentos_baixo_peso += 1;
    }
    
    if (tipoParto === 'Cesáreo') {
      agregacoes.porUF[uf].partos_cesarea += 1;
    }
    
    if (classificacaoIdadeMae === 'ADOLESCENTE') {
      agregacoes.porUF[uf].maes_adolescentes += 1;
    }
    
    if (apgar5 && apgar5 > 0) {
      agregacoes.porUF[uf].soma_apgar5 += apgar5;
      agregacoes.porUF[uf].count_apgar5 += 1;
    }
  })
  .on('end', () => {
    console.log(`✅ Processamento concluído. ${linhasProcessadas.toLocaleString()} linhas processadas.`);
    console.log('📈 Gerando relatórios finais...');

    // Preparar dados finais para Gold
    const resultadoFinal = Object.keys(agregacoes.porUF).map(uf => {
      const dados = agregacoes.porUF[uf];
      const mediaPeso = dados.soma_peso / dados.total_nascimentos;
      const percentualBaixoPeso = (dados.nascimentos_baixo_peso / dados.total_nascimentos) * 100;
      const percentualCesarea = (dados.partos_cesarea / dados.total_nascimentos) * 100;
      const percentualMaesAdolescentes = (dados.maes_adolescentes / dados.total_nascimentos) * 100;
      const mediaApgar5 = dados.count_apgar5 > 0 ? dados.soma_apgar5 / dados.count_apgar5 : null;

      return {
        uf: uf,
        total_nascimentos: dados.total_nascimentos,
        media_peso_gramas: Math.round(mediaPeso),
        percentual_baixo_peso: percentualBaixoPeso.toFixed(2),
        percentual_partos_cesarea: percentualCesarea.toFixed(2),
        percentual_maes_adolescentes: percentualMaesAdolescentes.toFixed(2),
        media_apgar5: mediaApgar5 ? mediaApgar5.toFixed(2) : null,
        indicador_saude_neonatal: mediaApgar5 && mediaApgar5 >= 8 ? 'BOM' : 'REGULAR'
      };
    });

    // Ordenar por total de nascimentos (maior primeiro)
    resultadoFinal.sort((a, b) => b.total_nascimentos - a.total_nascimentos);

    console.log('💾 Salvando dados agregados na Camada Gold...');
    
    csv.writeToPath(caminhoGold, resultadoFinal, { headers: true })
       .on('finish', () => {
         console.log(`📁 Dados analíticos salvos em: ${caminhoGold}`);
         
         // Estatísticas finais
         console.log('\n🎉 RESULTADOS FINAIS:');
         console.log(`📊 Total de UFs processadas: ${resultadoFinal.length}`);
         console.log(`🏆 UF com mais nascimentos: ${resultadoFinal[0].uf} (${resultadoFinal[0].total_nascimentos.toLocaleString()})`);
         console.log(`📈 Maior percentual de cesáreas: ${resultadoFinal.sort((a, b) => b.percentual_partos_cesarea - a.percentual_partos_cesarea)[0].uf}`);
         
         console.log('--- CAMADA GOLD CONCLUÍDA ---');
         console.log('--- 🎊 PROJETO ETL FINALIZADO! ---');
       })
       .on('error', (err) => console.error('❌ Erro ao salvar CSV Gold:', err));
  });