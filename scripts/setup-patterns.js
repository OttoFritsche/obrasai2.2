#!/usr/bin/env node

/**
 * 🚀 Script de Setup dos Padrões de Desenvolvimento
 * 
 * Este script automatiza a configuração inicial dos padrões
 * implementados no ObrasAI, incluindo:
 * - Configuração de contextos
 * - Templates de componentes
 * - Configuração de ferramentas de monitoramento
 * - Validação de dependências
 * 
 * @author ObrasAI Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

class PatternSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.srcPath = path.join(this.projectRoot, 'src');
    this.componentsPath = path.join(this.srcPath, 'components');
    this.contextsPath = path.join(this.srcPath, 'contexts');
    this.hooksPath = path.join(this.srcPath, 'hooks');
    this.templatesPath = path.join(this.projectRoot, 'templates');
  }

  async run() {
    try {
      log.title('🚀 Configurando Padrões de Desenvolvimento ObrasAI');
      
      await this.checkDependencies();
      await this.createDirectories();
      await this.createTemplates();
      await this.setupContextProviders();
      await this.createMigrationHelpers();
      await this.setupMonitoring();
      await this.generateExamples();
      
      log.title('🎉 Setup concluído com sucesso!');
      this.printNextSteps();
      
    } catch (error) {
      log.error(`Erro durante o setup: ${error.message}`);
      process.exit(1);
    }
  }

  async checkDependencies() {
    log.info('Verificando dependências...');
    
    const requiredDeps = [
      'react-hook-form',
      'zod',
      '@hookform/resolvers',
      'framer-motion',
      'lucide-react'
    ];
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json não encontrado. Execute este script na raiz do projeto.');
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const missingDeps = requiredDeps.filter(dep => !allDeps[dep]);
    
    if (missingDeps.length > 0) {
      log.warning(`Dependências faltando: ${missingDeps.join(', ')}`);
      log.info('Instalando dependências...');
      
      try {
        execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
        log.success('Dependências instaladas com sucesso!');
      } catch (error) {
        throw new Error('Falha ao instalar dependências. Instale manualmente.');
      }
    } else {
      log.success('Todas as dependências estão instaladas!');
    }
  }

  async createDirectories() {
    log.info('Criando estrutura de diretórios...');
    
    const directories = [
      this.contextsPath,
      this.hooksPath,
      path.join(this.componentsPath, 'forms'),
      path.join(this.componentsPath, 'dashboard'),
      path.join(this.componentsPath, 'ai'),
      path.join(this.componentsPath, 'examples'),
      this.templatesPath,
      path.join(this.projectRoot, 'docs'),
      path.join(this.projectRoot, 'scripts')
    ];
    
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log.success(`Diretório criado: ${path.relative(this.projectRoot, dir)}`);
      }
    });
  }

  async createTemplates() {
    log.info('Criando templates de componentes...');
    
    // Template de formulário com FormContext
    const formTemplate = `import React from 'react';
import { z } from 'zod';
import { FormProvider, useFormContext } from '@/contexts/FormContext';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// 1. Definir schema de validação
const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  // Adicione mais campos conforme necessário
});

type FormData = z.infer<typeof formSchema>;

// 2. Componente principal com FormProvider
const {{COMPONENT_NAME}}: React.FC = () => {
  const defaultValues: FormData = {
    name: '',
    email: '',
  };

  const handleSubmit = async (data: FormData) => {
    // Implementar lógica de submissão
    console.log('Dados do formulário:', data);
  };

  return (
    <FormProvider
      schema={formSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
    >
      <{{COMPONENT_NAME}}Content />
    </FormProvider>
  );
};

// 3. Componente interno com useFormContext
const {{COMPONENT_NAME}}Content: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<FormData>();
  
  const { executeAsync, isLoading } = useAsyncOperation({
    loadingKey: '{{COMPONENT_NAME_LOWER}}',
    errorMessage: 'Erro ao salvar dados'
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          {...register('name')}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Salvando...' : 'Salvar'}
      </Button>
    </div>
  );
};

export default {{COMPONENT_NAME}};`;

    // Template de hook customizado
    const hookTemplate = `import { useState, useCallback } from 'react';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

interface {{HOOK_NAME}}Options {
  // Definir opções do hook
}

interface {{HOOK_NAME}}Return {
  // Definir retorno do hook
  isLoading: boolean;
  error: string | null;
  execute: () => Promise<void>;
}

export const {{HOOK_NAME}} = (options: {{HOOK_NAME}}Options): {{HOOK_NAME}}Return => {
  const [data, setData] = useState(null);
  
  const { executeAsync, isLoading, error } = useAsyncOperation({
    loadingKey: '{{HOOK_NAME_LOWER}}',
    errorMessage: 'Erro na operação'
  });

  const execute = useCallback(async () => {
    await executeAsync(async () => {
      // Implementar lógica do hook
    });
  }, [executeAsync]);

  return {
    isLoading,
    error,
    execute
  };
};`;

    // Salvar templates
    fs.writeFileSync(
      path.join(this.templatesPath, 'form-component.template.tsx'),
      formTemplate
    );
    
    fs.writeFileSync(
      path.join(this.templatesPath, 'custom-hook.template.ts'),
      hookTemplate
    );
    
    log.success('Templates criados!');
  }

  async setupContextProviders() {
    log.info('Configurando providers de contexto...');
    
    const appProviderTemplate = `import React from 'react';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { Toaster } from '@/components/ui/toaster';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <LoadingProvider>
      {children}
      <Toaster />
    </LoadingProvider>
  );
};

export default AppProviders;`;
    
    fs.writeFileSync(
      path.join(this.componentsPath, 'AppProviders.tsx'),
      appProviderTemplate
    );
    
    log.success('AppProviders configurado!');
  }

  async createMigrationHelpers() {
    log.info('Criando helpers de migração...');
    
    const migrationScript = `#!/usr/bin/env node

/**
 * Script para migrar formulários existentes para os novos padrões
 */

