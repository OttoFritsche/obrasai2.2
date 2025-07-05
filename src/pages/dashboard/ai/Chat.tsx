import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useMemo,useState } from "react";

import ChatContextSidebar from "@/components/ai/ChatContextSidebar";
import InterfaceChat from "@/components/ai/InterfaceChat";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { obrasApi } from "@/services/api";

const ChatAIPage = () => {
  const TOPICS = ["despesa", "obras", "orcamento", "contratos"] as const;

  const [selection, setSelection] = useState<string>("chat");

  // Carregar obras para incluir no seletor
  const { data: obras = [] } = useQuery({
    queryKey: ["obras"],
    queryFn: () => obrasApi.getAll(),
  });

  const { mode, topic, obraId } = useMemo(() => {
    if (selection === "chat") return { mode: "chat" as const, topic: undefined, obraId: undefined };
    if (selection.startsWith("topic:")) {
      const t = selection.replace("topic:", "");
      return { mode: "training" as const, topic: t, obraId: undefined };
    }
    if (selection.startsWith("obra:")) {
      const id = selection.replace("obra:", "");
      return { mode: "chat" as const, topic: undefined, obraId: id };
    }
    return { mode: "chat" as const, topic: undefined, obraId: undefined };
  }, [selection]);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex h-full"
      >
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2"
          >
            <div>
              <h1 className="text-2xl font-bold">
                Chat com{" "}
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  ObrasAI
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Seu assistente inteligente para construção civil
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex-1 flex justify-center"
          >
            <div className="w-full max-w-[840px]">
              <InterfaceChat mode={mode} topic={topic} obraId={obraId} />
            </div>
          </motion.div>
        </div>

        {/* Sidebar à direita */}
        <ChatContextSidebar topics={[...TOPICS]} obras={obras} value={selection} onChange={setSelection} />
      </motion.div>
    </DashboardLayout>
  );
};

export default ChatAIPage;
