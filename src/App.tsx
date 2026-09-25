import { useState, useCallback, useRef, useEffect } from 'react'

// ─── Hex grid math ────────────────────────────────────────────────────────────

const SQ3   = Math.sqrt(3)
const HEX_R = 22
const PCX   = 195
const PCY   = 352
const PR    = 151

type TileType = 'ocean' | 'terrain' | 'empty' | 'farm' | 'hydro' | 'hab' | 'drought' | 'build'

const NAMED: Record<string, TileType> = {
  '0,-1': 'farm',  '1,-2': 'farm',  '-1,0': 'farm',
  '1,0':  'hydro',
  '0,1':  'hab',   '-1,1': 'hab',
  '2,-1': 'drought', '-1,2': 'build',
}

function tileKind(q: number, r: number): TileType {
  const k = `${q},${r}`
  if (NAMED[k]) return NAMED[k]
  if (q <= -2 || (q === -1 && r <= -2) || (q === 0 && r <= -3) || (q === 1 && r <= -4)) return 'ocean'
  if (q >= 3  || r >= 3 || (q === 2 && r >= 1)) return 'terrain'
  return 'empty'
}

function hexCenter(q: number, r: number) {
  return { x: PCX + HEX_R * 1.5 * q, y: PCY + HEX_R * SQ3 * (r + q * 0.5) }
}

function hexPoly(cx: number, cy: number, scale = 1, s = HEX_R - 2.2): string {
  const sz = s * scale
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i
    return `${(cx + sz * Math.cos(a)).toFixed(1)},${(cy + sz * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

interface Tile { q: number; r: number; t: TileType; x: number; y: number }

const GRID: Tile[] = (() => {
  const out: Tile[] = []
  for (let q = -8; q <= 8; q++) {
    for (let r = -8; r <= 8; r++) {
      const { x, y } = hexCenter(q, r)
      if (Math.hypot(x - PCX, y - PCY) < PR - 5) {
        out.push({ q, r, t: tileKind(q, r), x, y })
      }
    }
  }
  return out
})()

const TILE_COL: Record<TileType, [string, string]> = {
  ocean:   ['#0b2558', '#1e40af'],
  terrain: ['#431407', '#92400e'],
  empty:   ['#14532d', '#1a6b38'],
  farm:    ['#145a28', '#4ade80'],
  hydro:   ['#0b3a5a', '#22d3ee'],
  hab:     ['#3b1775', '#a78bfa'],
  drought: ['#7c2d12', '#ef4444'],
  build:   ['#1a1005', '#fbbf24'],
}

const TRACKS: [string, string][] = [
  ['0,-1', '1,-2'], ['0,-1', '-1,0'],
  ['1,0',  '0,1' ], ['0,1',  '-1,1'],
  ['-1,1', '-1,0'], ['-1,1', '-1,2'],
]

const STARS = Array.from({ length: 74 }, (_, i) => ({
  x: (i * 163.7 + 23) % 390,
  y: (i * 97.3  + 11) % 360,
  r: [0.3, 0.5, 0.4, 0.65, 0.3][i % 5],
  o: 0.2 + (i % 9) * 0.09,
}))

const WATER  = 0.62
const OXYGEN = 0.41

// ─── 3D rotation math ─────────────────────────────────────────────────────────

type Vec3 = [number, number, number]

function rotY([x, y, z]: Vec3, a: number): Vec3 {
  return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)]
}
function rotX([x, y, z]: Vec3, a: number): Vec3 {
  return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]
}

interface Projected { x: number; y: number; z: number }

function project(tile: Tile, rx: number, ry: number): Projected {
  const nx = (tile.x - PCX) / PR
  const ny = (tile.y - PCY) / PR
  const r2 = nx * nx + ny * ny
  const nz = r2 < 1 ? Math.sqrt(1 - r2) : 0
  const [px, py, pz] = rotX(rotY([nx, ny, nz], ry), rx)
  return { x: PCX + px * PR, y: PCY + py * PR, z: pz }
}

// ─── Structure icons (translate/scale wrapper) ────────────────────────────────

function FarmIcon({ x, y, scale = 1, opacity = 1 }: { x: number; y: number; scale?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${scale.toFixed(3)})`} opacity={opacity}>
      {([-5, 0, 5] as const).map(dx => (
        <g key={dx}>
          <line x1={dx} y1={7} x2={dx} y2={-3} stroke="#4ade80" strokeWidth="1.5" />
          <ellipse cx={dx} cy={-6} rx="2.6" ry="3.4" fill="#16a34a" />
          <line x1={dx - 2} y1={-1.5} x2={dx + 2} y2={-4} stroke="#86efac" strokeWidth="0.8" />
        </g>
      ))}
    </g>
  )
}

