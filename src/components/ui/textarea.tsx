import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-[#1e1e35] bg-[#11111c] px-3 py-2 text-sm text-[#e2e8f0] placeholder:text-[#4a4a6a] transition-all duration-150 resize-none',
          'focus-visible:outline-none focus-visible:border-[#6366f1] focus-visible:ring-2 focus-visible:ring-[#6366f1]/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
