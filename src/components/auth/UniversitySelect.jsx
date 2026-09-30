"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Building2, ChevronDown, Check, Search, Loader2, Sparkles, RefreshCw, AlertCircle, X } from 'lucide-react';
import { GUJARAT_UNIVERSITIES, getUniversityMappedCities, normalizeCityName } from '@/data/gujaratData';

export default function UniversitySelect({
  value = '',
  onChange,
  selectedCity = '',
  onClearCity,
  disabled = false,
  id = 'university-select-input',
  placeholder,
  required = true,
  className = '',
}) {
  const [universities, setUniversities] = useState(() => 
    GUJARAT_UNIVERSITIES.map((uni) => ({
      ...uni,
      mappedCities: uni.mappedCities || getUniversityMappedCities(uni.id),
    }))
  );
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize city input
  const normalizedCity = useMemo(() => {
    return (selectedCity || '').trim();
  }, [selectedCity]);

  // Fetch official universities from API on mount
  useEffect(() => {
    let isCancelled = false;
    async function fetchUnis() {
      try {
        setLoading(true);
        const res = await fetch('/api/universities');
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data?.universities && data.universities.length > 0) {
            setUniversities(data.universities);
          }
        }
      } catch (err) {
        console.warn('Fallback to static universities:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    fetchUnis();
    return () => {
      isCancelled = true;
    };
  }, []);

  // 1. Filter universities strictly by selected city (if a city is selected)
  const cityFilteredUnis = useMemo(() => {
    if (!normalizedCity) {
      return universities;
    }
    const targetCityLower = normalizedCity.toLowerCase();
    return universities.filter((uni) => {
      // 1. Direct city / district match
      if (uni.city && uni.city.toLowerCase() === targetCityLower) return true;
      if (uni.district && uni.district.toLowerCase() === targetCityLower) return true;

      // 2. Mapped cities match (including colleges)
      const mapped = uni.mappedCities || getUniversityMappedCities(uni.id);
      if (mapped && mapped.some((c) => c.toLowerCase() === targetCityLower)) return true;

      // 3. Nested colleges array match
      if (uni.colleges && Array.isArray(uni.colleges)) {
        if (
          uni.colleges.some(
            (col) =>
              (col.city && col.city.toLowerCase() === targetCityLower) ||
              (col.district && col.district.toLowerCase() === targetCityLower)
          )
        ) {
          return true;
        }
      }

      return false;
    });
  }, [universities, normalizedCity]);

  // RULE C: Automatically clear invalid university selection when city changes
  useEffect(() => {
    if (value && normalizedCity) {
      const isValid = cityFilteredUnis.some(
        (u) =>
          u.id.toLowerCase() === value.toLowerCase() ||
          u.code?.toLowerCase() === value.toLowerCase()
      );
      if (!isValid) {
        onChange('');
      }
    }
  }, [normalizedCity, cityFilteredUnis, value, onChange]);

  // 2. Filter displayed universities based on search query within the city-filtered list
  const searchLower = (searchQuery || '').trim().toLowerCase();
  const displayedUnis = useMemo(() => {
    return cityFilteredUnis.filter((uni) => {
      if (!searchLower) return true;
      const matchName = (uni.name || '').toLowerCase().includes(searchLower);
      const matchCode = (uni.code || '').toLowerCase().includes(searchLower);
      const matchCity = (uni.city || '').toLowerCase().includes(searchLower);
      const matchMapped = uni.mappedCities?.some((c) =>
        c.toLowerCase().includes(searchLower)
      );
      return matchName || matchCode || matchCity || matchMapped;
    });
  }, [cityFilteredUnis, searchLower]);

  // Selected university details across full dataset
  const selectedUni = useMemo(() => {
    if (!value) return null;
    return universities.find(
      (u) =>
        u.id.toLowerCase() === value.toLowerCase() ||
        u.code?.toLowerCase() === value.toLowerCase()
    );
  }, [universities, value]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (uniId) => {
    onChange(uniId);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) =>
          prev < displayedUnis.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : displayedUnis.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && displayedUnis[highlightedIndex]) {
        e.preventDefault();
        handleSelect(displayedUnis[highlightedIndex].id);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Compute dynamic placeholder
  const dynamicPlaceholder = placeholder || (
    normalizedCity
      ? `Select a university in ${normalizedCity}`
      : 'Search university...'
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Hidden input for HTML form validation */}
      <input
        type="text"
        id={id}
        name="universityId"
        value={value || ''}
        required={required}
        onChange={() => {}}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Main Select Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select College or University"
        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-left text-xs outline-none transition disabled:opacity-50 flex items-center justify-between cursor-pointer"
      >
        <Building2 className="w-3.5 h-3.5 text-amber-400 absolute left-3.5 pointer-events-none" />

        {selectedUni ? (
          <div className="flex items-center gap-2 truncate pr-2">
            <span className="font-semibold text-white truncate">
              {selectedUni.name}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold shrink-0">
              {selectedUni.code}
            </span>
          </div>
        ) : (
          <span className="text-slate-500 truncate">{dynamicPlaceholder}</span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </button>

      {/* Searchable Dropdown Popup */}
      {isOpen && !disabled && (
        <div
          role="listbox"
          aria-label="University Options"
          className="absolute z-50 left-0 right-0 mt-1.5 max-h-80 overflow-hidden rounded-xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col text-xs animate-fade-in"
        >
          {/* Search Header Input */}
          <div className="p-2 border-b border-slate-800 bg-slate-950/90">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  normalizedCity
                    ? `Search universities in ${normalizedCity}...`
                    : 'Type to filter university...'
                }
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Contextual City Badge Header */}
          {normalizedCity && (
            <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-amber-400 font-medium truncate">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">
                  Showing universities in <strong className="text-white">{normalizedCity}</strong>
                </span>
              </span>
              {onClearCity && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearCity();
                  }}
                  className="text-[10px] text-slate-400 hover:text-amber-300 underline underline-offset-2 shrink-0 ml-2 cursor-pointer transition"
                >
                  View all
                </button>
              )}
            </div>
          )}

          {/* List of Universities */}
          <div className="overflow-y-auto max-h-60 py-1 divide-y divide-slate-800/40">
            {loading ? (
              <div className="p-4 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Loading universities...</span>
              </div>
            ) : cityFilteredUnis.length === 0 ? (
              /* No matching university in the selected city */
              <div className="p-4 text-center space-y-2.5">
                <div className="text-slate-300 text-xs flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>No universities found for this city.</span>
                </div>
                {onClearCity && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearCity();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Clear city to view all universities</span>
                  </button>
                )}
              </div>
            ) : displayedUnis.length === 0 ? (
              /* Search query within the city-filtered list returned no results */
              <div className="p-4 text-center space-y-2">
                <div className="text-slate-400 text-xs">
                  No universities matching &quot;{searchQuery}&quot;{normalizedCity ? ` in ${normalizedCity}` : ''}.
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            ) : (
              displayedUnis.map((uni, idx) => {
                const isSelected = selectedUni?.id === uni.id;
                const isHighlighted = highlightedIndex === idx;

                return (
                  <button
                    key={uni.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(uni.id)}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition cursor-pointer ${
                      isHighlighted
                        ? 'bg-amber-500/20 text-amber-300'
                        : isSelected
                        ? 'bg-slate-800 text-amber-400 font-semibold'
                        : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-semibold truncate">{uni.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-400 font-mono text-[10px] font-bold shrink-0">
                          {uni.code}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span>{uni.city}</span>
                        {uni.state && <span>&bull; {uni.state}</span>}
                        {uni.type && <span>&bull; {uni.type}</span>}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

