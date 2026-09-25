// ─── Screen + planet geometry ─────────────────────────────────────────────────

export const SCREEN_W = 390
export const SCREEN_H = 844

const SQ3    = Math.sqrt(3)
const HEX_R  = 22
export const PCX = 195
export const PCY = 352
export const PR  = 151

// ─── Hex grid ─────────────────────────────────────────────────────────────────

export type TileType = 'ocean' | 'terrain' | 'empty' | 'farm' | 'hydro' | 'hab' | 'drought' | 'build'

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

export function hexPoly(cx: number, cy: number, scale = 1, s = HEX_R - 2.2): string {
  const sz = s * scale
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i
    return `${(cx + sz * Math.cos(a)).toFixed(1)},${(cy + sz * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

export interface Tile { q: number; r: number; t: TileType; x: number; y: number }

export const GRID: Tile[] = (() => {
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

export const TILE_COL: Record<TileType, [string, string]> = {
  ocean:   ['#0b2558', '#1e40af'],
  terrain: ['#431407', '#92400e'],
  empty:   ['#14532d', '#1a6b38'],
  farm:    ['#145a28', '#4ade80'],
  hydro:   ['#0b3a5a', '#22d3ee'],
  hab:     ['#3b1775', '#a78bfa'],
  drought: ['#7c2d12', '#ef4444'],
  build:   ['#1a1005', '#fbbf24'],
}

export const TRACKS: [string, string][] = [
  ['0,-1', '1,-2'], ['0,-1', '-1,0'],
  ['1,0',  '0,1' ], ['0,1',  '-1,1'],
  ['-1,1', '-1,0'], ['-1,1', '-1,2'],
]

// ─── 3D rotation math ─────────────────────────────────────────────────────────

type Vec3 = [number, number, number]

function rotY([x, y, z]: Vec3, a: number): Vec3 {
  return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)]
}
function rotX([x, y, z]: Vec3, a: number): Vec3 {
  return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]
}

export interface Projected { x: number; y: number; z: number }

export function project(tile: Tile, rx: number, ry: number): Projected {
  const nx = (tile.x - PCX) / PR
  const ny = (tile.y - PCY) / PR
  const r2 = nx * nx + ny * ny
  const nz = r2 < 1 ? Math.sqrt(1 - r2) : 0
  const [px, py, pz] = rotX(rotY([nx, ny, nz], ry), rx)
  return { x: PCX + px * PR, y: PCY + py * PR, z: pz }
}
