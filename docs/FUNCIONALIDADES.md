# Funcionalidades do Sistema Pharma.AI

## 📍 Busca Automática de CEP

### Descrição

O sistema possui funcionalidade de busca automática de endereço através do CEP,
facilitando o cadastro de obras e fornecedores.

### Como Funciona

#### 1. **Cadastro de Nova Obra**

- O campo CEP é o primeiro campo da seção "Localização"
- Ao digitar um CEP válido (8 dígitos), o sistema automaticamente:
  - Formata o CEP para o padrão brasileiro (00000-000)
  - Busca as informações de endereço na API dos Correios (ViaCEP)
  - Preenche automaticamente os campos:
    - **Endereço**: Logradouro retornado pela API
    - **Cidade**: Localidade retornada pela API
    - **Estado**: UF retornada pela API
  - Exibe uma notificação de sucesso quando o endereço é preenchido

#### 2. **Edição de Obra**

- Mesma funcionalidade disponível no formulário de edição
- Permite atualizar o endereço alterando o CEP
- Notificação específica: "Endereço atualizado automaticamente!"

### Tecnologias Utilizadas

#### Hook Personalizado: `useCEP`

```typescript
const { buscarCEP, formatarCEP, isLoading, error } = useCEP();
```

**Funcionalidades do Hook:**

- `buscarCEP(cep: string)`: Busca dados do endereço
- `formatarCEP(cep: string)`: Formata CEP para padrão brasileiro
- `limparCEP(cep: string)`: Remove formatação do CEP
- `isLoading`: Estado de carregamento da busca
- `error`: Mensagem de erro, se houver
- `clearError()`: Limpa mensagens de erro

#### Edge Function

- Utiliza a Edge Function `document-validator` existente
- Endpoint: `/functions/document-validator`
- Parâmetros: `{ documento: cep, tipo: 'cep' }`
- Integração com API ViaCEP para dados precisos

### Interface do Usuário

#### Indicadores Visuais

- **Ícone de busca**: Aparece no campo CEP
- **Loading spinner**: Exibido durante a busca
- **Formatação automática**: CEP formatado enquanto digita
- **Notificações toast**: Feedback de sucesso ou erro

#### Validação

- CEP deve ter exatamente 8 dígitos
- Aceita formato com ou sem hífen
- Validação em tempo real com Zod schema
- Mensagens de erro específicas para cada situação

### Fluxo de Uso

1. **Usuário acessa** formulário de nova obra
2. **Digita o CEP** no primeiro campo
3. **Sistema formata** automaticamente (00000-000)
4. **Quando completo** (8 dígitos), busca é iniciada
5. **Loading aparece** no label do campo
6. **Dados retornam** e preenchem campos automaticamente
7. **Notificação de sucesso** é exibida
8. **Usuário pode editar** os campos se necessário

### Tratamento de Erros

#### Cenários de Erro

- CEP inválido ou não encontrado
- Erro de conexão com a API
- Timeout na requisição
- CEP com formato incorreto

#### Feedback ao Usuário

- Mensagens de erro específicas via toast
- Campo CEP mantém foco para correção
- Possibilidade de preenchimento manual dos campos

### Benefícios

#### Para o Usuário

- **Agilidade**: Preenchimento automático de 3 campos
- **Precisão**: Dados oficiais dos Correios
- **Facilidade**: Menos digitação e erros
- **Flexibilidade**: Pode editar campos após preenchimento

#### Para o Sistema

- **Padronização**: Endereços consistentes
- **Validação**: CEPs verificados automaticamente
- **Performance**: Cache da API ViaCEP
- **Escalabilidade**: Funcionalidade reutilizável

### Arquivos Modificados

```
src/
├── hooks/
│   └── useCEP.ts                    # Hook personalizado para CEP
├── pages/dashboard/obras/
│   ├── NovaObra.tsx                 # Formulário de nova obra
│   └── EditarObra.tsx               # Formulário de edição
└── lib/validations/
    └── obra.ts                      # Schema atualizado com validação CEP
```

### Próximas Melhorias

#### Funcionalidades Planejadas

- [ ] Cache local de CEPs consultados
- [ ] Busca por endereço (autocomplete)
- [ ] Integração com Google Maps
- [ ] Validação de endereços existentes
- [ ] Histórico de endereços utilizados

#### Otimizações Técnicas

- [ ] Debounce na busca de CEP
- [ ] Retry automático em caso de falha
- [ ] Fallback para outras APIs de CEP
- [ ] Compressão de dados da API

---

_Documentação atualizada em: 26/12/2024_ _Versão: 1.0.0_
