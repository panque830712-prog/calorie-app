interface Props {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  sublabel?: string
}

export function ProgressRing({
  value, max, size = 120, strokeWidth = 10,
  color = '#4caf7d', label, sublabel,
}: Props) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)
  const dash = pct * circ

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0ebe2" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="text-[#2d2d2d] font-bold leading-none" style={{ fontSize: size > 100 ? 22 : 16 }}>{label}</span>}
        {sublabel && <span className="text-[#8a8a8a] text-xs mt-0.5">{sublabel}</span>}
      </div>
    </div>
  )
}
