import sounddevice as sd
import numpy as np
import requests
import time
from openwakeword.model import Model

model = Model()

SAMPLE_RATE = 16000
CHUNK_SIZE = 1280

print("Aditi wake listener running...")

def callback(indata, frames, time_info, status):
    audio = np.squeeze(indata)
    prediction = model.predict(audio)

    for wakeword, score in prediction.items():
        if score > 0.5:
            print("Wake word detected:", wakeword)
            requests.post("http://127.0.0.1:4000/api/wake")
            time.sleep(1)

with sd.InputStream(
    channels=1,
    samplerate=SAMPLE_RATE,
    blocksize=CHUNK_SIZE,
    dtype="int16",
    callback=callback
):
    while True:
        time.sleep(0.1)