// Regras específicas para organização de importações
module.exports = {
  rules: {
    // Ordena importações em grupos específicos
    'import/order': [
      'error',
      {
        groups: [
          'builtin',     // Node.js built-ins
          'external',    // Bibliotecas externas (npm packages)
          'internal',    // Imports internos do projeto
          'parent',      // Imports relativos do diretório pai
          'sibling',     // Imports relativos do mesmo diretório
          'index',       // Index imports
          'type'         // Type imports
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before'
          },
          {
            pattern: 'react-**',
            group: 'external',
            position: 'before'
          },
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@/components/layouts/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@/components/ui/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@/components/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@/contexts/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@/hooks/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@/integrations/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@/lib/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@/services/**',
            group: 'internal',
            position: 'after'
          },
          {
            pattern: '@/types/**',
            group: 'internal',
            position: 'after'
          }
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],
    
    // Força uso de import type para tipos
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: false
      }
    ],
    
    // Evita imports não utilizados
    'unused-imports/no-unused-imports': 'error',
    
    // Força agrupamento de imports do mesmo módulo
    'import/no-duplicates': 'error',
    
    // Evita imports de desenvolvimento em produção
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.{ts,tsx}',
          '**/*.spec.{ts,tsx}',
          '**/test/**/*',
          '**/tests/**/*',
          '**/__tests__/**/*',
          '**/vite.config.ts',
          '**/vitest.config.ts'
        ]
      }
    ]
  },
  
  // Plugins necessários
  plugins: [
    'import',
    'unused-imports',
    '@typescript-eslint'
  ],
  
  // Configurações específicas para resolver imports
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  }
};