#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Limpeza - Tabelas SINAPI Desnecessárias
================================================

Remove tabelas SINAPI vazias e não utilizadas para otimizar o banco de dados.

Tabelas a serem removidas:
- sinapi_import_log (0 registros - vazia e não utilizada)
- sinapi_mapeamento_coeficientes (0 registros - vazia e não implementada)  
- sinapi_composicoes_staging (2 registros - dados de teste)

Tabelas mantidas:
- sinapi_manutencoes (25.361 registros - core do projeto)
- sinapi_insumos (4.837 registros - essencial para orçamentos)
- sinapi_dados_oficiais (31 registros - metadados oficiais)
- sinapi_composicoes_mao_obra (7.800 registros - avaliar uso futuro)

Autor: ObrasAI Team
Data: 2024-12-26
"""

import os
import sys
import logging
from datetime import datetime
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurar logging


def configurar_logging():
    """Configura sistema de logs"""
    log_dir = Path('logs')
    log_dir.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    log_file = log_dir / f'cleanup_sinapi_{timestamp}.log'

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file, encoding='utf-8'),
            logging.StreamHandler(sys.stdout)
        ]
    )

    return str(log_file)


class LimpadorTabelasSinapi:
    """Classe para limpeza de tabelas SINAPI desnecessárias"""

    def __init__(self):
        """Inicializar o limpador"""
        self.supabase_url = os.getenv('VITE_SUPABASE_URL')
        self.supabase_key = os.getenv('VITE_SUPABASE_ROLE_KEY')

        if not self.supabase_url or not self.supabase_key:
            # Fallback para as chaves do arquivo env
            self.supabase_url = os.getenv('SUPABASE_URL')
            self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')

        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Variáveis de ambiente SUPABASE não encontradas")

        logging.info(
            "🔌 Conectando ao Supabase com privilégios administrativos...")
        self.supabase: Client = create_client(
            self.supabase_url, self.supabase_key)

        # Tabelas a serem removidas
        self.tabelas_para_remover = [
            'sinapi_import_log',
            'sinapi_mapeamento_coeficientes',
            'sinapi_composicoes_staging'
        ]

    def verificar_tabelas_existentes(self):
        """Verifica quais tabelas existem no banco"""
        logging.info("🔍 Verificando tabelas SINAPI existentes...")

        try:
            # Query para listar tabelas SINAPI
            query = """
            SELECT tablename 
            FROM pg_tables 
            WHERE tablename LIKE 'sinapi_%' 
            AND schemaname = 'public'
            ORDER BY tablename;
            """

            result = self.supabase.rpc(
                'execute_sql', {'query': query}).execute()

            if result.data:
                tabelas_existentes = [row['tablename'] for row in result.data]
                logging.info(
                    f"📋 Tabelas SINAPI encontradas: {tabelas_existentes}")
                return tabelas_existentes
            else:
                logging.warning("⚠️ Nenhuma tabela SINAPI encontrada")
                return []

        except Exception as e:
            logging.error(f"❌ Erro ao verificar tabelas: {e}")
            return []

    def contar_registros_tabela(self, nome_tabela):
        """Conta registros em uma tabela"""
        try:
            result = self.supabase.table(nome_tabela).select(
                '*', count='exact').execute()
            return result.count if result.count is not None else 0
        except Exception as e:
            logging.warning(
                f"⚠️ Erro ao contar registros da tabela {nome_tabela}: {e}")
            return 0

    def remover_tabela(self, nome_tabela):
        """Remove uma tabela específica"""
        try:
            logging.info(f"🗑️ Removendo tabela {nome_tabela}...")

            # Contar registros antes da remoção
            count = self.contar_registros_tabela(nome_tabela)
            logging.info(f"📊 Tabela {nome_tabela} possui {count} registros")

            # Executar DROP TABLE
            query = f"DROP TABLE IF EXISTS {nome_tabela} CASCADE;"
            result = self.supabase.rpc(
                'execute_sql', {'query': query}).execute()

            logging.info(f"✅ Tabela {nome_tabela} removida com sucesso")
            return True

        except Exception as e:
            logging.error(f"❌ Erro ao remover tabela {nome_tabela}: {e}")
            return False

    def executar_limpeza(self):
        """Executa a limpeza das tabelas desnecessárias"""
        logging.info("🚀 Iniciando limpeza de tabelas SINAPI desnecessárias...")

        # Verificar tabelas existentes
        tabelas_existentes = self.verificar_tabelas_existentes()

        if not tabelas_existentes:
            logging.warning(
                "⚠️ Nenhuma tabela SINAPI encontrada. Nada para limpar.")
            return False

        # Estatísticas
        tabelas_removidas = 0
        tabelas_nao_encontradas = 0
        erros = 0

        # Processar cada tabela para remoção
        for tabela in self.tabelas_para_remover:
            if tabela in tabelas_existentes:
                if self.remover_tabela(tabela):
                    tabelas_removidas += 1
                else:
                    erros += 1
            else:
                logging.info(
                    f"⚠️ Tabela {tabela} não existe (já foi removida)")
                tabelas_nao_encontradas += 1

        # Relatório final
        logging.info("🎉 LIMPEZA CONCLUÍDA!")
        logging.info(f"📊 Estatísticas:")
        logging.info(f"   - Tabelas removidas: {tabelas_removidas}")
        logging.info(
            f"   - Tabelas não encontradas: {tabelas_nao_encontradas}")
        logging.info(f"   - Erros: {erros}")

        # Verificar tabelas restantes
        self.verificar_tabelas_restantes()

        return erros == 0

    def verificar_tabelas_restantes(self):
        """Verifica e lista tabelas SINAPI restantes após limpeza"""
        logging.info("📋 Verificando tabelas SINAPI restantes...")

        tabelas_restantes = self.verificar_tabelas_existentes()

        if tabelas_restantes:
            logging.info("✅ Tabelas SINAPI mantidas:")
            for tabela in tabelas_restantes:
                count = self.contar_registros_tabela(tabela)
                logging.info(f"   - {tabela}: {count:,} registros")
        else:
            logging.warning("⚠️ Nenhuma tabela SINAPI restante encontrada")


def main():
    """Função principal"""
    print("🗑️ LIMPEZA DE TABELAS SINAPI DESNECESSÁRIAS")
    print("=" * 50)

    # Configurar logging
    log_file = configurar_logging()
    logging.info(f"📝 Log salvo em: {log_file}")

    try:
        # Criar instância do limpador
        limpador = LimpadorTabelasSinapi()

        # Confirmar execução
        print("\n⚠️ ATENÇÃO: Este script irá remover as seguintes tabelas:")
        for tabela in limpador.tabelas_para_remover:
            print(f"   - {tabela}")

        confirmacao = input("\n❓ Deseja continuar? (s/N): ").strip().lower()

        if confirmacao not in ['s', 'sim', 'y', 'yes']:
            logging.info("❌ Operação cancelada pelo usuário")
            print("❌ Operação cancelada")
            return

        # Executar limpeza
        sucesso = limpador.executar_limpeza()

        if sucesso:
            print("✅ Limpeza concluída com sucesso!")
            logging.info("✅ Limpeza concluída com sucesso!")
        else:
            print("❌ Limpeza concluída com erros. Verifique o log.")
            logging.error("❌ Limpeza concluída com erros")

    except Exception as e:
        logging.error(f"❌ Erro crítico: {e}")
        print(f"❌ Erro crítico: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
