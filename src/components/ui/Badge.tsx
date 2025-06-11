import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  onClick,
}) => {
  const baseClasses =
    "inline-flex items-center font-medium rounded-full transition-all duration-200 backdrop-blur-md";

  const variantClasses = {
    default:
      "bg-theme-bg-surface/80 border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-200 hover:bg-theme-bg-surface-hover",
    primary:
      "bg-primary-100/90 dark:bg-primary-900/40 border border-primary-200/50 dark:border-primary-700/50 text-primary-700 dark:text-primary-300 hover:bg-primary-200/90 dark:hover:bg-primary-800/50",
    secondary:
      "bg-secondary-100/90 dark:bg-secondary-900/40 border border-secondary-200/50 dark:border-secondary-700/50 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200/90 dark:hover:bg-secondary-800/50",
    success:
      "bg-green-100/90 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-700/50 hover:bg-green-200/90 dark:hover:bg-green-800/50",
    warning:
      "bg-yellow-100/90 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200/50 dark:border-yellow-700/50 hover:bg-yellow-200/90 dark:hover:bg-yellow-800/50",
    danger:
      "bg-red-100/90 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200/50 dark:border-red-700/50 hover:bg-red-200/90 dark:hover:bg-red-800/50",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
  };

  const interactiveClasses = onClick
    ? "cursor-pointer hover:scale-105 hover:shadow-md"
    : "";

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
};
