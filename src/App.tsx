import { useState } from 'react'
import { PCX, PCY, PR, SCREEN_H, SCREEN_W } from './game/planet'
import { usePlanetDrag } from './hooks/usePlanetDrag'
import { PlanetScene } from './components/PlanetScene'
import { FanMeter, FanMeterLabel } from './components/FanMeter'
import { RivalRadar } from './components/RivalRadar'
import { ResourceBar } from './components/ResourceBar'
import { EventCard } from './components/EventCard'
import { ActionDock } from './components/ActionDock'

const STARS = Array.from({ length: 74 }, (_, i) => ({
  x: (i * 163.7 + 23) % SCREEN_W,
  y: (i * 97.3  + 11) % 360,
  r: [0.3, 0.5, 0.4, 0.65, 0.3][i % 5],
  o: 0.2 + (i % 9) * 0.09,
}))

const WATER  = 0.62
const OXYGEN = 0.41

export default function App() {
  const [active, setActive] = useState(0)
  const { rot, isDragging, handlers } = usePlanetDrag()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_25%_15%,#080d22_0%,#000_70%)]">
      {/* ── Phone frame ── */}
      <div className="relative w-[390px] h-[844px] shrink-0 overflow-hidden rounded-[44px] bg-[#020a1e] border-[1.5px] border-[rgba(60,90,200,0.16)] shadow-[0_50px_140px_rgba(0,0,50,0.98),0_0_80px_rgba(20,50,160,0.1),inset_0_0_0_0.5px_rgba(255,255,255,0.035)]">

        {/* Notch */}
        <div className="absolute top-[13px] left-1/2 -translate-x-1/2 z-[100] w-[110px] h-[5px] bg-black rounded-[3px]" />

        {/* ── Full-screen SVG: stars + planet + fan meters ── */}
        <svg className="absolute top-0 left-0 pointer-events-none" width={SCREEN_W} height={SCREEN_H}>
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />
          ))}

          <PlanetScene rx={rot.x} ry={rot.y} />

          <FanMeter side="left"  fill={WATER}  color="#60a5fa" glow="#3b82f6" />
          <FanMeter side="right" fill={OXYGEN} color="#67e8f9" glow="#06b6d4" />
          <FanMeterLabel side="left"  label="H₂O" value="62%" labelColor="#3b82f6" valueColor="#60a5fa" />
          <FanMeterLabel side="right" label="O₂"  value="41%" labelColor="#06b6d4" valueColor="#67e8f9" />
        </svg>

        {/* ── Planet drag capture layer ── */}
        <div
          className={`absolute z-[5] rounded-full touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            left: PCX - PR - 8, top: PCY - PR - 8,
            width: (PR + 8) * 2, height: (PR + 8) * 2,
          }}
          {...handlers}
        />

        <RivalRadar />
        <ResourceBar />
        <EventCard />

        {/* ── Drag hint (hidden once the planet has been rotated) ── */}
        {!isDragging && rot.x === 0 && rot.y === 0 && (
          <div
            className="absolute left-1/2 -translate-x-1/2 z-[6] pointer-events-none whitespace-nowrap font-orbitron text-[7px] text-[rgba(100,150,255,0.35)] tracking-[1.5px]"
            style={{ top: PCY + PR + 10 }}
          >
            DRAG TO ROTATE
          </div>
        )}

        {/* ── Sector strip ── */}
        <div className="absolute bottom-[114px] left-1/2 -translate-x-1/2 z-10 whitespace-nowrap font-orbitron text-[7px] text-[#1f2a40] tracking-[2.5px]">
          DROUGHT SEASON · SECTOR 4-B
        </div>

        <ActionDock active={active} onSelect={setActive} />
      </div>
    </div>
  )
}
