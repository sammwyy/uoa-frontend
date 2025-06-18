import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import React from "react";

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
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={className}>
      <DropdownMenu.Root>
        {/* Trigger Button */}
        <DropdownMenu.Trigger asChild disabled={disabled}>
          <button
            disabled={disabled}
            className="transition-all duration-200 bg-theme-bg-surface/90 backdrop-blur-md border border-white/30 dark:border-gray-600/30 text-gray-800 dark:text-gray-200 focus:ring-primary-500 inline-flex items-center justify-between w-full px-4 py-2 text-sm font-medium bg-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary-500 hover:bg-theme-bg-surface-hover shadow-sm hover:shadow-md data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-gray-700"
          >
            <div className="flex items-center gap-2 min-w-0">
              {selectedOption?.icon && (
                <selectedOption.icon className="w-4 h-4 flex-shrink-0" />
              )}
              <span
                className={`truncate ${
                  selectedOption
                    ? "text-gray-800 dark:text-gray-200"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {selectedOption?.label || placeholder}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />
          </button>
        </DropdownMenu.Trigger>

        {/* Dropdown Content */}
        <DropdownMenu.Portal container={document.body}>
          <DropdownMenu.Content
            className="z-[10000] min-w-[8rem] overflow-hidden rounded-xl bg-theme-bg-dropdown/95 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            sideOffset={8}
            align="start"
            style={{ maxHeight: "256px" }}
          >
            <div className="max-h-64 overflow-y-auto">
              {options.length === 0 ? (
                <div className="p-3 text-gray-500 dark:text-gray-400 text-sm">
                  No options available
                </div>
              ) : (
                options.map((option) => {
                  const isSelected = value === option.value;

                  return (
                    <DropdownMenu.Item
                      key={option.value}
                      onSelect={() => onSelect(option.value)}
                      className={`flex items-center gap-3 p-3 text-left transition-all duration-200 cursor-pointer outline-none hover:bg-theme-bg-surface-hover focus:bg-theme-bg-surface-hover data-[highlighted]:bg-theme-bg-surface-hover ${
                        isSelected
                          ? "bg-theme-bg-selected text-primary-700 dark:text-primary-300"
                          : "text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {option.icon && (
                        <option.icon className="w-4 h-4 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </DropdownMenu.Item>
                  );
                })
              )}
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};
