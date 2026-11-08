import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-gosi-vivid-green text-gosi-rich-blue",
        secondary: "border border-gosi-rich-blue-25 bg-white text-gosi-rich-blue",
        blue: "bg-gosi-rich-blue text-white",
        ghost: "text-gosi-rich-blue",
      },
      size: {
        phone: "h-[52px] px-6 text-base",
        md: "h-11 px-4 text-sm",
        sm: "h-9 px-3 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "phone" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
