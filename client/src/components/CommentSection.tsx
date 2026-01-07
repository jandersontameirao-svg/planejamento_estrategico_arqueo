import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Edit2, Trash2, X, Check } from "lucide-react";

interface CommentSectionProps {
  empresaId: number;
  tipoAnalise: "pestel" | "swot" | "okr" | "bsc";
}

export default function CommentSection({ empresaId, tipoAnalise }: CommentSectionProps) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [novoComentario, setNovoComentario] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [conteudoEditado, setConteudoEditado] = useState("");

  const { data: comentarios, isLoading } = trpc.comentarios.list.useQuery({
    empresaId,
    tipoAnalise,
  });

  const createMutation = trpc.comentarios.create.useMutation({
    onSuccess: () => {
      setNovoComentario("");
      utils.comentarios.list.invalidate({ empresaId, tipoAnalise });
      utils.comentarios.count.invalidate({ empresaId, tipoAnalise });
    },
    onError: (error) => {
      alert(`Erro ao criar comentário: ${error.message}`);
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

  const startEdit = (id: number, conteudo: string) => {
    setEditandoId(id);
    setConteudoEditado(conteudo);
  };

  const cancelEdit = () => {
    setEditandoId(null);
    setConteudoEditado("");
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
          Adicione comentários para discussões em equipe e registro de decisões estratégicas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulário de novo comentário */}
        <div className="space-y-2">
          <Textarea
            placeholder="Adicione um comentário ou anotação..."
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
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
            <div
              key={comentario.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
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
                <p className="text-sm whitespace-pre-wrap">{comentario.conteudo}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
