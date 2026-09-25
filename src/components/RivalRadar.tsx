export function RivalRadar() {
  return (
    <div className="absolute top-[28px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 w-[224px] py-[10px] px-4 rounded-[14px] bg-[rgba(4,9,26,0.92)] backdrop-blur-[10px] border border-[rgba(239,68,68,0.28)]">
      <svg width="48" height="48" className="shrink-0">
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
        <div className="font-orbitron text-[9px] text-[#ef4444] tracking-[1.5px] mb-[3px]">
          RIVAL DETECTED
        </div>
        <div className="font-orbitron text-[6.5px] text-[#4b5563] tracking-[0.5px] mb-[7px]">
          DARK SIDE · SECTOR 7
        </div>
        <div className="h-1 w-[122px] bg-[rgba(255,255,255,0.06)] rounded-[2px] overflow-hidden mb-1">
          <div className="w-[23%] h-full bg-[linear-gradient(90deg,#b91c1c,#ef4444)] rounded-[2px]" />
        </div>
        <div className="font-orbitron text-[7px] text-[#4b5563]">
          TERRA <span className="text-[#f87171]">23%</span>
        </div>
      </div>
    </div>
  )
}
