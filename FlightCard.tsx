import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Plane, 
  Clock, 
  MapPin, 
  Heart, 
  Star, 
  TrendingUp, 
  Info,
  ArrowRight,
  Zap,
  Award
} from 'lucide-react';
import { FlightOffer } from '../types/flight';
import { ValueCalculator } from '../services/valueCalculator';

interface FlightCardProps {
  flight: FlightOffer;
  onSelect: (flight: FlightOffer) => void;
  onLike: (flight: FlightOffer) => void;
  isLiked: boolean;
}

export const FlightCard: React.FC<FlightCardProps> = ({ 
  flight, 
  onSelect, 
  onLike, 
  isLiked 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const valueCalculation = ValueCalculator.calculateValue(flight);
  const segments = flight.itineraries[0].segments;
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

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

  const getStopsText = () => {
    const stops = segments.length - 1;
    if (stops === 0) return 'Nonstop';
    return `${stops} stop${stops > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden hover:border-[#ff5757]/50 transition-all duration-300 card-hover">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff5757] rounded-full flex items-center justify-center">
              <Plane className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {ValueCalculator.getAirlineName(flight.validatingAirlineCodes[0])}
              </h3>
              <p className="text-sm text-gray-400">
                {flight.validatingAirlineCodes.join(', ')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {flight.isSynthetic && (
              <div className="flex items-center gap-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                <Zap size={12} />
                Synthetic
              </div>
            )}
            {valueCalculation.recommendation === 'excellent' && (
              <div className="flex items-center gap-1 bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                <Award size={12} />
                Best Value
              </div>
            )}
            <button
              onClick={() => onLike(flight)}
              className={`p-2 rounded-full transition-colors ${
                isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Flight Details */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {formatTime(firstSegment.departure.at)}
              </div>
              <div className="text-sm text-gray-400">
                {firstSegment.departure.iataCode}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(firstSegment.departure.at)}
              </div>
            </div>
            
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 border-t border-gray-600 relative">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 px-2 py-1 rounded text-xs text-gray-400">
                  {parseDuration(flight.itineraries[0].duration)}
                </div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#ff5757] rounded-full"></div>
              </div>
              <ArrowRight className="text-gray-400" size={16} />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {formatTime(lastSegment.arrival.at)}
              </div>
              <div className="text-sm text-gray-400">
                {lastSegment.arrival.iataCode}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(lastSegment.arrival.at)}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              ${flight.price.total}
            </div>
            <div className="text-sm text-gray-400">
              {getStopsText()}
            </div>
          </div>
        </div>

        {/* Enhanced Value Calculation */}
        <div className={`p-4 rounded-lg ${ValueCalculator.getRecommendationBg(valueCalculation.recommendation)} border`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className={ValueCalculator.getRecommendationColor(valueCalculation.recommendation)} size={16} />
              <span className="text-sm font-medium text-gray-300">
                Value Score: {valueCalculation.estimatedValue}/100
              </span>
            </div>
            <div className={`text-sm font-semibold ${ValueCalculator.getRecommendationColor(valueCalculation.recommendation)}`}>
              {valueCalculation.recommendation.toUpperCase()}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 mb-2">
            <div>
              <span>Points Required:</span>
              <div className="text-white font-medium">{valueCalculation.pointsRequired.toLocaleString()}</div>
            </div>
            <div>
              <span>Points Value:</span>
              <div className="text-white font-medium">${valueCalculation.pointsValue.toFixed(0)}</div>
            </div>
            <div>
              <span>Cents per Point:</span>
              <div className="text-white font-medium">{valueCalculation.centsPerPoint.toFixed(2)}¢</div>
            </div>
            <div>
              <span>Potential Savings:</span>
              <div className={`font-medium ${valueCalculation.savings && valueCalculation.savings > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                ${valueCalculation.savings?.toFixed(0) || '0'}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            {valueCalculation.valueReason}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onSelect(flight)}
            className="flex-1 bg-[#ff5757] hover:bg-[#ff5757]/90 text-white font-medium py-3 px-6 rounded-lg transition-all btn-hover"
          >
            Select Flight
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            <Info size={16} />
          </button>
        </div>

        {/* Detailed Information */}
        {showDetails && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg fade-in">
            <h4 className="text-sm font-medium text-white mb-3">Flight Details</h4>
            <div className="space-y-3">
              {segments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Plane className="text-[#ff5757]" size={14} />
                    <span className="text-gray-300">
                      {segment.departure.iataCode} → {segment.arrival.iataCode}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    {segment.carrierCode} {segment.number}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Cabin Class:</span>
                <span className="text-white ml-2">
                  {flight.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'Economy'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Fare Type:</span>
                <span className="text-white ml-2">
                  {flight.pricingOptions.fareType[0] || 'Published'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Points Earned:</span>
                <span className="text-white ml-2">
                  ~{ValueCalculator.calculatePointsEarned(flight).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Booking Class:</span>
                <span className="text-white ml-2">
                  {flight.travelerPricings[0]?.fareDetailsBySegment[0]?.class || 'Y'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};