import * as React from "react"

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
const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

// Provider do tema
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  // Estado do tema
  const [theme, setTheme] = React.useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  // Efeito para aplicar o tema
  React.useEffect(() => {
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
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// Hook para usar o tema
export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
} 