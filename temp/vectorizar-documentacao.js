import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
// Configuração direta do Supabase
const supabaseUrl = 'https://anrphijuostbgbscxmzx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFucnBoaWp1b3N0Ymdic2N4bXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NDc0OTcsImV4cCI6MjA2MTUyMzQ5N30.6I89FlKMWwckt7xIqt6i9HxrI0MkupzWIbKlhINblUc';
const supabase = createClient(supabaseUrl, supabaseKey);
// Função para dividir texto em chunks
function dividirTextoEmChunks(texto, tamanhoMaximo = 1000) {
    const paragrafos = texto.split('\n\n');
    const chunks = [];
    let chunkAtual = '';
    for (const paragrafo of paragrafos) {
        if (chunkAtual.length + paragrafo.length > tamanhoMaximo && chunkAtual.length > 0) {
            chunks.push(chunkAtual.trim());
            chunkAtual = paragrafo;
        }
        else {
            chunkAtual += (chunkAtual ? '\n\n' : '') + paragrafo;
        }
    }
    if (chunkAtual.trim()) {
        chunks.push(chunkAtual.trim());
    }
    return chunks;
}
// Função para processar um documento
function processarDocumento(caminhoArquivo, nomeDocumento) {
    const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
    const chunks = dividirTextoEmChunks(conteudo);
    return chunks.map((chunk, index) => ({
        documento: nomeDocumento,
        secao: `secao_${index + 1}`,
        conteudo: chunk,
        metadata: {
            arquivo_origem: caminhoArquivo,
            chunk_index: index,
            total_chunks: chunks.length
        }
    }));
}
async function vectorizarDocumentacao() {
    console.log('Iniciando vectorização da documentação...');
    const documentos = [
        {
            arquivo: 'docs/despesas/documentacao_despesas.md',
            nome: 'documentacao_despesas'
        },
        {
            arquivo: 'docs/orcamentoIA/documentacao_orcamento.md',
            nome: 'documentacao_orcamento'
        },
        {
            arquivo: 'docs/obras/documentacao_obras.md',
            nome: 'documentacao_obras'
        },
        {
            arquivo: 'docs/contrato/documentacao_contratoIA.md',
            nome: 'documentacao_contratoIA'
        }
    ];
    for (const doc of documentos) {
        try {
            console.log(`Processando ${doc.nome}...`);
            const caminhoCompleto = path.join(process.cwd(), doc.arquivo);
            if (!fs.existsSync(caminhoCompleto)) {
                console.warn(`Arquivo não encontrado: ${caminhoCompleto}`);
                continue;
            }
            const chunks = processarDocumento(caminhoCompleto, doc.nome);
            console.log(`Gerados ${chunks.length} chunks para ${doc.nome}`);
            // Chamar Edge Function para gerar embeddings
            const response = await supabase.functions.invoke('gerar-embeddings-documentacao', {
                body: {
                    documento: doc.nome,
                    chunks
                }
            });
            console.log('Response completa:', response);
            if (response.error) {
                console.error(`Erro ao processar ${doc.nome}:`, response.error);
                // Tentar ler o corpo da resposta de erro
                if (response.error.context && response.error.context.body) {
                    try {
                        const errorBody = await response.error.context.text();
                        console.error('Corpo do erro:', errorBody);
                    }
                    catch (e) {
                        console.error('Não foi possível ler o corpo do erro:', e);
                    }
                }
                continue;
            }
            console.log(`✅ ${doc.nome} processado com sucesso:`, response.data);
        }
        catch (error) {
            console.error(`Erro ao processar ${doc.nome}:`, error);
        }
    }
    console.log('Vectorização concluída!');
}
// Executar a função
vectorizarDocumentacao().catch(console.error);
export { vectorizarDocumentacao };
