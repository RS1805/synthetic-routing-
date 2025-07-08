import React, { useState, useEffect } from 'react';
import { Search, Calendar, Users, Plane, Plus, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Airport, TripType } from '../types/flight';
import { worldAirports } from '../data/airports';
import 'react-datepicker/dist/react-datepicker.css';

interface SearchFormProps {
  onSearch: (searchParams: any) => void;
  isLoading: boolean;
}

const cabinClasses = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First' },
];

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: '#1a1a1a',
    borderColor: state.isFocused ? '#ff5757' : '#374151',
    color: '#fff',
    minHeight: '42px',
    boxShadow: state.isFocused ? '0 0 0 1px #ff5757' : 'none',
    '&:hover': {
      borderColor: '#ff5757',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: '#1a1a1a',
    border: '1px solid #374151',
    zIndex: 9999,
    maxHeight: '300px',
  }),
  menuList: (provided: any) => ({
    ...provided,
    maxHeight: '300px',
    overflowY: 'auto',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#ff5757' : state.isFocused ? '#2d2d2d' : '#1a1a1a',
    color: '#fff',
    fontSize: '14px',
    padding: '8px 12px',
    '&:hover': {
      backgroundColor: '#ff5757',
    },
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#fff',
  }),
  input: (provided: any) => ({
    ...provided,
    color: '#fff',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#9ca3af',
  }),
  noOptionsMessage: (provided: any) => ({
    ...provided,
    color: '#9ca3af',
  }),
};

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [tripType, setTripType] = useState<'one-way' | 'round-trip' | 'multi-city'>('round-trip');
  const [origin, setOrigin] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState(cabinClasses[0]);
  const [multiCitySegments, setMultiCitySegments] = useState([
    { origin: null, destination: null, departureDate: null },
    { origin: null, destination: null, departureDate: null },
  ]);

  const handleSearch = () => {
    if (!origin || !destination || !departureDate) {
      alert('Please fill in all required fields');
      return;
    }

    const searchParams = {
      tripType,
      origin: origin.value,
      destination: destination.value,
      departureDate: departureDate.toISOString().split('T')[0],
      returnDate: returnDate?.toISOString().split('T')[0],
      passengers,
      cabinClass: cabinClass.value,
      multiCitySegments: tripType === 'multi-city' ? multiCitySegments : undefined,
    };

    onSearch(searchParams);
  };

  const addMultiCitySegment = () => {
    setMultiCitySegments([...multiCitySegments, { origin: null, destination: null, departureDate: null }]);
  };

  const removeMultiCitySegment = (index: number) => {
    if (multiCitySegments.length > 2) {
      setMultiCitySegments(multiCitySegments.filter((_, i) => i !== index));
    }
  };

  const updateMultiCitySegment = (index: number, field: string, value: any) => {
    const updated = [...multiCitySegments];
    updated[index] = { ...updated[index], [field]: value };
    setMultiCitySegments(updated);
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      {/* Trip Type Selection */}
      <div className="flex gap-4 mb-6">
        {['one-way', 'round-trip', 'multi-city'].map((type) => (
          <button
            key={type}
            onClick={() => setTripType(type as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              tripType === type
                ? 'bg-[#ff5757] text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {tripType === 'multi-city' ? (
        <div className="space-y-4">
          {multiCitySegments.map((segment, index) => (
            <div key={index} className="flex gap-4 items-center p-4 bg-gray-900/50 rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    From
                  </label>
                  <Select
                    value={segment.origin}
                    onChange={(value) => updateMultiCitySegment(index, 'origin', value)}
                    options={worldAirports}
                    placeholder="Select departure airport..."
                    styles={customSelectStyles}
                    className="text-sm"
                    isSearchable={true}
                    noOptionsMessage={() => "No airports found"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    To
                  </label>
                  <Select
                    value={segment.destination}
                    onChange={(value) => updateMultiCitySegment(index, 'destination', value)}
                    options={worldAirports}
                    placeholder="Select destination airport..."
                    styles={customSelectStyles}
                    className="text-sm"
                    isSearchable={true}
                    noOptionsMessage={() => "No airports found"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Departure
                  </label>
                  <DatePicker
                    selected={segment.departureDate}
                    onChange={(date) => updateMultiCitySegment(index, 'departureDate', date)}
                    minDate={new Date()}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#ff5757] focus:outline-none"
                    placeholderText="Select date"
                  />
                </div>
              </div>
              {index > 1 && (
                <button
                  onClick={() => removeMultiCitySegment(index)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addMultiCitySegment}
            className="flex items-center gap-2 text-[#ff5757] hover:text-[#ff5757]/80 transition-colors"
          >
            <Plus size={20} />
            Add another flight
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              From
            </label>
            <Select
              value={origin}
              onChange={setOrigin}
              options={worldAirports}
              placeholder="Select departure airport..."
              styles={customSelectStyles}
              className="text-sm"
              isSearchable={true}
              noOptionsMessage={() => "No airports found"}
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              To
            </label>
            <Select
              value={destination}
              onChange={setDestination}
              options={worldAirports}
              placeholder="Select destination airport..."
              styles={customSelectStyles}
              className="text-sm"
              isSearchable={true}
              noOptionsMessage={() => "No airports found"}
            />
          </div>

          {/* Departure Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Departure
            </label>
            <DatePicker
              selected={departureDate}
              onChange={(date) => setDepartureDate(date)}
              minDate={new Date()}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#ff5757] focus:outline-none"
              placeholderText="Select date"
            />
          </div>

          {/* Return Date */}
          {tripType === 'round-trip' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Return
              </label>
              <DatePicker
                selected={returnDate}
                onChange={(date) => setReturnDate(date)}
                minDate={departureDate || new Date()}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#ff5757] focus:outline-none"
                placeholderText="Select date"
              />
            </div>
          )}
        </div>
      )}

      {/* Passengers and Cabin Class */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Passengers
          </label>
          <div className="flex items-center gap-2">
            <Users className="text-gray-400" size={20} />
            <input
              type="number"
              min="1"
              max="9"
              value={passengers}
              onChange={(e) => setPassengers(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#ff5757] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cabin Class
          </label>
          <Select
            value={cabinClass}
            onChange={(value) => setCabinClass(value!)}
            options={cabinClasses}
            styles={customSelectStyles}
            isSearchable={false}
          />
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={isLoading || !origin || !destination || !departureDate}
        className="w-full bg-[#ff5757] hover:bg-[#ff5757]/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Searching...
          </>
        ) : (
          <>
            <Search size={20} />
            Search Flights
          </>
        )}
      </button>
    </div>
  );
};