import json
from fuzzywuzzy import fuzz
from rest_framework.decorators import api_view
from rest_framework.response import Response
import random


def get_best_match(message,previous):
        with open("chatbot/intents.json", "r", encoding="utf-8") as file:
            intents = json.load(file)
        
        if previous:
            current = intents.get(previous[0]).get('follow_ups')
            for item in previous[1:]:
                if current.get(item).get("follow_ups"):
                    current = current.get(item).get("follow_ups")
        else:
            current = None
            
            
        
        
        found = False
        
        while current and not found:
                
            for key,value in current.items():
                for pattern in  value.get('patterns'):
                    if fuzz.ratio(message.lower(),pattern.lower()) >= value.get('match_threshold'):
                        found = True
                        previous.append(key)
                        
                        return (
                            value.get('response'),previous
                        )
                
                    
                
            if not found:  #we mount to the parent
                if len(previous)>1:                            
                    previous.pop()
                else: 
                    previous = None
                    current = None

                if previous is None:
                    break
                
                current = intents.get(previous[0]).get('follow_ups')
                
                
                for item in previous[1:]:
                    if current.get('follow_ups'):
                        current = current.get('follow_ups').get(item)
                    else:
                        current = None
            
        if current is None:
            for key,value in intents.items():
                for pattern in  value.get('patterns'):
                    if fuzz.ratio(message.lower(),pattern.lower()) >= value.get('match_threshold'):
                        found = True
                        previous = [key]
                        #we return one of the pre defined answers 
                        follow_ups = value.get('follow_ups', {})
                        indicators = []
                        for f, v in follow_ups.items():
                            if isinstance(v, dict):
                                patterns = v.get('patterns', [])
                                indicators.extend(patterns[:3])         
                        return (random.choice(value.get('responses')),previous,indicators)
                    
        if not found:            
            return "I'm not quite sure I understand. Could you please rephrase or provide more details about what you're looking for?",[]


            
        
                




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
    message = request.data.get('message','')
    previous = request.data.get('previous',[])
    response ,context,indicators = get_best_match(message=message,previous=previous)
    
    
    return Response({
        "response": response,
        "context": context,
        "indicators" : indicators,
        })



