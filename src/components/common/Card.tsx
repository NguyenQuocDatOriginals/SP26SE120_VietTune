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
    default: "bg-white border border-gray-100 shadow-lg",
    bordered: "bg-white border border-gray-200 shadow-md",
    elevated: "bg-white border border-gray-100 shadow-xl",
  };

  return (
    <div
      className={clsx("rounded-2xl p-6", variants[variant], className)}
    >
      {children}
    </div>
  );
}
