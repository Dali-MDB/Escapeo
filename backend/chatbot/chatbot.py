import json
import nltk
from nltk.tokenize import word_tokenize
from fuzzywuzzy import fuzz

# Load intents
with open("intents.json", "r", encoding="utf-8") as file:
    intents = json.load(file)

# Preprocess and tokenize stored questions
nltk.download('punkt')

def find_best_match(user_input):
    best_match = None
    highest_score = 0

    for intent, data in intents.items():
        
        for pattern in data.get("patterns", []):
            score = fuzz.ratio(user_input.lower(), pattern.lower())  # Compare similarity
            
            if score > highest_score:
                highest_score = score
                best_match = data["response"]

    return best_match if highest_score > 50 else intents["default"]["response"]  # 50% similarity threshold

def ask_melio(user_input):
    return find_best_match(user_input)

if __name__ == "__main__":
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Melio: Goodbye!")
            break
        response = ask_melio(user_input)
        print(f"Melio: {response}")
