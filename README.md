# 🏥 Pipeline ETL - Dados SINASC 2022

Pipeline completo de ETL para análise de dados de nascidos vivos no Brasil, implementando as três camadas de dados: Bronze, Silver e Gold.

## 📊 Sobre o Projeto

Este projeto processa dados do Sistema de Informações sobre Nascidos Vivos (SINASC) do DataSUS, transformando dados brutos em informações analíticas valiosas para saúde pública.

## 🏗️ Arquitetura do Pipeline

```
meu_projeto_etl/
├── 📁 dados/
│   ├── 📁 bronze/          # Dados brutos (originais)
│   ├── 📁 silver/          # Dados limpos e tratados
│   └── 📁 gold/            # Dados agregados para análise
├── 📁 scripts/
│   ├── 🔧 1_preparar_bronze.js
│   ├── 🔧 2_transform_silver.js
│   └── 🔧 3_aggregate_gold.js
├── 📁 node_modules/        # Dependências do projeto
├── 📄 package.json
└── 📄 README.md
```

## 📋 Fonte dos Dados e Justificativa

- **Fonte:** Sistema de Informações sobre Nascidos Vivos (SINASC) - DataSUS
- **Período:** Dados de 2022
- **Justificativa:** Dados oficiais do Ministério da Saúde com ampla cobertura nacional, ideais para análise de indicadores de saúde materno-infantil

## 🗂️ Estrutura dos Dados Originais

- **Formato:** CSV delimitado por ponto e vírgula
- **Campos:** 58 colunas com informações detalhadas sobre nascimentos
- **Tamanho:** Aproximadamente 2.8 milhões de registros
- **Características:** Dados nacionais completos

## 🔄 Etapas de Transformação Aplicadas

### Camada Bronze
- **Objetivo:** Armazenamento dos dados brutos
- **Processo:** Arquivo CSV original sem modificações
- **Localização:** `dados/bronze/SINASC_2022_BRASIL_bruto.csv`

### Camada Silver
- **Limpeza:** Tratamento de valores missing e inconsistentes
- **Normalização:** Formatação de datas e campos numéricos
- **Decodificação:** Conversão de códigos categóricos para labels descritivos:
  - Sexo do bebê
  - Escolaridade da mãe
  - Estado civil
  - Tipo de parto
  - Raça/cor
- **Classificação:** Categorização de:
  - Peso ao nascer (Baixo, Normal, Alto)
  - Idade materna (Adolescente, Adulto Jovem, Adulto, Idosa)
- **Saída:** `dados/silver/nascimentos_2022_limpos.csv`

### Camada Gold
- **Agregação:** Consolidação por Unidade da Federação (UF)
- **Indicadores Calculados:**
  - Total de nascimentos
  - Peso médio ao nascer
  - Percentual de baixo peso (<2500g)
  - Taxa de partos cesáreos
  - Percentual de mães adolescentes
  - Média do índice APGAR5
- **Classificação:** Indicador de saúde neonatal
- **Saída:** `dados/gold/metricas_analiticas_2022.csv`

## 🎯 Modelo de Dados Final (Gold)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| uf | string | Sigla da Unidade da Federação |
| total_nascimentos | integer | Quantidade total de nascimentos |
| media_peso_gramas | decimal | Peso médio dos recém-nascidos (gramas) |
| percentual_baixo_peso | decimal | % de nascimentos com peso inferior a 2500g |
| percentual_partos_cesarea | decimal | % de partos realizados por cesárea |
| percentual_maes_adolescentes | decimal | % de mães com idade inferior a 20 anos |
| media_apgar5 | decimal | Média do índice APGAR no 5º minuto (0-10) |
| indicador_saude_neonatal | string | Classificação geral (BOM/REGULAR) |

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 14 ou superior)
- 500MB de espaço livre em disco
- Arquivo SINASC_2022_BRASIL_bruto.csv na pasta bronze

### Instalação e Execução

1. **Clone ou baixe o projeto**
2. **Instale as dependências:**
   ```bash
   npm install
   ```
3. **Coloque o arquivo de dados na pasta bronze:**
   - Baixe o arquivo `SINASC_2022_BRASIL_bruto.csv` do DataSUS
   - Salve em: `dados/bronze/SINASC_2022_BRASIL_bruto.csv`
4. **Execute o pipeline completo:**
   ```bash
   node scripts/1_preparar_bronze.js
   node scripts/2_transform_silver.js
   node scripts/3_aggregate_gold.js
   ```

### Execução com NPM Scripts
```bash
# Apenas transformação Silver
npm run silver

# Apenas agregação Gold
npm run gold

# Pipeline completo
npm start
```

## 📊 Resultados Esperados

- **Silver:** ~2.8 milhões de registros limpos e categorizados
- **Gold:** 27 unidades federativas com métricas consolidadas
- **Tempo de processamento:** 3-10 minutos (dependendo do hardware)

## 🚧 Desafios e Soluções

### Desafio 1: Volume de Dados
**Problema:** Processamento de arquivo CSV com ~2.8 milhões de registros
**Solução:** Implementação de streaming para evitar sobrecarga de memória

### Desafio 2: Qualidade dos Dados
**Problema:** Valores missing, inconsistentes e códigos não padronizados
**Solução:** Sistema robusto de validação e classificação automática

### Desafio 3: Complexidade das Transformações
**Problema:** Múltiplas decodificações e categorizações necessárias
**Solução:** Funções modulares e reutilizáveis para cada tipo de transformação

## 📈 Valor Analítico

O pipeline permite:

- **Análise Comparativa:** Comparar indicadores entre estados
- **Identificação de Problemas:** Detectar regiões com altos índices de baixo peso
- **Monitoramento:** Acompanhar tendências de saúde materno-infantil
- **Tomada de Decisão:** Subsidiar políticas públicas baseadas em dados
- **Pesquisa:** Fornecer base consistente para estudos acadêmicos

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Ambiente de execução
- **fast-csv** - Processamento de arquivos CSV
- **File System** - Manipulação de arquivos e diretórios

## ⏱️ Tempo de Processamento Esperado

- **Silver:** 2-5 minutos
- **Gold:** 1-3 minutos
- **Total:** 3-8 minutos

## 🔍 Monitoramento do Processo

Durante a execução, os scripts mostrarão:
- Progresso a cada 100.000 linhas processadas
- Estatísticas finais de processamento
- Métricas consolidadas por UF
- Indicadores de qualidade dos dados

## ✅ Verificação Final

Após a execução, verifique se foram criados:
- ✅ `dados/silver/nascimentos_2022_limpos.csv` (dados tratados)
- ✅ `dados/gold/metricas_analiticas_2022.csv` (métricas por UF)

---

**🎊 Pronto! Seu projeto está 100% documentado e pronto para execução!**

## 👥 Desenvolvido por

**Lucas / Cauã / Marcio**
- GitHub: [@LucasFigs](https://github.com/LucasFigs)
- GitHub: [@cauamilfont](https://github.com/cauamilfont)
- GitHub: [@marciiojr](https://github.com/marciiojr)
- Projeto: [ProjetoETL](https://github.com/cauamilfont/ProjetoETL)