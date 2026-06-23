// Selo "10 anos" do Grupo Arqueo — usa a arte oficial em /logo-10anos.png (fundo transparente).
// Se o arquivo ainda nao existir, o elemento se esconde (sem imagem quebrada).
export default function Logo10Anos({ className = "", height = 56 }: { className?: string; height?: number }) {
  return (
    <img
      src="/logo-10anos.png"
      alt="Grupo Arqueo - 10 anos"
      style={{ height }}
      className={className}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
