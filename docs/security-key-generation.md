# 🔐 Guia de Geração de Chaves de Segurança - ObrasAI

Este guia explica como gerar as chaves criptográficas necessárias para o sistema
ObrasAI de forma segura.

## 🎯 Chaves Necessárias

### JWT_SECRET

- **Propósito:** Assinatura e verificação de tokens JWT
- **Tamanho:** 512 bits (64 bytes)
- **Uso:** Autenticação e autorização

### VITE_ENCRYPTION_KEY

- **Propósito:** Criptografia AES dos dados armazenados
- **Tamanho:** 256 bits (32 bytes)
- **Uso:** Criptografia de dados sensíveis no storage

---

## 🛠️ Métodos de Geração

### **Método 1: Node.js (Recomendado)**

```bash
# Criar script temporário
echo "import crypto from 'crypto'; console.log('JWT_SECRET=' + crypto.randomBytes(64).toString('hex')); console.log('VITE_ENCRYPTION_KEY=' + crypto.randomBytes(32).toString('hex'));" > gen-keys.js

# Executar
node gen-keys.js

# Remover script
rm gen-keys.js
```

### **Método 2: PowerShell (Windows)**

```powershell
# JWT Secret (64 bytes)
$jwtBytes = New-Object byte[] 64
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($jwtBytes)
$jwtSecret = [System.BitConverter]::ToString($jwtBytes) -replace '-'
Write-Host "JWT_SECRET=$jwtSecret"

# Encryption Key (32 bytes)
$encBytes = New-Object byte[] 32
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($encBytes)
$encKey = [System.BitConverter]::ToString($encBytes) -replace '-'
Write-Host "VITE_ENCRYPTION_KEY=$encKey"
```

### **Método 3: Linux/macOS (Terminal)**

```bash
# JWT Secret (512 bits)
echo "JWT_SECRET=$(openssl rand -hex 64)"

# Encryption Key (256 bits)
echo "VITE_ENCRYPTION_KEY=$(openssl rand -hex 32)"
```

### **Método 4: Online (Use com Cautela)**

⚠️ **APENAS para desenvolvimento - NÃO use em produção**

1. Acesse:
   https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
2. Configure:
   - JWT_SECRET: 512-bit key
   - VITE_ENCRYPTION_KEY: 256-bit key
3. Use apenas em ambiente de desenvolvimento local

---

## 📝 Exemplo de Arquivo .env

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# Chaves de Segurança
JWT_SECRET=9147f03f01c7ea78e584723d6d7c914badd8047f6383646a7777fa408c43b9b53c7c28e4bb870e05bb7d295edc798c2d2d2bcb558c95052ced806b7ad57150c8
VITE_ENCRYPTION_KEY=c903ff5752c2986b201b6eb3d640c48a27e0a6a035c104bbd407b4a965a9550e

# APIs Externas
DEEPSEEK_API=sk-sua_nova_chave_deepseek_aqui

# Segurança
ALLOWED_ORIGINS=http://localhost:8080,https://seudominio.com

# Environment
NODE_ENV=development
```

---

## 🔄 Rotação de Chaves

### Quando Rotacionar

- **Imediatamente:** Se as chaves foram expostas
- **Programado:** A cada 6-12 meses em produção
- **Incidente:** Após qualquer breach de segurança

### Como Rotacionar

1. **Gerar novas chaves**
2. **Atualizar variáveis de ambiente**
3. **Reiniciar aplicação**
4. **Invalidar sessões existentes** (para JWT_SECRET)
5. **Re-criptografar dados** (para VITE_ENCRYPTION_KEY)

---

## ⚠️ Boas Práticas de Segurança

### ✅ Fazer

- **Usar chaves diferentes** para cada ambiente (dev/staging/prod)
- **Armazenar em secret managers** em produção
- **Limitar acesso** apenas a pessoal autorizado
- **Backup seguro** das chaves de produção
- **Documentar rotação** de chaves

### ❌ Não Fazer

- **Commit chaves** no repositório
- **Compartilhar** por email/chat
- **Reutilizar** entre projetos
- **Armazenar** em texto plano
- **Usar chaves fracas** ou previsíveis

---

## 🔍 Validação das Chaves

### Verificar Força

```javascript
// JWT_SECRET deve ter 128 caracteres hex (64 bytes)
if (process.env.JWT_SECRET?.length !== 128) {
    throw new Error("JWT_SECRET deve ter 128 caracteres");
}

// VITE_ENCRYPTION_KEY deve ter 64 caracteres hex (32 bytes)
if (process.env.VITE_ENCRYPTION_KEY?.length !== 64) {
    throw new Error("VITE_ENCRYPTION_KEY deve ter 64 caracteres");
}
```

### Testar Criptografia

```javascript
import crypto from "crypto";

const testKey = process.env.VITE_ENCRYPTION_KEY;
const testData = "test-data";

// Testar se a chave funciona
try {
    const cipher = crypto.createCipher("aes-256-cbc", testKey);
    const encrypted = cipher.update(testData, "utf8", "hex") +
        cipher.final("hex");
    console.log("✅ Chave de criptografia válida");
} catch (error) {
    console.error("❌ Chave de criptografia inválida:", error);
}
```

---

## 🚀 Deploy em Produção

### Variáveis de Ambiente

```bash
# Vercel
vercel env add JWT_SECRET
vercel env add VITE_ENCRYPTION_KEY

# Heroku
heroku config:set JWT_SECRET="sua_chave_aqui"
heroku config:set VITE_ENCRYPTION_KEY="sua_chave_aqui"

# Railway
railway variables set JWT_SECRET="sua_chave_aqui"
railway variables set VITE_ENCRYPTION_KEY="sua_chave_aqui"
```

### Docker

```dockerfile
# NO docker-compose.yml
environment:
  - JWT_SECRET_FILE=/run/secrets/jwt_secret
  - VITE_ENCRYPTION_KEY_FILE=/run/secrets/encryption_key

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  encryption_key:
    file: ./secrets/encryption_key.txt
```

---

## 📊 Checklist de Segurança

- [ ] Chaves geradas com fonte criptograficamente segura
- [ ] Tamanho adequado (JWT: 64 bytes, Encryption: 32 bytes)
- [ ] Diferentes para cada ambiente
- [ ] Armazenadas de forma segura
- [ ] Acesso restrito e auditado
- [ ] Backup seguro realizado
- [ ] Rotação programada configurada

---

**⚠️ LEMBRETE IMPORTANTE:**

As chaves geradas neste documento são apenas exemplos. **SEMPRE gere suas
próprias chaves únicas para cada projeto e ambiente!**

---

_Última atualização: 26/12/2024_
