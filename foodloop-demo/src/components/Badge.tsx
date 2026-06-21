import type { ReactNode } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", children, icon, className = "" }: BadgeProps) {
  return (
    <span className={`badge badge-${tone} ${className}`}>
      {icon ? <span className="badge-icon">{icon}</span> : null}
      {children}
    </span>
  );
}
