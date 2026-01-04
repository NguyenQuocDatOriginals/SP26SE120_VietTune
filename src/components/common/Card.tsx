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
    default: "bg-white",
    bordered: "bg-white border border-secondary-200",
    elevated: "bg-white shadow-lg",
  };

  return (
    <div className={clsx("rounded-lg p-6", variants[variant], className)}>
      {children}
    </div>
  );
}
