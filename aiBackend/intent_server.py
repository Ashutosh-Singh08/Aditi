from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

classifier = pipeline(
    "text-classification",
    model="./models/aditi-final",
    tokenizer="./models/aditi-final"
)

class IntentRequest(BaseModel):
    text: str

@app.get("/")
def home():
    return {
        "status": "Aditi intent server running"
    }

@app.post("/intent")
def detect_intent(req: IntentRequest):

    result = classifier(req.text)[0]

    print("TEXT:", req.text)
    print("INTENT:", result["label"])
    print("CONFIDENCE:", result["score"])

    return {
        "intent": result["label"],
        "confidence": float(result["score"])
    }