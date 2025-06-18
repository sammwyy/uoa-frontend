import React from "react";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  description?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  marks?: { value: number; label: string }[];
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  size = "md",
  className = "",
  label,
  description,
  showValue = true,
  formatValue,
  marks,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const thumbSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const displayValue = formatValue ? formatValue(value) : value.toString();

  const SliderComponent = (
    <div className="relative">
      {/* Track */}
      <div
        className={`
        relative rounded-full transition-all duration-200
        ${sizeClasses[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      >
        {/* Background track */}
        <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700" />

        {/* Progress track */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb */}
        <div
          className={`
            absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 rounded-full 
            bg-white border-2 border-primary-500 shadow-lg transition-all duration-200
            ${thumbSizeClasses[size]}
            ${
              disabled
                ? "cursor-not-allowed"
                : "cursor-grab active:cursor-grabbing hover:scale-110 hover:shadow-xl"
            }
          `}
          style={{ left: `${percentage}%` }}
        />
      </div>

      {/* Hidden input for accessibility and functionality */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      {/* Marks */}
      {marks && (
        <div className="relative mt-2">
          {marks.map((mark) => {
            const markPercentage = ((mark.value - min) / (max - min)) * 100;
            return (
              <div
                key={mark.value}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${markPercentage}%` }}
              >
                <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full mb-1" />
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {mark.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (label || description || showValue) {
    return (
      <div className="space-y-2 pb-4">
        {(label || showValue || description) && (
          <div className="flex items-center justify-between gap-2">
            {label && (
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </label>
            )}
            {showValue && (
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-md">
                {displayValue}
              </span>
            )}

            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}

        {SliderComponent}
      </div>
    );
  }

  return SliderComponent;
};
