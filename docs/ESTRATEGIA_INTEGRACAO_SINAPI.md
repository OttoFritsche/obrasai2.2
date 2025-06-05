# 🎯 Estratégia de Integração com Dados Oficiais do SINAPI

## 📋 Situação Atual

### ✅ **Implementado:**

- **Estrutura de Staging**: Tabela `sinapi_composicoes_staging` criada
- **Rastreamento de Fontes**: Campo `fonte_dados` em `coeficientes_tecnicos`
- **Mapeamento**: Tabela `sinapi_mapeamento_coeficientes` para correlação
- **Logs**: Sistema de auditoria para importações
- **Dados Temporários**: Marcados como fonte "TEMPORARIO"

### 🔄 **Em Desenvolvimento:**

- Sistema de importação automatizada
- Validação e conversão de dados
- Interface para aprovação manual de mapeamentos

---

## 🛠️ Implementação por Fases

### **FASE 1: Download e Estruturação (Imediata)**

#### **1.1. Acesso aos Dados Oficiais**

```bash
# Links oficiais SINAPI 2024
https://www.caixa.gov.br/poder-publico/modernizacao-gestao/sinapi/

# Estrutura de arquivos:
- SINAPI_Custo_Ref_Composicoes_Sinteticas_SE_202412_Desonerado.xlsx
- SINAPI_Custo_Ref_Composicoes_Sinteticas_SE_202412_Nao_Desonerado.xlsx
- SINAPI_Preco_Ref_Insumos_SE_202412.xlsx
```

#### **1.2. Script de Download Automático**

```python
import requests
import pandas as pd
from datetime import datetime

def baixar_sinapi_mensal(mes_ano: str, regiao: str = "SE"):
    """
    Baixa tabelas SINAPI mensais automaticamente
    
    Args:
        mes_ano: formato "202412" 
        regiao: "SE", "S", "NE", "N", "CO"
    """
    base_url = "https://www.caixa.gov.br/Downloads/sinapi/"
    
    arquivos = [
        f"SINAPI_Custo_Ref_Composicoes_Sinteticas_{regiao}_{mes_ano}_Desonerado.xlsx",
        f"SINAPI_Preco_Ref_Insumos_{regiao}_{mes_ano}.xlsx"
    ]
    
    for arquivo in arquivos:
        # Implementar download
        pass
```

### **FASE 2: Processamento e Importação (1-2 semanas)**

#### **2.1. Parser de Dados SINAPI**

```sql
-- Função para processar arquivo Excel importado
CREATE OR REPLACE FUNCTION processar_excel_sinapi(
    arquivo_dados JSONB,
    mes_referencia DATE,
    regiao VARCHAR(10)
) RETURNS INTEGER AS $$
DECLARE
    registro JSONB;
    contador INTEGER := 0;
BEGIN
    -- Iterar sobre dados do Excel
    FOR registro IN SELECT * FROM jsonb_array_elements(arquivo_dados)
    LOOP
        INSERT INTO sinapi_composicoes_staging (
            codigo_sinapi,
            descricao,
            unidade,
            grupo_servico,
            custo_unitario,
            mes_referencia,
            regiao,
            composicao
        ) VALUES (
            registro->>'codigo',
            registro->>'descricao',
            registro->>'unidade',
            registro->>'grupo',
            (registro->>'custo')::DECIMAL,
            mes_referencia,
            regiao,
            registro->'composicao'
        );
        contador := contador + 1;
    END LOOP;
    
    RETURN contador;
END;
$$ LANGUAGE plpgsql;
```

#### **2.2. Mapeamento Automático**

```sql
-- Função para mapear automaticamente códigos SINAPI
CREATE OR REPLACE FUNCTION mapear_sinapi_automatico()
RETURNS INTEGER AS $$
DECLARE
    mapeamentos_criados INTEGER := 0;
    staging_record RECORD;
    coef_id UUID;
BEGIN
    FOR staging_record IN 
        SELECT * FROM sinapi_composicoes_staging 
        WHERE processado = false AND ativo = true
    LOOP
        -- Buscar correspondência por palavras-chave
        SELECT id INTO coef_id
        FROM coeficientes_tecnicos ct
        WHERE ct.fonte_dados = 'TEMPORARIO'
        AND (
            -- Busca por demolição
            (staging_record.descricao ILIKE '%demolic%' AND ct.etapa = 'DEMOLICAO') OR
            -- Busca por chapisco
            (staging_record.descricao ILIKE '%chapisco%' AND ct.insumo = 'CHAPISCO') OR
            -- Busca por revestimento
            (staging_record.descricao ILIKE '%revestimento%' AND ct.etapa = 'REVESTIMENTOS_INTERNOS')
        )
        LIMIT 1;
        
        IF coef_id IS NOT NULL THEN
            INSERT INTO sinapi_mapeamento_coeficientes (
                codigo_sinapi,
                coeficiente_interno_id,
                tipo_mapeamento,
                observacoes_mapeamento
            ) VALUES (
                staging_record.codigo_sinapi,
                coef_id,
                'AUTOMATICO',
                'Mapeamento automático por palavras-chave'
            );
            
            mapeamentos_criados := mapeamentos_criados + 1;
        END IF;
    END LOOP;
    
    RETURN mapeamentos_criados;
END;
$$ LANGUAGE plpgsql;
```

### **FASE 3: Validação e Aprovação (1 semana)**

#### **3.1. Interface de Validação**

