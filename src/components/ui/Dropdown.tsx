import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "./Button";

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ElementType;
  description?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = "Select option...",
  onSelect,
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <Button
        variant="secondary"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon && <selectedOption.icon className="w-4 h-4" />}
          <span
            className={
              selectedOption
                ? "text-gray-800 dark:text-gray-200"
                : "text-gray-500 dark:text-gray-400"
            }
          >
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-theme-bg-dropdown/95 backdrop-blur-md rounded-xl border border-gray-200/30 dark:border-gray-700/30 shadow-xl z-50 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 text-left transition-all duration-200 ${
                  value === option.value
                    ? "bg-theme-bg-selected text-primary-700 dark:text-primary-300"
                    : "hover:bg-theme-bg-surface-hover text-gray-800 dark:text-gray-200"
                }`}
              >
                {option.icon && <option.icon className="w-4 h-4" />}
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {option.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