function HydroIcon({ x, y, scale = 1, opacity = 1 }: { x: number; y: number; scale?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${scale.toFixed(3)})`} opacity={opacity}>
      <rect x={-3} y={-10} width="6" height="18" rx="1.5" fill="#0891b2" opacity="0.9" />
      {([-6, -2, 2, 6] as const).map(dy => (
        <line key={dy} x1={-3} y1={dy} x2={-10} y2={dy - 1} stroke="#22d3ee" strokeWidth="1.2" />
      ))}
      <ellipse cx={0} cy={-11} rx="5" ry="2.5" fill="#06b6d4" opacity="0.8" />
      <line x1={0} y1={8} x2={0} y2={13} stroke="#22d3ee" strokeWidth="1.5" />
    </g>
  )
}

function HabIcon({ x, y, scale = 1, opacity = 1 }: { x: number; y: number; scale?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${scale.toFixed(3)})`} opacity={opacity}>
      <rect x={-8} y={-1} width="16" height="9" rx="1" fill="#5b21b6" stroke="#7c3aed" strokeWidth="0.8" />
      <path d="M-8,-1 Q-8,-12 0,-14 Q8,-12 8,-1" fill="#6d28d9" stroke="#a78bfa" strokeWidth="0.8" />
      <rect x={-2.5} y={1} width="5" height="7" rx="0.5" fill="#3b0764" />
      {([-4, 4] as const).map(dx => (
        <rect key={dx} x={dx - 1.5} y={0} width="3" height="3" rx="0.5" fill="#c4b5fd" opacity="0.7" />
      ))}
    </g>
  )
}

