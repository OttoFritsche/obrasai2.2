import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, CaptionProps, useDayPicker, useNavigation } from "react-day-picker";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CustomCaption(props: CaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  const {fromDate, toDate } = useDayPicker();

  const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(props.displayMonth.getFullYear(), i);
      return { value: i, label: format(date, 'MMMM', { locale: ptBR }) };
  });
  
  const currentYear = new Date().getFullYear();
  const startYear = fromDate?.getFullYear() || currentYear - 100;
  const endYear = toDate?.getFullYear() || currentYear + 10;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  const handleMonthChange = (value: string) => {
    const newMonth = parseInt(value, 10);
    const newDate = new Date(props.displayMonth.getFullYear(), newMonth, 1);
    goToMonth(newDate);
  };

  const handleYearChange = (value: string) => {
    const newYear = parseInt(value, 10);
    const newDate = new Date(newYear, props.displayMonth.getMonth(), 1);
    goToMonth(newDate);
  };

  return (
    <div className="flex items-center justify-between pt-2 pb-3 px-2">
      <button
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-background/50 p-0 border-border/50 hover:bg-accent hover:border-border text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      <div className="flex items-center gap-2">
        <Select
          value={props.displayMonth.getMonth().toString()}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="h-8 w-[110px] text-sm bg-background/50 border-border/50 hover:bg-accent focus:border-green-500 focus:ring-green-500/20">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()} className="text-sm capitalize">
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={props.displayMonth.getFullYear().toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="h-8 w-[80px] text-sm bg-background/50 border-border/50 hover:bg-accent focus:border-green-500 focus:ring-green-500/20">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()} className="text-sm">
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <button
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        className={cn(
          buttonVariants({ variant: "outline" }),
           "h-8 w-8 bg-background/50 p-0 border-border/50 hover:bg-accent hover:border-border text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        nav_button_previous: "hidden",
        nav_button_next: "hidden",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-green-500 dark:text-green-400 rounded-md w-10 font-medium text-[0.8rem] text-center uppercase tracking-wide",
        row: "flex w-full mt-2",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal hover:bg-accent transition-colors duration-200 rounded-md"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-green-500 text-white hover:bg-green-600 focus:bg-green-500 rounded-md shadow-md",
        day_today: "bg-accent text-accent-foreground font-semibold rounded-md border border-green-500/30",
        day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-30",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: CustomCaption,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
