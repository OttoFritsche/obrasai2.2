import requests
import os
import time

documentos = [
    {
        "path": "docs/despesas/documentacao_despesas.md",
        "tipo": "despesas",
        "nome": "documentacao_despesas.md"
    },
    {
        "path": "docs/orcamentoIA/documentacao_orcamento.md",
        "tipo": "orcamento",
        "nome": "documentacao_orcamento.md"
    },
    {
        "path": "docs/contrato/documentacao_contratoIA.md",
        "tipo": "contratoIA",
        "nome": "documentacao_contratoIA.md"
    },
    {
        "path": "docs/obras/documentacao_obras.md",
        "tipo": "obras",
        "nome": "documentacao_obras.md"
    }
]

SUPABASE_URL = "https://anrphijuostbgbscxmzx.supabase.co"
EDGE_FUNCTION = "/functions/v1/gerar-embeddings-documentacao"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFucnBoaWp1b3N0Ymdic2N4bXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NDc0OTcsImV4cCI6MjA2MTUyMzQ5N30.6I89FlKMWwckt7xIqt6i9HxrI0MkupzWIbKlhINblUc"

CHUNK_SIZE = 2000  # caracteres


def split_chunks(text, size=CHUNK_SIZE):
    # Quebra por parágrafo, mas garante que não ultrapasse o tamanho
    paragraphs = text.split('\n\n')
    chunks = []
    current = ""
    for p in paragraphs:
        if len(current) + len(p) + 2 <= size:
            current += ("\n\n" if current else "") + p
        else:
            if current:
                chunks.append(current)
            current = p
    if current:
        chunks.append(current)
    return chunks


def enviar_chunks(documento):
    with open(documento["path"], "r", encoding="utf-8") as f:
        texto = f.read()
    chunks = split_chunks(texto)
    print(
        f"Enviando {len(chunks)} chunks para {documento['nome']} ({documento['tipo']})...")
    for i, chunk in enumerate(chunks):
        payload = {
            "documento": documento["tipo"],
            "chunks": [
                {
                    "conteudo": chunk,
                    "nome_documento": documento["nome"]
                }
            ]
        }
        headers = {
            "Content-Type": "application/json",
            "apikey": API_KEY,
            "Authorization": f"Bearer {API_KEY}"
        }
        resp = requests.post(
            SUPABASE_URL + EDGE_FUNCTION,
            json=payload,
            headers=headers,
            timeout=60
        )
        if resp.status_code == 200:
            print(f"Chunk {i+1}/{len(chunks)} enviado com sucesso.")
        else:
            print(
                f"ERRO no chunk {i+1}/{len(chunks)}: {resp.status_code} - {resp.text}")
        time.sleep(1)  # Evita sobrecarga na API


if __name__ == "__main__":
    for doc in documentos:
        enviar_chunks(doc)
    print("\nProcesso finalizado!")
