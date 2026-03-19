import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, FileText, Save } from "lucide-react";

interface ContratoFormProps {
  empresaId: number;
}
export default function ContratoForm({ empresaId }: ContratoFormProps) {
  const [, navigate] = useLocation();
  const { data: empresas = [] } = trpc.empresas.list.useQuery();
  const { data: clientes = [] } = trpc.contratos.clientes.list.useQuery({ empresaId });

  const [form, setForm] = useState({
    numero: "",
    titulo: "",
    descricao: "",
    tipo: "servicos" as any,
    status: "rascunho" as any,
    empresaId: String(empresaId),
    clienteId: "",
    dataInicio: "",
    dataFim: "",
    dataAssinatura: "",
    valorTotal: "",
    moeda: "BRL",
    observacoes: "",
  });

  const createContrato = trpc.contratos.contratos.create.useMutation({
    onSuccess: (data: any) => {
      toast.success("Contrato criado com sucesso!");
      navigate(`/empresa/${empresaId}/contratos/${data.id}`);
    },
    onError: (err: any) => {
      toast.error("Erro ao criar contrato: " + err.message);
    },
  });

  const clientesFiltrados = form.empresaId
    ? clientes.filter((c: any) => !c.empresaId || c.empresaId === parseInt(form.empresaId))
    : clientes;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.numero || !form.titulo || !form.empresaId || !form.clienteId) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    createContrato.mutate({
      ...form,
      empresaId: parseInt(form.empresaId),
      clienteId: parseInt(form.clienteId),
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/empresa/${empresaId}/contratos`)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Contratos
          </Button>
          <div className="h-5 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Novo Contrato</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número do Contrato *</Label>
                  <Input
                    placeholder="CT-2026-001"
                    value={form.numero}
                    onChange={(e) => setForm(f => ({ ...f, numero: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm(f => ({ ...f, tipo: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="fornecimento">Fornecimento</SelectItem>
                      <SelectItem value="consultoria">Consultoria</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="parceria">Parceria</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Título / Objeto *</Label>
                <Input
                  placeholder="Descreva o objeto do contrato"
                  value={form.titulo}
                  onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Detalhes adicionais sobre o contrato..."
                  value={form.descricao}
                  onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Partes Envolvidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Empresa Contratante *</Label>
                <Select value={form.empresaId} onValueChange={(v) => setForm(f => ({ ...f, empresaId: v, clienteId: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
                  <SelectContent>
                    {empresas.map((e: any) => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cliente / Contratado *</Label>
                <Select value={form.clienteId} onValueChange={(v) => setForm(f => ({ ...f, clienteId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientesFiltrados.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.razaoSocial}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clientesFiltrados.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Nenhum cliente cadastrado.{" "}
                    <button
                      type="button"
                      className="text-blue-600 underline"
                      onClick={() => navigate(`/empresa/${empresaId}/contratos/clientes`)}
                    >
                      Cadastrar cliente
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Valores e Datas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor Total</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.valorTotal}
                    onChange={(e) => setForm(f => ({ ...f, valorTotal: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Moeda</Label>
                  <Select value={form.moeda} onValueChange={(v) => setForm(f => ({ ...f, moeda: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">BRL — Real</SelectItem>
                      <SelectItem value="USD">USD — Dólar</SelectItem>
                      <SelectItem value="EUR">EUR — Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Data de Assinatura</Label>
                  <Input
                    type="date"
                    value={form.dataAssinatura}
                    onChange={(e) => setForm(f => ({ ...f, dataAssinatura: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={form.dataInicio}
                    onChange={(e) => setForm(f => ({ ...f, dataInicio: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Data de Término</Label>
                  <Input
                    type="date"
                    value={form.dataFim}
                    onChange={(e) => setForm(f => ({ ...f, dataFim: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Notas internas, condições especiais..."
                value={form.observacoes}
                onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))}
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(`/empresa/${empresaId}/contratos`)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createContrato.isPending}>
              <Save className="w-4 h-4 mr-1" />
              {createContrato.isPending ? "Salvando..." : "Criar Contrato"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
