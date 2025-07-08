import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  Filter, 
  Star, 
  Clock, 
  DollarSign, 
  Plane,
  BarChart3,
  Grid,
  List
} from 'lucide-react';
import { FlightOffer, SearchFilters, SortOption } from '../types/flight';
import { FlightCard } from './FlightCard';
import { FilterPanel } from './FilterPanel';
import { ComparisonModal } from './ComparisonModal';

interface FlightResultsProps {
  flights: FlightOffer[];
  isLoading: boolean;
  onSelectFlight: (flight: FlightOffer) => void;
}

const sortOptions: SortOption[] = [
  { key: 'recommended', label: 'Recommended', direction: 'desc' },
  { key: 'price', label: 'Price (Low to High)', direction: 'asc' },
  { key: 'priceHigh', label: 'Price (High to Low)', direction: 'desc' },
  { key: 'duration', label: 'Duration (Shortest)', direction: 'asc' },
  { key: 'departure', label: 'Departure Time', direction: 'asc' },
  { key: 'arrival', label: 'Arrival Time', direction: 'asc' },
  { key: 'stops', label: 'Fewest Stops', direction: 'asc' },
];

export const FlightResults: React.FC<FlightResultsProps> = ({ 
  flights, 
  isLoading, 
  onSelectFlight 
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 5000],
    departureTimeWindow: [0, 24],
    arrivalTimeWindow: [0, 24],
    stops: [],
    airlines: [],
    cabinClass: [],
    durationRange: [0, 24],
  });
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [likedFlights, setLikedFlights] = useState<Set<string>>(new Set());
  const [selectedFlights, setSelectedFlights] = useState<FlightOffer[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredAndSortedFlights = useMemo(() => {
    let filtered = flights.filter(flight => {
      const price = parseFloat(flight.price.total);
      const segments = flight.itineraries[0].segments;
      const departureTime = new Date(segments[0].departure.at).getHours();
      const arrivalTime = new Date(segments[segments.length - 1].arrival.at).getHours();
      const duration = flight.itineraries[0].duration;
      const durationMatch = duration.match(/PT(\d+)H(\d+)M/);
      const totalHours = durationMatch ? parseInt(durationMatch[1]) + parseInt(durationMatch[2]) / 60 : 0;
      const stops = segments.length - 1;
      const stopsText = stops === 0 ? 'nonstop' : stops === 1 ? '1 stop' : '2+ stops';
      const airline = flight.validatingAirlineCodes[0];
      const cabin = flight.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'ECONOMY';

      return (
        price >= filters.priceRange[0] &&
        price <= filters.priceRange[1] &&
        departureTime >= filters.departureTimeWindow[0] &&
        departureTime <= filters.departureTimeWindow[1] &&
        arrivalTime >= filters.arrivalTimeWindow[0] &&
        arrivalTime <= filters.arrivalTimeWindow[1] &&
        totalHours >= filters.durationRange[0] &&
        totalHours <= filters.durationRange[1] &&
        (filters.stops.length === 0 || filters.stops.includes(stopsText)) &&
        (filters.airlines.length === 0 || filters.airlines.includes(airline)) &&
        (filters.cabinClass.length === 0 || filters.cabinClass.includes(cabin))
      );
    });

    // Sort flights
    filtered.sort((a, b) => {
      switch (sortBy.key) {
        case 'price':
        case 'priceHigh':
          const priceA = parseFloat(a.price.total);
          const priceB = parseFloat(b.price.total);
          return sortBy.direction === 'asc' ? priceA - priceB : priceB - priceA;
        
        case 'duration':
          const durationA = a.itineraries[0].duration;
          const durationB = b.itineraries[0].duration;
          const matchA = durationA.match(/PT(\d+)H(\d+)M/);
          const matchB = durationB.match(/PT(\d+)H(\d+)M/);
          const totalA = matchA ? parseInt(matchA[1]) * 60 + parseInt(matchA[2]) : 0;
          const totalB = matchB ? parseInt(matchB[1]) * 60 + parseInt(matchB[2]) : 0;
          return sortBy.direction === 'asc' ? totalA - totalB : totalB - totalA;
        
        case 'departure':
          const depA = new Date(a.itineraries[0].segments[0].departure.at).getTime();
          const depB = new Date(b.itineraries[0].segments[0].departure.at).getTime();
          return sortBy.direction === 'asc' ? depA - depB : depB - depA;
        
        case 'arrival':
          const arrA = new Date(a.itineraries[0].segments[a.itineraries[0].segments.length - 1].arrival.at).getTime();
          const arrB = new Date(b.itineraries[0].segments[b.itineraries[0].segments.length - 1].arrival.at).getTime();
          return sortBy.direction === 'asc' ? arrA - arrB : arrB - arrA;
        
        case 'stops':
          const stopsA = a.itineraries[0].segments.length - 1;
          const stopsB = b.itineraries[0].segments.length - 1;
          return sortBy.direction === 'asc' ? stopsA - stopsB : stopsB - stopsA;
        
        case 'recommended':
        default:
          const valueA = a.estimatedValue || 0;
          const valueB = b.estimatedValue || 0;
          return sortBy.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
    });

    return filtered;
  }, [flights, filters, sortBy]);

  const handleLikeFlight = (flight: FlightOffer) => {
    const newLikedFlights = new Set(likedFlights);
    if (newLikedFlights.has(flight.id)) {
      newLikedFlights.delete(flight.id);
    } else {
      newLikedFlights.add(flight.id);
    }
    setLikedFlights(newLikedFlights);
  };

  const handleSelectForComparison = (flight: FlightOffer) => {
    if (selectedFlights.find(f => f.id === flight.id)) {
      setSelectedFlights(selectedFlights.filter(f => f.id !== flight.id));
    } else if (selectedFlights.length < 3) {
      setSelectedFlights([...selectedFlights, flight]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff5757] mx-auto mb-4"></div>
          <p className="text-gray-400">Searching for the best flights...</p>
        </div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-20">
        <Plane className="mx-auto mb-4 text-gray-600" size={48} />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No flights found</h3>
        <p className="text-gray-400">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Results Section */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">
              {filteredAndSortedFlights.length} flights found
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-[#ff5757] text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-[#ff5757] text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy.key}
                onChange={(e) => setSortBy(sortOptions.find(opt => opt.key === e.target.value)!)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-[#ff5757] focus:outline-none appearance-none pr-8"
              >
                {sortOptions.map(option => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Filter size={16} />
              Filters
            </button>

            {/* Comparison Button */}
            {selectedFlights.length > 0 && (
              <button
                onClick={() => setShowComparison(true)}
                className="flex items-center gap-2 bg-[#ff5757] hover:bg-[#ff5757]/90 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <BarChart3 size={16} />
                Compare ({selectedFlights.length})
              </button>
            )}
          </div>
        </div>

        {/* Results Grid/List */}
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          {filteredAndSortedFlights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onSelect={onSelectFlight}
              onLike={handleLikeFlight}
              isLiked={likedFlights.has(flight.id)}
            />
          ))}
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />

      {/* Comparison Modal */}
      {showComparison && (
        <ComparisonModal
          flights={selectedFlights}
          onClose={() => setShowComparison(false)}
          onSelectFlight={onSelectFlight}
        />
      )}
    </div>
  );
};