import React from 'react';
import { X, Star, Clock, MapPin, Plane, TrendingUp, Award } from 'lucide-react';
import { format } from 'date-fns';
import { FlightOffer } from '../types/flight';
import { ValueCalculator } from '../services/valueCalculator';

interface ComparisonModalProps {
  flights: FlightOffer[];
  onClose: () => void;
  onSelectFlight: (flight: FlightOffer) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  flights,
  onClose,
  onSelectFlight,
}) => {
  const formatTime = (dateTime: string) => {
    return format(new Date(dateTime), 'HH:mm');
  };

  const formatDate = (dateTime: string) => {
    return format(new Date(dateTime), 'MMM dd');
  };

  const parseDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    const hours = match?.[1] ? parseInt(match[1]) : 0;
    const minutes = match?.[2] ? parseInt(match[2]) : 0;
    
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const getStopsText = (segments: any[]) => {
    const stops = segments.length - 1;
    if (stops === 0) return 'Nonstop';
    return `${stops} stop${stops > 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Flight Comparison</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flights.map((flight) => {
              const segments = flight.itineraries[0].segments;
              const firstSegment = segments[0];
              const lastSegment = segments[segments.length - 1];
              const valueCalculation = ValueCalculator.calculateValue(flight);

              return (
                <div key={flight.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  {/* Airline Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#ff5757] rounded-full flex items-center justify-center">
                      <Plane className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">
                        {ValueCalculator.getAirlineName(flight.validatingAirlineCodes[0])}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {flight.validatingAirlineCodes.join(', ')}
                      </p>
                    </div>
                    {valueCalculation.recommendation === 'excellent' && (
                      <Award className="text-green-400" size={20} />
                    )}
                  </div>

                  {/* Flight Times */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-white">
                          {formatTime(firstSegment.departure.at)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {firstSegment.departure.iataCode}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400">
                          {parseDuration(flight.itineraries[0].duration)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getStopsText(segments)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {formatTime(lastSegment.arrival.at)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {lastSegment.arrival.iataCode}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-white">
                      ${flight.price.total}
                    </div>
                    <div className="text-sm text-gray-400">
                      {flight.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'Economy'}
                    </div>
                  </div>

                  {/* Enhanced Value Score */}
                  <div className={`p-3 rounded-lg mb-4 ${ValueCalculator.getRecommendationBg(valueCalculation.recommendation)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className={ValueCalculator.getRecommendationColor(valueCalculation.recommendation)} size={16} />
                      <span className="text-sm font-medium text-white">
                        Value Score: {valueCalculation.estimatedValue}/100
                      </span>
                    </div>
                    <div className={`text-xs font-medium ${ValueCalculator.getRecommendationColor(valueCalculation.recommendation)} mb-2`}>
                      {valueCalculation.recommendation.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {valueCalculation.valueReason}
                    </div>
                  </div>

                  {/* Detailed Value Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div>
                      <span className="text-gray-400">Points Required:</span>
                      <div className="text-white font-medium">{valueCalculation.pointsRequired.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Points Value:</span>
                      <div className="text-white font-medium">${valueCalculation.pointsValue.toFixed(0)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Cents/Point:</span>
                      <div className="text-white font-medium">{valueCalculation.centsPerPoint.toFixed(2)}¢</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Savings:</span>
                      <div className={`font-medium ${valueCalculation.savings && valueCalculation.savings > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                        ${valueCalculation.savings?.toFixed(0) || '0'}
                      </div>
                    </div>
                  </div>

                  {/* Segments Details */}
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-gray-300">Flight Details</h4>
                    {segments.map((segment, index) => (
                      <div key={index} className="text-xs text-gray-400">
                        {segment.departure.iataCode} → {segment.arrival.iataCode} 
                        <span className="ml-2">({segment.carrierCode} {segment.number})</span>
                      </div>
                    ))}
                  </div>

                  {/* Select Button */}
                  <button
                    onClick={() => onSelectFlight(flight)}
                    className="w-full bg-[#ff5757] hover:bg-[#ff5757]/90 text-white font-medium py-2 px-4 rounded-lg transition-all"
                  >
                    Select This Flight
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};