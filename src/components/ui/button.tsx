import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium uppercase tracking-widest transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-primary/60 bg-transparent text-primary hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_14px_rgba(0,197,224,0.25)]",
        destructive:
          "border border-destructive/60 bg-transparent text-destructive hover:border-destructive hover:bg-destructive/10 hover:shadow-[0_0_14px_rgba(239,68,68,0.25)]",
        outline:
          "border border-border bg-transparent text-foreground hover:border-primary/60 hover:text-primary hover:shadow-[0_0_10px_rgba(0,197,224,0.15)]",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/60 hover:border-border/80",
        ghost:
          "bg-transparent text-foreground hover:bg-secondary hover:text-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        warning:
          "border border-warning/60 bg-transparent text-warning hover:border-warning hover:bg-warning/10 hover:shadow-[0_0_14px_rgba(245,155,11,0.25)]",
        success:
          "border border-accent/60 bg-transparent text-accent hover:border-accent hover:bg-accent/10 hover:shadow-[0_0_14px_rgba(24,168,99,0.25)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 px-3",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
