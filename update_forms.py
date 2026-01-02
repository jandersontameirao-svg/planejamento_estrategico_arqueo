import re

# Ler arquivo
with open('client/src/pages/IdentidadeOrganizacional.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Atualizar RBV/VRIO
content = re.sub(
    r'(<Label className="text-base font-semibold mb-2 block">Recursos e Capacidades Valiosos</Label>\s*<Textarea placeholder="[^"]*" rows=\{3\} disabled=\{!canEdit\} />)',
    r'<Label className="text-base font-semibold mb-2 block">Recursos e Capacidades Valiosos</Label>\n                    <Textarea placeholder="Quais recursos/capacidades agregam valor aos clientes?" rows={3} disabled={!canEdit} value={rbvData.valioso} onChange={(e) => setRbvData({...rbvData, valioso: e.target.value})} />',
    content
)

content = re.sub(
    r'(<Label className="text-base font-semibold mb-2 block">Recursos Raros</Label>\s*<Textarea placeholder="[^"]*" rows=\{3\} disabled=\{!canEdit\} />)',
    r'<Label className="text-base font-semibold mb-2 block">Recursos Raros</Label>\n                    <Textarea placeholder="Quais recursos são difíceis de encontrar no mercado?" rows={3} disabled={!canEdit} value={rbvData.raro} onChange={(e) => setRbvData({...rbvData, raro: e.target.value})} />',
    content
)

content = re.sub(
    r'(<Label className="text-base font-semibold mb-2 block">Recursos Inimitáveis</Label>\s*<Textarea placeholder="[^"]*" rows=\{3\} disabled=\{!canEdit\} />)',
    r'<Label className="text-base font-semibold mb-2 block">Recursos Inimitáveis</Label>\n                    <Textarea placeholder="Quais recursos são difíceis de copiar pelos concorrentes?" rows={3} disabled={!canEdit} value={rbvData.inimitavel} onChange={(e) => setRbvData({...rbvData, inimitavel: e.target.value})} />',
    content
)

content = re.sub(
    r'(<Label className="text-base font-semibold mb-2 block">Organização para Explorar</Label>\s*<Textarea placeholder="[^"]*" rows=\{3\} disabled=\{!canEdit\} />)',
    r'<Label className="text-base font-semibold mb-2 block">Organização para Explorar</Label>\n                    <Textarea placeholder="A empresa está organizada para explorar esses recursos?" rows={3} disabled={!canEdit} value={rbvData.organizado} onChange={(e) => setRbvData({...rbvData, organizado: e.target.value})} />',
    content
)

# Botão RBV
content = re.sub(
    r'<Button type="submit" size="lg">\s*<Save className="mr-2 h-4 w-4" />\s*Salvar Análise RBV/VRIO\s*</Button>',
    r'<Button onClick={handleSaveRbvVrio} disabled={saveRbvVrioMutation.isPending} size="lg">\n                        <Save className="mr-2 h-4 w-4" />\n                        Salvar Análise RBV/VRIO\n                      </Button>',
    content
)

# Escrever arquivo
with open('client/src/pages/IdentidadeOrganizacional.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ RBV/VRIO atualizado!")
