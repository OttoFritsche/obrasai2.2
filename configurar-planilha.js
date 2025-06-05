/**
 * 📊 Configurador de Planilha ObrasAI - Leads
 * 
 * Cole este código no Google Apps Script para configurar 
 * automaticamente os cabeçalhos da planilha.
 * 
 * Como usar:
 * 1. Abra a planilha Google Sheets
 * 2. Vá em Extensões > Apps Script
 * 3. Cole este código
 * 4. Execute a função configurarPlanilhaLeads()
 */

function configurarPlanilhaLeads() {
  // ID da sua planilha (já extraído da URL)
  const SHEET_ID = '1r8x182-OCOCVRdC5X6ugche6Ju18KWULMHU7FXpCLLE';
  
  try {
    // Abrir a planilha
    const sheet = SpreadsheetApp.openById(SHEET_ID);
    const worksheet = sheet.getSheetByName('leads') || sheet.getActiveSheet();
    
    // Limpar primeira linha
    worksheet.getRange(1, 1, 1, 20).clearContent();
    
    // Configurar cabeçalhos
    const headers = [
      'Email',
      'Nome', 
      'Telefone',
      'Empresa',
      'Cargo',
      'Nível Interesse',
      'Origem',
      'Score Qualificação',
      'Prioridade',
      'Lead ID',
      'Data/Hora',
      'Principal Desafio',
      'Observações/Conversa'
    ];
    
    // Inserir cabeçalhos
    worksheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Formatação dos cabeçalhos
    const headerRange = worksheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    
    // Ajustar largura das colunas
    worksheet.setColumnWidth(1, 200); // Email
    worksheet.setColumnWidth(2, 150); // Nome
    worksheet.setColumnWidth(3, 120); // Telefone
    worksheet.setColumnWidth(4, 180); // Empresa
    worksheet.setColumnWidth(5, 120); // Cargo
    worksheet.setColumnWidth(6, 120); // Nível Interesse
    worksheet.setColumnWidth(7, 100); // Origem
    worksheet.setColumnWidth(8, 120); // Score
    worksheet.setColumnWidth(9, 100); // Prioridade
    worksheet.setColumnWidth(10, 280); // Lead ID
    worksheet.setColumnWidth(11, 140); // Data/Hora
    worksheet.setColumnWidth(12, 200); // Principal Desafio
    worksheet.setColumnWidth(13, 300); // Observações
    
    // Congelar primeira linha
    worksheet.setFrozenRows(1);
    
    // Adicionar formatação alternada
    const dataRange = worksheet.getRange(2, 1, 1000, headers.length);
    dataRange.applyRowBanding();
    
    // Mensagem de sucesso
    console.log('✅ Planilha configurada com sucesso!');
    console.log('📊 Cabeçalhos inseridos: ' + headers.length);
    console.log('🎨 Formatação aplicada');
    
    // Mostrar notificação na planilha
    SpreadsheetApp.getUi().alert(
      'ObrasAI - Configuração Completa!',
      '✅ Planilha configurada com sucesso!\n\n' +
      '📊 ' + headers.length + ' cabeçalhos inseridos\n' +
      '🎨 Formatação aplicada\n' +
      '🔒 Primeira linha congelada\n\n' +
      'Agora você pode importar o fluxo N8N!',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    console.error('❌ Erro ao configurar planilha:', error);
    SpreadsheetApp.getUi().alert(
      'Erro na Configuração',
      '❌ Erro: ' + error.toString(),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * 🧪 Função de teste para verificar se tudo está funcionando
 */
function testarConfiguracao() {
  const SHEET_ID = '1r8x182-OCOCVRdC5X6ugche6Ju18KWULMHU7FXpCLLE';
  
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID);
    const worksheet = sheet.getSheetByName('leads') || sheet.getActiveSheet();
    
    // Verificar se cabeçalhos existem
    const headers = worksheet.getRange(1, 1, 1, 13).getValues()[0];
    
    console.log('📋 Cabeçalhos encontrados:', headers);
    
    if (headers[0] === 'Email' && headers.length >= 13) {
      console.log('✅ Planilha configurada corretamente!');
      return true;
    } else {
      console.log('❌ Planilha não está configurada');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar:', error);
    return false;
  }
}

/**
 * 📝 Função para adicionar um lead de exemplo
 */
function adicionarLeadExemplo() {
  const SHEET_ID = '1r8x182-OCOCVRdC5X6ugche6Ju18KWULMHU7FXpCLLE';
  
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID);
    const worksheet = sheet.getSheetByName('leads') || sheet.getActiveSheet();
    
    // Dados de exemplo
    const leadExemplo = [
      'teste@obrasai.com',
      'João Silva',
      '(11) 99999-9999',
      'Construtora ABC',
      'Engenheiro Civil',
      'alto',
      'chat_ia',
      85,
      'alta',
      'lead-exemplo-123',
      new Date().toLocaleString('pt-BR'),
      'Controle de custos',
      'Lead de exemplo inserido via script'
    ];
    
    // Encontrar próxima linha vazia
    const lastRow = worksheet.getLastRow();
    const nextRow = lastRow + 1;
    
    // Inserir dados
    worksheet.getRange(nextRow, 1, 1, leadExemplo.length).setValues([leadExemplo]);
    
    console.log('✅ Lead de exemplo adicionado na linha ' + nextRow);
    
    SpreadsheetApp.getUi().alert(
      'Lead de Exemplo Adicionado!',
      '✅ Lead de teste inserido na linha ' + nextRow + '\n\n' +
      'Agora você pode testar o fluxo N8N!',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    console.error('❌ Erro ao adicionar lead exemplo:', error);
  }
} 