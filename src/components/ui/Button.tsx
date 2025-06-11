import { LucideIcon } from "lucide-react";
import React from "react";

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  className?: string;
  onClick?: (e?: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  disabled = false,
  className = "",
  onClick,
  type = "button",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:ring-primary-500",
    secondary:
      "bg-theme-bg-surface/90 backdrop-blur-md border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-200 hover:bg-theme-bg-surface-hover shadow-sm hover:shadow-md focus:ring-primary-500",
    ghost:
      "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-theme-bg-surface-hover/50 focus:ring-primary-500",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:ring-red-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-3",
  };

  const iconSize = {
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {Icon && iconPosition === "left" && <Icon className={iconSize[size]} />}
      {children}
      {Icon && iconPosition === "right" && <Icon className={iconSize[size]} />}
    </button>
  );
};