const fs = require('fs');
const path = require('path');

class FormMigrator {
  constructor(filePath) {
    this.filePath = filePath;
    this.content = fs.readFileSync(filePath, 'utf8');
  }

  migrate() {
    console.log(\`Migrando: \${this.filePath}\`);
    
    // Detectar padrões antigos
    const hasUseState = this.content.includes('useState');
    const hasUseForm = this.content.includes('useForm(');
    const hasManualLoading = this.content.includes('setLoading(');
    
    if (hasUseState || hasUseForm || hasManualLoading) {
      console.log('⚠️  Padrões antigos detectados:');
      if (hasUseState) console.log('  - useState para dados de formulário');
      if (hasUseForm) console.log('  - useForm sem contexto');
      if (hasManualLoading) console.log('  - Loading state manual');
      
      console.log('\n📋 Passos para migração:');
      console.log('1. Criar schema de validação com Zod');
      console.log('2. Substituir useForm por useFormContext');
      console.log('3. Envolver componente com FormProvider');
      console.log('4. Substituir loading manual por useAsyncOperation');
      console.log('5. Testar funcionalidade');
    } else {
      console.log('✅ Componente já está usando os novos padrões!');
    }
  }
}

// Uso: node migrate-form.js path/to/component.tsx
const filePath = process.argv[2];
if (!filePath) {
  console.error('Uso: node migrate-form.js <caminho-do-arquivo>');
  process.exit(1);
}

const migrator = new FormMigrator(filePath);
migrator.migrate();`;
    
    fs.writeFileSync(
      path.join(this.projectRoot, 'scripts', 'migrate-form.js'),
      migrationScript
    );
    
    // Tornar o script executável
    try {
      fs.chmodSync(path.join(this.projectRoot, 'scripts', 'migrate-form.js'), '755');
    } catch (error) {
      // Ignorar erro no Windows
    }
    
    log.success('Helper de migração criado!');
  }

  async setupMonitoring() {
    log.info('Configurando ferramentas de monitoramento...');
    
    const monitoringConfig = `/**
 * Configuração de Monitoramento
 * 
 * Configure aqui os thresholds e alertas para o sistema de monitoramento
 */

export const monitoringConfig = {
  // Thresholds de performance
  performance: {
    loadingTime: {
      warning: 2000, // 2 segundos
      critical: 5000 // 5 segundos
    },
    errorRate: {
      warning: 5, // 5%
      critical: 10 // 10%
    },
    memoryUsage: {
      warning: 70, // 70%
      critical: 90 // 90%
    }
  },
  
  // Configuração de alertas
  alerts: {
    enableRealTime: true,
    enableEmail: false,
    enableSlack: false,
    retentionDays: 30
  },
  
  // Configuração de métricas
  metrics: {
    collectInterval: 30000, // 30 segundos
    batchSize: 100,
    enableUserMetrics: true,
    enablePerformanceMetrics: true
  },
  
  // Configuração do AI Widget
  aiWidget: {
    enablePredictiveAnalysis: true,
    enableProactiveAlerts: true,
    analysisInterval: 60000, // 1 minuto
    confidenceThreshold: 0.7
  }
};

export default monitoringConfig;`;
    
    fs.writeFileSync(
      path.join(this.srcPath, 'config', 'monitoring.ts'),
      monitoringConfig
    );
    
    // Criar diretório de config se não existir
    const configDir = path.join(this.srcPath, 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    log.success('Configuração de monitoramento criada!');
  }

  async generateExamples() {
    log.info('Gerando exemplos de uso...');
    
    const readmeContent = `# 🚀 Exemplos dos Padrões ObrasAI

Este diretório contém exemplos práticos de como usar os padrões implementados.

## 📁 Estrutura

- \`IntegratedPatternsDemo.tsx\` - Demonstração completa de todos os padrões
- \`SimpleFormExample.tsx\` - Exemplo de formulário simples
- \`WizardFormExample.tsx\` - Exemplo de formulário wizard
- \`AsyncOperationExample.tsx\` - Exemplo de operações assíncronas

## 🎯 Como usar

1. Copie o exemplo mais próximo do seu caso de uso
2. Adapte para suas necessidades específicas
3. Siga as melhores práticas documentadas
4. Teste thoroughly antes de fazer deploy

## 📚 Documentação

Para documentação completa, consulte: \`docs/DEVELOPMENT_PATTERNS_GUIDE.md\`
`;
    
    fs.writeFileSync(
      path.join(this.componentsPath, 'examples', 'README.md'),
      readmeContent
    );
    
    log.success('Exemplos e documentação criados!');
  }

  printNextSteps() {
    console.log(`
${colors.bright}📋 Próximos Passos:${colors.reset}
`);
    console.log('1. 📖 Leia a documentação completa em docs/DEVELOPMENT_PATTERNS_GUIDE.md');
    console.log('2. 🔧 Configure os providers em seu App.tsx:');
    console.log('   import AppProviders from \'./components/AppProviders\';');
    console.log('   // Envolva sua aplicação com <AppProviders>');
    console.log('3. 🧪 Execute os exemplos em components/examples/');
    console.log('4. 🔄 Migre formulários existentes usando scripts/migrate-form.js');
    console.log('5. 📊 Configure o monitoramento em src/config/monitoring.ts');
    console.log('6. 🤖 Integre o AI Widget em suas páginas principais');
    console.log('\n💡 Dica: Use os templates em templates/ para criar novos componentes!');
    console.log(`\n${colors.green}✨ Happy coding!${colors.reset}\n`);
  }
}

// Executar setup
if (require.main === module) {
  const setup = new PatternSetup();
  setup.run().catch(console.error);
}

module.exports = PatternSetup;