import { useEffect, useState } from "react"

import type { Theme } from "@/contexts/theme-context"
import { ThemeProviderContext } from "@/contexts/theme-context"
import { decryptData, encryptData } from "@/lib/secure-storage"

// Contexto do tema
interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

// Provider do tema
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  // Estado do tema
  const [theme, setTheme] = useState<Theme>(
    // ✅ Usando descriptografia segura para recuperar tema
    () => {
      try {
        const storedTheme = localStorage.getItem(storageKey);
        if (storedTheme) {
          // Verificar se é um valor criptografado
          if (storedTheme.startsWith('encrypted:')) {
            try {
              const decrypted = decryptData(storedTheme.substring(10));
              // Validar se o tema descriptografado é válido
              if (['light', 'dark', 'system'].includes(decrypted)) {
                return (decrypted as Theme) || defaultTheme;
              } else {
                // Log silencioso em desenvolvimento
                if (import.meta.env?.DEV) {
                  console.warn('Invalid theme value after decryption, removing corrupted data');
                }
                localStorage.removeItem(storageKey);
                return defaultTheme;
              }
            } catch (_decryptError) {
              // Log silencioso em desenvolvimento, remove dados corrompidos
              if (import.meta.env?.DEV) {
                console.warn('Failed to decrypt theme preference, removing corrupted data');
              }
              localStorage.removeItem(storageKey);
              return defaultTheme;
            }
          }
          // Valor legado não criptografado - validar antes de usar
          if (['light', 'dark', 'system'].includes(storedTheme)) {
            return (storedTheme as Theme) || defaultTheme;
          } else {
            // Log silencioso em desenvolvimento
            if (import.meta.env?.DEV) {
              console.warn('Invalid legacy theme value, removing corrupted data');
            }
            localStorage.removeItem(storageKey);
            return defaultTheme;
          }
        }
        return defaultTheme;
      } catch (_error) {
        console.warn('Failed to retrieve theme preference, using default');
        return defaultTheme;
      }
    }
  )

  // Efeito para aplicar o tema
  useEffect(() => {
    const root = window.document.documentElement

    // Remover classes existentes
    root.classList.remove("light", "dark")

    // Aplicar tema baseado no sistema se necessário
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    // Aplicar tema selecionado
    root.classList.add(theme)
  }, [theme])

  // Valor do contexto
  const value = {
    theme,
    setTheme: (theme: Theme) => {
      // ✅ Usando criptografia segura para armazenar tema
      try {
        const encrypted = 'encrypted:' + encryptData(theme);
        localStorage.setItem(storageKey, encrypted);
      } catch (_error) {
        console.warn('Failed to encrypt theme preference, storing as plain text');
        localStorage.setItem(storageKey, theme);
      }
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}