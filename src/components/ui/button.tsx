import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#6366f1] text-white hover:bg-[#5254cc] shadow-lg shadow-indigo-900/30',
        destructive: 'bg-[#ef4444] text-white hover:bg-[#dc2626]',
        outline: 'border border-[#1e1e35] bg-transparent hover:bg-[#16162a] hover:border-[#6366f1]/40 text-[#e2e8f0]',
        secondary: 'bg-[#16162a] text-[#e2e8f0] hover:bg-[#1e1e35] border border-[#1e1e35]',
        ghost: 'hover:bg-[#16162a] text-[#94a3b8] hover:text-[#e2e8f0]',
        link: 'text-[#6366f1] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-base font-semibold',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
