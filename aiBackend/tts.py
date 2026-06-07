import sys
import asyncio
import edge_tts
import os

if len(sys.argv) < 3:
    print("Usage: python tts.py <text> <output_path>")
    sys.exit(1)

text = sys.argv[1]
output_path = sys.argv[2]

VOICE = "en-US-AriaNeural"

audio_dir = os.path.dirname(output_path)
os.makedirs(audio_dir, exist_ok=True)

async def main():
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(output_path)
    print("Saved TTS to:", output_path)

asyncio.run(main())