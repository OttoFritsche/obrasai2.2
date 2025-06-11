import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testarBuscaSemantica() {
  const consultas = [
    'Como criar um orçamento de obra?',
    'Quais são os tipos de despesas em uma obra?',
    'Como funciona o controle de obras?',
    'Documentação sobre contratos de construção'
  ]

  for (const consulta of consultas) {
    console.log(`\n🔍 Testando: "${consulta}"`)
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-contextual', {
        body: {
          message: consulta,
          context_type: 'documentacao'
        }
      })

      if (error) {
        console.error('❌ Erro:', error)
        continue
      }

      console.log('✅ Resposta:', data.response)
      console.log('📚 Contexto encontrado:', data.context_used ? 'Sim' : 'Não')
      
    } catch (error) {
      console.error('❌ Erro na consulta:', error)
    }
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testarBuscaSemantica().catch(console.error)
}

export { testarBuscaSemantica }