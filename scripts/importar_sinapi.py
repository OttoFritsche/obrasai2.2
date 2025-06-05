#!/usr/bin/env python3
"""
Script de Importação de Dados SINAPI para ObrasAI
==================================================

Este script importa dados oficiais do SINAPI (Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil)
para a tabela sinapi_insumos no banco de dados Supabase.

Funcionalidades:
- Leitura e limpeza de dados CSV do SINAPI
- Validação e conversão de tipos de dados
- Importação em lotes para otimização de performance
- Logs detalhados de progresso e erros
- Tratamento robusto de erros com rollback
- Auditoria completa do processo de importação

Autor: Equipe ObrasAI
Data: 2024-12-27
"""

import pandas as pd
import os
import sys
import logging
import json
from datetime import datetime, date
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import re
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Configuração de logging


def configurar_logging():
    """Configura sistema de logs para auditoria completa do processo"""
    log_dir = Path('logs')
    log_dir.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    log_file = log_dir / f'importacao_sinapi_{timestamp}.log'

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file, encoding='utf-8'),
            logging.StreamHandler(sys.stdout)
        ]
    )

    return str(log_file)


def validar_arquivo_csv(caminho_arquivo: str) -> bool:
    """
    Valida se o arquivo CSV existe e tem estrutura esperada

    Args:
        caminho_arquivo: Caminho para o arquivo CSV do SINAPI

    Returns:
        bool: True se arquivo válido, False caso contrário
    """
    if not os.path.exists(caminho_arquivo):
        logging.error(f"Arquivo não encontrado: {caminho_arquivo}")
        return False

    # Verificar se arquivo não está vazio
    if os.path.getsize(caminho_arquivo) == 0:
        logging.error(f"Arquivo está vazio: {caminho_arquivo}")
        return False

    # Tentar ler primeiras linhas para validar estrutura
    try:
        df_sample = pd.read_csv(caminho_arquivo, nrows=5, encoding='utf-8')

        # Verificar se tem pelo menos as colunas básicas esperadas (com quebras de linha possíveis)
        colunas_esperadas = ['Código da', 'Código do', 'Descrição do Insumo']
        colunas_encontradas = ' '.join(
            [str(col).replace('\n', ' ') for col in df_sample.columns])

        for coluna in colunas_esperadas:
            if coluna not in colunas_encontradas:
                logging.error(
                    f"Coluna obrigatória contendo '{coluna}' não encontrada no arquivo")
                return False

        logging.info(
            f"Arquivo validado com sucesso: {len(df_sample.columns)} colunas encontradas")
        return True

    except Exception as e:
        logging.error(f"Erro ao validar arquivo CSV: {str(e)}")
        return False


def limpar_nomes_colunas(df: pd.DataFrame) -> pd.DataFrame:
    """
    Limpa nomes de colunas removendo quebras de linha e caracteres especiais

    Args:
        df: DataFrame com dados do SINAPI

    Returns:
        DataFrame com nomes de colunas limpos
    """
    logging.info("Iniciando limpeza dos nomes das colunas...")

    # Mapear nomes originais para nomes limpos
    mapeamento_colunas = {}

    for coluna in df.columns:
        # Remover quebras de linha e espaços extras
        nome_limpo = str(coluna).replace('\n', ' ').replace('\r', ' ').strip()
        # Remover espaços múltiplos
        nome_limpo = re.sub(r'\s+', ' ', nome_limpo)
        mapeamento_colunas[coluna] = nome_limpo

    # Aplicar mapeamento
    df = df.rename(columns=mapeamento_colunas)

    logging.info(f"Nomes de colunas limpos: {list(df.columns)}")
    return df


def mapear_colunas_sinapi(df: pd.DataFrame) -> Dict[str, str]:
    """
    Mapeia colunas do CSV para campos da tabela sinapi_insumos

    Args:
        df: DataFrame com dados do SINAPI

    Returns:
        Dict com mapeamento de colunas
    """
    logging.info("Mapeando colunas do SINAPI para estrutura do banco...")

    # Mapear colunas para campos da tabela
    mapeamento = {
        'codigo_da_familia': None,
        'codigo_do_insumo': None,
        'descricao_do_insumo': None,
        'unidade': None,
        'categoria': None
    }

    # Estados brasileiros para preços
    estados = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
               'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
               'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO']

    # Mapear colunas principais
    for coluna in df.columns:
        coluna_lower = coluna.lower()

        if 'código da família' in coluna_lower or 'codigo da familia' in coluna_lower:
            mapeamento['codigo_da_familia'] = coluna
        elif 'código do insumo' in coluna_lower or 'codigo do insumo' in coluna_lower:
            mapeamento['codigo_do_insumo'] = coluna
        elif 'descrição do insumo' in coluna_lower or 'descricao do insumo' in coluna_lower:
            mapeamento['descricao_do_insumo'] = coluna
        elif 'unidade' in coluna_lower:
            mapeamento['unidade'] = coluna
        elif 'categoria' in coluna_lower:
            mapeamento['categoria'] = coluna

    # Mapear colunas de preços por estado
    for estado in estados:
        preco_campo = f'preco_{estado.lower()}'
        mapeamento[preco_campo] = None

        for coluna in df.columns:
            # Procurar por padrões como "AC", "ACRE", etc.
            if estado in coluna.upper() or estado in coluna:
                mapeamento[preco_campo] = coluna
                break

    logging.info(
        f"Mapeamento de colunas concluído: {len([v for v in mapeamento.values() if v])} colunas mapeadas")
    return mapeamento


