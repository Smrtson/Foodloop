import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  variant = "primary",
  icon,
  trailingIcon,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button className={`button button-${variant} ${className}`} type={type} {...props}>
      {icon ? <span className="button-icon">{icon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? <span className="button-icon">{trailingIcon}</span> : null}
    </button>
  );
}
