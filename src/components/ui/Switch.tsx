import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  description?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = "md",
  className = "",
  label,
  description,
}) => {
  const sizeClasses = {
    sm: {
      track: "w-8 h-4",
      thumb: "w-3 h-3",
      translate: "translate-x-4",
    },
    md: {
      track: "w-11 h-6",
      thumb: "w-5 h-5",
      translate: "translate-x-5",
    },
    lg: {
      track: "w-14 h-7",
      thumb: "w-6 h-6",
      translate: "translate-x-7",
    },
  };

  const sizes = sizeClasses[size];

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const SwitchComponent = (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      className={`
        relative inline-flex items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2
        ${
          checked
            ? "bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg"
            : "bg-gray-200 dark:bg-gray-700"
        }
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:shadow-md"
        }
        ${sizes.track}
        ${className}
      `}
    >
      <span
        className={`
          inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out
          ${checked ? sizes.translate : "translate-x-0.5"}
          ${sizes.thumb}
        `}
      />
    </button>
  );

  if (label || description) {
    return (
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {label && (
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {SwitchComponent}
      </div>
    );
  }

  return SwitchComponent;
};
