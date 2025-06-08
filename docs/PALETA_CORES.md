# 🎨 Paleta de Cores Profissional - ObrasAI

## 📋 Visão Geral

O sistema ObrasAI agora utiliza uma paleta de cores **profissional e
impactante** para construtores, focada em transmitir confiança, solidez e
expertise no setor da construção civil.

---

## 🏗️ Cores Principais

### Azul Escuro Corporativo

- **Cor:** `#182b4d`
- **HSL:** `215 28% 17%`
- **Uso:** Cor primária, textos importantes, elementos de destaque
- **Significado:** Confiança, profissionalismo, solidez

### Dourado Construção

- **Cor:** `#daa916`
- **HSL:** `43 74% 49%`
- **Uso:** Cor secundária, acentos, call-to-actions, branding
- **Significado:** Qualidade premium, excelência, prosperidade

---

## 🎯 Cores de Feedback e Funcionalidade

### Verde (Sucesso/Positivo)

- **Claro:** `#16a34a` (green-600)
- **HSL:** `142 76% 36%`
- **Uso:** Confirmações, sucessos, métricas positivas

### Vermelho (Erro/Atenção)

- **Claro:** `#dc2626` (red-600)
- **HSL:** `0 84% 60%`
- **Uso:** Erros, alertas críticos, valores negativos

### Amarelo (Aviso/Pendente)

- **Claro:** `#ca8a04` (yellow-600)
- **HSL:** `43 96% 56%`
- **Uso:** Avisos, pendências, alertas moderados

### Azul (Informação/Neutro)

- **Claro:** `#2563eb` (blue-600)
- **HSL:** `214 84% 56%`
- **Uso:** Informações gerais, links, elementos neutros

---

## 🌓 Implementação por Modo

### Modo Claro

```css
:root {
    /* Cores principais */
    --construction-primary: 215 28% 17%; /* #182b4d */
    --construction-accent: 43 74% 49%; /* #daa916 */

    /* Cores de feedback */
    --construction-blue: 214 84% 56%; /* Azul informativo */
    --construction-green: 142 76% 36%; /* Verde sucesso */
    --construction-red: 0 84% 60%; /* Vermelho erro */
    --construction-yellow: 43 96% 56%; /* Amarelo aviso */
}
```

### Modo Escuro

```css
.dark {
    /* Dourado se torna primário para contraste */
    --primary: 43 74% 49%; /* #daa916 */
    --primary-foreground: 215 28% 17%; /* #182b4d */

    /* Azul escuro como secundário */
    --secondary: 215 27% 17%;
    --secondary-foreground: 43 74% 49%;
}
```

---

## 🧩 Aplicação por Componente

### Menu Principal

| Item          | Cor Light               | Cor Dark            |
| ------------- | ----------------------- | ------------------- |
| Dashboard     | Azul (`blue-600`)       | Azul (`blue-400`)   |
| Obras         | Azul escuro (`#182b4d`) | Dourado (`#daa916`) |
| Despesas      | Verde (`green-600`)     | Verde (`green-400`) |
| Orçamentos IA | Azul (`blue-500`)       | Azul (`blue-400`)   |
| Notas Fiscais | Dourado (`#daa916`)     | Dourado (`#daa916`) |
| Fornecedores  | Verde (`green-500`)     | Verde (`green-400`) |
| Chat IA       | Azul escuro (`#182b4d`) | Dourado (`#daa916`) |

### Badges de Status

| Status     | Classes Tailwind                                                          |
| ---------- | ------------------------------------------------------------------------- |
| Rascunho   | `bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300`           |
| Concluído  | `bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`        |
| Vinculado  | `bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`    |
| Convertido | `bg-[#daa916]/20 text-[#182b4d] dark:bg-[#daa916]/30 dark:text-[#daa916]` |

---

## 🚫 Cores Eliminadas

As seguintes cores foram **removidas** da paleta para manter o foco
profissional:

- ❌ **Roxo** (`purple`) - Substituído por azul escuro ou dourado
- ❌ **Rosa** (`pink`) - Substituído por verde ou azul
- ❌ **Laranja** (`orange`) - Substituído por dourado ou amarelo

---

## 💡 Diretrizes de Uso

### ✅ Faça

- Use `#182b4d` para elementos principais e textos importantes
- Use `#daa916` para destaques, CTAs e elementos de branding
- Mantenha verde para sucessos, vermelho para erros
- Use azul para informações neutras
- Aplique transparências (`/10`, `/20`, `/30`) para backgrounds sutis

### ❌ Evite

- Não use cores muito vibrantes ou "infantis"
- Evite combinações que reduzam a legibilidade
- Não misture muitas cores diferentes na mesma tela
- Evite usar roxo, rosa ou laranja (cores eliminadas)

---

## 🔄 Como Aplicar

### Classes Tailwind Recomendadas

```css
/* Texto com cor principal */
.text-construction-primary {
    color: #182b4d;
}
.text-construction-accent {
    color: #daa916;
}

/* Backgrounds */
.bg-construction-primary {
    background-color: #182b4d;
}
.bg-construction-accent {
    background-color: #daa916;
}

/* Bordas */
.border-construction-primary {
    border-color: #182b4d;
}
.border-construction-accent {
    border-color: #daa916;
}
```

### Variáveis CSS Personalizadas

```css
/* Use as variáveis definidas no sistema */
color: hsl(var(--construction-primary));
background-color: hsl(var(--construction-accent));
```

---

## 📊 Impacto Visual

A nova paleta transmite:

- **Profissionalismo** através do azul escuro corporativo
- **Confiança** com cores sólidas e bem definidas
- **Qualidade Premium** através do dourado elegante
- **Clareza** com cores de feedback bem distintas
- **Consistência** em todo o sistema

---

## 🔧 Manutenção

- Revisar paleta trimestralmente
- Testar acessibilidade com ferramentas WCAG
- Validar contraste entre texto e fundo
- Coletar feedback dos usuários construtores
- Manter consistência em novos componentes

---

_Última atualização: Dezembro 2024_ _Versão: 2.0 - Paleta Profissional_
