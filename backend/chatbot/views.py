import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
import os
from difflib import SequenceMatcher
import random

def get_fuzzy_similarity(text1, text2):
    """Calculate similarity between two texts using fuzzy matching."""
    return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()

def get_best_match(message, previous):
    # Get the absolute path to the intents.json file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    intents_path = os.path.join(current_dir, 'intents.json')
    
    try:
        with open(intents_path, "r", encoding="utf-8") as file:
            intents = json.load(file)
    except FileNotFoundError:
        return "Error: intents.json file not found", [], []
    except json.JSONDecodeError:
        return "Error: Invalid JSON in intents.json", [], []
    
    if not intents:
        return "Error: Empty intents file", [], []
    
    # Start with the full previous context and try to find a match
    while previous:
        current_intent = intents.get(previous[0])
        if not current_intent:
            previous.pop(0)
            continue
            
        current = current_intent.get('follow_ups', {})
        found_in_path = True
        current_path = previous.copy()  # Keep track of the current path
        
        # Traverse down the follow-up path
        for item in previous[1:]:
            if not current or not isinstance(current, dict):
                found_in_path = False
                break
                
            next_level = current.get(item)
            if not next_level or not isinstance(next_level, dict):
                found_in_path = False
                break
                
            current = next_level.get('follow_ups', {})
        
        if found_in_path and isinstance(current, dict):
            # Check for matches in the current level
            best_similarity = 0
            best_key = None
            best_response = None

            match_threshold = 75
            for key, value in current.items():
                match_threshold = value.get('match_threshold', 75)
                if not isinstance(value, dict):
                    continue
                    
                patterns = value.get('patterns', [])
                if not isinstance(patterns, list):
                    continue
                    
                for pattern in patterns:
                    if not isinstance(pattern, str):
                        continue
                        
                    similarity = get_fuzzy_similarity(message, pattern)
                    if similarity > best_similarity:
                        best_similarity = similarity
                        best_key = key
                        best_response = value.get('responses', [])
            
            if best_similarity*100 >= match_threshold:  # Threshold for fuzzy matching
                # Add the matched key to the current path
                current_path.append(best_key)
                
                # Select a random response if there are multiple
                if isinstance(best_response, list) and best_response:
                    best_response = random.choice(best_response)
                
                # Get indicators from follow-ups
                indicators = []
                follow_ups = current.get(best_key, {}).get('follow_ups', {})
                for f, v in follow_ups.items():
                    if isinstance(v, dict):
                        patterns = v.get('patterns', [])
                        indicators.extend(patterns[:3])
                
                return (best_response, current_path, indicators)
        
        # If no match found at this level, try the parent level
        previous.pop()
    
    # After popping all previous contexts, try to match against base intents
    best_similarity = 0
    best_key = None
    best_response = None
    match_threshold = 75
    for key, value in intents.items():
        match_threshold = value.get('match_threshold', 75)
        if not isinstance(value, dict):
            continue
            
        patterns = value.get('patterns', [])
        if not isinstance(patterns, list):
            continue
            
        for pattern in patterns:
            if not isinstance(pattern, str):
                continue
                
            similarity = get_fuzzy_similarity(message, pattern)
            if similarity > best_similarity:
                best_similarity = similarity
                best_key = key
                best_response = value.get('responses', [])
    
    if best_similarity*100 >= match_threshold:  # If we found a good match at base level
        # Create a new context list with just the base intent
        new_context = [best_key]
        
        # Select a random response if there are multiple
        if isinstance(best_response, list) and best_response:
            best_response = random.choice(best_response)
        
        # Get indicators from follow-ups
        indicators = []
        follow_ups = intents.get(best_key, {}).get('follow_ups', {})
        for f, v in follow_ups.items():
            if isinstance(v, dict):
                patterns = v.get('patterns', [])
                indicators.extend(patterns[:3])
        
        return (best_response, new_context, indicators)
    
    # If we've exhausted all options, return default response
    return "I'm not quite sure I understand. Could you please rephrase or provide more details about what you're looking for?", [], []

@api_view(['POST'])
def talkToMelio(request):
    """
    MELIO-GPT ENDPOINT
    expects {
        'message' : str
        'previous' : [str]
    }
    returns {
        'response' : str
        'context' : [str]     (take it and replace previous with it in the next message)
        'indicators' : [str]   (simply suggestions for the user to keep him in the context of our pre defined questions)
    }
    """
    try:
        message = request.data.get('message', '')
        previous = request.data.get('previous', [])
        
        if not message:
            return Response({
                "error": "Message is required",
                "status": "error"
            }, status=400)
        
        # Get the best matching response
        response, context, indicators = get_best_match(message=message, previous=previous)
        return Response({
            "response": response,
            "context": context,
            "indicators": indicators
        })
    except Exception as e:
        return Response({
            "error": str(e),
            "status": "error"
        }, status=500)