function ScaffoldIcon({ x, y, scale = 1, opacity = 1 }: { x: number; y: number; scale?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${scale.toFixed(3)})`} opacity={opacity}>
      <line x1={-7} y1={7}  x2={-7} y2={-8} stroke="#fbbf24" strokeWidth="1.5" />
      <line x1={7}  y1={7}  x2={7}  y2={-8} stroke="#fbbf24" strokeWidth="1.5" />
      <line x1={-7} y1={2}  x2={7}  y2={2}  stroke="#fbbf24" strokeWidth="1.2" />
      <line x1={-7} y1={-4} x2={7}  y2={-4} stroke="#d97706" strokeWidth="1"   />
      <line x1={-4} y1={7}  x2={4}  y2={-8} stroke="#d97706" strokeWidth="0.9" opacity="0.45" />
    </g>
  )
}

// ─── Fan meter ────────────────────────────────────────────────────────────────

function FanMeter({ side, fill, color, glow }: { side: 'left' | 'right'; fill: number; color: string; glow: string }) {
  const N   = 10
  const px  = side === 'left' ? 0 : 390
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

// ─── Planet scene (rotation-aware rendering) ──────────────────────────────────

function PlanetScene({ rx, ry }: { rx: number; ry: number }) {
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

// ─── Rival radar ──────────────────────────────────────────────────────────────

function RivalRadar() {
  return (
    <div style={{
      position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(4,9,26,0.92)', backdropFilter: 'blur(10px)',
      border: '1px solid rgba(239,68,68,0.28)',
      borderRadius: 14, padding: '10px 16px', width: 224, zIndex: 20,
    }}>
      <svg width="48" height="48" style={{ flexShrink: 0 }}>
        <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(239,68,68,0.22)" strokeWidth="1" />
        <circle cx="24" cy="24" r="14" fill="none" stroke="rgba(239,68,68,0.18)" strokeWidth="1" />
        <circle cx="24" cy="24" r="7"  fill="none" stroke="rgba(239,68,68,0.18)" strokeWidth="1" />
        <line x1="24" y1="3"  x2="24" y2="45" stroke="rgba(239,68,68,0.15)" strokeWidth="0.8" />
        <line x1="3"  y1="24" x2="45" y2="24" stroke="rgba(239,68,68,0.15)" strokeWidth="0.8" />
        <line x1="24" y1="24" x2="41" y2="11" stroke="rgba(239,68,68,0.5)"  strokeWidth="1.5" />
        <circle cx="34" cy="14" r="3.5" fill="#ef4444" opacity="0.9" />
        <circle cx="34" cy="14" r="7"   fill="#ef4444" opacity="0.15" />
      </svg>
      <div>
        <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#ef4444', letterSpacing: 1.5, marginBottom: 3 }}>
          RIVAL DETECTED
        </div>
        <div style={{ fontFamily: 'Orbitron', fontSize: 6.5, color: '#4b5563', letterSpacing: 0.5, marginBottom: 7 }}>
          DARK SIDE · SECTOR 7
        </div>
        <div style={{ height: 4, width: 122, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ width: '23%', height: '100%', background: 'linear-gradient(90deg,#b91c1c,#ef4444)', borderRadius: 2 }} />
        </div>
        <div style={{ fontFamily: 'Orbitron', fontSize: 7, color: '#4b5563' }}>
          TERRA <span style={{ color: '#f87171' }}>23%</span>
        </div>
      </div>
    </div>
  )
}

// ─── Action dock ──────────────────────────────────────────────────────────────

const ACTIONS = [
  { id: 'irrigate', label: 'IRRIGATE', col: '#3b82f6', glow: '#1d4ed8' },
  { id: 'habitat',  label: 'HABITAT',  col: '#8b5cf6', glow: '#5b21b6' },
  { id: 'farm',     label: 'FARM',     col: '#22c55e', glow: '#15803d' },
  { id: 'defend',   label: 'DEFEND',   col: '#f97316', glow: '#c2410c' },
]

function DockIcon({ id, color }: { id: string; color: string }) {
  if (id === 'irrigate') return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M12 3C12 3 5 10 5 14.5a7 7 0 0014 0C19 10 12 3 12 3z" fill={color} opacity="0.9" />
      <path d="M9 15a3 3 0 003 2.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
  if (id === 'habitat') return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L3 10v11h6v-5h6v5h6V10L12 3z" fill={color} opacity="0.9" />
      <rect x="9.5" y="15" width="5" height="6" fill="rgba(0,0,0,0.22)" />
    </svg>
  )
  if (id === 'farm') return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M12 21V12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12C12 12 7 9 7 5c3.5 0 4.5 2.5 5 4 .5-1.5 1.5-4 5-4 0 4-5 7-5 7z"
        fill={color} opacity="0.9" />
    </svg>
  )
  if (id === 'defend') return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 6v6c0 5.5 3.5 10.5 8 12 4.5-1.5 8-6.5 8-12V6L12 2z"
        fill={color} opacity="0.85" />
      <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  )
  return null
}

function ActionDock({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  return (
    <div style={{
      position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)',
      width: 342, background: 'rgba(3,9,26,0.95)', backdropFilter: 'blur(14px)',
      border: '1px solid rgba(60,100,200,0.2)', borderRadius: 44,
      padding: '12px 12px',
      display: 'flex', justifyContent: 'space-around', zIndex: 30,
    }}>
      {ACTIONS.map((a, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          style={{
            width: 70, height: 70, borderRadius: 35,
            background: active === i ? a.col : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${active === i ? a.col : 'rgba(255,255,255,0.09)'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
            boxShadow: active === i ? `0 0 24px ${a.glow}bb, 0 0 56px ${a.glow}44` : 'none',
            transition: 'all 0.18s ease',
          }}
        >
          <DockIcon id={a.id} color={active === i ? '#fff' : a.col} />
          <span style={{
            fontFamily: 'Orbitron', fontSize: 6.5, letterSpacing: 0.8,
            color: active === i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.32)',
          }}>
            {a.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive]       = useState(0)
  const [rot,    setRot]          = useState({ x: 0, y: 0 })
  const [isDragging, setDragging] = useState(false)
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 })

  // Global mouse handlers (fire even when cursor leaves phone frame mid-drag)
  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return
      const dx = e.clientX - dragRef.current.lastX
      const dy = e.clientY - dragRef.current.lastY
      dragRef.current.lastX = e.clientX
      dragRef.current.lastY = e.clientY
      setRot(prev => ({
        x: Math.max(-1.3, Math.min(1.3, prev.x - dy * 0.008)),
        y: prev.y + dx * 0.008,
      }))
    }
    const onUp = () => {
      dragRef.current.active = false
      setDragging(false)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging])

  const handlePlanetMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY }
    setDragging(true)
    e.preventDefault()
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    dragRef.current = { active: true, lastX: t.clientX, lastY: t.clientY }
    setDragging(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current.active) return
    const t = e.touches[0]
    const dx = t.clientX - dragRef.current.lastX
    const dy = t.clientY - dragRef.current.lastY
    dragRef.current.lastX = t.clientX
    dragRef.current.lastY = t.clientY
    setRot(prev => ({
      x: Math.max(-1.3, Math.min(1.3, prev.x - dy * 0.008)),
      y: prev.y + dx * 0.008,
    }))
    e.preventDefault()
  }, [])

  const handleTouchEnd = useCallback(() => {
    dragRef.current.active = false
    setDragging(false)
  }, [])

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 25% 15%, #080d22 0%, #000 70%)' }}
    >
      {/* ── Phone frame ── */}
      <div style={{
        position: 'relative', width: 390, height: 844, flexShrink: 0,
        background: '#020a1e', borderRadius: 44, overflow: 'hidden',
        border: '1.5px solid rgba(60,90,200,0.16)',
        boxShadow: '0 50px 140px rgba(0,0,50,0.98), 0 0 80px rgba(20,50,160,0.1), inset 0 0 0 0.5px rgba(255,255,255,0.035)',
      }}>

        {/* Notch */}
        <div style={{
          position: 'absolute', top: 13, left: '50%', transform: 'translateX(-50%)',
          width: 110, height: 5, background: '#000', borderRadius: 3, zIndex: 100,
        }} />

        {/* ── Full-screen SVG: stars + planet + fan meters ── */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          width={390} height={844}
        >
          {/* Stars */}
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />
          ))}

          {/* Planet */}
          <PlanetScene rx={rot.x} ry={rot.y} />

          {/* Fan meters */}
          <defs>
            <linearGradient id="wGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <linearGradient id="oGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#67e8f9" />
            </linearGradient>
          </defs>

          <FanMeter side="left"  fill={WATER}  color="#60a5fa" glow="#3b82f6" />
          <FanMeter side="right" fill={OXYGEN} color="#67e8f9" glow="#06b6d4" />

          {/* Fan meter resource labels */}
          <text x="10" y="727" fill="#3b82f6" fontSize="7" fontFamily="Orbitron" letterSpacing="0.8" opacity="0.65">H₂O</text>
          <text x="10" y="737" fill="#60a5fa" fontSize="8" fontFamily="Orbitron" fontWeight="600" opacity="0.8">62%</text>

          <text x="380" y="727" fill="#06b6d4" fontSize="7" fontFamily="Orbitron" letterSpacing="0.8" opacity="0.65" textAnchor="end">O₂</text>
          <text x="380" y="737" fill="#67e8f9" fontSize="8" fontFamily="Orbitron" fontWeight="600" opacity="0.8" textAnchor="end">41%</text>
        </svg>

        {/* ── Planet drag capture layer ── */}
        <div
          style={{
            position: 'absolute',
            left: PCX - PR - 8, top: PCY - PR - 8,
            width: (PR + 8) * 2,  height: (PR + 8) * 2,
            borderRadius: '50%',
            cursor: isDragging ? 'grabbing' : 'grab',
            zIndex: 5,
            touchAction: 'none',
          }}
          onMouseDown={handlePlanetMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* ── Rival radar ── */}
        <RivalRadar />

        {/* ── Resource bar ── */}
        <div style={{
          position: 'absolute', top: 112, left: 40, right: 40, zIndex: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Orbitron', fontSize: 8.5, color: '#fbbf24' }}>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <polygon points="5,0 9,3.5 7.5,9 2.5,9 1,3.5" fill="#fbbf24" />
            </svg>
            1,842 <span style={{ color: '#374151', fontSize: 7 }}>MIN</span>
          </div>
          <div style={{ fontFamily: 'Orbitron', fontSize: 7.5, color: '#2d3748', letterSpacing: 2 }}>
            TURN 7/20
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Orbitron', fontSize: 8.5, color: '#67e8f9' }}>
            <span style={{ color: '#374151', fontSize: 7 }}>PWR</span>
            619
            <svg width="10" height="10" viewBox="0 0 10 10">
              <polygon points="6,0 2,5 5,5 4,10 8,5 5,5" fill="#67e8f9" />
            </svg>
          </div>
        </div>

        {/* ── Event alert card ── */}
        <div style={{
          position: 'absolute', top: 518, left: 40, right: 40, zIndex: 10,
          background: 'rgba(60,10,10,0.28)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12,
          padding: '12px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
            <span style={{ fontFamily: 'Orbitron', fontSize: 8.5, color: '#ef4444', letterSpacing: 1.5 }}>
              ACTIVE EVENT: DROUGHT
            </span>
          </div>
          <p style={{ fontFamily: 'Inter', fontSize: 10.5, color: '#9ca3af', lineHeight: 1.5, margin: '0 0 10px' }}>
            Sector 4-B critical water shortage. Build an irrigation module to prevent crop failure.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Orbitron', fontSize: 7, color: '#f87171', letterSpacing: 1 }}>PRIORITY: HIGH</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="8" height="8" viewBox="0 0 10 10">
                <circle cx="5" cy="5" r="4" fill="none" stroke="#fbbf24" strokeWidth="1.2" />
                <line x1="5" y1="2" x2="5" y2="5" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="5" y1="5" x2="7" y2="7" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: 'Orbitron', fontSize: 7, color: '#fbbf24', letterSpacing: 0.8 }}>BUILD: 0:15</span>
            </div>
          </div>
        </div>

        {/* ── Drag hint (fades after first drag) ── */}
        {!isDragging && rot.x === 0 && rot.y === 0 && (
          <div style={{
            position: 'absolute', top: PCY + PR + 10, left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'Orbitron', fontSize: 7, color: 'rgba(100,150,255,0.35)',
            letterSpacing: 1.5, whiteSpace: 'nowrap', zIndex: 6, pointerEvents: 'none',
          }}>
            DRAG TO ROTATE
          </div>
        )}

        {/* ── Sector strip ── */}
        <div style={{
          position: 'absolute', bottom: 114, left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'Orbitron', fontSize: 7, color: '#1f2a40', letterSpacing: 2.5,
          whiteSpace: 'nowrap', zIndex: 10,
        }}>
          DROUGHT SEASON · SECTOR 4-B
        </div>

        {/* ── Action dock ── */}
        <ActionDock active={active} onSelect={setActive} />
      </div>
    </div>
  )
}
