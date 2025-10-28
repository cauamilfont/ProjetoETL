// 1_extracao_bronze.js (Corrigido com User-Agent)

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const url = 'https://s3.sa-east-1.amazonaws.com/ckan.saude.gov.br/SINASC/csv/SINASC_2022.csv';
const caminhoBronze = path.resolve(__dirname, 'dados', 'bronze', 'SINASC_2022_BRASIL_bruto.csv');

async function extrairDadosBronze() {
  console.log('--- INICIANDO CAMADA BRONZE ---');
  console.log('Baixando dados brutos de:', url);

  try {
    fs.mkdirSync(path.dirname(caminhoBronze), { recursive: true });

    // ---- INÍCIO DA MUDANÇA ----
    // Vamos simular um navegador (Mozilla Firefox) para evitar o erro 403
    const options = {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0'
      }
    };
    // ---- FIM DA MUDANÇA ----

    const resposta = await axios.get(url, options); // Passamos as 'options' aqui
    const writer = fs.createWriteStream(caminhoBronze);
    resposta.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Dados brutos salvos em: ${caminhoBronze}`);
        console.log('--- CAMADA BRONZE CONCLUÍDA ---');
        resolve();
      });
      writer.on('error', (err) => {
        console.error('Erro ao salvar arquivo na Camada Bronze:', err);
        reject(err);
      });
    });

  } catch (erro) {
    // Se o erro for 403, a mensagem será mais específica
    if (erro.response && erro.response.status === 403) {
      console.error('Erro 403 (Proibido). O servidor ainda está bloqueando nossa requisição.');
    } else {
      console.error('Erro ao baixar o arquivo:', erro.message);
    }
  }
}

extrairDadosBronze();