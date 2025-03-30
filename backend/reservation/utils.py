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

    return {
        'total_price': round(float(total_price), 2),
        'loyalty_discount': f"{loyalty_discount}%",
        'trip_discount': f"{trip_discount}%",
        'final_discount': f"{final_discount}%",
        'tickets': tickets,
        'trip': trip,
        'departure_trip': departure_trip
    }




# utils.py or at top of views.py
def calculate_hotel_stay(hotel, check_in, check_out, room_details, customer):
    """Shared calculation logic for hotel stays"""
    # 1. Validate dates
    if check_in >= check_out:
        return {'error': 'Check-out must be after check-in date'}
    
    total_nights = (check_out - check_in).days
    
    # 2. Validate room availability
    errors = []
    hotel_rooms = hotel.rooms
    for room_type, details in room_details.items():
        if room_type not in hotel_rooms:
            errors.append(f"Room type '{room_type}' not available")
            continue
            
        available = hotel_rooms[room_type].get('available', 0)
        if details['quantity'] > available:
            errors.append(f"Only {available} '{room_type}' rooms available")
    
    if errors:
        return {'errors': errors}
    
    # 3. Calculate price
    total_price = 0
    for room_type, details in room_details.items():
        total_price += details['quantity'] * hotel_rooms[room_type]['price_per_night'] * total_nights
    
    return {
        'total_price': round(float(total_price), 2),
        'total_nights': total_nights,
        'room_details': room_details,
        'hotel': hotel
    }