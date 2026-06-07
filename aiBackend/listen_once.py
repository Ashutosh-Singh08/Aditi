import queue
import sounddevice as sd
import vosk
import sys
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(
    BASE_DIR,
    "vosk-model-en-us-0.22-lgraph"
)

if not os.path.exists(MODEL_PATH):
    print("MODEL_NOT_FOUND")
    sys.exit(1)

q = queue.Queue()

def callback(indata, frames, time, status):
    if status:
        print(status, file=sys.stderr)
    q.put(bytes(indata))

model = vosk.Model(MODEL_PATH)
recognizer = vosk.KaldiRecognizer(model, 16000)
recognizer.SetWords(True)

with sd.RawInputStream(
    samplerate=16000,
    blocksize=4000,
    dtype="int16",
    channels=1,
    callback=callback
):
    print("LISTENING", flush=True)

    while True:
        data = q.get()

        if recognizer.AcceptWaveform(data):
            result = json.loads(recognizer.Result())
            text = result.get("text", "")

            if text.strip():
                print(text)
                break