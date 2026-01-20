import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "bordered" | "elevated";
}

export default function Card({
  children,
  className,
  variant = "default",
}: CardProps) {
  const variants = {
    default: "shadow-md",
    bordered: "border border-neutral-200 shadow-md",
    elevated: "shadow-lg",
  };

  return (
    <div
      className={clsx("rounded-2xl p-6", variants[variant], className)}
      style={{ backgroundColor: '#FFFCF5' }}
    >
      {children}
    </div>
  );
}
