"use client";

import { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function CustomSelect({
  id: externalId,
  name,
  value,
  onChange,
  options,
  placeholder = "Sélectionner...",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  disabled = false,
  "aria-label": ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();
  const id = externalId || generatedId;

  const selectedOption = options.find((opt) => opt.value === value) || null;

  // Fermer le menu lors d'un clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Synchroniser l'index survolé lors de l'ouverture
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value, options]);

  // Gestion du clavier
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < options.length) {
        onChange(options[highlightedIndex].value);
        setIsOpen(false);
      } else {
        setIsOpen((prev) => !prev);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev + 1) % options.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) =>
          prev <= 0 ? options.length - 1 : prev - 1
        );
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left select-none ${className}`}
    >
      {/* Hidden input for standard forms */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Button Trigger */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`w-full flex items-center justify-between gap-2.5 bg-surface-container-low hover:bg-surface-container border border-surface-container-high hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/40 rounded-xl px-3.5 py-2.5 text-xs text-white transition-all outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen ? "border-primary ring-1 ring-primary/40 shadow-[0_0_12px_rgba(78,222,163,0.15)]" : ""
        } ${buttonClassName}`}
      >
        <span className="flex items-center gap-2 truncate text-left">
          {selectedOption?.icon}
          <span className={selectedOption ? "text-white font-medium" : "text-on-surface-variant/50"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-on-surface-variant transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={
            highlightedIndex >= 0 ? `${id}-opt-${highlightedIndex}` : undefined
          }
          className={`absolute left-0 right-0 mt-1.5 z-50 max-h-60 overflow-y-auto bg-surface-container border border-surface-container-high rounded-xl p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.7)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 focus:outline-none ${menuClassName}`}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={option.value}
                id={`${id}-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                  isSelected
                    ? "bg-primary/15 text-primary font-bold shadow-[inset_0_0_8px_rgba(78,222,163,0.15)]"
                    : isHighlighted
                    ? "bg-surface-container-high text-white"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.icon}
                  <span className="truncate">{option.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0 drop-shadow-[0_0_6px_rgba(78,222,163,0.6)]" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
