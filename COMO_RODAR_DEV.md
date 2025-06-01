# Como Rodar o Projeto ObrasAI em Modo de Desenvolvimento

Siga os passos abaixo para executar a aplicação localmente:

## 1. Configurar Variáveis de Ambiente

Antes de tudo, certifique-se de que você tem um arquivo `.env` na raiz do projeto.

- Se o arquivo `.env` não existir, crie-o.
- Adicione as seguintes variáveis de ambiente ao arquivo `.env`, substituindo os valores pelos do seu projeto Supabase:

  ```env
  VITE_SUPABASE_URL=SUA_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY=SUA_SUPABASE_ANON_KEY
  ```

  * **Importante:** Você pode encontrar esses valores nas configurações do seu projeto no painel do Supabase (Project Settings > API).

## 2. Instalar Dependências

Abra o terminal na pasta raiz do projeto e execute **um** dos seguintes comandos, dependendo do gerenciador de pacotes que você prefere usar (npm ou Bun):

*   **Usando npm:**

    ```bash
    npm install
    ```

*   **Usando Bun:**

    ```bash
    bun install
    ```

## 3. Rodar o Servidor de Desenvolvimento

Após a instalação das dependências, execute **um** dos seguintes comandos para iniciar o servidor Vite em modo de desenvolvimento:

*   **Usando npm:**

    ```bash
    npm run dev
    ```

*   **Usando Bun:**

    ```bash
    bun run dev
    ```

## 4. Acessar a Aplicação

Após executar o comando `dev`, o terminal mostrará a URL onde a aplicação está rodando (geralmente `http://localhost:5173` ou similar).

Abra essa URL no seu navegador para ver a aplicação ObrasAI em execução. 