class TripTypeChoices:
    # Type of trip based on the package structure
    STANDARD = 'standard', 'Standard'  # Basic trip with transport & accommodation
    ALL_INCLUSIVE = 'all_inclusive', 'All-Inclusive'  # Includes meals, activities, and services
    GROUP = 'group', 'Group Travel'  # Designed for multiple travelers (family, friends, corporate)
    SOLO = 'solo', 'Solo Travel'  # Customized trips for individual travelers
    ROAD_TRIP = 'road_trip', 'Road Trip & Self-Drive'  # Travelers drive themselves on a planned route
    CRUISE = 'cruise', 'Cruise & Island Hopping'  # Multi-destination trips via sea
    CHOICES = [STANDARD, ALL_INCLUSIVE, GROUP, SOLO, ROAD_TRIP, CRUISE]

class ExperienceTypeChoices:
    # The type of experience the trip offers
    ADVENTURE = 'adventure', 'Adventure'  # Activities like hiking, diving, extreme sports
    CULTURAL = 'cultural', 'Cultural & Historical'  # Museums, historical sites, local traditions
    ECO = 'eco', 'Eco-Tourism & Nature'  # Sustainable travel, wildlife, green experiences
    WELLNESS = 'wellness', 'Wellness & Spa'  # Yoga retreats, spa resorts, mental relaxation
    ROMANTIC = 'romantic', 'Romantic & Honeymoon'  # Designed for couples, special experiences
    FESTIVAL = 'festival', 'Festival & Events'  # Trips centered around concerts, sports, local festivals
    PILGRIMAGE = 'pilgrimage', 'Religious & Pilgrimage'  # Sacred sites and spiritual journeys
    CHOICES = [ADVENTURE, CULTURAL, ECO, WELLNESS, ROMANTIC, FESTIVAL, PILGRIMAGE]

class PriceTypeChoices:
    # Defines the pricing level of the trip
    BUDGET = 'budget', 'Budget'  # Low-cost trips with basic accommodation
    ECONOMY = 'economy', 'Economy'  # Affordable trips with good value
    BUSINESS = 'business', 'Business'  # Premium experience with more services
    LUXURY = 'luxury', 'Luxury'  # High-end, exclusive, and premium experience
    CHOICES = [BUDGET, ECONOMY, BUSINESS, LUXURY]

class DestinationTypeChoices:
    # The type of location the trip is based on
    CITY = 'city', 'City'  # Urban destinations with shopping, entertainment, and culture
    BEACH = 'beach', 'Beach'  # Coastal destinations for relaxation and water activities
    MOUNTAIN = 'mountain', 'Mountain'  # Nature-focused, often for hiking or adventure
    ISLAND = 'island', 'Island'  # Remote or tropical destinations
    CRUISE = 'cruise', 'Cruise'  # Sea travel with multiple destinations
    CHOICES = [CITY, BEACH, MOUNTAIN, ISLAND, CRUISE]


class TransportTypeChoices:
    CAR = 'car','car'
    BUS = 'bus','bus'
    AIR_PLANE = 'air-place','air-plane'
    CRUISE = 'cruise', 'Cruise Ship'
    CHOICES = [CAR,BUS,AIR_PLANE,CRUISE]


