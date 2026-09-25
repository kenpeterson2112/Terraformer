import { SCREEN_W } from '../game/planet'

// Curved segmented meter anchored to a bottom corner; must be placed inside an <svg>.
export function FanMeter({ side, fill, color, glow }: { side: 'left' | 'right'; fill: number; color: string; glow: string }) {
  const N   = 10
  const px  = side === 'left' ? 0 : SCREEN_W
  const py  = 832
  const dir = side === 'left' ? 1 : -1
  const filled = Math.round(fill * N)

  return (
    <g>
      {Array.from({ length: N }, (_, i) => {
        const t       = i / (N - 1)
        const deg     = 12 + t * 68            // 12° → 80°
        const rad     = (deg * Math.PI) / 180
        const innerR  = 42
        const outerR  = innerR + 12 + i * 5   // 54 → 99
        const active  = i < filled

        const x1 = px + dir * Math.cos(rad) * innerR
        const y1 = py - Math.sin(rad) * innerR
        const x2 = px + dir * Math.cos(rad) * outerR
        const y2 = py - Math.sin(rad) * outerR

        return (
          <g key={i}>
            {active && (
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={glow} strokeWidth="12" strokeLinecap="round" opacity="0.2" />
            )}
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={active ? color : 'rgba(255,255,255,0.07)'}
              strokeWidth="5.5" strokeLinecap="round" />
          </g>
        )
      })}
    </g>
  )
}

// Resource label above a fan meter.
export function FanMeterLabel({ side, label, value, labelColor, valueColor }: {
  side: 'left' | 'right'; label: string; value: string; labelColor: string; valueColor: string
}) {
  const x      = side === 'left' ? 10 : SCREEN_W - 10
  const anchor = side === 'left' ? undefined : 'end'
  return (
    <>
      <text x={x} y="727" fill={labelColor} fontSize="7" fontFamily="Orbitron" letterSpacing="0.8" opacity="0.65" textAnchor={anchor}>{label}</text>
      <text x={x} y="737" fill={valueColor} fontSize="8" fontFamily="Orbitron" fontWeight="600" opacity="0.8" textAnchor={anchor}>{value}</text>
    </>
  )
}
