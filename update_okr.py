import re

# Ler arquivo
with open('client/src/pages/IdentidadeOrganizacional.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Objetivo 1
content = re.sub(
    r'(<Label className="text-base font-semibold mb-2 block">Objetivo 1</Label>\s*<Input placeholder="[^"]*" disabled=\{!canEdit\} />\s*<div className="mt-3 space-y-2">\s*<p className="text-sm font-semibold">Key Results:</p>\s*<Input placeholder="[^"]*" disabled=\{!canEdit\} />\s*<Input placeholder="[^"]*" disabled=\{!canEdit\} />\s*<Input placeholder="[^"]*" disabled=\{!canEdit\} />)',
    r'<Label className="text-base font-semibold mb-2 block">Objetivo 1</Label>\n                    <Input placeholder="Ex: Aumentar participação de mercado" disabled={!canEdit} value={okrData.objetivo1} onChange={(e) => setOkrData({...okrData, objetivo1: e.target.value})} />\n                    <div className="mt-3 space-y-2">\n                      <p className="text-sm font-semibold">Key Results:</p>\n                      <Input placeholder="KR1: Aumentar vendas em 30%" disabled={!canEdit} value={okrData.kr1_1} onChange={(e) => setOkrData({...okrData, kr1_1: e.target.value})} />\n                      <Input placeholder="KR2: Conquistar 5 novos clientes estratégicos" disabled={!canEdit} value={okrData.kr1_2} onChange={(e) => setOkrData({...okrData, kr1_2: e.target.value})} />\n                      <Input placeholder="KR3: Reduzir churn de clientes em 20%" disabled={!canEdit} value={okrData.kr1_3} onChange={(e) => setOkrData({...okrData, kr1_3: e.target.value})} />',
    content
)

# Objetivo 2
content = re.sub(
    r'(<Label className="text-base font-semibold mb-2 block">Objetivo 2</Label>\s*<Input placeholder="[^"]*" disabled=\{!canEdit\} />\s*<div className="mt-3 space-y-2">\s*<p className="text-sm font-semibold">Key Results:</p>\s*<Input placeholder="[^"]*" disabled=\{!canEdit\} />\s*<Input placeholder="[^"]*" disabled=\{!canEdit\} />\s*<Input placeholder="[^"]*" disabled=\{!canEdit\} />)',
    r'<Label className="text-base font-semibold mb-2 block">Objetivo 2</Label>\n                    <Input placeholder="Ex: Melhorar satisfação do cliente" disabled={!canEdit} value={okrData.objetivo2} onChange={(e) => setOkrData({...okrData, objetivo2: e.target.value})} />\n                    <div className="mt-3 space-y-2">\n                      <p className="text-sm font-semibold">Key Results:</p>\n                      <Input placeholder="KR1: Aumentar NPS para 70+" disabled={!canEdit} value={okrData.kr2_1} onChange={(e) => setOkrData({...okrData, kr2_1: e.target.value})} />\n                      <Input placeholder="KR2: Reduzir tempo de resposta em 50%" disabled={!canEdit} value={okrData.kr2_2} onChange={(e) => setOkrData({...okrData, kr2_2: e.target.value})} />\n                      <Input placeholder="KR3: Atingir 95% de resolução na 1ª chamada" disabled={!canEdit} value={okrData.kr2_3} onChange={(e) => setOkrData({...okrData, kr2_3: e.target.value})} />',
    content
)

# Objetivo 3
content = re.sub(
    r'(<Label className="text-base font-semibold mb-2 block">Objetivo 3</Label>\s*<Input placeholder="[^"]*" disabled=\{!canEdit\} />\s*<div className="mt-3 space-y-2">\s*<p className="text-sm font-semibold">Key Results:</p>\s*<Input placeholder="[^"]*" disabled=\{!canEdit\} />\s*<Input placeholder="[^"]*" disabled=\{!canEdit\} />\s*<Input placeholder="[^"]*" disabled=\{!canEdit\} />)',
    r'<Label className="text-base font-semibold mb-2 block">Objetivo 3</Label>\n                    <Input placeholder="Ex: Inovar em produtos/serviços" disabled={!canEdit} value={okrData.objetivo3} onChange={(e) => setOkrData({...okrData, objetivo3: e.target.value})} />\n                    <div className="mt-3 space-y-2">\n                      <p className="text-sm font-semibold">Key Results:</p>\n                      <Input placeholder="KR1: Lançar 2 novos produtos" disabled={!canEdit} value={okrData.kr3_1} onChange={(e) => setOkrData({...okrData, kr3_1: e.target.value})} />\n                      <Input placeholder="KR2: Atingir 40% de receita de novos produtos" disabled={!canEdit} value={okrData.kr3_2} onChange={(e) => setOkrData({...okrData, kr3_2: e.target.value})} />\n                      <Input placeholder="KR3: Implementar 3 melhorias de processo" disabled={!canEdit} value={okrData.kr3_3} onChange={(e) => setOkrData({...okrData, kr3_3: e.target.value})} />',
    content
)

# Botão OKR
content = re.sub(
    r'<Button type="submit" size="lg">\s*<Save className="mr-2 h-4 w-4" />\s*Salvar OKRs\s*</Button>',
    r'<Button onClick={handleSaveOkr} disabled={saveOkrMutation.isPending} size="lg">\n                        <Save className="mr-2 h-4 w-4" />\n                        Salvar OKRs\n                      </Button>',
    content
)

# Escrever arquivo
with open('client/src/pages/IdentidadeOrganizacional.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ OKR atualizado!")
