import React from "react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: "default" | "ghost" | "filled";
  size?: "sm" | "md" | "lg";
  error?: boolean;
  success?: boolean;
  icon?: React.ElementType;
  iconPosition?: "left" | "right";
  label?: string;
  helperText?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  variant = "default",
  size = "md",
  error = false,
  success = false,
  icon: Icon,
  iconPosition = "left",
  label,
  helperText,
  className = "",
  ...props
}) => {
  const baseClasses =
    "w-full rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 border";

  const variantClasses = {
    default: `
      bg-theme-bg-input/90 
      backdrop-blur-md 
      border-gray-200/40 dark:border-gray-700/40 
      text-gray-800 dark:text-gray-200 
      placeholder-gray-500 dark:placeholder-gray-400
      hover:bg-theme-bg-input-hover/90
      hover:border-gray-300/50 dark:hover:border-gray-600/50
      focus:bg-theme-bg-input
      focus:border-primary-400 dark:focus:border-primary-500
      focus:ring-primary-500/20
      shadow-sm hover:shadow-md focus:shadow-lg
    `,
    ghost: `
      bg-transparent 
      border-transparent
      text-gray-800 dark:text-gray-200 
      placeholder-gray-500 dark:placeholder-gray-400
      hover:bg-theme-bg-surface/30
      focus:bg-theme-bg-surface/50
      focus:border-primary-300 dark:focus:border-primary-600
      focus:ring-primary-500/20
    `,
    filled: `
      bg-gray-100 dark:bg-gray-800
      border-transparent
      text-gray-800 dark:text-gray-200 
      placeholder-gray-500 dark:placeholder-gray-400
      hover:bg-gray-200 dark:hover:bg-gray-700
      focus:bg-white dark:focus:bg-gray-800
      focus:border-primary-400 dark:focus:border-primary-500
      focus:ring-primary-500/20
      shadow-sm hover:shadow-md focus:shadow-lg
    `,
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-sm",
    lg: "px-5 py-4 text-base",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const stateClasses = error
    ? "border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-900/10"
    : success
    ? "border-green-400 dark:border-green-500 focus:border-green-500 focus:ring-green-500/20 bg-green-50/50 dark:bg-green-900/10"
    : "";

  const iconPadding = Icon ? (iconPosition === "left" ? "pl-11" : "pr-11") : "";

  const InputComponent = (
    <div className="relative">
      {Icon && (
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 ${
            iconPosition === "left" ? "left-3" : "right-3"
          } pointer-events-none`}
        >
          <Icon
            className={`${iconSizeClasses[size]} text-gray-400 dark:text-gray-500`}
          />
        </div>
      )}
      <input
        className={`
          ${baseClasses} 
          ${variantClasses[variant]} 
          ${sizeClasses[size]} 
          ${stateClasses}
          ${iconPadding}
          ${className}
        `}
        {...props}
      />
    </div>
  );

  if (label || helperText) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        {InputComponent}
        {helperText && (
          <p
            className={`text-sm ${
              error
                ? "text-red-600 dark:text-red-400"
                : success
                ? "text-green-600 dark:text-green-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }

  return InputComponent;
};
