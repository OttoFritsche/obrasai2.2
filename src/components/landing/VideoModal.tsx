import { AnimatePresence,motion } from "framer-motion";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal = ({ isOpen, onClose }: VideoModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white hover:text-construction-accent transition-colors"
            >
              <span className="text-lg">Fechar ✕</span>
            </button>
            <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-gray-700">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-construction-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">Demo</span>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Demonstração em Breve</h3>
                  <p className="text-gray-400">
                    Nossa demonstração interativa estará disponível em breve. 
                    Entre em contato para agendar uma apresentação personalizada.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 