#!/usr/bin/env node

/**
 * Script para executar todos os testes de acessibilidade do ObrasAI
 * 
 * Este script:
 * 1. Executa todos os testes de acessibilidade
 * 2. Gera relatórios detalhados
 * 3. Cria métricas de acessibilidade
 * 4. Sugere melhorias
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface AccessibilityMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  criticalViolations: number;
  seriousViolations: number;
  moderateViolations: number;
  minorViolations: number;
  coveragePercentage: number;
  timestamp: string;
}

interface TestResult {
  testFile: string;
  status: 'passed' | 'failed';
  violations: any[];
  duration: number;
}

class AccessibilityTestRunner {
  private results: TestResult[] = [];
  private outputDir = path.join(process.cwd(), 'accessibility-reports');

  constructor() {
    this.ensureOutputDir();
  }

  private ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Iniciando Auditoria de Acessibilidade ObrasAI\n');
    
    const testFiles = [
      'Header.accessibility.test.tsx',
      'Forms.accessibility.test.tsx', 
      'Images.accessibility.test.tsx',
      'LandingPage.accessibility.test.tsx'
    ];

    for (const testFile of testFiles) {
      await this.runSingleTest(testFile);
    }

    this.generateReports();
    this.printSummary();
  }

  private async runSingleTest(testFile: string): Promise<void> {
    console.log(`📋 Executando: ${testFile}`);
    const startTime = Date.now();
    
    try {
      const command = `npm test src/tests/accessibility/components/${testFile} -- --reporter=json`;
      const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
      
      const result: TestResult = {
        testFile,
        status: 'passed',
        violations: [],
        duration: Date.now() - startTime
      };
      
      this.results.push(result);
      console.log(`✅ ${testFile} - PASSOU (${result.duration}ms)`);
      
    } catch (error: any) {
      const result: TestResult = {
        testFile,
        status: 'failed',
        violations: this.parseViolations(error.stdout || error.message),
        duration: Date.now() - startTime
      };
      
      this.results.push(result);
      console.log(`❌ ${testFile} - FALHOU (${result.duration}ms)`);
      console.log(`   Erro: ${error.message.split('\n')[0]}`);
    }
  }

  private parseViolations(output: string): any[] {
    // Tenta extrair violações do output do teste
    try {
      const jsonMatch = output.match(/\{.*"violations".*\}/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.violations || [];
      }
    } catch {
      // Se não conseguir parsear, retorna array vazio
    }
    return [];
  }

  private generateReports(): void {
    this.generateJsonReport();
    this.generateHtmlReport();
    this.generateMarkdownReport();
    this.generateMetrics();
  }

  private generateJsonReport(): void {
    const reportPath = path.join(this.outputDir, 'accessibility-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.calculateSummary(),
      results: this.results,
      recommendations: this.generateRecommendations()
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Relatório JSON gerado: ${reportPath}`);
  }

  private generateHtmlReport(): void {
    const reportPath = path.join(this.outputDir, 'accessibility-report.html');
    const summary = this.calculateSummary();
    
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Acessibilidade - ObrasAI</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2563eb; }
        .metric-label { color: #6b7280; margin-top: 5px; }
        .test-results { margin-bottom: 30px; }
        .test-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 6px; }
        .test-passed { border-left: 4px solid #10b981; }
        .test-failed { border-left: 4px solid #ef4444; }
        .recommendations { background: #fef3c7; padding: 20px; border-radius: 6px; }
        .violation { background: #fee2e2; padding: 10px; margin: 5px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Relatório de Acessibilidade - ObrasAI</h1>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${summary.passedTests}/${summary.totalTests}</div>
                <div class="metric-label">Testes Aprovados</div>
            </div>
            <div class="metric">
                <div class="metric-value">${summary.coveragePercentage}%</div>
                <div class="metric-label">Cobertura</div>
            </div>
            <div class="metric">
                <div class="metric-value">${summary.criticalViolations}</div>
                <div class="metric-label">Violações Críticas</div>
            </div>
            <div class="metric">
                <div class="metric-value">${summary.seriousViolations}</div>
                <div class="metric-label">Violações Sérias</div>
            </div>
        </div>
        
        <div class="test-results">
            <h2>📋 Resultados dos Testes</h2>
            ${this.results.map(result => `
                <div class="test-item ${result.status === 'passed' ? 'test-passed' : 'test-failed'}">
                    <h3>${result.testFile}</h3>
                    <p><strong>Status:</strong> ${result.status === 'passed' ? '✅ Aprovado' : '❌ Reprovado'}</p>
                    <p><strong>Duração:</strong> ${result.duration}ms</p>
                    ${result.violations.length > 0 ? `
                        <h4>Violações:</h4>
                        ${result.violations.map(v => `<div class="violation">${v.id}: ${v.description}</div>`).join('')}
                    ` : ''}
                </div>
            `).join('')}
        </div>
        
        <div class="recommendations">
            <h2>💡 Recomendações</h2>
            ${this.generateRecommendations().map(rec => `<p>• ${rec}</p>`).join('')}
        </div>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(reportPath, html);
    console.log(`📄 Relatório HTML gerado: ${reportPath}`);
  }

  private generateMarkdownReport(): void {
    const reportPath = path.join(this.outputDir, 'accessibility-report.md');
    const summary = this.calculateSummary();
    
    const markdown = `# 🔍 Relatório de Acessibilidade - ObrasAI

**Gerado em:** ${new Date().toLocaleString('pt-BR')}

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Testes Executados | ${summary.totalTests} |
| Testes Aprovados | ${summary.passedTests} |
| Taxa de Sucesso | ${summary.coveragePercentage}% |
| Violações Críticas | ${summary.criticalViolations} |
| Violações Sérias | ${summary.seriousViolations} |
| Violações Moderadas | ${summary.moderateViolations} |
| Violações Menores | ${summary.minorViolations} |

## 📋 Resultados Detalhados

${this.results.map(result => `
### ${result.testFile}

- **Status:** ${result.status === 'passed' ? '✅ Aprovado' : '❌ Reprovado'}
- **Duração:** ${result.duration}ms
- **Violações:** ${result.violations.length}

${result.violations.length > 0 ? `
#### Violações Encontradas:

${result.violations.map(v => `- **${v.id}:** ${v.description}`).join('\n')}
` : ''}
`).join('')}

## 💡 Recomendações

${this.generateRecommendations().map(rec => `- ${rec}`).join('\n')}

## 🎯 Próximos Passos

1. **Corrigir violações críticas** - Prioridade máxima
2. **Implementar testes manuais** - Navegação por teclado
3. **Testar com screen readers** - NVDA, JAWS, VoiceOver
4. **Validar com usuários reais** - Pessoas com deficiência
5. **Automatizar no CI/CD** - Executar testes a cada deploy

---

*Relatório gerado automaticamente pelo sistema de auditoria de acessibilidade do ObrasAI*
`;
    
    fs.writeFileSync(reportPath, markdown);
    console.log(`📄 Relatório Markdown gerado: ${reportPath}`);
  }

  private generateMetrics(): void {
    const metricsPath = path.join(this.outputDir, 'accessibility-metrics.json');
    const summary = this.calculateSummary();
    
    const metrics: AccessibilityMetrics = {
      ...summary,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
    console.log(`📊 Métricas geradas: ${metricsPath}`);
  }

  private calculateSummary() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'passed').length;
    const failedTests = totalTests - passedTests;
    
    const allViolations = this.results.flatMap(r => r.violations);
    const criticalViolations = allViolations.filter(v => v.impact === 'critical').length;
    const seriousViolations = allViolations.filter(v => v.impact === 'serious').length;
    const moderateViolations = allViolations.filter(v => v.impact === 'moderate').length;
    const minorViolations = allViolations.filter(v => v.impact === 'minor').length;
    
    const coveragePercentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    return {
      totalTests,
      passedTests,
      failedTests,
      criticalViolations,
      seriousViolations,
      moderateViolations,
      minorViolations,
      coveragePercentage
    };
  }

  private generateRecommendations(): string[] {
    const recommendations = [];
    const summary = this.calculateSummary();
    
    if (summary.criticalViolations > 0) {
      recommendations.push('Corrigir imediatamente todas as violações críticas de acessibilidade');
    }
    
    if (summary.seriousViolations > 0) {
      recommendations.push('Priorizar correção das violações sérias nas próximas sprints');
    }
    
    if (summary.coveragePercentage < 80) {
      recommendations.push('Aumentar cobertura de testes de acessibilidade para pelo menos 80%');
    }
    
    recommendations.push('Implementar testes manuais de navegação por teclado');
    recommendations.push('Testar com screen readers (NVDA, JAWS, VoiceOver)');
    recommendations.push('Validar contraste de cores com ferramentas como Lighthouse');
    recommendations.push('Adicionar skip links para navegação rápida');
    recommendations.push('Implementar live regions para anúncios dinâmicos');
    recommendations.push('Treinar equipe em práticas de acessibilidade');
    recommendations.push('Integrar testes de acessibilidade no pipeline CI/CD');
    
    return recommendations;
  }

  private printSummary(): void {
    const summary = this.calculateSummary();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA AUDITORIA DE ACESSIBILIDADE');
    console.log('='.repeat(60));
    console.log(`📋 Testes executados: ${summary.totalTests}`);
    console.log(`✅ Testes aprovados: ${summary.passedTests}`);
    console.log(`❌ Testes reprovados: ${summary.failedTests}`);
    console.log(`📈 Taxa de sucesso: ${summary.coveragePercentage}%`);
    console.log('');
    console.log('🚨 VIOLAÇÕES POR SEVERIDADE:');
    console.log(`   Críticas: ${summary.criticalViolations}`);
    console.log(`   Sérias: ${summary.seriousViolations}`);
    console.log(`   Moderadas: ${summary.moderateViolations}`);
    console.log(`   Menores: ${summary.minorViolations}`);
    console.log('');
    
    if (summary.criticalViolations === 0 && summary.seriousViolations === 0) {
      console.log('🎉 PARABÉNS! Nenhuma violação crítica ou séria encontrada!');
    } else {
      console.log('⚠️  ATENÇÃO: Violações encontradas que precisam ser corrigidas.');
    }
    
    console.log('');
    console.log(`📁 Relatórios salvos em: ${this.outputDir}`);
    console.log('='.repeat(60));
  }
}

// Executa o script automaticamente
const runner = new AccessibilityTestRunner();
runner.runAllTests().catch(console.error);

export { AccessibilityTestRunner };