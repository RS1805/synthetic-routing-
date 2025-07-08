import React, { useState } from 'react';
import { Plane, Search, Heart, BarChart3 } from 'lucide-react';
import { SearchForm } from './components/SearchForm';
import { FlightResults } from './components/FlightResults';
import { FlightOffer } from './types/flight';
import { ValueCalculator } from './services/valueCalculator';
import { ComparisonModal } from './components/ComparisonModal';

// Mock flight data for demonstration
const generateMockFlights = (searchParams: any): FlightOffer[] => {
  const mockFlights: FlightOffer[] = [
    {
      id: 'mock-1',
      source: 'GDS',
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: false,
      lastTicketingDate: '2024-12-31',
      itineraries: [{
        duration: 'PT6H30M',
        segments: [{
          departure: {
            iataCode: searchParams.origin,
            at: '2024-12-15T08:00:00'
          },
          arrival: {
            iataCode: searchParams.destination,
            at: '2024-12-15T14:30:00'
          },
          carrierCode: 'AA',
          number: '1234',
          aircraft: { code: '737' },
          duration: 'PT6H30M',
          numberOfStops: 0
        }]
      }],
      price: {
        currency: 'USD',
        total: '450.00',
        base: '400.00',
        fees: [{ amount: '50.00', type: 'SUPPLIER' }]
      },
      pricingOptions: {
        fareType: ['PUBLISHED'],
        includedCheckedBagsOnly: false
      },
      validatingAirlineCodes: ['AA'],
      travelerPricings: [{
        travelerId: '1',
        fareOption: 'STANDARD',
        travelerType: 'ADULT',
        price: {
          currency: 'USD',
          total: '450.00',
          base: '400.00'
        },
        fareDetailsBySegment: [{
          segmentId: '1',
          cabin: 'ECONOMY',
          fareBasis: 'Y',
          class: 'Y',
          includedCheckedBags: { quantity: 1 }
        }]
      }]
    },
    {
      id: 'mock-2',
      source: 'GDS',
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: false,
      lastTicketingDate: '2024-12-31',
      itineraries: [{
        duration: 'PT8H15M',
        segments: [
          {
            departure: {
              iataCode: searchParams.origin,
              at: '2024-12-15T10:00:00'
            },
            arrival: {
              iataCode: 'DEN',
              at: '2024-12-15T12:00:00'
            },
            carrierCode: 'UA',
            number: '5678',
            aircraft: { code: 'A320' },
            duration: 'PT2H00M',
            numberOfStops: 0
          },
          {
            departure: {
              iataCode: 'DEN',
              at: '2024-12-15T14:30:00'
            },
            arrival: {
              iataCode: searchParams.destination,
              at: '2024-12-15T18:15:00'
            },
            carrierCode: 'UA',
            number: '9012',
            aircraft: { code: 'A320' },
            duration: 'PT3H45M',
            numberOfStops: 0
          }
        ]
      }],
      price: {
        currency: 'USD',
        total: '380.00',
        base: '340.00',
        fees: [{ amount: '40.00', type: 'SUPPLIER' }]
      },
      pricingOptions: {
        fareType: ['PUBLISHED'],
        includedCheckedBagsOnly: false
      },
      validatingAirlineCodes: ['UA'],
      travelerPricings: [{
        travelerId: '1',
        fareOption: 'STANDARD',
        travelerType: 'ADULT',
        price: {
          currency: 'USD',
          total: '380.00',
          base: '340.00'
        },
        fareDetailsBySegment: [{
          segmentId: '1',
          cabin: 'ECONOMY',
          fareBasis: 'T',
          class: 'T',
          includedCheckedBags: { quantity: 1 }
        }]
      }]
    },
    {
      id: 'mock-3-synthetic',
      source: 'SYNTHETIC',
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: false,
      lastTicketingDate: '2024-12-31',
      isSynthetic: true,
      itineraries: [{
        duration: 'PT12H45M',
        segments: [
          {
            departure: {
              iataCode: searchParams.origin,
              at: '2024-12-15T09:00:00'
            },
            arrival: {
              iataCode: 'DXB',
              at: '2024-12-15T18:00:00'
            },
            carrierCode: 'EK',
            number: '201',
            aircraft: { code: 'A380' },
            duration: 'PT9H00M',
            numberOfStops: 0
          },
          {
            departure: {
              iataCode: 'DXB',
              at: '2024-12-15T20:30:00'
            },
            arrival: {
              iataCode: searchParams.destination,
              at: '2024-12-16T01:45:00'
            },
            carrierCode: 'EK',
            number: '415',
            aircraft: { code: '777' },
            duration: 'PT5H15M',
            numberOfStops: 0
          }
        ]
      }],
      price: {
        currency: 'USD',
        total: '320.00',
        base: '280.00',
        fees: [{ amount: '40.00', type: 'SUPPLIER' }]
      },
      pricingOptions: {
        fareType: ['PUBLISHED'],
        includedCheckedBagsOnly: false
      },
      validatingAirlineCodes: ['EK'],
      travelerPricings: [{
        travelerId: '1',
        fareOption: 'STANDARD',
        travelerType: 'ADULT',
        price: {
          currency: 'USD',
          total: '320.00',
          base: '280.00'
        },
        fareDetailsBySegment: [{
          segmentId: '1',
          cabin: 'ECONOMY',
          fareBasis: 'V',
          class: 'V',
          includedCheckedBags: { quantity: 2 }
        }]
      }]
    },
    {
      id: 'mock-4-business',
      source: 'GDS',
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: false,
      lastTicketingDate: '2024-12-31',
      itineraries: [{
        duration: 'PT6H30M',
        segments: [{
          departure: {
            iataCode: searchParams.origin,
            at: '2024-12-15T16:00:00'
          },
          arrival: {
            iataCode: searchParams.destination,
            at: '2024-12-15T22:30:00'
          },
          carrierCode: 'DL',
          number: '2468',
          aircraft: { code: 'A350' },
          duration: 'PT6H30M',
          numberOfStops: 0
        }]
      }],
      price: {
        currency: 'USD',
        total: '1250.00',
        base: '1200.00',
        fees: [{ amount: '50.00', type: 'SUPPLIER' }]
      },
      pricingOptions: {
        fareType: ['PUBLISHED'],
        includedCheckedBagsOnly: false
      },
      validatingAirlineCodes: ['DL'],
      travelerPricings: [{
        travelerId: '1',
        fareOption: 'STANDARD',
        travelerType: 'ADULT',
        price: {
          currency: 'USD',
          total: '1250.00',
          base: '1200.00'
        },
        fareDetailsBySegment: [{
          segmentId: '1',
          cabin: 'BUSINESS',
          fareBasis: 'J',
          class: 'J',
          includedCheckedBags: { quantity: 2 }
        }]
      }]
    }
  ];

  // Calculate value for each flight
  return mockFlights.map(flight => {
    const valueCalculation = ValueCalculator.calculateValue(flight);
    return {
      ...flight,
      estimatedValue: valueCalculation.estimatedValue,
    };
  });
};

