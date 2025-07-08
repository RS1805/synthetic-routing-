import { FlightOffer } from '../types/flight';

export interface ValueCalculation {
  cashPrice: number;
  pointsRequired: number;
  pointsValue: number;
  centsPerPoint: number;
  estimatedValue: number;
  recommendation: 'excellent' | 'good' | 'fair' | 'poor';
  savings?: number;
  valueReason: string;
}

export class ValueCalculator {
  // Updated point valuations (cents per point) based on current market rates
  private static pointValueMap: Record<string, number> = {
    // US Airlines
    'AA': 1.8,  // American Airlines AAdvantage
    'UA': 1.3,  // United MileagePlus
    'DL': 1.2,  // Delta SkyMiles
    'AS': 1.0,  // Alaska Airlines Mileage Plan
    'B6': 1.4,  // JetBlue TrueBlue
    'WN': 1.5,  // Southwest Rapid Rewards
    'F9': 0.7,  // Frontier Miles
    'NK': 0.5,  // Spirit Free Spirit
    
    // International Airlines
    'BA': 1.5,  // British Airways Avios
    'LH': 1.2,  // Lufthansa Miles & More
    'AF': 1.1,  // Air France Flying Blue
    'KL': 1.1,  // KLM Flying Blue
    'EK': 1.0,  // Emirates Skywards
    'QR': 1.2,  // Qatar Airways Privilege Club
    'SQ': 1.3,  // Singapore Airlines KrisFlyer
    'CX': 1.4,  // Cathay Pacific Asia Miles
    'JL': 1.2,  // Japan Airlines Mileage Bank
    'NH': 1.3,  // ANA Mileage Club
    'TK': 1.1,  // Turkish Airlines Miles&Smiles
    'LX': 1.2,  // Swiss International Air Lines
    'OS': 1.1,  // Austrian Airlines
    'SN': 1.0,  // Brussels Airlines
    'AY': 1.1,  // Finnair Plus
    'SK': 1.0,  // SAS EuroBonus
    'IB': 1.1,  // Iberia Plus
    'TP': 1.0,  // TAP Air Portugal Miles&Go
    'AZ': 0.9,  // ITA Airways Volare
    'AC': 1.2,  // Air Canada Aeroplan
    'WF': 1.0,  // Widerøe
    'DEFAULT': 1.0,
  };

  // Cabin class multipliers for points required
  private static cabinMultipliers: Record<string, number> = {
    'ECONOMY': 1.0,
    'PREMIUM_ECONOMY': 1.4,
    'BUSINESS': 2.2,
    'FIRST': 3.5,
  };

  // Route distance multipliers
  private static routeMultipliers: Record<string, number> = {
    'DOMESTIC_SHORT': 0.9,      // < 500 miles
    'DOMESTIC_MEDIUM': 1.0,     // 500-1500 miles
    'DOMESTIC_LONG': 1.1,       // > 1500 miles
    'INTERNATIONAL_SHORT': 1.2, // < 2000 miles
    'INTERNATIONAL_MEDIUM': 1.3, // 2000-6000 miles
    'INTERNATIONAL_LONG': 1.5,  // > 6000 miles
    'TRANSCONTINENTAL': 1.6,    // > 8000 miles
  };

  // Peak season multipliers
  private static seasonMultipliers = {
    'PEAK': 1.3,      // Summer, holidays
    'SHOULDER': 1.1,  // Spring, fall
    'OFF_PEAK': 0.9,  // Winter (non-holiday)
  };

  static calculateValue(flight: FlightOffer): ValueCalculation {
    const cashPrice = parseFloat(flight.price.total);
    const primaryCarrier = flight.validatingAirlineCodes[0];
    const cabin = flight.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'ECONOMY';
    
    // Get base point value for the airline
    const basePointValue = this.pointValueMap[primaryCarrier] || this.pointValueMap['DEFAULT'];
    
    // Apply cabin class multiplier
    const cabinMultiplier = this.cabinMultipliers[cabin] || 1.0;
    
    // Determine route category and get multiplier
    const routeCategory = this.determineRouteCategory(flight);
    const routeMultiplier = this.routeMultipliers[routeCategory] || 1.0;
    
    // Calculate seasonal multiplier
    const seasonMultiplier = this.getSeasonMultiplier(flight);
    
    // Calculate synthetic route bonus
    const syntheticBonus = flight.isSynthetic ? 1.15 : 1.0;
    
    // Calculate base points required using airline-specific formulas
    const basePointsRequired = this.calculateBasePoints(cashPrice, primaryCarrier, cabin);
    
    // Apply all multipliers
    const pointsRequired = Math.round(
      basePointsRequired * cabinMultiplier * routeMultiplier * seasonMultiplier
    );
    
    // Calculate actual cents per point value
    const centsPerPoint = (cashPrice * 100) / pointsRequired;
    
    // Calculate points value in dollars
    const pointsValue = pointsRequired * basePointValue / 100;
    
    // Calculate estimated value score (0-100)
    const baseScore = Math.min(100, (centsPerPoint / basePointValue) * 100);
    const estimatedValue = Math.round(baseScore * syntheticBonus);
    
    // Calculate potential savings
    const savings = Math.max(0, cashPrice - pointsValue);
    
    // Determine recommendation with more nuanced logic
    const { recommendation, valueReason } = this.getRecommendation(
      centsPerPoint, 
      basePointValue, 
      cabin, 
      flight.isSynthetic || false,
      savings
    );
    
    return {
      cashPrice,
      pointsRequired,
      pointsValue,
      centsPerPoint,
      estimatedValue,
      recommendation,
      savings,
      valueReason,
    };
  }

