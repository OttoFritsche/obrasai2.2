#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para importação dos dados SINAPI de Manutenções 2025
Importa os 25.361 registros da planilha para o banco de dados Supabase

Autor: ObrasAI Team
Data: 2024-12-26
"""

import pandas as pd
import os
import sys
from pathlib import Path
import json
from datetime import datetime
from supabase import create_client, Client
from typing import List, Dict, Any
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/importacao_sinapi_manutencoes.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class ImportadorSinapiManutencoes:
    """Classe para importar dados SINAPI de Manutenções"""

    def __init__(self):
        """Inicializar o importador"""
        self.supabase_url = os.getenv('VITE_SUPABASE_URL')
        # Usar SERVICE_KEY para importação com privilégios administrativos
        self.supabase_key = os.getenv('VITE_SUPABASE_ROLE_KEY')  # SERVICE_KEY

        if not self.supabase_url or not self.supabase_key:
            # Fallback para as chaves do arquivo env
            self.supabase_url = os.getenv('SUPABASE_URL')
            self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')

        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Variáveis de ambiente SUPABASE não encontradas")

        logger.info("Conectando ao Supabase com privilégios administrativos...")
        self.supabase: Client = create_client(
            self.supabase_url, self.supabase_key)
        self.caminho_planilha = Path(
            "docs/sinapi/Cópia de SINAPI_Manutenções_2025_04.xlsx")

    def validar_arquivo(self) -> bool:
        """Validar se o arquivo existe e é acessível"""
        if not self.caminho_planilha.exists():
            logger.error(f"Arquivo não encontrado: {self.caminho_planilha}")
            return False

        logger.info(f"Arquivo encontrado: {self.caminho_planilha}")
        return True

    def ler_planilha(self) -> pd.DataFrame:
        """Ler dados da planilha Excel"""
        logger.info("Lendo planilha SINAPI de Manutenções...")

        try:
            # Ler a aba 'Manutenções'
            df = pd.read_excel(self.caminho_planilha, sheet_name='Manutenções')
            logger.info(
                f"Planilha lida com sucesso: {len(df)} registros encontrados")

            # Verificar estrutura esperada
            colunas_esperadas = ['Referência', 'Tipo',
                                 'Código', 'Descrição', 'Manutenção']
            if not all(col in df.columns for col in colunas_esperadas):
                raise ValueError(
                    f"Colunas esperadas não encontradas: {colunas_esperadas}")

            return df

        except Exception as e:
            logger.error(f"Erro ao ler planilha: {e}")
            raise

    def processar_dados(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Processar e validar dados da planilha"""
        logger.info("Processando dados da planilha...")

        registros_processados = []
        registros_com_erro = 0

        for index, row in df.iterrows():
            try:
                # Validar dados obrigatórios
                if pd.isna(row['Código']) or pd.isna(row['Descrição']):
                    registros_com_erro += 1
                    continue

                # Processar data de referência
                data_referencia = row['Referência']
                if pd.isna(data_referencia):
                    data_referencia = datetime(2025, 4, 1).date()
                elif isinstance(data_referencia, str):
                    data_referencia = datetime.strptime(
                        data_referencia, '%Y-%m-%d').date()
                elif hasattr(data_referencia, 'date'):
                    data_referencia = data_referencia.date()

                # Validar e limpar tipo
                tipo = str(row['Tipo']).strip().upper()
                if tipo not in ['INSUMO', 'COMPOSIÇÃO']:
                    # Tentar mapear valores similares
                    if 'INSUMO' in tipo:
                        tipo = 'INSUMO'
                    elif 'COMP' in tipo:
                        tipo = 'COMPOSIÇÃO'
                    else:
                        tipo = 'INSUMO'  # Default

                # Processar código SINAPI
                codigo_sinapi = int(row['Código'])

                # Limpar descrição
                descricao = str(row['Descrição']).strip()
                if len(descricao) > 1000:  # Limitar tamanho
                    descricao = descricao[:997] + "..."

                # Processar tipo de manutenção
                tipo_manutencao = str(row['Manutenção']).strip()
                if len(tipo_manutencao) > 100:
                    tipo_manutencao = tipo_manutencao[:97] + "..."

                # IMPORTANTE: Não incluir tenant_id para dados públicos do SINAPI
                # Isso permite que a política RLS "Permitir inserção de dados SINAPI públicos" funcione
                registro = {
                    'data_referencia': data_referencia.isoformat(),
                    'tipo': tipo,
                    'codigo_sinapi': codigo_sinapi,
                    'descricao': descricao,
                    'tipo_manutencao': tipo_manutencao
                    # tenant_id será NULL (dados públicos)
                }

                registros_processados.append(registro)

            except Exception as e:
                logger.warning(f"Erro ao processar linha {index}: {e}")
                registros_com_erro += 1
                continue

        logger.info(
            f"Processamento concluído: {len(registros_processados)} registros válidos, {registros_com_erro} com erro")
        return registros_processados

    def importar_em_lotes(self, registros: List[Dict[str, Any]], tamanho_lote: int = 1000) -> bool:
        """Importar dados em lotes para o Supabase"""
        logger.info(
            f"Iniciando importação de {len(registros)} registros em lotes de {tamanho_lote}")

        total_importados = 0
        total_erros = 0

        # Dividir em lotes
        for i in range(0, len(registros), tamanho_lote):
            lote = registros[i:i + tamanho_lote]
            lote_numero = (i // tamanho_lote) + 1
            total_lotes = (len(registros) + tamanho_lote - 1) // tamanho_lote

            logger.info(
                f"Importando lote {lote_numero}/{total_lotes} ({len(lote)} registros)")

            try:
                # Inserir lote no Supabase
                result = self.supabase.table(
                    'sinapi_manutencoes').insert(lote).execute()

                if result.data:
                    total_importados += len(result.data)
                    logger.info(
                        f"Lote {lote_numero} importado com sucesso: {len(result.data)} registros")
                else:
                    logger.error(
                        f"Lote {lote_numero} falhou: nenhum dado retornado")
                    total_erros += len(lote)

            except Exception as e:
                logger.error(f"Erro ao importar lote {lote_numero}: {e}")
                total_erros += len(lote)

                # Tentar importar registros individualmente em caso de erro
                logger.info(
                    f"Tentando importação individual para lote {lote_numero}")
                for registro in lote:
                    try:
                        result = self.supabase.table(
                            'sinapi_manutencoes').insert([registro]).execute()
                        if result.data:
                            total_importados += 1
                    except Exception as e_individual:
                        logger.warning(
                            f"Erro ao importar registro individual: {e_individual}")
                        total_erros += 1

        logger.info(
            f"Importação concluída: {total_importados} registros importados, {total_erros} erros")
        return total_erros == 0

    def verificar_importacao(self) -> Dict[str, Any]:
        """Verificar se a importação foi bem-sucedida"""
        logger.info("Verificando importação...")

        try:
            # Contar registros importados
            result = self.supabase.table('sinapi_manutencoes').select(
                'id', count='exact').execute()
            total_registros = result.count if hasattr(
                result, 'count') else len(result.data)

            # Verificar distribuição por tipo
            result_tipos = self.supabase.table(
                'sinapi_manutencoes').select('tipo').execute()
            tipos_count = {}
            for registro in result_tipos.data:
                tipo = registro['tipo']
                tipos_count[tipo] = tipos_count.get(tipo, 0) + 1

            # Verificar últimas datas
            result_datas = self.supabase.table('sinapi_manutencoes').select(
                'data_referencia').order('data_referencia', desc=True).limit(5).execute()
            ultimas_datas = [r['data_referencia'] for r in result_datas.data]

            verificacao = {
                'total_registros': total_registros,
                'distribuicao_tipos': tipos_count,
                'ultimas_datas': ultimas_datas,
                'status': 'sucesso' if total_registros > 20000 else 'parcial'
            }

            logger.info(f"Verificação concluída: {verificacao}")
            return verificacao

        except Exception as e:
            logger.error(f"Erro na verificação: {e}")
            return {'status': 'erro', 'erro': str(e)}

    def executar_importacao(self) -> bool:
        """Executar todo o processo de importação"""
        logger.info("=== INICIANDO IMPORTAÇÃO SINAPI MANUTENÇÕES ===")

        try:
            # Validar arquivo
            if not self.validar_arquivo():
                return False

            # Ler planilha
            df = self.ler_planilha()

            # Processar dados
            registros = self.processar_dados(df)

            if not registros:
                logger.error("Nenhum registro válido encontrado")
                return False

            # Importar dados
            sucesso = self.importar_em_lotes(registros)

            # Verificar importação
            verificacao = self.verificar_importacao()

            if verificacao['status'] == 'sucesso':
                logger.info("=== IMPORTAÇÃO CONCLUÍDA COM SUCESSO ===")
                logger.info(
                    f"Total de registros importados: {verificacao['total_registros']}")
                return True
            else:
                logger.warning("=== IMPORTAÇÃO PARCIAL OU COM PROBLEMAS ===")
                return False

        except Exception as e:
            logger.error(f"Erro geral na importação: {e}")
            return False


def main():
    """Função principal"""
    print("🚀 Iniciando importação SINAPI Manutenções...")

    # Verificar dependências
    try:
        import pandas as pd
        import openpyxl
        from supabase import create_client
    except ImportError as e:
        print(f"❌ Dependência não encontrada: {e}")
        print("Instale com: pip install pandas openpyxl supabase")
        return

    # Criar diretório de logs se não existir
    os.makedirs('logs', exist_ok=True)

    # Executar importação
    importador = ImportadorSinapiManutencoes()
    sucesso = importador.executar_importacao()

    if sucesso:
        print("✅ Importação concluída com sucesso!")
    else:
        print("❌ Falha na importação. Verifique os logs.")


if __name__ == "__main__":
    main()
