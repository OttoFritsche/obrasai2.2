import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconColor?: "primary" | "success" | "warning" | "info" | "destructive";
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconColor = "primary"
}: MetricCardProps) {
  const iconColorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600 dark:text-green-500",
    warning: "bg-orange-500/10 text-orange-600 dark:text-orange-500",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
    destructive: "bg-destructive/10 text-destructive"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300",
        "hover:shadow-lg hover:bg-[hsl(var(--card-hover))]",
        "group",
        className
      )}
    >
      {/* Gradiente de fundo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <motion.p 
              className="text-2xl font-bold tracking-tight"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {value}
            </motion.p>
            {trend && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
                )}
              >
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </motion.span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        
        <motion.div
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={cn(
            "h-12 w-12 rounded-lg p-2.5 transition-all duration-300",
            iconColorClasses[iconColor],
            "group-hover:shadow-lg"
          )}
        >
          <Icon className="h-full w-full" />
        </motion.div>
      </div>
      
      {/* Linha de progresso opcional */}
      {trend && (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-muted"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div
            className={cn(
              "h-full",
              trend.isPositive ? "bg-green-500" : "bg-red-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.abs(trend.value), 100)}%` }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </motion.div>
      )}
    </motion.div>
  );
} 