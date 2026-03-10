import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#6366f1]/20 text-[#818cf8] border-[#6366f1]/30',
        secondary: 'border-[#1e1e35] bg-[#16162a] text-[#94a3b8]',
        destructive: 'border-transparent bg-[#ef4444]/20 text-[#fca5a5] border-[#ef4444]/30',
        success: 'border-transparent bg-[#10b981]/20 text-[#6ee7b7] border-[#10b981]/30',
        warning: 'border-transparent bg-[#f59e0b]/20 text-[#fcd34d] border-[#f59e0b]/30',
        outline: 'border-[#1e1e35] text-[#e2e8f0]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
