import { useTheme } from "@/hooks/useTheme";
import React, { memo, useCallback } from "react";

import logoDark from "@/assets/logo/logo_dark.png";
import logoDarkHorizon from "@/assets/logo/logo_dark_horizon.png";
// Importação das logos
import logoLight from "@/assets/logo/logo_light.png";
import logoLightHorizon from "@/assets/logo/logo_light_horizon.png";

interface LogoProps {
  /**
   * Variante da logo: 'horizontal' (texto ao lado) ou 'vertical' (compacta)
   */
  variant?: "horizontal" | "vertical";
  /**
   * Largura máxima da logo (em px, rem, etc)
   */
  width?: number | string;
  /**
   * Altura máxima da logo (em px, rem, etc)
   */
  height?: number | string;
  /**
   * Alt text para acessibilidade
   */
  alt?: string;
  /**
   * Classe extra para estilização
   */
  className?: string;
}

/**
 * Componente de Logo que troca automaticamente entre light/dark e horizontal/vertical
 */
export const Logo = memo<LogoProps>((props: LogoProps) => {
  const {
    variant = "vertical",
    width,
    height,
    alt = "Logo Obras.AI",
    className = "",
  } = props;
  const { theme } = useTheme();
  
  // Resolver tema do sistema se necessário
  const resolvedTheme = theme === "system" 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;

  // Seleciona a logo correta
  const logoSrc = React.useMemo(() => {
    if (variant === "horizontal") {
      return resolvedTheme === "dark" ? logoDarkHorizon : logoLightHorizon;
    }
    return resolvedTheme === "dark" ? logoDark : logoLight;
  }, [variant, resolvedTheme]);

  const handleError = useCallback(() => {
    console.warn('Erro ao carregar logo');
  }, []);

  return (
    <img
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
      onError={handleError}
      style={{
        maxWidth: width || (variant === "horizontal" ? 240 : 48),
        maxHeight: height || (variant === "horizontal" ? 64 : 48),
        height: "auto",
        width: "auto",
        display: "block",
      }}
      draggable={false}
    />
  );
});

Logo.displayName = 'Logo';

export default Logo;