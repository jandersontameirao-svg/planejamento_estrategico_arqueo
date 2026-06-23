import { useState } from "react";

// Selo "10 anos" do Grupo Arqueo.
// Usa a arte oficial em /logo-10anos.png; se ela nao existir, mostra um SVG fiel (nunca fica vazio).
export default function Logo10Anos({ className = "", height = 56 }: { className?: string; height?: number }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src="/logo-10anos.png"
        alt="Grupo Arqueo - 10 anos"
        style={{ height }}
        className={className}
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback vetorial (marca tri-cor + "10 anos" dourado)
  return (
    <svg className={className} height={height} viewBox="0 0 430 185" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Grupo Arqueo - 10 anos">
      <defs>
        <linearGradient id="g10" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6e3a8" />
          <stop offset="48%" stopColor="#cba54e" />
          <stop offset="100%" stopColor="#9a7223" />
        </linearGradient>
      </defs>
      {/* Marca "A" */}
      <path d="M40 158 L88 44" stroke="#f5a623" strokeWidth="26" strokeLinecap="round" />
      <path d="M88 44 L136 158" stroke="#e8731c" strokeWidth="26" strokeLinecap="round" />
      <circle cx="88" cy="124" r="19" fill="#2b7cb3" />
      {/* "10" */}
      <text x="172" y="132" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="118" fill="url(#g10)">10</text>
      {/* faixa */}
      <path d="M150 156 Q290 184 418 140" stroke="url(#g10)" strokeWidth="9" fill="none" strokeLinecap="round" />
      {/* "anos" */}
      <text x="300" y="176" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontWeight="700" fontSize="46" fill="url(#g10)">anos</text>
    </svg>
  );
}
