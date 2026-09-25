export function ResourceBar() {
  return (
    <div className="absolute top-[112px] left-10 right-10 z-10 flex justify-between items-center">
      <div className="flex items-center gap-[5px] font-orbitron text-[8.5px] text-[#fbbf24]">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <polygon points="5,0 9,3.5 7.5,9 2.5,9 1,3.5" fill="#fbbf24" />
        </svg>
        1,842 <span className="text-[#374151] text-[7px]">MIN</span>
      </div>
      <div className="font-orbitron text-[7.5px] text-[#2d3748] tracking-[2px]">
        TURN 7/20
      </div>
      <div className="flex items-center gap-[5px] font-orbitron text-[8.5px] text-[#67e8f9]">
        <span className="text-[#374151] text-[7px]">PWR</span>
        619
        <svg width="10" height="10" viewBox="0 0 10 10">
          <polygon points="6,0 2,5 5,5 4,10 8,5 5,5" fill="#67e8f9" />
        </svg>
      </div>
    </div>
  )
}