```typescript
// Component React para validar mapeamentos
interface MapeamentoValidacao {
    codigo_sinapi: string;
    descricao_sinapi: string;
    coeficiente_interno: {
        tipo_obra: string;
        etapa: string;
        insumo: string;
        quantidade_por_m2: number;
    };
    tipo_mapeamento: "AUTOMATICO" | "MANUAL" | "CALCULADO";
    validado: boolean;
}

const ValidarMapeamentos: React.FC = () => {
    const [mapeamentos, setMapeamentos] = useState<MapeamentoValidacao[]>([]);

    const aprovarMapeamento = async (id: number) => {
        // Aprovar mapeamento específico
        await supabase
            .from("sinapi_mapeamento_coeficientes")
            .update({ validado: true })
            .eq("id", id);
    };

    return (
        <div className="mapeamentos-validacao">
            {mapeamentos.map((mapeamento) => (
                <MapeamentoCard
                    key={mapeamento.codigo_sinapi}
                    mapeamento={mapeamento}
                    onAprovar={aprovarMapeamento}
                />
            ))}
        </div>
    );
};
```

#### **3.2. Atualização de Coeficientes Validados**

```sql
-- Substituir dados temporários por oficiais
CREATE OR REPLACE FUNCTION aplicar_dados_sinapi_validados()
RETURNS INTEGER AS $$
DECLARE
    aplicados INTEGER := 0;
    mapeamento RECORD;
    composicao_sinapi JSONB;
    novo_coeficiente DECIMAL;
BEGIN
    FOR mapeamento IN 
        SELECT sm.*, scs.composicao, scs.custo_unitario
        FROM sinapi_mapeamento_coeficientes sm
        JOIN sinapi_composicoes_staging scs ON sm.codigo_sinapi = scs.codigo_sinapi
        WHERE sm.validado = true
    LOOP
        -- Calcular novo coeficiente baseado na composição SINAPI
        novo_coeficiente := calcular_coeficiente_da_composicao(mapeamento.composicao);
        
        -- Atualizar coeficiente técnico
        UPDATE coeficientes_tecnicos 
        SET 
            quantidade_por_m2 = novo_coeficiente,
            fonte_dados = 'SINAPI_OFICIAL',
            codigo_sinapi = mapeamento.codigo_sinapi,
            validado_oficialmente = true,
            data_referencia = (SELECT mes_referencia FROM sinapi_composicoes_staging WHERE codigo_sinapi = mapeamento.codigo_sinapi),
            updated_at = NOW()
        WHERE id = mapeamento.coeficiente_interno_id;
        
        aplicados := aplicados + 1;
    END LOOP;
    
    RETURN aplicados;
END;
$$ LANGUAGE plpgsql;
```

---

## 📅 Cronograma de Implementação

### **Semana 1-2: Infraestrutura**

- [x] ✅ Estrutura de banco criada
- [ ] ⏳ Script de download automático
- [ ] ⏳ Parser de arquivos Excel
- [ ] ⏳ Testes de importação manual

### **Semana 3-4: Automação**

- [ ] 🔄 Mapeamento automático
- [ ] 🔄 Interface de validação
- [ ] 🔄 Sistema de logs e auditoria
- [ ] 🔄 Testes de integração

### **Semana 5-6: Validação e Deploy**

- [ ] 🔄 Validação manual dos primeiros mapeamentos
- [ ] 🔄 Aplicação de dados oficiais
- [ ] 🔄 Comparação de resultados
- [ ] 🔄 Deploy em produção

---

## 🎯 Resultados Esperados

### **Qualidade dos Dados**

- **Antes**: Dados temporários/estimados
- **Depois**: Dados oficiais SINAPI validados
- **Melhoria**: 95%+ de precisão vs. mercado real

### **Cobertura de Serviços**

- **Meta**: 80% dos serviços com dados oficiais
- **Prioridade**: Reforma e demolição (foco do projeto)
- **Backup**: Dados temporários para serviços não mapeados

### **Atualização Mensal**

- **Frequência**: Automática, todo dia 15 do mês
- **Notificação**: Alertas para novos dados disponíveis
- **Validação**: Review manual de mudanças significativas

---

## 🔧 Ferramentas e Scripts Necessários

### **1. Script Python de Importação**

```bash
# Instalar dependências
pip install pandas openpyxl requests psycopg2

# Executar importação mensal
python scripts/importar_sinapi.py --mes=202412 --regiao=SE
```

### **2. Interface Web de Validação**

```bash
# Componente React específico
src/components/admin/SinapiValidation.tsx

# Página de administração
src/pages/admin/sinapi-integration.tsx
```

### **3. Jobs Automatizados**

```sql
-- Configurar job mensal (depende do ambiente)
SELECT cron.schedule(
    'importar-sinapi-mensal',
    '0 0 15 * *',  -- Todo dia 15 às 00:00
    'SELECT processar_importacao_sinapi_mensal();'
);
```

---

## ⚠️ Considerações Importantes

### **Aspectos Legais**

- ✅ SINAPI é público e gratuito
- ✅ Dados podem ser utilizados comercialmente
- ⚠️ Manter atribuição à fonte oficial

### **Aspectos Técnicos**

- 🔄 Arquivos Excel grandes (até 50MB)
- 🔄 Processamento pode demorar alguns minutos
- 🔄 Necessário monitoramento de mudanças de estrutura

### **Aspectos de Negócio**

- 💡 Diferencial competitivo significativo
- 💡 Credibilidade com dados oficiais
- 💡 Base para certificações futuras

---

## 🚀 Próximos Passos Recomendados

1. **Implementar download automático** (prioridade alta)
2. **Criar parser básico** para 1-2 tipos de serviço
3. **Testar com dados reais** em ambiente de desenvolvimento
4. **Criar interface de validação** simples
5. **Documentar processo** para outros desenvolvedores

---

_Documento criado em: ${new Date().toLocaleDateString('pt-BR')}_ _Status: Em
implementação_ _Próxima revisão: Semanal_
