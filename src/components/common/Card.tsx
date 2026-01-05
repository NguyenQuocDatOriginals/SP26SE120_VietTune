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
    default: "backdrop-blur-xl bg-white/20 border border-white/40 shadow-2xl",
    bordered: "backdrop-blur-xl bg-white/20 border border-white/60 shadow-2xl",
    elevated: "backdrop-blur-xl bg-white/20 border border-white/40 shadow-2xl",
  };

  const boxShadowStyle = {
    boxShadow:
      "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
  };

  return (
    <div
      className={clsx("rounded-2xl p-6", variants[variant], className)}
      style={boxShadowStyle}
    >
      {children}
    </div>
  );
}
