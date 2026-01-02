import re

# Ler arquivo
with open('client/src/pages/IdentidadeOrganizacional.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Substituir placeholder do gráfico PESTEL
content = re.sub(
    r'<div className="bg-white border rounded-lg p-6 h-96">\s*<h3 className="text-lg font-semibold mb-4">Visualização PESTEL</h3>\s*<div className="flex items-center justify-center h-80 bg-muted/20 rounded text-muted-foreground">\s*<p>Gráfico Radar \(Recharts\) - Mostrará distribuição dos 6 fatores</p>\s*</div>\s*</div>',
    '<GraficosPestel politico={pestelData.politico} economico={pestelData.economico} social={pestelData.social} tecnologico={pestelData.tecnologico} ecologico={pestelData.ecologico} legal={pestelData.legal} />',
    content,
    flags=re.DOTALL
)

# Escrever arquivo
with open('client/src/pages/IdentidadeOrganizacional.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Gráficos substituídos!")
