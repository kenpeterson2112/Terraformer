// Tile structure icons, drawn inside the planet SVG around (0,0) and
// positioned with a translate/scale wrapper.

interface IconProps { x: number; y: number; scale?: number; opacity?: number }

function Placed({ x, y, scale = 1, opacity = 1, children }: IconProps & { children: React.ReactNode }) {
  return (
    <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${scale.toFixed(3)})`} opacity={opacity}>
      {children}
    </g>
  )
}

export function FarmIcon(props: IconProps) {
  return (
    <Placed {...props}>
      {([-5, 0, 5] as const).map(dx => (
        <g key={dx}>
          <line x1={dx} y1={7} x2={dx} y2={-3} stroke="#4ade80" strokeWidth="1.5" />
          <ellipse cx={dx} cy={-6} rx="2.6" ry="3.4" fill="#16a34a" />
          <line x1={dx - 2} y1={-1.5} x2={dx + 2} y2={-4} stroke="#86efac" strokeWidth="0.8" />
        </g>
      ))}
    </Placed>
  )
}

export function HydroIcon(props: IconProps) {
  return (
    <Placed {...props}>
      <rect x={-3} y={-10} width="6" height="18" rx="1.5" fill="#0891b2" opacity="0.9" />
      {([-6, -2, 2, 6] as const).map(dy => (
        <line key={dy} x1={-3} y1={dy} x2={-10} y2={dy - 1} stroke="#22d3ee" strokeWidth="1.2" />
      ))}
      <ellipse cx={0} cy={-11} rx="5" ry="2.5" fill="#06b6d4" opacity="0.8" />
      <line x1={0} y1={8} x2={0} y2={13} stroke="#22d3ee" strokeWidth="1.5" />
    </Placed>
  )
}

export function HabIcon(props: IconProps) {
  return (
    <Placed {...props}>
      <rect x={-8} y={-1} width="16" height="9" rx="1" fill="#5b21b6" stroke="#7c3aed" strokeWidth="0.8" />
      <path d="M-8,-1 Q-8,-12 0,-14 Q8,-12 8,-1" fill="#6d28d9" stroke="#a78bfa" strokeWidth="0.8" />
      <rect x={-2.5} y={1} width="5" height="7" rx="0.5" fill="#3b0764" />
      {([-4, 4] as const).map(dx => (
        <rect key={dx} x={dx - 1.5} y={0} width="3" height="3" rx="0.5" fill="#c4b5fd" opacity="0.7" />
      ))}
    </Placed>
  )
}

export function ScaffoldIcon(props: IconProps) {
  return (
    <Placed {...props}>
      <line x1={-7} y1={7}  x2={-7} y2={-8} stroke="#fbbf24" strokeWidth="1.5" />
      <line x1={7}  y1={7}  x2={7}  y2={-8} stroke="#fbbf24" strokeWidth="1.5" />
      <line x1={-7} y1={2}  x2={7}  y2={2}  stroke="#fbbf24" strokeWidth="1.2" />
      <line x1={-7} y1={-4} x2={7}  y2={-4} stroke="#d97706" strokeWidth="1"   />
      <line x1={-4} y1={7}  x2={4}  y2={-8} stroke="#d97706" strokeWidth="0.9" opacity="0.45" />
    </Placed>
  )
}
