import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Edit2, Trash2, X, Check, Paperclip, File, FileText, FileImage, Download } from "lucide-react";

interface CommentSectionProps {
  empresaId: number;
  tipoAnalise: "pestel" | "swot" | "okr" | "bsc";
}

export default function CommentSection({ empresaId, tipoAnalise }: CommentSectionProps) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [novoComentario, setNovoComentario] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [conteudoEditado, setConteudoEditado] = useState("");
  const [anexosSelecionados, setAnexosSelecionados] = useState<File[]>([]);

  const { data: comentarios, isLoading } = trpc.comentarios.list.useQuery({
    empresaId,
    tipoAnalise,
  });

  const createMutation = trpc.comentarios.create.useMutation({
    onSuccess: async (result) => {
      // Upload de anexos se houver
      if (anexosSelecionados.length > 0 && result.insertId) {
        for (const file of anexosSelecionados) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64 = e.target?.result?.toString().split(',')[1];
            if (base64) {
              await uploadAnexoMutation.mutateAsync({
                comentarioId: result.insertId,
                nomeArquivo: file.name,
                tipoArquivo: file.type,
                tamanhoBytes: file.size,
                base64Data: base64,
              });
            }
          };
          reader.readAsDataURL(file);
        }
      }
      
      setNovoComentario("");
      setAnexosSelecionados([]);
      utils.comentarios.list.invalidate({ empresaId, tipoAnalise });
      utils.comentarios.count.invalidate({ empresaId, tipoAnalise });
    },
    onError: (error) => {
      alert(`Erro ao criar comentário: ${error.message}`);
    },
  });

  const uploadAnexoMutation = trpc.comentarios.uploadAnexo.useMutation({
    onSuccess: () => {
      utils.comentarios.list.invalidate({ empresaId, tipoAnalise });
    },
  });

  const updateMutation = trpc.comentarios.update.useMutation({
    onSuccess: () => {
      setEditandoId(null);
      setConteudoEditado("");
      utils.comentarios.list.invalidate({ empresaId, tipoAnalise });
    },
    onError: (error) => {
      alert(`Erro ao atualizar comentário: ${error.message}`);
    },
  });

  const deleteMutation = trpc.comentarios.delete.useMutation({
    onSuccess: () => {
      utils.comentarios.list.invalidate({ empresaId, tipoAnalise });
      utils.comentarios.count.invalidate({ empresaId, tipoAnalise });
    },
    onError: (error) => {
      alert(`Erro ao deletar comentário: ${error.message}`);
    },
  });

  const deleteAnexoMutation = trpc.comentarios.deleteAnexo.useMutation({
    onSuccess: () => {
      utils.comentarios.list.invalidate({ empresaId, tipoAnalise });
    },
  });

  const handleCreate = () => {
    if (novoComentario.trim().length < 3) {
      alert("O comentário deve ter pelo menos 3 caracteres");
      return;
    }

    createMutation.mutate({
      empresaId,
      tipoAnalise,
      conteudo: novoComentario.trim(),
    });
  };

  const handleUpdate = (id: number) => {
    if (conteudoEditado.trim().length < 3) {
      alert("O comentário deve ter pelo menos 3 caracteres");
      return;
    }

    updateMutation.mutate({
      id,
      conteudo: conteudoEditado.trim(),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Deseja realmente deletar este comentário?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDeleteAnexo = (anexoId: number) => {
    if (confirm("Deseja realmente deletar este anexo?")) {
      deleteAnexoMutation.mutate({ anexoId });
    }
  };

  const startEdit = (id: number, conteudo: string) => {
    setEditandoId(id);
    setConteudoEditado(conteudo);
  };

  const cancelEdit = () => {
    setEditandoId(null);
    setConteudoEditado("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validar tamanho total (máximo 10MB por arquivo)
    const invalidFiles = files.filter(f => f.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      alert("Alguns arquivos excedem o tamanho máximo de 10MB e foram removidos");
    }
    
    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
    setAnexosSelecionados(prev => [...prev, ...validFiles]);
  };

  const removeAnexoSelecionado = (index: number) => {
    setAnexosSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  const highlightMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-orange-600 font-semibold">{part}</span>;
      }
      return part;
    });
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (tipo.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentários e Anotações
          {comentarios && comentarios.length > 0 && (
            <Badge variant="secondary">{comentarios.length}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Adicione comentários, mencione usuários com @nome e anexe arquivos para discussões em equipe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulário de novo comentário */}
        <div className="space-y-2">
          <Textarea
            placeholder="Adicione um comentário ou mencione alguém com @nome..."
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            rows={3}
            className="resize-none"
          />
          
          {/* Anexos selecionados */}
          {anexosSelecionados.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {anexosSelecionados.map((file, index) => (
                <Badge key={index} variant="outline" className="gap-1">
                  {getFileIcon(file.type)}
                  {file.name} ({formatFileSize(file.size)})
                  <button
                    onClick={() => removeAnexoSelecionado(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1"
              >
                <Paperclip className="h-4 w-4" />
                Anexar Arquivo
              </Button>
            </div>
            
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={createMutation.isPending || novoComentario.trim().length < 3}
              className="gap-1"
            >
              <Send className="h-4 w-4" />
              Enviar Comentário
            </Button>
          </div>
        </div>

        {/* Lista de comentários */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="text-center text-muted-foreground py-4">
              Carregando comentários...
            </div>
          )}

          {!isLoading && (!comentarios || comentarios.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum comentário ainda</p>
              <p className="text-sm">Seja o primeiro a adicionar uma anotação!</p>
            </div>
          )}

          {comentarios?.map((comentario) => (
            <ComentarioItem
              key={comentario.id}
              comentario={comentario}
              user={user}
              editandoId={editandoId}
              conteudoEditado={conteudoEditado}
              setConteudoEditado={setConteudoEditado}
              startEdit={startEdit}
              cancelEdit={cancelEdit}
              handleUpdate={handleUpdate}
              handleDelete={handleDelete}
              handleDeleteAnexo={handleDeleteAnexo}
              highlightMentions={highlightMentions}
              getFileIcon={getFileIcon}
              formatFileSize={formatFileSize}
              deleteMutation={deleteMutation}
              updateMutation={updateMutation}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente separado para cada comentário
function ComentarioItem({ comentario, user, editandoId, conteudoEditado, setConteudoEditado, startEdit, cancelEdit, handleUpdate, handleDelete, handleDeleteAnexo, highlightMentions, getFileIcon, formatFileSize, deleteMutation, updateMutation }: any) {
  const { data: anexos } = trpc.comentarios.listAnexos.useQuery({ comentarioId: comentario.id });

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold text-sm">{comentario.autorNome}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(comentario.createdAt).toLocaleString("pt-BR")}
            {comentario.updatedAt !== comentario.createdAt && " (editado)"}
          </div>
        </div>

        {user?.openId === comentario.autorId && (
          <div className="flex gap-1">
            {editandoId !== comentario.id && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEdit(comentario.id, comentario.conteudo)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(comentario.id)}
                  disabled={deleteMutation.isPending}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {editandoId === comentario.id ? (
        <div className="space-y-2">
          <Textarea
            value={conteudoEditado}
            onChange={(e) => setConteudoEditado(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={cancelEdit}
              className="gap-1"
            >
              <X className="h-3 w-3" />
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => handleUpdate(comentario.id)}
              disabled={updateMutation.isPending || conteudoEditado.trim().length < 3}
              className="gap-1"
            >
              <Check className="h-3 w-3" />
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm whitespace-pre-wrap mb-2">{highlightMentions(comentario.conteudo)}</p>
          
          {/* Anexos */}
          {anexos && anexos.length > 0 && (
            <div className="mt-2 space-y-1">
              {anexos.map((anexo: any) => (
                <div key={anexo.id} className="flex items-center gap-2 text-sm bg-gray-100 rounded p-2">
                  {getFileIcon(anexo.tipoArquivo)}
                  <a 
                    href={anexo.urlS3} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 hover:underline"
                  >
                    {anexo.nomeArquivo} ({formatFileSize(anexo.tamanhoBytes)})
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                    className="h-6 w-6 p-0"
                  >
                    <a href={anexo.urlS3} download>
                      <Download className="h-3 w-3" />
                    </a>
                  </Button>
                  {user?.openId === comentario.autorId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteAnexo(anexo.id)}
                      className="h-6 w-6 p-0 text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
