import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface BrutalistSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export function BrutalistSelect({ value, onChange, options, className = '' }: BrutalistSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left border-4 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-950 p-3 text-zinc-950 dark:text-white font-bold flex justify-between items-center transition-all focus:outline-none focus:border-lime-600 dark:focus:border-lime-400"
      >
        <span>{selectedOption?.label}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-2 border-4 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] max-h-60 overflow-auto">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`p-3 font-bold cursor-pointer transition-colors ${
                opt.value === value 
                  ? 'bg-lime-400 text-zinc-950 border-l-4 border-zinc-950' 
                  : 'text-zinc-950 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
