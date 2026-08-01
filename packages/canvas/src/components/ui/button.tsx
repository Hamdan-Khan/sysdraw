import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md text-xs font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        solid: "",
        default: "",
        outline: "border",
        outlined: "border",
        ghost: "hover:bg-dim hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      color: {
        primary: "",
        secondary: "",
        destructive: "",
      },
      size: {
        default: "h-8 gap-1.5 px-3 text-xs",
        xs: "h-5 gap-1 rounded-sm px-2 text-[10px]",
        sm: "h-6 gap-1 px-2 text-xs",
        lg: "h-9 gap-2 px-4 text-xs font-semibold",
        icon: "size-8",
        "icon-xs": "size-5 rounded-sm",
        "icon-sm": "size-6",
        "icon-lg": "size-9",
      },
    },
    compoundVariants: [
      // primary solid (blue)
      {
        variant: ["solid", "default"],
        color: "primary",
        className:
          "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-transparent shadow-xs",
      },
      // primary outline (blue)
      {
        variant: ["outline", "outlined"],
        color: "primary",
        className:
          "border-blue-600/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 hover:border-blue-600 dark:hover:border-blue-400 active:bg-blue-500/20 shadow-xs",
      },
      // secondary solid (theme dim)
      {
        variant: ["solid", "default"],
        color: "secondary",
        className: "bg-dim text-primary hover:bg-dim/80 border-transparent",
      },
      // secondary outline (theme surface & border)
      {
        variant: ["outline", "outlined"],
        color: "secondary",
        className:
          "border-border bg-surface text-secondary hover:bg-dim hover:text-primary shadow-xs",
      },
      // destructive solid
      {
        variant: ["solid", "default"],
        color: "destructive",
        className:
          "bg-red-600 hover:bg-red-700 text-white border-transparent shadow-xs",
      },
      // destructive outline
      {
        variant: ["outline", "outlined"],
        color: "destructive",
        className:
          "border-red-500/40 bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-xs",
      },
    ],
    defaultVariants: {
      variant: "solid",
      color: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {}

function Button({
  className,
  variant = "solid",
  color = "primary",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, color, size, className }))}
      {...props}
    />
  );
}

// oxlint-disable-next-line react/only-export-components
export { Button, buttonVariants };
