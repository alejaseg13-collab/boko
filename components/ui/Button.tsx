import { ButtonHTMLAttributes } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-boko-dark text-boko-white hover:bg-boko-footer",
  secondary: "bg-boko-cream text-boko-dark hover:bg-boko-border",
  outline: "border border-boko-dark text-boko-dark hover:bg-boko-dark hover:text-boko-white",
  ghost: "text-boko-dark hover:bg-boko-cream",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  href,
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base = `inline-flex items-center justify-center font-medium transition-colors duration-200 rounded-sm cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button className={base} {...props}>
      {children}
    </button>
  );
}
