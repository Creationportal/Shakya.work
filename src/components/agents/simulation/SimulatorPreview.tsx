export default function SimulatorPreview({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="120" height="80" rx="6" fill="var(--color-surface, #f6f6f4)" />
      <rect x="4" y="4" width="112" height="72" rx="4" fill="var(--color-paper, #ffffff)" stroke="var(--color-line, #e2e2dc)" />
      {/* rooms */}
      <rect x="10" y="10" width="42" height="24" rx="2" fill="rgba(0,0,0,0.03)" />
      <rect x="58" y="10" width="52" height="24" rx="2" fill="rgba(0,0,0,0.03)" />
      <rect x="10" y="38" width="34" height="18" rx="2" fill="rgba(0,0,0,0.03)" />
      <rect x="48" y="38" width="26" height="18" rx="2" fill="rgba(0,0,0,0.03)" />
      <rect x="78" y="38" width="32" height="34" rx="2" fill="rgba(0,0,0,0.03)" />
      {/* desks */}
      <rect x="14" y="14" width="10" height="6" rx="1" fill="#d2d2cb" />
      <rect x="30" y="14" width="10" height="6" rx="1" fill="#d2d2cb" />
      <rect x="14" y="26" width="10" height="6" rx="1" fill="#d2d2cb" />
      <rect x="30" y="26" width="10" height="6" rx="1" fill="#d2d2cb" />
      {/* humans */}
      <circle cx="22" cy="52" r="3" fill="#d4537e" />
      <circle cx="32" cy="60" r="3" fill="#3b82c4" />
      <circle cx="88" cy="48" r="3" fill="#d4537e" />
      <circle cx="100" cy="60" r="3" fill="#3b82c4" />
      {/* AI agents (robots) */}
      <rect x="64" y="42" width="5" height="6" rx="1" fill="#ef9f27" />
      <rect x="54" y="56" width="5" height="6" rx="1" fill="#ef9f27" />
      <rect x="92" y="64" width="5" height="6" rx="1" fill="#ef9f27" />
      <rect x="106" y="44" width="5" height="6" rx="1" fill="#ef9f27" />
      {/* labels */}
      <text x="60" y="74" fontSize="6" fill="var(--color-muted, #6b7280)" textAnchor="middle">Office Simulator</text>
    </svg>
  );
}