  private static calculateBasePoints(cashPrice: number, airline: string, cabin: string): number {
    // Airline-specific point calculation formulas
    switch (airline) {
      case 'AA': // American Airlines - distance-based with revenue component
        return Math.round(cashPrice * 85);
      case 'UA': // United - primarily revenue-based
        return Math.round(cashPrice * 100);
      case 'DL': // Delta - revenue-based with dynamic pricing
        return Math.round(cashPrice * 110);
      case 'AS': // Alaska - distance-based
        return Math.round(cashPrice * 90);
      case 'B6': // JetBlue - revenue-based
        return Math.round(cashPrice * 80);
      case 'WN': // Southwest - revenue-based
        return Math.round(cashPrice * 70);
      case 'BA': // British Airways - distance-based with fuel surcharges
        return Math.round(cashPrice * 75);
      case 'LH': // Lufthansa - distance-based
        return Math.round(cashPrice * 85);
      case 'AF':
      case 'KL': // Air France/KLM - distance-based
        return Math.round(cashPrice * 90);
      case 'EK': // Emirates - distance-based
        return Math.round(cashPrice * 95);
      case 'QR': // Qatar Airways - distance-based
        return Math.round(cashPrice * 85);
      case 'SQ': // Singapore Airlines - distance-based
        return Math.round(cashPrice * 80);
      default:
        return Math.round(cashPrice * 90); // Default calculation
    }
  }

  private static determineRouteCategory(flight: FlightOffer): string {
    const segments = flight.itineraries[0].segments;
    const duration = flight.itineraries[0].duration;
    
    // Parse duration to get total minutes
    const durationMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    const hours = durationMatch?.[1] ? parseInt(durationMatch[1]) : 0;
    const minutes = durationMatch?.[2] ? parseInt(durationMatch[2]) : 0;
    const totalMinutes = hours * 60 + minutes;
    
    // Estimate distance based on flight time and number of segments
    const estimatedDistance = totalMinutes * 8; // Rough miles estimate
    const isInternational = this.isInternationalRoute(segments);
    
    if (!isInternational) {
      if (estimatedDistance < 4000) return 'DOMESTIC_SHORT';
      if (estimatedDistance < 12000) return 'DOMESTIC_MEDIUM';
      return 'DOMESTIC_LONG';
    } else {
      if (estimatedDistance < 16000) return 'INTERNATIONAL_SHORT';
      if (estimatedDistance < 48000) return 'INTERNATIONAL_MEDIUM';
      if (estimatedDistance < 64000) return 'INTERNATIONAL_LONG';
      return 'TRANSCONTINENTAL';
    }
  }

  private static isInternationalRoute(segments: any[]): boolean {
    // Simple check - if departure and arrival countries differ, it's international
    // This is a simplified implementation
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    
    // Common international route patterns
    const internationalPatterns = [
      /^[A-Z]{3}$/, // Most international airports follow this pattern
    ];
    
    // Check if route crosses major regions (simplified)
    const departure = firstSegment.departure.iataCode;
    const arrival = lastSegment.arrival.iataCode;
    
    // US domestic routes
    const usDomesticAirports = ['JFK', 'LAX', 'ORD', 'DFW', 'DEN', 'SFO', 'SEA', 'LAS', 'PHX', 'IAH', 'MIA', 'CLT', 'EWR', 'MSP', 'DTW', 'BOS', 'PHL', 'LGA', 'DCA', 'IAD'];
    const isUSDomestic = usDomesticAirports.includes(departure) && usDomesticAirports.includes(arrival);
    
    return !isUSDomestic; // Simplified - assume non-US domestic routes are international
  }

