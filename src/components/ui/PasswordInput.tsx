import { Eye, EyeOff, Lock } from "lucide-react";
import React, { useState } from "react";
import { Input } from "./Input";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  variant?: "default" | "ghost" | "filled";
  size?: "sm" | "md" | "lg";
  error?: boolean;
  success?: boolean;
  label?: string;
  helperText?: string;
  className?: string;
  showToggle?: boolean;
  showIcon?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  variant = "default",
  size = "md",
  error = false,
  success = false,
  label,
  helperText,
  className = "",
  showToggle = true,
  showIcon = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        variant={variant}
        size={size}
        error={error}
        success={success}
        label={label}
        helperText={helperText}
        icon={showIcon ? Lock : undefined}
        iconPosition="left"
        className={`${showToggle ? "pr-12" : ""} ${className}`}
        autoComplete="current-password"
        {...props}
      />
      {showToggle && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className={`
            absolute top-1/2 right-3 transform -translate-y-1/2 
            p-1.5 rounded-lg
            text-gray-500 dark:text-gray-400 
            hover:text-gray-700 dark:hover:text-gray-200
            hover:bg-gray-100/50 dark:hover:bg-gray-700/50
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500/20
            ${label ? "top-[60%]" : "top-1/2"}
          `}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
};
