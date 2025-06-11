import React from "react";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "glass" | "solid";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  className = "",
  onClick,
}) => {
  const baseClasses = "rounded-xl transition-all duration-200";

  const variantClasses = {
    default: `
      bg-theme-bg-card/90 
      backdrop-blur-md 
      border border-white/30 dark:border-gray-600/30 
      shadow-lg
      hover:bg-theme-bg-card-hover/90
      hover:shadow-xl
    `,
    glass: `
      bg-theme-bg-card/70 
      backdrop-blur-md 
      border border-white/20 dark:border-gray-600/20 
      shadow-glass dark:shadow-glass-dark
      hover:bg-theme-bg-card/90
    `,
    solid: `
      bg-theme-bg-card 
      border border-gray-200 dark:border-gray-600 
      shadow-lg
      hover:shadow-xl
    `,
  };

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const interactiveClasses = onClick ? "cursor-pointer hover:scale-[1.02]" : "";

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
