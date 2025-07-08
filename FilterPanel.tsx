import React from 'react';
import { X, Filter, Clock, Plane, MapPin } from 'lucide-react';
import ReactSlider from 'react-slider';
import { SearchFilters } from '../types/flight';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

const airlineOptions = [
  { code: 'AA', name: 'American Airlines' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'DL', name: 'Delta Air Lines' },
  { code: 'AS', name: 'Alaska Airlines' },
  { code: 'B6', name: 'JetBlue' },
  { code: 'WN', name: 'Southwest' },
  { code: 'BA', name: 'British Airways' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'AF', name: 'Air France' },
  { code: 'KL', name: 'KLM' },
  { code: 'EK', name: 'Emirates' },
  { code: 'QR', name: 'Qatar Airways' },
  { code: 'SQ', name: 'Singapore Airlines' },
];

const cabinOptions = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  isOpen,
  onClose,
}) => {
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleArrayFilter = (key: keyof SearchFilters, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:relative lg:inset-auto lg:bg-transparent lg:backdrop-blur-none">
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-800 lg:relative lg:w-80 lg:max-w-none">
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="text-[#ff5757]" size={20} />
              <h2 className="text-xl font-bold text-white">Filters</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors lg:hidden"
            >
              <X size={24} />
            </button>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Price Range</h3>
            <div className="px-2">
              <ReactSlider
                value={filters.priceRange}
                onChange={(value) => updateFilter('priceRange', value)}
                min={0}
                max={5000}
                step={50}
                className="w-full h-6"
                thumbClassName="w-6 h-6 bg-[#ff5757] rounded-full cursor-pointer focus:outline-none"
                trackClassName="bg-gray-700 h-2 rounded-full"
                renderThumb={(props, state) => (
                  <div {...props} className="w-6 h-6 bg-[#ff5757] rounded-full cursor-pointer focus:outline-none shadow-lg" />
                )}
              />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Departure Time */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Departure Time</h3>
            <div className="px-2">
              <ReactSlider
                value={filters.departureTimeWindow}
                onChange={(value) => updateFilter('departureTimeWindow', value)}
                min={0}
                max={24}
                step={1}
                className="w-full h-6"
                thumbClassName="w-6 h-6 bg-[#ff5757] rounded-full cursor-pointer focus:outline-none"
                trackClassName="bg-gray-700 h-2 rounded-full"
                renderThumb={(props, state) => (
                  <div {...props} className="w-6 h-6 bg-[#ff5757] rounded-full cursor-pointer focus:outline-none shadow-lg" />
                )}
              />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>{filters.departureTimeWindow[0]}:00</span>
                <span>{filters.departureTimeWindow[1]}:00</span>
              </div>
            </div>
          </div>

          {/* Arrival Time */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Arrival Time</h3>
            <div className="px-2">
              <ReactSlider
                value={filters.arrivalTimeWindow}
                onChange={(value) => updateFilter('arrivalTimeWindow', value)}
                min={0}
                max={24}
                step={1}
                className="w-full h-6"
                thumbClassName="w-6 h-6 bg-[#ff5757] rounded-full cursor-pointer focus:outline-none"
                trackClassName="bg-gray-700 h-2 rounded-full"
                renderThumb={(props, state) => (
                  <div {...props} className="w-6 h-6 bg-[#ff5757] rounded-full cursor-pointer focus:outline-none shadow-lg" />
                )}
              />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>{filters.arrivalTimeWindow[0]}:00</span>
                <span>{filters.arrivalTimeWindow[1]}:00</span>
              </div>
            </div>
          </div>

          {/* Stops */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Stops</h3>
            <div className="space-y-2">
              {['nonstop', '1 stop', '2+ stops'].map((stop) => (
                <label key={stop} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.stops.includes(stop)}
                    onChange={() => toggleArrayFilter('stops', stop)}
                    className="w-4 h-4 text-[#ff5757] bg-gray-800 border-gray-600 rounded focus:ring-[#ff5757] focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">{stop}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Airlines */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Airlines</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {airlineOptions.map((airline) => (
                <label key={airline.code} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.airlines.includes(airline.code)}
                    onChange={() => toggleArrayFilter('airlines', airline.code)}
                    className="w-4 h-4 text-[#ff5757] bg-gray-800 border-gray-600 rounded focus:ring-[#ff5757] focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">{airline.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cabin Class */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Cabin Class</h3>
            <div className="space-y-2">
              {cabinOptions.map((cabin) => (
                <label key={cabin.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.cabinClass.includes(cabin.value)}
                    onChange={() => toggleArrayFilter('cabinClass', cabin.value)}
                    className="w-4 h-4 text-[#ff5757] bg-gray-800 border-gray-600 rounded focus:ring-[#ff5757] focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">{cabin.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration Range */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Duration Range</h3>
            <div className="px-2">
              <ReactSlider
                value={filters.durationRange}
                onChange={(value) => updateFilter('durationRange', value)}
                min={0}
                max={24}
                step={1}
                className="w-full h-6"
                thumbClassName="w-6 h-6 bg-[#ff5757] rounded-full cursor-pointer focus:outline-none"
                trackClassName="bg-gray-700 h-2 rounded-full"
                renderThumb={(props, state) => (
                  <div {...props} className="w-6 h-6 bg-[#ff5757] rounded-full cursor-pointer focus:outline-none shadow-lg" />
                )}
              />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>{filters.durationRange[0]}h</span>
                <span>{filters.durationRange[1]}h</span>
              </div>
            </div>
          </div>

          {/* Clear All Button */}
          <button
            onClick={() => onFiltersChange({
              priceRange: [0, 5000],
              departureTimeWindow: [0, 24],
              arrivalTimeWindow: [0, 24],
              stops: [],
              airlines: [],
              cabinClass: [],
              durationRange: [0, 24],
            })}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
};