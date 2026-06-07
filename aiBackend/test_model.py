from transformers import pipeline

classifier = pipeline(
    "text-classification",
    model="./models/final_model",
    tokenizer="./models/final_model"
)

tests = [
    "open chrome",
    "close vscode",
    "play despacito on youtube",
    "search google for python tutorial",
    "increase volume",
    "take screenshot",
    "open file explorer",
    "close telegram"
]

for text in tests:

    result = classifier(text)

    print("\nTEXT:", text)
    print("PREDICTION:", result)