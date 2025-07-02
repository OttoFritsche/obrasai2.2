import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CaptionLayout } from 'react-day-picker';

interface DatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  label?: string;
  disabled?: boolean;
  captionLayout?: CaptionLayout;
  fromYear?: number;
  toYear?: number;
  className?: string;
}

export function DatePicker({ 
  date, 
  onSelect, 
  label, 
  disabled, 
  captionLayout, 
  fromYear, 
  toYear,
  className
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-background/50 border-border/50 hover:bg-accent hover:border-border transition-all duration-200",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-green-500" />
          {date ? (
            format(date, "PPP", { locale: ptBR })
          ) : (
            <span className="text-muted-foreground">{label || "Selecione uma data"}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-card border border-border shadow-lg" 
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
          locale={ptBR}
          fromYear={fromYear}
          toYear={toYear}
          className={cn("pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
