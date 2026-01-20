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
    default: "bg-white shadow-md",
    bordered: "bg-white border border-neutral-200 shadow-sm",
    elevated: "bg-white shadow-lg",
  };

  return (
    <div
      className={clsx("rounded-2xl p-6", variants[variant], className)}
    >
      {children}
    </div>
  );
}
