type LogoSize = 'sm' | 'md' | 'lg'

const sizes: Record<LogoSize, { mark: number; text: string; gap: string }> = {
  sm: { mark: 20, text: 'text-sm', gap: 'gap-1.5' },
  md: { mark: 24, text: 'text-base', gap: 'gap-2' },
  lg: { mark: 32, text: 'text-xl', gap: 'gap-2.5' },
}

export default function Logo({
  size = 'md',
  dark = false,
}: {
  size?: LogoSize
  dark?: boolean
}) {
  const { mark, text, gap } = sizes[size]
  return (
    <div className={`flex items-center ${gap}`}>
      <svg
        width={mark}
        height={mark}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#2563EB" />
        <path
          d="M8 8h4v6h8V8h4v16h-4v-6H12v6H8V8z"
          fill="white"
        />
      </svg>
      <span className={`font-bold tracking-tight ${text} ${dark ? 'text-white' : 'text-slate-900'}`}>
        HireFlow<span className={dark ? 'text-blue-400' : 'text-blue-600'}>AI</span>
      </span>
    </div>
  )
}