  private static getSeasonMultiplier(flight: FlightOffer): number {
    const departureDate = new Date(flight.itineraries[0].segments[0].departure.at);
    const month = departureDate.getMonth() + 1; // 1-12
    
    // Peak season: June-August, December
    if ([6, 7, 8, 12].includes(month)) {
      return this.seasonMultipliers.PEAK;
    }
    
    // Shoulder season: March-May, September-November
    if ([3, 4, 5, 9, 10, 11].includes(month)) {
      return this.seasonMultipliers.SHOULDER;
    }
    
    // Off-peak: January, February
    return this.seasonMultipliers.OFF_PEAK;
  }

  private static getRecommendation(
    centsPerPoint: number, 
    basePointValue: number, 
    cabin: string, 
    isSynthetic: boolean,
    savings: number
  ): { recommendation: 'excellent' | 'good' | 'fair' | 'poor', valueReason: string } {
    
    const valueRatio = centsPerPoint / basePointValue;
    
    if (valueRatio >= 1.5) {
      return {
        recommendation: 'excellent',
        valueReason: `Outstanding value! You're getting ${(valueRatio * 100 - 100).toFixed(0)}% more value than typical redemptions.`
      };
    } else if (valueRatio >= 1.2) {
      return {
        recommendation: 'good',
        valueReason: `Good value redemption, ${(valueRatio * 100 - 100).toFixed(0)}% above average point value.`
      };
    } else if (valueRatio >= 0.8) {
      return {
        recommendation: 'fair',
        valueReason: `Fair value. Consider if you have points to spare or need flexibility.`
      };
    } else {
      return {
        recommendation: 'poor',
        valueReason: `Below average value. Consider paying cash or looking for better redemption options.`
      };
    }
  }

  static getRecommendationColor(recommendation: string): string {
    switch (recommendation) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  static getRecommendationBg(recommendation: string): string {
    switch (recommendation) {
      case 'excellent': return 'bg-green-900/20 border-green-500/30';
      case 'good': return 'bg-blue-900/20 border-blue-500/30';
      case 'fair': return 'bg-yellow-900/20 border-yellow-500/30';
      case 'poor': return 'bg-red-900/20 border-red-500/30';
      default: return 'bg-gray-900/20 border-gray-500/30';
    }
  }

  // Helper method to get airline name from code
  static getAirlineName(code: string): string {
    const airlines: Record<string, string> = {
      'AA': 'American Airlines',
      'UA': 'United Airlines',
      'DL': 'Delta Air Lines',
      'AS': 'Alaska Airlines',
      'B6': 'JetBlue Airways',
      'WN': 'Southwest Airlines',
      'F9': 'Frontier Airlines',
      'NK': 'Spirit Airlines',
      'BA': 'British Airways',
      'LH': 'Lufthansa',
      'AF': 'Air France',
      'KL': 'KLM Royal Dutch Airlines',
      'EK': 'Emirates',
      'QR': 'Qatar Airways',
      'SQ': 'Singapore Airlines',
      'CX': 'Cathay Pacific',
      'JL': 'Japan Airlines',
      'NH': 'All Nippon Airways',
      'TK': 'Turkish Airlines',
      'LX': 'Swiss International Air Lines',
      'OS': 'Austrian Airlines',
      'SN': 'Brussels Airlines',
      'AY': 'Finnair',
      'SK': 'SAS Scandinavian Airlines',
      'IB': 'Iberia',
      'TP': 'TAP Air Portugal',
      'AZ': 'ITA Airways',
      'AC': 'Air Canada',
    };
    return airlines[code] || code;
  }

  // Method to calculate potential point earning from the flight
  static calculatePointsEarned(flight: FlightOffer, membershipLevel: string = 'base'): number {
    const cashPrice = parseFloat(flight.price.total);
    const airline = flight.validatingAirlineCodes[0];
    const cabin = flight.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'ECONOMY';
    
    // Base earning rates (points per dollar spent)
    const baseRates: Record<string, number> = {
      'AA': 5, 'UA': 5, 'DL': 5, 'AS': 1, 'B6': 3, 'WN': 6,
      'BA': 1, 'LH': 1, 'AF': 1, 'KL': 1, 'EK': 1, 'QR': 1, 'SQ': 1
    };
    
    // Cabin multipliers for earning
    const cabinEarnMultipliers: Record<string, number> = {
      'ECONOMY': 1.0,
      'PREMIUM_ECONOMY': 1.25,
      'BUSINESS': 1.5,
      'FIRST': 2.0,
    };
    
    const baseRate = baseRates[airline] || 1;
    const cabinMultiplier = cabinEarnMultipliers[cabin] || 1.0;
    
    return Math.round(cashPrice * baseRate * cabinMultiplier);
  }
}