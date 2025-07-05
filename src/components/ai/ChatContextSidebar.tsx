import React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Obra {
  id: string;
  nome: string;
}

interface ChatContextSidebarProps {
  topics: string[];
  obras: Obra[];
  value: string; // 'chat' | `topic:<t>` | `obra:<id>`
  onChange: (v: string) => void;
}

const ItemButton: React.FC<{
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}> = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted/50",
      active ? "bg-orange-100 dark:bg-orange-900/30 font-medium" : ""
    )}
  >
    {children}
  </button>
);

const ChatContextSidebar: React.FC<ChatContextSidebarProps> = ({ topics, obras, value, onChange }) => {
  return (
    <aside className="w-72 border-l border-border/50 hidden lg:flex flex-col">
      <ScrollArea className="flex-1 p-4 space-y-6">
        {/* Geral */}
        <div>
          <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Geral</h4>
          <ItemButton active={value === "chat"} onClick={() => onChange("chat")}>Conversar (geral)</ItemButton>
        </div>

        {/* Tópicos */}
        <div>
          <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Tópicos de treinamento</h4>
          {topics.map((t) => {
            const val = `topic:${t}`;
            return (
              <ItemButton key={val} active={value === val} onClick={() => onChange(val)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </ItemButton>
            );
          })}
        </div>

        {/* Obras */}
        {obras.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Obras</h4>
            {obras.map((o) => {
              const val = `obra:${o.id}`;
              return (
                <ItemButton key={o.id} active={value === val} onClick={() => onChange(val)}>
                  {o.nome}
                </ItemButton>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
};

export default ChatContextSidebar; 