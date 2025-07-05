import { createContext } from "react"

// Tipo para os temas disponíveis
export type Theme = "dark" | "light" | "system"

// Estado do contexto
export interface ThemeProviderState {
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