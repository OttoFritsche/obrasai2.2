#!/usr/bin/env node

/**
 * Script de Verificação da Organização do Projeto ObrasAI
 * 
 * Este script verifica se todas as melhorias de organização foram aplicadas:
 * - Componentes movidos para pastas corretas
 * - Importações padronizadas
 * - Regras de linting configuradas
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✅ ${description}`, 'green');
  } else {
    log(`❌ ${description}`, 'red');
  }
  return exists;
}

function checkDirectoryStructure() {
  log('\n📁 Verificando Estrutura de Diretórios...', 'blue');
  
  const checks = [
    {
      path: path.join(SRC_DIR, 'components', 'sinapi', 'InsumoAnalysisCard.tsx'),
      description: 'InsumoAnalysisCard.tsx movido para components/sinapi/'
    },
    {
      path: path.join(SRC_DIR, 'components', 'sinapi', 'SinapiSelectorDespesas.tsx'),
      description: 'SinapiSelectorDespesas.tsx movido para components/sinapi/'
    },
    {
      path: path.join(SRC_DIR, 'components', 'sinapi', 'VariacaoSinapiIndicator.tsx'),
      description: 'VariacaoSinapiIndicator.tsx movido para components/sinapi/'
    },
    {
      path: path.join(SRC_DIR, 'components', 'examples', 'LoadingContextExample.tsx'),
      description: 'LoadingContextExample.tsx movido para components/examples/'
    },
    {
      path: path.join(SRC_DIR, 'components', 'examples', 'ErrorHandlingExample.tsx'),
      description: 'ErrorHandlingExample.tsx movido para components/examples/'
    }
  ];
  
  const oldPaths = [
    {
      path: path.join(SRC_DIR, 'examples'),
      description: 'Pasta src/examples/ removida'
    },
    {
      path: path.join(SRC_DIR, 'components', 'InsumoAnalysisCard.tsx'),
      description: 'InsumoAnalysisCard.tsx removido da raiz de components/'
    }
  ];
  
  let allPassed = true;
  
  // Verificar arquivos movidos
  checks.forEach(check => {
    if (!checkFileExists(check.path, check.description)) {
      allPassed = false;
    }
  });
  
  // Verificar remoções
  oldPaths.forEach(check => {
    const exists = fs.existsSync(check.path);
    if (!exists) {
      log(`✅ ${check.description}`, 'green');
    } else {
      log(`❌ ${check.description}`, 'red');
      allPassed = false;
    }
  });
  
  return allPassed;
}

function checkLintingConfiguration() {
  log('\n🔧 Verificando Configuração de Linting...', 'blue');
  
  const checks = [
    {
      path: path.join(ROOT_DIR, '.eslintrc.imports.js'),
      description: 'Arquivo .eslintrc.imports.js criado'
    },
    {
      path: path.join(ROOT_DIR, '.vscode', 'settings.json'),
      description: 'Configurações do VSCode atualizadas'
    }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    if (!checkFileExists(check.path, check.description)) {
      allPassed = false;
    }
  });
  
  // Verificar package.json
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const hasImportScripts = packageJson.scripts && 
                            packageJson.scripts['lint:imports'] && 
                            packageJson.scripts['organize:imports'];
    
    if (hasImportScripts) {
      log('✅ Scripts de organização de imports adicionados ao package.json', 'green');
    } else {
      log('❌ Scripts de organização de imports não encontrados no package.json', 'red');
      allPassed = false;
    }
  }
  
  return allPassed;
}

function checkImportOrganization() {
  log('\n📦 Verificando Organização de Imports...', 'blue');
  
  const filesToCheck = [
    path.join(SRC_DIR, 'pages', 'dashboard', 'obras', 'ObrasListaRefactored.tsx'),
    path.join(SRC_DIR, 'pages', 'dashboard', 'obras', 'NovaObraRefactored.tsx'),
    path.join(SRC_DIR, 'pages', 'dashboard', 'notas', 'EnviarNota.tsx')
  ];
  
  let allPassed = true;
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasOrganizedImports = content.includes('// Bibliotecas externas') &&
                                 content.includes('// Componentes UI') &&
                                 content.includes('// Hooks');
      
      if (hasOrganizedImports) {
        log(`✅ Imports organizados em ${path.basename(filePath)}`, 'green');
      } else {
        log(`❌ Imports não organizados em ${path.basename(filePath)}`, 'red');
        allPassed = false;
      }
    } else {
      log(`❌ Arquivo não encontrado: ${path.basename(filePath)}`, 'red');
      allPassed = false;
    }
  });
  
  return allPassed;
}

function checkDocumentation() {
  log('\n📚 Verificando Documentação...', 'blue');
  
  const docPath = path.join(ROOT_DIR, 'ORGANIZACAO_PROJETO.md');
  return checkFileExists(docPath, 'Documentação ORGANIZACAO_PROJETO.md criada');
}

function main() {
  log('🚀 Iniciando Verificação da Organização do Projeto ObrasAI', 'blue');
  log('=' * 60, 'blue');
  
  const results = {
    structure: checkDirectoryStructure(),
    linting: checkLintingConfiguration(),
    imports: checkImportOrganization(),
    documentation: checkDocumentation()
  };
  
  log('\n📊 Resumo dos Resultados:', 'blue');
  log('=' * 30, 'blue');
  
  Object.entries(results).forEach(([category, passed]) => {
    const status = passed ? '✅ PASSOU' : '❌ FALHOU';
    const color = passed ? 'green' : 'red';
    log(`${category.toUpperCase()}: ${status}`, color);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    log('\n🎉 Todas as verificações passaram! Projeto organizado com sucesso.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Algumas verificações falharam. Revise os itens marcados em vermelho.', 'yellow');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkDirectoryStructure,
  checkLintingConfiguration,
  checkImportOrganization,
  checkDocumentation
};