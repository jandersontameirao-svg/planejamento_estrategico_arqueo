import re

# Ler arquivo
with open('client/src/pages/IdentidadeOrganizacional.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Adicionar imports dos gráficos no topo
imports_section = """import { trpc } from "@/lib/trpc";
import { Building2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";"""

new_imports = """import { trpc } from "@/lib/trpc";
import { Building2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { GraficosPestel } from "@/components/GraficosPestel";
import { Graficos5Forcas } from "@/components/Graficos5Forcas";
import { GraficosStakeholders } from "@/components/GraficosStakeholders";
import { GraficosRBV } from "@/components/GraficosRBV";
import { GraficosSWOT } from "@/components/GraficosSWOT";
import { GraficosOKR } from "@/components/GraficosOKR";"""

content = content.replace(imports_section, new_imports)

# Escrever arquivo
with open('client/src/pages/IdentidadeOrganizacional.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Imports adicionados!")
