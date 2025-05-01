from collections import Counter
from .models import Trip, Customer
from django.db.models import Q

def get_content_based_recommendations(customer_id, num_recommendations=10):
    """
    Recommend trips similar to those the user has purchased or favorited.
    """
    customer = Customer.objects.get(id=customer_id)

    # Store purchased and favorite trips in lists to avoid multiple queries
    purchased_trips = list(customer.purchased_trips.all())  
    favorite_trips = list(customer.favorite_trips.all())

    if not purchased_trips and not favorite_trips:
        return []  # No recommendations if the user has no trip history

    # Extract unique features from the user's trips
    trip_types = set(trip.trip_type for trip in purchased_trips + favorite_trips)
    experiences = set(trip.experience for trip in purchased_trips + favorite_trips)
    destination_types = set(trip.destination_type for trip in purchased_trips + favorite_trips)
    price_categories = set(trip.price_category for trip in purchased_trips + favorite_trips)
    destinations = set(trip.destination for trip in purchased_trips + favorite_trips)

    # Find trips with similar attributes, excluding already purchased trips
    similar_trips = Trip.objects.filter(
        Q(trip_type__in=trip_types) |
        Q(experience__in=experiences) |
        Q(destination_type__in=destination_types) |
        Q(price_category__in=price_categories) |
        Q(destination__in=destinations)
    ).exclude(id__in=[trip.id for trip in purchased_trips])

    # Score trips based on attribute matches
    trip_scores = Counter()
    
    for trip in similar_trips:
        score = 0
        if trip.trip_type in trip_types:
            score += 2  # Trip type match is highly relevant
        if trip.experience in experiences:
            score += 3  # Experience match is relevant
        if trip.destination_type in destination_types:
            score += 1  # Destination type match is relevant
        if trip.price_category in price_categories:
            score += 3  # Price category match is less important
        if trip.destination in destinations:
            score += 4  # City match is the most relevant

        trip_scores[trip.id] = score  # Use trip.id as the key

    return trip_scores.most_common(num_recommendations)

def get_collaborative_recommendations(customer_id, num_recommendations=20):
    """
    Recommend trips based on similar customers' purchased trips and wishlist.
    """
    customer = Customer.objects.get(id=customer_id)

    # Store purchased and favorite trips in lists to avoid multiple queries
    purchased_trips = list(customer.purchased_trips.all())  
    favorite_trips = list(customer.favorite_trips.all())
    purchased_trip_ids = [trip.id for trip in purchased_trips]

    # Find customers who purchased or favorited the same trips
    similar_customers = Customer.objects.filter(
        Q(purchased_trips__in=purchased_trips) | Q(favorite_trips__in=favorite_trips)
    ).exclude(id=customer.id).distinct()

    trip_counter = Counter()

    for other_customer in similar_customers:
        # Store trips in lists to avoid redundant queries
        other_purchased = list(other_customer.purchased_trips.all())
        other_favorites = list(other_customer.favorite_trips.all())

        for trip in other_purchased:
            if trip.id not in purchased_trip_ids:
                trip_counter[trip.id] += 2  # Purchased trips get higher weight

        for trip in other_favorites:
            if trip.id not in purchased_trip_ids:
                trip_counter[trip.id] += 1  # Wishlist (favorite trips) get lower weight

    return trip_counter.most_common(num_recommendations)

def get_recommendations(customer_id, num_recommendations=10, alpha=0.5):
    content_based = dict(get_content_based_recommendations(customer_id, num_recommendations*2))
    collaborative = dict(get_collaborative_recommendations(customer_id, num_recommendations*2))

    # Combine scores
    combined_scores = Counter()
    
    # Add content-based scores with weight
    for trip_id, score in content_based.items():
        combined_scores[trip_id] += score * alpha
        
    # Add collaborative scores with weight
    for trip_id, score in collaborative.items():
        combined_scores[trip_id] += score * (1 - alpha)

    # Get top recommendations
    top_recommendations = combined_scores.most_common(num_recommendations)
    
    # Convert back to Trip objects
    trip_ids = [trip_id for trip_id, _ in top_recommendations]
    recommended_trips = Trip.objects.filter(id__in=trip_ids)
    
    # Maintain order
    trip_id_to_obj = {trip.id: trip for trip in recommended_trips}
    ordered_recommendations = [trip_id_to_obj[trip_id] for trip_id in trip_ids if trip_id in trip_id_to_obj]
    
    return ordered_recommendations
