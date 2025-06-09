import { createContext, useContext, useEffect, useState } from "react"
import { encryptData, decryptData } from "@/lib/secure-storage"

// Tipo para os temas disponíveis
type Theme = "dark" | "light" | "system"

// Contexto do tema
type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

// Estado do contexto
type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

// Valor inicial do contexto
const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

// Criar o contexto
export const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

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
                console.warn('Invalid theme value after decryption, removing corrupted data');
                localStorage.removeItem(storageKey);
                return defaultTheme;
              }
            } catch (decryptError) {
              console.warn('Failed to decrypt theme preference, removing corrupted data');
              localStorage.removeItem(storageKey);
              return defaultTheme;
            }
          }
          // Valor legado não criptografado - validar antes de usar
          if (['light', 'dark', 'system'].includes(storedTheme)) {
            return (storedTheme as Theme) || defaultTheme;
          } else {
            console.warn('Invalid legacy theme value, removing corrupted data');
            localStorage.removeItem(storageKey);
            return defaultTheme;
          }
        }
        return defaultTheme;
      } catch (error) {
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
      } catch (error) {
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