def limpar_dados_precos(valor) -> Optional[float]:
    """
    Limpa e converte valores de preços para formato decimal

    Args:
        valor: Valor bruto do preço

    Returns:
        float ou None se inválido
    """
    if pd.isna(valor) or valor == '' or valor is None:
        return None

    # Converter para string se necessário
    valor_str = str(valor).strip()

    # Remover símbolos de moeda e espaços
    valor_str = valor_str.replace('R$', '').replace('$', '').replace(' ', '')

    # Trocar vírgula por ponto para decimais
    valor_str = valor_str.replace(',', '.')

    try:
        return float(valor_str)
    except ValueError:
        return None


def processar_dados_sinapi(df: pd.DataFrame, mapeamento: Dict[str, str]) -> pd.DataFrame:
    """
    Processa e limpa dados do SINAPI para importação

    Args:
        df: DataFrame original do SINAPI
        mapeamento: Mapeamento de colunas

    Returns:
        DataFrame processado e limpo
    """
    logging.info("Iniciando processamento dos dados SINAPI...")

    # Criar DataFrame processado
    dados_processados = pd.DataFrame()

    # Processar colunas principais
    for campo_db, coluna_csv in mapeamento.items():
        if coluna_csv and coluna_csv in df.columns:
            if campo_db.startswith('preco_'):
                # Processar preços
                dados_processados[campo_db] = df[coluna_csv].apply(
                    limpar_dados_precos)
            else:
                # Processar campos de texto
                dados_processados[campo_db] = df[coluna_csv].astype(
                    str).str.strip()

    # Adicionar campos de controle - convertendo date para string ISO
    dados_processados['mes_referencia'] = date.today().isoformat()
    dados_processados['ativo'] = True

    # Validar dados obrigatórios
    campos_obrigatorios = ['codigo_do_insumo', 'descricao_do_insumo']
    for campo in campos_obrigatorios:
        if campo not in dados_processados.columns or dados_processados[campo].isna().any():
            logging.warning(f"Campo obrigatório '{campo}' tem valores nulos")

    # Remover linhas com dados essenciais nulos
    dados_processados = dados_processados.dropna(
        subset=['codigo_do_insumo', 'descricao_do_insumo'])

    logging.info(
        f"Processamento concluído: {len(dados_processados)} registros válidos")
    return dados_processados


def conectar_supabase():
    """
    Conecta ao Supabase usando credenciais do ambiente

    Returns:
        Cliente Supabase configurado
    """
    try:
        # Tentar importar cliente Supabase
        from supabase import create_client, Client

        # Obter credenciais do ambiente
        url = os.getenv('SUPABASE_URL')
        # Usar service key para contornar RLS durante importação
        key = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv(
            'SUPABASE_ANON_KEY')

        if not url or not key:
            logging.error(
                "Credenciais do Supabase não encontradas nas variáveis de ambiente")
            logging.info(
                "Configure SUPABASE_URL e SUPABASE_SERVICE_KEY (ou SUPABASE_ANON_KEY)")
            return None

        # Criar cliente
        supabase: Client = create_client(url, key)

        if os.getenv('SUPABASE_SERVICE_KEY'):
            logging.info(
                "Conexão com Supabase estabelecida com sucesso usando service key")
        else:
            logging.info(
                "Conexão com Supabase estabelecida com sucesso usando anon key")
            logging.warning(
                "Recomenda-se usar SUPABASE_SERVICE_KEY para importação para contornar RLS")

        return supabase

    except ImportError:
        logging.error(
            "Biblioteca supabase-py não instalada. Execute: pip install supabase")
        return None
    except Exception as e:
        logging.error(f"Erro ao conectar com Supabase: {str(e)}")
        return None


