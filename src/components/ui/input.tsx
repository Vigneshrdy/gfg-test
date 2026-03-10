import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-[#1e1e35] bg-[#11111c] px-3 py-2 text-sm text-[#e2e8f0] placeholder:text-[#4a4a6a] ring-offset-[#08080f] transition-all duration-150',
          'focus-visible:outline-none focus-visible:border-[#6366f1] focus-visible:ring-2 focus-visible:ring-[#6366f1]/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'hover:border-[#2e2e4d]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
