import re

# Ler arquivo
with open('client/src/pages/IdentidadeOrganizacional.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Substituir placeholder do gráfico 5 Forças
content = re.sub(
    r'<div className="bg-white border rounded-lg p-6 h-96">\s*<h3 className="text-lg font-semibold mb-4">Visualização 5 Forças</h3>\s*<div className="flex items-center justify-center h-80 bg-muted/20 rounded text-muted-foreground">\s*<p>Gráfico de Barras \(Recharts\) - Mostrará intensidade de cada força</p>\s*</div>\s*</div>',
    '<Graficos5Forcas rivalidade={forcasData.rivalidade} fornecedores={forcasData.fornecedores} clientes={forcasData.clientes} novosEntrantes={forcasData.novosEntrantes} substitutos={forcasData.substitutos} />',
    content,
    flags=re.DOTALL
)

# Adicionar gráfico para Stakeholders
content = re.sub(
    r'(<h4 className="font-semibold text-green-900 mb-2">Baixo Poder / Baixo Interesse</h4>\s*<p className="text-sm text-green-800 mb-2">Monitorar</p>\s*<Textarea[^>]*\/>)',
    r'\1\n                  </div>\n                  \n                  <div className="border rounded-lg p-4">\n                    <h3 className="text-lg font-semibold mb-4">Matriz de Stakeholders</h3>\n                    <GraficosStakeholders altoPoder={stakeholdersData.altoPoder} altoInteresse={stakeholdersData.altoInteresse} baixoPoder={stakeholdersData.baixoPoder} baixoInteresse={stakeholdersData.baixoInteresse} />',
    content,
    flags=re.DOTALL
)

# Adicionar gráfico para RBV
content = re.sub(
    r'(<Label className="text-base font-semibold mb-2 block">Organização para Explorar</Label>\s*<Textarea[^>]*value=\{rbvData\.organizado\}[^>]*\/>)',
    r'\1\n                  </div>\n                  \n                  <div className="border rounded-lg p-4">\n                    <h3 className="text-lg font-semibold mb-4">Análise RBV/VRIO</h3>\n                    <GraficosRBV valioso={rbvData.valioso} raro={rbvData.raro} inimitavel={rbvData.inimitavel} organizado={rbvData.organizado} />',
    content,
    flags=re.DOTALL
)

# Adicionar gráfico para SWOT
content = re.sub(
    r'(<Label className="text-base font-semibold mb-2 block">Estratégias TOWS</Label>\s*<Textarea[^>]*value=\{swotData\.estrategias\}[^>]*\/>)',
    r'\1\n                  </div>\n                  \n                  <div className="border rounded-lg p-4">\n                    <h3 className="text-lg font-semibold mb-4">Matriz SWOT</h3>\n                    <GraficosSWOT forcas={swotData.forcas} fraquezas={swotData.fraquezas} oportunidades={swotData.oportunidades} ameacas={swotData.ameacas} />',
    content,
    flags=re.DOTALL
)

# Adicionar gráfico para OKR
content = re.sub(
    r'(<Label className="text-base font-semibold mb-2 block">Objetivo 3</Label>\s*<Input[^>]*value=\{okrData\.objetivo3\}[^>]*\/>\s*<div className="mt-3 space-y-2">\s*<p className="text-sm font-semibold">Key Results:</p>\s*<Input[^>]*value=\{okrData\.kr3_1\}[^>]*\/>\s*<Input[^>]*value=\{okrData\.kr3_2\}[^>]*\/>\s*<Input[^>]*value=\{okrData\.kr3_3\}[^>]*\/>)',
    r'\1\n                  </div>\n                  \n                  <div className="border rounded-lg p-4">\n                    <h3 className="text-lg font-semibold mb-4">Progresso dos OKRs</h3>\n                    <GraficosOKR objetivo1={okrData.objetivo1} kr1_1={okrData.kr1_1} kr1_2={okrData.kr1_2} kr1_3={okrData.kr1_3} objetivo2={okrData.objetivo2} kr2_1={okrData.kr2_1} kr2_2={okrData.kr2_2} kr2_3={okrData.kr2_3} objetivo3={okrData.objetivo3} kr3_1={okrData.kr3_1} kr3_2={okrData.kr3_2} kr3_3={okrData.kr3_3} />',
    content,
    flags=re.DOTALL
)

# Escrever arquivo
with open('client/src/pages/IdentidadeOrganizacional.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Gráficos adicionados nas abas restantes!")
