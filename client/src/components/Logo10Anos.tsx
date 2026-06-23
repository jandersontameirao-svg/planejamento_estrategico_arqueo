import { useState } from "react";

// Selo oficial "10 anos" do Grupo Arqueo (arte vetorial real).
export default function Logo10Anos({ className = "", height = 56 }: { className?: string; height?: number }) {
  const [src, setSrc] = useState("/logo-10anos.svg");
  return (
    <img
      src={src}
      alt="Grupo Arqueo - 10 anos"
      style={{ height }}
      className={className}
      onError={() => {
        if (src.endsWith(".svg")) setSrc("/logo-10anos.webp");
      }}
    />
  );
}
