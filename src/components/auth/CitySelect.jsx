"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Check, Sparkles } from 'lucide-react';
import { GUJARAT_CITIES, normalizeCityName } from '@/data/gujaratData';

export default function CitySelect({
  value = '',
  onChange,
  disabled = false,
  id = 'city-select-input',
  placeholder = 'Start typing your city (e.g. Ahmedabad, Surat)...',
  required = true,
  className = '',
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [cityList, setCityList] = useState(GUJARAT_CITIES);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync internal state if external value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Filter cities based on user input
  const searchLower = (inputValue || '').trim().toLowerCase();
  const filteredCities = cityList.filter((city) =>
    city.toLowerCase().includes(searchLower)
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        // Normalize on blur/close if user typed a custom city
        if (inputValue && inputValue.trim()) {
          const normalized = normalizeCityName(inputValue);
          if (normalized !== value) {
            onChange(normalized);
          }
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [inputValue, value, onChange]);

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    onChange(newVal);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectCity = (city) => {
    const normalized = normalizeCityName(city);
    setInputValue(normalized);
    onChange(normalized);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredCities.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCities.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && filteredCities[highlightedIndex]) {
        e.preventDefault();
        handleSelectCity(filteredCities[highlightedIndex]);
      } else if (inputValue && inputValue.trim()) {
        const normalized = normalizeCityName(inputValue);
        setInputValue(normalized);
        onChange(normalized);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isExactMatch = cityList.some(
    (c) => c.toLowerCase() === (inputValue || '').trim().toLowerCase()
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative flex items-center">
        <MapPin className="w-3.5 h-3.5 text-amber-400 absolute left-3.5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-xs placeholder-slate-500 outline-none transition disabled:opacity-50"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-label="Toggle city list"
          className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-200 transition"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-400' : ''
            }`}
          />
        </button>
      </div>

      {/* Autocomplete Dropdown suggestions */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl divide-y divide-slate-800/80 text-xs animate-fade-in">
          {/* Header pill */}
          <div className="px-3 py-1.5 bg-slate-950/80 text-[10px] font-semibold text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Suggested Cities
            </span>
            <span className="text-[9px] text-slate-500">Type any city if not listed</span>
          </div>

          {/* Filtered list */}
          {filteredCities.length > 0 ? (
            <div className="py-1">
              {filteredCities.map((city, index) => {
                const isSelected =
                  (value || '').trim().toLowerCase() === city.toLowerCase();
                const isHighlighted = highlightedIndex === index;

                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-xs transition cursor-pointer ${
                      isHighlighted
                        ? 'bg-amber-500/20 text-amber-300 font-medium'
                        : isSelected
                        ? 'bg-slate-800/80 text-amber-400 font-semibold'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{city}</span>
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3 text-center space-y-1">
              <p className="text-[11px] text-slate-400">No matching preset city.</p>
            </div>
          )}

          {/* Custom entry button if input is not in the list */}
          {inputValue && inputValue.trim().length >= 2 && !isExactMatch && (
            <div className="p-1.5 bg-slate-950">
              <button
                type="button"
                onClick={() => handleSelectCity(inputValue)}
                className="w-full text-left px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Use custom city:</span>
                  <span className="font-bold text-white">
                    &quot;{normalizeCityName(inputValue)}&quot;
                  </span>
                </div>
                <Check className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
