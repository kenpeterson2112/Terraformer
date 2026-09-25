import { GRID, PCX, PCY, PR, TILE_COL, TRACKS, hexPoly, project } from '../game/planet'
import { FarmIcon, HabIcon, HydroIcon, ScaffoldIcon } from './StructureIcons'

// Rotation-aware planet rendering; must be placed inside an <svg>.
export function PlanetScene({ rx, ry }: { rx: number; ry: number }) {
  // Project every tile to its current 2D screen position
  const proj = GRID.map(t => ({ ...t, p: project(t, rx, ry) }))
  const projMap: Record<string, typeof proj[0]> = Object.fromEntries(proj.map(t => [`${t.q},${t.r}`, t]))

  // Visible = front hemisphere + small grace zone at horizon
  const visible = proj.filter(t => t.p.z > -0.12).sort((a, b) => a.p.z - b.p.z)

  const drought = projMap['2,-1']
  const build   = projMap['-1,2']

  return (
    <>
      <defs>
        <clipPath id="pc"><circle cx={PCX} cy={PCY} r={PR} /></clipPath>
        <radialGradient id="pgBase" cx="33%" cy="27%" r="72%">
          <stop offset="0%"   stopColor="#1a5c35" />
          <stop offset="28%"  stopColor="#0d3b60" />
          <stop offset="63%"  stopColor="#081840" />
          <stop offset="100%" stopColor="#030d22" />
        </radialGradient>
        <radialGradient id="pgShade" cx="68%" cy="72%" r="55%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#000" stopOpacity="0"    />
        </radialGradient>
        <radialGradient id="pgHi" cx="28%" cy="20%" r="36%">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0"    />
        </radialGradient>
        <radialGradient id="pgAtmo" cx="50%" cy="50%" r="50%">
          <stop offset="83%"  stopColor="#1d4ed8" stopOpacity="0"    />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.38" />
        </radialGradient>
        <filter id="fglow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Atmosphere halo + base sphere */}
      <circle cx={PCX} cy={PCY} r={PR + 22} fill="url(#pgAtmo)" />
      <circle cx={PCX} cy={PCY} r={PR}      fill="url(#pgBase)" />

      <g clipPath="url(#pc)">
        {/* Track connectors */}
        {TRACKS.map(([a, b], i) => {
          const ta = projMap[a], tb = projMap[b]
          if (!ta || !tb || ta.p.z < 0 || tb.p.z < 0) return null
          const op = Math.min(1, Math.min(ta.p.z, tb.p.z) + 0.3)
          return (
            <g key={i}>
              <line x1={ta.p.x} y1={ta.p.y} x2={tb.p.x} y2={tb.p.y}
                stroke="#1c3818" strokeWidth="4.5" strokeLinecap="round" opacity={op} />
              <line x1={ta.p.x} y1={ta.p.y} x2={tb.p.x} y2={tb.p.y}
                stroke="#3d6038" strokeWidth="2"   strokeLinecap="round" strokeDasharray="5 3" opacity={op} />
            </g>
          )
        })}

        {/* Hex tiles (back-to-front) */}
        {visible.map(t => {
          const [fill, stroke] = TILE_COL[t.t]
          const scale  = Math.max(0.5, t.p.z * 0.35 + 0.65)
          const opacity = Math.min(1, t.p.z + 0.85)
          return (
            <polygon key={`${t.q},${t.r}`}
              points={hexPoly(t.p.x, t.p.y, scale)}
              fill={fill} stroke={stroke} strokeWidth="0.8" opacity={opacity} />
          )
        })}

        {/* Structure icons */}
        {visible.map(t => {
          const scale   = Math.max(0.5, t.p.z * 0.35 + 0.65)
          const opacity = Math.min(1, t.p.z + 0.5)
          const key     = `si-${t.q},${t.r}`
          if (t.t === 'farm')    return <FarmIcon     key={key} x={t.p.x} y={t.p.y} scale={scale} opacity={opacity} />
          if (t.t === 'hydro')   return <HydroIcon    key={key} x={t.p.x} y={t.p.y} scale={scale} opacity={opacity} />
          if (t.t === 'hab')     return <HabIcon      key={key} x={t.p.x} y={t.p.y} scale={scale} opacity={opacity} />
          if (t.t === 'build')   return <ScaffoldIcon key={key} x={t.p.x} y={t.p.y} scale={scale} opacity={opacity} />
          return null
        })}

        {/* Sphere depth shading + specular highlight */}
        <circle cx={PCX} cy={PCY} r={PR} fill="url(#pgShade)" />
        <circle cx={PCX} cy={PCY} r={PR} fill="url(#pgHi)"    />
      </g>

      {/* Rim */}
      <circle cx={PCX} cy={PCY} r={PR}     fill="none" stroke="#3b82f6" strokeWidth="2"   opacity="0.22" />
      <circle cx={PCX} cy={PCY} r={PR + 9} fill="none" stroke="#60a5fa" strokeWidth="0.8" opacity="0.1"  />

      {/* Drought warning — follows tile on rotation */}
      {drought && drought.p.z > 0.1 && (
        <>
          <g filter="url(#fglow)">
            <line x1={drought.p.x} y1={drought.p.y - 12} x2={drought.p.x} y2={drought.p.y - 24}
              stroke="#ef4444" strokeWidth="1" opacity="0.5" />
            <circle cx={drought.p.x} cy={drought.p.y - 33} r="12"
              fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
            <text x={drought.p.x} y={drought.p.y - 28} textAnchor="middle"
              fontSize="15" fill="#ef4444" fontWeight="bold" fontFamily="sans-serif">!</text>
          </g>
          <text x={drought.p.x} y={drought.p.y - 52} textAnchor="middle"
            fontSize="7.5" fill="#f87171" fontFamily="Orbitron" letterSpacing="1.5" opacity="0.9">
            DROUGHT
          </text>
        </>
      )}

      {/* Build timer — follows tile on rotation */}
      {build && build.p.z > 0.1 && (
        <g>
          <line x1={build.p.x} y1={build.p.y - 12} x2={build.p.x} y2={build.p.y - 24}
            stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
          <rect x={build.p.x - 21} y={build.p.y - 43} width="42" height="18" rx="9"
            fill="#1c1208" stroke="#fbbf24" strokeWidth="1.5" />
          <text x={build.p.x} y={build.p.y - 30} textAnchor="middle"
            fontSize="10.5" fill="#fbbf24" fontFamily="Orbitron" fontWeight="700">0:15</text>
        </g>
      )}
    </>
  )
}
