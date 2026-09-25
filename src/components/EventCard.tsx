export function EventCard() {
  return (
    <div className="absolute top-[518px] left-10 right-10 z-10 py-3 px-4 rounded-xl bg-[rgba(60,10,10,0.28)] backdrop-blur-[8px] border border-[rgba(239,68,68,0.25)]">
      <div className="flex items-center gap-2 mb-[7px]">
        <div className="w-[6px] h-[6px] rounded-[3px] bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
        <span className="font-orbitron text-[8.5px] text-[#ef4444] tracking-[1.5px]">
          ACTIVE EVENT: DROUGHT
        </span>
      </div>
      <p className="font-inter text-[10.5px] text-[#9ca3af] leading-[1.5] mt-0 mx-0 mb-[10px]">
        Sector 4-B critical water shortage. Build an irrigation module to prevent crop failure.
      </p>
      <div className="flex justify-between items-center">
        <span className="font-orbitron text-[7px] text-[#f87171] tracking-[1px]">PRIORITY: HIGH</span>
        <div className="flex items-center gap-[5px]">
          <svg width="8" height="8" viewBox="0 0 10 10">
            <circle cx="5" cy="5" r="4" fill="none" stroke="#fbbf24" strokeWidth="1.2" />
            <line x1="5" y1="2" x2="5" y2="5" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="5" y1="5" x2="7" y2="7" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="font-orbitron text-[7px] text-[#fbbf24] tracking-[0.8px]">BUILD: 0:15</span>
        </div>
      </div>
    </div>
  )
}