function App() {
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showValueCalculator, setShowValueCalculator] = useState(false);

  const handleSearch = async (searchParams: any) => {
    setIsLoading(true);
    setSearchPerformed(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock flights with value calculations
      const mockFlights = generateMockFlights(searchParams);
      setFlights(mockFlights);
    } catch (error) {
      console.error('Error searching flights:', error);
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFlight = (flight: FlightOffer) => {
    console.log('Selected flight:', flight);
    alert(`Flight selected! ${ValueCalculator.getAirlineName(flight.validatingAirlineCodes[0])} - $${flight.price.total}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ff5757] rounded-full flex items-center justify-center">
                <Plane className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">SyntheticRoutes</h1>
                <p className="text-sm text-gray-400">Smart flight search with value analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Heart size={20} />
                <span className="hidden sm:inline">Saved Flights</span>
              </button>
              <button
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowValueCalculator(true)}
              >
                <BarChart3 size={20} />
                <span className="hidden sm:inline">Value Calculator</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        {!searchPerformed && (
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Find Your Perfect Flight
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Discover hidden deals and synthetic routes with advanced value analysis. 
              Get the best value for your miles and money.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Search size={16} />
                <span>Smart Search</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 size={16} />
                <span>Value Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Plane size={16} />
                <span>Synthetic Routes</span>
              </div>
            </div>
          </div>
        )}

        {/* Search Form */}
        <div className="mb-8">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Results */}
        {searchPerformed && (
          <FlightResults
            flights={flights}
            isLoading={isLoading}
            onSelectFlight={handleSelectFlight}
          />
        )}

        {/* Features Section */}
        {!searchPerformed && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-[#ff5757] rounded-lg flex items-center justify-center mb-4">
                <Search className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Search</h3>
              <p className="text-gray-400">
                Our advanced algorithms find flights that others miss, including complex multi-city routes
                and hidden city ticketing opportunities.
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-[#ff5757] rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Value Analysis</h3>
              <p className="text-gray-400">
                Get detailed insights into the true value of each flight option, including points redemption
                value and cash equivalent calculations.
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-[#ff5757] rounded-lg flex items-center justify-center mb-4">
                <Plane className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Synthetic Routes</h3>
              <p className="text-gray-400">
                Discover creative routing options that combine multiple airlines and stopovers
                to maximize your travel value.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black/40 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 SyntheticRoutes. Advanced flight value analysis.</p>
          </div>
        </div>
      </footer>

      {/* Value Calculator Modal */}
      {showValueCalculator && (
        <ComparisonModal
          flights={flights}
          onClose={() => setShowValueCalculator(false)}
          onSelectFlight={handleSelectFlight}
        />
      )}
    </div>
  );
}

export default App;