import { useState } from "react";
import { Upload, FileImage, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CNPJCardUploadProps {
  onDataExtracted: (data: Record<string, string>) => void;
}

export default function CNPJCardUpload({ onDataExtracted }: CNPJCardUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const ocrMutation = trpc.contratos.clientes.extrairCartaoCNPJ.useMutation({
    onSuccess: (data: unknown) => {
      onDataExtracted(data as Record<string, string>);
      setFile(null);
      setPreview("");
      toast.success("Dados extraídos com sucesso!");
    },
    onError: (error: { message: string }) => {
      toast.error(error.message || "Erro ao extrair dados do Cartão CNPJ");
    },
  });

  const handleFileChange = (selectedFile: File) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Tipo não permitido. Use JPEG, PNG, WEBP ou PDF.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 10MB");
      return;
    }
    setFile(selectedFile);
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview("pdf");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileChange(dropped);
  };

  const handleExtract = () => {
    if (!file) {
      toast.error("Selecione uma imagem do Cartão CNPJ");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      // Upload do arquivo para S3, depois envia URL para a IA
      const formData = new FormData();
      if (file) formData.append("file", file);
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Falha no upload");
        const { url } = await uploadRes.json() as { url: string };
        ocrMutation.mutate({ imageUrl: url });
      } catch {
        toast.error("Erro ao fazer upload do arquivo");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="p-4 bg-muted/50">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileImage className="h-4 w-4" />
          <span>Upload do Cartão CNPJ (Opcional)</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Faça upload de uma foto do Cartão CNPJ para preencher automaticamente os campos usando IA
        </p>

        {!preview ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onClick={() => document.getElementById("cnpj-card-upload")?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Arraste uma imagem ou PDF ou clique para selecionar
            </p>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(f);
              }}
              className="hidden"
              id="cnpj-card-upload"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); document.getElementById("cnpj-card-upload")?.click(); }}
            >
              Selecionar Imagem
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden border">
              {preview === "pdf" ? (
                <div className="w-full h-40 flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <FileImage className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">PDF do Cartão CNPJ</p>
                    <p className="text-xs text-muted-foreground">{file?.name}</p>
                  </div>
                </div>
              ) : (
                <img src={preview} alt="Preview" className="w-full h-40 object-contain bg-muted" />
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => { setFile(null); setPreview(""); }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Button
              type="button"
              onClick={handleExtract}
              disabled={ocrMutation.isPending}
              className="w-full"
            >
              {ocrMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extraindo dados com IA...
                </>
              ) : (
                <>
                  <FileImage className="mr-2 h-4 w-4" />
                  Extrair Dados com IA
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
