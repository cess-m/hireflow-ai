'use client'

import { useId } from 'react'

export default function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const rawId = useId()
  const id = `sr${rawId.replace(/:/g, '')}`
  const clamped = Math.min(Math.max(score, 0), 100)
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)

  const [colorFrom, colorTo, glowColor, textColor] =
    clamped >= 70
      ? ['#93c5fd', '#2563eb', 'rgba(37,99,235,0.35)', '#2563eb']
      : clamped >= 50
      ? ['#fcd34d', '#d97706', 'rgba(217,119,6,0.35)', '#d97706']
      : ['#fda4af', '#e11d48', 'rgba(225,29,72,0.35)', '#e11d48']

  return (
    <div className="flex flex-col items-center gap-2" style={{ width: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorFrom} />
            <stop offset="100%" stopColor={colorTo} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx="50" cy="50" r={radius} stroke="#e2e8f0" strokeWidth="5" fill="none" />
        {/* Progress */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={`url(#${id})`}
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.8s ease',
            filter: `drop-shadow(0 0 6px ${glowColor})`,
          }}
        />
        {/* Score number */}
        <text
          x="50"
          y="46"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="26"
          fontWeight="700"
          fill={textColor}
          fontFamily="inherit"
          style={{ transform: 'rotate(90deg)', transformOrigin: '50px 50px' }}
        >
          {clamped}
        </text>
        <text
          x="50"
          y="62"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="#94a3b8"
          fontFamily="inherit"
          style={{ transform: 'rotate(90deg)', transformOrigin: '50px 50px' }}
        >
          / 100
        </text>
      </svg>
      <span className="text-xs font-medium text-slate-400 tracking-widest uppercase">Match Score</span>
    </div>
  )
}
