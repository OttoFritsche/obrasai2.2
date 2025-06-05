#!/usr/bin/env python3
"""
Script para importar composições SINAPI de mão de obra
Arquivo: SINAPI_mao_de_obra_2025_04.xlsx

Este script processa as duas páginas da planilha:
- SEM Desoneração
- COM Desoneração

E importa os dados para a tabela sinapi_composicoes_mao_obra
"""

import pandas as pd
import os
import sys
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def setup_supabase() -> Client:
    """Configura e retorna cliente Supabase"""
    load_dotenv()

    url = os.getenv("VITE_SUPABASE_URL")
    key = os.getenv("VITE_SUPABASE_ANON_KEY")

    if not url or not key:
        raise ValueError(
            "Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem estar definidas no .env")

    return create_client(url, key)


def clean_numeric_value(value):
    """Limpa e converte valores numéricos"""
    if pd.isna(value) or value == '' or value == '-':
        return None

    try:
        # Remove espaços e converte para float
        if isinstance(value, str):
            value = value.strip().replace(',', '.')
        return float(value)
    except (ValueError, TypeError):
        return None


def process_excel_sheet(file_path: str, sheet_name: str) -> pd.DataFrame:
    """Processa uma página específica da planilha Excel"""
    logger.info(f"Processando página: {sheet_name}")

    # Carrega a planilha
    df = pd.read_excel(file_path, sheet_name=sheet_name)

    # Remove linhas vazias
    df = df.dropna(subset=['Código da\nComposição'])

    logger.info(f"Encontrados {len(df)} registros na página {sheet_name}")

    return df


def transform_data(df_sem: pd.DataFrame, df_com: pd.DataFrame) -> list:
    """Transforma os dados das duas planilhas em formato para inserção"""
    logger.info("Transformando dados para inserção...")

    # Mapear colunas dos estados
    estados = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
               'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
               'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO']

    registros = []

    # Processa cada linha da planilha SEM desoneração
    for idx, row_sem in df_sem.iterrows():
        codigo = str(row_sem['Código da\nComposição']).strip()

        # Busca a linha correspondente na planilha COM desoneração
        row_com = df_com[df_com['Código da\nComposição']
                         == row_sem['Código da\nComposição']]

        if row_com.empty:
            logger.warning(
                f"Código {codigo} não encontrado na planilha COM desoneração")
            continue

        row_com = row_com.iloc[0]  # Pega a primeira ocorrência

        # Monta o registro
        registro = {
            'codigo_composicao': codigo,
            'grupo': str(row_sem['Grupo']).strip() if pd.notna(row_sem['Grupo']) else '',
            'descricao': str(row_sem['Descrição']).strip() if pd.notna(row_sem['Descrição']) else '',
            'unidade': str(row_sem['Unidade']).strip() if pd.notna(row_sem['Unidade']) else '',
            'mes_referencia': '2025-04-01',  # Abril 2025
            'fonte_dados': 'SINAPI_OFICIAL',
            'ativo': True
        }

        # Adiciona preços SEM desoneração por estado
        for estado in estados:
            coluna_sem = estado  # Nome da coluna na planilha
            valor_sem = clean_numeric_value(row_sem.get(coluna_sem))
            registro[f'preco_sem_{estado.lower()}'] = valor_sem

        # Adiciona preços COM desoneração por estado
        for estado in estados:
            coluna_com = estado  # Nome da coluna na planilha
            valor_com = clean_numeric_value(row_com.get(coluna_com))
            registro[f'preco_com_{estado.lower()}'] = valor_com

        registros.append(registro)

    logger.info(f"Transformados {len(registros)} registros para inserção")
    return registros


def insert_data_batch(supabase: Client, registros: list, batch_size: int = 100):
    """Insere dados em lotes no Supabase"""
    logger.info(
        f"Inserindo {len(registros)} registros em lotes de {batch_size}")

    total_inseridos = 0
    total_erros = 0

    for i in range(0, len(registros), batch_size):
        batch = registros[i:i + batch_size]

        try:
            # Insere o lote
            result = supabase.table(
                'sinapi_composicoes_mao_obra').insert(batch).execute()

            if result.data:
                inseridos = len(result.data)
                total_inseridos += inseridos
                logger.info(
                    f"Lote {i//batch_size + 1}: {inseridos} registros inseridos")
            else:
                logger.error(
                    f"Lote {i//batch_size + 1}: Nenhum registro inserido")
                total_erros += len(batch)

        except Exception as e:
            logger.error(f"Erro no lote {i//batch_size + 1}: {str(e)}")
            total_erros += len(batch)

            # Tenta inserir registro por registro para identificar problemas
            for j, registro in enumerate(batch):
                try:
                    supabase.table('sinapi_composicoes_mao_obra').insert(
                        registro).execute()
                    total_inseridos += 1
                except Exception as e2:
                    logger.error(
                        f"Erro no registro {registro.get('codigo_composicao', 'N/A')}: {str(e2)}")
                    total_erros += 1

    logger.info(
        f"Importação concluída: {total_inseridos} inseridos, {total_erros} erros")
    return total_inseridos, total_erros


def main():
    """Função principal"""
    try:
        # Configuração
        file_path = 'docs/sinapi/SINAPI_mao_de_obra_2025_04.xlsx'

        if not os.path.exists(file_path):
            logger.error(f"Arquivo não encontrado: {file_path}")
            sys.exit(1)

        # Conecta ao Supabase
        logger.info("Conectando ao Supabase...")
        supabase = setup_supabase()

        # Limpa dados existentes (opcional)
        logger.info("Limpando dados existentes...")
        supabase.table('sinapi_composicoes_mao_obra').delete().neq(
            'id', 0).execute()

        # Processa as duas páginas da planilha
        df_sem = process_excel_sheet(file_path, 'SEM Desoneração')
        df_com = process_excel_sheet(file_path, 'COM Desoneração')

        # Transforma os dados
        registros = transform_data(df_sem, df_com)

        if not registros:
            logger.error("Nenhum registro para inserir")
            sys.exit(1)

        # Insere os dados
        inseridos, erros = insert_data_batch(supabase, registros)

        # Relatório final
        logger.info("="*60)
        logger.info("RELATÓRIO FINAL DA IMPORTAÇÃO")
        logger.info("="*60)
        logger.info(f"Total de registros processados: {len(registros)}")
        logger.info(f"Registros inseridos com sucesso: {inseridos}")
        logger.info(f"Registros com erro: {erros}")
        logger.info(f"Taxa de sucesso: {(inseridos/len(registros)*100):.1f}%")

        if erros == 0:
            logger.info("🎉 Importação concluída com SUCESSO!")
        else:
            logger.warning(f"⚠️ Importação concluída com {erros} erros")

    except Exception as e:
        logger.error(f"Erro geral na importação: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
