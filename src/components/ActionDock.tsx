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

export function ActionDock({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  return (
    <div className="absolute bottom-[22px] left-1/2 -translate-x-1/2 z-30 w-[342px] p-3 flex justify-around rounded-[44px] bg-[rgba(3,9,26,0.95)] backdrop-blur-[14px] border border-[rgba(60,100,200,0.2)]">
      {ACTIONS.map((a, i) => {
        const on = active === i
        return (
          <button
            key={a.id}
            onClick={() => onSelect(i)}
            className="w-[70px] h-[70px] rounded-[35px] border-[1.5px] flex flex-col items-center justify-center gap-[3px] transition-all duration-[180ms] ease-[ease]"
            style={{
              background:  on ? a.col : 'rgba(255,255,255,0.04)',
              borderColor: on ? a.col : 'rgba(255,255,255,0.09)',
              boxShadow:   on ? `0 0 24px ${a.glow}bb, 0 0 56px ${a.glow}44` : 'none',
            }}
          >
            <DockIcon id={a.id} color={on ? '#fff' : a.col} />
            <span className={`font-orbitron text-[6.5px] tracking-[0.8px] ${on ? 'text-[rgba(255,255,255,0.9)]' : 'text-[rgba(255,255,255,0.32)]'}`}>
              {a.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