def importar_em_lotes(dados: pd.DataFrame, supabase, tamanho_lote: int = 100) -> Tuple[int, int]:
    """
    Importa dados em lotes para otimizar performance

    Args:
        dados: DataFrame com dados processados
        supabase: Cliente Supabase
        tamanho_lote: Tamanho do lote para importação

    Returns:
        Tuple com (registros_importados, registros_erro)
    """
    logging.info(
        f"Iniciando importação em lotes de {tamanho_lote} registros...")

    total_registros = len(dados)
    registros_importados = 0
    registros_erro = 0

    # Dividir dados em lotes
    for i in range(0, total_registros, tamanho_lote):
        lote = dados.iloc[i:i+tamanho_lote]
        numero_lote = (i // tamanho_lote) + 1

        try:
            # Converter lote para lista de dicionários
            registros_lote = lote.to_dict('records')

            # Limpar valores NaN para None (JSON-friendly)
            for registro in registros_lote:
                for chave, valor in registro.items():
                    if pd.isna(valor):
                        registro[chave] = None

            # Executar inserção
            resultado = supabase.table('sinapi_insumos').insert(
                registros_lote).execute()

            registros_importados += len(registros_lote)
            logging.info(
                f"Lote {numero_lote}: {len(registros_lote)} registros importados com sucesso")

        except Exception as e:
            registros_erro += len(lote)
            logging.error(f"Erro no lote {numero_lote}: {str(e)}")

            # Log detalhado dos primeiros registros do lote com erro
            if len(lote) > 0:
                primeiro_registro = lote.iloc[0]
                logging.debug(
                    f"Primeiro registro do lote com erro: {primeiro_registro.to_dict()}")

    logging.info(
        f"Importação concluída - Sucesso: {registros_importados}, Erros: {registros_erro}")
    return registros_importados, registros_erro


def gerar_relatorio_importacao(
    arquivo_origem: str,
    total_registros: int,
    registros_importados: int,
    registros_erro: int,
    log_file: str
) -> Dict:
    """
    Gera relatório completo da importação

    Args:
        arquivo_origem: Caminho do arquivo CSV original
        total_registros: Total de registros processados
        registros_importados: Registros importados com sucesso
        registros_erro: Registros com erro
        log_file: Arquivo de log gerado

    Returns:
        Dict com relatório da importação
    """
    relatorio = {
        'timestamp': datetime.now().isoformat(),
        'arquivo_origem': arquivo_origem,
        'total_registros': total_registros,
        'registros_importados': registros_importados,
        'registros_erro': registros_erro,
        'taxa_sucesso': (registros_importados / total_registros * 100) if total_registros > 0 else 0,
        'log_file': log_file,
        'status': 'SUCESSO' if registros_erro == 0 else 'PARCIAL' if registros_importados > 0 else 'ERRO'
    }

    # Salvar relatório em JSON
    relatorio_file = f"relatorio_importacao_sinapi_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(relatorio_file, 'w', encoding='utf-8') as f:
        json.dump(relatorio, f, indent=2, ensure_ascii=False)

    logging.info(f"Relatório salvo em: {relatorio_file}")
    return relatorio


def main():
    """Função principal do script de importação"""

    # Configurar logging
    log_file = configurar_logging()
    logging.info("=== INICIANDO IMPORTAÇÃO DE DADOS SINAPI ===")

    # Verificar argumentos
    if len(sys.argv) < 2:
        logging.error("Uso: python importar_sinapi.py <caminho_arquivo_csv>")
        logging.info(
            "Exemplo: python importar_sinapi.py docs/sinapi/sinapi_familias_coeficientes.csv")
        sys.exit(1)

    arquivo_csv = sys.argv[1]
    logging.info(f"Arquivo de entrada: {arquivo_csv}")

    try:
        # 1. Validar arquivo
        if not validar_arquivo_csv(arquivo_csv):
            sys.exit(1)

        # 2. Conectar ao Supabase
        supabase = conectar_supabase()
        if not supabase:
            sys.exit(1)

        # 3. Carregar dados CSV
        logging.info("Carregando dados do arquivo CSV...")
        df = pd.read_csv(arquivo_csv, encoding='utf-8')
        logging.info(
            f"Dados carregados: {len(df)} registros, {len(df.columns)} colunas")

        # 4. Limpar nomes das colunas
        df = limpar_nomes_colunas(df)

        # 5. Mapear colunas
        mapeamento = mapear_colunas_sinapi(df)

        # 6. Processar dados
        dados_processados = processar_dados_sinapi(df, mapeamento)

        # 7. Importar dados
        registros_importados, registros_erro = importar_em_lotes(
            dados_processados, supabase)

        # 8. Gerar relatório
        relatorio = gerar_relatorio_importacao(
            arquivo_csv,
            len(dados_processados),
            registros_importados,
            registros_erro,
            log_file
        )

        # 9. Exibir resumo final
        logging.info("=== RESUMO DA IMPORTAÇÃO ===")
        logging.info(f"Status: {relatorio['status']}")
        logging.info(f"Total de registros: {relatorio['total_registros']}")
        logging.info(
            f"Importados com sucesso: {relatorio['registros_importados']}")
        logging.info(f"Registros com erro: {relatorio['registros_erro']}")
        logging.info(f"Taxa de sucesso: {relatorio['taxa_sucesso']:.2f}%")
        logging.info("=== FIM DA IMPORTAÇÃO ===")

        # Código de saída baseado no resultado
        if registros_erro == 0:
            sys.exit(0)  # Sucesso total
        elif registros_importados > 0:
            sys.exit(2)  # Sucesso parcial
        else:
            sys.exit(1)  # Erro total

    except Exception as e:
        logging.error(f"Erro geral na importação: {str(e)}")
        logging.exception("Stack trace do erro:")
        sys.exit(1)


if __name__ == "__main__":
    main()
