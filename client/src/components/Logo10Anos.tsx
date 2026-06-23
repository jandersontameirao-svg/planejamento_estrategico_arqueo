// Selo comemorativo "10 anos" do Grupo Arqueo. SVG vetorial (sem fundo, escala perfeita).
export default function Logo10Anos({ className = "", height = 56 }: { className?: string; height?: number }) {
  return (
    <svg
      className={className}
      height={height}
      viewBox="0 0 340 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Grupo Arqueo - 10 anos"
    >
      <defs>
        <linearGradient id="gold10" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3dd9a" />
          <stop offset="45%" stopColor="#c9a24b" />
          <stop offset="100%" stopColor="#9c7322" />
        </linearGradient>
      </defs>

      {/* Marca "A" tri-cor */}
      <path d="M95 18 L150 122 H118 L70 30 Z" fill="#e8731c" />
      <path d="M70 30 L22 122 H54 L92 56 Z" fill="#f5a623" />
      <circle cx="72" cy="92" r="24" fill="#2b7cb3" />

      {/* "10" dourado */}
      <text x="170" y="92" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="96" fill="url(#gold10)">10</text>
      {/* faixa */}
      <path d="M150 118 Q230 138 320 110" stroke="url(#gold10)" strokeWidth="9" fill="none" strokeLinecap="round" />
      {/* "anos" dourado */}
      <text x="250" y="138" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontWeight="700" fontSize="40" fill="url(#gold10)">anos</text>
    </svg>
  );
}
