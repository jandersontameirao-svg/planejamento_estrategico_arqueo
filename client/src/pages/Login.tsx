import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Logo10Anos from "@/components/Logo10Anos";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const login = trpc.auth.login.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error(error.message || "Falha no login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha) {
      toast.error("Preencha e-mail e senha");
      return;
    }
    login.mutate({ email: email.trim(), senha });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 bg-gradient-to-br from-[#f6c89a] via-[#fde9d4] to-[#bcd6ea]">
      {/* manchas de cor da marca ao fundo */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#e8731c]/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-28 h-[28rem] w-[28rem] rounded-full bg-[#2b7cb3]/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 right-1/3 h-80 w-80 rounded-full bg-[#f5a623]/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-[#9b1c1c]/15 blur-3xl" />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#e8731c]/15 bg-white/80 shadow-2xl backdrop-blur-md">
        {/* faixa superior tri-cor da marca */}
        <div className="h-2 w-full bg-gradient-to-r from-[#f5a623] via-[#e8731c] to-[#9b1c1c]" />

        <div className="px-8 pb-8 pt-7">
          <div className="mb-7 flex flex-col items-center text-center">
            <Logo10Anos height={150} className="mb-5 drop-shadow-md" />
            <h1 className="text-2xl font-bold tracking-tight text-[#9b1c1c]">
              Planejamento Estratégico
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Grupo Arqueo · acesso restrito
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#e8731c] font-semibold hover:bg-[#cf6417]"
              disabled={login.isPending}
            >
              {login.isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
