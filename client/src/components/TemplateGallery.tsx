import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Check } from "lucide-react";

interface TemplatePreset {
  id: string;
  nome: string;
  descricao: string;
  corPrimaria: string;
  corSecundaria: string;
  incluirPestel: boolean;
  incluirSwot: boolean;
  incluirOkr: boolean;
  incluirBsc: boolean;
  incluirGraficos: boolean;
  incluirRecomendacoes: boolean;
}

const templates: TemplatePreset[] = [
  {
    id: "executivo",
    nome: "Executivo",
    descricao: "Design profissional e elegante para apresentações executivas",
    corPrimaria: "#1E3A8A", // Azul escuro
    corSecundaria: "#3B82F6", // Azul claro
    incluirPestel: true,
    incluirSwot: true,
    incluirOkr: true,
    incluirBsc: true,
    incluirGraficos: true,
    incluirRecomendacoes: true,
  },
  {
    id: "tecnico",
    nome: "Técnico",
    descricao: "Foco em dados e análises detalhadas com gráficos completos",
    corPrimaria: "#047857", // Verde escuro
    corSecundaria: "#10B981", // Verde claro
    incluirPestel: true,
    incluirSwot: true,
    incluirOkr: true,
    incluirBsc: true,
    incluirGraficos: true,
    incluirRecomendacoes: true,
  },
  {
    id: "minimalista",
    nome: "Minimalista",
    descricao: "Design limpo e objetivo, focado no essencial",
    corPrimaria: "#374151", // Cinza escuro
    corSecundaria: "#6B7280", // Cinza médio
    incluirPestel: true,
    incluirSwot: true,
    incluirOkr: false,
    incluirBsc: false,
    incluirGraficos: false,
    incluirRecomendacoes: false,
  },
  {
    id: "arqueo",
    nome: "Grupo Arqueo (Padrão)",
    descricao: "Cores institucionais do Grupo Arqueo",
    corPrimaria: "#8B1538", // Bordo
    corSecundaria: "#FF6B35", // Laranja
    incluirPestel: true,
    incluirSwot: true,
    incluirOkr: true,
    incluirBsc: true,
    incluirGraficos: true,
    incluirRecomendacoes: true,
  },
];

interface TemplateGalleryProps {
  onSelectTemplate: (template: TemplatePreset) => void;
}

export default function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Galeria de Templates
        </CardTitle>
        <CardDescription>
          Selecione um template pronto como ponto de partida
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => onSelectTemplate(template)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-sm">{template.nome}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{template.descricao}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(template);
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>

              {/* Preview de cores */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <div
                    className="h-8 rounded border"
                    style={{ backgroundColor: template.corPrimaria }}
                  />
                  <p className="text-xs text-center mt-1 text-muted-foreground">Primária</p>
                </div>
                <div className="flex-1">
                  <div
                    className="h-8 rounded border"
                    style={{ backgroundColor: template.corSecundaria }}
                  />
                  <p className="text-xs text-center mt-1 text-muted-foreground">Secundária</p>
                </div>
              </div>

              {/* Seções incluídas */}
              <div className="flex flex-wrap gap-1">
                {template.incluirPestel && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">PESTEL</span>
                )}
                {template.incluirSwot && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">SWOT</span>
                )}
                {template.incluirOkr && (
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">OKR</span>
                )}
                {template.incluirBsc && (
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">BSC</span>
                )}
                {template.incluirGraficos && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">Gráficos</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
