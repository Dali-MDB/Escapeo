def calculate_trip_price(trip, departure_trip, tickets, customer):
    """Shared calculation logic used by both endpoints"""
    # Availability check
    errors = []
    if trip.capacity < trip.sold_tickets + tickets:
        errors.append("Not enough tickets available for this trip.")
    if departure_trip.capacity < departure_trip.sold_tickets + tickets:
        errors.append("Not enough tickets available for this departure trip.")
    if errors:
        return {'errors': errors}

    # Price calculation
    loyalty_discount = min(customer.loyalty_points // 100 * 5, 25)
    trip_discount = trip.discount if trip.discount else 0
    final_discount = trip_discount + loyalty_discount
    total_price = tickets * departure_trip.price * (100 - final_discount) / 100
    total_price = max(total_price - customer.balance,0)

    return {
        'total_price': round(float(total_price), 2),
        'loyalty_discount': f"{loyalty_discount}%",
        'trip_discount': f"{trip_discount}%",
        'final_discount': f"{final_discount}%",
        'taken_from_wallet' : max(customer.balance,0),
        'tickets': tickets,
        'trip': trip,
        'departure_trip': departure_trip,
        
    }




# utils.py or at top of views.py
def calculate_hotel_stay(hotel, check_in, check_out, customer):
    """Shared calculation logic for hotel stays"""
    # 1. Validate dates
    if check_in >= check_out:
        return {'error': 'Check-out must be after check-in date'}
    
    total_nights = (check_out - check_in).days
    
    total_price = total_nights*hotel.price_per_night
    
    return {
        'total_price': round(float(total_price), 2),
        'total_nights': total_nights,

        'hotel': hotel
    }