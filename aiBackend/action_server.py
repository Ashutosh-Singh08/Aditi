from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

app = FastAPI()
def rule_override(text, action):
    text = text.lower().strip()
    
    text = text.lower()
    print("TEXT RECEIVED:", repr(text))
    if "move on" in text or "baby doll" in text or "baby dog" in text or "catch her" in text:
        return "effect_rescue"
    
    if "call the cats" in text or "cat" in text or "meow meow" in text:
        return "effect_cat"

    if "flower" in text or "flowers" in text or "bloom" in text:
        return "effect_flowers"

    if "youtube" in text and "play" in text:
        return "play_youtube"

    if "youtube" in text and "search" in text:
        return "search_youtube"

    if "google" in text or "search" in text:
        return "search_google"

    if any(w in text for w in ["open", "launch", "start", "run"]):
        return "open_app"

    if any(w in text for w in ["close", "exit", "quit", "kill", "terminate"]):
        return "close_app"

    return action
MODEL_PATH = "./models/final_model"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

id2label = model.config.id2label

class ActionRequest(BaseModel):
    text: str

@app.post("/action")
def predict_action(data: ActionRequest):
    inputs = tokenizer(
        data.text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=64
    )

    with torch.no_grad():
        outputs = model(**inputs)

    predicted_id = torch.argmax(outputs.logits, dim=1).item()
    action = id2label[predicted_id]
    action = rule_override(data.text, action)

    return {
        "action": action
    }
print(model.config.id2label)
print(model.config.label2id)