import re

# Ler arquivo
with open('client/src/pages/IdentidadeOrganizacional.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Atualizar SWOT - Forças
content = re.sub(
    r'(<h4 className="font-semibold text-green-900 mb-2">Forças \(Strengths\)</h4>\s*<p className="text-sm text-green-800 mb-2">Internas - Positivas</p>\s*<Textarea placeholder="[^"]*" rows=\{4\} disabled=\{!canEdit\} />)',
    r'<h4 className="font-semibold text-green-900 mb-2">Forças (Strengths)</h4>\n                      <p className="text-sm text-green-800 mb-2">Internas - Positivas</p>\n                      <Textarea placeholder="Competências, recursos, vantagens..." rows={4} disabled={!canEdit} value={swotData.forcas} onChange={(e) => setSwotData({...swotData, forcas: e.target.value})} />',
    content
)

# Fraquezas
content = re.sub(
    r'(<h4 className="font-semibold text-red-900 mb-2">Fraquezas \(Weaknesses\)</h4>\s*<p className="text-sm text-red-800 mb-2">Internas - Negativas</p>\s*<Textarea placeholder="[^"]*" rows=\{4\} disabled=\{!canEdit\} />)',
    r'<h4 className="font-semibold text-red-900 mb-2">Fraquezas (Weaknesses)</h4>\n                      <p className="text-sm text-red-800 mb-2">Internas - Negativas</p>\n                      <Textarea placeholder="Limitações, desvantagens, gaps..." rows={4} disabled={!canEdit} value={swotData.fraquezas} onChange={(e) => setSwotData({...swotData, fraquezas: e.target.value})} />',
    content
)

# Oportunidades
content = re.sub(
    r'(<h4 className="font-semibold text-blue-900 mb-2">Oportunidades \(Opportunities\)</h4>\s*<p className="text-sm text-blue-800 mb-2">Externas - Positivas</p>\s*<Textarea placeholder="[^"]*" rows=\{4\} disabled=\{!canEdit\} />)',
    r'<h4 className="font-semibold text-blue-900 mb-2">Oportunidades (Opportunities)</h4>\n                      <p className="text-sm text-blue-800 mb-2">Externas - Positivas</p>\n                      <Textarea placeholder="Mercados, tendências, possibilidades..." rows={4} disabled={!canEdit} value={swotData.oportunidades} onChange={(e) => setSwotData({...swotData, oportunidades: e.target.value})} />',
    content
)

# Ameaças
content = re.sub(
    r'(<h4 className="font-semibold text-yellow-900 mb-2">Ameaças \(Threats\)</h4>\s*<p className="text-sm text-yellow-800 mb-2">Externas - Negativas</p>\s*<Textarea placeholder="[^"]*" rows=\{4\} disabled=\{!canEdit\} />)',
    r'<h4 className="font-semibold text-yellow-900 mb-2">Ameaças (Threats)</h4>\n                      <p className="text-sm text-yellow-800 mb-2">Externas - Negativas</p>\n                      <Textarea placeholder="Riscos, competição, mudanças..." rows={4} disabled={!canEdit} value={swotData.ameacas} onChange={(e) => setSwotData({...swotData, ameacas: e.target.value})} />',
    content
)

# Estratégias TOWS
content = re.sub(
    r'(<Label className="text-base font-semibold mb-2 block">Estratégias TOWS</Label>\s*<Textarea placeholder="[^"]*" rows=\{4\} disabled=\{!canEdit\} />)',
    r'<Label className="text-base font-semibold mb-2 block">Estratégias TOWS</Label>\n                    <Textarea placeholder="Estratégias derivadas da matriz SWOT (SO, ST, WO, WT)..." rows={4} disabled={!canEdit} value={swotData.estrategias} onChange={(e) => setSwotData({...swotData, estrategias: e.target.value})} />',
    content
)

# Botão SWOT
content = re.sub(
    r'<Button type="submit" size="lg">\s*<Save className="mr-2 h-4 w-4" />\s*Salvar Análise SWOT/TOWS\s*</Button>',
    r'<Button onClick={handleSaveSwotTows} disabled={saveSwoTtowsMutation.isPending} size="lg">\n                        <Save className="mr-2 h-4 w-4" />\n                        Salvar Análise SWOT/TOWS\n                      </Button>',
    content
)

# Escrever arquivo
with open('client/src/pages/IdentidadeOrganizacional.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ SWOT/TOWS atualizado!")
