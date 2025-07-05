import { AnimatePresence,motion } from "framer-motion";
import { 
  AlertTriangle,
  Download, 
  ExternalLink, 
  FileText, 
  Image as ImageIcon,
  Loader2,
  RotateCw,
  X, 
  ZoomIn, 
  ZoomOut} from "lucide-react";
import { memo,useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  className?: string;
}

type FileCategory = "pdf" | "image" | "xml" | "unknown";

const FileViewer = memo(({ 
  isOpen, 
  onClose, 
  fileUrl, 
  fileName = "arquivo", 
  fileType = "application/pdf",
  className 
}: FileViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Determinar categoria do arquivo baseado no tipo MIME
  const getFileCategory = (mimeType: string): FileCategory => {
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.includes("image")) return "image";
    if (mimeType.includes("xml")) return "xml";
    return "unknown";
  };

  const fileCategory = getFileCategory(fileType);

  // Reset states quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
      setZoom(100);
      setRotation(0);
    }
  }, [isOpen]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    toast.error("Erro ao carregar o arquivo");
  }, []);

  const handleDownload = useCallback(async () => {
    try {
      // Criar um link temporário para download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download iniciado");
    } catch (_error) {
      toast.error("Erro ao fazer download do arquivo");
    }
  }, [fileUrl, fileName]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 50));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handleOpenExternal = useCallback(() => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  }, [fileUrl]);

  const getFileIcon = useCallback(() => {
    switch (fileCategory) {
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "xml":
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  }, [fileCategory]);

  const getFileColor = useCallback(() => {
    switch (fileCategory) {
      case "pdf":
        return "bg-red-500/10 text-red-600 border-red-200 dark:border-red-700";
      case "image":
        return "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-700";
      case "xml":
        return "bg-green-500/10 text-green-600 border-green-200 dark:border-green-700";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-700";
    }
  }, [fileCategory]);

  const renderFileContent = () => {
    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-600">Erro ao carregar arquivo</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Não foi possível carregar o arquivo. Tente fazer o download ou abrir em nova aba.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handleOpenExternal}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir em nova aba
            </Button>
          </div>
        </div>
      );
    }

    switch (fileCategory) {
      case "pdf":
        return (
          <div className="relative h-full">
            {/* Tentativa de usar iframe primeiro */}
            <iframe
              src={`${fileUrl}#view=FitH&zoom=100&page=1`}
              className="w-full h-full rounded-lg"
              onLoad={handleLoad}
              onError={(e) => {
                console.warn("Iframe failed, trying alternative method");
                // Se o iframe falhar, mostrar fallback
                setHasError(true);
              }}
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                border: 'none'
              }}
              title="Visualização de PDF"
              sandbox="allow-same-origin allow-scripts"
            />
            
            {/* Fallback quando iframe não funcionar */}
            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center h-full space-y-4 text-center bg-background/95">
                <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Visualização de PDF</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    A visualização inline não está disponível. Use uma das opções abaixo.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleOpenExternal}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir em Nova Aba
                  </Button>
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case "image":
        return (
          <div className="relative h-full flex items-center justify-center">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-h-full max-w-full object-contain rounded-lg"
              onLoad={handleLoad}
              onError={handleError}
              loading="lazy"
              decoding="async"
              style={{ 
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
            />
          </div>
        );

      case "xml":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Arquivo XML</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Visualização não disponível. Faça o download para visualizar o conteúdo.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={handleOpenExternal}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir em nova aba
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-500/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Arquivo não suportado</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tipo de arquivo não suportado para visualização. Faça o download.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={handleOpenExternal}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir em nova aba
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
            "flex items-center justify-center p-4",
            className
          )}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-6xl h-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="h-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={cn("px-3 py-1", getFileColor())}>
                    <div className="flex items-center gap-2">
                      {getFileIcon()}
                      <span className="font-medium">{fileCategory.toUpperCase()}</span>
                    </div>
                  </Badge>
                  <div>
                    <h3 className="font-semibold truncate max-w-md">{fileName}</h3>
                    <p className="text-xs text-muted-foreground">
                      Arquivo de nota fiscal
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Controles para PDF e imagens */}
                  {(fileCategory === "pdf" || fileCategory === "image") && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomOut}
                        disabled={zoom <= 50}
                        title="Diminuir zoom"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      
                      <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                        {zoom}%
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomIn}
                        disabled={zoom >= 200}
                        title="Aumentar zoom"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6 bg-border mx-1" />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRotate}
                        title="Rotacionar"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  <div className="w-px h-6 bg-border mx-1" />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOpenExternal}
                    title="Abrir em nova aba"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    title="Fechar"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <CardContent className="flex-1 p-0 relative overflow-hidden">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="text-center space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
                      <p className="text-sm text-muted-foreground">Carregando arquivo...</p>
                    </div>
                  </div>
                )}
                
                <div className="h-full">
                  {renderFileContent()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

FileViewer.displayName = 'FileViewer';

export default FileViewer;