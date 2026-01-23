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
    default: "shadow-lg backdrop-blur-sm",
    bordered: "border border-neutral-200/80 shadow-lg backdrop-blur-sm",
    elevated: "shadow-xl backdrop-blur-sm",
  };

  return (
    <div
      className={clsx("rounded-2xl p-6 transition-all duration-300 hover:shadow-xl", variants[variant], className)}
      style={{ backgroundColor: '#FFFCF5' }}
    >
      {children}
    </div>
  );
}
