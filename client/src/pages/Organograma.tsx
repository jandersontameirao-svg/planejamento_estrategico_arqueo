import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users, Building2, Layers, TrendingUp, ChevronDown, ChevronRight, UserCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const ORG_URL = "https://organoarq-tuqamxpj.manus.space";

// ─── Org Tree Node ────────────────────────────────────────────────────────────

interface OrgNode {
  id: number;
  title: string;
  level: number;
  parentId: number | null;
  departmentId: number | null;
  departmentName: string | null;
  departmentColor: string | null;
  people: {
    id: number;
    name: string;
    email: string | null;
    photoUrl: string | null;
    isLeadership: boolean;
    employmentType: string | null;
  }[];
  children: OrgNode[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function OrgNodeCard({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex items-start gap-2 group"
        style={{ paddingLeft: `${depth * 24}px` }}
      >
        {/* Expand toggle */}
        <button
          className="mt-3 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setExpanded((v) => !v)}
          disabled={!hasChildren}
          aria-label={expanded ? "Colapsar" : "Expandir"}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <span className="w-4 h-4 inline-block" />
          )}
        </button>

        {/* Card */}
        <div className="flex-1 min-w-0">
          <div className="border rounded-lg p-3 bg-card hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-sm truncate">{node.title}</span>
                {node.departmentName && (
                  <Badge
                    variant="outline"
                    className="text-xs shrink-0"
                    style={{
                      borderColor: node.departmentColor ?? undefined,
                      color: node.departmentColor ?? undefined,
                    }}
                  >
                    {node.departmentName}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Layers className="w-3 h-3" />
                <span>N{node.level}</span>
              </div>
            </div>

            {/* People */}
            {node.people.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {node.people.map((person) => (
                  <div key={person.id} className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={person.photoUrl ?? undefined} alt={person.name} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(person.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate max-w-[160px]">{person.name}</p>
                      {person.email && (
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {person.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Cargo vago</p>
            )}

            {hasChildren && (
              <p className="text-xs text-muted-foreground mt-2">
                {node.children.length} subcargo{node.children.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="border-l-2 border-dashed border-muted ml-[14px] pl-0">
          {node.children.map((child) => (
            <OrgNodeCard key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Organograma() {
  const { data: overview, isLoading: loadingOverview } = trpc.organograma.overview.useQuery();
  const { data: leadersData, isLoading: loadingLeaders } = trpc.organograma.leaders.useQuery();
  const { data: departmentsData, isLoading: loadingDepts } = trpc.organograma.departments.useQuery();
  const { data: treeData, isLoading: loadingTree } = trpc.organograma.tree.useQuery();

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <Users className="w-4 h-4 shrink-0" />
          <span className="font-medium">
            O organograma é gerenciado pelo OrganoArq. Esta é uma visualização somente leitura.
          </span>
        </div>
        <a
          href={ORG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button variant="outline" size="sm" className="gap-1 text-blue-700 border-blue-300 hover:bg-blue-100">
            <ExternalLink className="w-3 h-3" />
            Abrir OrganoArq
          </Button>
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                ← Planejamento
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Estrutura Organizacional</h1>
                <p className="text-xs text-muted-foreground">OrganoArq — Sistema de Organograma Dinâmico</p>
              </div>
            </div>
          </div>
          <a href={ORG_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1">
              <ExternalLink className="w-3 h-3" />
              Abrir no OrganoArq
            </Button>
          </a>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total de Cargos",
              value: loadingOverview ? "—" : overview?.totalPositions ?? 0,
              icon: <Building2 className="w-5 h-5 text-indigo-500" />,
              color: "text-indigo-600",
            },
            {
              label: "Colaboradores",
              value: loadingOverview ? "—" : overview?.totalPeople ?? 0,
              icon: <Users className="w-5 h-5 text-emerald-500" />,
              color: "text-emerald-600",
            },
            {
              label: "Níveis Hierárquicos",
              value: loadingOverview ? "—" : overview?.hierarchyLevels ?? 0,
              icon: <Layers className="w-5 h-5 text-amber-500" />,
              color: "text-amber-600",
            },
            {
              label: "Taxa de Ocupação",
              value: loadingOverview ? "—" : `${overview?.occupancyRate ?? 0}%`,
              icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
              color: "text-blue-600",
            },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">{kpi.icon}</div>
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tree">
          <TabsList className="mb-4">
            <TabsTrigger value="tree">Árvore Hierárquica</TabsTrigger>
            <TabsTrigger value="leaders">Lideranças</TabsTrigger>
            <TabsTrigger value="departments">Departamentos</TabsTrigger>
          </TabsList>

          {/* ── Tree Tab ── */}
          <TabsContent value="tree">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estrutura Hierárquica Completa</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTree ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : treeData?.tree && treeData.tree.length > 0 ? (
                  <div className="space-y-1">
                    {treeData.tree.map((node) => (
                      <OrgNodeCard key={node.id} node={node} depth={0} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Nenhum cargo encontrado</p>
                    <p className="text-sm">Aguardando sincronização com o OrganoArq.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Leaders Tab ── */}
          <TabsContent value="leaders">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lideranças do Grupo</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingLeaders ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : leadersData?.leaders && leadersData.leaders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {leadersData.leaders.map((leader) => (
                      <div
                        key={leader.id}
                        className="border rounded-lg p-4 flex items-start gap-3 hover:shadow-sm transition-shadow"
                      >
                        <Avatar className="w-12 h-12 shrink-0">
                          <AvatarImage
                            src={leader.person?.photoUrl ?? undefined}
                            alt={leader.person?.name}
                          />
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                            {leader.person ? getInitials(leader.person.name) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm">{leader.title}</p>
                          {leader.person ? (
                            <>
                              <p className="text-sm text-muted-foreground truncate">
                                {leader.person.name}
                              </p>
                              {leader.person.email && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {leader.person.email}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Cargo vago</p>
                          )}
                          <div className="flex items-center gap-1 mt-2">
                            <UserCheck className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {leader.subordinatesCount} subordinado
                              {leader.subordinatesCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Nenhuma liderança encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Departments Tab ── */}
          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Departamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDepts ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : departmentsData?.departments && departmentsData.departments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {departmentsData.departments.map((dept) => (
                      <div
                        key={dept.id}
                        className="border rounded-lg p-4 flex items-center gap-3 hover:shadow-sm transition-shadow"
                        style={{ borderLeftColor: dept.color ?? undefined, borderLeftWidth: 4 }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: dept.color ? `${dept.color}20` : "#f3f4f6" }}
                        >
                          <Building2
                            className="w-5 h-5"
                            style={{ color: dept.color ?? "#6b7280" }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{dept.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {dept.positionsCount} cargo{dept.positionsCount !== 1 ? "s" : ""}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {dept.peopleCount} pessoa{dept.peopleCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Nenhum departamento encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
