from difflib import SequenceMatcher
from fuzzywuzzy import fuzz  # pip install fuzzywuzzy python-Levenshtein

class TravelIntentSystem:
    def __init__(self):
        self.default_response = "I'm sorry, I didn't understand that. Could you rephrase or ask about our travel services?"
        
        # Enhanced travel intents
        self.intents = [
            {
                "title": "welcome",
                "patterns": ["hello", "hi", "hey", "greetings", "good morning"],
                "responses": [
                    "Hello! Welcome to TravelEase. How can I help you today?",
                    "Hi there! Ready to plan your next adventure?"
                ],
                "threshold": 0.7
            },
            {
                "title": "booking",
                "patterns": [
                    "book a trip", "I want to book", "make a reservation",
                    "plan a vacation", "I need to travel"
                ],
                "responses": [
                    "Great! I can help with bookings. Where would you like to go?",
                    "Wonderful! Let's plan your trip. What's your destination?"
                ],
                "threshold": 0.75
            },
            {
                "title": "flights",
                "patterns": [
                    "book flight", "find flights", "plane tickets",
                    "airfare", "flight options", "I need to fly"
                ],
                "responses": [
                    "I can help with flights. Please tell me your departure and arrival cities.",
                    "Let's find you the best flights. Where are you flying from and to?"
                ],
                "threshold": 0.75
            },
            {
                "title": "hotels",
                "patterns": [
                    "book hotel", "find accommodations", "place to stay",
                    "hotel options", "I need a room"
                ],
                "responses": [
                    "I can assist with hotel bookings. Which city and dates?",
                    "Let's find you the perfect hotel. Where and when will you be staying?"
                ],
                "threshold": 0.75
            },
            {
                "title": "booking-YES",
                "patterns": ["yes", "correct", "that's right", "yep", "confirm"],
                "responses": ["Great! I'll proceed with your booking.", "Confirmed!"],
                "threshold": 0.85,
                "is_followup": True
            },
            {
                "title": "booking-NO",
                "patterns": ["no", "incorrect", "that's wrong", "nope", "cancel"],
                "responses": ["I see, let's correct that.", "Understood, what would you like to change?"],
                "threshold": 0.85,
                "is_followup": True
            }
        ]
    
    def _similarity(self, a, b):
        # Using fuzzywuzzy for better string matching
        return fuzz.ratio(a.lower(), b.lower()) / 100
    
    def get_best_match(self, message, context=None):
        best_match = None
        highest_score = 0
        
        for intent in self.intents:
            # Skip if this is a follow-up that doesn't match context
            if intent.get("is_followup", False):
                if not context or not any(intent["title"].startswith(ctx + "-") for ctx in context):
                    continue
            
            for pattern in intent["patterns"]:
                # Check both direct matching and similarity
                if pattern.lower() in message.lower():
                    score = 1.0  # Exact match
                else:
                    score = self._similarity(message, pattern)
                
                if score > highest_score and score >= intent["threshold"]:
                    highest_score = score
                    best_match = intent
        
        return best_match