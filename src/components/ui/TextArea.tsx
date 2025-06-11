import React, { useEffect, useRef } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "ghost";
  autoResize?: boolean;
  error?: boolean;
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  variant = "default",
  autoResize = false,
  error = false,
  className = "",
  value,
  onChange,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 10 * 24; // 10 lines * 24px line height
      textareaRef.current.style.height = `${Math.min(
        scrollHeight,
        maxHeight
      )}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value, autoResize]);

  const baseClasses =
    "w-full rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none";

  const variantClasses = {
    default: `
      bg-theme-bg-input/80 
      backdrop-blur-md 
      border border-gray-200/30 dark:border-gray-700/30 
      text-gray-800 dark:text-gray-200 
      placeholder-gray-500 dark:placeholder-gray-400
      hover:bg-theme-bg-input-hover/80
      focus:bg-theme-bg-input
      focus:border-primary-300 dark:focus:border-primary-600
      focus:ring-primary-500/20
    `,
    ghost: `
      bg-transparent 
      border-none 
      text-gray-800 dark:text-gray-200 
      placeholder-gray-500 dark:placeholder-gray-400
      focus:ring-primary-500/20
    `,
  };

  const errorClasses = error
    ? "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20"
    : "";

  return (
    <textarea
      ref={textareaRef}
      className={`${baseClasses} ${variantClasses[variant]} ${errorClasses} ${className}`}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        adjustHeight();
      }}
      {...props}
    />
  );
};
